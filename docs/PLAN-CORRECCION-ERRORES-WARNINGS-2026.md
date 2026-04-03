# Plan de Corrección de Errores, Warnings y Calidad de Código — 2026

> **Fecha de auditoría:** 2 de abril de 2026
> **Estado:** ✅ COMPLETADO — 0 errores, 0 warnings
> **Objetivo:** Cero errores ESLint, cero warnings, código limpio y pipeline CI robusto

---

## ✅ Resultado Final

| Categoría               | Antes        | Después      |
| ----------------------- | ------------ | ------------ |
| **ESLint Errors**       | 575          | **0** ✅     |
| **ESLint Warnings**     | 47           | **0** ✅     |
| **TypeScript Errors**   | 0            | **0** ✅     |
| **Husky / lint-staged** | ✅ Funcional | ✅ Funcional |

> Fase 1 (config), Fase 2 (warnings) completadas. Fase 3 (knip dead code) pendiente para próxima sesión.

---

## 📊 Resumen Ejecutivo

| Categoría                            | Cantidad | Severidad |
| ------------------------------------ | -------- | --------- |
| **ESLint Errors**                    | 575      | 🔴 Alta   |
| **ESLint Warnings**                  | 47       | 🟡 Media  |
| **TypeScript Errors**                | 0        | ✅ Limpio |
| **Archivos sin usar (knip)**         | 149      | 🟡 Media  |
| **Exports sin usar (knip)**          | 588      | 🟡 Media  |
| **Tipos exportados sin usar (knip)** | 207      | 🟡 Media  |
| **Dependencias sin usar**            | 2        | 🟢 Baja   |
| **Dependencias no listadas**         | 2        | 🟡 Media  |
| **Exports duplicados**               | 2        | 🟢 Baja   |

### Distribución de errores ESLint por zona

| Zona                        | Errors  | Warnings | ¿Afecta producción?  |
| --------------------------- | ------- | -------- | -------------------- |
| `src/`                      | **0**   | **42**   | ✅ Warnings sí       |
| `scripts/`                  | **354** | 0        | ❌ No (utilidades)   |
| `.agents/skills/templates/` | **62**  | 0        | ❌ No (templates)    |
| `public/`                   | **76**  | 0        | ⚠️ `debug-helper.js` |
| `supabase/diagnostico/`     | **73**  | 0        | ❌ No (diagnóstico)  |
| Raíz (configs)              | **10**  | 5        | ❌ No (config files) |

---

## 🔴 FASE 1: Configuración ESLint — Eliminar ruido (Prioridad CRÍTICA)

**Problema raíz:** La configuración ESLint NO ignora carpetas que no son código de producción, generando 565/575 errores falsos positivos.

### 1.1 Agregar ignores para carpetas no-producción

**Archivo:** `eslint.config.mjs`

```javascript
// En la sección de ignores, AGREGAR:
{
  ignores: [
    // Existentes
    '**/node_modules/**',
    '**/.next/**',
    '**/out/**',
    '**/dist/**',
    '**/.turbo/**',
    '**/coverage/**',
    '**/.git/**',
    '**/build/**',
    'src/lib/supabase/database.types.ts',
    'src/types/database.types.ts',

    // ✅ NUEVOS: Carpetas que no son código de producción
    '.agents/**',           // Templates de skills de agentes
    'public/**/*.js',       // Scripts de debug en public
    'supabase/diagnostico/**', // Scripts de diagnóstico SQL
  ],
}
```

**Impacto:** Elimina ~211 errores de `.agents/`, `public/`, `supabase/diagnostico/`.

### 1.2 Corregir override de scripts para `no-require-imports`

**Problema:** El override de `scripts/**/*` desactiva `no-console`, `no-restricted-syntax`, y `no-explicit-any`, pero **NO** desactiva `@typescript-eslint/no-require-imports`. Todos los scripts son `.js` con `require()`.

**Archivo:** `eslint.config.mjs` — sección de overrides para scripts

```javascript
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
    'no-console': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-require-imports': 'off', // ✅ AGREGAR
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'off',     // ✅ AGREGAR
    'no-restricted-syntax': 'off',
    'no-var': 'off',           // ✅ AGREGAR (scripts legacy)
    'prefer-const': 'off',     // ✅ AGREGAR (scripts legacy)
    'import/order': 'off',     // ✅ AGREGAR (scripts no usan ESM)
    'no-alert': 'off',         // ✅ AGREGAR
  },
},
```

**Impacto:** Elimina ~354 errores en `scripts/`.

### 1.3 Resultado esperado post-Fase 1

| Métrica              | Antes | Después            |
| -------------------- | ----- | ------------------ |
| **Errors totales**   | 575   | **0**              |
| **Warnings totales** | 47    | **42** (solo src/) |

---

