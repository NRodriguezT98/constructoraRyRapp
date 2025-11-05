/** @type {import('next').NextConfig} */
const nextConfig = {
  // ⚡ OPTIMIZACIONES DE IMÁGENES
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
    qualities: [75, 90, 100],
    // 🚀 Cacheo agresivo de imágenes
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
  },

  // ⚡ OPTIMIZACIONES DE DESARROLLO
  reactStrictMode: true, // Detectar problemas de renderizado
  swcMinify: true, // SWC es 17x más rápido que Babel

  // 🚀 EXPERIMENTAL: Mejoras de Performance
  experimental: {
    // Compila solo lo que cambia (incremental)
    incrementalCacheHandlerPath: undefined,

    // Optimiza imports de librerías grandes
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      'react-hook-form',
      'zod',
    ],

    // Turbopack para compilación ultra-rápida (Next.js 14+)
    // turbo: {
    //   rules: {
    //     '*.svg': {
    //       loaders: ['@svgr/webpack'],
    //       as: '*.js',
    //     },
    //   },
    // },
  },

  // ⚡ WEBPACK OPTIMIZATIONS (si no usas Turbopack)
  webpack: (config, { dev, isServer }) => {
    // Solo en desarrollo
    if (dev) {
      // Cacheo agresivo de módulos compilados
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
      }

      // Reduce logging innecesario
      config.stats = 'errors-warnings'

      // Optimiza resolución de módulos
      config.resolve.symlinks = false
    }

    return config
  },

  // 🎯 OTRAS CONFIGURACIONES
  typedRoutes: false,
  env: {
    PORT: '3000',
  },
  compress: true,
  poweredByHeader: false,

  // ⚡ Solo validar en build, no en dev
  typescript: {
    ignoreBuildErrors: false, // Validar tipos en build
  },
  eslint: {
    ignoreDuringBuilds: false, // Validar en build
  },

  // 🚀 Deshabilitar telemetría (privacidad + velocidad)
  telemetry: false,
}

module.exports = nextConfig
