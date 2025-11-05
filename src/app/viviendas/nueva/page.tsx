/**
 * Vista dedicada: Nueva Vivienda
 * Ruta: /viviendas/nueva
 * Formulario de 5 pasos con diseño espacioso
 */

import { NuevaViviendaView } from '@/modules/viviendas/components/nueva-vivienda-view'

export const metadata = {
  title: 'Nueva Vivienda | RyR Constructora',
  description: 'Registra una nueva vivienda en el sistema',
}

export default function NuevaViviendaPage() {
  return <NuevaViviendaView />
}
