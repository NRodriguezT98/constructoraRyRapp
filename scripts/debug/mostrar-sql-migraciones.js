#!/usr/bin/env node
/**
 * Script para mostrar SQL de migraciones para copiar/pegar en Supabase Dashboard
 */

const fs = require('fs')
const path = require('path')

console.log('\n========================================')
console.log('  📋 SQL PARA COPIAR EN SUPABASE DASHBOARD')
console.log('========================================\n')

console.log(
  '🔗 URL: https://supabase.com/dashboard/project/swyjhwgvkfcfdtemkyad/sql/new\n'
)

// Migración 1
const file1 = 'supabase/migrations/20251115000001_sistema_estados_version.sql'
const sql1 = fs.readFileSync(file1, 'utf-8')

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('📄 MIGRACIÓN 1: Sistema de Estados de Versión')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
console.log(sql1)
console.log('\n')

// Migración 2
const file2 =
  'supabase/migrations/20251115000002_reemplazo_archivo_metadata.sql'
const sql2 = fs.readFileSync(file2, 'utf-8')

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('📄 MIGRACIÓN 2: Metadata de Reemplazo')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
console.log(sql2)
console.log('\n')

console.log('========================================')
console.log('  ✅ INSTRUCCIONES')
console.log('========================================')
console.log('1. Copia MIGRACIÓN 1 (arriba)')
console.log('2. Pégala en Supabase SQL Editor')
console.log('3. Click RUN ▶️')
console.log('4. Repite con MIGRACIÓN 2')
console.log('5. Ejecuta: npm run types:generate')
console.log('6. Refresca tu navegador')
console.log('========================================\n')
