import { CATEGORIES } from '../constants/ActionTypes'

import { createFetchActions } from '../helpers/create-actions'
import * as requests from '../requests'

const categories = {
  fetch:  createFetchActions(CATEGORIES.FETCH,  requests.categories.list),
  update: createFetchActions(CATEGORIES.UPDATE, requests.categories.update,
    (id, data) => ({ id, data }),
    (res, id, data) => ({ id, data }),
    (err, id, data) => ({ id, data })),
  create: createFetchActions(CATEGORIES.CREATE, requests.categories.create,
    (data) => ({ data }),
    (res, data) => ({ data }),
    (err, data) => ({ data })),
  delete: createFetchActions(CATEGORIES.DELETE, requests.categories.delete,
    (id) => ({ id }),
    (res, id) => ({ id }),
    (err, id) => ({ id })),
}
export default categories
