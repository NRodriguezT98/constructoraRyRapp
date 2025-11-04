import { ClientesPageMain } from '@/modules/clientes/components'
import { RequireView } from '@/modules/usuarios/components'

export default function ClientesPage() {
  return (
    <RequireView modulo="clientes">
      <ClientesPageMain />
    </RequireView>
  )
}
