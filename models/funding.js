/*
 * funding.js
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
      FROM fundings
  `)
}

function findById(id) {
  return db.selectOne(`SELECT * FROM fundings WHERE id = @id`, { id })
}

function update(funding) {
  return db.query(`
    UPDATE fundings
      SET "fromGrantID" = @fromGrantID
        , "toGrantID" = @toGrantID
        , amount = @amount
    WHERE id = @id`,
    funding
  )
  .then(() => findById(funding.id))
}

function create(funding) {
  return db.insert(`
    INSERT INTO fundings ("fromGrantID", "toGrantID", amount)
      VALUES (
        @fromGrantID,
        @toGrantID,
        @amount
      )`,
    funding
  )
  .then(id => findById(id))
}

module.exports.delete = function(id) {
  return db.query(`DELETE FROM fundings WHERE id = @id`, { id })
}
