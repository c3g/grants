const express = require('express')
const router = express.Router()

const { dataHandler, errorHandler } = require('../helpers/handlers.js')
const History = require('../models/history.js')

/* GET whole history */
router.get('/list', (req, res, next) => {
  History.findAll()
  .then(dataHandler(res))
  .catch(errorHandler(res))
})

/* GET history for a single item */
router.get('/find-by-entity/:table/:id', (req, res, next) => {
  History.findByEntity(req.params.table, req.params.id)
  .then(dataHandler(res))
  .catch(errorHandler(res))
})

/* GET history for a range */
router.get('/find-by-range/:start/:end', (req, res, next) => {
  History.findByRange(req.params.start, req.params.end)
  .then(dataHandler(res))
  .catch(errorHandler(res))
})


module.exports = router
