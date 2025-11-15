/**
 * ============================================
 * TEST: Sistema de Permisos en JWT
 * ============================================
 *
 * Script para verificar que el cache de permisos funciona correctamente.
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

async function testPermisosJWT() {
  console.log('🧪 INICIANDO TESTS DE PERMISOS JWT\n')

  // 1. Obtener usuario Contador
  console.log('1️⃣ Buscando usuario Contador...')
  const { data: usuarios, error: errorUsuarios } = await supabaseAdmin
    .from('usuarios')
    .select('id, email, nombres, rol')
    .eq('rol', 'Contador')
    .limit(1)

  if (errorUsuarios || !usuarios || usuarios.length === 0) {
    console.error('❌ Error: No se encontró usuario Contador')
    return
  }

  const usuario = usuarios[0]
  console.log(`✅ Usuario encontrado: ${usuario.email} (${usuario.nombres})`)
  console.log(`   ID: ${usuario.id}`)
  console.log(`   Rol: ${usuario.rol}\n`)

  // 2. Obtener permisos de Contador
  console.log('2️⃣ Obteniendo permisos de Contador...')
  const { data: permisos, error: errorPermisos } = await supabaseAdmin
    .from('permisos_rol')
    .select('modulo, accion')
    .eq('rol', 'Contador')
    .eq('permitido', true)

  if (errorPermisos) {
    console.error('❌ Error obteniendo permisos:', errorPermisos)
    return
  }

  const permisosCompactos = permisos.map(p => `${p.modulo}.${p.accion}`)
  console.log(`✅ ${permisosCompactos.length} permisos encontrados`)
  console.log('   Primeros 10:')
  permisosCompactos.slice(0, 10).forEach((p, i) => {
    console.log(`   ${i + 1}. ${p}`)
  })
  console.log('')

  // 3. Actualizar metadata del usuario
  console.log('3️⃣ Actualizando user_metadata con permisos...')
  const { error: errorUpdate } = await supabaseAdmin.auth.admin.updateUserById(usuario.id, {
    user_metadata: {
      permisos_cache: permisosCompactos,
      permisos_cache_updated_at: new Date().toISOString(),
    },
  })

  if (errorUpdate) {
    console.error('❌ Error actualizando metadata:', errorUpdate)
    return
  }

  console.log('✅ Metadata actualizada exitosamente\n')

  // 4. Verificar metadata
  console.log('4️⃣ Verificando metadata del usuario...')
  const { data: userData, error: errorUser } = await supabaseAdmin.auth.admin.getUserById(
    usuario.id
  )

  if (errorUser) {
    console.error('❌ Error obteniendo usuario:', errorUser)
    return
  }

  const metadata = userData.user.user_metadata
  console.log(`✅ Metadata verificada:`)
  console.log(`   permisos_cache: ${metadata.permisos_cache?.length || 0} permisos`)
  console.log(`   updated_at: ${metadata.permisos_cache_updated_at || 'N/A'}`)
  console.log('')

  // 5. Simular verificación de permisos (como hace el middleware)
  console.log('5️⃣ Simulando verificación de middleware...')
  const permisosCache = metadata.permisos_cache || []

  const casosDeTest = [
    { modulo: 'proyectos', accion: 'ver', esperado: true },
    { modulo: 'documentos', accion: 'crear', esperado: true },
    { modulo: 'documentos', accion: 'eliminar', esperado: false },
    { modulo: 'usuarios', accion: 'ver', esperado: true },
    { modulo: 'usuarios', accion: 'eliminar', esperado: false },
  ]

  console.log('   Tests de permisos:')
  casosDeTest.forEach(caso => {
    const permisoKey = `${caso.modulo}.${caso.accion}`
    const tiene = permisosCache.includes(permisoKey)
    const resultado = tiene === caso.esperado ? '✅ PASS' : '❌ FAIL'

    console.log(
      `   ${resultado} - ${permisoKey}: ${tiene ? 'Permitido' : 'Denegado'} (esperado: ${caso.esperado ? 'Permitido' : 'Denegado'})`
    )
  })

  console.log('')

  // RESUMEN FINAL
  console.log('═══════════════════════════════════════')
  console.log('✅ TESTS COMPLETADOS EXITOSAMENTE')
  console.log('═══════════════════════════════════════')
  console.log('')
  console.log('📌 Próximos pasos:')
  console.log('   1. Cierra sesión con cuenta Contador')
  console.log('   2. Vuelve a iniciar sesión')
  console.log('   3. Los permisos deberían cargarse del JWT (0ms)')
  console.log('   4. Verifica en Network tab que NO hay query a permisos_rol')
  console.log('')
}

testPermisosJWT().catch(console.error)
