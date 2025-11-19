/**
 * Helper de debugging - Cargar en consola del navegador
 *
 * Para usar:
 * 1. Abre la consola del navegador (F12)
 * 2. Copia y pega todo este archivo
 * 3. Ejecuta: viewLogs() para ver los logs guardados
 * 4. Ejecuta: viewErrors() para ver errores globales
 */

window.viewLogs = function() {
  try {
    const logs = sessionStorage.getItem('debug-logs')
    if (!logs) {
      console.log('%c📝 No hay logs guardados', 'color: #orange; font-weight: bold; font-size: 14px;')
      return
    }

    const parsed = JSON.parse(logs)
    console.log('%c========== DEBUG LOGS ==========', 'color: #4CAF50; font-weight: bold; font-size: 16px;')
    console.log(`%cTotal de logs: ${parsed.length}`, 'color: #2196F3; font-weight: bold;')
    console.log('')

    parsed.forEach((log, index) => {
      const icon = log.level === 'ERROR' ? '❌' : log.level === 'WARN' ? '⚠️' : '📝'
      const color = log.level === 'ERROR' ? '#f44336' : log.level === 'WARN' ? '#ff9800' : '#4CAF50'

      console.log(`%c${icon} [${index + 1}] ${log.component}`, `color: ${color}; font-weight: bold;`)
      console.log(`   ${log.message}`)
      if (log.data) {
        console.log('   Data:', log.data)
      }
      console.log('')
    })

    console.log('%c================================', 'color: #4CAF50; font-weight: bold; font-size: 16px;')
  } catch (e) {
    console.error('Error al leer logs:', e)
  }
}

window.viewErrors = function() {
  try {
    const errors = sessionStorage.getItem('global-errors')
    if (!errors) {
      console.log('%c✅ No hay errores guardados', 'color: #4CAF50; font-weight: bold; font-size: 14px;')
      return
    }

    const parsed = JSON.parse(errors)
    console.log('%c========== ERRORES GLOBALES ==========', 'color: #f44336; font-weight: bold; font-size: 16px;')
    console.log(`%cTotal de errores: ${parsed.length}`, 'color: #f44336; font-weight: bold;')
    console.log('')

    parsed.forEach((error, index) => {
      console.log(`%c❌ Error ${index + 1} - ${error.timestamp}`, 'color: #f44336; font-weight: bold;')
      console.log(`   Mensaje: ${error.message || error.reason}`)
      if (error.filename) {
        console.log(`   Archivo: ${error.filename}:${error.lineno}:${error.colno}`)
      }
      if (error.stack) {
        console.log(`   Stack:`)
        console.log(error.stack)
      }
      console.log('')
    })

    console.log('%c======================================', 'color: #f44336; font-weight: bold; font-size: 16px;')

    return parsed
  } catch (e) {
    console.error('Error al leer errores:', e)
  }
}

window.clearLogs = function() {
  sessionStorage.removeItem('debug-logs')
  console.log('%c✅ Logs eliminados', 'color: #4CAF50; font-weight: bold;')
}

window.clearErrors = function() {
  sessionStorage.removeItem('global-errors')
  console.log('%c✅ Errores eliminados', 'color: #4CAF50; font-weight: bold;')
}

window.clearAll = function() {
  sessionStorage.removeItem('debug-logs')
  sessionStorage.removeItem('global-errors')
  console.log('%c✅ Todo limpiado', 'color: #4CAF50; font-weight: bold;')
}

window.exportLogs = function() {
  try {
    const logs = sessionStorage.getItem('debug-logs')
    if (!logs) {
      console.log('%c📝 No hay logs para exportar', 'color: #orange; font-weight: bold;')
      return
    }

    const blob = new Blob([logs], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `debug-logs-${new Date().toISOString()}.json`
    a.click()

    console.log('%c✅ Logs exportados', 'color: #4CAF50; font-weight: bold;')
  } catch (e) {
    console.error('Error al exportar logs:', e)
  }
}

console.log('%c🛠️ Debug Helper Loaded!', 'color: #4CAF50; font-weight: bold; font-size: 16px;')
console.log('%cUsa estos comandos:', 'color: #2196F3; font-weight: bold;')
console.log('  viewLogs()    - Ver logs de componentes')
console.log('  viewErrors()  - Ver errores globales capturados')
console.log('  clearLogs()   - Limpiar logs')
console.log('  clearErrors() - Limpiar errores')
console.log('  clearAll()    - Limpiar todo')
console.log('  exportLogs()  - Exportar logs a archivo JSON')
console.log('')
console.log('%c💡 Tip: Los errores se guardan automáticamente aunque la página se recargue', 'color: #ff9800; font-style: italic;')
