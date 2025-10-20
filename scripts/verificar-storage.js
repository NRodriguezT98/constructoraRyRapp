// Script para verificar buckets de Storage en Supabase
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Leer variables de entorno manualmente desde .env.local
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local')

  if (!fs.existsSync(envPath)) {
    console.error('❌ Error: No se encontró el archivo .env.local')
    process.exit(1)
  }

  const envFile = fs.readFileSync(envPath, 'utf-8')
  const env = {}

  envFile.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=')
    if (key && valueParts.length > 0) {
      env[key.trim()] = valueParts.join('=').trim()
    }
  })

  return env
}

const env = loadEnv()
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Faltan variables de entorno en .env.local')
  console.error('Verifica que tenga:')
  console.error('  - NEXT_PUBLIC_SUPABASE_URL')
  console.error('  - NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function verificarBuckets() {
  console.log('🔍 Verificando buckets de Storage...\n')

  try {
    const { data: buckets, error } = await supabase.storage.listBuckets()

    if (error) {
      console.error('❌ Error obteniendo buckets:', error.message)
      return
    }

    console.log(`📦 Total de buckets encontrados: ${buckets?.length || 0}\n`)

    if (buckets && buckets.length > 0) {
      console.log('Lista de buckets:\n')
      buckets.forEach((bucket, index) => {
        console.log(`${index + 1}. 📁 ${bucket.id}`)
        console.log(`   - Público: ${bucket.public ? '✅ Sí' : '❌ No (privado)'}`)
        console.log(`   - Límite archivos: ${bucket.file_size_limit ? (bucket.file_size_limit / 1024 / 1024).toFixed(2) + ' MB' : 'Sin límite'}`)
        console.log(`   - Tipos permitidos: ${bucket.allowed_mime_types?.join(', ') || 'Todos'}`)
        console.log('')
      })
    } else {
      console.log('❌ No hay buckets creados\n')
    }

    // Verificar buckets específicos
    const bucketsRequeridos = ['documentos-proyectos', 'documentos-clientes']

    console.log('🎯 Verificando buckets requeridos:\n')

    for (const bucketName of bucketsRequeridos) {
      const existe = buckets?.some(b => b.id === bucketName)

      if (existe) {
        console.log(`✅ ${bucketName}: EXISTE`)
      } else {
        console.log(`❌ ${bucketName}: NO EXISTE (necesitas crearlo)`)
      }
    }

    console.log('\n' + '='.repeat(60))

    const todosExisten = bucketsRequeridos.every(name =>
      buckets?.some(b => b.id === name)
    )

    if (todosExisten) {
      console.log('✅ TODOS LOS BUCKETS REQUERIDOS EXISTEN')
      console.log('\n🎉 Tu configuración de Storage está completa!')
    } else {
      console.log('⚠️  FALTAN BUCKETS POR CREAR')
      console.log('\n📖 Consulta estas guías:')
      console.log('   - CREAR-BUCKET-CLIENTES.md (para documentos-clientes)')
      console.log('   - GUIA-CREAR-BUCKET.md (para documentos-proyectos)')
    }

  } catch (error) {
    console.error('❌ Error ejecutando script:', error.message)
  }
}

// Ejecutar
verificarBuckets()
