# 📂 Estructura del Proyecto - Visualización Completa

> Última actualización: Enero 2025

---

## 🎯 Vista Rápida

```
constructoraRyR-app/
├── 📄 Documentación (14 archivos)
├── ⚙️ Configuración (12 archivos)
├── 📦 app/ - Next.js App Router
├── 🧩 src/ - Código fuente
├── 🗄️ supabase/ - Scripts SQL
└── 📚 docs/ - Documentación adicional
```

---

## 📁 Estructura Completa (Detallada)

```
constructoraRyR-app/
│
├── 📄 DOCUMENTACIÓN PRINCIPAL (14 archivos)
│   ├── README.md                      # Introducción general
│   ├── QUICK-START.md                 # 🔥 Guía de 45 minutos
│   ├── CHECKLIST.md                   # 🔥 Trackeo de progreso
│   ├── LISTO-PARA-DESARROLLAR.md      # 🔥 Estado de preparación
│   ├── ARCHITECTURE.md                # Arquitectura del proyecto
│   ├── MODULE_TEMPLATE.md             # Template para nuevos módulos
│   ├── SHARED_INFRASTRUCTURE.md       # API de shared resources
│   ├── PROJECT_INDEX.md               # Índice del proyecto
│   ├── DOCS_INDEX.md                  # Índice de documentación
│   ├── ROADMAP.md                     # Plan de desarrollo
│   ├── RESUMEN_EJECUTIVO.md           # Resumen para stakeholders
│   ├── CONFIRMACION_ARQUITECTURA.md   # Confirmación de patrones
│   └── SUPABASE_SETUP.md              # Setup de Supabase
│
├── ⚙️ CONFIGURACIÓN (12 archivos)
│   ├── .env.example                   # Template de variables
│   ├── .env.local                     # Variables locales (gitignored)
│   ├── .prettierrc.json               # Prettier config
│   ├── .eslintrc.json                 # ESLint config
│   ├── next.config.js                 # Next.js config
│   ├── tailwind.config.js             # Tailwind CSS config
│   ├── tsconfig.json                  # TypeScript config
│   ├── postcss.config.js              # PostCSS config
│   ├── package.json                   # Dependencies + scripts
│   ├── .gitignore                     # Git ignore rules
│   └── .husky/                        # Git hooks
│       └── pre-commit                 # Pre-commit hook
│
├── 📦 APP/ - Next.js App Router
│   ├── layout.tsx                     # Root layout
│   ├── page.tsx                       # Home page
│   ├── globals.css                    # Global styles
│   │
│   ├── login/
│   │   └── page.tsx                   # Login page
│   │
│   ├── proyectos/
│   │   ├── page.tsx                   # Lista de proyectos
│   │   └── [id]/
│   │       ├── page.tsx               # Detalle de proyecto
│   │       └── proyecto-detalle-client.tsx
│   │
│   ├── viviendas/
│   │   └── page.tsx                   # Viviendas page
│   │
│   ├── clientes/
│   │   └── page.tsx                   # Clientes page
│   │
│   ├── abonos/
│   │   └── page.tsx                   # Abonos page
│   │
│   ├── renuncias/
│   │   └── page.tsx                   # Renuncias page
│   │
│   └── admin/
│       └── page.tsx                   # Admin panel
│
├── 🧩 SRC/ - Código Fuente
│   │
│   ├── 📦 modules/ - Módulos de Dominio
│   │   │
│   │   ├── proyectos/ ✅ COMPLETO
│   │   │   ├── index.ts              # Barrel export
│   │   │   ├── README.md             # Documentación del módulo
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── index.ts
│   │   │   │   ├── proyecto-form.tsx
│   │   │   │   ├── proyecto-form.styles.ts
│   │   │   │   ├── proyectos-list.tsx
│   │   │   │   ├── proyectos-list.styles.ts
│   │   │   │   ├── proyecto-card.tsx
│   │   │   │   ├── proyecto-card.styles.ts
│   │   │   │   └── proyecto-detail.tsx
│   │   │   │
│   │   │   ├── hooks/
│   │   │   │   ├── index.ts
│   │   │   │   ├── useProyectos.ts   # Lista proyectos
│   │   │   │   ├── useProyecto.ts    # Detalle proyecto
│   │   │   │   ├── useProyectoForm.ts
│   │   │   │   └── useProyectoCard.ts
│   │   │   │
│   │   │   ├── services/
│   │   │   │   └── proyectos.service.ts
│   │   │   │
│   │   │   ├── store/
│   │   │   │   └── proyectos.store.ts # Zustand store
│   │   │   │
│   │   │   ├── types/
│   │   │   │   └── index.ts          # TypeScript types
│   │   │   │
│   │   │   ├── constants/
│   │   │   │   └── index.ts          # Constants
│   │   │   │
│   │   │   └── styles/
│   │   │       ├── index.ts
│   │   │       ├── classes.ts        # Shared styles
│   │   │       └── animations.ts     # Framer Motion
│   │   │
│   │   ├── viviendas/ 🔄 EN PROGRESO
│   │   │   ├── README.md
│   │   │   ├── components/
│   │   │   │   ├── viviendas-page.tsx
│   │   │   │   └── viviendas-card.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useViviendas.ts
│   │   │   ├── styles/
│   │   │   │   ├── classes.ts
│   │   │   │   └── animations.ts
│   │   │   └── types/
│   │   │       └── index.ts
│   │   │
│   │   └── documentos/ ✅ SISTEMA COMPLETO
│   │       ├── components/
│   │       │   ├── categorias/
│   │       │   ├── lista/
│   │       │   ├── formulario/
│   │       │   └── detalle/
│   │       ├── schemas/
│   │       │   └── documento.schema.ts
│   │       └── store/
│   │           └── documentos.store.ts
│   │
│   ├── 🎨 components/ - Componentes Globales
│   │   ├── navbar.tsx
│   │   ├── sidebar.tsx
│   │   ├── theme-toggle.tsx
│   │   ├── theme-provider.tsx
│   │   ├── page-transition.tsx
│   │   │
│   │   ├── proyectos/ (legacy, migrar a módulos)
│   │   │   ├── formulario-proyecto.tsx
│   │   │   └── lista-proyectos.tsx
│   │   │
│   │   └── ui/ - shadcn/ui components
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── glass-card.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       └── textarea.tsx
│   │
│   ├── 🎣 contexts/ - React Contexts
│   │   └── auth-context.tsx          # Autenticación
│   │
│   ├── 🛠️ lib/ - Utilidades Core
│   │   ├── utils.ts                  # Helpers generales
│   │   ├── supabase.ts               # Cliente Supabase (legacy)
│   │   │
│   │   ├── supabase/
│   │   │   ├── client.ts             # Cliente Supabase
│   │   │   └── database.types.ts     # ✅ Tipos generados
│   │   │
│   │   └── validations/
│   │       └── proyecto.ts           # Validaciones Zod
│   │
│   ├── 📦 shared/ - Infraestructura Compartida
│   │   ├── index.ts                  # Barrel export central
│   │   ├── README.md                 # Documentación completa
│   │   │
│   │   ├── components/
│   │   │   ├── index.ts
│   │   │   └── ui/
│   │   │       ├── loading-spinner.tsx
│   │   │       ├── empty-state.tsx
│   │   │       ├── error-boundary.tsx
│   │   │       └── confirm-dialog.tsx
│   │   │
│   │   ├── hooks/ ✅ 6 hooks
│   │   │   ├── index.ts
│   │   │   ├── useClickOutside.ts
│   │   │   ├── useDebounce.ts
│   │   │   ├── useLocalStorage.ts
│   │   │   ├── useMediaQuery.ts
│   │   │   ├── useMounted.ts
│   │   │   └── useScroll.ts
│   │   │
│   │   ├── constants/ ✅ 50+ constants
│   │   │   ├── index.ts
│   │   │   ├── config.ts            # App configuration
│   │   │   ├── messages.ts          # Error/Success messages
│   │   │   └── routes.ts            # Route constants
│   │   │
│   │   ├── types/ ✅ 10+ types
│   │   │   ├── index.ts
│   │   │   └── common.ts            # Common types
│   │   │
│   │   ├── utils/ ✅ 30+ utilities
│   │   │   ├── index.ts
│   │   │   ├── format.ts            # Date, currency, number
│   │   │   ├── helpers.ts           # cn, debounce, throttle
│   │   │   └── validation.ts        # Email, phone, etc.
│   │   │
│   │   └── styles/ ✅ 120+ classes
│   │       ├── index.ts
│   │       ├── classes.ts           # Tailwind variants
│   │       └── animations.ts        # Framer Motion
│   │
│   ├── 🔧 services/ - Servicios Globales
│   │   ├── documentos.service.ts
│   │   └── categorias.service.ts
│   │
│   ├── 🗄️ store/ - Estado Global
│   │   └── proyectos-store.ts       # Zustand (legacy)
│   │
│   └── 📘 types/ - Tipos Globales
│       ├── proyecto.ts
│       └── documento.types.ts
│
├── 🗄️ SUPABASE/ - Scripts SQL
│   ├── schema.sql                    # Schema completo (8 tablas)
│   ├── storage-setup.sql             # Configuración de Storage
│   ├── rls-policies.sql              # Row Level Security
│   └── create-storage-bucket.sql     # Crear bucket
│
├── 📚 DOCS/ - Documentación Adicional
│   ├── GUIA-ESTILOS.md              # Código limpio y estilos
│   ├── SISTEMA-DOCUMENTOS.md        # Sistema de documentos
│   ├── AUTH-SETUP.md                # Setup de autenticación
│   ├── CODIGO-LIMPIO-SISTEMA.md     # Principios de código
│   ├── EVALUACION-BASES.md          # 🔥 Evaluación completa
│   └── SUPABASE-SETUP-RAPIDO.md     # 🔥 Setup de DB (30 min)
│
├── 📜 SCRIPTS/
│   ├── crear-modulo.ps1             # Script para crear módulos
│   └── crear-componentes.ps1        # Script para componentes
│
└── .vscode/ - Configuración VS Code
    ├── settings.json                # Workspace settings
    ├── extensions.json              # Extensiones recomendadas
    └── ryr-snippets.code-snippets   # Snippets personalizados
```

