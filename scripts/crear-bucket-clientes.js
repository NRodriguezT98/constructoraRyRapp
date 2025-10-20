// Script para crear bucket documentos-clientes vía API
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Leer variables de entorno
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
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan credenciales en .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function crearBucketClientes() {
  console.log('🚀 Creando bucket documentos-clientes...\n')

  try {
    // 1. Verificar si ya existe
    const { data: buckets } = await supabase.storage.listBuckets()
    const existe = buckets?.some(b => b.id === 'documentos-clientes')

    if (existe) {
      console.log('✅ El bucket documentos-clientes ya existe')
      return
    }

    // 2. Crear bucket
    const { data, error } = await supabase.storage.createBucket('documentos-clientes', {
      public: false,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ]
    })

    if (error) {
      console.error('❌ Error al crear bucket:', error.message)
      console.log('\n⚠️  SOLUCIÓN: Crea el bucket manualmente en el dashboard')
      console.log('   URL: https://supabase.com/dashboard/project/swyjhwgvkfcfdtemkyad/storage/buckets')
      return
    }

    console.log('✅ Bucket creado exitosamente')
    console.log('\n⚠️  IMPORTANTE: Debes crear las políticas RLS manualmente:')
    console.log('   1. Ve a Storage → documentos-clientes → Policies')
    console.log('   2. Crea 3 políticas (INSERT, SELECT, DELETE)')
    console.log('   3. Usa esta expresión: bucket_id = \'documentos-clientes\' AND auth.uid()::text = (storage.foldername(name))[1]')

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

crearBucketClientes()
