/*
 * time.js
 */

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
