/**
 * Animaciones para el Accordion Wizard
 * Constantes de Framer Motion reutilizadas en todos los componentes
 */

export const sectionExpandAnim = {
  initial: { height: 0, opacity: 0 },
  animate: { height: 'auto', opacity: 1 },
  exit: { height: 0, opacity: 0 },
  transition: { type: 'spring' as const, stiffness: 200, damping: 25 },
}

export const summaryAppearAnim = {
  initial: { opacity: 0, y: -10 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: 0.15, duration: 0.2 },
}

export const fieldStaggerAnim = (i: number) => ({
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.2 },
  },
})

export const checkAppearAnim = {
  initial: { scale: 0, rotate: -180 },
  animate: { scale: 1, rotate: 0 },
  transition: { type: 'spring' as const, stiffness: 400, damping: 15 },
}

export const errorShakeAnim = {
  animate: { x: [0, -5, 5, -3, 3, 0] },
  transition: { duration: 0.3 },
}

export const progressBarTransition = { duration: 0.5, ease: 'easeOut' as const }

export const pageEnterAnim = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: 'easeOut' as const },
}
