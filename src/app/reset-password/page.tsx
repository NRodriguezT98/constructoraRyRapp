'use client'

import { supabase } from '@/lib/supabase/client-browser'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Verificar si hay un token de reset en la URL
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Usuario tiene token válido para resetear contraseña
      }
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) throw error

      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Error al actualizar contraseña')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='relative flex min-h-screen items-center justify-center overflow-hidden'>
      {/* Fondo personalizado */}
      <div className='absolute inset-0 z-0'>
        <Image
          src='/images/fondo-login.png'
          alt='Fondo RyR Constructora'
          fill
          className='object-cover'
          priority
          quality={100}
        />
        <div className='absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/70' />
      </div>

      {/* Contenido */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className='relative z-10 w-full max-w-md px-4'
      >
        {/* Logo móvil */}
        <div className='relative mb-6 flex h-24 justify-center'>
          <Image
            src='/images/logo1-dark.png'
            alt='Logo RyR Constructora'
            fill
            className='object-contain drop-shadow-2xl'
            style={{ filter: 'drop-shadow(0 0 30px rgba(255, 255, 255, 0.3))' }}
            priority
          />
        </div>

        <div className='rounded-2xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl'>
          {!success ? (
            <>
              <div className='mb-8 text-center'>
                <h1 className='mb-2 text-3xl font-bold text-white drop-shadow-md'>
                  Nueva Contraseña
                </h1>
                <p className='text-white/80'>
                  Ingresa tu nueva contraseña
                </p>
              </div>

              <form onSubmit={handleSubmit} className='space-y-4'>
                <div>
                  <label className='mb-2 block text-sm font-medium text-white/90'>
                    Nueva Contraseña
                  </label>
                  <input
                    type='password'
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className='w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/50 backdrop-blur-sm transition-all focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20'
                    placeholder='••••••••'
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label className='mb-2 block text-sm font-medium text-white/90'>
                    Confirmar Contraseña
                  </label>
                  <input
                    type='password'
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className='w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/50 backdrop-blur-sm transition-all focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20'
                    placeholder='••••••••'
                    required
                    minLength={6}
                  />
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='rounded-lg border border-red-400/30 bg-red-500/20 p-3 text-sm text-red-200 backdrop-blur-sm'
                  >
                    {error}
                  </motion.div>
                )}

                <button
                  type='submit'
                  disabled={loading}
                  className='w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 py-3 font-semibold text-white shadow-lg transition-all hover:from-blue-500 hover:to-purple-500 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50'
                >
                  {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                </button>
              </form>

              <div className='mt-6 text-center'>
                <button
                  onClick={() => router.push('/login')}
                  className='text-sm text-blue-300 transition-colors hover:text-blue-200 hover:underline'
                >
                  Volver al login
                </button>
              </div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className='py-8 text-center'
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
                ¡Contraseña Actualizada!
              </h3>
              <p className='text-sm text-white/70'>
                Redirigiendo al login...
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