---

## 📊 Estadísticas del Proyecto

### Archivos Totales

```
Documentación:     14 archivos  (~122 páginas)
Configuración:     12 archivos
Código fuente:     ~80 archivos
Scripts SQL:        4 archivos
Scripts PowerShell: 2 archivos
──────────────────────────────────
TOTAL:            ~112 archivos
```

### Líneas de Código (estimado)

```
TypeScript/TSX:    ~8,000 líneas
CSS/Tailwind:      ~1,500 líneas
SQL:               ~1,000 líneas
Config:              ~500 líneas
──────────────────────────────────
TOTAL:            ~11,000 líneas
```

### Estado por Área

| Área                  | Estado | Progreso |
|-----------------------|--------|----------|
| **Arquitectura**      | ✅     | 100%     |
| **Documentación**     | ✅     | 100%     |
| **Herramientas**      | ✅     | 100%     |
| **Infraestructura**   | ✅     | 100%     |
| **DB Types**          | ✅     | 100%     |
| **UI Components**     | ⚠️     | 70%      |
| **Base de Datos**     | ⚠️     | 50%      |
| **Autenticación**     | ⚠️     | 30%      |
| **Módulos**           | 🔄     | 50%      |

---

## 🎯 Módulos por Estado

### ✅ Completos (33%)

