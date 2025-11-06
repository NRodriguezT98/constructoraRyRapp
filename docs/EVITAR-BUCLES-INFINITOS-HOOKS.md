# 🔄 Evitar Bucles Infinitos en Hooks de React

## 🚨 PROBLEMA COMÚN: "La app se queda pegada cargando"

### Causa Raíz

El problema ocurre cuando un `useCallback` con objeto/array en dependencias se usa dentro de un `useEffect`:

```typescript
// ❌ INCORRECTO - BUCLE INFINITO
const cargarDatos = useCallback(async () => {
  const data = await api.fetch(filtros)
  setData(data)
}, [filtros]) // ← filtros es un objeto, cambia en cada render

useEffect(() => {
  cargarDatos() // ← Se ejecuta cuando cargarDatos cambia
}, [cargarDatos]) // ← cargarDatos cambia porque filtros cambia → bucle
```

**Ciclo infinito:**
1. Componente renderiza
2. `filtros` (objeto) se crea nuevo en memoria
3. `useCallback` detecta que `filtros` cambió → crea nueva función `cargarDatos`
4. `useEffect` detecta que `cargarDatos` cambió → ejecuta `cargarDatos()`
5. `cargarDatos()` actualiza estado → componente re-renderiza
6. Volver al paso 2 → **BUCLE INFINITO** 🔄

---

## ✅ SOLUCIONES

### Solución 1: Mover lógica dentro de `useEffect` (RECOMENDADA)

```typescript
// ✅ CORRECTO - Sin bucle + Cleanup completo
useEffect(() => {
  let mounted = true // ← Cleanup flag

  const cargarDatos = async () => {
    setCargando(true)
    try {
      const data = await api.fetch(filtros)

      if (!mounted) return // ← Prevenir actualizaciones si desmontó

      setData(data)
    } catch (error) {
      if (!mounted) return
      setError(error.message)
    } finally {
      if (mounted) setCargando(false)
    }
  }

  cargarDatos()

  return () => {
    mounted = false // ← Cleanup al desmontar
    setCargando(false) // ✅ CRÍTICO: Limpiar estado de cargando para evitar skeletons pegados
  }
}, [filtros.search, filtros.estado, filtros.proyecto]) // ← Usar propiedades específicas
```

**Ventajas:**
- ✅ Sin bucles infinitos
- ✅ Cleanup automático
- ✅ Previene "skeletons pegados" al navegar rápido
- ✅ Solo re-ejecuta cuando cambian valores primitivos

**⚠️ IMPORTANTE:** El cleanup `setCargando(false)` en el `return` es **crítico** para prevenir que el skeleton se quede pegado cuando:
1. Navegas rápido entre páginas
2. El componente se desmonta antes de que termine la carga
3. Vuelves a la página y el estado de cargando quedó en `true`

### Solución 2: Separar función de refrescar manual

```typescript
// ✅ CORRECTO - useEffect con lógica interna + función separada para refrescar
useEffect(() => {
  // Cargar automáticamente al cambiar filtros
  // ... (código del ejemplo anterior)
}, [filtros.search, filtros.estado])

// Función separada para refrescar manualmente
const refrescar = useCallback(async () => {
  setCargando(true)
  try {
    const data = await api.fetch(filtros)
    setData(data)
  } finally {
    setCargando(false)
  }
}, [filtros]) // ← OK aquí porque NO está en useEffect
```

### Solución 3: Hook con flag de inicialización (para stores)

```typescript
// ✅ CORRECTO - Para datos globales con Zustand/Redux
const [datosInicializados, setDatosInicializados] = useState(false)

const cargarDatos = useCallback(async () => {
  const data = await api.fetch(filtros)
  setData(data)
  setDatosInicializados(true)
}, [filtros])

useEffect(() => {
  if (!datosInicializados) { // ← Solo ejecutar UNA VEZ
    cargarDatos()
  }
}, [datosInicializados]) // ← Solo depende del flag booleano
```

