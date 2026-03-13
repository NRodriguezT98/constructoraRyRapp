const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

async function verificarNombres() {
  try {
    console.log('\n=== VERIFICANDO NOMBRES DE SUBSIDIO CAJA ===\n')

    // 1. Tipos en tipos_fuentes_pago
    console.log('1️⃣ Nombres en tipos_fuentes_pago:')
    const tipos = await pool.query(`
      SELECT nombre, COUNT(*) as cantidad
      FROM tipos_fuentes_pago
      WHERE nombre ILIKE '%subsidio%caja%'
      GROUP BY nombre
      ORDER BY nombre
    `)
    tipos.rows.forEach(row => {
      console.log(`   → "${row.nombre}" (${row.cantidad})`)
    })

    // 2. Tipos en requisitos_fuentes_pago_config
    console.log('\n2️⃣ Nombres en requisitos_fuentes_pago_config:')
    const requisitos = await pool.query(`
      SELECT DISTINCT tipo_fuente, COUNT(*) as cantidad_requisitos
      FROM requisitos_fuentes_pago_config
      WHERE tipo_fuente ILIKE '%subsidio%caja%'
      GROUP BY tipo_fuente
      ORDER BY tipo_fuente
    `)
    requisitos.rows.forEach(row => {
      console.log(`   → "${row.tipo_fuente}" (${row.cantidad_requisitos} requisitos)`)
    })

    // 3. Tipos en fuentes_pago reales
    console.log('\n3️⃣ Nombres en fuentes_pago (fuentes creadas):')
    const fuentes = await pool.query(`
      SELECT DISTINCT tipo, COUNT(*) as cantidad_fuentes
      FROM fuentes_pago
      WHERE tipo ILIKE '%subsidio%caja%'
      GROUP BY tipo
      ORDER BY tipo
    `)
    if (fuentes.rows.length > 0) {
      fuentes.rows.forEach(row => {
        console.log(`   → "${row.tipo}" (${row.cantidad_fuentes} fuentes)`)
      })
    } else {
      console.log('   (No hay fuentes creadas aún)')
    }

    // 4. Resumen
    console.log('\n📊 RESUMEN:')
    const todosLosNombres = new Set()
    tipos.rows.forEach(r => todosLosNombres.add(r.nombre))
    requisitos.rows.forEach(r => todosLosNombres.add(r.tipo_fuente))
    fuentes.rows.forEach(r => todosLosNombres.add(r.tipo))

    console.log(`   Total de variantes encontradas: ${todosLosNombres.size}`)
    console.log('   Variantes:')
    Array.from(todosLosNombres).forEach((nombre, i) => {
      console.log(`   ${i + 1}. "${nombre}"`)
    })

    if (todosLosNombres.size > 1) {
      console.log('\n⚠️  PROBLEMA: Hay múltiples variantes del mismo nombre!')
      console.log('   Esto causa inconsistencias. Se debe estandarizar a UN solo nombre.')
    } else {
      console.log('\n✅ OK: Solo hay una variante del nombre')
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await pool.end()
  }
}

verificarNombres()
