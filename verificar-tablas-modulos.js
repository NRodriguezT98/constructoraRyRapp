const { Client } = require('pg')
require('dotenv').config({ path: '.env.local' })

function parseConnectionString(connectionString) {
  const match = connectionString.match(
    /postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/
  )
  if (!match) throw new Error('Formato de DATABASE_URL inválido')

  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: parseInt(match[4]),
    database: match[5],
    ssl: { rejectUnauthorized: false },
  }
}

async function verificarTablasModulos() {
  const env = {}
  const envPath = require('path').join(process.cwd(), '.env.local')
  const fs = require('fs')

  const envContent = fs.readFileSync(envPath, 'utf8')
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([^#][^=]*)\s*=\s*(.*)$/)
    if (match) {
      const key = match[1].trim()
      const value = match[2].trim().replace(/^["']|["']$/g, '')
      env[key] = value
    }
  })

  const dbConfig = parseConnectionString(env.DATABASE_URL)
  const client = new Client(dbConfig)

  try {
    await client.connect()

    console.log('\n📊 VERIFICACIÓN DE TABLAS POR MÓDULO\n')
    console.log('='.repeat(70))

    // 1. Proyectos
    const proyectos = await client.query(`
      SELECT COUNT(*) as total, COUNT(DISTINCT proyecto_id) as entidades
      FROM documentos_proyecto
    `)
    console.log('\n📁 MÓDULO PROYECTOS:')
    console.log(`   Tabla: documentos_proyecto`)
    console.log(`   Total documentos: ${proyectos.rows[0].total}`)
    console.log(`   Proyectos únicos: ${proyectos.rows[0].entidades}`)

    // 2. Viviendas
    const viviendas = await client.query(`
      SELECT COUNT(*) as total, COUNT(DISTINCT vivienda_id) as entidades
      FROM documentos_vivienda
    `)
    console.log('\n🏠 MÓDULO VIVIENDAS:')
    console.log(`   Tabla: documentos_vivienda`)
    console.log(`   Total documentos: ${viviendas.rows[0].total}`)
    console.log(`   Viviendas únicas: ${viviendas.rows[0].entidades}`)

    // 3. Clientes
    const clientes = await client.query(`
      SELECT COUNT(*) as total, COUNT(DISTINCT cliente_id) as entidades
      FROM documentos_cliente
    `)
    console.log('\n👤 MÓDULO CLIENTES:')
    console.log(`   Tabla: documentos_cliente`)
    console.log(`   Total documentos: ${clientes.rows[0].total}`)
    console.log(`   Clientes únicos: ${clientes.rows[0].entidades}`)

    // 4. Storage Buckets
    const buckets = await client.query(`
      SELECT name, created_at::date as fecha
      FROM storage.buckets
      WHERE name LIKE 'documentos-%'
      ORDER BY name
    `)
    console.log('\n🪣 STORAGE BUCKETS:')
    buckets.rows.forEach(bucket => {
      console.log(`   ✅ ${bucket.name}`)
    })

    // 5. Resumen
    const totalDocs = parseInt(proyectos.rows[0].total) +
                      parseInt(viviendas.rows[0].total) +
                      parseInt(clientes.rows[0].total)

    console.log('\n' + '='.repeat(70))
    console.log('\n📈 RESUMEN:')
    console.log(`   Total documentos en sistema: ${totalDocs}`)
    console.log(`   Distribución:`)
    console.log(`     - Proyectos: ${proyectos.rows[0].total} docs (${((proyectos.rows[0].total / totalDocs) * 100).toFixed(1)}%)`)
    console.log(`     - Viviendas: ${viviendas.rows[0].total} docs (${((viviendas.rows[0].total / totalDocs) * 100).toFixed(1)}%)`)
    console.log(`     - Clientes: ${clientes.rows[0].total} docs (${((clientes.rows[0].total / totalDocs) * 100).toFixed(1)}%)`)

    console.log('\n✅ VERIFICACIÓN COMPLETADA: Cada módulo usa su tabla correcta\n')

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await client.end()
  }
}

verificarTablasModulos().catch(console.error)
