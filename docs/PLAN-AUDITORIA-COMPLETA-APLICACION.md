# 🔍 Plan de Auditoría Completa de la Aplicación

**Fecha de creación**: 1 de diciembre de 2025
**Branch**: `feature/refactor-eliminacion-generico`
**Objetivo**: Auditar y mejorar TODA la aplicación de forma sistemática

---

## 📋 Índice

1. [Metodología de Auditoría](#metodología)
2. [Checklist de Validación](#checklist)
3. [Plan de Ejecución por Módulos](#plan-módulos)
4. [Tracking de Progreso](#tracking)
5. [Plantillas de Reporte](#plantillas)

---

## 🎯 Metodología de Auditoría

### Principios CRÍTICOS a Validar

#### 1️⃣ **Separación de Responsabilidades (INVIOLABLE)**

**Estructura OBLIGATORIA:**
```
src/modules/[modulo]/
├── components/           # SOLO UI presentacional (< 150 líneas)
│   ├── [Componente].tsx
│   └── [Componente].styles.ts
├── hooks/               # TODA la lógica de negocio
│   └── use[Componente].ts
├── services/            # SOLO API/DB calls
│   └── [nombre].service.ts
├── store/              # Estado global (Zustand)
│   └── [nombre].store.ts
└── types/              # TypeScript types
    └── index.ts
```

**Validaciones:**
- [ ] ¿El componente tiene useState/useEffect con lógica compleja? → ❌ Mover a hook
- [ ] ¿El componente tiene llamadas fetch/supabase? → ❌ Mover a service
- [ ] ¿El componente tiene cálculos/transformaciones? → ❌ Mover a hook
- [ ] ¿El componente tiene strings de Tailwind > 80 caracteres? → ❌ Mover a .styles.ts
- [ ] ¿El archivo tiene > 150 líneas? → ❌ Refactorizar

---

#### 2️⃣ **React Query (Reemplazo de Zustand para Server State)**

**Patrón CORRECTO:**
```typescript
// ✅ HOOKS: useXXXQuery.ts
export function useXXXQuery(id: string) {
  return useQuery({
    queryKey: ['xxx', id],
    queryFn: () => XXXService.obtenerXXX(id),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export function useCrearXXXMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => XXXService.crear(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['xxx'] })
    },
  })
}
```

**Validaciones:**
- [ ] ¿Datos del servidor están en Zustand? → ❌ Migrar a React Query
- [ ] ¿useEffect manual para fetch? → ❌ Reemplazar con useQuery
- [ ] ¿Refetch manual después de mutaciones? → ❌ Usar invalidateQueries
- [ ] ¿Estado de loading/error duplicado? → ✅ React Query ya lo provee
- [ ] ¿Cache configurado (staleTime, gcTime)? → ✅ Requerido

---

#### 3️⃣ **Sistema Genérico de Documentos**

**Patrón CORRECTO:**
```typescript
// ✅ Componente genérico
<DocumentosLista
  entidadId={entity.id}
  tipoEntidad="proyecto" | "vivienda" | "cliente"
  moduleName="proyectos" | "viviendas" | "clientes"
/>

// ✅ Service genérico
DocumentosBaseService.obtenerDocumentosPorEntidad(id, tipoEntidad)
```

**Validaciones:**
- [ ] ¿Módulo usa componente legacy de documentos? → ❌ Migrar a genérico
- [ ] ¿Servicio duplicado por módulo? → ❌ Usar DocumentosBaseService
- [ ] ¿Theming hardcodeado? → ❌ Usar prop moduleName
- [ ] ¿Queries con case-sensitivity? → ✅ Minúsculas ('activo', 'archivado')

---

#### 4️⃣ **Theming y Estilos**

**Patrón CORRECTO:**
```typescript
// ✅ Theming dinámico
import { moduleThemes, type ModuleName } from '@/shared/config/module-themes'

interface Props {
  moduleName?: ModuleName
}

export function Component({ moduleName = 'proyectos' }: Props) {
  const theme = moduleThemes[moduleName]

  return (
    <div className={theme.classes.gradient.primary}>
      {/* ... */}
    </div>
  )
}
```

**Validaciones:**
- [ ] ¿Colores hardcodeados en componentes reutilizables? → ❌ Usar moduleThemes
- [ ] ¿Strings de Tailwind > 80 caracteres inline? → ❌ Extraer a .styles.ts
- [ ] ¿Dark mode falta? → ❌ Agregar variantes dark:
- [ ] ¿Componente genérico sin prop moduleName? → ❌ Agregar soporte

---

#### 5️⃣ **Validación de Datos (Zod + React Hook Form)**

**Patrón CORRECTO:**
```typescript
// ✅ Schema Zod
const schema = z.object({
  nombre: z.string().min(1, 'Requerido'),
  email: z.string().email('Email inválido'),
})

// ✅ Form
const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { ... },
})
```

**Validaciones:**
- [ ] ¿Validaciones manuales en onSubmit? → ❌ Usar Zod schema
- [ ] ¿useState para form values? → ❌ Usar react-hook-form
- [ ] ¿Validación duplicada (frontend + backend)? → ✅ Centralizar en schema
- [ ] ¿Errores personalizados en español? → ✅ Requerido

---

#### 6️⃣ **Consultas SQL y Supabase**

**Validaciones CRÍTICAS:**
```typescript
// ✅ CORRECTO
.eq('estado', 'activo')           // Minúscula
.select('*, usuario:usuarios(*)')  // Join explícito
.order('fecha_creacion', { ascending: false })

// ❌ INCORRECTO
.eq('estado', 'Activo')           // Case-sensitivity
.select('*')                      // Sin joins necesarios
// Sin paginación en listas grandes
```

**Validaciones:**
- [ ] ¿Case-sensitivity en filtros? → ✅ Minúsculas siempre
- [ ] ¿Joins faltantes? → ❌ Agregar relaciones necesarias
- [ ] ¿Select * sin limit en listas? → ❌ Agregar paginación
- [ ] ¿Queries N+1? → ❌ Optimizar con joins
- [ ] ¿RLS habilitado? → ✅ Verificar políticas

---

#### 7️⃣ **Manejo de Fechas (CRÍTICO)**

**Patrón CORRECTO:**
```typescript
import {
  formatDateCompact,      // dd-MMM-yyyy (RECOMENDADO)
  formatDateForInput,     // YYYY-MM-DD para inputs
  formatDateForDB,        // Guardar con T12:00:00
  getTodayDateString,     // Fecha actual sin timezone shift
} from '@/lib/utils/date.utils'

// ✅ MOSTRAR
{formatDateCompact(fecha)}

// ✅ INPUT
<input value={formatDateForInput(fecha)} />

// ✅ GUARDAR
const data = { fecha: formatDateForDB(inputValue) }
```

**Validaciones:**
- [ ] ¿Uso de `new Date()` directo? → ❌ Usar funciones de date.utils
- [ ] ¿`.toISOString().split('T')[0]`? → ❌ Usar getTodayDateString()
- [ ] ¿Guardar input sin formatDateForDB? → ❌ Causa timezone shift
- [ ] ¿Formato inconsistente en UI? → ✅ Usar formatDateCompact

---

#### 8️⃣ **Gestión de Estado**

**Cuándo usar qué:**

| Tipo de Estado | Herramienta | Ejemplo |
|----------------|-------------|---------|
| **Server State** | React Query | Datos de BD, APIs |
| **UI State Local** | useState | Modales, tabs, toggles |
| **UI State Compartido** | Zustand | Filtros, búsqueda global |
| **Form State** | React Hook Form | Formularios |

**Validaciones:**
- [ ] ¿Datos del servidor en useState? → ❌ Migrar a React Query
- [ ] ¿UI state en Zustand? → ⚠️ Evaluar si necesario
- [ ] ¿Props drilling > 2 niveles? → ❌ Usar Zustand o Context
- [ ] ¿Estado derivado sin useMemo? → ❌ Optimizar

---

#### 9️⃣ **Optimización y Performance**

**Validaciones:**
- [ ] ¿useMemo para cálculos costosos? → ✅ Requerido
- [ ] ¿useCallback para funciones como props? → ✅ Requerido
- [ ] ¿React.memo para componentes pesados? → ✅ Si re-renderiza mucho
- [ ] ¿Lazy loading de componentes? → ✅ Para modales/tabs
- [ ] ¿Imágenes optimizadas (Next Image)? → ✅ Requerido
- [ ] ¿Bundle size monitoreado? → ✅ Usar next/bundle-analyzer

---

#### 🔟 **Accesibilidad (a11y)**

**Validaciones:**
- [ ] ¿Labels con sr-only? → ✅ Para lectores de pantalla
- [ ] ¿aria-label en iconos? → ✅ Requerido
- [ ] ¿Contraste de colores? → ✅ WCAG AA mínimo
- [ ] ¿Navegación por teclado? → ✅ Todos los elementos interactivos
- [ ] ¿Focus visible? → ✅ Anillos de focus claros

---

## 📊 Plan de Ejecución por Módulos

### Fase 1: Core (Sistema Base) - 🔴 PRIORIDAD ALTA

#### 1.1 Autenticación y Seguridad
- **Archivos a auditar:**
  - [ ] `src/contexts/auth-context.tsx`
  - [ ] `src/hooks/auth/*.ts`
  - [ ] `src/middleware.ts`
  - [ ] `src/app/login/page.tsx`
  - [ ] `src/app/login/useLogin.ts`

- **Validaciones específicas:**
  - [ ] ¿Tokens JWT manejados correctamente?
  - [ ] ¿Refresh token implementado?
  - [ ] ¿Auto-logout funcional?
  - [ ] ¿RLS verificado en Supabase?
  - [ ] ¿Rate limiting en login?

**Tiempo estimado**: 2-3 horas

---

#### 1.2 Sistema de Documentos (Genérico)
- **Archivos a auditar:**
  - [ ] `src/modules/documentos/components/**/*.tsx`
  - [ ] `src/modules/documentos/hooks/**/*.ts`
  - [ ] `src/modules/documentos/services/**/*.ts`
  - [ ] `src/modules/documentos/store/documentos.store.ts`

- **Validaciones específicas:**
  - [ ] ✅ Ya validado: Sistema genérico completo
  - [ ] ✅ Ya validado: Theming dinámico
  - [ ] ✅ Ya validado: React Query implementado
  - [ ] ⚠️ TODO: Migrar métodos faltantes (obtenerEstadoProceso)

**Tiempo estimado**: 1 hora (revisar TODOs)

---

#### 1.3 Shared Components y Utilities
- **Archivos a auditar:**
  - [ ] `src/shared/components/**/*.tsx`
  - [ ] `src/lib/utils/**/*.ts`
  - [ ] `src/shared/config/module-themes.ts`

- **Validaciones específicas:**
  - [ ] ¿Componentes reutilizables bien abstraídos?
  - [ ] ¿Utilities tienen unit tests?
  - [ ] ¿Funciones puras sin efectos secundarios?
  - [ ] ✅ Ya validado: date.utils.ts profesional

**Tiempo estimado**: 2 horas

---

### Fase 2: Módulos de Negocio - 🟡 PRIORIDAD MEDIA-ALTA

#### 2.1 Módulo de Proyectos
- **Archivos a auditar:**
  - [ ] `src/modules/proyectos/components/**/*.tsx`
  - [ ] `src/modules/proyectos/hooks/**/*.ts`
  - [ ] `src/modules/proyectos/services/**/*.ts`
  - [ ] `src/app/proyectos/**/*.tsx`

- **Checklist específico:**
  - [ ] ¿Separación de responsabilidades correcta?
  - [ ] ¿React Query para datos de proyectos?
  - [ ] ¿Documentos usando sistema genérico? ✅ Ya validado
  - [ ] ¿Formularios con Zod + React Hook Form?
  - [ ] ¿Optimizaciones (useMemo, useCallback)?

**Tiempo estimado**: 3-4 horas

---

#### 2.2 Módulo de Clientes
- **Archivos a auditar:**
  - [ ] `src/modules/clientes/components/**/*.tsx`
  - [ ] `src/modules/clientes/hooks/**/*.ts`
  - [ ] `src/modules/clientes/services/**/*.ts`
  - [ ] `src/modules/clientes/documentos/**/*` (legacy a eliminar)
  - [ ] `src/app/clientes/**/*.tsx`

- **Checklist específico:**
  - [ ] ✅ Ya validado: Documentos migrados a genérico
  - [ ] ✅ Ya validado: Store legacy eliminado
  - [ ] ⚠️ Pendiente: Revisar negociaciones (muchos archivos)
  - [ ] ⚠️ Pendiente: Revisar fuentes de pago
  - [ ] ⚠️ Pendiente: Revisar asignación de vivienda
  - [ ] ¿Historial de cliente optimizado?

**Tiempo estimado**: 5-6 horas (módulo más complejo)

---

#### 2.3 Módulo de Viviendas
- **Archivos a auditar:**
  - [ ] `src/modules/viviendas/components/**/*.tsx`
  - [ ] `src/modules/viviendas/hooks/**/*.ts`
  - [ ] `src/modules/viviendas/services/**/*.ts`
  - [ ] `src/app/viviendas/**/*.tsx`

- **Checklist específico:**
  - [ ] ✅ Ya validado: Documentos migrados a genérico
  - [ ] ⚠️ Pendiente: Sistema de inactivación/bloqueo
  - [ ] ⚠️ Pendiente: Conflictos y validaciones
  - [ ] ⚠️ Pendiente: Edición de vivienda
  - [ ] ¿Queries optimizadas (joins)?

**Tiempo estimado**: 4-5 horas

---

#### 2.4 Módulo de Negociaciones
- **Archivos a auditar:**
  - [ ] `src/modules/clientes/services/negociaciones.service.ts`
  - [ ] `src/modules/clientes/services/negociaciones-versiones.service.ts`
  - [ ] `src/modules/clientes/hooks/useNegociaciones*.ts`
  - [ ] `src/app/clientes/[id]/tabs/negociaciones*.tsx`
  - [ ] `src/app/clientes/[id]/negociaciones/**/*`

- **Checklist específico:**
  - [ ] ¿Sistema de versiones bien implementado?
  - [ ] ¿Fuentes de pago validadas?
  - [ ] ¿Proceso de creación optimizado?
  - [ ] ⚠️ Muchos archivos duplicados (tab, tab-v2, tab-old)

**Tiempo estimado**: 4 horas

---

#### 2.5 Módulo de Abonos
- **Archivos a auditar:**
  - [ ] `src/modules/abonos/components/**/*.tsx`
  - [ ] `src/modules/abonos/hooks/**/*.ts`
  - [ ] `src/modules/abonos/services/**/*.ts`

- **Checklist específico:**
  - [ ] ¿Validación de desembolsos correcta?
  - [ ] ¿Comprobantes de pago bien manejados?
  - [ ] ¿Historial de abonos optimizado?

**Tiempo estimado**: 2-3 horas

---

### Fase 3: Módulos Admin y Avanzados - 🟢 PRIORIDAD MEDIA

#### 3.1 Módulo de Procesos Admin
- **Archivos a auditar:**
  - [ ] `src/modules/admin/procesos/**/*`

- **Checklist específico:**
  - [ ] ¿Plantillas de procesos validadas?
  - [ ] ¿Timeline de procesos optimizado?
  - [ ] ¿Documentos de proceso bien integrados?

**Tiempo estimado**: 3 horas

---

#### 3.2 Módulo de Auditorías
- **Archivos a auditar:**
  - [ ] `src/modules/auditorias/**/*`

- **Checklist específico:**
  - [ ] ✅ Ya validado: Sistema modular de renderers
  - [ ] ¿Queries de auditoría optimizadas?
  - [ ] ¿Filtros funcionando correctamente?

**Tiempo estimado**: 2 horas

---

### Fase 4: Base de Datos y Migraciones - 🔵 PRIORIDAD BAJA

#### 4.1 Estructura de Base de Datos
- **Archivos a auditar:**
  - [ ] `supabase/migrations/**/*.sql`
  - [ ] `supabase/policies/**/*.sql`
  - [ ] `supabase/storage/**/*.sql`

- **Validaciones:**
  - [ ] ¿RLS correctamente implementado?
  - [ ] ¿Índices optimizados?
  - [ ] ¿Constraints adecuados?
  - [ ] ¿Triggers funcionando?

**Tiempo estimado**: 3-4 horas

---

#### 4.2 Seeds y Datos de Prueba
- **Archivos a auditar:**
  - [ ] `supabase/seeds/**/*.sql`
  - [ ] `supabase/verification/**/*.sql`

**Tiempo estimado**: 1 hora

---

## 📈 Tracking de Progreso

### Resumen General

| Fase | Módulos | Estado | Progreso | Tiempo Estimado | Tiempo Real |
|------|---------|--------|----------|-----------------|-------------|
| **Fase 1: Core** | 3 módulos | ⚪ Pendiente | 0/3 | 5-6 horas | - |
| **Fase 2: Negocio** | 5 módulos | 🟡 Parcial | 1/5 | 18-22 horas | - |
| **Fase 3: Admin** | 2 módulos | ⚪ Pendiente | 0/2 | 5 horas | - |
| **Fase 4: Base Datos** | 2 módulos | ⚪ Pendiente | 0/2 | 4-5 horas | - |
| **TOTAL** | **12 módulos** | **8%** | **1/12** | **32-38 horas** | **0 horas** |

### Leyenda de Estados
- 🟢 **Completo**: Auditado y sin issues
- 🟡 **Parcial**: Auditado parcialmente, tiene issues menores
- 🔴 **Issues Críticos**: Requiere refactoring urgente
- ⚪ **Pendiente**: No auditado

---

## 📝 Plantillas de Reporte

### Plantilla de Auditoría por Módulo

```markdown
# Auditoría: [Nombre del Módulo]

**Fecha**: YYYY-MM-DD
**Auditor**: [Nombre]
**Tiempo invertido**: X horas

## 📊 Resumen Ejecutivo

- **Estado General**: 🟢 / 🟡 / 🔴
- **Archivos auditados**: X/Y
- **Issues encontrados**: X
- **Issues críticos**: X

## ✅ Checklist de Validación

### Separación de Responsabilidades
- [ ] Componentes < 150 líneas
- [ ] Lógica en hooks
- [ ] Estilos centralizados
- [ ] Servicios separados

### React Query
- [ ] Server state en React Query
- [ ] Cache configurado
- [ ] Mutations con invalidación

### Estilos y Theming
- [ ] Dark mode completo
- [ ] Theming dinámico (si aplica)
- [ ] Sin colores hardcodeados

### Queries y DB
- [ ] Case-sensitivity correcto
- [ ] Joins necesarios
- [ ] Paginación (si aplica)

### Performance
- [ ] useMemo para cálculos
- [ ] useCallback para callbacks
- [ ] Lazy loading (si aplica)

## 🐛 Issues Encontrados

### 🔴 Críticos
1. [Descripción del issue]
   - Archivo: `path/to/file.ts`
   - Línea: X
   - Solución propuesta: [...]

### 🟡 Menores
1. [Descripción del issue]
   - Archivo: `path/to/file.ts`
   - Línea: X
   - Solución propuesta: [...]

### 💡 Oportunidades de Mejora
1. [Sugerencia de mejora]
   - Beneficio esperado: [...]

## 📋 Plan de Acción

- [ ] Fix crítico 1
- [ ] Fix crítico 2
- [ ] Mejora 1
- [ ] Mejora 2

## 📈 Métricas

- **Líneas de código auditadas**: X
- **Componentes refactorizados**: X
- **Queries optimizadas**: X
- **Reducción de código duplicado**: X%

```

---

## 🎯 Estrategia de Ejecución

### Opción 1: Auditoría Continua (Recomendada)
- **Duración**: 2-3 semanas
- **Sesiones**: 2-3 horas diarias
- **Ventajas**:
  - No bloquea desarrollo
  - Permite ir aplicando fixes inmediatamente
  - Menos fatiga mental

### Opción 2: Sprint de Auditoría
- **Duración**: 3-5 días intensivos
- **Sesiones**: 6-8 horas diarias
- **Ventajas**:
  - Visión completa rápida
  - Contexto fresco
  - Momentum de refactoring

### Opción 3: Híbrida (Nuestra Propuesta)
- **Fase 1 (Core)**: Sprint de 1 día (6-8 horas)
- **Fase 2 (Negocio)**: Continua (1 módulo por día, 3-4 horas)
- **Fase 3-4 (Admin/DB)**: Sprint final de 1 día

**Tiempo total estimado**: 8-10 días laborales

---

## 🚀 Comenzar Auditoría

### Siguiente Paso Inmediato

**Comenzar con Fase 1.1: Autenticación y Seguridad**

¿Por qué empezar aquí?
1. Es la base de seguridad de toda la app
2. Es crítico que esté bien implementado
3. Es relativamente autocontenido
4. Tiempo estimado: 2-3 horas (terminable en 1 sesión)

### Comando para iniciar

```bash
# Crear rama de auditoría
git checkout -b audit/authentication-security

# Generar reporte inicial
node scripts/audit-module.js authentication
```

---

## 📚 Recursos y Referencias

### Documentación Interna
- `docs/PLANTILLA-ESTANDAR-MODULOS.md` - Estándar de módulos
- `docs/ARQUITECTURA-SEPARACION-RESPONSABILIDADES.md` - Separación de responsabilidades
- `docs/SISTEMA-THEMING-MODULAR.md` - Theming
- `docs/GUIA-MANEJO-FECHAS-PROFESIONAL.md` - Manejo de fechas

### Herramientas
- ESLint - Linting
- TypeScript - Type checking
- React Query DevTools - Debugging
- Lighthouse - Performance

---

## ✅ Criterios de Éxito

Al finalizar la auditoría completa, la aplicación debe cumplir:

1. ✅ **100% separación de responsabilidades**
   - 0 componentes con lógica de negocio
   - 0 hooks con JSX
   - 0 servicios con estado

2. ✅ **100% React Query para server state**
   - 0 useEffect manual para fetch
   - 0 datos del servidor en Zustand
   - Cache configurado en todas las queries

3. ✅ **0 código duplicado innecesario**
   - Componentes genéricos reutilizados
   - Servicios compartidos
   - Utilities centralizadas

4. ✅ **Performance optimizado**
   - Lighthouse score > 90
   - Bundle size < 500KB
   - Lazy loading implementado

5. ✅ **100% type-safe**
   - 0 errores TypeScript
   - 0 uso de `any`
   - Tipos generados desde DB

6. ✅ **Accesibilidad WCAG AA**
   - Navegación por teclado
   - Lectores de pantalla
   - Contraste adecuado

---

## 📊 Dashboard de Progreso

```
┌─────────────────────────────────────────────────────────┐
│  AUDITORÍA COMPLETA - PROGRESO GENERAL                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  8%    │
│                                                         │
│  Fase 1: Core           ░░░░░░░░░░░░░░░░░░░░░   0/3   │
│  Fase 2: Negocio        ████░░░░░░░░░░░░░░░░░   1/5   │
│  Fase 3: Admin          ░░░░░░░░░░░░░░░░░░░░░   0/2   │
│  Fase 4: Base Datos     ░░░░░░░░░░░░░░░░░░░░░   0/2   │
│                                                         │
│  Issues Críticos:       0                               │
│  Issues Menores:        0                               │
│  Mejoras Sugeridas:     0                               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

**Última actualización**: 2025-12-01
**Estado**: Plan creado - Pendiente de iniciar
**Siguiente acción**: Decidir estrategia de ejecución
