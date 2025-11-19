'use client'

interface ViviendaDetalleMinimalProps {
  viviendaId: string
}

/**
 * VERSIÓN ABSOLUTAMENTE MÍNIMA - SOLO HTML PURO
 */
export default function ViviendaDetalleMinimal({ viviendaId }: ViviendaDetalleMinimalProps) {
  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>Detalle de Vivienda</h1>
      <p>ID: {viviendaId}</p>
      <div style={{ marginTop: '40px', padding: '20px', background: '#f0f0f0', borderRadius: '8px' }}>
        <p>✅ Componente renderizado correctamente</p>
        <p>⚠️ Este es HTML puro sin dependencias</p>
      </div>
    </div>
  )
}
