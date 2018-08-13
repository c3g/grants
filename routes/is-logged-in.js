const express = require('express')
const router = express.Router()

const { dataHandler, errorHandler } = require('../helpers/handlers.js')

/* GET check if user is logged in */
router.use('/', (req, res, next) => {
  (
    req.isAuthenticated() ?
      Promise.resolve(true) :
      Promise.resolve(false)
  )
  .then(dataHandler(res))
  .catch(errorHandler(res))
})


module.exports = router
