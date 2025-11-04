/**
 * 📄 PÁGINA: LISTA DE PLANTILLAS DE PROCESO
 *
 * Ruta: /admin/procesos
 */

import { ListaPlantillas } from '@/modules/admin/procesos/components'
import { RequireView } from '@/modules/usuarios/components'

export const metadata = {
  title: 'Gestión de Procesos | RyR Constructora',
  description: 'Administra las plantillas de proceso de negociación'
}

export default function ProcesosPage() {
  return (
    <RequireView modulo="procesos">
      <ListaPlantillas />
    </RequireView>
  )
}
