/*
 * grant.js
 */


const db = require('../database.js')

module.exports = {
  findAll,
  findById,
  update,
  create,
}


function findAll() {
  return db.selectAll(`
    SELECT *
      FROM grants
  `)
}

function findById(id) {
  return db.selectOne('SELECT * FROM grants WHERE id = @id', { id })
}

function update(grant) {
  return db.query(`
    UPDATE grants
      SET name = @name
        , applicants = @applicants
        , "categoryID" = @categoryID
        , start = @start
        , "end" = @end
        , status = @status
        , total = @total
        , cofunding = @cofunding
        , fields = @fields
    WHERE id = @id`,
    serialize(grant)
  )
  .then(() => findById(grant.id))
  .then(async grant => {
    if (grant.status === 'NOT_ACCEPTED') {
      await db.query(`
        DELETE FROM fundings
              WHERE "fromGrantID" = @id
                 OR "toGrantID" = @id
      `, { id: grant.id })
    }
    return grant
  })
}

function create(grant) {
  return db.insert(`
    INSERT INTO grants (id, name, applicants, "categoryID", start, "end", status, total, cofunding, fields)
      VALUES (
        nextval('grants_id_seq'),
        ${grant.name === null ? `'Grant ' || currval('grants_id_seq')` : `@name`},
        @applicants,
        @categoryID,
        @start,
        @end,
        @status,
        @total,
        @cofunding,
        @fields
      )`,
    serialize(grant)
  )
  .then(id => findById(id))
}

module.exports.delete = function(id) {
  return db.query(`BEGIN`)
  .then(() => db.query(`DELETE FROM grants WHERE id = @id`, { id }))
  .then(() => db.query(`DELETE FROM fundings WHERE "fromGrantID" = @id OR "toGrantID" = @id`, { id }))
  .then(() => db.query(`COMMIT`))
  .catch(err => {
    return db.query('ROLLBACK')
      .then(() => Promise.reject(err))
  })
}


// Helpers

function serialize(grant) {
  grant.fields = JSON.stringify(grant.fields)
  grant.categoryID = grant.categoryID || null
  return grant
}

function deserialize(grant) {
  grant.fields = JSON.parse(grant.fields)
  return grant
}
