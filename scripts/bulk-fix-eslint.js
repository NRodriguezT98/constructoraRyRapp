/**
 * bulk-fix-eslint.js
 * Script centralizado que aplica todos los fixes en el orden correcto
 *
 * Fixes aplicados:
 * 1. console.* → logger.* (con import correcto)
 * 2. Record<string,any> → Record<string,unknown>
 * 3. Promise<any> → Promise<unknown>
 * 4. catch(e: any) → catch(e: unknown)
 * 5. alert() → toast.info() (con import correcto)
 * 6. Unused vars prefijados con _
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// ============================================================
// UTILITIES
// ============================================================

/**
 * Find the index where the LAST import statement ends in the file.
 * Handles multi-line imports like:
 *   import {
 *     Foo,
 *     Bar,
 *   } from 'module'
 */
function findLastImportEndIndex(lines) {
  let lastEndIdx = -1
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Skip comments and empty lines before imports start
    if (
      line.trim() === '' ||
      line.trim().startsWith('//') ||
      line.trim().startsWith('*') ||
      line.trim().startsWith('/*')
    ) {
      i++
      continue
    }

    // 'use client' / 'use server' directives
    if (line.trim().startsWith("'use ") || line.trim().startsWith('"use ')) {
      i++
      continue
    }

    if (line.trimStart().startsWith('import ')) {
      // Check if it's a single-line import (contains ' from ')
      if (line.includes(' from ') || line.includes('\tfrom ')) {
        lastEndIdx = i
        i++
      } else if (line.includes('{')) {
        // Multi-line import — find closing '} from'
        let j = i
        while (j < lines.length) {
          if (lines[j].includes('} from ') || lines[j].includes('} from\t')) {
            lastEndIdx = j
            i = j + 1
            break
          }
          j++
          if (j - i > 50) {
            i++
            break
          } // Safety: max 50 lines for an import
        }
      } else {
        // `import 'side-effect'` style
        lastEndIdx = i
        i++
      }
    } else {
      // First non-import line (excluding directives) after imports have started
      if (lastEndIdx >= 0) break
      i++
    }
  }

  return lastEndIdx
}

/**
 * Insert a line after the last import statement
 */
function insertAfterLastImport(content, newLine) {
  const lines = content.split('\n')
  const lastIdx = findLastImportEndIndex(lines)

  if (lastIdx < 0) {
    // No imports found - insert at top
    lines.unshift(newLine)
  } else {
    lines.splice(lastIdx + 1, 0, newLine)
  }

  return lines.join('\n')
}

// ============================================================
// GET MODIFIED FILES FROM ESLINT OUTPUT
// ============================================================

const eslintData = require('../eslint-output.json')

function getFilesWith(ruleId) {
  return eslintData
    .filter(f => f.messages.some(m => m.ruleId === ruleId))
    .map(f => f.filePath)
}

// ============================================================
// FIX 1: console.* → logger.*
// ============================================================

console.log('\n=== Fix 1: console.* → logger.* ===')
const LOGGER_IMPORT = "import { logger } from '@/lib/utils/logger'"

const consoleFiles = eslintData
  .filter(f =>
    f.messages.some(
      m => m.ruleId === 'no-console' || m.ruleId === 'no-restricted-syntax'
    )
  )
  .map(f => f.filePath)

console.log('Files:', consoleFiles.length)
let fixed1 = 0

