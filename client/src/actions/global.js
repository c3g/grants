import {
  UI,
  LOGGED_IN,
  SHOW,
  SHOW_NOTIFICATION
} from '../constants/ActionTypes'
import { createAction } from 'redux-actions'
import { createFetchActions } from '../utils/create-actions'
import * as requests from '../requests'

import openCentered from '../utils/open-centered'
import { getNewSample, getNewCompletionFunction } from '../models'
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

export const checkIsLoggedIn = createFetchActions(LOGGED_IN, requests.isLoggedIn)
export const logIn = () => {
  return (dispatch, getState) => {
    const { ui: { loggedIn } } = getState()

    if (loggedIn.value === true || window.isPopupOpen)
      return

    const didAuth = new Promise((resolve, reject) => {
      let popup
      let interval

      window.oauthDone = () => {
        popup.close()
        window.isPopupOpen = false
        clearInterval(interval)
        resolve()
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
      .then(() => dispatch(checkIsLoggedIn()))
      .then(isLoggedIn => isLoggedIn ? dispatch(fetchAll()) : undefined)
  }
}
export const logOut = () => {
  return (dispatch, getState) => {
    const { ui: { loggedIn } } = getState()

    if (loggedIn.value === false || window.isPopupOpen)
      return

    const didLogout = new Promise((resolve, reject) => {
      let popup
      let interval

      window.oauthDone = () => {
        popup.close()
        window.isPopupOpen = false
        clearInterval(interval)
        resolve()
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

    return didLogout.then(() => dispatch(checkIsLoggedIn()))
  }
}

export const fetchAll = () => {
  return (dispatch, getState) => {

    const { ui: { loggedIn } } = getState()

    if (loggedIn.value === false && process.env.NODE_ENV !== 'development')
      return

    return Promise.all([
      dispatch(settings.fetch()),
      dispatch(users.fetch()),
      dispatch(applicants.fetch()),
      dispatch(grants.fetch()),
      dispatch(fundings.fetch()),
      dispatch(categories.fetch()),
    ])
  }
}

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
