import { ConditionalLayout } from '@/components/conditional-layout'
import { ConditionalSidebar } from '@/components/conditional-sidebar'
// import { PageTransition } from '@/components/page-transition' // ← DESHABILITADO para navegación instantánea
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/contexts/auth-context'
import { UnsavedChangesProvider } from '@/contexts/unsaved-changes-context'
import { AlertModal, ConfirmModal, ModalProvider } from '@/shared/components/modals'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
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
      <head>
        {/* Suprimir warning de Supabase en desarrollo */}
        {process.env.NODE_ENV === 'development' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                const originalWarn = console.warn;
                console.warn = function(...args) {
                  if (args[0]?.includes?.('Multiple GoTrueClient instances')) {
                    return; // Ignorar este warning específico
                  }
                  originalWarn.apply(console, args);
                };
              `,
            }}
          />
        )}
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <ThemeProvider>
            <ModalProvider>
              <UnsavedChangesProvider>
                <div className='flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900'>
                  <ConditionalSidebar />
                  <ConditionalLayout>
                    {/* PageTransition deshabilitado para navegación instantánea (-400ms) */}
                    {children}
                  </ConditionalLayout>
                </div>
                <Toaster position='top-right' richColors />

                {/* Modales globales */}
                <ConfirmModal />
                <AlertModal />
              </UnsavedChangesProvider>
            </ModalProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
