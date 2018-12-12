/*
 * time.js
 */

import { format } from 'date-fns'

export const MINUTES = 1000 * 60
export const HOURS   = MINUTES * 60
export const DAYS    = HOURS * 24
export const WEEKS   = DAYS * 7
export const MONTHS  = DAYS * 30

export function isOlderThan(date, interval) {
  if (date < (new Date() - interval))
    return true
  return false
}

export function formatISO(date) {
  const d = new Date(date)
  if (Number.isNaN(d.getTime()))
    return date
  return format(new Date(+d + d.getTimezoneOffset()*60000), 'YYYY-MM-DD')
}
