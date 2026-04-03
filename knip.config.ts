import type { KnipConfig } from 'knip'

const config: KnipConfig = {
  entry: [
    'src/app/**/page.tsx',
    'src/app/**/layout.tsx',
    'src/app/**/loading.tsx',
    'src/app/**/error.tsx',
    'src/app/**/not-found.tsx',
    'src/app/api/**/route.ts',
    'src/middleware.ts',
    'sentry.client.config.ts',
    'sentry.server.config.ts',
    'sentry.edge.config.ts',
  ],
  project: ['src/**/*.{ts,tsx}'],
  ignore: [
    'src/lib/supabase/database.types.ts', // auto-generated
    'scripts/**',
    'supabase/**',
    '**/*.test.ts',
    '**/*.test.tsx',
    '**/*.spec.ts',
    'src/tests/**',
  ],
  ignoreDependencies: [
    'autoprefixer',
    'postcss',
    'tailwindcss',
    'tailwindcss-animate',
    'critters',
    'prettier-plugin-tailwindcss',
    'eslint-config-next',
    '@typescript-eslint/eslint-plugin',
    '@typescript-eslint/parser',
    '@eslint/eslintrc',
    '@eslint/js',
    'pg', // used by scripts
    'supabase', // CLI tool
    'cross-env',
    'husky',
    'lint-staged',
    '@types/node',
    '@types/react',
    '@types/react-dom',
  ],
  next: {
    entry: [
      'src/app/**/page.tsx',
      'src/app/**/layout.tsx',
      'src/app/**/loading.tsx',
      'src/app/**/error.tsx',
      'src/app/**/route.ts',
      'next.config.js',
    ],
  },
}

export default config
