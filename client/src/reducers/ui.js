import {
  LOGGED_IN,
  SHOW,
  SHOW_NOTIFICATION,
  UI
} from '../constants/ActionTypes'
import uniq from '../helpers/uniq'

const initialState = {
  showFAQ: false,
  loggedIn: {
    isLoading: false,
    value: false,
  },
  notifications: [],
}

export default function ui(state = initialState, action) {
  if (action.isError) {
    console.error(action.error)

    const message =
      (action.error.fromServer ? 'Server ' : '')
      + action.error.message
    const details = undefined

    return {
      ...state,
      notifications: state.notifications.concat({
        type: 'error',
        message: message,
        details: details,
        // stack: getStack(action.payload),
      })
    }
  }

  switch (action.type) {
    case LOGGED_IN.REQUEST:
      return { ...state, loggedIn: { ...state.loggedIn, isLoading: true } }
    case LOGGED_IN.RECEIVE:
      return { ...state, loggedIn: { isLoading: false, value: action.payload } }
    case LOGGED_IN.ERROR:
      return { ...state, loggedIn: { isLoading: false, value: false } }

    case UI.SHOW_FAQ:
      return { ...state, showFAQ: true }
    case UI.CLOSE_FAQ:
      return { ...state, showFAQ: false }

    case SHOW_NOTIFICATION:
      return { ...state, notifications: state.notifications.concat(action.payload) }
    case SHOW.INFO:
      return { ...state, notifications: state.notifications.concat({ type: 'info', ...action.payload }) }
    case SHOW.SUCCESS:
      return { ...state, notifications: state.notifications.concat({ type: 'success', ...action.payload }) }
    case SHOW.WARNING:
      return { ...state, notifications: state.notifications.concat({ type: 'warning', ...action.payload }) }
    case SHOW.ERROR:
      return { ...state, notifications: state.notifications.concat({ type: 'error', ...action.payload }) }

    default:
      return state
  }
}

function getStack(error) {
  return (
    error.stack === undefined ?
      undefined :
    Array.isArray(error.stack) ?
      error.stack :
      error.stack.split('\n')
  )
}
