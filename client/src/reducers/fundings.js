import {
  get,
  set,
  lensPath,
  indexBy,
  prop,
  assoc,
  dissoc
} from 'ramda'
import { FUNDINGS, GRANTS } from '../constants/ActionTypes'

import toLoadable from '../utils/to-loadable'

const initialState = {
  isLoading: false,
  isCreating: false,
  data: {}
}

export default function fundings(state = initialState, action) {
  switch (action.type) {

    case FUNDINGS.FETCH.REQUEST:
      return { ...state, isLoading: true }
    case FUNDINGS.FETCH.RECEIVE:
      return { ...state, isLoading: false, data: toLoadable(indexBy(prop('id'), action.payload)) }
    case FUNDINGS.FETCH.ERROR:
      return { ...state, isLoading: false }

    case FUNDINGS.CREATE.REQUEST:
      return { ...state, isCreating: true }
    case FUNDINGS.CREATE.RECEIVE:
      return { ...state, isCreating: false, data:
        assoc(action.payload.id, { isLoading: false, data: action.payload }, state.data) }
    case FUNDINGS.CREATE.ERROR:
      return { ...state, isCreating: false }

    case FUNDINGS.UPDATE.REQUEST:
      return set(lensPath(['data', action.payload.id, 'isLoading']), true, state)
    case FUNDINGS.UPDATE.RECEIVE:
      return set(lensPath(['data', action.meta.id]), { isLoading: false, data: action.payload }, state)
    case FUNDINGS.UPDATE.ERROR:
      return set(lensPath(['data', action.meta.id, 'isLoading']), false, state)

    case FUNDINGS.DELETE.REQUEST:
      return set(lensPath(['data', action.payload.id, 'isLoading']), true, state)
    case FUNDINGS.DELETE.RECEIVE:
      return { ...state, data: dissoc(action.meta.id, state.data) }
    case FUNDINGS.DELETE.ERROR:
      return set(lensPath(['data', action.meta.id, 'isLoading']), true, state)

    case GRANTS.DELETE.RECEIVE: {
      /*
       * Deleting a grant deletes associated fundings
       */
       
      const fundings = Object.values(state.data)
      const deletedFundingsID =
        new Set(fundings
          .filter(f => f.data.fromGrantID === action.meta.id || f.data.toGrantID === action.meta.id)
          .map(f => f.id))

      const newData = {}
      fundings.forEach(f => {
        if (!deletedFundingsID.has(f.data.id)) {
          newData[f.data.id] = f
        }
      })

      return { ...state, data: newData }
    }

    default:
      return state
  }
}
