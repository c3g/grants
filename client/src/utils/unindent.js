/*
 * unindent.js
 */


export default function unindent(strings, ...args) {
  let text = ''
  for (let i = 0; i < strings.length; i++) {
    text += strings[i]
    if (i < args.length)
      text += args[i]
  }
  text = text.replace(/^\s+\n/g, '').replace(/\n+$/, '')

  const lines = text.split('\n')
  const minIndent = lines.reduce((min, line) => {
    if (/^\s*$/.test(line))
      return min
    const lineIndent = (line.match(/^\s+/) || [''])[0].length
    return lineIndent < min ? lineIndent : min
  }, Infinity)

  return lines.map(line => line.slice(minIndent)).join('\n')
}

