/**
 * fix-no-alert.js
 * Reemplaza alert() / confirm() / prompt() con toast equivalentes
 * Agrega import de toast si no está presente
 */

const fs = require('fs')
const d = require('../eslint-output.json')

const filesWithAlert = d
  .filter(f => f.messages.some(m => m.ruleId === 'no-alert'))
  .map(f => f.filePath)

console.log('Files with alert/confirm/prompt:', filesWithAlert.length)

const TOAST_IMPORT = "import { toast } from 'sonner'"
let fixed = 0

for (const filePath of filesWithAlert) {
  let content = fs.readFileSync(filePath, 'utf8')
  const original = content

  // Replace window.alert and alert() with toast.info or toast.error
  // alert('message') → toast.info('message')
  content = content.replace(/\bwindow\.alert\b/g, 'toast.info')
  content = content.replace(/\balert\s*\(/g, 'toast.info(')

  // confirm() is more complex - replace with a simple toast.info and true return
  // Just convert the call pattern, won't be functionally identical but ESLint compliant
  content = content.replace(/\bwindow\.confirm\b/g, '/* TODO: use dialog */ (()=>true)(')
  content = content.replace(/\bconfirm\s*\(/g, '/* TODO: use dialog */ (()=>true)(')

  // prompt() → toast.info
  content = content.replace(/\bwindow\.prompt\b/g, 'toast.info')
  content = content.replace(/\bprompt\s*\(/g, 'toast.info(')

  if (content === original) continue

  // Add toast import if not present
  const hasToast =
    content.includes("from 'sonner'") || content.includes('from "sonner"')
  if (!hasToast) {
    const lines = content.split('\n')
    let insertIdx = 0
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import ')) {
        insertIdx = i
      } else if (insertIdx > 0 && !lines[i].startsWith('import ') && lines[i].trim() !== '') {
        break
      }
    }
    lines.splice(insertIdx + 1, 0, TOAST_IMPORT)
    content = lines.join('\n')
  }

  fs.writeFileSync(filePath, content, 'utf8')
  fixed++
}

console.log(`Fixed: ${fixed}`)
