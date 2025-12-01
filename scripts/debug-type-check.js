#!/usr/bin/env node
/**
 * Script de debug para ver la salida cruda de type-check
 */

const { exec } = require('child_process')
const fs = require('fs')

exec('npm run type-check 2>&1', { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
  const output = stdout + '\n' + stderr

  // Guardar salida cruda
  fs.writeFileSync('type-check-output-raw.txt', output)

  console.log('✓ Salida guardada en: type-check-output-raw.txt')
  console.log('')

  // Mostrar primeras 50 líneas
  const lines = output.split('\n')
  console.log(`Total de líneas: ${lines.length}`)
  console.log('')
  console.log('Primeras 50 líneas:')
  console.log('='.repeat(80))
  lines.slice(0, 50).forEach((line, i) => {
    console.log(`${(i + 1).toString().padStart(3, ' ')}: ${line}`)
  })
  console.log('='.repeat(80))

  // Buscar pattern de errores
  console.log('')
  console.log('Líneas que contienen "error TS":')
  console.log('='.repeat(80))
  lines.filter(l => l.includes('error TS')).slice(0, 20).forEach(line => {
    console.log(line)
  })
  console.log('='.repeat(80))
})
