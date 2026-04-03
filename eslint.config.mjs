// eslint.config.mjs - ESLint v9 Flat Config
// Migración desde .eslintrc.json para RyR Constructora

import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

const eslintConfig = [
  // ============================================
  // 🚫 ARCHIVOS IGNORADOS
  // ============================================
  {
    ignores: [
      // ── Carpetas de build / tooling ──────────────────────────────────
      '**/node_modules/**',
      '**/.next/**',
      '**/out/**',
      '**/dist/**',
      '**/.turbo/**',
      '**/coverage/**',
      '**/.git/**',
      '**/build/**',
      // ── Tipos generados automáticamente ─────────────────────────────
      'src/lib/supabase/database.types.ts',
      'src/types/database.types.ts',
      // ── Carpetas que NO son código de producción ─────────────────────
      '.agents/**',              // Templates de skills de agentes
      'public/**/*.js',          // Scripts de debug servidos estáticamente
      'supabase/diagnostico/**', // Scripts de diagnóstico SQL
      'next-env.d.ts',           // Generado por Next.js, no editar
      'scripts/data-ops/fix-utf8.js', // Contiene bytes UTF-8 literales que confunden el parser
    ],
  },

  // ============================================
  // 📦 EXTENDS - Next.js + TypeScript
  // ============================================
  ...compat.extends(
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended'
  ),

  // ============================================
  // ⚙️ CONFIGURACIÓN PRINCIPAL
  // ============================================
  {
    files: ['**/*.{js,jsx,ts,tsx}'],

    plugins: {
      '@typescript-eslint': typescriptEslint,
    },

    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2021,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        React: 'readonly',
        JSX: 'readonly',
      },
    },

    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
    },

    rules: {
      // =============================================================================
      // 🚨 ERROR RULES (Errores críticos)
      // =============================================================================
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      'no-console': 'error',
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-var': 'error',
      'prefer-const': 'error',

      // =============================================================================
      // ⚠️ WARNING RULES (Advertencias importantes)
      // =============================================================================
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-empty-function': 'warn',
      '@typescript-eslint/no-inferrable-types': 'warn',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // =============================================================================
      // 📝 CODE STYLE RULES
      // =============================================================================
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/display-name': 'warn',

      // =============================================================================
      // 🚀 IMPORT ORGANIZATION
      // =============================================================================
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          pathGroups: [
            {
              pattern: 'react',
              group: 'builtin',
              position: 'before',
            },
            {
              pattern: 'next/**',
              group: 'external',
              position: 'after',
            },
            {
              pattern: '@/**',
              group: 'internal',
            },
          ],
          pathGroupsExcludedImportTypes: ['react'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],

      // =============================================================================
      // 🏗️ CONSTRUCTORA RyR SPECIFIC RULES
      // =============================================================================
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../../../*'],
              message:
                'Usa path aliases (@/) en lugar de imports relativos profundos',
            },
          ],
        },
      ],

      // Preferir logger sobre console (deshabilitado en scripts)
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.object.name='console']",
          message:
            'Usa logger en lugar de console para logging consistente',
        },
      ],
    },
  },

  // ============================================
  // 🔧 OVERRIDES - Scripts y Config Files
  // ============================================
  {
    files: [
      'scripts/**/*',
      '*.config.js',
      '*.config.ts',
      '*.config.mjs',
      '*.config.cjs',
      'next.config.js',
      'tailwind.config.js',
      'postcss.config.js',
    ],
    rules: {
      // Scripts son Node.js legacy (CommonJS) — permitir todo lo necesario
      'no-console': 'off',
      'no-restricted-syntax': 'off',
      'no-alert': 'off',
      'no-var': 'off',
      'prefer-const': 'off',
      'import/order': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },

  // ============================================
  // 🔍 DEBUG FILES - Permitir console.log temporalmente
  // ============================================
  {
    files: [
      'src/middleware.ts',
      'src/lib/auth/server.ts',
      'src/app/**/page.tsx', // Server Components con logs de debug
    ],
    rules: {
      'no-console': 'off',
      'no-restricted-syntax': 'off',
    },
  },

  // ============================================
  // 📄 JavaScript Files (legacy)
  // ============================================
  {
    files: ['*.js', '*.jsx'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
    },
  },

  // ============================================
  // 📄 React-PDF Files (renderers, no HTML DOM)
  // ============================================
  {
    files: [
      '**/*PDF*.tsx',
      '**/*pdf*.tsx',
      '**/*pdf*.service.tsx',
      '**/*PDF*.service.tsx',
    ],
    rules: {
      // @react-pdf/renderer usa Image, Text, View, etc. — no son elementos HTML
      // jsx-a11y no aplica a componentes de renderizado de PDF
      'jsx-a11y/alt-text': 'off',
    },
  },
];

export default eslintConfig;
