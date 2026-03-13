/**
 * Script para generar schema reference actualizado
 * Lee desde la BD y genera markdown claro
 */

const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

// Leer .env.local (igual que ejecutar-sql.js)
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local')
  if (!fs.existsSync(envPath)) {
    throw new Error('.env.local no encontrado')
  }

  const envContent = fs.readFileSync(envPath, 'utf8')
  const env = {}

  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([^#][^=]*)\s*=\s*(.*)$/)
    if (match) {
      const key = match[1].trim()
      const value = match[2].trim().replace(/^["']|["']$/g, '')
      env[key] = value
    }
  })

  return env
}

const env = loadEnv()

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
  }
}

const dbConfig = parseConnectionString(env.DATABASE_URL)
const client = new Client(dbConfig)

const TABLAS_PRINCIPALES = [
  'documentos_cliente',
  'fuentes_pago',
  'documentos_pendientes',
  'negociaciones',
  'clientes',
  'viviendas',
  'proyectos',
  'abonos_historial',
  'audit_log',
]

async function generarSchema() {
  try {
    console.log('🔍 Consultando schema de tablas principales...\n')

    await client.connect()

    let markdown = `# 📋 SCHEMA REFERENCE - CONSULTA RÁPIDA

> **✅ GENERADO AUTOMÁTICAMENTE DESDE BD**
> **Fecha**: ${new Date().toLocaleString('es-CO')}
> **Propósito**: Referencia rápida para evitar errores en nombres de columnas

---

## ⚠️ REGLA DE USO

**ANTES de escribir SQL:**
1. Busca en este archivo con Ctrl+F
2. Copia el nombre EXACTO de la columna
3. NO asumas nombres, SIEMPRE verifica aquí

---

`

    for (const tabla of TABLAS_PRINCIPALES) {
      console.log(`  📊 Consultando: ${tabla}`)

      const result = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position
      `, [tabla])

      if (result.rows.length === 0) {
        console.log(`  ⚠️  Tabla ${tabla} no encontrada, saltando...`)
        continue
      }

      markdown += `## \`${tabla}\` (${result.rows.length} columnas)\n\n`
      markdown += '```sql\n'

      result.rows.forEach((row) => {
        const nullable = row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'
        markdown += `${row.column_name.padEnd(25)} ${row.data_type.padEnd(20)} ${nullable}\n`
      })

      markdown += '```\n\n'
    }

    markdown += `---

## 🔍 BÚSQUEDAS COMUNES

### Documentos
- **URL del archivo**: \`url_storage\` (NO \`url\` ni \`ruta_archivo\`)
- **Cliente**: \`cliente_id\` (NOT NULL)
- **Categoría**: \`categoria_id\` (NULL permitido)
- **Metadata**: \`metadata\` (jsonb)

### Fuentes de Pago
- **Carta de aprobación**: \`carta_aprobacion_url\` (NULL permitido)
- **Estado documentación**: \`estado_documentacion\` (varchar)
- **Monto**: \`monto_aprobado\` (NOT NULL)

### Documentos Pendientes
- **Metadata**: \`metadata\` (jsonb con tipo_fuente, entidad)
- **Estado**: \`estado\` (Pendiente / Completado)

---

**🔄 Regenerar**: \`node generar-schema-simple.js\`
`

    // Guardar archivo
    const outputPath = 'docs/DATABASE-SCHEMA-REFERENCE-ACTUALIZADO.md'
    fs.writeFileSync(outputPath, markdown)

    console.log(`\n✅ Schema generado en: ${outputPath}`)
    console.log(`📊 ${TABLAS_PRINCIPALES.length} tablas consultadas`)

    await client.end()
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

generarSchema()
