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
    ChevronDown,
    Bell,
    Search
} from 'lucide-react'
import { ThemeToggle } from './theme-toggle'
import { Button } from './ui/button'
import { Input } from './ui/input'

const navigationItems = [
    {
        name: 'Proyectos',
        href: '/proyectos',
        icon: Building2,
        color: 'from-blue-500 to-blue-600',
        description: 'Gestión de proyectos'
    },
    {
        name: 'Viviendas',
        href: '/viviendas',
        icon: Home,
        color: 'from-emerald-500 to-emerald-600',
        description: 'Administrar viviendas'
    },
    {
        name: 'Clientes',
        href: '/clientes',
        icon: Users,
        color: 'from-purple-500 to-purple-600',
        description: 'Base de clientes'
    },
    {
        name: 'Abonos',
        href: '/abonos',
        icon: CreditCard,
        color: 'from-orange-500 to-orange-600',
        description: 'Gestión de pagos'
    },
    {
        name: 'Renuncias',
        href: '/renuncias',
        icon: FileX,
        color: 'from-red-500 to-red-600',
        description: 'Documentos de renuncia'
    },
    {
        name: 'Admin',
        href: '/admin',
        icon: Settings,
        color: 'from-gray-500 to-gray-600',
        description: 'Administración'
    }
]

export function Navbar() {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)
    const [searchOpen, setSearchOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/'
        return pathname.startsWith(href)
    }

    return (
        <>
            {/* Navbar */}
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                        ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-200/50 dark:border-gray-700/50'
                        : 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="flex items-center space-x-3"
                        >
                            <Link href="/" className="flex items-center space-x-3">
                                <div className="relative">
                                    <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                                        <Building2 className="h-7 w-7 text-white" />
                                    </div>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                        className="absolute -top-1 -right-1"
                                    >
                                        <Sparkles className="h-4 w-4 text-yellow-500" />
                                    </motion.div>
                                </div>
                                <div className="hidden sm:block">
                                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                                        RyR Constructora
                                    </h1>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
                                        Sistema de Gestión
                                    </p>
                                </div>
                            </Link>
                        </motion.div>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center space-x-1">
                            {navigationItems.map((item, index) => {
                                const active = isActive(item.href)
                                return (
                                    <div key={item.href}>
                                        <Link href={item.href} prefetch={true}>
                                            <motion.div
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className={`group relative px-4 py-2 rounded-xl transition-all duration-150 ${active
                                                        ? 'bg-gradient-to-r ' + item.color + ' text-white shadow-lg'
                                                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                                                    }`}
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <item.icon className={`h-4 w-4 ${active ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                                                        }`} />
                                                    <span className="font-medium text-sm">{item.name}</span>
                                                </div>

                                                {/* Tooltip */}
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                                                    whileHover={{ opacity: 1, y: 0, scale: 1 }}
                                                    className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg pointer-events-none"
                                                >
                                                    {item.description}
                                                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45"></div>
                                                </motion.div>

                                                {/* Active indicator */}
                                                {active && (
                                                    <motion.div
                                                        layoutId="navbar-indicator"
                                                        className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-lg"
                                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                    />
                                                )}
                                            </motion.div>
                                        </Link>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Right side actions */}
                        <div className="flex items-center space-x-3">
                            {/* Search */}
                            <motion.div
                                animate={{ width: searchOpen ? 280 : 40 }}
                                transition={{ duration: 0.3 }}
                                className="relative hidden md:block"
                            >
                                {searchOpen ? (
                                    <Input
                                        placeholder="Buscar proyectos, clientes..."
                                        className="w-full h-10 pl-10 pr-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                                        autoFocus
                                        onBlur={() => setSearchOpen(false)}
                                    />
                                ) : null}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSearchOpen(!searchOpen)}
                                    className="absolute left-0 top-0 h-10 w-10 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                >
                                    <Search className="h-4 w-4" />
                                </Button>
                            </motion.div>

                            {/* Notifications */}
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                <Button variant="ghost" size="sm" className="relative">
                                    <Bell className="h-4 w-4" />
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"
                                    />
                                </Button>
                            </motion.div>

                            {/* Theme Toggle */}
                            <ThemeToggle />

                            {/* Mobile menu button */}
                            <motion.div whileTap={{ scale: 0.9 }} className="lg:hidden">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsOpen(!isOpen)}
                                    className="relative overflow-hidden"
                                >
                                    <AnimatePresence mode="wait">
                                        {isOpen ? (
                                            <motion.div
                                                key="close"
                                                initial={{ rotate: -90, opacity: 0 }}
                                                animate={{ rotate: 0, opacity: 1 }}
                                                exit={{ rotate: 90, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <X className="h-5 w-5" />
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="menu"
                                                initial={{ rotate: 90, opacity: 0 }}
                                                animate={{ rotate: 0, opacity: 1 }}
                                                exit={{ rotate: -90, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <Menu className="h-5 w-5" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="lg:hidden border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md"
                        >
                            <div className="px-4 py-4 space-y-2">
                                {/* Mobile Search */}
                                <div className="relative mb-4">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Buscar..."
                                        className="pl-10 h-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                                    />
                                </div>

                                {navigationItems.map((item, index) => {
                                    const active = isActive(item.href)
                                    return (
                                        <motion.div
                                            key={item.href}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05, duration: 0.2 }}
                                        >
                                            <Link href={item.href} onClick={() => setIsOpen(false)} prefetch={true}>
                                                <motion.div
                                                    whileHover={{ scale: 1.02, x: 10 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${active
                                                            ? 'bg-gradient-to-r ' + item.color + ' text-white shadow-lg'
                                                            : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                                                        }`}
                                                >
                                                    <div className={`p-2 rounded-lg ${active
                                                            ? 'bg-white/20'
                                                            : 'bg-gray-100 dark:bg-gray-800'
                                                        }`}>
                                                        <item.icon className={`h-5 w-5 ${active ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                                                            }`} />
                                                    </div>
                                                    <div>
                                                        <p className={`font-medium ${active ? 'text-white' : 'text-gray-900 dark:text-gray-100'
                                                            }`}>
                                                            {item.name}
                                                        </p>
                                                        <p className={`text-xs ${active ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
                                                            }`}>
                                                            {item.description}
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            </Link>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.nav>

            {/* Spacer to prevent content from hiding behind fixed navbar */}
            <div className="h-16"></div>
        </>
    )
}