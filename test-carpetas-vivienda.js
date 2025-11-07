/**
 * Script de prueba: Crear carpetas predeterminadas para una vivienda
 * Ejecutar: node test-carpetas-vivienda.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Necesitamos service role para bypass RLS
)

async function main() {
  console.log('\n=======================================================')
  console.log('   🗂️  CREAR CARPETAS PREDETERMINADAS')
  console.log('=======================================================\n')

  // 1. Obtener una vivienda existente
  console.log('→ Buscando viviendas existentes...')
  const { data: viviendas, error: errorViviendas } = await supabase
    .from('viviendas')
    .select('id, numero, manzana_id')
    .limit(5)

  if (errorViviendas) {
    console.error('❌ Error obteniendo viviendas:', errorViviendas.message)
    return
  }

  if (!viviendas || viviendas.length === 0) {
    console.error('❌ No se encontraron viviendas en la base de datos')
    return
  }

  console.log(`✓ Se encontraron ${viviendas.length} viviendas:\n`)
  viviendas.forEach((v, i) => {
    console.log(`  ${i + 1}. Vivienda ${v.numero}`)
    console.log(`     ID: ${v.id}`)
  })

  // Usar la primera vivienda
  const viviendaSeleccionada = viviendas[0]
  console.log(`\n→ Seleccionada: Vivienda ${viviendaSeleccionada.numero}`)
  console.log(`  ID: ${viviendaSeleccionada.id}`)

  // 2. Verificar si ya tiene carpetas
  console.log('\n→ Verificando carpetas existentes...')
  const { data: carpetasExistentes, error: errorCheck } = await supabase
    .from('carpetas_documentos_viviendas')
    .select('id, nombre')
    .eq('vivienda_id', viviendaSeleccionada.id)

  if (errorCheck) {
    console.error('❌ Error verificando carpetas:', errorCheck.message)
    return
  }

  if (carpetasExistentes && carpetasExistentes.length > 0) {
    console.log(`⚠️  Esta vivienda ya tiene ${carpetasExistentes.length} carpetas:`)
    carpetasExistentes.forEach(c => console.log(`   - ${c.nombre}`))
    console.log('\n→ Eliminando carpetas existentes para prueba limpia...')

    const { error: errorDelete } = await supabase
      .from('carpetas_documentos_viviendas')
      .delete()
      .eq('vivienda_id', viviendaSeleccionada.id)

    if (errorDelete) {
      console.error('❌ Error eliminando carpetas:', errorDelete.message)
      return
    }
    console.log('✓ Carpetas eliminadas')
  } else {
    console.log('✓ No hay carpetas existentes')
  }

  // 3. Obtener un usuario para asignar como creador
  console.log('\n→ Obteniendo usuario del sistema...')
  const { data: usuarios, error: errorUsuarios } = await supabase
    .from('usuarios')
    .select('id, nombres, email')
    .limit(1)

  if (errorUsuarios || !usuarios || usuarios.length === 0) {
    console.error('❌ Error obteniendo usuario:', errorUsuarios?.message || 'No hay usuarios')
    return
  }

  const usuario = usuarios[0]
  console.log(`✓ Usuario: ${usuario.nombres} (${usuario.email})`)

  // 4. Llamar a la función SQL para crear carpetas predeterminadas
  console.log('\n→ Ejecutando función crear_carpetas_predeterminadas_vivienda...')
  const { data, error } = await supabase.rpc('crear_carpetas_predeterminadas_vivienda', {
    p_vivienda_id: viviendaSeleccionada.id,
    p_usuario_id: usuario.id
  })

  if (error) {
    console.error('❌ Error creando carpetas:', error.message)
    console.error('   Detalles:', error)
    return
  }

  console.log('✓ Función ejecutada exitosamente')

  // 5. Verificar carpetas creadas
  console.log('\n→ Verificando carpetas creadas...')
  const { data: carpetasCreadas, error: errorVerificar } = await supabase
    .from('carpetas_documentos_viviendas')
    .select('*')
    .eq('vivienda_id', viviendaSeleccionada.id)
    .order('orden', { ascending: true })

  if (errorVerificar) {
    console.error('❌ Error verificando carpetas:', errorVerificar.message)
    return
  }

  console.log(`\n✅ Se crearon ${carpetasCreadas.length} carpetas:\n`)

  // Agrupar por nivel (carpetas raíz vs subcarpetas)
  const carpetasRaiz = carpetasCreadas.filter(c => !c.carpeta_padre_id)
  const subcarpetas = carpetasCreadas.filter(c => c.carpeta_padre_id)

  carpetasRaiz.forEach(carpeta => {
    console.log(`📁 ${carpeta.nombre}`)
    console.log(`   Color: ${carpeta.color} | Ícono: ${carpeta.icono}`)
    console.log(`   ID: ${carpeta.id}`)
    console.log(`   Sistema: ${carpeta.es_carpeta_sistema ? 'Sí' : 'No'}`)

    // Mostrar subcarpetas
    const subs = subcarpetas.filter(s => s.carpeta_padre_id === carpeta.id)
    if (subs.length > 0) {
      subs.forEach(sub => {
        console.log(`   └─ 📂 ${sub.nombre}`)
        console.log(`      Color: ${sub.color} | Ícono: ${sub.icono}`)
      })
    }
    console.log('')
  })

  // 6. Probar la estructura jerárquica
  console.log('→ Probando obtención de árbol jerárquico...')

  // Construir árbol manualmente
  function construirArbol(carpetas, padreId = null) {
    return carpetas
      .filter(c => c.carpeta_padre_id === padreId)
      .map(carpeta => ({
        ...carpeta,
        subcarpetas: construirArbol(carpetas, carpeta.id)
      }))
  }

  const arbol = construirArbol(carpetasCreadas)

  console.log('\n📊 Estructura jerárquica:\n')
  console.log(JSON.stringify(arbol, null, 2))

  console.log('\n=======================================================')
  console.log('   ✅ PRUEBA COMPLETADA EXITOSAMENTE')
  console.log('=======================================================\n')
  console.log(`Total carpetas raíz: ${carpetasRaiz.length}`)
  console.log(`Total subcarpetas: ${subcarpetas.length}`)
  console.log(`Total general: ${carpetasCreadas.length}`)
  console.log('\n💡 Siguiente paso: Integrar con la UI en Next.js\n')
}

main()
  .catch(error => {
    console.error('\n❌ Error fatal:', error)
    process.exit(1)
  })
  .finally(() => {
    process.exit(0)
  })
