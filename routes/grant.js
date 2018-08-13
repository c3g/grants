const express = require('express')
const router = express.Router()

const { dataHandler, errorHandler } = require('../helpers/handlers.js')
const Grant = require('../models/grant.js')

/* GET grant list */
router.get('/list', (req, res, next) => {
  Grant.findAll()
  .then(dataHandler(res))
  .catch(errorHandler(res))
})

/* GET single template */
router.get('/get/:id', (req, res, next) => {
  Grant.findById(req.params.id)
  .then(dataHandler(res))
  .catch(errorHandler(res))
})

/* POST create template */
router.use('/create', (req, res, next) => {
  Grant.create(req.body)
  .then(dataHandler(res))
  .catch(errorHandler(res))
})

/* POST update template */
router.use('/update/:id', (req, res, next) => {
  Grant.update({ ...req.body, id: req.params.id })
  .then(dataHandler(res))
  .catch(errorHandler(res))
})

/* POST delete template */
router.use('/delete/:id', (req, res, next) => {
  Grant.delete(req.params.id)
  .then(dataHandler(res))
  .catch(errorHandler(res))
})


module.exports = router
