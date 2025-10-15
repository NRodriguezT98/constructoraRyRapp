#!/usr/bin/env node

/**
 * 🔧 Script de Configuración de Supabase
 *
 * Este script te ayuda a configurar Supabase automáticamente
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🚀 Configurando Supabase para RyR Constructora...\n')

// Verificar si existe .env.local
const envPath = path.join(process.cwd(), '.env.local')
const envExamplePath = path.join(process.cwd(), '.env.example')

if (!fs.existsSync(envPath)) {
  console.log('❌ No se encontró .env.local')
  console.log('📋 Copiando .env.example a .env.local...')

  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath)
    console.log('✅ Archivo .env.local creado')
  } else {
    console.log('❌ Tampoco se encontró .env.example')
    process.exit(1)
  }
}

console.log('\n📖 INSTRUCCIONES PARA CONFIGURAR SUPABASE:')
console.log('═══════════════════════════════════════════\n')

console.log('1. 🌐 Ve a: https://supabase.com/dashboard')
console.log('2. 🔐 Inicia sesión o crea una cuenta')
console.log('3. ➕ Crea un nuevo proyecto o selecciona uno existente')
console.log('4. ⚙️  Ve a Settings > API')
console.log('5. 📋 Copia los siguientes valores:\n')

console.log('   📍 Project URL (algo como: https://abcdefgh.supabase.co)')
console.log('   🔑 Anon Key (clave pública, algo como: eyJhbGciOiJIUzI1...)')

console.log('\n6. 📝 Edita el archivo .env.local y reemplaza:')
console.log('   NEXT_PUBLIC_SUPABASE_URL=tu-url-de-supabase-aqui')
console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui')

console.log('\n7. 🗄️  Ejecuta el schema de la base de datos:')
console.log('   npm run db:setup (próximamente)')

console.log('\n📂 Archivo a editar: .env.local')
console.log('🔍 Busca las líneas que empiecen con NEXT_PUBLIC_SUPABASE_')

console.log('\n🎯 Una vez configurado, ejecuta:')
console.log('   npm run dev')
console.log('   npm run db:types (para regenerar tipos)')

console.log('\n✨ ¡Listo! Tu aplicación estará conectada a Supabase')
