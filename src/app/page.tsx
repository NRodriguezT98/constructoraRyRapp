'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { motion } from 'framer-motion'
import {
    ArrowRight,
    Award,
    Building2,
    Calendar,
    CreditCard,
    FileX,
    Home,
    Shield,
    Sparkles,
    TrendingUp,
    Users,
    Zap,
} from 'lucide-react'
import Link from 'next/link'
import * as styles from './page.styles'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
    },
  },
}

const modules = [
  {
    title: 'Proyectos',
    description: 'Gestión completa de proyectos de construcción',
    icon: Building2,
    href: '/proyectos' as const,
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
  },
  {
    title: 'Viviendas',
    description: 'Administración de viviendas y unidades',
    icon: Home,
    href: '/viviendas' as const,
    color: 'from-blue-500 to-cyan-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
  {
    title: 'Clientes',
    description: 'Control de clientes y contactos',
    icon: Users,
    href: '/clientes' as const,
    color: 'from-purple-500 to-violet-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
  },
  {
    title: 'Abonos',
    description: 'Gestión de pagos y abonos',
    icon: CreditCard,
    href: '/abonos' as const,
    color: 'from-orange-500 to-amber-600',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    borderColor: 'border-orange-200 dark:border-orange-800',
  },
  {
    title: 'Renuncias',
    description: 'Manejo de renuncias y cancelaciones',
    icon: FileX,
    href: '/renuncias' as const,
    color: 'from-red-500 to-rose-600',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
  },
  {
    title: 'Administración',
    description: 'Panel de control y configuración',
    icon: Shield,
    href: '/admin' as const,
    color: 'from-indigo-500 to-purple-600',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
  },
] as const

const stats = [
  { label: 'Proyectos Activos', value: '12', icon: Building2 },
  { label: 'Viviendas Totales', value: '247', icon: Home },
  { label: 'Clientes', value: '189', icon: Users },
  { label: 'Este Mes', value: '$2.4M', icon: TrendingUp },
]

export default function HomePage() {
  return (
    <div className={styles.containerClasses}>
      {/* Animated background elements */}
      <div className={styles.backgroundElements.container}>
        <div className={styles.backgroundElements.blob1}></div>
        <div className={styles.backgroundElements.blob2}></div>
        <div className={styles.backgroundElements.blob3}></div>
      </div>

      {/* Hero Section */}
      <motion.section
        className={styles.heroClasses.section}
        initial='hidden'
        animate='visible'
        variants={containerVariants}
      >
        <div className={styles.heroClasses.container}>
          <motion.div variants={itemVariants} className='mb-8'>
            <Badge variant='secondary' className={styles.heroClasses.badge}>
              <Zap className={styles.heroClasses.badgeIcon} />
              Sistema de Gestión Integral
            </Badge>
            <h1 className={styles.heroClasses.title}>RyR Constructora</h1>
            <p className={styles.heroClasses.description}>
              Plataforma de gestión administrativa de última generación para
              proyectos de construcción.
              <span className={styles.heroClasses.descriptionHighlight}>
                {' '}
                Controla todo desde un solo lugar
              </span>
              con tecnología moderna y diseño intuitivo.
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className='mb-20 flex flex-wrap justify-center gap-6'
          >
            <Button size='lg' asChild className={styles.buttonClasses.primary}>
              <Link href='/proyectos' className='flex items-center'>
                <Building2 className={styles.buttonClasses.iconStart} />
                Acceder al Sistema
                <ArrowRight className={styles.buttonClasses.iconEnd} />
              </Link>
            </Button>
            <Button
              size='lg'
              variant='outline'
              asChild
              className={styles.buttonClasses.secondary}
            >
              <Link href='/admin' className='flex items-center'>
                <Shield className={styles.buttonClasses.iconStart} />
                Panel Admin
              </Link>
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={itemVariants}
            className={styles.statsClasses.container}
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                whileHover={{ scale: 1.05, rotateY: 5 }}
                className={styles.statsClasses.card}
              >
                <div className={styles.statsClasses.iconContainer}>
                  <stat.icon className={styles.statsClasses.icon} />
                </div>
                <div className={styles.statsClasses.value}>{stat.value}</div>
                <div className={styles.statsClasses.label}>{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Modules Grid */}
      <motion.section
        className={styles.modulesClasses.section}
        initial='hidden'
        animate='visible'
        variants={containerVariants}
      >
        <div className={styles.modulesClasses.container}>
          <motion.div variants={itemVariants} className={styles.modulesClasses.header}>
            <Badge variant='secondary' className={styles.modulesClasses.headerBadge}>
              <Sparkles className='mr-2 h-4 w-4' />
              Módulos Especializados
            </Badge>
            <h2 className={styles.modulesClasses.headerTitle}>
              Todo lo que necesitas
            </h2>
            <p className={styles.modulesClasses.headerDescription}>
              Accede a funcionalidades especializadas diseñadas para optimizar
              cada aspecto de tu negocio constructivo
            </p>
          </motion.div>

          <motion.div
            className={styles.modulesClasses.grid}
            variants={containerVariants}
          >
            {modules.map((module) => (
              <motion.div key={module.title} variants={itemVariants}>
                <Link href={module.href}>
                  <Card
                    className={`${module.bgColor} ${module.borderColor} ${styles.moduleCardClasses.cardBase}`}
                  >
                    {/* Gradient overlay on hover */}
                    <div
                      className={`bg-gradient-to-br ${module.color} ${styles.moduleCardClasses.overlay}`}
                    ></div>

                    <CardHeader className={styles.moduleCardClasses.header}>
                      <div
                        className={`bg-gradient-to-r ${module.color} ${styles.moduleCardClasses.iconContainer}`}
                      >
                        <module.icon className={styles.moduleCardClasses.icon} />
                      </div>
                      <CardTitle className={styles.moduleCardClasses.title}>
                        {module.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className={styles.moduleCardClasses.content}>
                      <CardDescription
                        className={styles.moduleCardClasses.description}
                      >
                        {module.description}
                      </CardDescription>
                      <div className={styles.moduleCardClasses.link}>
                        <span>Explorar módulo</span>
                        <ArrowRight
                          className={styles.moduleCardClasses.linkIcon}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className={styles.ctaClasses.section}
        initial='hidden'
        animate='visible'
        variants={containerVariants}
      >
        <motion.div
          variants={itemVariants}
          className={styles.ctaClasses.container}
        >
          <div className={styles.ctaClasses.card}>
            {/* Animated background pattern */}
            <div className={styles.ctaClasses.backgroundPattern}>
              <div className={styles.ctaClasses.bgCircle1}></div>
              <div className={styles.ctaClasses.bgCircle2}></div>
              <div className={styles.ctaClasses.bgCircle3}></div>
            </div>

            <div className={styles.ctaClasses.content}>
              <Award className={styles.ctaClasses.icon} />
              <h3 className={styles.ctaClasses.title}>
                ¿Listo para revolucionar tu gestión?
              </h3>
              <p className={styles.ctaClasses.description}>
                Únete a las constructoras más innovadoras que ya están
                optimizando sus procesos con nuestra plataforma de gestión
                integral
              </p>
              <Button
                size='lg'
                variant='secondary'
                className={styles.ctaClasses.button}
              >
                <Calendar className={styles.buttonClasses.iconStart} />
                Comenzar Ahora
                <Sparkles className={styles.buttonClasses.iconEnd} />
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.section>
    </div>
  )
}
