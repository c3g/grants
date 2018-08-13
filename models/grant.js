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
  return db.selectOne(`SELECT * FROM grants WHERE id = @id`, { id })
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
    grant
  )
  .then(() => findById(grant.id))
}

function create(grant) {
  return db.insert(`
    INSERT INTO grants (id, name, applicants, "categoryID", start, "end", status, total, cofunding, fields)
      VALUES (
        nextval('samples_id_seq'),
        ${grant.name === null ? `'Grant ' || currval('samples_id_seq')` : `@name`},
        @applicants,
        @categoryID,
        @start,
        @end,
        @status,
        @total,
        @cofunding,
        @fields
      )`,
    grant
  )
}

module.exports.delete = function(id) {
  return Promise.all([
    db.query(`DELETE FROM grants WHERE id = @id`, { id }),
    db.query(`DELETE FROM fundings WHERE fromGrantID = @id OR toGrantID = @id`, { id }),
  ])
}
