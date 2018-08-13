import {
  LOGGED_IN,
  SHOW,
  SHOW_NOTIFICATION,
  UI
} from '../constants/ActionTypes'
import { Set } from 'immutable'
import Sort from '../constants/sorting'
import uniq from '../utils/uniq'

const initialState = {
  showFAQ: false,
  loggedIn: {
    isLoading: false,
    value: false,
  },
  includeArchived: false,
  sorting: {
    criteria: [Sort.BY_CREATED],
    reverse: false,
  },
  filtering: {
    tags: [],
  },
  notifications: [],
  selectedSteps: Set(),
  stepContextMenu: {
    step: undefined,
    open: false,
  }
}

export default function ui(state = initialState, action) {
  if (action.error === true) {
    console.error(action.payload)

    const message =
      (action.payload.fromServer ? 'Server: ' : '') +
      (action.payload.type === 'COMPLETION_FUNCTION_FAILED' ?
        'Completion function returned message:' :
        action.payload.message.replace(/^Error: /, ''))

    const details =
      action.payload.type === 'COMPLETION_FUNCTION_FAILED' ?
        action.payload.message.replace(/^Error: /, '') :
        undefined

    state = {
      ...state,
      notifications: state.notifications.concat({
        type: 'error',
        message: message,
        details: details,
        //stack: getStack(action.payload),
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

    case UI.SET_SORTING_CRITERIA:
      return { ...state, sorting: { ...state.sorting, criteria: action.payload } }
    case UI.SET_SORTING_REVERSE:
      return { ...state, sorting: { ...state.sorting, reverse: action.payload } }
    case UI.TOGGLE_SORTING_REVERSE:
      return { ...state, sorting: { ...state.sorting, reverse: !state.sorting.reverse } }
    case UI.ADD_FILTERING_TAG:
      return { ...state, filtering: { ...state.filtering, tags: uniq([...state.filtering.tags, action.payload]) } }
    case UI.DELETE_FILTERING_TAG:
      return { ...state, filtering: { ...state.filtering, tags: state.filtering.tags.filter(t => t !== action.payload) } }
    case UI.SET_FILTERING_TAGS:
      return { ...state, filtering: { ...state.filtering, tags: action.payload } }
    case UI.SET_INCLUDE_ARCHIVED:
      return { ...state, includeArchived: action.payload }

    case UI.SELECT_STEP:
      return { ...state, selectedSteps: state.selectedSteps.add(action.payload) }
    case UI.DESELECT_STEP:
      return { ...state, selectedSteps: state.selectedSteps.delete(action.payload) }
    case UI.DESELECT_ALL_STEPS:
      return { ...state, selectedSteps: state.selectedSteps.clear() }

    case UI.OPEN_STEP_CONTEXT_MENU:
      if (state.selectedSteps.has(action.payload))
        return { ...state, stepContextMenu: { step: action.payload, open: true } }
      else
        return { ...state, selectedSteps: Set([action.payload]),
          stepContextMenu: {
            step: action.payload,
            open: true
          }
        }
    case UI.CLOSE_STEP_CONTEXT_MENU:
      return { ...state, stepContextMenu: { ...state.stepContextMenu, open: false } }

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
