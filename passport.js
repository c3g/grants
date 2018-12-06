/*
 * passport.js
 */

const passport = require('passport')
const { OAuth2Strategy } = require('passport-google-oauth')

const Settings = require('./models/settings.js')
const User = require('./models/user.js')
const config = require('/usr/etc/grants/config.js')
const k = require('./constants')

module.exports = passport

// used to serialize the user for the session
passport.serializeUser((user, done) => {
  done(undefined, user.id)
})

// used to deserialize the user
passport.deserializeUser((id, done) => {
  User.findById(id)
    .then(id => done(undefined, id))
    .catch(err => done(err))
})

passport.use(new OAuth2Strategy(config.google.auth, (token, refreshToken, profile, done) => {

  console.log(token, refreshToken, profile)

  // make the code asynchronous
  // User.findById won't fire until we have all our data back from Google
  process.nextTick(() => {

    // Try to find the user based on their google id
    User.findBygoogleID(profile.id)
    .then(user => {

      // if a user is found, log them in
      Promise.any([
        Settings.canLogin(user.email),
      ].concat(profile.emails.map(email =>
        Settings.canLogin(email.value)
      )))
      .then(() => done(undefined, user))
      .catch(err => done(err))
    })
    .catch(err => {
      // if the user isnt in our database, create a new user
      if (err.type === k.ACCOUNT_NOT_FOUND) {

        const newUser = {
          googleID: profile.id,
          token: token,
          name: profile.displayName,
          email: profile.emails[0].value,
        }

        Settings.canLogin(newUser.email)
        .then(() => User.create(newUser))
        .then(user => done(undefined, user))
        .catch(err => {
          if (err.message.includes('not in whitelist'))
            done(undefined, null)
          else
            done(err)
        })
      }
      // if some other error happens
      else {
        done(err)
      }
    })
  })
}))
