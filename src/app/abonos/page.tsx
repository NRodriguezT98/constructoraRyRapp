import { RequireView } from '@/modules/usuarios/components'
import { AbonosListPage } from './components/abonos-list-page'

/**
 * 🎯 RUTA: /abonos
 *
 * Vista principal del módulo de abonos
 * Lista TODOS los abonos del sistema con filtros y búsqueda
 */
export default function AbonosPage() {
  return (
    <RequireView modulo="abonos">
      <AbonosListPage />
    </RequireView>
  )
}
