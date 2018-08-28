/*
 * history.js
 */


const db = require('../database.js')

module.exports = {
  findAll,
  findById,
  findByEntity,
  findByRange,
  create,
  deleteByEntity,
  handler,
}

function findAll() {
  return db.selectAll('SELECT * FROM history')
}

function findById(id) {
  return db.selectOne('SELECT * FROM history WHERE id = @id', { id })
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

function findByRange(start, end) {
  return db.selectAll(`
      SELECT *
        FROM history
       WHERE date >= @start
         AND date < @end
    ORDER BY date DESC
    `, { start, end })
}

function create(entry) {
  return db.insert(`
    INSERT INTO history ("userID", description, "date", "table", "targetID")
      VALUES (
        @userID,
        @description,
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

function handler(req, table, description) {
  return (data) => {
    const entry = {}
    entry.userID = req.user.id
    entry.table = table
    entry.description = typeof description === 'function' ? description(data, req.params) : description
    entry.targetID = data.id || req.params.key || req.params.id
    console.log(data, entry)
    create(entry)
    return data
  }
}
