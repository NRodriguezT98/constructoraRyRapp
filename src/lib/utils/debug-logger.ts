/**
 * Sistema de logging para debugging
 * Captura errores y los guarda en sessionStorage
 */

export class DebugLogger {
  private static logs: Array<{ timestamp: string; level: string; component: string; message: string; data?: any }> = []

  static log(component: string, message: string, data?: any) {
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
      }
    } catch (e) {
      // Ignorar errores de sessionStorage
    }
  }

  static getLogs() {
    return this.logs
  }

  static clearLogs() {
    this.logs = []
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('debug-logs')
    }
  }

  static printLogs() {
    console.log('========== DEBUG LOGS ==========')
    this.logs.forEach(log => {
      const icon = log.level === 'ERROR' ? '❌' : log.level === 'WARN' ? '⚠️' : '📝'
      console.log(`${icon} [${log.timestamp}] [${log.component}] ${log.message}`)
      if (log.data) {
        console.log('   Data:', log.data)
      }
    })
    console.log('================================')
  }
}
