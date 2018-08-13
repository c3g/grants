import { SETTINGS } from '../constants/ActionTypes'

import { createFetchActions } from '../utils/create-actions'
import * as requests from '../requests'

const settings = {
  fetch:  createFetchActions(SETTINGS.FETCH,  requests.settings.list),
  update: createFetchActions(SETTINGS.UPDATE, requests.settings.update,
    (key, value) => ({ key, value }),
    (res, key, value) => ({ key, value }),
    (err, key, value) => ({ key, value })),
}

export default settings
