import { RequireView } from '@/modules/usuarios/components'
import { ViviendasPageMain } from '@/modules/viviendas/components/viviendas-page-main'

export default function ViviendasPage() {
  return (
    <RequireView modulo="viviendas">
      <ViviendasPageMain />
    </RequireView>
  )
}
