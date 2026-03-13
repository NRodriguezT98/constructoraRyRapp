import { getServerPermissions } from '@/lib/auth/server'
import { redirect } from 'next/navigation'
import { EntidadesFinancierasAdminContent } from './entidades-financieras-admin-content'

export const metadata = {
  title: 'Entidades Financieras | Admin',
  description: 'Administración de bancos, cajas de compensación y cooperativas',
}

export default async function EntidadesFinancierasAdminPage() {
  const { isAdmin } = await getServerPermissions()

  if (!isAdmin) {
    redirect('/dashboard')
  }

  return <EntidadesFinancierasAdminContent />
}
