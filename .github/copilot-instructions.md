si por # RyR Constructora - Sistema de Gestión Administrativa

## 🎯 PRINCIPIOS FUNDAMENTALES (APLICAR SIEMPRE)

### 🚨 REGLA CRÍTICA #-2: EJECUCIÓN DE SQL EN SUPABASE (NUNCA COPIAR/PEGAR)

**⚠️ CUANDO necesites ejecutar CUALQUIER script SQL en Supabase:**

1. **NUNCA** → Copiar/pegar manualmente en Supabase SQL Editor
2. **SIEMPRE** → Usar script automatizado desde terminal
3. **COMANDO** → `npm run db:exec <archivo.sql>` o `node ejecutar-sql.js <archivo.sql>`

**Métodos disponibles (en orden de preferencia):**

```bash
# Método 1: NPM Script (RECOMENDADO) ⭐
npm run db:exec supabase/storage/mi-archivo.sql
npm run db:exec:storage-viviendas  # Alias predefinido

# Método 2: Node.js directo
node ejecutar-sql.js supabase/migrations/mi-migracion.sql

# Método 3: PowerShell (requiere psql)
.\ejecutar-sql.ps1 -SqlFile "supabase\policies\mi-policy.sql"
```

**Ventajas del script automatizado:**
- ✅ Ejecución en 1 comando
- ✅ Logs detallados con tiempo de ejecución
- ✅ Manejo de errores robusto
- ✅ No requiere abrir navegador
- ✅ Reproducible y auditable
- ✅ Integrable en CI/CD

**Casos de uso:**
```bash
# Políticas RLS de Storage
npm run db:exec supabase/storage/storage-documentos-viviendas.sql

# Migraciones
node ejecutar-sql.js supabase/migrations/001_crear_tabla.sql

# Seeds de datos
node ejecutar-sql.js supabase/seeds/categorias-sistema.sql

# Verificaciones
node ejecutar-sql.js supabase/verification/DIAGNOSTICO.sql
```

**Documentación completa:** `docs/EJECUTAR-SQL-DIRECTAMENTE.md`

**Error común que NO repetir:**
- ❌ "Copia este SQL y pégalo en Supabase SQL Editor"
- ✅ "Ejecuta: `npm run db:exec supabase/storage/mi-archivo.sql`"

---

### 🚨 REGLA CRÍTICA #-1: UBICACIÓN DE RUTAS NEXT.JS (VERIFICAR PRIMERO)

**⚠️ ANTES de crear CUALQUIER archivo de ruta/página (`page.tsx`, `layout.tsx`):**

1. **CONSULTAR** → `.github/PROYECTO-ESTRUCTURA.md` (ubicación correcta de App Directory) ⭐
2. **VERIFICAR** → App Directory está en `src/app/` (NO en `app/` raíz)
3. **CREAR** → Rutas SIEMPRE en `src/app/[modulo]/[subruta]/page.tsx`
4. **NUNCA** → Crear carpeta `app/` en raíz del proyecto
5. **VALIDAR** → Después de crear, verificar que NO exista `app/` en raíz

**Error común que NO repetir:**
- ❌ `app/viviendas/nueva/page.tsx` → ✅ `src/app/viviendas/nueva/page.tsx`
- ❌ Crear `app/` en raíz → ✅ Solo usar `src/app/`
- ❌ Asumir ubicación sin verificar → ✅ Consultar PROYECTO-ESTRUCTURA.md

**Comando de verificación obligatorio:**
```powershell
# Antes de crear ruta, verificar que app/ NO existe en raíz
if (Test-Path "app/") { Write-Host "ERROR: app/ existe en raíz" }
```

---

### �� REGLA CRÍTICA #0: SEPARACIÓN DE RESPONSABILIDADES (INVIOLABLE)

**⚠️ ESTA REGLA ES ABSOLUTA Y NO NEGOCIABLE ⚠️**

**TODA implementación, módulo, componente o funcionalidad DEBE cumplir CON:**

#### 📐 **ARQUITECTURA OBLIGATORIA (PATRÓN ESTRICTO):**