---

## 🔍 CHECKLIST DE DEBUGGING

Cuando veas "se queda pegado cargando":

1. **Abrir consola del navegador (F12)**
2. **Buscar logs que se repiten infinitamente**
3. **Verificar:**
   - [ ] ¿Hay un `useCallback` con objeto/array en dependencias?
   - [ ] ¿Ese `useCallback` está en las dependencias de un `useEffect`?
   - [ ] ¿El `useEffect` actualiza estado que causa re-render?

Si respondiste **SÍ** a las 3 → **BUCLE INFINITO CONFIRMADO**

---

## 📋 PATRONES CORRECTOS

### Patrón 1: Cargar lista con filtros

### Patrón 1: Cargar lista con filtros

```typescript
export function useListaConFiltros() {
  const [items, setItems] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtros, setFiltros] = useState({ search: '', estado: '' })

  // ✅ Cargar automáticamente cuando cambian filtros
  useEffect(() => {
    let mounted = true

    const cargar = async () => {
      setCargando(true)
      const data = await service.listar(filtros)
      if (mounted) setItems(data)
      if (mounted) setCargando(false)
    }

    cargar()
    return () => { mounted = false }
  }, [filtros.search, filtros.estado]) // ← Propiedades específicas

  // ✅ Función para refrescar manualmente
  const refrescar = useCallback(async () => {
    setCargando(true)
    const data = await service.listar(filtros)
    setItems(data)
    setCargando(false)
  }, [filtros])

  return { items, cargando, refrescar, setFiltros }
}
```

### Patrón 2: Cargar detalle por ID

```typescript
export function useDetalle({ id }: { id: string }) {
  const [item, setItem] = useState(null)
  const [cargando, setCargando] = useState(true)

  // ✅ Cargar cuando cambia ID
  useEffect(() => {
    let mounted = true

    const cargar = async () => {
      setCargando(true)
      try {
        const data = await service.obtener(id)
        if (mounted) setItem(data)
      } finally {
        if (mounted) setCargando(false)
      }
    }

    cargar()
    return () => { mounted = false }
  }, [id]) // ← Solo ID (string primitivo)

  const refrescar = useCallback(async () => {
    const data = await service.obtener(id)
    setItem(data)
  }, [id])

  return { item, cargando, refrescar }
}
```

### Patrón 3: Formulario con validación

```typescript
export function useFormulario() {
  const [datos, setDatos] = useState({})
  const [errores, setErrores] = useState({})

  // ✅ NO usar useEffect para validación
  // Validar en onChange, onBlur o onSubmit
  const validar = useCallback(() => {
    const nuevosErrores = {}
    if (!datos.nombre) nuevosErrores.nombre = 'Requerido'
    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }, [datos]) // ← OK porque NO está en useEffect

  const handleSubmit = useCallback(async () => {
    if (!validar()) return
    await service.guardar(datos)
  }, [datos, validar])

  return { datos, setDatos, errores, handleSubmit }
}
```

---

## 🚫 ANTI-PATRONES A EVITAR

### ❌ Anti-patrón 1: useCallback → useEffect

```typescript
// ❌ NUNCA HACER ESTO
const cargarDatos = useCallback(async () => {
  const data = await api.fetch(filtros)
  setData(data)
}, [filtros])

useEffect(() => {
  cargarDatos()
}, [cargarDatos]) // ← BUCLE INFINITO
```

### ❌ Anti-patrón 2: Objeto completo en dependencias

```typescript
// ❌ NUNCA HACER ESTO
useEffect(() => {
  fetchData(filtros)
}, [filtros]) // ← Objeto completo, cambia en cada render
```

### ❌ Anti-patrón 3: Array vacío con estado externo

```typescript
// ❌ INCORRECTO - No se actualiza cuando cambia filtros
useEffect(() => {
  fetchData(filtros)
}, []) // ← Array vacío, ignora cambios de filtros
```

