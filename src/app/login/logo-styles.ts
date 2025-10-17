/**
 * Variantes de estilos para mejorar legibilidad de logos en login
 * Usa estas clases si los logos necesitan más contraste con el fondo
 */

export const loginLogoStyles = {
  // Opción 1: Resplandor sutil (actualmente implementado)
  glowSubtle: {
    filter: 'drop-shadow(0 0 30px rgba(255, 255, 255, 0.3))',
  },

  // Opción 2: Resplandor intenso (si logo1-dark aún no es visible)
  glowIntense: {
    filter: 'drop-shadow(0 0 50px rgba(255, 255, 255, 0.5)) drop-shadow(0 0 20px rgba(255, 255, 255, 0.4))',
  },

  // Opción 3: Fondo semi-transparente detrás del logo
  containerWithBackground: 'rounded-2xl bg-white/5 p-6 backdrop-blur-sm border border-white/10',

  // Opción 4: Fondo con gradiente
  containerWithGradient: 'rounded-2xl bg-gradient-to-br from-white/10 to-transparent p-6 backdrop-blur-md border border-white/20',

  // Opción 5: Sombra pronunciada
  strongShadow: {
    filter: 'drop-shadow(0 4px 20px rgba(0, 0, 0, 0.8)) drop-shadow(0 0 40px rgba(255, 255, 255, 0.4))',
  },
}

/**
 * CÓMO USAR:
 *
 * Si logo1-dark.png aún no es legible, puedes:
 *
 * 1. Aumentar el brillo del resplandor:
 *    style={loginLogoStyles.glowIntense}
 *
 * 2. Agregar fondo detrás del logo:
 *    <div className={loginLogoStyles.containerWithBackground}>
 *      <Image ... />
 *    </div>
 *
 * 3. Combinar ambos:
 *    <div className={loginLogoStyles.containerWithGradient}>
 *      <Image style={loginLogoStyles.glowIntense} ... />
 *    </div>
 */