for (const filePath of consoleFiles) {
  let content = fs.readFileSync(filePath, 'utf8')
  const original = content

  if (content.includes('eslint-disable no-console')) continue

  content = content.replace(/console\.error\(/g, 'logger.error(')
  content = content.replace(/console\.warn\(/g, 'logger.warn(')
  content = content.replace(/console\.info\(/g, 'logger.info(')
  content = content.replace(/console\.debug\(/g, 'logger.debug(')
  content = content.replace(/console\.log\(/g, 'logger.info(')

  if (content === original) continue

  const hasLogger =
    content.includes("from '@/lib/utils/logger'") ||
    content.includes('from "@/lib/utils/logger"')
  if (!hasLogger) {
    content = insertAfterLastImport(content, LOGGER_IMPORT)
  }

  fs.writeFileSync(filePath, content, 'utf8')
  fixed1++
}
console.log('Fixed:', fixed1)

// ============================================================
// FIX 2: Safe 'any' replacements
// ============================================================

console.log('\n=== Fix 2: Safe any replacements ===')
const anyFiles = getFilesWith('@typescript-eslint/no-explicit-any')
console.log('Files:', anyFiles.length)
let fixed2 = 0

for (const filePath of anyFiles) {
  let content = fs.readFileSync(filePath, 'utf8')
  const original = content

  content = content.replace(/Record<string,\s*any>/g, 'Record<string, unknown>')
  content = content.replace(/Array<any>/g, 'Array<unknown>')
  content = content.replace(/Promise<any>/g, 'Promise<unknown>')
  content = content.replace(
    /catch\s*\(\s*(\w+)\s*:\s*any\s*\)/g,
    'catch ($1: unknown)'
  )

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8')
    fixed2++
  }
}
console.log('Fixed:', fixed2)

// ============================================================
// FIX 3: alert() → toast.info()
// ============================================================

console.log('\n=== Fix 3: alert() → toast.info() ===')
const TOAST_IMPORT = "import { toast } from 'sonner'"
const alertFiles = getFilesWith('no-alert')
console.log('Files:', alertFiles.length)
let fixed3 = 0

for (const filePath of alertFiles) {
  let content = fs.readFileSync(filePath, 'utf8')
  const original = content

  // Only replace simple alert() calls (not confirm/prompt which are more complex)
  content = content.replace(/\bwindow\.alert\s*\(/g, 'toast.info(')
  content = content.replace(
    /\balert\s*\((?!.*confirm|.*prompt)/g,
    'toast.info('
  )

  if (content === original) continue

  const hasToast =
    content.includes("from 'sonner'") || content.includes('from "sonner"')
  if (!hasToast) {
    content = insertAfterLastImport(content, TOAST_IMPORT)
  }

  fs.writeFileSync(filePath, content, 'utf8')
  fixed3++
}
console.log('Fixed:', fixed3)

// ============================================================
// FIX 4: no-restricted-imports (deep relative → @/ aliases)
// ============================================================

console.log('\n=== Fix 4: Deep relative imports → @/ aliases ===')
const restrictedFiles = getFilesWith('no-restricted-imports')
console.log('Files:', restrictedFiles.length)
let fixed4 = 0

// Known patterns for deep relative imports
const relativeReplacements = [
  {
    from: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/shared\/hooks['"]/g,
    to: "from '@/shared/hooks'",
  },
  {
    from: /from ['"]\.\.\/\.\.\/\.\.\/shared\/hooks['"]/g,
    to: "from '@/shared/hooks'",
  },
  {
    from: /from ['"]\.\.\/\.\.\/shared\/hooks['"]/g,
    to: "from '@/shared/hooks'",
  },
  {
    from: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/shared\/components/g,
    to: "from '@/shared/components",
  },
  {
    from: /from ['"]\.\.\/\.\.\/\.\.\/shared\/components/g,
    to: "from '@/shared/components",
  },
  {
    from: /from ['"]\.\.\/\.\.\/shared\/components/g,
    to: "from '@/shared/components",
  },
  { from: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/lib\//g, to: "from '@/lib/" },
  { from: /from ['"]\.\.\/\.\.\/\.\.\/lib\//g, to: "from '@/lib/" },
  { from: /from ['"]\.\.\/\.\.\/lib\//g, to: "from '@/lib/" },
]

for (const filePath of restrictedFiles) {
  let content = fs.readFileSync(filePath, 'utf8')
  const original = content

  for (const { from, to } of relativeReplacements) {
    content = content.replace(from, to)
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8')
    fixed4++
  }
}
console.log('Fixed:', fixed4)

// ============================================================
// FIX 5: Unused variables (prefix with _)
// ============================================================

console.log('\n=== Fix 5: Unused vars prefix with _ ===')
const unusedVarFiles = eslintData
  .filter(f =>
    f.messages.some(m => m.ruleId === '@typescript-eslint/no-unused-vars')
  )
  .map(f => ({
    filePath: f.filePath,
    errors: f.messages
      .filter(m => m.ruleId === '@typescript-eslint/no-unused-vars')
      .sort((a, b) => b.line - a.line || b.column - a.column), // Process in reverse order
  }))

console.log('Files:', unusedVarFiles.length)
let totalFixed5 = 0

for (const { filePath, errors } of unusedVarFiles) {
  let lines = fs.readFileSync(filePath, 'utf8').split('\n')
  let changed = false

  for (const err of errors) {
    const lineIdx = err.line - 1
    const line = lines[lineIdx]
    if (!line) continue

    const nameMatch = err.message.match(
      /'(\w+)' is (?:defined|assigned a value) but never used/
    )
    if (!nameMatch) continue

    const varName = nameMatch[1]
    if (varName.startsWith('_')) continue

    const colIdx = err.column - 1
    const before = line.substring(0, colIdx)
    const after = line.substring(colIdx)

    if (!after.startsWith(varName)) continue

    const trimBefore = before.trimEnd()
    const afterVar = after.substring(varName.length)

    // Safe patterns only
    const isDestructured = /[{,(]\s*$/.test(trimBefore)
    const isDeclaration = /\b(?:const|let|var)\s+$/.test(trimBefore)
    const isTypeParam = /<\s*$/.test(trimBefore)
    const isArrowParam = /=>\s*$/.test(trimBefore) || /\(\s*$/.test(trimBefore)

    if ((isDestructured || isDeclaration) && /^[\s:,)}\]=<]/.test(afterVar)) {
      lines[lineIdx] = before + '_' + after
      changed = true
      totalFixed5++
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8')
  }
}
console.log('Fixed:', totalFixed5, 'unused vars')

console.log('\n=== Done! ===')
