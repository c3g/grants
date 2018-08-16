/*
 * models.js
 */

import startOfToday from 'date-fns/start_of_today'
import endOfMonth from 'date-fns/end_of_month'

import Status from './constants/status'


export const getNewGrant = (template) => ({
  name:       'New Grant',
  applicants: [],
  categoryID: undefined,
  start:      startOfToday(),
  end:        endOfMonth(),
  status:     Status.SUBMITTED,
  total:      0,
  cofunding:  0,
  fields:     [],
})

export const getNewField = () => ({
  name: 'Field',
  amount: 0,
})

export const getNewFunding = (fromGrantID) => ({
  fromGrantID,
  toGrantID: null,
  amount: null,
})
