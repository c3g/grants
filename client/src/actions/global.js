import {
  UI,
  LOGGED_IN,
  SHOW,
  SHOW_NOTIFICATION
} from '../constants/ActionTypes'
import { createAction, createAsyncAction, createFetchActions } from '../helpers/create-actions'
import * as requests from '../requests'

import openCentered from '../helpers/open-centered'
import settings from './settings.js'
import users from './users.js'
import applicants from './applicants.js'
import grants from './grants.js'
import fundings from './fundings.js'
import categories from './categories.js'

const createPayload = (message, details) => ({ message, details })

export const showNotification = createAction(SHOW_NOTIFICATION)
export const showInfo         = createAction(SHOW.INFO, createPayload)
export const showSuccess      = createAction(SHOW.SUCCESS, createPayload)
export const showWarning      = createAction(SHOW.WARNING, createPayload)
export const showError        = createAction(SHOW.ERROR, createPayload)

export const showFAQ  = createAction(UI.SHOW_FAQ)
export const closeFAQ = createAction(UI.CLOSE_FAQ)

export const fetchAll = createAsyncAction(() => (dispatch, getState) => {
  const { ui: { loggedIn } } = getState()

  if (loggedIn.value === false && process.env.NODE_ENV !== 'development')
    return Promise.reject(new Error('Not logged in'))

  return Promise.all([
    settings.fetch(),
    users.fetch(),
    applicants.fetch(),
    grants.fetch(),
    fundings.fetch(),
    categories.fetch(),
  ])
})

export const checkIsLoggedIn = createFetchActions(LOGGED_IN, requests.isLoggedIn)
export const logIn = createAsyncAction(() => (dispatch, getState) => {
  const { ui: { loggedIn } } = getState()

  if (loggedIn.value === true || window.isPopupOpen)
    return Promise.reject(new Error('Already logged in or popup already opened'))

  const didAuth = new Promise((resolve, reject) => {
    let popup
    let interval

    window.oauthDone = (success) => {
      popup.close()
      window.isPopupOpen = false
      clearInterval(interval)
      if (success)
        resolve()
      else
        reject()
    }

    window.isPopupOpen = true
    popup = openCentered('/auth/google', 600, 600)
    interval = setInterval(() => {
      if (popup.closed) {
        window.isPopupOpen = false
        clearInterval(interval)
        reject()
      }
    }, 200)
  })

  return didAuth
    .then(() => checkIsLoggedIn())
    .then(isLoggedIn => isLoggedIn ? fetchAll() : undefined)
    .catch(() => showError('Authentication failed'))
})

export const logOut = createAsyncAction(() => (dispatch, getState) => {
  const { ui: { loggedIn } } = getState()

  if (loggedIn.value === false || window.isPopupOpen)
    return Promise.reject(new Error('Not logged in or popup already opened'))

  const didLogout = new Promise((resolve, reject) => {
    let popup
    let interval

    window.oauthDone = (success) => {
      popup.close()
      window.isPopupOpen = false
      clearInterval(interval)
      if (success)
        resolve()
      else
        reject()
    }

    window.isPopupOpen = true
    popup = openCentered('/auth/logout', 600, 600)
    interval = setInterval(() => {
      if (popup.closed) {
        window.isPopupOpen = false
        clearInterval(interval)
        reject()
      }
    }, 200)
  })

  return didLogout
  .then(() => checkIsLoggedIn())
  .catch(() => showError('Logout failed'))
})

export default {
  showNotification,
  showInfo,
  showSuccess,
  showWarning,
  showError,
  showFAQ,
  closeFAQ,
  checkIsLoggedIn,
  logIn,
  logOut,
  fetchAll,
}
