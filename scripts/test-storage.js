/**
 * Script de diagnóstico para Supabase Storage
 * Ejecutar con: node scripts/test-storage.js
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://swyjhwgvkfcfdtemkyad.supabase.co'
const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3eWpod2d2a2ZjZmR0ZW1reWFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NTU4ODQsImV4cCI6MjA3NjAzMTg4NH0.v9daNgC7Eesupwatd4eDipCXeTh1onVwVsCSFxYy5xs'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function testStorage() {
  console.log('🔍 DIAGNÓSTICO DE SUPABASE STORAGE')
  console.log('='.repeat(50))
  console.log('')

  // 1. Verificar conexión
  console.log('1️⃣ Verificando conexión...')
  console.log('   URL:', SUPABASE_URL)
  console.log('   Key:', SUPABASE_KEY.substring(0, 20) + '...')
  console.log('')

  // 2. Listar todos los buckets
  console.log('2️⃣ Listando buckets disponibles...')
  const { data: buckets, error: bucketsError } =
    await supabase.storage.listBuckets()

  if (bucketsError) {
    console.error('   ❌ Error al listar buckets:', bucketsError.message)
    return
  }

  console.log(`   ✅ Encontrados ${buckets.length} bucket(s):`)
  buckets.forEach(bucket => {
    console.log(
      `      - ${bucket.name} ${bucket.public ? '(público)' : '(privado)'}`
    )
  })
  console.log('')

  // 3. Verificar bucket específico
  const bucketName = 'documentos-proyectos'
  console.log(`3️⃣ Verificando bucket "${bucketName}"...`)

  const bucketExists = buckets.find(b => b.name === bucketName)

  if (!bucketExists) {
    console.log(`   ❌ El bucket "${bucketName}" NO EXISTE`)
    console.log('')
    console.log('💡 SOLUCIÓN:')
    console.log(
      '   1. Ir a: https://supabase.com/dashboard/project/swyjhwgvkfcfdtemkyad/storage/buckets'
    )
    console.log('   2. Crear bucket con nombre: documentos-proyectos')
    console.log('   3. Marcar como PRIVADO')
    console.log('   4. Configurar políticas RLS')
    return
  }

  console.log(`   ✅ El bucket "${bucketName}" EXISTE`)
  console.log(`      - Público: ${bucketExists.public ? 'Sí' : 'No'}`)
  console.log(`      - ID: ${bucketExists.id}`)
  console.log('')

  // 4. Listar archivos en el bucket
  console.log('4️⃣ Listando archivos en el bucket...')
  const { data: files, error: filesError } = await supabase.storage
    .from(bucketName)
    .list('', {
      limit: 100,
      offset: 0,
    })

  if (filesError) {
    console.error('   ❌ Error al listar archivos:', filesError.message)
    if (filesError.message.includes('permission')) {
      console.log('')
      console.log('⚠️  PROBLEMA DE PERMISOS (RLS)')
      console.log('   El bucket existe pero no tiene políticas configuradas.')
      console.log('')
      console.log('💡 SOLUCIÓN:')
      console.log(
        '   Ir a: https://supabase.com/dashboard/project/swyjhwgvkfcfdtemkyad/storage/buckets/documentos-proyectos'
      )
      console.log(
        '   Y agregar las políticas RLS del archivo SETUP-STORAGE-BUCKET.md'
      )
    }
    return
  }

  console.log(`   ✅ Encontrados ${files.length} archivo(s)/carpeta(s):`)
  files.slice(0, 5).forEach(file => {
    console.log(`      - ${file.name} (${file.id ? 'archivo' : 'carpeta'})`)
  })
  if (files.length > 5) {
    console.log(`      ... y ${files.length - 5} más`)
  }
  console.log('')

  // 5. Probar crear signed URL con un archivo existente
  if (files.length > 0 && files[0].id) {
    console.log('5️⃣ Probando crear signed URL...')
    const testFile = files[0]
    const { data: signedUrl, error: urlError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(testFile.name, 60)

    if (urlError) {
      console.error('   ❌ Error al crear signed URL:', urlError.message)
      return
    }

    console.log('   ✅ Signed URL creada correctamente')
    console.log('   URL:', signedUrl.signedUrl.substring(0, 50) + '...')
  }

  console.log('')
  console.log('✅ DIAGNÓSTICO COMPLETO - TODO FUNCIONA CORRECTAMENTE')
  console.log('='.repeat(50))
}

// Ejecutar diagnóstico
testStorage().catch(console.error)
