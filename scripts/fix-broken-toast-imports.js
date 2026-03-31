/**
 * fix-broken-toast-imports.js
 * Repara casos donde fix-no-alert.js insertó 'import { toast } from sonner'
 * en el medio de un import multi-línea.
 *
 * El patrón roto es:
 *   import {
 *   import { toast } from 'sonner'
 *       someIdentifier,
 *   } from '...'
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// Use git to find modified files
const status = execSync('git diff --name-only HEAD', { encoding: 'utf8' })
const modifiedFiles = status
  .split('\n')
  .filter(f => f.match(/\.(ts|tsx)$/))
  .map(f => path.join('D:\\constructoraRyRapp\\constructoraRyRapp', f))

console.log('Modified files to check:', modifiedFiles.length)

let fixed = 0
const TOAST_IMPORT = "import { toast } from 'sonner'"

for (const filePath of modifiedFiles) {
  if (!fs.existsSync(filePath)) continue
  let content = fs.readFileSync(filePath, 'utf8')
  const original = content

  // Detect the broken pattern:
  // A toast import inserted right after "import {" (multi-line import start)
  // Pattern: line is "import {" and next line is the toast import

  // Fix: move toast import to after all imports are complete
  // Strategy: remove the misplaced import, then add it back at the right spot

  // Broken pattern 1: insert after a multi-line opening
  // "import {\n" + TOAST_IMPORT + "\n    something,"
  if (content.includes('\n' + TOAST_IMPORT + '\n') || content.includes(TOAST_IMPORT + '\n')) {
    // Count how many TOAST_IMPORTs there are
    const occurrences = (content.match(new RegExp(TOAST_IMPORT.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length

    // Check if the toast import is in a correct position (standalone line between import groups)
    // A "correct" position is: the previous non-empty line ends the import (ends with ';' or similar)
    // and the next non-empty line is also an import
    const lines = content.split('\n')
    const toastLineIdx = lines.findIndex(l => l.trim() === TOAST_IMPORT || l === TOAST_IMPORT)

    if (toastLineIdx > 0) {
      const prevLine = lines[toastLineIdx - 1].trim()
      const nextLine = lines[toastLineIdx + 1]?.trim() || ''

      // Check if it's inside a multi-line import (previous line doesn't end with ; or })
      const isBroken = !prevLine.endsWith("'") && !prevLine.endsWith('"') &&
                       !prevLine.endsWith(';') && prevLine !== '' &&
                       !prevLine.startsWith('//') && !prevLine.startsWith('import ')

      if (isBroken) {
        // Remove the misplaced toast import
        lines.splice(toastLineIdx, 1)
        content = lines.join('\n')

        // Now find if toast was already present elsewhere
        const hasToastAlready =
          content.includes("from 'sonner'") || content.includes('from "sonner"')

        if (!hasToastAlready) {
          // Re-insert at correct position: after all imports
          const newLines = content.split('\n')
          let lastImportIdx = 0
          let inMultiLineImport = false

          for (let i = 0; i < newLines.length; i++) {
            const line = newLines[i]
            if (line.startsWith('import ')) {
              inMultiLineImport = !line.includes(' from ')
              lastImportIdx = i
            } else if (inMultiLineImport) {
              if (line.includes(' from ')) {
                inMultiLineImport = false
                lastImportIdx = i
              }
            }
            // Stop looking after we've passed all imports
            if (!inMultiLineImport && lastImportIdx > 0 && i > lastImportIdx + 2 && !line.startsWith('import ')) {
              break
            }
          }

          newLines.splice(lastImportIdx + 1, 0, TOAST_IMPORT)
          content = newLines.join('\n')
        }

        fixed++
      }
    }
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8')
  }
}

console.log(`Fixed broken toast imports: ${fixed} files`)
