/*
 * alphabetical-sort.js
 */


export default function alphabeticalSort(list, selector = x => x) {
  return list.sort((a, b) => selector(a).localeCompare(selector(b)))
}
