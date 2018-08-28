const express = require('express')
const router = express.Router()

const { dataHandler, errorHandler } = require('../helpers/handlers.js')
const Funding = require('../models/funding.js')
const History = require('../models/history.js')

/* GET funding list */
router.get('/list', (req, res, next) => {
  Funding.findAll()
  .then(dataHandler(res))
  .catch(errorHandler(res))
})

/* GET single template */
router.get('/get/:id', (req, res, next) => {
  Funding.findById(req.params.id)
  .then(dataHandler(res))
  .catch(errorHandler(res))
})

/* POST create template */
router.use('/create', (req, res, next) => {
  Funding.create(req.body)
  .then(History.handler(req, 'fundings', 'created'))
  .then(dataHandler(res))
  .catch(errorHandler(res))
})

/* POST update template */
router.use('/update/:id', (req, res, next) => {
  Funding.update({ ...req.body, id: req.params.id })
  .then(History.handler(req, 'fundings', 'updated'))
  .then(dataHandler(res))
  .catch(errorHandler(res))
})

/* POST delete template */
router.use('/delete/:id', (req, res, next) => {
  Funding.delete(req.params.id)
  .then(History.handler(req, 'fundings', 'deleted'))
  .then(dataHandler(res))
  .catch(errorHandler(res))
})


module.exports = router
