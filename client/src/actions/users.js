import { USERS } from '../constants/ActionTypes'

import { createFetchActions } from '../helpers/create-actions'
import * as requests from '../requests'

const users = {
  fetch:  createFetchActions(USERS.FETCH,  requests.users.list),
  update: createFetchActions(USERS.UPDATE, requests.users.update,
    (id, data) => ({ id, data }),
    (res, id, data) => ({ id, data }),
    (err, id, data) => ({ id, data })),
  delete: createFetchActions(USERS.DELETE, requests.users.delete,
    (id) => ({ id }),
    (res, id) => ({ id }),
    (err, id) => ({ id })),
}
export default users