- **Proyectos** (2/6)
  - Arquitectura limpia
  - Hooks separados
  - Estilos centralizados
  - CRUD funcional

### 🔄 En Progreso (17%)

- **Viviendas** (1/6)
  - Estructura creada
  - Falta integración con DB

### ⏳ Pendientes (50%)

- **Clientes** (0%)
- **Abonos** (0%)
- **Renuncias** (0%)
- **Admin** (0%)

---

## 📦 Dependencias Clave

### Producción (18 principales)

```json
{
  "next": "15.5.5",
  "react": "19.2.0",
  "typescript": "5.9.4",
  "@supabase/supabase-js": "2.75.0",
  "tailwindcss": "3.4.18",
  "framer-motion": "12.23.24",
  "zustand": "5.0.3",
  "react-hook-form": "7.65.0",
  "zod": "4.1.12",
  "@radix-ui/react-*": "~1.1.0",
  "lucide-react": "0.472.0",
  "next-themes": "0.4.5",
  "date-fns": "4.1.0"
}
```

### Desarrollo (11 principales)

```json
{
  "prettier": "3.6.2",
  "eslint": "9.37.0",
  "husky": "9.1.7",
  "lint-staged": "16.2.4",
  "@typescript-eslint/parser": "8.46.1",
  "@typescript-eslint/eslint-plugin": "8.46.1",
  "prettier-plugin-tailwindcss": "0.7.0",
  "tailwindcss-animate": "1.0.7",
  "cross-env": "7.0.3"
}
```

