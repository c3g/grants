/*
 * history.js
 */


const db = require('../database.js')

module.exports = {
  findAll,
  findById,
  findByEntity,
  create,
  deleteByEntity,
}

function findAll() {
  return db.selectAll(`SELECT * FROM history`)
}

function findById(id) {
  return db.selectOne(`SELECT * FROM history WHERE id = @id`, { id })
}

function findByEntity(table, targetID) {
  return db.selectAll(`
      SELECT *
        FROM history
       WHERE "table" = @table
         AND "targetID" = @targetID
    ORDER BY date DESC
    `, { table, targetID })
}

function create(entry) {
  return db.insert(`
    INSERT INTO history ("userID", description, "date", "table", "targetID")
      VALUES (
        @userID,
        @description,
        @date,
        ${db.NOW},
        @table,
        @targetID
      )`, { table: null, targetID: null, ...entry })
}

module.exports.delete = function(id) {
  return db.query('DELETE FROM history WHERE id = @id', { id })
}

function deleteByEntity(table, targetID) {
  return db.query(`
      DELETE
        FROM history
       WHERE "table"    = @table
         AND "targetID" = @targetID
    `, { table, targetID })
}
