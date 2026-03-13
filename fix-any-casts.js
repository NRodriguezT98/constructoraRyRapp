/**
 * Fix remaining SelectQueryError / unknown / {} type errors in documentos services.
 * Approach: rename destructured data to XResult, then cast: const X = XResult as any
 * This guarantees the variable is typed as 'any' for subsequent property access.
 */
const fs = require('fs')
const path = require('path')

const BASE = path.join('d:', 'constructoraRyRapp', 'constructoraRyRapp', 'src', 'modules', 'documentos', 'services')

function readFile(filename) {
  const raw = fs.readFileSync(path.join(BASE, filename), 'utf8')
  return raw.replace(/\r\n/g, '\n')  // Normalize CRLF → LF for matching
}
function writeFile(filename, content) {
  fs.writeFileSync(path.join(BASE, filename), content, 'utf8')
}
function replaceOne(content, from, to, label) {
  if (!content.includes(from)) {
    console.log(`  ⚠  NOT FOUND: ${label || from.substring(0, 50).replace(/\n/g,'↵')}`)
    return content
  }
  const count = content.split(from).length - 1
  if (count > 1) console.log(`  ⚠  MULTIPLE (${count}x): ${label || from.substring(0, 50).replace(/\n/g,'↵')}`)
  else console.log(`  ✅ Fixed: ${label || from.substring(0, 50).replace(/\n/g,'↵')}`)
  return content.split(from).join(to)
}

// ======================================================================
// STRATEGY: Remove .returns<any>() and cast the variable after destructuring
// Pattern: const { data: X, ... } = await supabase...returns<any>().single()
// → const { data: Xr, ... } = await supabase...single() ; const X = Xr as any
// ======================================================================

// ============================================================
// documentos-eliminacion.service.ts
// All queries use dynamic table, so change cada destructuring
// ============================================================
console.log('\n=== documentos-eliminacion.service.ts ===')
let elim = readFile('documentos-eliminacion.service.ts')

// Fix 1: all instances of ".returns<any>().single()" → ".single()" (we'll cast separately)
elim = replaceOne(elim, '.returns<any>().single()', '.single()', 'revert returns<any>')

// Fix 2: Each "const { data: documento, error: getError }" from single() queries
// Eliminacion has many functions with "documento" - we use context to distinguish
// ALL have same pattern: select('id, documento_padre_id') .eq('id', documentoId)
// Let's just add the cast after EACH destructuring by replacing the 3 common patterns:

// Pattern A: select('id, documento_padre_id')
elim = replaceOne(
  elim,
  `    const { data: documento, error: getError } = await supabase
      .from(tabla as any)
      .select('id, documento_padre_id')
      .eq('id', documentoId)
      .single()`,
  `    const { data: documentoResult, error: getError } = await supabase
      .from(tabla as any)
      .select('id, documento_padre_id')
      .eq('id', documentoId)
      .single()
    const documento = documentoResult as any`,
  'documento select(id,documento_padre_id)'
)

// Pattern B: select('id, documento_padre_id, version, es_version_actual')
elim = replaceOne(
  elim,
  `    const { data: documento, error: getError } = await supabase
      .from(tabla as any)
      .select('id, documento_padre_id, version, es_version_actual')
      .eq('id', documentoId)
      .single()`,
  `    const { data: documentoResult2, error: getError } = await supabase
      .from(tabla as any)
      .select('id, documento_padre_id, version, es_version_actual')
      .eq('id', documentoId)
      .single()
    const documento = documentoResult2 as any`,
  'documento select(id,padre,version,actual)'
)

// Pattern C: select('id, documento_padre_id, es_version_actual') (eliminar definitivo)
elim = replaceOne(
  elim,
  `    const { data: documento, error: getError } = await supabase
      .from(tabla as any)
      .select('id, documento_padre_id, es_version_actual')
      .eq('id', documentoId)
      .single()`,
  `    const { data: documentoResult3, error: getError } = await supabase
      .from(tabla as any)
      .select('id, documento_padre_id, es_version_actual')
      .eq('id', documentoId)
      .single()
    const documento = documentoResult3 as any`,
  'documento select(id,padre,actual)'
)

