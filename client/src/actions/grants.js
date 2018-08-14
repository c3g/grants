import { GRANTS } from '../constants/ActionTypes'

import { createFetchActions } from '../utils/create-actions'
import * as requests from '../requests'

const grants = {
  fetch:  createFetchActions(GRANTS.FETCH,  requests.grants.list),
  update: createFetchActions(GRANTS.UPDATE, requests.grants.update,
    (id, data) => ({ id, data }),
    (res, id, data) => ({ id, data }),
    (err, id, data) => ({ id, data })),
  create: createFetchActions(GRANTS.CREATE, requests.grants.create,
    (data) => ({ data }),
    (res, data) => ({ data }),
    (err, data) => ({ data })),
  delete: createFetchActions(GRANTS.DELETE, requests.grants.delete,
    (id) => ({ id }),
    (res, id) => ({ id }),
    (err, id) => ({ id })),
}
export default grants