```
src/modules/[nombre-modulo]/
├── components/
│   ├── [Componente].tsx              # ← SOLO UI PRESENTACIONAL (< 150 líneas)
│   ├── [Componente].styles.ts        # ← SOLO estilos centralizados
│   └── index.ts
├── hooks/
│   ├── use[Componente].ts            # ← SOLO LÓGICA DE NEGOCIO
│   └── index.ts
├── services/
│   └── [nombre].service.ts           # ← SOLO llamadas API/DB
├── types/
│   └── index.ts                      # ← SOLO tipos TypeScript
└── utils/
    └── [helpers].ts                  # ← SOLO funciones puras
```

#### 🚫 **PROHIBICIONES ABSOLUTAS:**

```typescript
// ❌ PROHIBIDO: Lógica en componentes
export function MiComponente() {
  const [data, setData] = useState([])

  useEffect(() => {
    // ❌ NUNCA: fetch, cálculos complejos, transformaciones
    fetch('/api/data').then(setData)
  }, [])

  const valorCalculado = data.reduce((acc, item) => acc + item.valor, 0) // ❌ NUNCA

  return <div>{valorCalculado}</div>
}

// ❌ PROHIBIDO: Estilos inline extensos
<div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 shadow-lg hover:shadow-2xl transition-all duration-300">
  {/* ❌ NUNCA: strings de Tailwind > 80 caracteres */}
</div>

// ❌ PROHIBIDO: Servicios en componentes
export function MiComponente() {
  const handleSubmit = async () => {
    await supabase.from('tabla').insert(data) // ❌ NUNCA: llamadas directas a DB
  }
}
```

#### ✅ **IMPLEMENTACIÓN CORRECTA (OBLIGATORIA):**

```typescript
// ✅ 1. HOOK CON LÓGICA (hooks/useMiComponente.ts)
export function useMiComponente() {
  const [data, setData] = useState([])
  const { fetchData } = useMiComponenteService() // ← Service separado

  useEffect(() => {
    fetchData().then(setData)
  }, [])

  const valorCalculado = useMemo(() =>
    data.reduce((acc, item) => acc + item.valor, 0),
    [data]
  )

  return { data, valorCalculado }
}

// ✅ 2. COMPONENTE PRESENTACIONAL (components/MiComponente.tsx)
export function MiComponente() {
  const { data, valorCalculado } = useMiComponente() // ← Hook con lógica

  return (
    <div className={styles.container}> {/* ← Estilos centralizados */}
      <span className={styles.valor}>{valorCalculado}</span>
    </div>
  )
}

// ✅ 3. ESTILOS CENTRALIZADOS (components/MiComponente.styles.ts)
export const miComponenteStyles = {
  container: 'flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30',
  valor: 'text-xl font-bold text-blue-600 dark:text-blue-400'
}

// ✅ 4. SERVICE CON API/DB (services/miComponente.service.ts)
export class MiComponenteService {
  async fetchData() {
    const { data } = await supabase.from('tabla').select('*')
    return data
  }
}
```

#### 📏 **LÍMITES ESTRICTOS:**

- **Componente `.tsx`**: Máximo **150 líneas** (si excede → refactorizar)
- **Hook `use*.ts`**: Máximo **200 líneas** (si excede → dividir en sub-hooks)
- **Service `.service.ts`**: Máximo **300 líneas** (si excede → dividir por dominio)
- **Estilos `.styles.ts`**: Sin límite (pero organizados por secciones)
- **String de Tailwind inline**: Máximo **80 caracteres** (si excede → extraer a `.styles.ts`)

#### 🔍 **CHECKLIST DE VALIDACIÓN (antes de commit):**

- [ ] ¿El componente tiene useState/useEffect con lógica compleja? → ❌ **Mover a hook**
- [ ] ¿El componente tiene fetch/axios/supabase? → ❌ **Mover a service**
- [ ] ¿El componente tiene cálculos/transformaciones? → ❌ **Mover a hook con useMemo**
- [ ] ¿El componente tiene strings de Tailwind > 80 chars? → ❌ **Mover a .styles.ts**
- [ ] ¿El archivo tiene > 150 líneas? → ❌ **Refactorizar en componentes pequeños**
- [ ] ¿Hay código duplicado entre componentes? → ❌ **Extraer a shared/utils**

#### 🎯 **BENEFICIOS INNEGOCIABLES:**

