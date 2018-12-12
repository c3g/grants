/*
 * object-map.js
 */

export default function objectMap(object, fn) {
  const result = {}
  Object.keys(object).forEach(key => {
    result[key] = fn(object[key], key)
  })
  return result
}
