import { HISTORY } from '../constants/ActionTypes'

const initialState = {
  isLoading: false,
  range: { start: undefined, end: undefined },
  data: []
}

export default function users(state = initialState, action) {
  switch (action.type) {

    case HISTORY.FETCH.REQUEST:
      return { ...state, isLoading: true, range: action.payload }
    case HISTORY.FETCH.RECEIVE:
      return { ...state, isLoading: false, data: action.payload }
    case HISTORY.FETCH.ERROR:
      return { ...state, isLoading: false }

    default:
      return state
  }
}