1. **Mantenibilidad**: Cambios localizados, bajo riesgo
2. **Testabilidad**: Hooks y services testeables independientemente
3. **Reusabilidad**: Lógica compartible entre componentes
4. **Escalabilidad**: Crecimiento ordenado sin "spaghetti code"
5. **Legibilidad**: Código limpio y autodocumentado

#### ⚡ **CONSECUENCIAS DE VIOLACIÓN:**

- ❌ **Code review rechazado**
- ❌ **Refactorización obligatoria antes de merge**
- ❌ **Deuda técnica que bloquea nuevas features**

**📌 REGLA DE ORO:** Si te preguntas "¿Esto va en el componente o en el hook?" → **SIEMPRE en el hook**

---

### �🚨 REGLA CRÍTICA #1: VALIDACIÓN DE NOMBRES DE CAMPOS

**⚠️ ANTES de escribir CUALQUIER código que interactúe con la base de datos:**

1. **CONSULTAR** → `docs/DATABASE-SCHEMA-REFERENCE-ACTUALIZADO.md` (fuente única de verdad) ⭐
2. **VERIFICAR** → Nombres EXACTOS de tablas y columnas
3. **CONFIRMAR** → Estados permitidos en sección de ENUMS
4. **VALIDAR** → Constraints críticos antes de inserts/updates
5. **NUNCA ASUMIR** → Siempre verificar, nunca inventar nombres

**Errores comunes que NO repetir:**
- ❌ `estado = 'En Proceso'` → ✅ `estado = 'Activa'` (negociaciones)
- ❌ `estado = 'reservada'` → ✅ `estado = 'Asignada'` (viviendas)
- ❌ `estado_interes` → ✅ `estado`
- ❌ `vivienda_precio` → ✅ `vivienda.valor_base`
- ❌ `proyecto_ubicacion` → ✅ `proyecto.estado`
- ❌ `cliente.nombre` → ✅ `cliente.nombres`

**📋 Consultar checklist**: `docs/DESARROLLO-CHECKLIST.md`

---

### ⚠️ REGLA DE ORO: SEPARACIÓN DE RESPONSABILIDADES

**NUNCA mezclar lógica con UI. SIEMPRE separar en:**

1. **Hooks** (`use*.ts`) → Lógica de negocio
2. **Componentes** (`*.tsx`) → UI presentacional pura
3. **Estilos** (`*.styles.ts`) → Clases de Tailwind centralizadas
4. **Servicios** (`*.service.ts`) → Lógica de API/DB
5. **Stores** (`*.store.ts`) → Estado global

---

### 🎨 REGLA CRÍTICA #2: DISEÑO VISUAL ESTANDARIZADO (COMPACTO)

**⚠️ AL crear CUALQUIER módulo de UI:**

1. **CONSULTAR** → `docs/ESTANDAR-DISENO-VISUAL-MODULOS.md` (referencia de diseño) ⭐
2. **COPIAR** → Estructura exacta de módulo de Viviendas como base (referencia compacta)
3. **PERSONALIZAR** → Solo colores según paleta del módulo
4. **VALIDAR** → Header, métricas y filtros idénticos en tamaño/distribución
5. **VERIFICAR** → Glassmorphism, animaciones y dark mode completos

**Elementos OBLIGATORIOS** (copiar estándar compacto):

