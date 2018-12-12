import { FUNDINGS } from '../constants/ActionTypes'

import { createFetchActions } from '../helpers/create-actions'
import * as requests from '../requests'

const fundings = {
  fetch:  createFetchActions(FUNDINGS.FETCH,  requests.fundings.list),
  update: createFetchActions(FUNDINGS.UPDATE, requests.fundings.update,
    (id, data) => ({ id, data }),
    (res, id, data) => ({ id, data }),
    (err, id, data) => ({ id, data })),
  create: createFetchActions(FUNDINGS.CREATE, requests.fundings.create,
    (data) => ({ data }),
    (res, data) => ({ data }),
    (err, data) => ({ data })),
  delete: createFetchActions(FUNDINGS.DELETE, requests.fundings.delete,
    (id) => ({ id }),
    (res, id) => ({ id }),
    (err, id) => ({ id })),
}
export default fundings
