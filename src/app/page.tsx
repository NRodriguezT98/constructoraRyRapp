"use client"

import { motion } from 'framer-motion'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Building2, Users, Home, CreditCard, FileX, Shield, TrendingUp, Calendar, Award, Zap, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24
    }
  }
}

const modules = [
  {
    title: "Proyectos",
    description: "Gestión completa de proyectos de construcción",
    icon: Building2,
    href: "/proyectos",
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
    borderColor: "border-emerald-200 dark:border-emerald-800"
  },
  {
    title: "Viviendas",
    description: "Administración de viviendas y unidades",
    icon: Home,
    href: "/viviendas",
    color: "from-blue-500 to-cyan-600",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    borderColor: "border-blue-200 dark:border-blue-800"
  },
  {
    title: "Clientes",
    description: "Control de clientes y contactos",
    icon: Users,
    href: "/clientes",
    color: "from-purple-500 to-violet-600",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
    borderColor: "border-purple-200 dark:border-purple-800"
  },
  {
    title: "Abonos",
    description: "Gestión de pagos y abonos",
    icon: CreditCard,
    href: "/abonos",
    color: "from-orange-500 to-amber-600",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
    borderColor: "border-orange-200 dark:border-orange-800"
  },
  {
    title: "Renuncias",
    description: "Manejo de renuncias y cancelaciones",
    icon: FileX,
    href: "/renuncias",
    color: "from-red-500 to-rose-600",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    borderColor: "border-red-200 dark:border-red-800"
  },
  {
    title: "Administración",
    description: "Panel de control y configuración",
    icon: Shield,
    href: "/admin",
    color: "from-indigo-500 to-purple-600",
    bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
    borderColor: "border-indigo-200 dark:border-indigo-800"
  }
]

const stats = [
  { label: "Proyectos Activos", value: "12", icon: Building2 },
  { label: "Viviendas Totales", value: "247", icon: Home },
  { label: "Clientes", value: "189", icon: Users },
  { label: "Este Mes", value: "$2.4M", icon: TrendingUp }
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-300/10 dark:bg-blue-500/5 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-purple-300/10 dark:bg-purple-500/5 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 left-1/2 w-96 h-96 bg-pink-300/10 dark:bg-pink-500/5 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Hero Section */}
      <motion.section
        className="relative z-10 py-12 px-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="container mx-auto text-center">
          <motion.div variants={itemVariants} className="mb-8">
            <Badge variant="secondary" className="mb-6 px-6 py-3 text-sm font-medium bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border border-blue-200 dark:border-blue-700">
              <Zap className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
              Sistema de Gestión Integral
            </Badge>
            <h1 className="text-6xl md:text-8xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent mb-6 leading-tight">
              RyR Constructora
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-10 leading-relaxed">
              Plataforma de gestión administrativa de última generación para proyectos de construcción.
              <span className="font-semibold text-blue-600 dark:text-blue-400"> Controla todo desde un solo lugar</span>
              con tecnología moderna y diseño intuitivo.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-6 mb-20">
            <Button size="lg" asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 text-lg px-8 py-6">
              <Link href="/proyectos">
                <Building2 className="w-6 h-6 mr-3" />
                Acceder al Sistema
                <ArrowRight className="w-5 h-5 ml-3" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-2 border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-gray-50 dark:hover:bg-gray-700 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-lg px-8 py-6">
              <Link href="/admin">
                <Shield className="w-6 h-6 mr-3" />
                Panel Admin
              </Link>
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                whileHover={{ scale: 1.05, rotateY: 5 }}
                className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 hover:shadow-3xl transition-all duration-500 group"
              >
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-2xl mb-4 mx-auto w-fit group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Modules Grid */}
      <motion.section
        className="relative z-10 py-12 px-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="container mx-auto">
          <motion.div variants={itemVariants} className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm font-medium bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
              <Sparkles className="w-4 h-4 mr-2" />
              Módulos Especializados
            </Badge>
            <h2 className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">
              Todo lo que necesitas
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Accede a funcionalidades especializadas diseñadas para optimizar cada aspecto de tu negocio constructivo
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
          >
            {modules.map((module, index) => (
              <motion.div key={module.title} variants={itemVariants}>
                <Link href={module.href}>
                  <Card className={`${module.bgColor} ${module.borderColor} border-2 hover:shadow-3xl transition-all duration-500 group cursor-pointer overflow-hidden h-full relative`}>
                    {/* Gradient overlay on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

                    <CardHeader className="pb-4 relative z-10">
                      <div className={`inline-flex p-4 bg-gradient-to-r ${module.color} rounded-3xl mb-4 shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 w-fit`}>
                        <module.icon className="h-10 w-10 text-white" />
                      </div>
                      <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:text-transparent group-hover:from-gray-900 group-hover:to-gray-600 dark:group-hover:from-white dark:group-hover:to-gray-300 transition-all duration-300">
                        {module.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <CardDescription className="text-gray-600 dark:text-gray-300 text-base leading-relaxed mb-4">
                        {module.description}
                      </CardDescription>
                      <div className="flex items-center text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 font-medium">
                        <span>Explorar módulo</span>
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
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
        className="relative z-10 py-12 px-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div
          variants={itemVariants}
          className="container mx-auto text-center"
        >
          <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 rounded-3xl p-16 text-white shadow-3xl overflow-hidden">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full animate-pulse"></div>
              <div className="absolute bottom-10 right-10 w-24 h-24 bg-white rounded-full animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white rounded-full animate-pulse delay-2000"></div>
            </div>

            <div className="relative z-10">
              <Award className="w-20 h-20 mx-auto mb-6 opacity-90" />
              <h3 className="text-4xl font-bold mb-6">
                ¿Listo para revolucionar tu gestión?
              </h3>
              <p className="text-xl opacity-90 mb-10 max-w-3xl mx-auto leading-relaxed">
                Únete a las constructoras más innovadoras que ya están optimizando sus procesos con nuestra plataforma de gestión integral
              </p>
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100 shadow-2xl text-lg px-10 py-6 transform hover:scale-105 transition-all duration-300">
                <Calendar className="w-6 h-6 mr-3" />
                Comenzar Ahora
                <Sparkles className="w-5 h-5 ml-3" />
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.section>
    </div>
  )
}