```typescript
// 1. HEADER HERO (rounded-2xl, p-6, gradiente de 3 colores - COMPACTO)
<motion.div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[COLOR]-600 via-[COLOR]-600 to-[COLOR]-600 dark:from-[COLOR]-700 dark:via-[COLOR]-700 dark:to-[COLOR]-800 p-6 shadow-2xl shadow-[COLOR]-500/20">
  <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black,transparent)]" />
  <div className="relative z-10">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold text-white">Título</h1>
          <p className="text-[COLOR]-100 dark:text-[COLOR]-200 text-xs">Descripción • Contexto</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-medium">
          <Icon className="w-3.5 h-3.5" />
          {count} Items
        </span>
        <motion.button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-medium hover:bg-white/30 transition-all shadow-lg">
          <Plus className="w-4 h-4" />
          Acción
        </motion.button>
      </div>
    </div>
  </div>
</motion.div>

// 2. MÉTRICAS (4 cards, grid gap-3, p-4 - COMPACTO)
<motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
  <motion.div
    whileHover={{ scale: 1.02, y: -4 }}
    transition={{ type: 'spring', stiffness: 300 }}
    className="group relative overflow-hidden rounded-xl backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 p-4 shadow-lg hover:shadow-2xl transition-all duration-300"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-[COLOR]-500/20 to-[COLOR]-500/20 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
    <div className="relative z-10 flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[COLOR]-500 to-[COLOR]-600 flex items-center justify-center shadow-lg shadow-[COLOR]-500/50">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1">
        <p className="text-xl font-bold bg-gradient-to-br from-[COLOR]-600 via-[COLOR]-600 to-[COLOR]-600 bg-clip-text text-transparent">
          {value}
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 font-medium">Label</p>
      </div>
    </div>
  </motion.div>
</motion.div>

// 3. FILTROS (sticky, p-3, horizontal flex - COMPACTO)
<motion.div className="sticky top-4 z-40 backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-3 shadow-2xl shadow-[COLOR]-500/10">
  <div className="flex items-center gap-2">
    <div className="relative flex-1">
      <label className="sr-only">Buscar</label>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
      <input className="w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-[COLOR]-500 focus:ring-2 focus:ring-[COLOR]-500/20 transition-all text-sm placeholder:text-gray-400" placeholder="Buscar..." />
    </div>
    <select className="px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-[COLOR]-500 focus:ring-2 focus:ring-[COLOR]-500/20 transition-all text-sm min-w-[180px]">
      <option>Todos</option>
    </select>
  </div>
  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">{count} resultados</p>
  </div>
</motion.div>
```

**Archivo de estilos** (`styles/[modulo].styles.ts`):
```typescript
export const moduloStyles = {
  container: { page: '...', content: 'py-6 space-y-4' }, // Compacto
  header: { container: 'p-6 rounded-2xl', ... },          // Compacto
  metricas: { grid: 'gap-3', card: 'p-4 rounded-xl', ... }, // Compacto
  filtros: { container: 'p-3 rounded-xl', grid: 'flex gap-2', ... }, // Compacto
}
```

**Paleta de colores por módulo**:
- **Viviendas**: Naranja/Ámbar (`from-orange-600 via-amber-600 to-yellow-600`) - ⭐ REFERENCIA COMPACTA
- **Auditorías**: Azul/Índigo/Púrpura (`from-blue-600 via-indigo-600 to-purple-600`)
- **Proyectos**: Verde/Esmeralda (`from-green-600 via-emerald-600 to-teal-600`)
- **Clientes**: Cyan/Azul (`from-cyan-600 via-blue-600 to-indigo-600`)
- **Negociaciones**: Rosa/Púrpura (`from-pink-600 via-purple-600 to-indigo-600`)
- **Abonos**: Azul/Índigo (`from-blue-600 via-indigo-600 to-purple-600`)
- **Documentos**: Rojo/Rosa (`from-red-600 via-rose-600 to-pink-600`)

**Dimensiones CRÍTICAS (estándar compacto)**:
- Header: `p-6 rounded-2xl`, título `text-2xl`, icon `w-10 h-10`, badge `px-3 py-1.5`
- Métricas: `p-4 rounded-xl gap-3`, icon `w-10 h-10`, valor `text-xl`
- Filtros: `p-3 rounded-xl`, layout `flex gap-2`, inputs `py-2`, labels `sr-only`
- Espaciado: `py-6 space-y-4` (30% menos espacio vertical)

**Errores comunes que NO repetir:**
- ❌ Usar dimensiones antiguas (p-8, text-3xl) → ✅ Usar estándar compacto
- ❌ Grid de filtros → ✅ Flex horizontal con gap-2
- ❌ Labels visibles en filtros → ✅ Labels sr-only (accesibilidad)
- ❌ No usar glassmorphism (`backdrop-blur-xl`) → ✅ Aplicar en todos los cards
- ❌ Olvidar animaciones hover → ✅ `whileHover={{ scale: 1.02, y: -4 }}`
- ❌ No usar gradientes de 3 colores → ✅ `from-[COLOR] via-[COLOR] to-[COLOR]`
- ❌ Olvidar pattern overlay → ✅ `bg-grid-white/10`

---

## 📁 Estructura OBLIGATORIA de Módulos

Al crear cualquier módulo nuevo, SEGUIR esta estructura:

