import { Variants } from 'framer-motion'

// Animación de contenedor con stagger
export const containerVariants: Variants = {
    hidden: {
        opacity: 0
    },
    visible: {
        opacity: 1,
        transition: {
            delayChildren: 0.1,
            staggerChildren: 0.1
        }
    }
}

// Animación de items individuales
export const itemVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 20
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 100,
            damping: 12
        }
    }
}

// Animación de fade in
export const fadeInVariants: Variants = {
    hidden: {
        opacity: 0
    },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.3
        }
    }
}

// Animación de slide desde arriba
export const slideDownVariants: Variants = {
    hidden: {
        opacity: 0,
        y: -20
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4
        }
    }
}

// Animación de slide desde abajo
export const slideUpVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 50
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            delay: 0.4,
            duration: 0.6
        }
    }
}

// Animación de escala
export const scaleVariants: Variants = {
    hidden: {
        scale: 0
    },
    visible: {
        scale: 1,
        transition: {
            delay: 0.6,
            type: 'spring',
            stiffness: 100
        }
    }
}

// Animación para cards
export const cardHoverVariants = {
    rest: {
        scale: 1,
        transition: {
            duration: 0.2
        }
    },
    hover: {
        scale: 1.02,
        transition: {
            duration: 0.2
        }
    }
}

// Animación para botones
export const buttonTapVariants = {
    tap: {
        scale: 0.95
    }
}