import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import { PageTransition } from '../components/page-transition'
import { Sidebar } from '../components/sidebar'
import { ThemeProvider } from '../components/theme-provider'
import { AuthProvider } from '../contexts/auth-context'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RyR Constructora - Sistema de Gestión',
  description: 'Sistema de gestión administrativa para constructora RyR',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='es' suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <ThemeProvider>
            <div className='flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900'>
              <Sidebar />
              <main className='flex-1 overflow-auto custom-scrollbar'>
                <PageTransition>{children}</PageTransition>
              </main>
            </div>
            <Toaster position='top-right' richColors />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
