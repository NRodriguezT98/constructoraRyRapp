import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login - RyR Constructora',
  description: 'Iniciar sesión en el sistema de gestión administrativa',
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
