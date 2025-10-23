/**
 * 📄 PÁGINA: CREAR NUEVA PLANTILLA
 *
 * Ruta: /admin/procesos/nueva
 * Nota: Esta página ya no se usa, el modal se abre desde la lista
 */

import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Nueva Plantilla de Proceso | RyR Constructora',
  description: 'Crear nueva plantilla de proceso de negociación'
}

export default function NuevaPlantillaPage() {
  // Redirige a la lista donde se abre el modal
  redirect('/admin/procesos')

  return null
}
