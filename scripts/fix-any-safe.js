/**
 * fix-any-safe.js
 * Reemplaza patrones seguros de 'any' con tipos más estrictos
 */

const fs = require('fs')
const d = require('../eslint-output.json')

const filesWithAny = d
  .filter(f => f.messages.some(m => m.ruleId === '@typescript-eslint/no-explicit-any'))
  .map(f => f.filePath)

console.log('Files with any:', filesWithAny.length)

let fixed = 0

for (const filePath of filesWithAny) {
  let content = fs.readFileSync(filePath, 'utf8')
  const original = content

  // Safe 1: Record<string, any> → Record<string, unknown>
  content = content.replace(/Record<string,\s*any>/g, 'Record<string, unknown>')

  // Safe 2: Array<any> → Array<unknown>
  content = content.replace(/Array<any>/g, 'Array<unknown>')

  // Safe 3: any[] in type positions (be conservative - only in clear type annotation contexts)
  // Only replace patterns like ': any[]' ') => any[]' '| any[]' or '> | any'
  content = content.replace(/:\s*any\[\]/g, ': unknown[]')
  content = content.replace(/=>\s*any\[\]/g, '=> unknown[]')

  // Safe 4: Promise<any> → Promise<unknown>
  content = content.replace(/Promise<any>/g, 'Promise<unknown>')

  // Safe 5: catch (e: any) → catch (e: unknown)
  content = content.replace(/catch\s*\(\s*(\w+)\s*:\s*any\s*\)/g, 'catch ($1: unknown)')

  // Safe 6: metadata?: any → metadata?: unknown (common pattern in this codebase)
  content = content.replace(/metadata\?:\s*any\b/g, 'metadata?: unknown')

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8')
    fixed++
  }
}

console.log(`Fixed: ${fixed}`)
