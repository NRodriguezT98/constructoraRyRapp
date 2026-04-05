/**
 * Script: fix-console-to-logger.js
 * Reemplaza console.* con logger.* en todos los archivos TS/TSX
 * y agrega el import de logger si no está presente
 */

const fs = require('fs')

const LOGGER_IMPORT = "import { logger } from '@/lib/utils/logger'"

try {
  const d = require('../eslint-output.json')

  // Get files with console.* errors
  const filesWithConsole = d
    .filter(f =>
      f.messages.some(
        m => m.ruleId === 'no-console' || m.ruleId === 'no-restricted-syntax'
      )
    )
    .map(f => f.filePath)

  console.log('Files with console.*:', filesWithConsole.length)

  let fixed = 0
  let skipped = 0

  for (const filePath of filesWithConsole) {
    let content = fs.readFileSync(filePath, 'utf8')
    const original = content

    // Skip infrastructure files that legitimately need console (logger.ts itself, etc.)
    if (content.includes('eslint-disable no-console')) {
      skipped++
      continue
    }

    // Replace console methods → logger equivalents
    content = content.replace(/console\.error\(/g, 'logger.error(')
    content = content.replace(/console\.warn\(/g, 'logger.warn(')
    content = content.replace(/console\.info\(/g, 'logger.info(')
    content = content.replace(/console\.debug\(/g, 'logger.debug(')
    content = content.replace(/console\.log\(/g, 'logger.info(')

    if (content === original) {
      skipped++
      continue
    }

    // Add logger import if not already present
    const hasLoggerImport =
      content.includes("from '@/lib/utils/logger'") ||
      content.includes('from "@/lib/utils/logger"')

    if (!hasLoggerImport) {
      const lines = content.split('\n')
      // Find the last import line in the first import block
      let insertIdx = 0
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('import ')) {
          insertIdx = i
        } else if (
          insertIdx > 0 &&
          !lines[i].startsWith('import ') &&
          lines[i].trim() !== ''
        ) {
          break
        }
      }
      lines.splice(insertIdx + 1, 0, LOGGER_IMPORT)
      content = lines.join('\n')
    }

    fs.writeFileSync(filePath, content, 'utf8')
    fixed++
  }

  console.log(`Fixed: ${fixed} | Skipped: ${skipped}`)
} catch (err) {
  console.error('Error:', err.message)
  process.exit(1)
}
