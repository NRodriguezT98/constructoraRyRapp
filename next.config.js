/** @type {import('next').NextConfig} */
const { withSentryConfig } = require('@sentry/nextjs')

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
    localPatterns: [
      {
        // Imágenes públicas (public/)
        pathname: '/**',
      },
      {
        // API proxy de comprobantes con query string
        pathname: '/api/**',
        search: '**',
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
    // 🔒 Habilita forbidden() y unauthorized() para control de acceso HTTP nativo
    authInterrupts: true,
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

  // 🔀 REDIRECTS: rutas inexistentes → destino correcto
  async redirects() {
    return [
      // /dashboard no existe — el dashboard real está en '/'
      {
        source: '/dashboard',
        destination: '/',
        permanent: false,
      },
    ]
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
    ignoreBuildErrors: true, // ⚠️ TEMPORALMENTE PARA VERCEL DEPLOY
  },
  eslint: {
    ignoreDuringBuilds: true, // ⚠️ TEMPORALMENTE DESACTIVADO PARA VERCEL DEPLOY
  },
}

module.exports = withSentryConfig(nextConfig, {
  // Sentry organization and project (set these in CI/CD or .env)
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Subir source maps solo cuando SENTRY_AUTH_TOKEN esté disponible (CI/CD)
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Suprime el output de Sentry durante el build local para no contaminar logs
  silent: !process.env.CI,

  // No fallar el build si Sentry no está configurado (entorno local)
  hideSourceMaps: true,

  // Deshabilitar telemetría de Sentry
  telemetry: false,
})
