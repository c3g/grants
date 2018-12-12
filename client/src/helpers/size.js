/*
 * size.js
 */


export default function size(value) {
  if (typeof value === 'number')
    return value + 'px'
  if (typeof value === 'string')
    return value
  return undefined
}

