/**
 * Estilos y configuraciones para la página de login
 * RyR Constructora - Sistema de Gestión Administrativa
 */

export const loginStyles = {
  // Animaciones de entrada
  animations: {
    branding: {
      initial: { opacity: 0, x: -50 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: 0.6 },
    },
    form: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.6, delay: 0.2 },
    },
    error: {
      initial: { opacity: 0, y: -10 },
      animate: { opacity: 1, y: 0 },
    },
  },

  // Clases de Tailwind centralizadas
  classes: {
    container: 'relative flex min-h-screen items-center justify-center overflow-hidden',
    background: 'absolute inset-0 z-0',
    overlay: 'absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/70',
    content: 'relative z-10 w-full max-w-6xl px-4',
    grid: 'grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12',

    // Branding
    brandingContainer: 'hidden flex-col justify-center lg:flex',
    logo1: 'h-auto w-full max-w-md drop-shadow-2xl',
    logo2: 'h-auto w-full max-w-xs drop-shadow-xl',
    title: 'mb-4 text-4xl font-bold text-white drop-shadow-lg',
    subtitle: 'text-lg text-white/90 drop-shadow-md',

    // Formulario
    formContainer: 'flex items-center justify-center',
    formCard: 'rounded-2xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl',
    formHeader: 'mb-8 text-center',
    formTitle: 'mb-2 text-3xl font-bold text-white drop-shadow-md',
    formSubtitle: 'text-white/80',

    // Inputs
    label: 'mb-2 block text-sm font-medium text-white/90',
    input: 'w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/50 backdrop-blur-sm transition-all focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20',

    // Botones
    submitButton: 'w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 py-3 font-semibold text-white shadow-lg transition-all hover:from-blue-500 hover:to-purple-500 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50',
    toggleButton: 'text-sm text-blue-300 transition-colors hover:text-blue-200 hover:underline',

    // Error
    errorBox: 'rounded-lg border border-red-400/30 bg-red-500/20 p-3 text-sm text-red-200 backdrop-blur-sm',

    // Móvil
    mobileLogo: 'mb-6 flex justify-center lg:hidden',
    mobileLogoImage: 'h-auto w-full max-w-[250px] drop-shadow-2xl',
  },

  // Textos
  texts: {
    welcome: 'Bienvenido',
    createAccount: 'Crear Cuenta',
    loginSubtitle: 'Inicia sesión en tu cuenta',
    signupSubtitle: 'Regístrate para comenzar',
    systemTitle: 'Sistema de Gestión Administrativa',
    systemDescription: 'Plataforma integral para la administración de proyectos, clientes, viviendas y documentación de RyR Constructora',
    emailPlaceholder: 'tu@email.com',
    passwordPlaceholder: '••••••••',
    loading: 'Cargando...',
    login: 'Iniciar Sesión',
    signup: 'Crear Cuenta',
    alreadyHaveAccount: '¿Ya tienes cuenta? Inicia sesión',
    dontHaveAccount: '¿No tienes cuenta? Regístrate',
  },
}
