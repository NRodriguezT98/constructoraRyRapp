/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['localhost'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*.supabase.co',
                port: '',
                pathname: '/storage/v1/object/public/**',
            },
        ],
    },
    typedRoutes: true,
    // Configuración de puerto fijo y optimizaciones
    env: {
        PORT: '3000',
    },
    compress: true,
    poweredByHeader: false,
}

module.exports = nextConfig