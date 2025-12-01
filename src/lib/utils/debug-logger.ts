/**
 * Sistema de logging para debugging
 * Captura errores y los guarda en sessionStorage
 */

export class DebugLogger {
  private static logs: Array<{ timestamp: string; level: string; component: string; message: string; data?: any }> = []
  private static initialized = false

  private static init() {
    if (this.initialized) return

    // Cargar logs previos de sessionStorage
    if (typeof window !== 'undefined') {
      try {
        const savedLogs = sessionStorage.getItem('debug-logs')
        if (savedLogs) {
          this.logs = JSON.parse(savedLogs)
          console.log('🔄 [DEBUG LOGGER] Logs restaurados desde sessionStorage:', this.logs.length)
        }
      } catch (e) {
        console.error('❌ [DEBUG LOGGER] Error al cargar logs:', e)
      }
    }

    this.initialized = true
  }

  static log(component: string, message: string, data?: any) {
    this.init()

    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'LOG',
      component,
      message,
      data,
    }

    this.logs.push(logEntry)
    console.log(`📝 [${component}] ${message}`, data || '')
    this.saveToSession()
  }

  static error(component: string, message: string, error?: any) {
    this.init()

    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      component,
      message,
      data: {
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name,
        } : error,
      },
    }

    this.logs.push(logEntry)
    console.error(`❌ [${component}] ${message}`, error)
    this.saveToSession()
  }

  static warn(component: string, message: string, data?: any) {
    this.init()

    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'WARN',
      component,
      message,
      data,
    }

    this.logs.push(logEntry)
    console.warn(`⚠️ [${component}] ${message}`, data || '')
    this.saveToSession()
  }

  private static saveToSession() {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('debug-logs', JSON.stringify(this.logs, null, 2))
        console.log('💾 [DEBUG LOGGER] Guardado en sessionStorage:', this.logs.length, 'logs')
      }
    } catch (e) {
      console.error('❌ [DEBUG LOGGER] Error al guardar:', e)
    }
  }

  static getLogs() {
    this.init()
    return this.logs
  }

  static clearLogs() {
    this.logs = []
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('debug-logs')
    }
    console.log('🧹 [DEBUG LOGGER] Logs limpiados')
  }

  static printLogs() {
    this.init()
    console.log('========== DEBUG LOGS (' + this.logs.length + ') ==========')
    this.logs.forEach((log, index) => {
      const icon = log.level === 'ERROR' ? '❌' : log.level === 'WARN' ? '⚠️' : '📝'
      console.log(`${index + 1}. ${icon} [${log.timestamp}] [${log.component}] ${log.message}`)
      if (log.data) {
        console.log('   Data:', log.data)
      }
    })
    console.log('================================')
  }
}
