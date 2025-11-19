import type { Metadata } from 'next'
import { Toaster } from 'sonner'

import { Inter } from 'next/font/google'

import { AutoLogoutProvider } from '@/components/auto-logout-provider'
import { ConditionalLayout } from '@/components/conditional-layout'
import { ConditionalSidebar } from '@/components/conditional-sidebar'
import { ProtectedApp } from '@/components/protected-app'
// import { PageTransition } from '@/components/page-transition' // ← DESHABILITADO para navegación instantánea
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/contexts/auth-context'
import { UnsavedChangesProvider } from '@/contexts/unsaved-changes-context'
import { ReactQueryProvider } from '@/lib/react-query'
import { AlertModal, ConfirmModal, ModalProvider } from '@/shared/components/modals'

import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RyR Constructora - Sistema de Gestión',
  description: 'Sistema de gestión administrativa para constructora RyR',
  icons: {
    icon: '/icon.svg',
  },
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

                // 🛠️ CAPTURAR ERRORES GLOBALES ANTES DE QUE CRASHEE
                window.addEventListener('error', function(e) {
                  console.error('🔴 [GLOBAL ERROR HANDLER]', {
                    message: e.message,
                    filename: e.filename,
                    lineno: e.lineno,
                    colno: e.colno,
                    error: e.error,
                    stack: e.error?.stack
                  });

                  // Guardar en sessionStorage
                  try {
                    const errors = JSON.parse(sessionStorage.getItem('global-errors') || '[]');
                    errors.push({
                      timestamp: new Date().toISOString(),
                      message: e.message,
                      filename: e.filename,
                      lineno: e.lineno,
                      colno: e.colno,
                      stack: e.error?.stack
                    });
                    sessionStorage.setItem('global-errors', JSON.stringify(errors, null, 2));
                  } catch (err) {
                    console.error('Error guardando en sessionStorage:', err);
                  }
                });

                window.addEventListener('unhandledrejection', function(e) {
                  console.error('🔴 [UNHANDLED PROMISE REJECTION]', {
                    reason: e.reason,
                    promise: e.promise
                  });

                  // Guardar en sessionStorage
                  try {
                    const errors = JSON.parse(sessionStorage.getItem('global-errors') || '[]');
                    errors.push({
                      timestamp: new Date().toISOString(),
                      type: 'unhandledrejection',
                      reason: e.reason?.toString(),
                      stack: e.reason?.stack
                    });
                    sessionStorage.setItem('global-errors', JSON.stringify(errors, null, 2));
                  } catch (err) {
                    console.error('Error guardando en sessionStorage:', err);
                  }
                });

                console.log('%c🛡️ Global Error Handler Activo', 'color: #4CAF50; font-weight: bold; font-size: 14px;');
              `,
            }}
          />
        )}
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ReactQueryProvider>
          <AuthProvider>
            {/* Sistema de auto-logout por inactividad */}
            <AutoLogoutProvider />

            <ThemeProvider>
              <ModalProvider>
                <UnsavedChangesProvider>
                  {/* 🔐 VALIDACIÓN DE ROL: Bloquea TODO si el rol es inválido */}
                  <ProtectedApp>
                    <div className='flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900'>
                      <ConditionalSidebar />
                      <ConditionalLayout>
                        {/* PageTransition deshabilitado para navegación instantánea (-400ms) */}
                        {children}
                      </ConditionalLayout>
                    </div>
                  </ProtectedApp>

                  <Toaster position='top-right' richColors />

                  {/* Modales globales */}
                  <ConfirmModal />
                  <AlertModal />
                </UnsavedChangesProvider>
              </ModalProvider>
            </ThemeProvider>
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  )
}
