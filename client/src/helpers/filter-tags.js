/*
 * filter-tags.js
 */


export default function filterTags(tags, samples) {
  if (tags.length === 0)
    return samples

  return samples.filter(sample =>
    tags.some(tag => sample.data.tags.includes(tag))
  )
}
