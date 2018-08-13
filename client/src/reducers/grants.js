import {
  get,
  set,
  lensPath,
  indexBy,
  prop,
  assoc,
  dissoc
} from 'ramda'
import { GRANTS } from '../constants/ActionTypes'

import toLoadable from '../utils/to-loadable'

const initialState = {
  isLoading: false,
  isCreating: false,
  data: {}
}

export default function grants(state = initialState, action) {
  switch (action.type) {

    case GRANTS.FETCH.REQUEST:
      return { ...state, isLoading: true }
    case GRANTS.FETCH.RECEIVE:
      return { ...state, isLoading: false, data: toLoadable(indexBy(prop('id'), action.payload)) }
    case GRANTS.FETCH.ERROR:
      return { ...state, isLoading: false }

    case GRANTS.CREATE.REQUEST:
      return { ...state, isCreating: true }
    case GRANTS.CREATE.RECEIVE:
      return { ...state, isCreating: false, data:
        assoc(action.payload.id, { isLoading: false, data: action.payload }, state.data) }
    case GRANTS.CREATE.ERROR:
      return { ...state, isCreating: false }

    case GRANTS.UPDATE.REQUEST:
      return set(lensPath(['data', action.payload.id, 'isLoading']), true, state)
    case GRANTS.UPDATE.RECEIVE:
      return set(lensPath(['data', action.meta.id]), { isLoading: false, data: action.payload }, state)
    case GRANTS.UPDATE.ERROR:
      return set(lensPath(['data', action.meta.id, 'isLoading']), false, state)

    case GRANTS.DELETE.REQUEST:
      return set(lensPath(['data', action.payload.id, 'isLoading']), true, state)
    case GRANTS.DELETE.RECEIVE:
      return { ...state, data: dissoc(action.meta.id, state.data) }
    case GRANTS.DELETE.ERROR:
      return set(lensPath(['data', action.meta.id, 'isLoading']), true, state)

    default:
      return state
  }
}
