/**
 * Estilos centralizados para la página Dashboard
 * Siguiendo arquitectura limpia: separación de estilos
 */

// Container principal
export const containerClasses = 'relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'

// Elementos de fondo animados
export const backgroundElements = {
  container: 'absolute inset-0 z-0',
  blob1: 'absolute left-20 top-20 h-96 w-96 animate-pulse rounded-full bg-blue-300/10 mix-blend-multiply blur-3xl filter dark:bg-blue-500/5',
  blob2: 'absolute right-20 top-40 h-96 w-96 animate-pulse rounded-full bg-purple-300/10 mix-blend-multiply blur-3xl filter delay-1000 dark:bg-purple-500/5',
  blob3: 'absolute bottom-40 left-1/2 h-96 w-96 animate-pulse rounded-full bg-pink-300/10 mix-blend-multiply blur-3xl filter delay-2000 dark:bg-pink-500/5',
}

// Hero Section
export const heroClasses = {
  section: 'relative z-10 px-6 py-12',
  container: 'container mx-auto text-center',
  badge: 'mb-6 border border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-3 text-sm font-medium dark:border-blue-700 dark:from-blue-900/30 dark:to-purple-900/30',
  badgeIcon: 'mr-2 h-4 w-4 text-blue-600 dark:text-blue-400',
  title: 'mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-6xl font-extrabold leading-tight text-transparent md:text-8xl',
  description: 'mx-auto mb-10 max-w-4xl text-xl leading-relaxed text-gray-600 dark:text-gray-300 md:text-2xl',
  descriptionHighlight: 'font-semibold text-blue-600 dark:text-blue-400',
}

// Botones principales (CORREGIDOS - sin line-height excesivo)
export const buttonClasses = {
  primary: 'group transform bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-base text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-purple-700 hover:shadow-3xl',
  secondary: 'group transform border-2 border-gray-300 bg-white/80 px-8 py-4 text-base shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-gray-50 hover:shadow-2xl dark:border-gray-600 dark:bg-gray-800/80 dark:hover:bg-gray-700',
  icon: 'h-5 w-5',
  iconStart: 'mr-2 h-5 w-5',
  iconEnd: 'ml-2 h-5 w-5',
}

// Stats cards
export const statsClasses = {
  container: 'mb-20 grid grid-cols-2 gap-8 md:grid-cols-4',
  card: 'group rounded-3xl border border-gray-200 bg-white/90 p-8 shadow-2xl backdrop-blur-md transition-all duration-500 hover:scale-105 hover:shadow-3xl dark:border-gray-700 dark:bg-gray-800/90',
  iconContainer: 'mx-auto mb-4 w-fit rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 p-4 transition-transform duration-300 group-hover:scale-110',
  icon: 'h-8 w-8 text-white',
  value: 'mb-2 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-4xl font-bold text-transparent dark:from-white dark:to-gray-300',
  label: 'text-sm font-medium text-gray-600 dark:text-gray-300',
}

// Módulos
export const modulesClasses = {
  section: 'relative z-10 px-6 py-12',
  container: 'container mx-auto',
  header: 'mb-16 text-center',
  headerBadge: 'mb-4 bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-2 text-sm font-medium dark:from-gray-800 dark:to-gray-700',
  headerTitle: 'mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-5xl font-bold text-transparent dark:from-white dark:to-gray-300',
  headerDescription: 'mx-auto max-w-3xl text-xl text-gray-600 dark:text-gray-300',
  grid: 'grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3',
}

// Module Card
export const moduleCardClasses = {
  cardBase: 'group relative h-full cursor-pointer overflow-hidden border-2 transition-all duration-500 hover:shadow-3xl',
  overlay: 'absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-5',
  header: 'relative z-10 pb-4',
  iconContainer: 'mb-4 inline-flex w-fit rounded-3xl p-4 shadow-xl transition-all duration-500 group-hover:rotate-3 group-hover:scale-110',
  icon: 'h-10 w-10 text-white',
  title: 'text-2xl font-bold text-gray-900 transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-600 group-hover:bg-clip-text group-hover:text-transparent dark:text-white dark:group-hover:from-white dark:group-hover:to-gray-300',
  content: 'relative z-10',
  description: 'mb-4 text-base leading-relaxed text-gray-600 dark:text-gray-300',
  link: 'flex items-center font-medium text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300',
  linkIcon: 'ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-2',
}

// CTA Section
export const ctaClasses = {
  section: 'relative z-10 px-6 py-12',
  container: 'container mx-auto text-center',
  card: 'relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 p-16 text-white shadow-3xl',
  backgroundPattern: 'absolute inset-0 opacity-10',
  bgCircle1: 'absolute left-10 top-10 h-32 w-32 animate-pulse rounded-full bg-white',
  bgCircle2: 'absolute bottom-10 right-10 h-24 w-24 animate-pulse rounded-full bg-white delay-1000',
  bgCircle3: 'absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 transform animate-pulse rounded-full bg-white delay-2000',
  content: 'relative z-10',
  icon: 'mx-auto mb-6 h-20 w-20 opacity-90',
  title: 'mb-6 text-4xl font-bold',
  description: 'mx-auto mb-10 max-w-3xl text-xl leading-relaxed opacity-90',
  button: 'transform bg-white px-10 py-4 text-base text-blue-600 shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-gray-100',
}