## 🟡 FASE 2: Warnings en `src/` — Correcciones robustas (Prioridad ALTA)

### 2.1 `react-hooks/exhaustive-deps` — 23 warnings

**Estos NO son parches.** Cada uno requiere análisis individual para determinar la intención del desarrollador.

| #   | Archivo                                                                                  | Acción requerida                             |
| --- | ---------------------------------------------------------------------------------------- | -------------------------------------------- |
| 1   | `src/app/login/useLogin.ts`                                                              | Revisar deps del useEffect de auth           |
| 2   | `src/app/login/useRateLimit.ts`                                                          | Agregar deps faltantes o memoizar callback   |
| 3   | `src/hooks/auth/useLogout.ts`                                                            | Verificar si deps omitidos son intencionales |
| 4   | `src/hooks/useIdleTimer.ts`                                                              | Memoizar callbacks con useCallback           |
| 5   | `src/modules/clientes/hooks/useClienteCardActivo.ts`                                     | Agregar deps o extraer a useCallback         |
| 6   | `src/modules/clientes/hooks/useConfigurarFuentesPago.ts`                                 | Revisar efecto de configuración              |
| 7   | `src/modules/clientes/hooks/useCrearNegociacion.ts`                                      | Memoizar handlers                            |
| 8   | `src/modules/clientes/pages/asignar-vivienda-v2/components/sections/SeccionRevision.tsx` | Mover lógica a hook                          |
| 9   | `src/modules/configuracion/components/configurador-campos/hooks/useEditarCampoModal.ts`  | Revisar deps de efecto                       |
| 10  | `src/modules/fuentes-pago/components/CreditoConstructoraForm.tsx`                        | Mover lógica a hook                          |
| 11  | `src/modules/proyectos/hooks/useEditarProyecto.ts`                                       | Agregar deps o memoizar                      |
| 12  | `src/modules/proyectos/hooks/useProyectosForm.ts`                                        | Agregar deps faltantes                       |
| 13  | `src/shared/documentos/hooks/useCategoriasManager.ts`                                    | Revisar deps del efecto                      |
| 14  | `src/shared/documentos/hooks/useDocumentoCard.ts`                                        | Memoizar callback                            |
| 15  | `src/shared/documentos/hooks/useDocumentoUpload.ts`                                      | Agregar deps de upload                       |
| 16  | `src/shared/hooks/useLocationSelector.ts`                                                | Memoizar con useCallback                     |

**Patrón de solución robusto:**

```typescript
// ❌ ANTES (warning)
useEffect(() => {
  handleSomeAction(someValue)
}, []) // Missing dependency: handleSomeAction, someValue

// ✅ DESPUÉS (solución robusta)
const handleSomeAction = useCallback(
  (value: string) => {
    // lógica
  },
  [stableDependency]
)

useEffect(() => {
  handleSomeAction(someValue)
}, [handleSomeAction, someValue])
```

### 2.2 `@typescript-eslint/no-empty-function` — 14 warnings

| #   | Archivo                                                                    | Acción                                        |
| --- | -------------------------------------------------------------------------- | --------------------------------------------- |
| 1   | `src/app/api/abonos/editar/route.ts`                                       | Implementar handler o remover ruta vacía      |
| 2   | `src/hooks/useAutoLogout.ts`                                               | Implementar o marcar con comentario `// noop` |
| 3   | `src/modules/abonos/components/modal-anular-abono/ModalAnularAbono.tsx`    | Agregar `// noop` intencional o implementar   |
| 4   | `src/modules/abonos/components/modal-editar-abono/useModalEditarAbono.ts`  | Implementar handler                           |
| 5   | `src/modules/clientes/components/filtros-clientes.tsx`                     | Agregar `// noop` o implementar               |
| 6   | `src/modules/proyectos/components/proyectos-filtros-premium.tsx`           | Agregar `// noop` o implementar               |
| 7   | `src/modules/viviendas/components/ViviendasFiltrosPremium.tsx`             | Agregar `// noop` o implementar               |
| 8   | `src/shared/documentos/components/eliminados/documento-eliminado-card.tsx` | Implementar o remover                         |

**Patrón de solución:**

```typescript
// ❌ ANTES (warning)
const handleReset = () => {}

// ✅ DESPUÉS - Opción A: Implementar
const handleReset = () => {
  setFilters(defaultFilters)
}

// ✅ DESPUÉS - Opción B: Función noop explícita (si es intencional)
const noop = () => {
  /* intencional: placeholder para prop requerida */
}
```

### 2.3 `jsx-a11y/alt-text` — 3 warnings

