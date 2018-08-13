import {
  get,
  set,
  lensPath,
  indexBy,
  prop,
  assoc,
  dissoc
} from 'ramda'
import { TEMPLATES } from '../constants/ActionTypes'

import toLoadable from '../utils/to-loadable'

const initialState = {
  isLoading: false,
  isCreating: false,
  data: {}
}

export default function templates(state = initialState, action) {
  switch (action.type) {

    case TEMPLATES.FETCH.REQUEST:
      return { ...state, isLoading: true }
    case TEMPLATES.FETCH.RECEIVE:
      return { ...state, isLoading: false, data: toLoadable(indexBy(prop('id'), action.payload)) }
    case TEMPLATES.FETCH.ERROR:
      return { ...state, isLoading: false }

    case TEMPLATES.CREATE.REQUEST:
      return { ...state, isCreating: true }
    case TEMPLATES.CREATE.RECEIVE:
      return { ...state, isCreating: false, data:
        assoc(action.payload.id, { isLoading: false, data: action.payload }, state.data) }
    case TEMPLATES.CREATE.ERROR:
      return { ...state, isCreating: false }

    case TEMPLATES.UPDATE.REQUEST:
      return set(lensPath(['data', action.payload.id, 'isLoading']), true, state)
    case TEMPLATES.UPDATE.RECEIVE:
      return set(lensPath(['data', action.meta.id]), { isLoading: false, data: action.payload }, state)
    case TEMPLATES.UPDATE.ERROR:
      return set(lensPath(['data', action.meta.id, 'isLoading']), false, state)

    case TEMPLATES.DELETE.REQUEST:
      return set(lensPath(['data', action.payload.id, 'isLoading']), true, state)
    case TEMPLATES.DELETE.RECEIVE:
      return { ...state, data: dissoc(action.meta.id, state.data) }
    case TEMPLATES.DELETE.ERROR:
      return set(lensPath(['data', action.meta.id, 'isLoading']), true, state)

    default:
      return state
  }
}
