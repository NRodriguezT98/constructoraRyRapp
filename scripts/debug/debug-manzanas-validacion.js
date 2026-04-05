// Script de prueba para validar consulta de viviendas por manzana
// Ejecutar en consola del navegador cuando estés en la app

async function probarConsultaManzanas() {
  console.log('🧪 Iniciando prueba de consulta de manzanas...')

  // 1. Obtener proyecto "Las Américas 2"
  const { data: proyecto, error: errorProyecto } = await supabase
    .from('proyectos')
    .select(
      `
      *,
      manzanas (
        id,
        nombre,
        numero_viviendas
      )
    `
    )
    .ilike('nombre', '%américas 2%')
    .single()

  if (errorProyecto) {
    console.error('❌ Error obteniendo proyecto:', errorProyecto)
    return
  }

  console.log('✅ Proyecto encontrado:', proyecto.nombre)
  console.log('📋 Manzanas:', proyecto.manzanas)

  // 2. Para cada manzana, contar viviendas
  for (const manzana of proyecto.manzanas) {
    const { count, error: countError } = await supabase
      .from('viviendas')
      .select('*', { count: 'exact', head: true })
      .eq('manzana_id', manzana.id)

    if (countError) {
      console.error(
        `❌ Error contando viviendas de ${manzana.nombre}:`,
        countError
      )
      continue
    }

    console.log(`📊 Manzana "${manzana.nombre}" (ID: ${manzana.id}):`)
    console.log(`   - Viviendas en DB: ${count}`)
    console.log(`   - Estado: ${count === 0 ? '🔓 EDITABLE' : '🔒 BLOQUEADA'}`)
  }
}

// Ejecutar
probarConsultaManzanas()