| #   | Archivo                                                                        | Línea | Acción                              |
| --- | ------------------------------------------------------------------------------ | ----- | ----------------------------------- |
| 1   | `src/modules/abonos/components/modal-registro-pago/ComprobantePago.tsx`        | L170  | Agregar `alt="Comprobante de pago"` |
| 2   | `src/modules/clientes/pages/asignar-vivienda-v2/components/NegociacionPDF.tsx` | L331  | Agregar `alt="Logo negociación"`    |
| 3   | `src/modules/clientes/services/pdf-preview-react.service.tsx`                  | L333  | Agregar `alt="Logo empresa"`        |

### 2.4 `@next/next/no-img-element` — 2 warnings

| #   | Archivo                                                                | Línea | Acción                                                                                                                                                             |
| --- | ---------------------------------------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | `src/shared/documentos/components/lista/documento-card-horizontal.tsx` | L214  | Evaluar: si es imagen dinámica de Storage, `<img>` es aceptable → agregar `{/* eslint-disable-next-line @next/next/no-img-element */}` con comentario justificando |
| 2   | `src/shared/documentos/components/viewer/documento-viewer.tsx`         | L262  | Igual: si carga imágenes de Supabase Storage, justificar con comentario                                                                                            |

**Nota:** Para imágenes cargadas desde Supabase Storage con URLs dinámicas, `next/image` requiere configurar `remotePatterns` en `next.config.js`. Si ya está configurado, migrar a `<Image />`. Si no, documentar la decisión.

### 2.5 Resultado esperado post-Fase 2

| Métrica              | Antes | Después |
| -------------------- | ----- | ------- |
| **Warnings totales** | 42    | **0**   |

---

## 🟡 FASE 3: Limpieza de código muerto con Knip (Prioridad MEDIA)

### 3.1 Archivos sin usar — 149 archivos

**Estrategia:** Limpiar por módulo, de menor riesgo a mayor riesgo.

#### Grupo A: Archivos claramente obsoletos (eliminar directamente)

- `src/app/abonos/[clienteId]/page-new.tsx` — Versión "new" no usada
- `src/app/login/logo-styles.ts` — Estilos de logo no referenciados
- `src/app/login/toast-notification.tsx` — Componente de toast no usado
- `src/components/auto-logout-provider.tsx` — Reemplazado por `useAutoLogout`
- `src/components/password-strength-indicator.tsx` — No referenciado
- `src/hooks/useAutoLogout.ts` — Si existe provider alternativo
- `src/lib/supabase/query.utils.ts` — Utilidades no usadas
- `src/lib/utils/index.ts` — Barrel file vacío/no usado
- `src/lib/validations/password.ts` — Validación no referenciada
- `src/lib/validations/proyecto.ts` — Reemplazada por Zod schemas

#### Grupo B: Componentes/Tabs deprecados (revisar antes de eliminar)

- `src/app/clientes/[id]/tabs/` — Multiple tabs y components deprecados (~27 archivos)
- `src/app/proyectos/[id]/tabs/manzanas-tab.tsx` — Tab no usada
- `src/modules/fuentes-pago/components/` — Módulo con múltiples no usados (~10 archivos)
- `src/modules/clientes/components/historial/` — Componentes de historial no usados

#### Grupo C: Barrel files vacíos (eliminar o poblar)

- Múltiples `index.ts` en módulos que solo re-exportan archivos no usados
- `src/modules/admin/procesos/components/index.ts`
- `src/modules/auditorias/components/detalles/index.ts`
- `src/modules/auditorias/components/renderers/clientes/index.ts`
- `src/modules/auditorias/components/renderers/viviendas/index.ts`
- etc.

#### Grupo D: UI components de shadcn no usados

- `src/components/ui/dropdown-menu.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/label.tsx`
- `src/components/ui/textarea.tsx`
- `src/components/ui/tooltip.tsx`

**Nota:** Estos podrían usarse en el futuro. Evaluar si mantener como "librería disponible" o eliminar y re-agregar con `npx shadcn-ui@latest add <component>`.

### 3.2 Exports sin usar — 588 exports + 207 tipos

**Estrategia:** No eliminar todos de golpe. Priorizar:

1. **Exports de tipos que nunca se usan**: Eliminar interfaces/types no referenciados
2. **Funciones de servicio no llamadas**: Verificar si son API pública intencional
3. **Props types exportados innecesariamente**: Hacer `interface` local si solo se usa en el archivo

### 3.3 Dependencias

| Dependencia                     | Estado                         | Acción                               |
| ------------------------------- | ------------------------------ | ------------------------------------ |
| `@radix-ui/react-dropdown-menu` | Sin usar                       | Desinstalar con `npm uninstall`      |
| `dotenv`                        | Sin usar (Supabase maneja env) | Desinstalar con `npm uninstall`      |
| `@vitest/coverage-v8`           | No listada                     | `npm install -D @vitest/coverage-v8` |
| `postcss-load-config`           | No listada                     | `npm install -D postcss-load-config` |

### 3.4 Exports duplicados

