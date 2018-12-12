/*
 * to-loadable.js
 */


export default function toLoadable(object) {
  if (Array.isArray(object)) {
    return object.map(data => ({ isLoading: false, data }))
  }

  const result = {}
  Object.keys(object).forEach(key => {
    result[key] = { isLoading: false, data: object[key] }
  })
  return result
}

export function fromLoadable(object) {
  if (Array.isArray(object)) {
    return object.map(v => v.data)
  }

  const result = {}
  Object.keys(object).forEach(key => {
    result[key] = object[key].data
  })
  return result
}
