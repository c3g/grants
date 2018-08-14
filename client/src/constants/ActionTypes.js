import {
  createModelConstants,
  createNetworkConstants,
  createConstants
} from '../utils/create-actions.js'

// UI
export const UI = createConstants('UI', [
  'SHOW_FAQ',
  'CLOSE_FAQ',
  'ADD_FILTERING_CATEGORY',
  'DELETE_FILTERING_CATEGORY',
  'SET_FILTERING_CATEGORIES',
])

export const LOGGED_IN = createNetworkConstants('LOGGED_IN')
// Notifications
export const SHOW_NOTIFICATION = 'SHOW_NOTIFICATION'
export const SHOW = {
  INFO:    'SHOW.INFO',
  SUCCESS: 'SHOW.SUCCESS',
  WARNING: 'SHOW.WARNING',
  ERROR:   'SHOW.ERROR',
}
export const SETTINGS   = createModelConstants('SETTINGS')
export const USERS      = createModelConstants('USERS')
export const APPLICANTS = createModelConstants('APPLICANTS')
export const GRANTS     = createModelConstants('GRANTS')
export const FUNDINGS   = createModelConstants('FUNDINGS')
export const CATEGORIES = createModelConstants('CATEGORIES')
