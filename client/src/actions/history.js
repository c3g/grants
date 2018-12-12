import { HISTORY } from '../constants/ActionTypes'

import { createFetchActions } from '../helpers/create-actions'
import * as requests from '../requests'

const history = {
  findByRange: createFetchActions(HISTORY.FETCH, requests.history.findByRange,
    (start, end) => ({ start, end }),
    (res, start, end) => ({ start, end }),
    (err, start, end) => ({ start, end })),
}
export default history
