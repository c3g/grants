const express = require('express')
const router = express.Router()

const { dataHandler, errorHandler } = require('../helpers/handlers.js')
const User = require('../models/user.js')

/* GET users list */
router.get('/list', (req, res, next) => {
  User.findAll()
  .then(dataHandler(res))
  .catch(errorHandler(res))
})

/* GET single user */
router.get('/get/:id', (req, res, next) => {
  User.findById(req.params.id)
  .then(dataHandler(res))
  .catch(errorHandler(res))
})

/* POST update user */
router.use('/update/:id', (req, res, next) => {
  User.update({ ...req.body, id: req.params.id })
  .then(dataHandler(res))
  .catch(errorHandler(res))
})

/* POST delete user */
router.use('/delete/:id', (req, res, next) => {
  User.delete(req.params.id)
  .then(dataHandler(res))
  .catch(errorHandler(res))
})


module.exports = router
