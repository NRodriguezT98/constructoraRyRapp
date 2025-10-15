// Estilos para cards
export const cardStyles = {
    base: 'group hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-200 dark:hover:border-blue-800 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden',
    header: 'pb-3',
    content: 'space-y-4',
    footer: 'flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700'
}

// Estilos para botones
export const buttonStyles = {
    primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300',
    secondary: 'border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors',
    danger: 'text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20'
}

// Estilos para inputs
export const inputStyles = {
    base: 'bg-gray-50/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400',
    search: 'pl-10 bg-gray-50/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400',
    large: 'pl-12 h-12 text-lg bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 transition-colors'
}

// Estilos para badges
export const badgeStyles = {
    base: 'px-2 py-1 rounded-full text-xs font-medium',
    success: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    warning: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    error: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
}

// Estilos para contenedores
export const containerStyles = {
    page: 'space-y-8',
    section: 'container mx-auto px-6 py-6',
    card: 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl'
}

// Estilos para texto
export const textStyles = {
    title: 'text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent',
    subtitle: 'text-gray-600 dark:text-gray-400 mt-2',
    heading: 'text-2xl font-bold text-gray-900 dark:text-white',
    label: 'text-sm font-medium text-gray-700 dark:text-gray-300',
    description: 'text-gray-600 dark:text-gray-300 text-sm'
}

// Estilos para estados vacíos
export const emptyStateStyles = {
    container: 'text-center py-16',
    iconWrapper: 'relative inline-block mb-8',
    icon: 'p-6 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-3xl',
    badge: 'absolute -top-2 -right-2 p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full',
    title: 'text-2xl font-bold text-gray-900 dark:text-white mb-3',
    description: 'text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto leading-relaxed'
}

// Estilos para barras de progreso
export const progressBarStyles = {
    container: 'w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2',
    bar: 'h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500'
}

// Estilos para grid de proyectos
export const gridStyles = {
    grid: (isGrid: boolean) => `grid gap-6 ${isGrid ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`,
    item: 'transition-all duration-300'
}

// Estilos para iconos
export const iconStyles = {
    small: 'h-4 w-4',
    medium: 'h-5 w-5',
    large: 'h-6 w-6',
    primary: 'text-blue-500',
    success: 'text-green-500',
    warning: 'text-orange-500',
    danger: 'text-red-500'
}