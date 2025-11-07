/**
 * Script: Crear carpetas predeterminadas para TODAS las viviendas
 * Ejecutar: node crear-carpetas-todas-viviendas.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function main() {
  console.log('\n=======================================================')
  console.log('   🗂️  CREAR CARPETAS PARA TODAS LAS VIVIENDAS')
  console.log('=======================================================\n')

  // 1. Obtener usuario del sistema
  console.log('→ Obteniendo usuario del sistema...')
  const { data: usuarios, error: errorUsuarios } = await supabase
    .from('usuarios')
    .select('id, nombres, email')
    .limit(1)

  if (errorUsuarios || !usuarios || usuarios.length === 0) {
    console.error('❌ Error obteniendo usuario:', errorUsuarios?.message || 'No hay usuarios')
    return
  }

  const usuario = usuarios[0]
  console.log(`✓ Usuario: ${usuario.nombres} (${usuario.email})\n`)

  // 2. Obtener viviendas que tienen documentos pero no tienen carpetas
  console.log('→ Buscando viviendas con documentos sin carpetas...')

  const { data: viviendasConDocs, error: errorViviendas } = await supabase
    .from('documentos_vivienda')
    .select('vivienda_id')
    .is('carpeta_id', null)

  if (errorViviendas) {
    console.error('❌ Error:', errorViviendas.message)
    return
  }

  if (!viviendasConDocs || viviendasConDocs.length === 0) {
    console.log('✅ No hay viviendas con documentos sin carpetas\n')
    return
  }

  // Obtener IDs únicos
  const viviendasIds = [...new Set(viviendasConDocs.map(v => v.vivienda_id))]
  console.log(`✓ Encontradas ${viviendasIds.length} viviendas con documentos sin carpetas\n`)

  // 3. Filtrar viviendas que YA tienen carpetas
  const { data: viviendasConCarpetas, error: errorCheck } = await supabase
    .from('carpetas_documentos_viviendas')
    .select('vivienda_id')
    .in('vivienda_id', viviendasIds)

  const viviendasConCarpetasIds = viviendasConCarpetas?.map(v => v.vivienda_id) || []
  const viviendasSinCarpetas = viviendasIds.filter(id => !viviendasConCarpetasIds.includes(id))

  console.log(`→ Viviendas que necesitan carpetas: ${viviendasSinCarpetas.length}`)
  console.log(`→ Viviendas que ya tienen carpetas: ${viviendasConCarpetasIds.length}\n`)

  if (viviendasSinCarpetas.length === 0) {
    console.log('✅ Todas las viviendas ya tienen carpetas creadas\n')
    return
  }

  // 4. Crear carpetas para cada vivienda
  console.log('→ Creando carpetas predeterminadas...\n')

  let exitosas = 0
  let fallidas = 0

  for (const viviendaId of viviendasSinCarpetas) {
    try {
      const { error } = await supabase.rpc('crear_carpetas_predeterminadas_vivienda', {
        p_vivienda_id: viviendaId,
        p_usuario_id: usuario.id
      })

      if (error) {
        console.error(`  ❌ Vivienda ${viviendaId}: ${error.message}`)
        fallidas++
      } else {
        console.log(`  ✓ Vivienda ${viviendaId}: 13 carpetas creadas`)
        exitosas++
      }
    } catch (error) {
      console.error(`  ❌ Vivienda ${viviendaId}: ${error.message}`)
      fallidas++
    }
  }

  console.log('\n=======================================================')
  console.log(`   ✅ Carpetas creadas: ${exitosas} viviendas`)
  if (fallidas > 0) {
    console.log(`   ❌ Errores: ${fallidas} viviendas`)
  }
  console.log('=======================================================\n')

  // 5. Verificar resultado
  const { count } = await supabase
    .from('carpetas_documentos_viviendas')
    .select('id', { count: 'exact', head: true })

  console.log(`📊 Total de carpetas en el sistema: ${count}\n`)
  console.log('💡 Siguiente paso: Ejecutar migración de documentos\n')
  console.log('   Comando: node migrar-documentos-carpetas.js\n')
}

main()
  .catch(error => {
    console.error('\n❌ Error fatal:', error)
    process.exit(1)
  })
  .finally(() => {
    process.exit(0)
  })
