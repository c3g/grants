global.Promise = require('bluebird')
const path = require('path')
const express = require('express')
const session = require('express-session')
const favicon = require('serve-favicon')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const flash = require('connect-flash')

const config = require('/usr/etc/config.js')
const passport = require('./passport.js')
const k = require('./constants')
const User = require('./models/user.js')



// Setup application
const app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')



// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

// Passport setup
app.use(session({ secret: 'SECRET', resave: false, saveUninitialized: true }))
app.use(passport.initialize())
app.use(passport.session()) // persistent login sessions
app.use(flash()) // use connect-flash for flash messages stored in session



// API

app.use('/api/is-logged-in',                     require('./routes/is-logged-in'))
app.use('/api/settings',           apiProtected, require('./routes/settings'))
app.use('/api/user',               apiProtected, require('./routes/user'))
app.use('/api/applicant',          apiProtected, require('./routes/applicant'))
app.use('/api/grant',              apiProtected, require('./routes/grant'))
app.use('/api/funding',            apiProtected, require('./routes/funding'))
app.use('/api/category',           apiProtected, require('./routes/category'))
app.use('/api', (req, res) => {
  res.status(404)
  res.json({ ok: false, message: '404', url: req.originalUrl })
  res.end()
})

function apiProtected(req, res, next) {
  if (req.isAuthenticated())
    return next()

  const username = req.get('x-username')
  const password = req.get('x-password')

  if (username === 'system' && password) {
    return User.findByName(username)
    .then(user => user.password === password ? Promise.resolve(user) : Promise.reject())
    .then(user => {
      req.user = user
      return next()
    })
    .catch(() => {
      res.json({ ok: false, message: 'Not authenticated' })
      res.end()
    })
  }

  if (process.env.NODE_ENV === 'development') {
    req.user = {
      id: 2,
      googleID: '113897916442927912291',
      token: 'asldfhaosidhfaouifhnewofuiqnwerocfnq9wejfoqwuie',
      name: 'Rom Grk',
      email: 'rom7011@gmail.com',
      password: null
    }
    return next()
  }

  res.json({ ok: false, message: 'Not authenticated' })
  res.end()
}



// Authentication

app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  callbackURL: config.google.callbackURL,
}))
app.get('/auth/google/callback', passport.authenticate('google', {
  successRedirect: '/auth/done',
  failureRedirect: '/',
}))
app.get('/auth/logout', (req, res) => {
  req.logout()
  res.redirect('/auth/done')
})
app.get('/auth/done', (req, res) => {
  res.render('oauth.ejs', {
    user: req.user // get the user out of session and pass to template
  })
})



/*
 * Redirect handler
 * We need to redirect all other routes to the app, e.g. /samples, /settings, etc.
 */

app.use((req, res, next) => {
  res.redirect('/')
})



// Error handler

app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error   = req.app.get('env') === 'development' ? err : {}

  if (err.type === k.ACCOUNT_NOT_FOUND)
    req.logout()

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})


module.exports = app
