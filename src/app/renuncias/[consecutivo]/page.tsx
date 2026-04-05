/**
 * ============================================
 * PÁGINA: Expediente de Renuncia
 * ============================================
 *
 * ✅ PROTEGIDA POR MIDDLEWARE
 * - Middleware ya validó autenticación
 * - Middleware ya validó permisos (Administrador, Gerencia)
 *
 * Ruta: /renuncias/[consecutivo]
 * Ejemplo: /renuncias/REN-2025-001
 */

import { ExpedienteRenunciaPage } from '@/modules/renuncias/components/expediente'

interface PageProps {
  params: Promise<{ consecutivo: string }>
}

export default async function RenunciaExpedientePage({ params }: PageProps) {
  const { consecutivo } = await params

  return (
    <ExpedienteRenunciaPage consecutivo={decodeURIComponent(consecutivo)} />
  )
}
