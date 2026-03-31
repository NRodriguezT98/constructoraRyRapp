/**
 * fix-unescaped-entities.js
 * Fix react/no-unescaped-entities by using the exact line/column from ESLint output
 */

const fs = require('fs')

const d = require('../eslint-output.json')

const entityFiles = d.filter(f =>
  f.messages.some(m => m.ruleId === 'react/no-unescaped-entities')
)

console.log('Files:', entityFiles.length)
let totalFixed = 0

for (const fileData of entityFiles) {
  const filePath = fileData.filePath
  const errors = fileData.messages
    .filter(m => m.ruleId === 'react/no-unescaped-entities')
    .sort((a, b) => b.line - a.line || b.column - a.column) // process in reverse

  let lines = fs.readFileSync(filePath, 'utf8').split('\n')
  let changed = false

  for (const err of errors) {
    const lineIdx = err.line - 1
    const colIdx = err.column - 1
    const line = lines[lineIdx]
    if (!line) continue

    const char = line[colIdx]
    if (!char) continue

    let replacement = null
    if (char === '"') replacement = '&quot;'
    else if (char === "'") replacement = '&apos;'
    else if (char === '>') replacement = '&gt;'
    else if (char === '<') replacement = '&lt;'
    else if (char === '{') replacement = '&#123;'
    else if (char === '}') replacement = '&#125;'

    if (!replacement) continue

    // Only replace if it's in JSX text content (not inside JSX attribute or expression)
    // Heuristic: if it's a standalone character in JSX text
    const before = line.substring(0, colIdx)
    const after = line.substring(colIdx + 1)

    lines[lineIdx] = before + replacement + after
    changed = true
    totalFixed++
  }

  if (changed) {
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8')
  }
}

console.log('Fixed:', totalFixed, 'unescaped entities')
