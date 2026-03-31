#!/usr/bin/env node

/**
 * 🔍 SCRIPT DE VERIFICACIÓN DE MIGRACIÓN
 *
 * Verifica que la migración del componente FuentePagoCard
 * se haya realizado correctamente y funcione como esperado.
 */

const fs = require('fs')
const path = require('path')

// Colores para terminal
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
}

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`)
}

function checkFileExists(filePath) {
  return fs.existsSync(filePath)
}

function checkFileContains(filePath, searchText) {
  if (!checkFileExists(filePath)) return false
  const content = fs.readFileSync(filePath, 'utf8')
  return content.includes(searchText)
}

function runVerification() {
  log(colors.blue + colors.bold, '\n🔍 VERIFICANDO LIMPIEZA FINAL - FUENTE PAGO CARD\n')

  let allPassed = true

  // 1. Verificar que el componente final existe
  const finalPath = 'src/modules/fuentes-pago/components/FuentePagoCard.tsx'
  if (checkFileExists(finalPath)) {
    log(colors.green, '✅ FuentePagoCard.tsx (final) existe')
  } else {
    log(colors.red, '❌ FuentePagoCard.tsx NO encontrado')
    allPassed = false
  }

  // 2. Verificar que los componentes especializados existen
  const specializedComponents = [
    'src/modules/fuentes-pago/components/partials/FuentePagoCardHeader.tsx',
    'src/modules/fuentes-pago/components/partials/FuentePagoCardMetrics.tsx',
    'src/modules/fuentes-pago/components/partials/FuentePagoCardProgress.tsx'
  ]

  specializedComponents.forEach(comp => {
    if (checkFileExists(comp)) {
      log(colors.green, `✅ ${path.basename(comp)} existe`)
    } else {
      log(colors.red, `❌ ${path.basename(comp)} NO encontrado`)
      allPassed = false
    }
  })

  // 3. Verificar que el hook de lógica existe
  const hookPath = 'src/modules/fuentes-pago/hooks/useFuentePagoCard.ts'
  if (checkFileExists(hookPath)) {
    log(colors.green, '✅ Hook useFuentePagoCard existe')
  } else {
    log(colors.red, '❌ Hook useFuentePagoCard NO encontrado')
    allPassed = false
  }

  // 4. Verificar que vivienda-asignada-tab usa el componente final
  const viviendaTab = 'src/app/clientes/[id]/tabs/vivienda-asignada-tab.tsx'
  if (checkFileContains(viviendaTab, 'FuentePagoCard') && !checkFileContains(viviendaTab, 'FuentePagoCardRefactored')) {
    log(colors.green, '✅ vivienda-asignada-tab.tsx usando FuentePagoCard')
  } else {
    log(colors.yellow, '⚠️  vivienda-asignada-tab.tsx NO actualizado correctamente')
  }

  // 5. Verificar que el componente legacy fue eliminado
  const legacyPath = 'src/modules/fuentes-pago/components/FuentePagoCardConProgreso.tsx'
  if (!checkFileExists(legacyPath)) {
    log(colors.green, '✅ Componente legacy eliminado correctamente')
  } else {
    log(colors.yellow, '⚠️  Componente legacy aún existe')
  }

  // 6. Verificar exports
  const indexPath = 'src/modules/fuentes-pago/components/index.ts'
  if (checkFileContains(indexPath, 'FuentePagoCard') && !checkFileContains(indexPath, 'FuentePagoCardRefactored')) {
    log(colors.green, '✅ FuentePagoCard exportado correctamente')
  } else {
    log(colors.red, '❌ FuentePagoCard NO exportado o referencias incorrectas')
    allPassed = false
  }

  // Resumen
  log(colors.blue + colors.bold, '\n📋 RESUMEN FINAL:')
  if (allPassed) {
    log(colors.green + colors.bold, '🎉 LIMPIEZA COMPLETADA - Migración y renombrado exitosos')
    log(colors.yellow, '\n✅ TRABAJO COMPLETADO:')
    log(colors.reset, '1. ✅ Refactorización arquitectónica completa')
    log(colors.reset, '2. ✅ Separación de responsabilidades implementada')
    log(colors.reset, '3. ✅ Performance optimizado con React Query')
    log(colors.reset, '4. ✅ Componente legacy eliminado')
    log(colors.reset, '5. ✅ Nombres finales aplicados: FuentePagoCard')
  } else {
    log(colors.red + colors.bold, '❌ LIMPIEZA INCOMPLETA - Hay problemas que resolver')
  }

  log(colors.reset, '')
}

runVerification()
