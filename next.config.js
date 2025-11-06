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

  // 🚀 TURBOPACK (Next.js 15+)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
    resolveAlias: {
      '@': './src',
    },
  },

  // 🚀 EXPERIMENTAL: Mejoras de Performance
  experimental: {
    // Optimiza imports de librerías grandes
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      'react-hook-form',
      'zod',
      'recharts',
      'date-fns',
    ],

    // ⚡ Optimizaciones adicionales
    optimizeCss: true, // Optimiza CSS
    optimizeServerReact: true, // Optimiza Server Components
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // ⚡ WEBPACK OPTIMIZATIONS
  webpack: (config, { dev, isServer }) => {
    // Solo en desarrollo
    if (dev) {
      // ⚡ Cacheo agresivo de módulos compilados
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
        maxMemoryGenerations: 5,
      }

      // Reduce logging innecesario
      config.stats = 'errors-warnings'

      // Optimiza resolución de módulos
      config.resolve.symlinks = false

      // ⚡ Optimizaciones adicionales
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false, // Desactivar en dev para más velocidad
      }

      // ⚡ Reducir checks innecesarios
      config.watchOptions = {
        ignored: ['**/node_modules', '**/.git', '**/.next'],
        poll: false, // Usar eventos nativos del FS (más rápido)
      }
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
}

module.exports = nextConfig