```
src/modules/[nombre-modulo]/
├── components/
│   ├── [componente].tsx              # UI presentacional
│   ├── [componente].styles.ts        # Estilos centralizados
│   ├── tabs/                         # Si usa tabs
│   │   ├── [nombre]-tab.tsx
│   │   └── index.ts                  # Barrel export
│   └── index.ts                      # Barrel export
├── hooks/
│   ├── use[Modulo].ts                # Hook principal
│   ├── use[Componente].ts            # Hook por componente
│   └── index.ts                      # Barrel export
├── services/
│   └── [nombre].service.ts           # API/DB logic
├── store/
│   └── [nombre].store.ts             # Zustand store
├── types/
│   └── index.ts                      # TypeScript types
├── styles/
│   ├── classes.ts                    # Shared styles
│   ├── animations.ts                 # Framer Motion
│   └── index.ts                      # Barrel export
└── README.md                         # Módulo docs
```

**Referencia**: Ver `src/modules/proyectos/` como ejemplo perfecto

---

## ✅ Checklist OBLIGATORIO por Componente

### ANTES de empezar:
- [ ] **Consulté** `docs/DATABASE-SCHEMA-REFERENCE.md` para nombres de campos
- [ ] **Verifiqué** nombres exactos de columnas y tablas
- [ ] **Confirmé** formato de estados/enums
- [ ] **Revisé** `docs/TEMPLATE-MODULO-ESTANDAR.md` para estructura
- [ ] **Importé** componentes de `@/shared/components/layout`
- [ ] **Revisé** checklist completo en `docs/DESARROLLO-CHECKLIST.md`

### Durante desarrollo:
- [ ] **Usar ModuleContainer** como contenedor principal
- [ ] **Usar ModuleHeader** para encabezado
- [ ] **Usar Card** para secciones de contenido
- [ ] **Usar Button** para acciones (NO crear botones custom)
- [ ] **Usar Badge** para etiquetas
- [ ] **Usar LoadingState/EmptyState/ErrorState** para estados de UI
- [ ] Lógica en hook separado (`use*.ts`)
- [ ] Componente < 150 líneas
- [ ] `useMemo` para valores calculados
- [ ] `useCallback` para funciones como props
- [ ] Tipos TypeScript estrictos (no `any`)
- [ ] Imports organizados (React → Next → External → Shared → Local → Hooks → Services → Types)
- [ ] Barrel export (`index.ts`) en carpeta
- [ ] Console.log para debugging de errores
- [ ] **Modo oscuro verificado** en todos los elementos custom
- [ ] **Responsive verificado** (móvil, tablet, desktop)

---

## 🚫 PROHIBIDO

❌ **COPIAR/PEGAR SQL en Supabase SQL Editor** (usar `npm run db:exec <archivo.sql>`)
❌ **VIOLAR SEPARACIÓN DE RESPONSABILIDADES** (lógica/vista/estilos mezclados)
❌ **Componentes > 150 líneas** sin refactorizar
❌ **Lógica de negocio en componentes** (useState, useEffect con lógica compleja)
❌ **Llamadas a API/DB directas en componentes** (usar services)
❌ **Strings de Tailwind > 80 caracteres inline** (extraer a .styles.ts)
❌ **Código duplicado entre componentes** (extraer a shared/utils)
❌ **ASUMIR nombres de campos sin verificar** en `DATABASE-SCHEMA-REFERENCE.md`
❌ **Copiar nombres de otros archivos** sin validar en documentación
❌ **Inventar nombres "lógicos"** sin confirmar en DB
❌ **Crear componentes de UI sin usar los estandarizados** (ModuleContainer, Card, Button, etc.)
❌ **Olvidar modo oscuro** (dark:* en elementos personalizados)
❌ **No usar estados de UI** (LoadingState, EmptyState, ErrorState)
❌ **Usar `any` en TypeScript** (siempre tipar correctamente)

---

## ✅ REQUERIDO

