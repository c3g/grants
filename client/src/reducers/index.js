import { combineReducers } from 'redux'
import completionFunctions from './completion-functions'
import samples from './samples'
import settings from './settings'
import templates from './templates'
import ui from './ui'
import users from './users'

const rootReducer = combineReducers({
  completionFunctions,
  samples,
  settings,
  templates,
  ui,
  users,
})

export default rootReducer
