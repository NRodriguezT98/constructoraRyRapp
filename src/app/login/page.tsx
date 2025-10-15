'use client'

import { motion } from 'framer-motion'
import { useLogin } from './useLogin'

export default function LoginPage() {
  const {
    email,
    password,
    isSignUp,
    loading,
    error,
    setEmail,
    setPassword,
    toggleMode,
    handleSubmit,
  } = useLogin()

  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-4'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='w-full max-w-md'
      >
        <div className='rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl'>
          <div className='mb-8 text-center'>
            <h1 className='mb-2 text-3xl font-bold text-white'>
              RyR Constructora
            </h1>
            <p className='text-white/60'>
              {isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label className='mb-2 block text-sm font-medium text-white/80'>
                Email
              </label>
              <input
                type='email'
                value={email}
                onChange={e => setEmail(e.target.value)}
                className='w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50'
                placeholder='tu@email.com'
                required
              />
            </div>

            <div>
              <label className='mb-2 block text-sm font-medium text-white/80'>
                Contraseña
              </label>
              <input
                type='password'
                value={password}
                onChange={e => setPassword(e.target.value)}
                className='w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50'
                placeholder='••••••••'
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className='rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400'>
                {error}
              </div>
            )}

            <button
              type='submit'
              disabled={loading}
              className='w-full rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 py-3 font-medium text-white transition-all hover:from-purple-500 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-50'
            >
              {loading ? 'Cargando...' : isSignUp ? 'Registrarse' : 'Entrar'}
            </button>
          </form>

          <div className='mt-6 text-center'>
            <button
              onClick={toggleMode}
              className='text-sm text-purple-400 transition-colors hover:text-purple-300'
            >
              {isSignUp
                ? '¿Ya tienes cuenta? Inicia sesión'
                : '¿No tienes cuenta? Regístrate'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
