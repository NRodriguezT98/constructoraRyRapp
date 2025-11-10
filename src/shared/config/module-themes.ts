/**
 * ============================================
 * SISTEMA DE THEMING POR MÓDULO
 * ============================================
 *
 * Configuración centralizada de colores para cada módulo.
 * Permite reutilizar componentes con diferentes paletas de colores.
 *
 * USO:
 * ```tsx
 * import { moduleThemes } from '@/shared/config/module-themes'
 *
 * const theme = moduleThemes.proyectos
 * <button className={theme.button.primary}>Click</button>
 * ```
 */

export type ModuleName = 'proyectos' | 'clientes' | 'viviendas' | 'auditorias' | 'negociaciones' | 'abonos' | 'documentos'

export interface ModuleTheme {
  /** Nombre del módulo */
  name: string

  /** Colores principales */
  colors: {
    /** Color primario (ej: green-500) */
    primary: string
    /** Color secundario (ej: emerald-600) */
    secondary: string
    /** Color terciario (ej: teal-600) */
    tertiary: string
    /** Tono claro para fondos (ej: green-50) */
    light: string
    /** Tono oscuro para fondos dark mode (ej: green-900) */
    dark: string
  }

  /** Clases de Tailwind pre-construidas */
  classes: {
    /** Gradientes */
    gradient: {
      /** from-{primary} to-{secondary} */
      primary: string
      /** from-{primary} via-{secondary} to-{tertiary} */
      triple: string
      /** from-{light} to-{secondary}-light */
      background: string
      /** Dark mode background */
      backgroundDark: string
    }

    /** Botones */
    button: {
      /** Botón primario con gradiente */
      primary: string
      /** Botón secundario outline */
      secondary: string
      /** Botón de hover */
      hover: string
    }

    /** Bordes */
    border: {
      /** border-{primary}-200 */
      light: string
      /** border-{primary}-800 */
      dark: string
      /** Borde con hover */
      hover: string
    }

    /** Backgrounds */
    bg: {
      /** bg-{primary}-50 */
      light: string
      /** bg-{primary}-900/20 */
      dark: string
      /** Hover effect */
      hover: string
    }

    /** Focus rings */
    focus: {
      /** focus:ring-{primary}-500 */
      ring: string
      /** Dark mode focus ring */
      ringDark: string
    }

    /** Text colors */
    text: {
      /** text-{primary}-600 */
      primary: string
      /** text-{primary}-700 */
      secondary: string
      /** dark:text-{primary}-400 */
      dark: string
    }
  }
}

