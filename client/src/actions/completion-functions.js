import { COMPLETION_FUNCTIONS } from '../constants/ActionTypes'

import { createFetchActions } from '../utils/create-actions'
import * as requests from '../requests'

const completionFunctions = {
  fetch:  createFetchActions(COMPLETION_FUNCTIONS.FETCH,  requests.completionFunctions.list),
  update: createFetchActions(COMPLETION_FUNCTIONS.UPDATE, requests.completionFunctions.update,
    (id, data) => ({ id, data }),
    (res, id, data) => ({ id, data }),
    (err, id, data) => ({ id, data })),
  create: createFetchActions(COMPLETION_FUNCTIONS.CREATE, requests.completionFunctions.create,
    (data) => ({ data }),
    (res, data) => ({ data }),
    (err, data) => ({ data })),
  delete: createFetchActions(COMPLETION_FUNCTIONS.DELETE, requests.completionFunctions.delete,
    (id) => ({ id }),
    (res, id) => ({ id }),
    (err, id) => ({ id })),
}
export default completionFunctions
