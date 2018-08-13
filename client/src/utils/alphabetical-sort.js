/*
 * alphabetical-sort.js
 */


export default function alphabeticalSort(list) {
  return list.sort((a, b) => a.localeCompare(b))
}
