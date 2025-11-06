'use client'

import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
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
    loginExitoso,
    mensajeExito,
    setEmail,
    setPassword,
    handleSubmit,
  } = useLogin()

  const [showResetPassword, setShowResetPassword] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showToast, setShowToast] = useState(false)

  // Limpiar sesiones corruptas al montar
  useEffect(() => {
    // Solo limpiar si hay parámetros sospechosos que indiquen loop
    const params = new URLSearchParams(window.location.search)
    if (params.get('redirectedFrom')) {
      // Dar tiempo al middleware para procesar
      setTimeout(() => {
        // Verificación silenciosa de sesión corrupta
        if (window.location.pathname === '/login') {
          // Sesión limpiada por middleware
        }
      }, 1000)
    }
  }, [])

  // Mostrar toast cuando login es exitoso
  // ❌ DESACTIVADO: Ahora usamos toast moderno personalizado en useLogin.ts
  // useEffect(() => {
  //   if (loginExitoso) {
  //     setShowToast(true)
  //   }
  // }, [loginExitoso])

  return (
    <div className='relative flex min-h-screen w-full items-center justify-center overflow-hidden'>
      {/* Fondo personalizado - FULL WIDTH */}
      <div className='fixed inset-0 z-0 h-screen w-screen'>
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

      {/* Contenido del login - ABSOLUTAMENTE CENTRADO */}
      <div className='relative z-10 mx-auto flex max-w-2xl flex-col items-center justify-center px-4'>
        {/* Branding - Logo principal centrado */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='mb-8 flex w-full flex-col items-center justify-center space-y-4 text-center'
        >
          {/* Logo principal - versión dark optimizada */}
          <div className='relative h-28 w-full max-w-md'>
            <Image
              src='/images/logo1-dark.png'
              alt='Logo RyR Constructora'
              fill
              sizes='(max-width: 768px) 100vw, 600px'
              className='object-contain drop-shadow-2xl'
              style={{ filter: 'drop-shadow(0 0 30px rgba(255, 255, 255, 0.3))' }}
              priority
            />
          </div>

          <h2 className='mt-4 max-w-xl text-2xl font-bold text-white drop-shadow-lg lg:text-3xl'>
            Bienvenido al Sistema de Gestión Administrativa de la Constructora RyR
          </h2>
        </motion.div>

        {/* Formulario - Centrado debajo de los logos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className='w-full max-w-md'
        >
          <div className='rounded-2xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl'>
                {/* Logo secundario dentro del formulario */}
                <div className='relative mb-6 h-16 w-full'>
                  <Image
                    src='/images/logo2-dark.png'
                    alt='Logo RyR Constructora 2'
                    fill
                    sizes='(max-width: 768px) 100vw, 600px'
                    className='object-contain drop-shadow-xl'
                    style={{ filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.2))' }}
                  />
                </div>

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
                    <div className='relative'>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className='w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 pr-12 text-white placeholder-white/50 backdrop-blur-sm transition-all focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20'
                        placeholder='••••••••'
                        required
                        minLength={6}
                      />
                      <button
                        type='button'
                        onClick={() => setShowPassword(!showPassword)}
                        className='absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-white/70 transition-all hover:bg-white/10 hover:text-white'
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className='h-5 w-5' />
                        ) : (
                          <Eye className='h-5 w-5' />
                        )}
                      </button>
                    </div>
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
                    disabled={loading || estaBloqueado || loginExitoso}
                    className={`w-full rounded-lg py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 ${
                      estaBloqueado
                        ? 'bg-gradient-to-r from-red-800 to-red-900'
                        : loginExitoso
                          ? 'bg-gradient-to-r from-green-600 to-green-700'
                          : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600'
                    }`}
                  >
                    {loginExitoso ? (
                      <span className='flex items-center justify-center gap-2'>
                        <svg
                          className='h-5 w-5'
                          xmlns='http://www.w3.org/2000/svg'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M5 13l4 4L19 7'
                          />
                        </svg>
                        ¡Inicio Exitoso!
                      </span>
                    ) : loading ? (
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
                        Validando...
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
        </motion.div>
      </div>

      {/* Modal de Reset Password */}
      <ResetPasswordModal
        isOpen={showResetPassword}
        onClose={() => setShowResetPassword(false)}
      />

      {/* ❌ TOAST VIEJO DESACTIVADO - Ahora usamos toast moderno en useLogin.ts */}
      {/* <Toast
        show={showToast}
        message={mensajeExito}
        onClose={() => setShowToast(false)}
        type="success"
        duration={2000}
      /> */}
    </div>
  )
}
