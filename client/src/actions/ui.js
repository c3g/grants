import { UI } from '../constants/ActionTypes'
import { createAction } from '../utils/create-actions'


export const addFilteringCategory    = createAction(UI.ADD_FILTERING_CATEGORY)
export const deleteFilteringCategory = createAction(UI.DELETE_FILTERING_CATEGORY)
export const setFilteringCategories   = createAction(UI.SET_FILTERING_CATEGORIES)

export default {
  addFilteringCategory,
  deleteFilteringCategory,
  setFilteringCategories,
}