---

## 📝 REGLAS DE ORO

1. **NUNCA** poner un `useCallback` en las dependencias de un `useEffect`
2. **SIEMPRE** usar propiedades primitivas en dependencias: `[filtros.search, filtros.id]`
3. **SIEMPRE** agregar cleanup function: `return () => { mounted = false }`
4. **PREFERIR** mover lógica async dentro del `useEffect` directamente
5. **USAR** `useCallback` solo para funciones que se pasan como props

---

## 🛠️ HERRAMIENTA DE DIAGNÓSTICO

Script PowerShell para detectar bucles infinitos:

```powershell
# Buscar patrones problemáticos
Get-ChildItem -Path "src/modules" -Recurse -Filter "use*.ts" | ForEach-Object {
    $contenido = Get-Content $_.FullName -Raw

    # Detectar useCallback seguido de useEffect con callback
    if ($contenido -match 'const\s+(\w+)\s*=\s*useCallback.*\n.*useEffect.*\[\s*\1\s*\]') {
        Write-Host "⚠️ Posible bucle en: $($_.FullName)" -ForegroundColor Yellow
    }
}
```

---

## 📚 REFERENCIAS

- **Hooks implementados correctamente:**
  - ✅ `useClientes.ts` - Usa flag `datosInicializados`
  - ✅ `useAuditorias.ts` - useEffect con cleanup y dependencias vacías
  - ✅ `useDocumentosVivienda.ts` - Lógica dentro de useEffect (ACTUALIZADO)
  - ✅ `useViviendasList.ts` - Propiedades específicas en dependencias (ACTUALIZADO)
  - ✅ `paso-ubicacion-nuevo.tsx` - Removido setValue de dependencias (ACTUALIZADO)

- **Documentación oficial:**
  - https://react.dev/learn/you-might-not-need-an-effect
  - https://react.dev/reference/react/useEffect#removing-unnecessary-object-dependencies
  - https://react.dev/reference/react-hook-form#setValue

## ⚠️ CASO ESPECIAL: React Hook Form

### Problema con `setValue` en dependencias

```typescript
// ❌ INCORRECTO - setValue puede cambiar en cada render
useEffect(() => {
  setValue('campo', 'valor')
}, [proyectoSeleccionado, setValue]) // ← setValue causa re-renders

// ✅ CORRECTO - Omitir setValue de dependencias
useEffect(() => {
  setValue('campo', 'valor')
}, [proyectoSeleccionado]) // ← setValue es estable, no necesita estar
```

**Razón:** `setValue` de react-hook-form es una función **estable** que React garantiza que no cambia. No es necesario incluirla en las dependencias.

### Problema con arrays/objetos completos

```typescript
// ❌ INCORRECTO - Array completo cambia en cada render
useEffect(() => {
  const item = items.find(i => i.id === selectedId)
  // ...
}, [selectedId, items]) // ← items (array) siempre es "nuevo"

// ✅ CORRECTO - Usar propiedad primitiva
useEffect(() => {
  const item = items.find(i => i.id === selectedId)
  // ...
}, [selectedId, items.length]) // ← items.length es número primitivo
```

## ⚠️ CASO ESPECIAL: Zustand Store

### Problema con funciones del store en dependencias

```typescript
// ❌ INCORRECTO - Función del store puede cambiar
const { obtenerDatos } = useStore()

useEffect(() => {
  obtenerDatos()
}, [obtenerDatos]) // ← obtenerDatos puede recrearse

// ✅ SOLUCIÓN 1: Flag de inicialización
const [datosInicializados, setDatosInicializados] = useState(false)

useEffect(() => {
  if (!datosInicializados) {
    obtenerDatos().then(() => setDatosInicializados(true))
  }
}, [datosInicializados]) // ← Solo depende del flag

// ✅ SOLUCIÓN 2: Dependencias vacías (solo al montar)
useEffect(() => {
  obtenerDatos()
}, []) // ← Solo ejecutar al montar (si no necesita reactividad)
```

