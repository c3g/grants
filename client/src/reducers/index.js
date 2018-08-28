import { combineReducers } from 'redux'

import ui from './ui.js'
import settings from './settings.js'
import users from './users.js'
import applicants from './applicants.js'
import grants from './grants.js'
import fundings from './fundings.js'
import categories from './categories.js'
import history from './history.js'

const rootReducer = combineReducers({
  ui,
  settings,
  users,
  applicants,
  grants,
  fundings,
  categories,
  history,
})

export default rootReducer
