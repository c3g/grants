/*
 * date.js
 */


const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function asTime(date) {
  return date.getHours() + ':' + date.getMinutes().toString().padStart(2, '0')
}

function asWeekDay(date) {
  return weekDays[date.getDay()]
}

function asDate(date) {
  const day = date.getDate()
  const month = date.toLocaleDateString('en-US', { month: 'short' })
  return month + ' ' + day
}

function isToday(date) {
  return date.toDateString() === new Date().toDateString()
}

function isYesterday(date) {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return date.toDateString() === yesterday.toDateString()
}

function isTomorrow(date) {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() + 1)
  return date.toDateString() === yesterday.toDateString()
}

function isThisWeek(date) {
  const fourDaysAgo = new Date()
  fourDaysAgo.setDate(fourDaysAgo.getDate() - 4)
  const fourDays = new Date()
  fourDays.setDate(fourDays.getDate() + 4)
  return (date > fourDaysAgo && date < fourDays)
}

function isThisYear(date) {
  return date.getFullYear() === new Date().getFullYear()
}

export default function humanReadableTime(date, empty = '') {
  if (date === null)
    return empty

  if (!(date instanceof Date))
    date = new Date(date)

  if (isToday(date))
    return asTime(date)

  if (isYesterday(date))
    return 'Yesterday at ' + asTime(date)

  if (isTomorrow(date))
    return 'Tomorrow at ' + asTime(date)

  if (isThisWeek(date))
    return asWeekDay(date) + ' at ' + asTime(date)

  if (isThisYear(date))
    return asDate(date)

  return asDate(date) + ' ' + date.getFullYear()
}

export function humanDetailedTime(date, empty = '') {
  if (date === null)
    return empty

  if (!(date instanceof Date))
    date = new Date(date)

  return asDate(date) + ' ' + date.getFullYear() + ' at ' + asTime(date)
}
