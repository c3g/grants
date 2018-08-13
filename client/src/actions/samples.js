import { SAMPLES } from '../constants/ActionTypes'

import { createFetchActions } from '../utils/create-actions'
import * as requests from '../requests'
import ui from './ui'

const samples = {
  fetch:  createFetchActions(SAMPLES.FETCH,  requests.samples.list, {
    fnMap: ({ ui: { includeArchived } }) => [includeArchived]
  }),
  update: createFetchActions(SAMPLES.UPDATE, requests.samples.update,
    (id, data) => ({ id, data }),
    (res, id, data) => ({ id, data }),
    (err, id, data) => ({ id, data })),
  updateStepStatus: createFetchActions(SAMPLES.UPDATE_STEP_STATUS, requests.samples.updateStepStatus,
    (id, index, value) => ({ id, index, value }),
    (res, id, index, value) => ({ id, index, value }),
    (err, id, index, value) => ({ id, index, value })),
  addFile: createFetchActions(SAMPLES.ADD_FILE, requests.files.create,
    (sampleId, stepIndex, file) => ({ id: sampleId, index: stepIndex, file }),
    (res, sampleId, stepIndex, file) => ({ id: sampleId, index: stepIndex, file }),
    (err, sampleId, stepIndex, file) => ({ id: sampleId, index: stepIndex, file })),
  deleteFile: createFetchActions(SAMPLES.DELETE_FILE, requests.files.delete,
    (sampleId, stepIndex, fileId) => ({ id: sampleId, index: stepIndex, fileId }),
    (res, sampleId, stepIndex, fileId) => ({ id: sampleId, index: stepIndex, fileId }),
    (err, sampleId, stepIndex, fileId) => ({ id: sampleId, index: stepIndex, fileId })),
  create: createFetchActions(SAMPLES.CREATE, requests.samples.create,
    (data) => ({ data }),
    (res, data) => ({ id: res.id, data: res }),
    (err, data) => ({ data })),
  delete: createFetchActions(SAMPLES.DELETE, requests.samples.delete,
    (id) => ({ id }),
    (res, id) => ({ id }),
    (err, id) => ({ id })),

  updateSelectedStepsStatus: (status) => {
    return (dispatch, getState) => {
      const { ui: { selectedSteps } } = getState()

      selectedSteps.forEach(step => {
        const [sampleId, stepIndex] = step.split(':')

        dispatch(samples.updateStepStatus(sampleId, stepIndex, status))
      })

      dispatch(ui.closeStepContextMenu())
    }
  },
}

export default samples
