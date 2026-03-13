import type { Metadata, Viewport } from 'next'
import { Toaster } from 'sonner'

import { Inter } from 'next/font/google'

import { IdleTimerProvider } from '@/components/IdleTimerProvider'
import { SessionInterceptor } from '@/components/SessionInterceptor'
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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f9fafb' },
    { media: '(prefers-color-scheme: dark)', color: '#111827' },
  ],
}

export const metadata: Metadata = {
  title: {
    default: 'RyR Constructora - Sistema de Gestión',
    template: '%s | RyR Constructora',
  },
  description: 'Sistema de gestión administrativa para constructora RyR',
  icons: {
    icon: '/images/favicon.png',
  },
  robots: {
    index: false,
    follow: false,
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
              `,
            }}
          />
        )}
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <SessionInterceptor>
          <ReactQueryProvider>
            <AuthProvider>
            {/* Sistema profesional de inactividad */}
            <IdleTimerProvider />

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

                  <Toaster
                    position='bottom-right'
                    duration={4000}
                    gap={8}
                    toastOptions={{
                      // Fallback para toast.success/error() legacy — los toast.custom() ignoran esto
                      unstyled: true,
                      classNames: {
                        toast: 'relative flex w-[360px] items-start gap-3 overflow-hidden rounded-xl border-l-[3px] border border-white/[0.07] bg-gray-950 p-4 pr-10 shadow-[0_24px_64px_rgba(0,0,0,0.5)]',
                        title: 'text-[13px] font-semibold leading-snug text-white',
                        description: 'mt-0.5 text-[11.5px] leading-relaxed text-white/45',
                        icon: 'mt-px shrink-0',
                        closeButton: 'absolute right-2.5 top-[13px] flex h-[22px] w-[22px] cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-white/25 transition-colors hover:bg-white/[0.08] hover:text-white/60',
                        success: 'border-l-emerald-500',
                        error: 'border-l-red-500',
                        info: 'border-l-blue-500',
                        warning: 'border-l-amber-400',
                      },
                    }}
                  />

                  {/* Modales globales */}
                  <ConfirmModal />
                  <AlertModal />
                </UnsavedChangesProvider>
              </ModalProvider>
            </ThemeProvider>
            </AuthProvider>
          </ReactQueryProvider>
        </SessionInterceptor>
      </body>
    </html>
  )
}
