"use client"

import { motion } from 'framer-motion'
import { FileX, AlertTriangle, Clock, UserMinus } from 'lucide-react'

export default function RenunciasPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-100 dark:from-gray-900 dark:via-red-900/20 dark:to-rose-900/30 p-6">
            <div className="container mx-auto px-6 py-6">
                <motion.div
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-center"
                >
                    <div className="inline-flex p-4 bg-gradient-to-r from-red-500 to-rose-600 rounded-3xl mb-6 shadow-xl">
                        <FileX className="h-16 w-16 text-white" />
                    </div>
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent mb-4">
                        Gestión de Renuncias
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                        Administra las renuncias y cancelaciones de contratos
                    </p>
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-red-200 dark:border-red-800">
                        <p className="text-gray-700 dark:text-gray-300 text-lg">
                            📋 Módulo en construcción...
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}