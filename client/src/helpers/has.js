/*
 * has.js
 */


export default function has(props, name) {
  if (((name in props) && props[name] === undefined) || props[name] === true)
    return true
  return false
}
