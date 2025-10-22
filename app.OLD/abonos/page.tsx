// =====================================================
// RUTA: /abonos
// Página del módulo de Abonos
// =====================================================

import { AbonosDashboard } from '@/modules/abonos';

export const metadata = {
  title: 'Gestión de Abonos | RyR Constructora',
  description: 'Sistema de gestión y registro de abonos para negociaciones activas',
};

export default function AbonosPage() {
  return <AbonosDashboard />;
}