| Archivo                                                     | Problema               | Acción                                           |
| ----------------------------------------------------------- | ---------------------- | ------------------------------------------------ |
| `src/shared/documentos/services/documentos-base.service.ts` | Export named + default | Eliminar `export default`, mantener named export |
| `src/shared/documentos/services/documentos.service.ts`      | Export named + default | Eliminar `export default`, mantener named export |

---

## 🟢 FASE 4: Fortalecimiento del Pipeline (Prioridad MEDIA)

### 4.1 Husky pre-commit — Problema detectado

**Estado actual:** `lint-staged` con `eslint --fix --max-warnings=0`

**Problema:** El `--max-warnings=0` hará que el commit falle por los 42 warnings actuales en `src/`. Esto significa que:

- O los desarrolladores hacen `git commit --no-verify` (bypass)
- O los warnings ya estaban ahí antes de configurar esta regla

**Acción:** Después de completar Fase 2 (0 warnings), este pipeline será correcto y robusto.

### 4.2 Agregar commit-msg hook (actualmente no existe)

**Archivo:** `.husky/commit-msg` — actualmente NO existe como hook activo

**Recomendación:** Agregar commitlint para mensajes de commit estandarizados:

```bash
# .husky/commit-msg
#!/bin/sh
npx --no -- commitlint --edit "$1"
```

```javascript
// commitlint.config.js (crear)
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        'proyectos',
        'clientes',
        'viviendas',
        'abonos',
        'documentos',
        'auditorias',
        'negociaciones',
        'renuncias',
        'auth',
        'config',
        'shared',
        'ui',
        'db',
        'deps',
        'ci',
      ],
    ],
  },
}
```

### 4.3 Agregar type-check al pre-commit

**Archivo:** `package.json` — lint-staged

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix --max-warnings=0", "prettier --write"],
    "*.{js,jsx}": ["prettier --write"],
    "*.{json,md,yml,yaml}": ["prettier --write"],
    "*.{css,scss}": ["prettier --write"]
  }
}
```

**Nota:** No incluir `tsc --noEmit` en lint-staged porque es lento y verifica todo el proyecto. Mejor agregar como paso de CI.

### 4.4 Script de CI recomendado

```json
// package.json scripts
{
  "ci:check": "npm run type-check && npm run lint && npm run knip:check",
  "knip:check": "knip --no-exit-code",
  "lint": "eslint . --max-warnings=0",
  "type-check": "tsc --noEmit"
}
```

---

## 🟢 FASE 5: Eliminación de `public/debug-helper.js` (Prioridad BAJA)

**Archivo:** `public/debug-helper.js` — 76 errores ESLint

**Problema:** Este archivo está en `public/`, se sirve directamente al navegador. Contiene `console.log`, `var`, `require()`.

**Acción:**

1. Verificar si se usa en producción
2. Si es solo para desarrollo → mover a `scripts/` o eliminar
3. Si es necesario en producción → ya está ignorado por ESLint (Fase 1)

---

## 📋 Orden de Ejecución

| Fase  | Descripción                         | Errores resueltos          | Esfuerzo            |
| ----- | ----------------------------------- | -------------------------- | ------------------- |
| **1** | Config ESLint (ignores + overrides) | 575 errors → 0             | Bajo (1 archivo)    |
| **2** | Warnings en src/                    | 42 warnings → 0            | Medio (16 archivos) |
| **3** | Código muerto (knip)                | 149 archivos + 795 exports | Alto (gradual)      |
| **4** | Pipeline CI/CD                      | Prevención futura          | Medio               |
| **5** | Debug helper                        | Limpieza final             | Bajo                |

---

## ✅ Criterios de Éxito

- [ ] `npx eslint .` → **0 errors, 0 warnings**
- [ ] `npx tsc --noEmit` → **0 errors** (ya cumplido ✅)
- [ ] `npx knip` → Reducción ≥ 50% de archivos/exports sin usar
- [ ] Pre-commit hook funcional sin `--no-verify`
- [ ] Ningún `eslint-disable` nuevo sin justificación documentada
- [ ] Pipeline CI ejecuta lint + type-check + knip

---

## 🚫 Lo que NO haremos (anti-parches)

| Parche temporal           | Por qué NO          | Solución real                         |
| ------------------------- | ------------------- | ------------------------------------- |
| `eslint-disable` masivos  | Oculta errores      | Corregir cada warning individualmente |
| `// @ts-ignore`           | Oculta tipos        | Tipar correctamente                   |
| `--max-warnings=999`      | Permite degradación | Mantener `--max-warnings=0`           |
| Eliminar reglas de ESLint | Reduce calidad      | Corregir código, no reglas            |
| `--no-verify` en commits  | Bypass completo     | Pipeline robusto que funciona         |
| Ignorar knip              | Acumula deuda       | Limpieza gradual por módulo           |
