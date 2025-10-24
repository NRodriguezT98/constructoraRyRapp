/**
 * EJEMPLO: Cómo usar el Performance Monitor en tus componentes
 */

'use client'

import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor'
import { useEffect, useState } from 'react'

export function EjemploClientesPage() {
  const { markDataLoaded, mark } = usePerformanceMonitor('ClientesPage')
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function cargarDatos() {
      // Marcar inicio de carga
      mark('Inicio carga de clientes')

      setLoading(true)

      try {
        // Simular llamada a API
        const response = await fetch('/api/clientes')
        mark('API respondió')

        const data = await response.json()
        mark('JSON parseado')

        setClientes(data)
        mark('Estado actualizado')

        // ✅ MARCAR QUE LOS DATOS SE CARGARON
        markDataLoaded()
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    cargarDatos()
  }, [markDataLoaded, mark])

  if (loading) {
    return <div>Cargando...</div>
  }

  return (
    <div>
      <h1>Clientes ({clientes.length})</h1>
      {/* ... resto del componente */}
    </div>
  )
}

/**
 * SALIDA EN CONSOLA:
 *
 * 🚀 NAVEGACIÓN → /clientes (ClientesPage)
 * 🔖 Inicio carga de clientes +5.23ms
 * 🔖 API respondió +234.56ms
 * 🔖 JSON parseado +237.12ms
 * 🔖 Estado actualizado +238.45ms
 * 📊 MÉTRICAS - /clientes
 *   ⏱️  Primer Render: 2.45ms
 *   📦 Datos Cargados: 238.45ms
 *   🎯 Tiempo Total: 238.45ms
 *   🔄 Re-renders: 2
 */