// Fix 3: padre destructuring (inner select 'id')
elim = replaceOne(
  elim,
  `        const { data: padre } = await supabase
          .from(tabla as any)
          .select('id')
          .eq('id', documento.documento_padre_id)
          .single()`,
  `        const { data: padreResult } = await supabase
          .from(tabla as any)
          .select('id')
          .eq('id', documento.documento_padre_id)
          .single()
        const padre = padreResult as any`,
  'padre select(id)'
)

// Fix 4: versionMasAlta - already handled via (versiones as any[])[0]
// But if it still fails, fix versionMasAlta.id:
elim = replaceOne(
  elim,
  '.eq(\'id\', versionMasAlta.id)',
  '.eq(\'id\', (versionMasAlta as any).id)',
  'versionMasAlta.id'
)

// Fix 5: version.id and version.url_storage in for loops
// "for (const version of (versiones as any[]))" was applied before
// Now version should be any, but may need TypeScript to re-infer
// Let's also explicitly type the version in for loops:
elim = replaceOne(
  elim,
  'for (const version of (versiones as any[]))',
  'for (const version of (versiones as any[]) as any[])',
  'for version of versiones - double cast'
)

writeFile('documentos-eliminacion.service.ts', elim)
console.log('  💾 Saved documentos-eliminacion.service.ts')

// ============================================================
// documentos-versiones.service.ts  
// ============================================================
console.log('\n=== documentos-versiones.service.ts ===')
let vers = readFile('documentos-versiones.service.ts')

// Fix 1: Remove .returns<any>() (revert)
vers = replaceOne(vers, '.returns<any>().single()', '.single()', 'revert returns<any>')

// Fix 2: docOriginal in crearNuevaVersion
vers = replaceOne(
  vers,
  `    const { data: docOriginal, error: fetchError } = await supabase
      .from(config.tabla as any)
      .select('*')
      .eq('id', documentoIdOriginal)
      .single()`,
  `    const { data: docOriginalResult, error: fetchError } = await supabase
      .from(config.tabla as any)
      .select('*')
      .eq('id', documentoIdOriginal)
      .single()
    const docOriginal = docOriginalResult as any`,
  'docOriginal destructuring'
)

// Fix 3: doc in obtenerVersiones
vers = replaceOne(
  vers,
  `    const { data: doc } = await supabase
      .from(config.tabla as any)
      .select('documento_padre_id')
      .eq('id', documentoId)
      .single()`,
  `    const { data: docResult } = await supabase
      .from(config.tabla as any)
      .select('documento_padre_id')
      .eq('id', documentoId)
      .single()
    const doc = docResult as any`,
  'doc select(documento_padre_id) in obtenerVersiones'
)

// Fix 4: doc in contarVersionesActivas  
vers = replaceOne(
  vers,
  `    const { data: doc } = await supabase
      .from(config.tabla as any)
      .select('documento_padre_id, version')
      .eq('id', documentoId)
      .single()`,
  `    const { data: docVersionResult } = await supabase
      .from(config.tabla as any)
      .select('documento_padre_id, version')
      .eq('id', documentoId)
      .single()
    const doc = docVersionResult as any`,
  'doc select(documento_padre_id, version) in contarVersionesActivas'
)

