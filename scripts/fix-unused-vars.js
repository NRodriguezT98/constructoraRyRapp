/**
 * fix-unused-vars.js
 * Prefija con _ las variables/parámetros declarados pero no usados
 * Solo aplica a patrones seguros identificados en el output de ESLint
 */

const fs = require('fs')
const d = require('../eslint-output.json')

const filesWithUnused = d
  .filter(f =>
    f.messages.some(m => m.ruleId === '@typescript-eslint/no-unused-vars')
  )
  .map(f => ({
    filePath: f.filePath,
    errors: f.messages
      .filter(m => m.ruleId === '@typescript-eslint/no-unused-vars')
      .map(m => ({ line: m.line, col: m.column, message: m.message })),
  }))

console.log('Files with unused vars:', filesWithUnused.length)

let totalFixed = 0

for (const { filePath, errors } of filesWithUnused) {
  let lines = fs.readFileSync(filePath, 'utf8').split('\n')
  let changed = false

  // Process in reverse order to avoid line number shifts
  for (const err of [...errors].reverse()) {
    const lineIdx = err.line - 1
    const line = lines[lineIdx]
    if (!line) continue

    // Extract variable name from message like "'varName' is defined but never used"
    const match = err.message.match(/'(\w+)' is defined but never used/)
    if (!match) continue

    const varName = match[1]

    // Skip if already prefixed
    if (varName.startsWith('_')) continue

    // Only replace in safe patterns:
    // 1. Destructured: { varName, → { _varName,  or  { varName } → { _varName }
    // 2. Function params: (varName: → (_varName:  or  , varName) → , _varName)
    // 3. const varName = → const _varName =  (only if it's a declaration)

    const colIdx = err.col - 1

    // Get context around the variable
    const before = line.substring(0, colIdx)
    const after = line.substring(colIdx)

    // Only proceed if the variable name appears at the expected position
    if (!after.startsWith(varName)) continue

    // Check what comes before: destructuring, parameter, or declaration
    const trimBefore = before.trimEnd()

    const isDestructured =
      trimBefore.endsWith('{') ||
      trimBefore.endsWith(',') ||
      trimBefore.endsWith('(')
    const isDeclaration = /(?:const|let|var)\s+$/.test(trimBefore)
    const isParam = /[,(]\s*$/.test(trimBefore) || /^\s*$/.test(trimBefore)

    if (isDestructured || isDeclaration || isParam) {
      // Check what comes after: : , ) } =
      const afterVar = after.substring(varName.length)
      if (/^[\s:,)}\]=]/.test(afterVar) || afterVar.trim() === '') {
        lines[lineIdx] = before + '_' + after
        changed = true
        totalFixed++
      }
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8')
  }
}

console.log(`Fixed: ${totalFixed} unused vars`)
