const express = require('express')
const router = express.Router()

const { dataHandler, errorHandler } = require('../helpers/handlers.js')
const Applicant = require('../models/applicant.js')

/* GET applicants list */
router.get('/list', (req, res, next) => {
  Applicant.findAll()
  .then(dataHandler(res))
  .catch(errorHandler(res))
})

/* GET single template */
router.get('/get/:id', (req, res, next) => {
  Applicant.findById(req.params.id)
  .then(dataHandler(res))
  .catch(errorHandler(res))
})

/* POST create template */
router.use('/create', (req, res, next) => {
  Applicant.create(req.body)
  .then(dataHandler(res))
  .catch(errorHandler(res))
})

/* POST update template */
router.use('/update/:id', (req, res, next) => {
  Applicant.update({ ...req.body, id: req.params.id })
  .then(dataHandler(res))
  .catch(errorHandler(res))
})

/* POST delete template */
router.use('/delete/:id', (req, res, next) => {
  Applicant.delete(req.params.id)
  .then(dataHandler(res))
  .catch(errorHandler(res))
})


module.exports = router
