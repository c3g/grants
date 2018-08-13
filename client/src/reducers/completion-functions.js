import {
  get,
  set,
  lensPath,
  indexBy,
  prop,
  assoc,
  dissoc
} from 'ramda'
import { COMPLETION_FUNCTIONS } from '../constants/ActionTypes'

import toLoadable from '../utils/to-loadable'

const initialState = {
  isLoading: false,
  isCreating: false,
  data: {}
}

export default function completionFunctions(state = initialState, action) {
  switch (action.type) {

    case COMPLETION_FUNCTIONS.FETCH.REQUEST:
      return { ...state, isLoading: true }
    case COMPLETION_FUNCTIONS.FETCH.RECEIVE:
      return { ...state, isLoading: false, data: toLoadable(indexBy(prop('id'), action.payload)) }
    case COMPLETION_FUNCTIONS.FETCH.ERROR:
      return { ...state, isLoading: false }

    case COMPLETION_FUNCTIONS.CREATE.REQUEST:
      return { ...state, isCreating: true }
    case COMPLETION_FUNCTIONS.CREATE.RECEIVE:
      return { ...state, isCreating: false, data:
        assoc(action.payload.id, { isLoading: false, data: action.payload }, state.data) }
    case COMPLETION_FUNCTIONS.CREATE.ERROR:
      return { ...state, isCreating: false }

    case COMPLETION_FUNCTIONS.UPDATE.REQUEST:
      return set(lensPath(['data', action.payload.id, 'isLoading']), true, state)
    case COMPLETION_FUNCTIONS.UPDATE.RECEIVE:
      return set(lensPath(['data', action.meta.id]), { isLoading: false, data: action.payload }, state)
    case COMPLETION_FUNCTIONS.UPDATE.ERROR:
      return set(lensPath(['data', action.meta.id, 'isLoading']), false, state)

    case COMPLETION_FUNCTIONS.DELETE.REQUEST:
      return set(lensPath(['data', action.payload.id, 'isLoading']), true, state)
    case COMPLETION_FUNCTIONS.DELETE.RECEIVE:
      return { ...state, data: dissoc(action.meta.id, state.data) }
    case COMPLETION_FUNCTIONS.DELETE.ERROR:
      return set(lensPath(['data', action.meta.id, 'isLoading']), true, state)

    default:
      return state
  }
}
