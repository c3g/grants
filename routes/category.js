const express = require('express')
const router = express.Router()

const { dataHandler, errorHandler } = require('../helpers/handlers.js')
const Category = require('../models/category.js')
const History = require('../models/history.js')

/* GET category list */
router.get('/list', (req, res, next) => {
  Category.findAll()
  .then(dataHandler(res))
  .catch(errorHandler(res))
})

/* GET single template */
router.get('/get/:id', (req, res, next) => {
  Category.findById(req.params.id)
  .then(dataHandler(res))
  .catch(errorHandler(res))
})

/* POST create template */
router.use('/create', (req, res, next) => {
  Category.create(req.body)
  .then(History.handler(req, 'categories', 'created'))
  .then(dataHandler(res))
  .catch(errorHandler(res))
})

/* POST update template */
router.use('/update/:id', (req, res, next) => {
  Category.update({ ...req.body, id: req.params.id })
  .then(History.handler(req, 'categories', 'updated'))
  .then(dataHandler(res))
  .catch(errorHandler(res))
})

/* POST delete template */
router.use('/delete/:id', (req, res, next) => {
  Category.delete(req.params.id)
  .then(History.handler(req, 'categories', 'deleted'))
  .then(dataHandler(res))
  .catch(errorHandler(res))
})


module.exports = router