---

## 🎨 Convenciones de Nombres

### Archivos

```
Componentes:       PascalCase.tsx        (ProyectoCard.tsx)
Estilos:          kebab-case.styles.ts  (proyecto-card.styles.ts)
Hooks:            camelCase.ts          (useProyectos.ts)
Services:         kebab-case.service.ts (proyectos.service.ts)
Stores:           kebab-case.store.ts   (proyectos.store.ts)
Types:            kebab-case.types.ts   (proyecto.types.ts)
Utils:            kebab-case.ts         (format.ts)
```

### Carpetas

```
Módulos:          kebab-case/           (proyectos/, viviendas/)
Componentes:      kebab-case/           (ui/, categorias/)
```

---

## 🔍 Path Aliases

```typescript
@/*           → src/*
@/components  → src/components/*
@/modules     → src/modules/*
@/shared      → src/shared/*
@/lib         → src/lib/*
@/types       → src/types/*
@/services    → src/services/*
@/hooks       → src/hooks/*
```

**Ejemplo**:
```typescript
import { Button } from '@/components/ui/button'
import { useProyectos } from '@/modules/proyectos'
import { cn, formatDate } from '@/shared'
import { supabase } from '@/lib/supabase/client'
```

---

## 📚 Dónde Encontrar...

| Busco...                    | Ubicación                            |
|-----------------------------|--------------------------------------|
| **Componentes UI**          | `src/components/ui/`                 |
| **Hooks personalizados**    | `src/shared/hooks/`                  |
| **Utilidades**              | `src/shared/utils/`                  |
| **Constantes**              | `src/shared/constants/`              |
| **Animaciones**             | `src/shared/styles/animations.ts`    |
| **Estilos compartidos**     | `src/shared/styles/classes.ts`       |
| **Tipos comunes**           | `src/shared/types/common.ts`         |
| **Cliente Supabase**        | `src/lib/supabase/client.ts`         |
| **Tipos de DB**             | `src/lib/supabase/database.types.ts` |
| **Módulo completo**         | `src/modules/proyectos/`             |
| **Template de módulo**      | `MODULE_TEMPLATE.md`                 |
| **Guía de estilos**         | `docs/GUIA-ESTILOS.md`               |
| **Setup de Supabase**       | `docs/SUPABASE-SETUP-RAPIDO.md`      |

---

## 🎯 Siguiente Paso

**Si eres nuevo**:

1. Lee `QUICK-START.md` (45 minutos)
2. Sigue `docs/SUPABASE-SETUP-RAPIDO.md` (30 minutos)
3. Explora `src/modules/proyectos/` (ejemplo perfecto)
4. Lee `MODULE_TEMPLATE.md` (crear tu módulo)

**Si ya configuraste Supabase**:

1. Estudia `src/modules/proyectos/` (arquitectura)
2. Copia estructura para nuevo módulo
3. ¡Desarrolla! 🚀

---

**Última actualización**: Enero 2025
**Archivos**: ~112
**Líneas de código**: ~11,000
**Estado**: ✅ 68.75% listo (solo falta Supabase)
