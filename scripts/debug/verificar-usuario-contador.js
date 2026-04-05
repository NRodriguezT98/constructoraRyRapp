require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// Usar SERVICE_ROLE para bypasear RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function verificarUsuarioContador() {
  console.log('🔍 Verificando usuario con rol Contador...\n')

  // Buscar en tabla usuarios
  const { data: usuarios, error } = await supabase
    .from('usuarios')
    .select('id, email, nombres, apellidos, rol, estado')
    .eq('rol', 'Contador')

  if (error) {
    console.error('❌ Error:', error.message)
    return
  }

  console.log(`📊 Usuarios con rol Contador: ${usuarios?.length || 0}\n`)

  if (usuarios && usuarios.length > 0) {
    usuarios.forEach((u, i) => {
      console.log(`👤 Usuario ${i + 1}:`)
      console.log(`   ID: ${u.id}`)
      console.log(`   Email: ${u.email}`)
      console.log(`   Nombre: ${u.nombres} ${u.apellidos}`)
      console.log(`   Estado: ${u.estado}`)
      console.log('')
    })
  } else {
    console.log('⚠️ No hay usuarios con rol "Contador" en la tabla usuarios')
    console.log('\n💡 Verifica que:')
    console.log('  1. El usuario existe en auth.users')
    console.log('  2. El usuario tiene rol "Contador" en tabla usuarios')
    console.log('  3. El estado es "Activo"')
  }

  // Verificar si hay auth.users
  const { data: authUsers, error: authError } =
    await supabase.auth.admin.listUsers()

  if (authError) {
    console.error('\n❌ Error listando auth.users:', authError.message)
  } else {
    console.log(
      `\n🔐 Total usuarios en auth.users: ${authUsers?.users?.length || 0}`
    )
  }
}

verificarUsuarioContador()
