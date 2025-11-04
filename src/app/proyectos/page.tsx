import { RequireView } from '@/modules/usuarios/components'
import { ProyectosPage } from '../../modules/proyectos/components/proyectos-page-main'

export default function Proyectos() {
  return (
    <RequireView modulo="proyectos">
      <ProyectosPage />
    </RequireView>
  )
}
