import {
  get,
  set,
  over,
  lensPath,
  indexBy,
  prop,
  whereEq,
  assoc,
  dissoc
} from 'ramda'
import * as L from 'partial.lenses/dist/partial.lenses.min.js'

import Status from '../constants/status'
import { SAMPLES } from '../constants/ActionTypes'
import toLoadable from '../utils/to-loadable'

const initialState = {
  isLoading: false,
  isCreating: false,
  data: {}
}

export default function samples(state = initialState, action) {
  switch (action.type) {

    case SAMPLES.FETCH.REQUEST:
      return { ...state, isLoading: true }
    case SAMPLES.FETCH.RECEIVE:
      return { ...state, isLoading: false, data: toLoadable(indexBy(prop('id'), action.payload)) }
    case SAMPLES.FETCH.ERROR:
      return { ...state, isLoading: false }

    case SAMPLES.CREATE.REQUEST:
      return { ...state, isCreating: true }
    case SAMPLES.CREATE.RECEIVE:
      return { ...state, isCreating: false, data:
        assoc(action.payload.id, { isLoading: false, data: action.payload }, state.data) }
    case SAMPLES.CREATE.ERROR:
      return { ...state, isCreating: false }

    case SAMPLES.UPDATE.REQUEST:
      return set(lensPath(['data', action.payload.id, 'isLoading']), true, state)
    case SAMPLES.UPDATE.RECEIVE:
      return set(lensPath(['data', action.meta.id]), { isLoading: false, data: action.payload }, state)
    case SAMPLES.UPDATE.ERROR:
      return set(lensPath(['data', action.meta.id, 'isLoading']), false, state)

    case SAMPLES.UPDATE_STEP_STATUS.REQUEST: {
      const sample = state.data[action.payload.id].data
      const steps = [ ...sample.steps ]
      const step = steps[action.payload.index]
      steps[action.payload.index] = {
        ...step,
        status: {
          isLoading: true,
          previousValue: step.status,
          nextValue: action.payload.value,
        }
      }
      return set(lensPath(['data', action.payload.id]), { isLoading: true, data: { ...sample, steps } }, state)
    }
    case SAMPLES.UPDATE_STEP_STATUS.RECEIVE: {
      return set(lensPath(['data', action.meta.id]), { isLoading: false, data: action.payload }, state)
    }
    case SAMPLES.UPDATE_STEP_STATUS.ERROR: {
      const sample = state.data[action.meta.id].data
      const steps = [ ...sample.steps ]
      const step = steps[action.meta.index]
      steps[action.meta.index] = { ...step, status: step.status.previousValue }
      return set(lensPath(['data', action.meta.id]), { isLoading: false, data: { ...sample, steps } }, state)
    }

    case SAMPLES.ADD_FILE.REQUEST: {
      const sample = state.data[action.payload.id].data
      const steps = [ ...sample.steps ]
      const step = steps[action.payload.index]
      steps[action.payload.index] = {
        ...step,
        files: step.files.concat({
          isLoading: true,
          id: action.payload.file.name,
          name: action.payload.file.name,
          mime: action.payload.file.type
        })
      }
      return set(lensPath(['data', action.payload.id]), { isLoading: true, data: { ...sample, steps } }, state)
    }
    case SAMPLES.ADD_FILE.RECEIVE: {
      const newState = set(lensPath(['data', action.meta.id, 'isLoading']), false, state)
      return over(
        lensPath(['data', action.meta.id, 'data', 'steps', action.meta.index, 'files']),
        (files) => L.modify(
          L.find(whereEq({ id: action.meta.file.name })),
          (file) => action.payload,
          files
        ),
        newState
      )
    }
    case SAMPLES.ADD_FILE.ERROR: {
      const newState = set(lensPath(['data', action.meta.id, 'isLoading']), false, state)
      return over(
        lensPath(['data', action.meta.id, 'data', 'steps', action.meta.index, 'files']),
        (files) => L.modify(
          L.find(whereEq({ id: action.meta.file.name })),
          (file) => ({ ...file, isLoading: false, hasError: true }),
          files
        ),
        newState
      )
    }

    case SAMPLES.DELETE_FILE.REQUEST: {
      const newState = set(lensPath(['data', action.payload.id, 'isLoading']), true, state)
      return over(
        lensPath(['data', action.payload.id, 'data', 'steps', action.payload.index, 'files']),
        (files) => L.modify(
          L.find(whereEq({ id: action.payload.fileId })),
          (file) => ({ ...file, isLoading: true }),
          files
        ),
        newState
      )
    }
    case SAMPLES.DELETE_FILE.RECEIVE: {
      const newState = set(lensPath(['data', action.meta.id, 'isLoading']), false, state)
      return over(
        lensPath(['data', action.meta.id, 'data', 'steps', action.meta.index, 'files']),
        (files) => files.filter(f => f.id !== action.meta.fileId),
        newState
      )
    }
    case SAMPLES.DELETE_FILE.ERROR: {
      const newState = set(lensPath(['data', action.meta.id, 'isLoading']), false, state)
      return over(
        lensPath(['data', action.meta.id, 'data', 'steps', action.meta.index, 'files']),
        (files) => L.modify(
          L.find(whereEq({ id: action.meta.fileId })),
          (file) => ({ ...file, isLoading: false, hasError: true }),
          files
        ),
        newState
      )
    }

    case SAMPLES.DELETE.REQUEST:
      return set(lensPath(['data', action.payload.id, 'isLoading']), true, state)
    case SAMPLES.DELETE.RECEIVE:
      return { ...state, data: dissoc(action.meta.id, state.data) }
    case SAMPLES.DELETE.ERROR:
      return set(lensPath(['data', action.meta.id, 'isLoading']), false, state)

    default:
      return state
  }
}
