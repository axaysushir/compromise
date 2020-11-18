// interpret 'this halloween' or 'next june'
const parseRelative = function (doc) {
  // avoid parsing 'last month of 2019'
  if (doc.has('^(this|current|next|upcoming|last|previous) #DateUnit')) {
    return null
  }

  let rel = null
  if (doc.has('^this? (next|upcoming)')) {
    rel = 'next'
  }
  if (doc.has('^this? (last|previous)')) {
    rel = 'last'
  }
  if (doc.has('^(this|current)')) {
    rel = 'this'
  }
  // finally, remove it from our text
  doc.remove('^(this|current|next|upcoming|last|previous)')

  return rel
}
module.exports = parseRelative
