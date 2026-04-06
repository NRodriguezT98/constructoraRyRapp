# 🏗️ ARQUITECTURA: SEPARACIÓN DE RESPONSABILIDADES

## 🎯 PRINCIPIO FUNDAMENTAL (INVIOLABLE)

> **"Cada archivo tiene UNA y SOLO UNA responsabilidad"**

Esta es la regla más importante del proyecto. **NO ES NEGOCIABLE.**

---

## 📐 ESTRUCTURA OBLIGATORIA POR MÓDULO

```
src/modules/[nombre-modulo]/
├── components/               # ← SOLO UI PRESENTACIONAL
│   ├── [Componente].tsx     # Máximo 150 líneas, CERO lógica
│   ├── [Componente].styles.ts # Estilos centralizados
│   └── index.ts             # Barrel export
│
├── hooks/                   # ← SOLO LÓGICA DE NEGOCIO
│   ├── use[Componente].ts   # Estado, efectos, cálculos
│   └── index.ts
│
├── services/                # ← SOLO API/DB
│   ├── [nombre].service.ts  # Llamadas a Supabase, fetch, axios
│   └── index.ts
│
├── types/                   # ← SOLO TIPOS TYPESCRIPT
│   └── index.ts
│
├── utils/                   # ← SOLO FUNCIONES PURAS
│   ├── formatters.ts        # formatearDinero, formatearFecha
│   ├── validators.ts        # Validaciones sin side effects
│   └── index.ts
│
└── styles/                  # ← SOLO ESTILOS COMPARTIDOS
    ├── [modulo].styles.ts
    └── index.ts
```

---

## 🚫 ANTI-PATTERNS (PROHIBIDO)

### ❌ **Anti-pattern #1: Lógica en Componentes**

```typescript
// ❌ MAL - Componente con lógica
export function MiComponente() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(false)

  // ❌ NUNCA: Lógica de negocio en componente
  useEffect(() => {
    const fetchUsuarios = async () => {
      setLoading(true)
      const { data } = await supabase.from('usuarios').select('*')
      setUsuarios(data)
      setLoading(false)
    }
    fetchUsuarios()
  }, [])

  // ❌ NUNCA: Cálculos complejos en componente
  const usuariosActivos = usuarios.filter(u => u.estado === 'activo')
  const totalActivos = usuariosActivos.length

  return <div>{totalActivos}</div>
}
```

### ❌ **Anti-pattern #2: Llamadas directas a DB**

```typescript
// ❌ MAL - Llamada directa a Supabase
export function CrearUsuario() {
  const handleSubmit = async (data) => {
    // ❌ NUNCA: Supabase directo en componente
    const { error } = await supabase
      .from('usuarios')
      .insert(data)

    if (error) toast.error(error.message)
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

### ❌ **Anti-pattern #3: Estilos inline largos**

```typescript
// ❌ MAL - Strings de Tailwind > 80 caracteres
export function Card() {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 shadow-lg hover:shadow-2xl transition-all duration-300">
      Contenido
    </div>
  )
}
```

---

## ✅ PATTERNS CORRECTOS (OBLIGATORIO)

### ✅ **Pattern #1: Hook con Lógica**

```typescript
// ✅ CORRECTO - hooks/useMiComponente.ts
import { useState, useEffect, useMemo } from 'react'
import { usuariosService } from '../services/usuarios.service'

export function useMiComponente() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // ✅ Lógica de fetching
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const data = await usuariosService.getAll()
        setUsuarios(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // ✅ Cálculos memorizados
  const usuariosActivos = useMemo(() =>
    usuarios.filter(u => u.estado === 'activo'),
    [usuarios]
  )

  const totalActivos = useMemo(() =>
    usuariosActivos.length,
    [usuariosActivos]
  )

  return {
    usuarios,
    usuariosActivos,
    totalActivos,
    loading,
    error
  }
}
```

### ✅ **Pattern #2: Componente Presentacional**

```typescript
// ✅ CORRECTO - components/MiComponente.tsx
import { useMiComponente } from '../hooks/useMiComponente'
import { miComponenteStyles as styles } from './MiComponente.styles'

