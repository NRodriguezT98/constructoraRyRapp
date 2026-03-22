/**
 * Vista dedicada: Nueva Vivienda (Accordion Wizard)
 * Ruta: /viviendas/nueva
 * Formulario de 5 pasos con diseño accordion
 */

import { NuevaViviendaAccordionView } from '@/modules/viviendas/components/NuevaViviendaAccordionView'

export const metadata = {
  title: 'Nueva Vivienda | RyR Constructora',
  description: 'Registra una nueva vivienda en el sistema',
}

export default function NuevaViviendaPage() {
  return <NuevaViviendaAccordionView />
}
