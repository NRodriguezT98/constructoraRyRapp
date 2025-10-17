'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useState } from 'react'
import { ResetPasswordModal } from './reset-password-modal'
import { useLogin } from './useLogin'

export default function LoginPage() {
  const {
    email,
    password,
    loading,
    error,
    estaBloqueado,
    minutosRestantes,
    intentosRestantes,
    setEmail,
    setPassword,
    handleSubmit,
  } = useLogin()

  const [showResetPassword, setShowResetPassword] = useState(false)

  return (
    <div className='relative flex min-h-screen items-center justify-center overflow-hidden'>
      {/* Fondo personalizado */}
      <div className='absolute inset-0 z-0'>
        <Image
          src='/images/fondo-login.png'
          alt='Fondo RyR Constructora'
          fill
          sizes='100vw'
          className='object-cover'
          priority
          quality={90}
        />
        {/* Overlay oscuro para mejorar legibilidad */}
        <div className='absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/70' />
      </div>

      {/* Contenido del login */}
      <div className='relative z-10 w-full max-w-6xl px-4'>
        <div className='grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12'>
          {/* Lado izquierdo - Branding */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className='hidden flex-col justify-center space-y-6 lg:flex'
          >
            {/* Logo principal - versión dark optimizada */}
            <div className='relative mb-4 h-32 w-full'>
              <Image
                src='/images/logo1-dark.png'
                alt='Logo RyR Constructora'
                fill
                sizes='(max-width: 768px) 100vw, 50vw'
                className='object-contain drop-shadow-2xl'
                style={{ filter: 'drop-shadow(0 0 30px rgba(255, 255, 255, 0.3))' }}
                priority
              />
            </div>

            {/* Logo secundario - versión dark optimizada */}
            <div className='relative mb-6 h-24 w-full'>
              <Image
                src='/images/logo2-dark.png'
                alt='Logo RyR Constructora 2'
                fill
                sizes='(max-width: 768px) 100vw, 50vw'
                className='object-contain drop-shadow-xl'
                style={{ filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.2))' }}
              />
            </div>

            <h2 className='mb-4 text-4xl font-bold text-white drop-shadow-lg'>
              Bienvenido al Sistema de Gestión Administrativa de la Constructora RyR
            </h2>
          </motion.div>

          {/* Lado derecho - Formulario */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className='flex items-center justify-center'
          >
            <div className='w-full max-w-md'>
              {/* Logo móvil (solo visible en pantallas pequeñas) - versión dark */}
              <div className='relative mb-6 flex h-24 justify-center lg:hidden'>
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
                <div className='mb-8 text-center'>
                  <h1 className='mb-2 text-3xl font-bold text-white drop-shadow-md'>
                    Bienvenido
                  </h1>
                  <p className='text-white/80'>
                    Inicia sesión en tu cuenta
                  </p>
                </div>

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
                    />
                  </div>

                  <div>
                    <label className='mb-2 block text-sm font-medium text-white/90'>
                      Contraseña
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

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`rounded-lg border p-3 text-sm backdrop-blur-sm ${
                        estaBloqueado
                          ? 'border-red-400/50 bg-red-500/30 text-red-100'
                          : intentosRestantes <= 2 && intentosRestantes > 0
                            ? 'border-yellow-400/30 bg-yellow-500/20 text-yellow-100'
                            : 'border-red-400/30 bg-red-500/20 text-red-200'
                      }`}
                    >
                      {error}
                    </motion.div>
                  )}

                  <button
                    type='submit'
                    disabled={loading || estaBloqueado}
                    className={`w-full rounded-lg py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 ${
                      estaBloqueado
                        ? 'bg-gradient-to-r from-red-600 to-red-700'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500'
                    }`}
                  >
                    {loading ? (
                      <span className='flex items-center justify-center gap-2'>
                        <svg
                          className='h-5 w-5 animate-spin'
                          xmlns='http://www.w3.org/2000/svg'
                          fill='none'
                          viewBox='0 0 24 24'
                        >
                          <circle
                            className='opacity-25'
                            cx='12'
                            cy='12'
                            r='10'
                            stroke='currentColor'
                            strokeWidth='4'
                          ></circle>
                          <path
                            className='opacity-75'
                            fill='currentColor'
                            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                          ></path>
                        </svg>
                        Cargando...
                      </span>
                    ) : estaBloqueado ? (
                      `🔒 Bloqueado (${minutosRestantes} min)`
                    ) : (
                      'Iniciar Sesión'
                    )}
                  </button>
                </form>

                <div className='mt-6 text-center'>
                  <button
                    onClick={() => setShowResetPassword(true)}
                    className='text-sm text-blue-300 transition-colors hover:text-blue-200 hover:underline'
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modal de Reset Password */}
      <ResetPasswordModal
        isOpen={showResetPassword}
        onClose={() => setShowResetPassword(false)}
      />
    </div>
  )
}