/** Configuración de temas por módulo */
export const moduleThemes: Record<ModuleName, ModuleTheme> = {
  /** 🏗️ PROYECTOS - Verde/Esmeralda/Teal */
  proyectos: {
    name: 'Proyectos',
    colors: {
      primary: 'green',
      secondary: 'emerald',
      tertiary: 'teal',
      light: 'green-50',
      dark: 'green-900',
    },
    classes: {
      gradient: {
        primary: 'from-green-600 to-emerald-600',
        triple: 'from-green-600 via-emerald-600 to-teal-600',
        background: 'from-green-50 to-emerald-50',
        backgroundDark: 'from-green-900/20 to-emerald-900/20',
      },
      button: {
        primary: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all',
        secondary: 'border border-green-300 bg-white text-green-700 hover:bg-green-50 dark:border-green-700 dark:bg-gray-700 dark:text-green-300 dark:hover:bg-gray-600',
        hover: 'hover:bg-green-50 dark:hover:bg-green-900/20',
      },
      border: {
        light: 'border-green-200 dark:border-green-800',
        dark: 'border-green-800',
        hover: 'hover:border-green-400 dark:hover:border-green-500',
      },
      bg: {
        light: 'bg-green-50 dark:bg-green-900/20',
        dark: 'bg-green-900/20',
        hover: 'hover:bg-green-50 dark:hover:bg-green-900/30',
      },
      focus: {
        ring: 'focus:ring-2 focus:ring-green-500 focus:border-transparent',
        ringDark: 'dark:focus:ring-green-400',
      },
      text: {
        primary: 'text-green-600 dark:text-green-400',
        secondary: 'text-green-700 dark:text-green-300',
        dark: 'dark:text-green-400',
      },
    },
  },

  /** 👥 CLIENTES - Cyan/Azul/Índigo */
  clientes: {
    name: 'Clientes',
    colors: {
      primary: 'cyan',
      secondary: 'blue',
      tertiary: 'indigo',
      light: 'cyan-50',
      dark: 'cyan-900',
    },
    classes: {
      gradient: {
        primary: 'from-cyan-600 to-blue-600',
        triple: 'from-cyan-600 via-blue-600 to-indigo-600',
        background: 'from-cyan-50 to-blue-50',
        backgroundDark: 'from-cyan-900/20 to-blue-900/20',
      },
      button: {
        primary: 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all',
        secondary: 'border border-cyan-300 bg-white text-cyan-700 hover:bg-cyan-50 dark:border-cyan-700 dark:bg-gray-700 dark:text-cyan-300 dark:hover:bg-gray-600',
        hover: 'hover:bg-cyan-50 dark:hover:bg-cyan-900/20',
      },
      border: {
        light: 'border-cyan-200 dark:border-cyan-800',
        dark: 'border-cyan-800',
        hover: 'hover:border-cyan-400 dark:hover:border-cyan-500',
      },
      bg: {
        light: 'bg-cyan-50 dark:bg-cyan-900/20',
        dark: 'bg-cyan-900/20',
        hover: 'hover:bg-cyan-50 dark:hover:bg-cyan-900/30',
      },
      focus: {
        ring: 'focus:ring-2 focus:ring-cyan-500 focus:border-transparent',
        ringDark: 'dark:focus:ring-cyan-400',
      },
      text: {
        primary: 'text-cyan-600 dark:text-cyan-400',
        secondary: 'text-cyan-700 dark:text-cyan-300',
        dark: 'dark:text-cyan-400',
      },
    },
  },

  /** 🏠 VIVIENDAS - Naranja/Ámbar/Amarillo */
  viviendas: {
    name: 'Viviendas',
    colors: {
      primary: 'orange',
      secondary: 'amber',
      tertiary: 'yellow',
      light: 'orange-50',
      dark: 'orange-900',
    },
    classes: {
      gradient: {
        primary: 'from-orange-600 to-amber-600',
        triple: 'from-orange-600 via-amber-600 to-yellow-600',
        background: 'from-orange-50 to-amber-50',
        backgroundDark: 'from-orange-900/20 to-amber-900/20',
      },
      button: {
        primary: 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-md hover:shadow-lg transition-all',
        secondary: 'border border-orange-300 bg-white text-orange-700 hover:bg-orange-50 dark:border-orange-700 dark:bg-gray-700 dark:text-orange-300 dark:hover:bg-gray-600',
        hover: 'hover:bg-orange-50 dark:hover:bg-orange-900/20',
      },
      border: {
        light: 'border-orange-200 dark:border-orange-800',
        dark: 'border-orange-800',
        hover: 'hover:border-orange-400 dark:hover:border-orange-500',
      },
      bg: {
        light: 'bg-orange-50 dark:bg-orange-900/20',
        dark: 'bg-orange-900/20',
        hover: 'hover:bg-orange-50 dark:hover:bg-orange-900/30',
      },
      focus: {
        ring: 'focus:ring-2 focus:ring-orange-500 focus:border-transparent',
        ringDark: 'dark:focus:ring-orange-400',
      },
      text: {
        primary: 'text-orange-600 dark:text-orange-400',
        secondary: 'text-orange-700 dark:text-orange-300',
        dark: 'dark:text-orange-400',
      },
    },
  },

  /** 📊 AUDITORÍAS - Azul/Índigo/Púrpura */
  auditorias: {
    name: 'Auditorías',
    colors: {
      primary: 'blue',
      secondary: 'indigo',
      tertiary: 'purple',
      light: 'blue-50',
      dark: 'blue-900',
    },
    classes: {
      gradient: {
        primary: 'from-blue-600 to-indigo-600',
        triple: 'from-blue-600 via-indigo-600 to-purple-600',
        background: 'from-blue-50 to-indigo-50',
        backgroundDark: 'from-blue-900/20 to-indigo-900/20',
      },
      button: {
        primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all',
        secondary: 'border border-blue-300 bg-white text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:bg-gray-700 dark:text-blue-300 dark:hover:bg-gray-600',
        hover: 'hover:bg-blue-50 dark:hover:bg-blue-900/20',
      },
      border: {
        light: 'border-blue-200 dark:border-blue-800',
        dark: 'border-blue-800',
        hover: 'hover:border-blue-400 dark:hover:border-blue-500',
      },
      bg: {
        light: 'bg-blue-50 dark:bg-blue-900/20',
        dark: 'bg-blue-900/20',
        hover: 'hover:bg-blue-50 dark:hover:bg-blue-900/30',
      },
      focus: {
        ring: 'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
        ringDark: 'dark:focus:ring-blue-400',
      },
      text: {
        primary: 'text-blue-600 dark:text-blue-400',
        secondary: 'text-blue-700 dark:text-blue-300',
        dark: 'dark:text-blue-400',
      },
    },
  },

  /** 💰 NEGOCIACIONES - Rosa/Púrpura/Índigo */
  negociaciones: {
    name: 'Negociaciones',
    colors: {
      primary: 'pink',
      secondary: 'purple',
      tertiary: 'indigo',
      light: 'pink-50',
      dark: 'pink-900',
    },
    classes: {
      gradient: {
        primary: 'from-pink-600 to-purple-600',
        triple: 'from-pink-600 via-purple-600 to-indigo-600',
        background: 'from-pink-50 to-purple-50',
        backgroundDark: 'from-pink-900/20 to-purple-900/20',
      },
      button: {
        primary: 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all',
        secondary: 'border border-pink-300 bg-white text-pink-700 hover:bg-pink-50 dark:border-pink-700 dark:bg-gray-700 dark:text-pink-300 dark:hover:bg-gray-600',
        hover: 'hover:bg-pink-50 dark:hover:bg-pink-900/20',
      },
      border: {
        light: 'border-pink-200 dark:border-pink-800',
        dark: 'border-pink-800',
        hover: 'hover:border-pink-400 dark:hover:border-pink-500',
      },
      bg: {
        light: 'bg-pink-50 dark:bg-pink-900/20',
        dark: 'bg-pink-900/20',
        hover: 'hover:bg-pink-50 dark:hover:bg-pink-900/30',
      },
      focus: {
        ring: 'focus:ring-2 focus:ring-pink-500 focus:border-transparent',
        ringDark: 'dark:focus:ring-pink-400',
      },
      text: {
        primary: 'text-pink-600 dark:text-pink-400',
        secondary: 'text-pink-700 dark:text-pink-300',
        dark: 'dark:text-pink-400',
      },
    },
  },

  /** 💳 ABONOS - Azul/Índigo */
  abonos: {
    name: 'Abonos',
    colors: {
      primary: 'blue',
      secondary: 'indigo',
      tertiary: 'purple',
      light: 'blue-50',
      dark: 'blue-900',
    },
    classes: {
      gradient: {
        primary: 'from-blue-600 to-indigo-600',
        triple: 'from-blue-600 via-indigo-600 to-purple-600',
        background: 'from-blue-50 to-indigo-50',
        backgroundDark: 'from-blue-900/20 to-indigo-900/20',
      },
      button: {
        primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all',
        secondary: 'border border-blue-300 bg-white text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:bg-gray-700 dark:text-blue-300 dark:hover:bg-gray-600',
        hover: 'hover:bg-blue-50 dark:hover:bg-blue-900/20',
      },
      border: {
        light: 'border-blue-200 dark:border-blue-800',
        dark: 'border-blue-800',
        hover: 'hover:border-blue-400 dark:hover:border-blue-500',
      },
      bg: {
        light: 'bg-blue-50 dark:bg-blue-900/20',
        dark: 'bg-blue-900/20',
        hover: 'hover:bg-blue-50 dark:hover:bg-blue-900/30',
      },
      focus: {
        ring: 'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
        ringDark: 'dark:focus:ring-blue-400',
      },
      text: {
        primary: 'text-blue-600 dark:text-blue-400',
        secondary: 'text-blue-700 dark:text-blue-300',
        dark: 'dark:text-blue-400',
      },
    },
  },

  /** 📄 DOCUMENTOS - Rojo/Rosa/Pink */
  documentos: {
    name: 'Documentos',
    colors: {
      primary: 'red',
      secondary: 'rose',
      tertiary: 'pink',
      light: 'red-50',
      dark: 'red-900',
    },
    classes: {
      gradient: {
        primary: 'from-red-600 to-rose-600',
        triple: 'from-red-600 via-rose-600 to-pink-600',
        background: 'from-red-50 to-rose-50',
        backgroundDark: 'from-red-900/20 to-rose-900/20',
      },
      button: {
        primary: 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-md hover:shadow-lg transition-all',
        secondary: 'border border-red-300 bg-white text-red-700 hover:bg-red-50 dark:border-red-700 dark:bg-gray-700 dark:text-red-300 dark:hover:bg-gray-600',
        hover: 'hover:bg-red-50 dark:hover:bg-red-900/20',
      },
      border: {
        light: 'border-red-200 dark:border-red-800',
        dark: 'border-red-800',
        hover: 'hover:border-red-400 dark:hover:border-red-500',
      },
      bg: {
        light: 'bg-red-50 dark:bg-red-900/20',
        dark: 'bg-red-900/20',
        hover: 'hover:bg-red-50 dark:hover:bg-red-900/30',
      },
      focus: {
        ring: 'focus:ring-2 focus:ring-red-500 focus:border-transparent',
        ringDark: 'dark:focus:ring-red-400',
      },
      text: {
        primary: 'text-red-600 dark:text-red-400',
        secondary: 'text-red-700 dark:text-red-300',
        dark: 'dark:text-red-400',
      },
    },
  },
}

/**
 * Helper para obtener el tema de un módulo
 */
export function getModuleTheme(module: ModuleName): ModuleTheme {
  return moduleThemes[module]
}

/**
 * Helper para construir clases dinámicamente con el tema
 */
export function buildThemeClass(module: ModuleName, ...classKeys: string[]): string {
  const theme = getModuleTheme(module)
  // Aquí podrías implementar lógica para acceder a clases anidadas si lo necesitas
  return classKeys.join(' ')
}
