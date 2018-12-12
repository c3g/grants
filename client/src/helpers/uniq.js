/*
 * uniq.js
 */

export default function uniq(list) {
  return Array.from(new Set(list))
}
