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
  // .then(rows => rows.map(deserialize))
}

function findById(id) {
  return db.selectOne(`SELECT * FROM grants WHERE id = @id`, { id })
    // .then(deserialize)
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
  return Promise.all([
    db.query(`DELETE FROM grants WHERE id = @id`, { id }),
    db.query(`DELETE FROM fundings WHERE fromGrantID = @id OR toGrantID = @id`, { id }),
  ])
}


// Helpers

function serialize(grant) {
  grant.fields = JSON.stringify(grant.fields)
  return grant
}

function deserialize(grant) {
  grant.fields = JSON.parse(grant.fields)
  return grant
}
