import { combineReducers } from 'redux'

import settings from './settings.js'
import users from './users.js'
import applicants from './applicants.js'
import grants from './grants.js'
import fundings from './fundings.js'
import categories from './categories.js'

const rootReducer = combineReducers({
  settings,
  users,
  applicants,
  grants,
  fundings,
  categories,
})

export default rootReducer
