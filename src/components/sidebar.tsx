"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Building2,
    Home,
    Users,
    CreditCard,
    FileX,
    Settings,
    Menu,
    X,
    Sparkles,
    ChevronLeft,
    ChevronRight,
    Bell,
    Search,
    BarChart3,
    FileText,
    Calendar,
    Shield,
    HelpCircle,
    LogOut
} from 'lucide-react'
import { ThemeToggle } from './theme-toggle'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'

// Agrupación de módulos por categorías
const navigationGroups = [
    {
        title: "Gestión Principal",
        items: [
            {
                name: 'Dashboard',
                href: '/',
                icon: BarChart3,
                color: 'from-blue-500 to-blue-600',
                description: 'Panel principal',
                notifications: 0
            },
            {
                name: 'Proyectos',
                href: '/proyectos',
                icon: Building2,
                color: 'from-emerald-500 to-emerald-600',
                description: 'Gestión de proyectos',
                notifications: 3
            },
            {
                name: 'Viviendas',
                href: '/viviendas',
                icon: Home,
                color: 'from-cyan-500 to-cyan-600',
                description: 'Administrar viviendas',
                notifications: 0
            }
        ]
    },
    {
        title: "Clientes & Ventas",
        items: [
            {
                name: 'Clientes',
                href: '/clientes',
                icon: Users,
                color: 'from-purple-500 to-purple-600',
                description: 'Base de clientes',
                notifications: 2
            },
            {
                name: 'Abonos',
                href: '/abonos',
                icon: CreditCard,
                color: 'from-orange-500 to-orange-600',
                description: 'Gestión de pagos',
                notifications: 5
            },
            {
                name: 'Renuncias',
                href: '/renuncias',
                icon: FileX,
                color: 'from-red-500 to-red-600',
                description: 'Cancelaciones',
                notifications: 1
            }
        ]
    },
    {
        title: "Sistema",
        items: [
            {
                name: 'Administración',
                href: '/admin',
                icon: Shield,
                color: 'from-indigo-500 to-indigo-600',
                description: 'Panel admin',
                notifications: 0
            },
            {
                name: 'Reportes',
                href: '/reportes',
                icon: FileText,
                color: 'from-gray-500 to-gray-600',
                description: 'Informes y reportes',
                notifications: 0
            }
        ]
    }
]

