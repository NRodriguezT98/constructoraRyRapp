import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { useAuth } from '../../contexts/auth-context'

interface UseLoginReturn {
  email: string
  password: string
  isSignUp: boolean
  loading: boolean
  error: string
  setEmail: (email: string) => void
  setPassword: (password: string) => void
  toggleMode: () => void
  handleSubmit: (e: React.FormEvent) => Promise<void>
}

/**
 * Hook personalizado para manejar la lógica de autenticación
 * Separa la lógica de negocio del componente de presentación
 */
export function useLogin(): UseLoginReturn {
  // Estados
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Hooks externos
  const { signIn, signUp } = useAuth()
  const router = useRouter()

  // Toggle entre login y registro
  const toggleMode = useCallback(() => {
    setIsSignUp(prev => !prev)
    setError('') // Limpiar error al cambiar de modo
  }, [])

  // Handler del formulario
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError('')
      setLoading(true)

      try {
        if (isSignUp) {
          await signUp(email, password)
          alert('Verifica tu email para activar la cuenta')
        } else {
          await signIn(email, password)
          router.push('/proyectos')
        }
      } catch (err: any) {
        setError(err.message || 'Error de autenticación')
      } finally {
        setLoading(false)
      }
    },
    [email, password, isSignUp, signIn, signUp, router]
  )

  return {
    email,
    password,
    isSignUp,
    loading,
    error,
    setEmail,
    setPassword,
    toggleMode,
    handleSubmit,
  }
}
