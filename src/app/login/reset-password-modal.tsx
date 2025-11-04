'use client'

import { supabase } from '@/lib/supabase/client'; // Cliente tradicional con PKCE
import { traducirErrorSupabase } from '@/lib/utils/traducir-errores'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useState } from 'react'

interface ResetPasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ResetPasswordModal({ isOpen, onClose }: ResetPasswordModalProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error

      setSuccess(true)
      setTimeout(() => {
        onClose()
        setSuccess(false)
        setEmail('')
      }, 3000)
    } catch (err: any) {
      const mensajeError = traducirErrorSupabase(err.message || 'Error al enviar email de recuperación')
      setError(mensajeError)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setEmail('')
    setError('')
    setSuccess(false)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className='absolute inset-0 bg-black/60 backdrop-blur-sm'
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className='relative z-10 w-full max-w-md'
          >
            <div className='rounded-2xl border border-white/20 bg-gradient-to-br from-gray-900/95 to-gray-800/95 p-6 shadow-2xl backdrop-blur-xl'>
              {/* Header */}
              <div className='mb-6 flex items-start justify-between'>
                <div>
                  <h2 className='text-2xl font-bold text-white'>
                    Recuperar Contraseña
                  </h2>
                  <p className='mt-1 text-sm text-white/70'>
                    Te enviaremos un enlace para restablecer tu contraseña
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className='rounded-lg p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white'
                >
                  <X className='h-5 w-5' />
                </button>
              </div>

              {!success ? (
                <form onSubmit={handleSubmit} className='space-y-4'>
                  <div>
                    <label className='mb-2 block text-sm font-medium text-white/90'>
                      Email
                    </label>
                    <input
                      type='email'
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className='w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/50 backdrop-blur-sm transition-all focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20'
                      placeholder='tu@email.com'
                      required
                      autoFocus
                    />
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className='rounded-lg border border-red-400/30 bg-red-500/20 p-3 text-sm text-red-200'
                    >
                      {error}
                    </motion.div>
                  )}

                  <div className='flex gap-3'>
                    <button
                      type='button'
                      onClick={handleClose}
                      className='flex-1 rounded-lg border border-white/20 bg-white/5 py-3 font-medium text-white transition-all hover:bg-white/10'
                    >
                      Cancelar
                    </button>
                    <button
                      type='submit'
                      disabled={loading}
                      className='flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 py-3 font-semibold text-white shadow-lg transition-all hover:from-blue-500 hover:to-purple-500 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50'
                    >
                      {loading ? 'Enviando...' : 'Enviar Enlace'}
                    </button>
                  </div>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className='py-4 text-center'
                >
                  <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20'>
                    <svg
                      className='h-8 w-8 text-green-400'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                  </div>
                  <h3 className='mb-2 text-lg font-semibold text-white'>
                    ¡Solicitud Recibida!
                  </h3>
                  <p className='text-sm text-white/70'>
                    Si el email está registrado, recibirás un enlace para
                    restablecer tu contraseña en tu bandeja de entrada.
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