✅ **EJECUTAR SQL con script automatizado** (`npm run db:exec <archivo.sql>`)
✅ **SEPARACIÓN ESTRICTA: Hooks (lógica) + Componentes (UI) + Estilos (centralizados)**
✅ **Hook personalizado por componente** con toda la lógica
✅ **Service por módulo** para llamadas API/DB
✅ **Archivo `.styles.ts`** para strings de Tailwind > 80 caracteres
✅ **Componentes presentacionales puros** (< 150 líneas)
✅ **useMemo/useCallback** para optimización
✅ **Barrel exports (`index.ts`)** en cada carpeta
✅ **Tipos TypeScript estrictos** (sin any)
✅ **Usar componentes estandarizados de `@/shared/components/layout`**
✅ **Consultar TEMPLATE-MODULO-ESTANDAR.md antes de crear módulo**
✅ **Validar con checklist de GUIA-DISENO-MODULOS.md**
✅ **Modo oscuro en TODOS los elementos**
✅ **Estados de UI (loading, empty, error)**
✅ **Imports organizados** (React → Next → External → Shared → Local → Hooks → Services → Types)

---

## 📚 Documentación Completa

### 🔴 CRÍTICA (consultar SIEMPRE):
- **Ejecutar SQL automático**: `docs/EJECUTAR-SQL-DIRECTAMENTE.md` ⭐ **NO MÁS COPY/PASTE**
- **Separación de responsabilidades**: `docs/ARQUITECTURA-SEPARACION-RESPONSABILIDADES.md` ⭐ **PATRÓN INVIOLABLE**
- **Schema DB**: `docs/DATABASE-SCHEMA-REFERENCE-ACTUALIZADO.md` ⭐ **FUENTE ÚNICA DE VERDAD**
- **Checklist desarrollo**: `docs/DESARROLLO-CHECKLIST.md` ⭐ **OBLIGATORIO**
- **Sistema de estandarización**: `docs/SISTEMA-ESTANDARIZACION-MODULOS.md` ⭐ **DISEÑO CONSISTENTE**
- **Política de eliminación (Admin Only)**: `docs/POLITICA-ELIMINACION-DOCUMENTOS-ADMIN-ONLY.md` ⭐ **SEGURIDAD Y ROL**
- **Política de eliminación de versiones**: `docs/POLITICA-ELIMINACION-VERSIONES.md` ⭐ **INTEGRIDAD DE DATOS**

### 📘 Desarrollo:
- **Guía de diseño**: `docs/GUIA-DISENO-MODULOS.md`
- **Template de módulo**: `docs/TEMPLATE-MODULO-ESTANDAR.md`
- **Componentes compartidos**: `src/shared/components/layout/`
- **Arquitectura**: `ARCHITECTURE.md`

---

## Descripción del Proyecto

Aplicación web moderna para la gestión administrativa de la constructora RyR, desarrollada con Next.js 15, TypeScript, Supabase y Tailwind CSS.

## Funcionalidades Principales

- Gestión de proyectos de construcción
- Sistema de documentos con categorías personalizables
- Administración de viviendas
- Gestión de clientes
- Sistema de abonos y pagos
- Manejo de renuncias
- Panel de administración completo
- Sistema de auditoría y reportes
- Versionado de documentos
- Sincronización de datos en tiempo real

## Stack Tecnológico

- **Frontend**: Next.js 15 con App Router
- **Lenguaje**: TypeScript 5.9
- **Styling**: Tailwind CSS 3
- **Base de datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Storage**: Supabase Storage
- **UI Components**: Radix UI + shadcn/ui
- **Animaciones**: Framer Motion
- **Formularios**: React Hook Form + Zod
- **Estado**: Zustand
- **Validación**: Zod

## Estructura del Proyecto (Actualizada)

```
constructoraRyR-app/
├── app/                    # Next.js App Router
├── src/
│   ├── modules/           # Módulos separados por dominio
│   │   ├── proyectos/    # ✅ REFACTORIZADO (ejemplo perfecto)
│   │   └── documentos/   # ✅ Sistema completo
│   ├── shared/            # Recursos compartidos
│   ├── components/        # Componentes globales
│   ├── contexts/          # Contextos React
│   ├── services/          # Servicios globales
│   └── lib/              # Utilidades y configuraciones
├── docs/                  # Documentación
└── supabase/              # SQL scripts
```

## Características de Desarrollo

- Interfaz responsiva y moderna
- Navegación instantánea entre módulos
- Animaciones fluidas con Framer Motion
- Sincronización en tiempo real con Supabase
- Sistema de versionado para auditoría
- Carga optimizada de datos
- **Separación estricta de responsabilidades**
- **Código limpio y mantenible**
- **Hooks personalizados por componente**
- **Estilos centralizados**
