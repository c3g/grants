const express = require('express')
const router = express.Router()

const { dataHandler, errorHandler } = require('../helpers/handlers.js')
const Settings = require('../models/settings.js')
const History = require('../models/history.js')

/* GET users list */
router.get('/list', (req, res, next) => {
  Settings.findAll()
  .then(dataHandler(res))
  .catch(errorHandler(res))
})

/* GET single setting */
router.get('/get/:key', (req, res, next) => {
  Settings.findByKey(req.params.key)
  .then(dataHandler(res))
  .catch(errorHandler(res))
})

/* POST update setting */
router.use('/update/:key', (req, res, next) => {
  Settings.update(req.params.key, req.body.value)
  .then(History.handler(req, 'settings', data => `updated value to ${JSON.stringify(data)}`))
  .then(dataHandler(res))
  .catch(errorHandler(res))
})


module.exports = router