export function Sidebar() {
    const [isExpanded, setIsExpanded] = useState(true)
    const [isMobile, setIsMobile] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const pathname = usePathname()

    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768
            setIsMobile(mobile)
            if (mobile) {
                setIsExpanded(false)
            }
        }

        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const isActive = (href: string) => {
        if (href === '/') {
            return pathname === '/'
        }
        return pathname.startsWith(href)
    }

    const toggleSidebar = () => {
        setIsExpanded(!isExpanded)
    }

    const sidebarVariants = {
        expanded: { width: 280 },
        collapsed: { width: 80 }
    }

    const contentVariants = {
        expanded: { opacity: 1, x: 0 },
        collapsed: { opacity: 0, x: -10 }
    }

    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isMobile && isExpanded && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={() => setIsExpanded(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                variants={sidebarVariants}
                animate={isExpanded ? "expanded" : "collapsed"}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className={`fixed left-0 top-0 h-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-r border-gray-200 dark:border-gray-700 z-50 flex flex-col shadow-xl ${isMobile ? (isExpanded ? 'translate-x-0' : '-translate-x-full') : ''
                    }`}
            >
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <AnimatePresence mode="wait">
                            {isExpanded ? (
                                <motion.div
                                    key="expanded-logo"
                                    variants={contentVariants}
                                    initial="collapsed"
                                    animate="expanded"
                                    exit="collapsed"
                                    transition={{ duration: 0.2 }}
                                    className="flex items-center space-x-3"
                                >
                                    <div className="relative">
                                        <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                                            <Building2 className="h-6 w-6 text-white" />
                                        </div>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                            className="absolute -top-1 -right-1"
                                        >
                                            <Sparkles className="h-3 w-3 text-yellow-500" />
                                        </motion.div>
                                    </div>
                                    <div>
                                        <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                                            RyR Constructora
                                        </h1>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
                                            Sistema de Gestión
                                        </p>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="collapsed-logo"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.2 }}
                                    className="relative mx-auto"
                                >
                                    <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                                        <Building2 className="h-6 w-6 text-white" />
                                    </div>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                        className="absolute -top-1 -right-1"
                                    >
                                        <Sparkles className="h-3 w-3 text-yellow-500" />
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleSidebar}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                        >
                            {isExpanded ? (
                                <ChevronLeft className="h-4 w-4" />
                            ) : (
                                <ChevronRight className="h-4 w-4" />
                            )}
                        </Button>
                    </div>

                    {/* Search - Solo cuando está expandido */}
                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div
                                variants={contentVariants}
                                initial="collapsed"
                                animate="expanded"
                                exit="collapsed"
                                transition={{ duration: 0.2, delay: 0.1 }}
                                className="mt-4"
                            >
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Buscar módulos..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 h-9 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
                    {navigationGroups.map((group, groupIndex) => (
                        <div key={group.title}>
                            {/* Group Title - Solo cuando está expandido */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        variants={contentVariants}
                                        initial="collapsed"
                                        animate="expanded"
                                        exit="collapsed"
                                        transition={{ duration: 0.2 }}
                                        className="px-3 mb-3"
                                    >
                                        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            {group.title}
                                        </h3>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Navigation Items */}
                            <div className="space-y-1">
                                {group.items
                                    .filter(item =>
                                        !searchQuery ||
                                        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        item.description.toLowerCase().includes(searchQuery.toLowerCase())
                                    )
                                    .map((item, index) => {
                                        const active = isActive(item.href)
                                        return (
                                            <Link key={item.href} href={item.href} prefetch={true}>
                                                <motion.div
                                                    whileHover={{ scale: 1.02, x: 2 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className={`group relative flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 ${active
                                                            ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                                                            : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                                                        }`}
                                                >
                                                    {/* Icon */}
                                                    <div className={`flex-shrink-0 ${isExpanded ? 'mr-3' : 'mx-auto'}`}>
                                                        <item.icon className={`h-5 w-5 ${active ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                                                            }`} />
                                                    </div>

                                                    {/* Content - Solo cuando está expandido */}
                                                    <AnimatePresence>
                                                        {isExpanded && (
                                                            <motion.div
                                                                variants={contentVariants}
                                                                initial="collapsed"
                                                                animate="expanded"
                                                                exit="collapsed"
                                                                transition={{ duration: 0.2 }}
                                                                className="flex-1 flex items-center justify-between"
                                                            >
                                                                <div>
                                                                    <div className={`font-medium text-sm ${active ? 'text-white' : 'text-gray-900 dark:text-gray-100'
                                                                        }`}>
                                                                        {item.name}
                                                                    </div>
                                                                    <div className={`text-xs ${active ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
                                                                        }`}>
                                                                        {item.description}
                                                                    </div>
                                                                </div>

                                                                {/* Notifications Badge */}
                                                                {item.notifications > 0 && (
                                                                    <Badge
                                                                        variant={active ? "secondary" : "default"}
                                                                        className={`ml-2 h-5 w-5 flex items-center justify-center p-0 text-xs ${active
                                                                                ? 'bg-white/20 text-white border-white/30'
                                                                                : 'bg-red-500 text-white border-red-600'
                                                                            }`}
                                                                    >
                                                                        {item.notifications}
                                                                    </Badge>
                                                                )}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>

                                                    {/* Tooltip para modo colapsado */}
                                                    {!isExpanded && (
                                                        <div className="absolute left-full ml-2 px-3 py-1 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                                                            {item.name}
                                                            {item.notifications > 0 && (
                                                                <span className="ml-2 inline-flex items-center justify-center w-4 h-4 text-xs bg-red-500 text-white rounded-full">
                                                                    {item.notifications}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Active indicator */}
                                                    {active && (
                                                        <motion.div
                                                            layoutId="sidebar-indicator"
                                                            className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"
                                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                        />
                                                    )}
                                                </motion.div>
                                            </Link>
                                        )
                                    })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                    {/* Theme Toggle & Settings */}
                    <div className={`flex items-center ${isExpanded ? 'justify-between' : 'justify-center'}`}>
                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div
                                    variants={contentVariants}
                                    initial="collapsed"
                                    animate="expanded"
                                    exit="collapsed"
                                    transition={{ duration: 0.2 }}
                                    className="flex items-center space-x-2"
                                >
                                    <ThemeToggle />
                                    <Button variant="ghost" size="sm" className="p-2">
                                        <Settings className="h-4 w-4" />
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        {!isExpanded && (
                            <div className="flex flex-col space-y-2">
                                <ThemeToggle />
                                <Button variant="ghost" size="sm" className="p-2">
                                    <Settings className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* User Info - Solo cuando está expandido */}
                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div
                                variants={contentVariants}
                                initial="collapsed"
                                animate="expanded"
                                exit="collapsed"
                                transition={{ duration: 0.2 }}
                                className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl"
                            >
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">U</span>
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        Usuario Admin
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        admin@ryr.com
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="p-1">
                                    <LogOut className="h-4 w-4" />
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.aside>
        </>
    )
}