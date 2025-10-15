/**
 * Script para crear el bucket de documentos automáticamente
 * Ejecutar con: node scripts/create-storage-bucket.js
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://swyjhwgvkfcfdtemkyad.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3eWpod2d2a2ZjZmR0ZW1reWFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NTU4ODQsImV4cCI6MjA3NjAzMTg4NH0.v9daNgC7Eesupwatd4eDipCXeTh1onVwVsCSFxYy5xs'

// ⚠️ NOTA: Este script requiere la SERVICE_ROLE key, no la ANON key
// La ANON key no tiene permisos para crear buckets

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function createBucket() {
  console.log('🚀 Intentando crear bucket "documentos-proyectos"...')
  console.log('')

  const { data, error } = await supabase.storage.createBucket('documentos-proyectos', {
    public: false,
    fileSizeLimit: 52428800, // 50MB
  })

  if (error) {
    console.error('❌ Error al crear bucket:', error.message)
    console.log('')

    if (error.message.includes('permission') || error.message.includes('JWT')) {
      console.log('⚠️  PROBLEMA: La API Key no tiene permisos suficientes')
      console.log('')
      console.log('Este script necesita la SERVICE_ROLE key de Supabase, no la ANON key.')
      console.log('')
      console.log('💡 SOLUCIONES:')
      console.log('')
      console.log('   OPCIÓN 1 (Recomendada): Crear manualmente en Dashboard')
      console.log('   --------------------------------------------------------')
      console.log('   1. Ir a: https://supabase.com/dashboard/project/swyjhwgvkfcfdtemkyad/storage/buckets')
      console.log('   2. Click en "New bucket"')
      console.log('   3. Name: documentos-proyectos')
      console.log('   4. Public: NO (desmarcar)')
      console.log('   5. Click "Create bucket"')
      console.log('')
      console.log('   OPCIÓN 2: Usar SERVICE_ROLE key')
      console.log('   --------------------------------------------------------')
      console.log('   1. Ir a: https://supabase.com/dashboard/project/swyjhwgvkfcfdtemkyad/settings/api')
      console.log('   2. Copiar "service_role" key (⚠️ secreta, no compartir)')
      console.log('   3. Crear archivo .env.local con: SUPABASE_SERVICE_ROLE_KEY=tu-key')
      console.log('   4. Ejecutar este script con esa key')
    }

    return
  }

  console.log('✅ Bucket creado exitosamente!')
  console.log('   ID:', data.id)
  console.log('   Name:', data.name)
  console.log('')
  console.log('🎯 SIGUIENTE PASO: Configurar políticas RLS')
  console.log('   Ver archivo: SETUP-STORAGE-BUCKET.md (líneas 43-70)')
}

createBucket().catch(console.error)
