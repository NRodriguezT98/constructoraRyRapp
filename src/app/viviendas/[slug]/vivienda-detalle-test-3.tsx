'use client'

import { viviendasService } from '@/modules/viviendas/services/viviendas.service'
import { formatCurrency } from '@/modules/viviendas/utils'
import { formatArea } from '@/shared/utils'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Home } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ViviendaDetalleTest3Props {
  viviendaId: string
}

/**
 * 🧪 TEST FASE 3 - UI Básica SIN Framer Motion
 * Probar estructura HTML pura con estilos
 */
export default function ViviendaDetalleTest3({ viviendaId }: ViviendaDetalleTest3Props) {
  console.log('🧪 [TEST 3] Fase 3 - UI Básica (sin framer-motion)')

  const router = useRouter()

  const { data: vivienda, isLoading } = useQuery({
    queryKey: ['vivienda-test-3', viviendaId],
    queryFn: () => viviendasService.obtenerVivienda(viviendaId),
    enabled: !!viviendaId,
  })

  if (isLoading || !vivienda) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>⏳ Cargando vivienda...</p>
      </div>
    )
  }

  console.log('🧪 [TEST 3] Renderizando UI completa...')

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #fef3c7, #ffffff, #ffedd5)',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(to bottom right, #f97316, #fb923c, #fdba74)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '20px',
        color: 'white',
        boxShadow: '0 10px 25px rgba(249, 115, 22, 0.3)'
      }}>
        <button
          onClick={() => router.push('/viviendas')}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '8px',
            padding: '8px 16px',
            color: 'white',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}
        >
          <ArrowLeft size={16} />
          Volver
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Home size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>
              {vivienda.nomenclatura || `Vivienda ${vivienda.numero}`}
            </h1>
            <p style={{ fontSize: '14px', opacity: 0.9, margin: '4px 0 0 0' }}>
              {vivienda.manzanas?.proyectos?.nombre} • Manzana {vivienda.manzanas?.nombre}
            </p>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
          🧪 TEST Fase 3: UI Básica ✅
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <div>
            <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Número</p>
            <p style={{ fontSize: '16px', fontWeight: 'bold' }}>{vivienda.numero}</p>
          </div>

          <div>
            <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Estado</p>
            <p style={{ fontSize: '16px', fontWeight: 'bold' }}>{vivienda.estado}</p>
          </div>

          <div>
            <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Área</p>
            <p style={{ fontSize: '16px', fontWeight: 'bold' }}>{formatArea(vivienda.area)}</p>
          </div>

          <div>
            <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Valor Base</p>
            <p style={{ fontSize: '16px', fontWeight: 'bold' }}>{formatCurrency(vivienda.valor_base)}</p>
          </div>
        </div>

        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: '#d1fae5',
          borderRadius: '8px',
          border: '1px solid #6ee7b7'
        }}>
          <p style={{ color: '#065f46', fontSize: '14px', margin: 0 }}>
            ✅ UI básica renderizada correctamente SIN framer-motion
          </p>
          <p style={{ color: '#065f46', fontSize: '14px', margin: '8px 0 0 0' }}>
            ⚠️ Si ves esto, el problema está en framer-motion o en los componentes de tabs.
          </p>
        </div>
      </div>
    </div>
  )
}
