/*
 * key-event.js
 */


export function isControl(event) {
  return (
    event.code.startsWith('Control')
    || event.key === 'Control'
    || event.which === 17 /* Control */
    || event.which === 20 /* CapsLock */
  )
}

export function isAlt(event) {
  return (
    event.code.startsWith('Alt')
    || event.key === 'Alt'
    || event.which === 18 /* Alt */
  )
}

export function isShift(event) {
  return (
       event.code.startsWith('Shift')
    || event.key === 'Shift'
    || event.which === 16 /* Shift */
  )
}

export function isEscape(event) {
  return (
       event.code === 'Escape'
    || event.key === 'Escape'
    || event.which === 27 /* Escape */
  )
}

