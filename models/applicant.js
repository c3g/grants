/*
 * applicant.js
 */


const db = require('../database.js')

module.exports = {
  findAll,
  findById,
  update,
  create,
}

function findAll() {
  return db.selectAll('SELECT * FROM applicants')
}

function findById(id) {
  return db.selectOne('SELECT * FROM applicants WHERE id = @id', { id })
}

function update(applicant) {
  return db.query(`
    UPDATE applicants
       SET name = @name
     WHERE id = @id`,
    applicant)
  .then(() => findById(applicant.id))
}

function create(applicant) {
  return db.insert(`
    INSERT INTO applicants
                (name)
         VALUES (@name)`, applicant)
  .then(id => findById(id))
}

module.exports.delete = function(id) {
  return db.query('DELETE FROM applicants WHERE id = @id', { id })
    .then(() => id)
}