**Razón:** Las funciones de Zustand stores **pueden** recrearse si el store se actualiza internamente, causando re-renders innecesarios.

## 🏃 CASO ESPECIAL: Race Conditions (Navegación Rápida)

### Problema: Skeleton pegado al navegar rápido

```typescript
// ❌ INCORRECTO - Skeleton puede quedarse pegado
useEffect(() => {
  let mounted = true

  const cargar = async () => {
    setCargando(true) // ← Se setea true
    const data = await fetch() // ← Toma 2 segundos
    if (mounted) setData(data)
    if (mounted) setCargando(false) // ← Si desmontó, NUNCA se ejecuta
  }

  cargar()

  return () => {
    mounted = false // ← Solo previene setData, NO limpia cargando
  }
}, [])

// Escenario del bug:
// 1. Entras a la página → setCargando(true)
// 2. Navegas rápido a otra página → mounted = false
// 3. El fetch termina pero setCargando(false) NO se ejecuta
// 4. Vuelves a la página → cargando sigue en true → SKELETON PEGADO
```

```typescript
// ✅ CORRECTO - Cleanup completo
useEffect(() => {
  let mounted = true

  const cargar = async () => {
    setCargando(true)
    const data = await fetch()
    if (mounted) setData(data)
    if (mounted) setCargando(false)
  }

  cargar()

  return () => {
    mounted = false
    setCargando(false) // ✅ CRÍTICO: Siempre limpiar cargando al desmontar
  }
}, [])
```

**Regla de Oro:** Si tienes un estado `cargando`/`loading`, **SIEMPRE** limpiarlo en el cleanup.

---

**Última actualización:** 2025-11-05
**Sesión de corrección masiva:** Se corrigieron 9 archivos con bucles infinitos + race conditions

**Archivos corregidos (Hooks):**
1. `useDocumentosVivienda.ts` - Bucle infinito + cleanup de loading
2. `useViviendasList.ts` - Bucle infinito + cleanup de cargando (race condition fix)
3. `paso-ubicacion-nuevo.tsx` - Bucle potencial por setValue + array manzanas
4. `useProyectos.ts` - Bucle infinito + error handling (2 hooks)
5. `useDocumentosLista.ts` - Bucle infinito + error handling
6. `useDocumentosListaCliente.ts` - Bucle infinito + error handling

**Archivos corregidos (Client Components - Race Conditions):**
7. `vivienda-detalle-client.tsx` - Race condition en carga de detalle
8. `cliente-detalle-client.tsx` - Race condition + función store en dependencias
9. `proyecto-detalle-client.tsx` - Race condition en carga de detalle

**Patrones identificados:**
- ❌ Funciones de Zustand stores en dependencias de useEffect
- ❌ Objetos/arrays completos en dependencias (referencia cambia en cada render)
- ❌ useCallback → useEffect (función cambia → bucle)
- ❌ Falta de cleanup en estado `cargando/loading` (race conditions) ⭐ **CRÍTICO**

**Soluciones aplicadas:**
- ✅ Flag de inicialización para stores (`datosInicializados`)
- ✅ Solo propiedades primitivas en dependencias
- ✅ Mover lógica async dentro de useEffect
- ✅ Cleanup completo: `mounted = false` + `setLoading(false)` ⭐ **ESENCIAL**
- ✅ Error handling con try/catch en funciones async
- ✅ Guards para prevenir actualizaciones después de desmontar (`if (!mounted) return`)

**Impacto:**
- 🚫 Sin bucles infinitos en ningún módulo
- 🚫 Sin skeletons pegados al navegar rápido
- ✅ Navegación fluida entre páginas
- ✅ Cleanup apropiado en todas las cargas async
