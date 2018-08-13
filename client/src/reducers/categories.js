import {
  get,
  set,
  lensPath,
  indexBy,
  prop,
  assoc,
  dissoc
} from 'ramda'
import { CATEGORIES } from '../constants/ActionTypes'

import toLoadable from '../utils/to-loadable'

const initialState = {
  isLoading: false,
  isCreating: false,
  data: {}
}

export default function categories(state = initialState, action) {
  switch (action.type) {

    case CATEGORIES.FETCH.REQUEST:
      return { ...state, isLoading: true }
    case CATEGORIES.FETCH.RECEIVE:
      return { ...state, isLoading: false, data: toLoadable(indexBy(prop('id'), action.payload)) }
    case CATEGORIES.FETCH.ERROR:
      return { ...state, isLoading: false }

    case CATEGORIES.CREATE.REQUEST:
      return { ...state, isCreating: true }
    case CATEGORIES.CREATE.RECEIVE:
      return { ...state, isCreating: false, data:
        assoc(action.payload.id, { isLoading: false, data: action.payload }, state.data) }
    case CATEGORIES.CREATE.ERROR:
      return { ...state, isCreating: false }

    case CATEGORIES.UPDATE.REQUEST:
      return set(lensPath(['data', action.payload.id, 'isLoading']), true, state)
    case CATEGORIES.UPDATE.RECEIVE:
      return set(lensPath(['data', action.meta.id]), { isLoading: false, data: action.payload }, state)
    case CATEGORIES.UPDATE.ERROR:
      return set(lensPath(['data', action.meta.id, 'isLoading']), false, state)

    case CATEGORIES.DELETE.REQUEST:
      return set(lensPath(['data', action.payload.id, 'isLoading']), true, state)
    case CATEGORIES.DELETE.RECEIVE:
      return { ...state, data: dissoc(action.meta.id, state.data) }
    case CATEGORIES.DELETE.ERROR:
      return set(lensPath(['data', action.meta.id, 'isLoading']), true, state)

    default:
      return state
  }
}
