import { APPLICANTS } from '../constants/ActionTypes'

import { createFetchActions } from '../helpers/create-actions'
import * as requests from '../requests'

const applicants = {
  fetch:  createFetchActions(APPLICANTS.FETCH,  requests.applicants.list),
  update: createFetchActions(APPLICANTS.UPDATE, requests.applicants.update,
    (id, data) => ({ id, data }),
    (res, id, data) => ({ id, data }),
    (err, id, data) => ({ id, data })),
  create: createFetchActions(APPLICANTS.CREATE, requests.applicants.create,
    (data) => ({ data }),
    (res, data) => ({ data }),
    (err, data) => ({ data })),
  delete: createFetchActions(APPLICANTS.DELETE, requests.applicants.delete,
    (id) => ({ id }),
    (res, id) => ({ id }),
    (err, id) => ({ id })),
}
export default applicants
