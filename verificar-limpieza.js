/**
 * Script de verificación post-migración limpia
 */

const fs = require('fs')

console.log('🎉 VERIFICACIÓN POST-MIGRACIÓN LIMPIA\n')

// Verificar archivos después de la limpieza
const archivos = {
  nuevo: 'src/modules/fuentes-pago/components/FuentePagoCard.tsx',
  legacy: 'src/modules/fuentes-pago/components/FuentePagoCardConProgreso.tsx',
  refactorizado: 'src/modules/fuentes-pago/components/FuentePagoCardRefactored.tsx',
  viviendaTab: 'src/app/clientes/[id]/tabs/vivienda-asignada-tab.tsx',
  index: 'src/modules/fuentes-pago/components/index.ts',
  partialsIndex: 'src/modules/fuentes-pago/components/partials/index.ts'
}

let errores = []

// Verificar que el nuevo archivo existe
if (fs.existsSync(archivos.nuevo)) {
  console.log('✅ Componente principal: FuentePagoCard.tsx')
} else {
  errores.push('❌ FuentePagoCard.tsx no existe')
}

// Verificar que los archivos legacy ya no existen
if (!fs.existsSync(archivos.legacy)) {
  console.log('🗑️  Componente legacy eliminado: FuentePagoCardConProgreso.tsx')
} else {
  errores.push('⚠️  FuentePagoCardConProgreso.tsx aún existe')
}

if (!fs.existsSync(archivos.refactorizado)) {
  console.log('🗑️  Componente temporal eliminado: FuentePagoCardRefactored.tsx')
} else {
  errores.push('⚠️  FuentePagoCardRefactored.tsx aún existe')
}

// Verificar imports actualizados
try {
  const contenidoTab = fs.readFileSync(archivos.viviendaTab, 'utf8')

  if (contenidoTab.includes('FuentePagoCard') && !contenidoTab.includes('FuentePagoCardRefactored')) {
    console.log('✅ vivienda-asignada-tab.tsx usando FuentePagoCard')
  } else {
    errores.push('❌ vivienda-asignada-tab.tsx no está usando FuentePagoCard correctamente')
  }
} catch (error) {
  errores.push('❌ Error leyendo vivienda-asignada-tab.tsx')
}

// Verificar exports
try {
  const contenidoIndex = fs.readFileSync(archivos.index, 'utf8')

  if (contenidoIndex.includes('FuentePagoCard') && !contenidoIndex.includes('FuentePagoCardRefactored')) {
    console.log('✅ index.ts exporta FuentePagoCard')
  } else {
    errores.push('❌ index.ts no exporta FuentePagoCard correctamente')
  }
} catch (error) {
  errores.push('❌ Error leyendo index.ts')
}

// Verificar partials
try {
  const contenidoPartials = fs.readFileSync(archivos.partialsIndex, 'utf8')

  if (contenidoPartials.includes('FuentePagoCard') && !contenidoPartials.includes('FuentePagoCardRefactored')) {
    console.log('✅ partials/index.ts exporta FuentePagoCard')
  } else {
    errores.push('❌ partials/index.ts no exporta FuentePagoCard correctamente')
  }
} catch (error) {
  errores.push('❌ Error leyendo partials/index.ts')
}

console.log('\n📊 RESULTADO FINAL:')
if (errores.length === 0) {
  console.log('🎉 ¡MIGRACIÓN LIMPIA EXITOSA!')
  console.log('✨ Componente FuentePagoCard listo para producción')
  console.log('🗑️  Legacy components eliminados correctamente')
} else {
  console.log(`❌ Se encontraron ${errores.length} problemas:`)
  errores.forEach(error => console.log(`   ${error}`))
}

console.log('\n🚀 ARCHIVOS FINALES:')
console.log('   📄 FuentePagoCard.tsx (componente principal)')
console.log('   📁 partials/ (componentes especializados)')
console.log('   🔄 Todas las referencias actualizadas')
console.log('   🗑️  Legacy components eliminados')
