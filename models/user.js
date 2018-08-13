/*
 * user.js
 */

const db = require('../database.js')
const { rejectMessage } = require('../helpers/promise')
const k = require('../constants')

module.exports = {
  findAll,
  findById,
  findByGoogleId,
  findByName,
  update,
  create,
}


function findAll() {
  return db.selectAll('SELECT * FROM users')
}

function findById(id) {
  return db.selectOne('SELECT * FROM users WHERE id = @id', { id })
    .catch(err =>
      err.type === k.ROW_NOT_FOUND ?
        rejectMessage('User account not found', k.ACCOUNT_NOT_FOUND) :
        Promise.reject(err)
    )
}

function findByGoogleId(googleId) {
  return db.selectOne('SELECT * FROM users WHERE "googleId" = @googleId', { googleId })
    .catch(err =>
      err.type === k.ROW_NOT_FOUND ?
        rejectMessage('User account not found', k.ACCOUNT_NOT_FOUND) :
        Promise.reject(err)
    )
}

function findByName(name) {
  return db.selectOne('SELECT * FROM users WHERE name = @name', { name })
    .catch(err =>
      err.type === k.ROW_NOT_FOUND ?
        rejectMessage('User account not found', k.ACCOUNT_NOT_FOUND) :
        Promise.reject(err)
    )
}

function update(user) {
  return db.query(`
    UPDATE users
       SET name = @name
         , email = @email
     WHERE id = @id
    `, user)
    .then(() => findById(user.id))
}

function create(user) {
  return db.insert(`
    INSERT INTO users ("googleId", token, name, email)
    VALUES (
      @googleId,
      @token,
      @name,
      @email
    )`, user)
    .then(id => findById(id))
}

module.exports.delete = function(id) {
  return db.query('DELETE FROM users WHERE id = @id', { id })
}
