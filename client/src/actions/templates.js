import { TEMPLATES } from '../constants/ActionTypes'

import { createFetchActions } from '../utils/create-actions'
import * as requests from '../requests'

const templates = {
  fetch:  createFetchActions(TEMPLATES.FETCH,  requests.templates.list),
  update: createFetchActions(TEMPLATES.UPDATE, requests.templates.update,
    (id, data) => ({ id, data }),
    (res, id, data) => ({ id, data }),
    (err, id, data) => ({ id, data })),
  create: createFetchActions(TEMPLATES.CREATE, requests.templates.create,
    (data) => ({ data }),
    (res, data) => ({ data }),
    (err, data) => ({ data })),
  delete: createFetchActions(TEMPLATES.DELETE, requests.templates.delete,
    (id) => ({ id }),
    (res, id) => ({ id }),
    (err, id) => ({ id })),
}
export default templates
