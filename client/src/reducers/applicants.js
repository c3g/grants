import {
  get,
  set,
  lensPath,
  indexBy,
  prop,
  assoc,
  dissoc
} from 'ramda'
import { APPLICANTS } from '../constants/ActionTypes'

import toLoadable from '../helpers/to-loadable'

const initialState = {
  isLoading: false,
  isCreating: false,
  data: {}
}

export default function applicants(state = initialState, action) {
  switch (action.type) {

    case APPLICANTS.FETCH.REQUEST:
      return { ...state, isLoading: true }
    case APPLICANTS.FETCH.RECEIVE:
      return { ...state, isLoading: false, data: toLoadable(indexBy(prop('id'), action.payload)) }
    case APPLICANTS.FETCH.ERROR:
      return { ...state, isLoading: false }

    case APPLICANTS.CREATE.REQUEST:
      return { ...state, isCreating: true }
    case APPLICANTS.CREATE.RECEIVE:
      return { ...state, isCreating: false, data:
        assoc(action.payload.id, { isLoading: false, data: action.payload }, state.data) }
    case APPLICANTS.CREATE.ERROR:
      return { ...state, isCreating: false }

    case APPLICANTS.UPDATE.REQUEST:
      return set(lensPath(['data', action.payload.id, 'isLoading']), true, state)
    case APPLICANTS.UPDATE.RECEIVE:
      return set(lensPath(['data', action.meta.id]), { isLoading: false, data: action.payload }, state)
    case APPLICANTS.UPDATE.ERROR:
      return set(lensPath(['data', action.meta.id, 'isLoading']), false, state)

    case APPLICANTS.DELETE.REQUEST:
      return set(lensPath(['data', action.payload.id, 'isLoading']), true, state)
    case APPLICANTS.DELETE.RECEIVE:
      return { ...state, data: dissoc(action.meta.id, state.data) }
    case APPLICANTS.DELETE.ERROR:
      return set(lensPath(['data', action.meta.id, 'isLoading']), true, state)

    default:
      return state
  }
}