export function MiComponente() {
  // ✅ SOLO llamar al hook
  const { totalActivos, loading, error } = useMiComponente()

  // ✅ SOLO renderizado condicional simple
  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} />

  // ✅ SOLO UI presentacional
  return (
    <div className={styles.container}>
      <span className={styles.badge}>
        {totalActivos} activos
      </span>
    </div>
  )
}
```

### ✅ **Pattern #3: Service con API/DB**

```typescript
// ✅ CORRECTO - services/usuarios.service.ts
import { supabase } from '@/lib/supabase/client'
import type { Usuario } from '../types'

export class UsuariosService {
  // ✅ Métodos específicos para cada operación
  async getAll(): Promise<Usuario[]> {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data
  }

  async create(usuario: Partial<Usuario>): Promise<Usuario> {
    const { data, error } = await supabase
      .from('usuarios')
      .insert(usuario)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  async update(id: string, updates: Partial<Usuario>): Promise<Usuario> {
    const { data, error } = await supabase
      .from('usuarios')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  }
}

// ✅ Exportar instancia singleton
export const usuariosService = new UsuariosService()
```

### ✅ **Pattern #4: Estilos Centralizados**

```typescript
// ✅ CORRECTO - components/MiComponente.styles.ts
export const miComponenteStyles = {
  container: 'flex items-center gap-3 p-4 rounded-xl transition-all duration-300',

  card: `
    flex items-center gap-3 p-4 rounded-xl
    bg-gradient-to-br from-blue-50 to-indigo-50
    dark:from-blue-950/30 dark:to-indigo-950/30
    border border-blue-200 dark:border-blue-800
    shadow-lg hover:shadow-2xl
    transition-all duration-300
  `.replace(/\s+/g, ' ').trim(),

  badge: 'inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold',

  // ✅ Variantes organizadas
  variants: {
    primary: 'bg-blue-500 hover:bg-blue-600',
    secondary: 'bg-gray-500 hover:bg-gray-600',
    danger: 'bg-red-500 hover:bg-red-600'
  }
}
```

---

## 📏 LÍMITES ESTRICTOS

| Tipo de Archivo | Responsabilidad | Líneas Máx | Si excede... |
|------------------|----------------|------------|--------------|
| **Componente `.tsx`** | UI presentacional | **150** | Dividir en sub-componentes |
| **Hook leaf `use*.ts`** | Una sola responsabilidad (`useDetectarCambios`, `useManzanasEditables`) | **200** | Dividir en sub-hooks |
| **Hook orquestador `use*.ts`** | Compone sub-hooks + estado de wizard (`useEditarProyecto`, `useNuevoProyecto`) | **600** | Extraer sub-hooks si contiene lógica de negocio directa |
| **Service `.service.ts`** | API/DB calls | **300** | Dividir por dominio |
| **Styles `.styles.ts`** | Estilos | ∞ | Organizar por secciones |
| **Utils `.ts`** | Funciones puras | **150** | Dividir por categoría |

> **Diagnóstico rápido para hooks**: Si el hook contiene llamadas a DB directas (`supabase`) o lógica de negocio no delegada a sub-hooks → dividir, sin importar el número de líneas.

---

## 🔍 CHECKLIST DE VALIDACIÓN

Antes de hacer commit, verificar:

### **Para Componentes (.tsx):**
- [ ] ¿Tiene `useState` o `useEffect`? → Mover lógica a hook
- [ ] ¿Tiene fetch/axios/supabase? → Mover a service
- [ ] ¿Tiene cálculos complejos? → Mover a hook con `useMemo`
- [ ] ¿Tiene strings de Tailwind > 80 chars? → Mover a `.styles.ts`
- [ ] ¿Tiene > 150 líneas? → Dividir en sub-componentes
- [ ] ¿Solo renderiza UI? → ✅ CORRECTO

### **Para Hooks (use*.ts):**
- [ ] ¿Tiene JSX? → Mover a componente
- [ ] ¿Tiene llamadas a API/DB? → Mover a service
- [ ] ¿Usa `useMemo`/`useCallback`? → ✅ CORRECTO
- [ ] ¿Retorna solo datos/funciones? → ✅ CORRECTO
- [ ] ¿Tiene > 200 líneas? → Dividir en sub-hooks

### **Para Services (.service.ts):**
- [ ] ¿Tiene JSX? → Mover a componente
- [ ] ¿Tiene hooks (useState, etc)? → Mover a hook
- [ ] ¿Solo hace llamadas a API/DB? → ✅ CORRECTO
- [ ] ¿Maneja errores correctamente? → ✅ CORRECTO
- [ ] ¿Tiene > 300 líneas? → Dividir por dominio

### **Para Estilos (.styles.ts):**
- [ ] ¿Tiene lógica? → Mover a hook
- [ ] ¿Solo exporta strings/objetos? → ✅ CORRECTO
- [ ] ¿Está organizado por secciones? → ✅ CORRECTO

---

## 🎯 BENEFICIOS DE ESTA ARQUITECTURA

### 1. **Mantenibilidad** 🛠️
```
Cambio de lógica → Editar SOLO el hook
Cambio de UI → Editar SOLO el componente
Cambio de API → Editar SOLO el service
Cambio de estilos → Editar SOLO .styles.ts
```

### 2. **Testabilidad** 🧪
```typescript
// ✅ Hook testeable independientemente
describe('useMiComponente', () => {
  it('debe calcular usuarios activos', () => {
    const { result } = renderHook(() => useMiComponente())
    expect(result.current.totalActivos).toBe(5)
  })
})

// ✅ Service testeable independientemente
describe('UsuariosService', () => {
  it('debe crear usuario', async () => {
    const usuario = await usuariosService.create({ nombre: 'Test' })
    expect(usuario.nombre).toBe('Test')
  })
})
```

### 3. **Reusabilidad** ♻️
```typescript
// ✅ Hook reutilizable en múltiples componentes
export function ComponenteA() {
  const { totalActivos } = useMiComponente()
  return <Badge>{totalActivos}</Badge>
}

export function ComponenteB() {
  const { usuariosActivos } = useMiComponente()
  return <List items={usuariosActivos} />
}
```

### 4. **Escalabilidad** 📈
```
1 módulo = 4 archivos (~400 líneas)
10 módulos = 40 archivos (~4,000 líneas) ✅ MANEJABLE
vs
10 módulos = 1 archivo (~4,000 líneas) ❌ INMANTENIBLE
```

### 5. **Legibilidad** 📖
```typescript
// ✅ CLARO: Al abrir el archivo SÉ exactamente qué hace
// components/MiComponente.tsx → UI
// hooks/useMiComponente.ts → Lógica
// services/usuarios.service.ts → API
// styles/mi-componente.styles.ts → Estilos
```

---

## ⚡ CONSECUENCIAS DE VIOLACIÓN

### ❌ **Deuda técnica acumulada:**
```
Archivo de 696 líneas (actual DetalleAuditoriaModal.tsx)
↓
Difícil de mantener
↓
Bugs difíciles de rastrear
↓
Miedo a modificar
↓
Código legacy en 6 meses
```

### ✅ **Arquitectura limpia:**
```
Archivos de < 150 líneas cada uno
↓
Fácil de entender
↓
Bugs localizados
↓
Confianza al modificar
↓
Código mantenible a largo plazo
```

---

## 📚 REFERENCIAS

- **Ejemplo perfecto**: `src/modules/proyectos/` (refactorizado)
- **Template**: `docs/TEMPLATE-MODULO-ESTANDAR.md`
- **Checklist**: `docs/DESARROLLO-CHECKLIST.md`

---

## 🚨 REGLA DE ORO FINAL

> **Si te preguntas "¿Esto va en el componente o en el hook?"**
>
> **→ SIEMPRE en el hook**

**Esta regla NO es negociable. Es la base de un código escalable y mantenible.** 🏗️
