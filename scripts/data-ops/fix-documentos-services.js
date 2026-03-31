/**
 * Fix SelectQueryError issues in documentos services.
 * Strategy:
 * 1. Add .returns<any>() before .single() in dynamic table query chains
 * 2. Fix array query element access patterns
 * 3. Fix scope/type issues in reemplazo and base services
 */

const fs = require('fs')
const path = require('path')

const BASE = path.join('d:', 'constructoraRyRapp', 'constructoraRyRapp', 'src', 'modules', 'documentos', 'services')

function readFile(filename) {
  return fs.readFileSync(path.join(BASE, filename), 'utf8')
}

function writeFile(filename, content) {
  fs.writeFileSync(path.join(BASE, filename), content, 'utf8')
}

function replaceAll(content, from, to) {
  if (!content.includes(from)) {
    console.log(`  ⚠  Not found: ${from.substring(0, 60).replace(/\n/g, '\\n')}`)
    return content
  }
  const count = content.split(from).length - 1
  console.log(`  ✅ Found (${count}x): ${from.substring(0, 60).replace(/\n/g, '\\n')}`)
  return content.split(from).join(to)
}

// ============================================================
// FIX 1: documentos-eliminacion.service.ts
// ============================================================
console.log('\n=== documentos-eliminacion.service.ts ===')
let elim = readFile('documentos-eliminacion.service.ts')

// 1a. Add .returns<any>() before .single() in ALL query chains
elim = replaceAll(elim, '.single()', '.returns<any>().single()')

// 1b. Fix array versiones access: versionMasAlta = versiones[0]
elim = replaceAll(
  elim,
  'const versionMasAlta = versiones[0]',
  'const versionMasAlta = (versiones as any[])[0]'
)

// 1c. Fix versiones.map((v) => v.id) - multiple occurrences
elim = replaceAll(
  elim,
  'versiones.map((v) => v.id)',
  '(versiones as any[]).map((v: any) => v.id)'
)

// 1d. Fix for loops over versiones in eliminarDefinitivo
// "for (const version of versiones)" - version is SelectQueryError
elim = replaceAll(
  elim,
  'for (const version of versiones)',
  'for (const version of (versiones as any[]))'
)

writeFile('documentos-eliminacion.service.ts', elim)
console.log('  💾 Saved documentos-eliminacion.service.ts')

// ============================================================
// FIX 2: documentos-versiones.service.ts
// ============================================================
console.log('\n=== documentos-versiones.service.ts ===')
let vers = readFile('documentos-versiones.service.ts')

// 2a. Add .returns<any>() before .single() in ALL query chains
vers = replaceAll(vers, '.single()', '.returns<any>().single()')

// 2b. Fix versiones?.[0]?.version array access (from .limit(1) query)
vers = replaceAll(
  vers,
  '(versiones?.[0]?.version || 0) + 1',
  '((versiones as any)?.[0]?.version || 0) + 1'
)

writeFile('documentos-versiones.service.ts', vers)
console.log('  💾 Saved documentos-versiones.service.ts')

// ============================================================
// FIX 3: documentos-reemplazo.service.ts
// ============================================================
console.log('\n=== documentos-reemplazo.service.ts ===')
let remp = readFile('documentos-reemplazo.service.ts')

// 3a. Add .returns<any>() before .single() in ALL query chains
remp = replaceAll(remp, '.single()', '.returns<any>().single()')

// 3b. Fix scoping: declare documento before try block, assign inside
// Current: let variables + try { const { data: documento } = ... }
// Fix: let documento: any = null before try, then assign inside
remp = replaceAll(
  remp,
  '    let backupPath: string | null = null\n    let archivoReemplazado = false\n\n    try {',
  '    let backupPath: string | null = null\n    let archivoReemplazado = false\n    let documento: any = null\n\n    try {'
)

// Change const { data: documento } inside try to use the outer let
remp = replaceAll(
  remp,
  '      const { data: documento, error: fetchError } = await supabase\n        .from(tabla as any)\n        .select(\'*\')\n        .eq(\'id\', documentoId)\n        .returns<any>().single()',
  '      const { data: _documentoData, error: fetchError } = await supabase\n        .from(tabla as any)\n        .select(\'*\')\n        .eq(\'id\', documentoId)\n        .returns<any>().single()\n      documento = _documentoData as any'
)

// 3c. Fix 'tabla' type mismatch: auditService.registrarAccion({ tabla, ... })
// TablaAuditable expects specific table names, but tabla is a dynamic string
remp = replaceAll(
  remp,
  '        tabla,\n        accion: \'UPDATE\',',
  '        tabla: tabla as any,\n        accion: \'UPDATE\','
)

writeFile('documentos-reemplazo.service.ts', remp)
console.log('  💾 Saved documentos-reemplazo.service.ts')

// ============================================================
// REPORT
// ============================================================
console.log('\n✅ Done! Run: npx tsc --noEmit 2>&1 | Select-String "documentos-" to verify\n')
