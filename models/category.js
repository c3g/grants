/*
 * category-function.js
 */


const db = require('../database.js')

module.exports = {
  findAll,
  findById,
  update,
  create,
}

function findAll() {
  return db.selectAll('SELECT * FROM categories')
}

function findById(id) {
  return db.selectOne('SELECT * FROM categories WHERE id = @id', { id })
}

function update(category) {
  return db.query(`
    UPDATE categories
       SET name = @name
         , color = @color
     WHERE id = @id`,
    category)
  .then(() => findById(category.id))
}

function create(category) {
  return db.insert(`
    INSERT INTO categories
                (name, color)
         VALUES (@name, @color)`, category)
  .then(id => findById(id))
}

module.exports.delete = function(id) {
  return db.query('DELETE FROM categories WHERE id = @id', { id })
    .then(() => id)
}
