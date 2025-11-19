'use client'

/**
 * Componente de debugging MÍNIMO para identificar el crash
 * Este componente NO hace NADA más que mostrar el ID
 */
export default function ViviendaDetalleDebug({ viviendaId }: { viviendaId: string }) {
  console.log('🐛 [DEBUG] Componente de debug renderizando con ID:', viviendaId)

  return (
    <div style={{
      padding: '40px',
      backgroundColor: '#e3f2fd',
      color: '#1976d2',
      fontFamily: 'monospace',
      minHeight: '100vh'
    }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>🐛 DEBUG MODE</h1>
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '2px solid #1976d2' }}>
        <p style={{ margin: '10px 0' }}><strong>Vivienda ID:</strong> {viviendaId}</p>
        <p style={{ margin: '10px 0' }}><strong>Timestamp:</strong> {new Date().toISOString()}</p>
        <p style={{ margin: '10px 0', color: '#2e7d32' }}><strong>Estado:</strong> ✅ Componente renderizado correctamente</p>
      </div>
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '4px' }}>
        <p style={{ margin: 0, color: '#856404' }}>
          ⚠️ Este es un componente de debugging mínimo.
          Si ves esto, significa que el problema NO está en el renderizado base del componente cliente.
        </p>
      </div>
    </div>
  )
}
