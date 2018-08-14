/*
 * database.js
 */

const fs = require('fs')
const pg = require('pg')
const k = require('./constants')
const { rejectMessage } = require('./helpers/promise')

/*
 * Setup SQL connection
 */

const client = new pg.Client({
  host: 'grant_db',
  port: 5432,
})

client.connect((err) => {
  if (err)
    throw err

  selectOne(`SELECT * FROM information_schema.tables WHERE table_name = 'samples'`)
  .then(row => console.log('Database already setup', row))
  .catch(err => {
    if (err.type === k.ROW_NOT_FOUND) {
      query(fs.readFileSync('./tables.sql').toString())
    } else {
      console.error(err)
      process.exit(1)
    }
  })
})

const NOW = `to_char (now()::timestamp at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')::timestamp`

module.exports = {
  client,
  query,
  selectOne,
  selectAll,
  insert,
  NOW,
}

/**
 * Turns 'SELECT * FROM users WHERE id = @id', { id: 42 }
 * into  'SELECT * FROM users WHERE id = $1',  [ 42 ]
 * for usage with postgres module.
 */
function interpolate(query, params) {
  if (!params)
    return { query: query, params: [] }

  let index = 1
  const variables = {}

  const newQuery = query.replace(/@(\w+)/g, (m, name) => {
    if (!(name in params))
      throw new Error(`Missing parameter "${name}" \nin "${query}" \nwith: ${JSON.stringify(params)}`)

    if (!(name in variables))
      variables[name] = { index: index++, value: params[name] }

    return '$' + variables[name].index
  })

  const newParams = Object.values(variables)
    .sort((a, b) => a.index - b.index)
    .map(v => v.value)

  return { query: newQuery, params: newParams }
}

/**
 * Perform a query using the client/request's app's client
 * @returns Promise
 */
function query(q, params) {
  return new Promise((resolve, reject) => {
    const interpolated = interpolate(q, params)

    client.query(interpolated.query, interpolated.params, (err, results) => {
      if (err)
        reject(err)
      else
        resolve(results)
    })
  })
}

function selectOne(q, params, field) {
  return query(q, params).then(result =>
    result.rows.length === 0 ?
      rejectMessage(
        `Couldnt find record in query ${q} with params ${JSON.stringify(params)}`,
        k.ROW_NOT_FOUND
      ) :
    field ?
      result.rows[0][field] :
      result.rows[0])
}

function selectAll(q, params, field) {
  return query(q, params).then(result => field ? result.rows.map(r => r[field]) : result.rows)
}

function insert(q, params, field = 'id') {
  return query(q + ` RETURNING ${field}`, params).then(result =>
    result.rows.length > 0 ? result.rows[0][field] : undefined)
}