// Fix 5: doc in obtenerVersionesEliminadas
vers = replaceOne(
  vers,
  `    const { data: doc } = await supabase
      .from(config.tabla as any)
      .select('documento_padre_id')
      .eq('id', documentoId)
      .single()

    const padreId = doc?.documento_padre_id || documentoId

    const { data, error } = await supabase
      .from(config.tabla as any)
      .select(\`
        *,
        usuario:usuarios (
          nombres,
          apellidos,
          email
        )
      \`)
      .or(\`id.eq.\${padreId},documento_padre_id.eq.\${padreId}\`)
      .eq('estado', 'eliminado')`,
  `    const { data: docPadreResult } = await supabase
      .from(config.tabla as any)
      .select('documento_padre_id')
      .eq('id', documentoId)
      .single()
    const doc = docPadreResult as any

    const padreId = doc?.documento_padre_id || documentoId

    const { data, error } = await supabase
      .from(config.tabla as any)
      .select(\`
        *,
        usuario:usuarios (
          nombres,
          apellidos,
          email
        )
      \`)
      .or(\`id.eq.\${padreId},documento_padre_id.eq.\${padreId}\`)
      .eq('estado', 'eliminado')`,
  'doc in obtenerVersionesEliminadas'
)

// Fix 6: versionAnterior in restaurarVersion
vers = replaceOne(
  vers,
  `    const { data: versionAnterior, error: fetchError } = await supabase
      .from(config.tabla as any)
      .select('*')
      .eq('id', versionId)
      .single()`,
  `    const { data: versionAnteriorResult, error: fetchError } = await supabase
      .from(config.tabla as any)
      .select('*')
      .eq('id', versionId)
      .single()
    const versionAnterior = versionAnteriorResult as any`,
  'versionAnterior in restaurarVersion'
)

// Fix 7: version in eliminarVersion
vers = replaceOne(
  vers,
  `    const { data: version, error: fetchError } = await supabase
      .from(config.tabla as any)
      .select('*')
      .eq('id', versionId)
      .single()`,
  `    const { data: versionResult, error: fetchError } = await supabase
      .from(config.tabla as any)
      .select('*')
      .eq('id', versionId)
      .single()
    const version = versionResult as any`,
  'version in eliminarVersion'
)

// Fix 8: versionAnterior in eliminarVersion (nested, selects 'id')
vers = replaceOne(
  vers,
  `      const { data: versionAnterior } = await supabase
        .from(config.tabla as any)
        .select('id')
        .or(\`id.eq.\${padreId},documento_padre_id.eq.\${padreId}\`)
        .eq('estado', 'activo')
        .neq('id', versionId)
        .order('version', { ascending: false })
        .limit(1)
        .single()`,
  `      const { data: versionAnteriorInnerResult } = await supabase
        .from(config.tabla as any)
        .select('id')
        .or(\`id.eq.\${padreId},documento_padre_id.eq.\${padreId}\`)
        .eq('estado', 'activo')
        .neq('id', versionId)
        .order('version', { ascending: false })
        .limit(1)
        .single()
      const versionAnterior = versionAnteriorInnerResult as any`,
  'versionAnterior (inner) in eliminarVersion'
)

writeFile('documentos-versiones.service.ts', vers)
console.log('  💾 Saved documentos-versiones.service.ts')

// ============================================================
// documentos-reemplazo.service.ts
// ============================================================
console.log('\n=== documentos-reemplazo.service.ts ===')
let remp = readFile('documentos-reemplazo.service.ts')

// Fix 1: Remove .returns<any>() from the usuario query
remp = replaceOne(remp, '.returns<any>().single()', '.single()', 'revert returns<any>')

// Fix 2: usuario from static table 'usuarios' - add cast
remp = replaceOne(
  remp,
  `      const { data: usuario, error: usuarioError } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('id', user.id)
        .single()`,
  `      const { data: usuarioResult, error: usuarioError } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('id', user.id)
        .single()
      const usuario = usuarioResult as any`,
  'usuario from usuarios table'
)

writeFile('documentos-reemplazo.service.ts', remp)
console.log('  💾 Saved documentos-reemplazo.service.ts')

console.log('\n✅ Done! Check errors with: npx tsc --noEmit 2>&1 | Select-String "documentos-"\n')
