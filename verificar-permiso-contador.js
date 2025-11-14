import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function verificarPermisoContador() {
  console.log('\n🔍 Verificando permiso proyectos.ver para Contador...\n')

  const { data: permiso } = await supabase
    .from('permisos_rol')
    .select('*')
    .eq('rol', 'Contador')
    .eq('modulo', 'proyectos')
    .eq('accion', 'ver')
    .single()

  if (permiso) {
    console.log('📊 Estado del permiso:')
    console.log(`   Rol: ${permiso.rol}`)
    console.log(`   Módulo: ${permiso.modulo}`)
    console.log(`   Acción: ${permiso.accion}`)
    console.log(`   Permitido: ${permiso.permitido ? '✅ SÍ' : '❌ NO'}`)
  } else {
    console.log('⚠️  No existe el permiso en la base de datos')
  }

  // Verificar todos los permisos de Contador en proyectos
  console.log('\n📋 Todos los permisos de Contador en proyectos:')
  const { data: todosPermisos } = await supabase
    .from('permisos_rol')
    .select('accion, permitido')
    .eq('rol', 'Contador')
    .eq('modulo', 'proyectos')
    .order('accion')

  todosPermisos?.forEach(p => {
    console.log(`   ${p.accion}: ${p.permitido ? '✅' : '❌'}`)
  })
}

verificarPermisoContador()
