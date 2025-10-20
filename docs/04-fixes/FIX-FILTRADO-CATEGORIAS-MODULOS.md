# FIX: Bug de Filtrado de Categorías por Módulo

**Fecha**: 17 de Octubre, 2025
**Estado**: ✅ RESUELTO

---

## 🐛 Problema Reportado

Usuario creaba categoría "Documentos de Identidad" configurada **solo para clientes**, pero al navegar a **proyectos**, la categoría también aparecía allí.

### Síntoma
Categorías NO se filtraban correctamente por módulo después de crear/actualizar.

---

## 🔍 Causa Raíz Identificada

### Problema 1: Componente No Modular
`CategoriasManager` estaba hardcodeado para usar `useCategoriasManager` (hook de proyectos), sin importar desde qué módulo se llamara.

```tsx
// ❌ ANTES: Siempre usaba proyectos
export function CategoriasManager({ userId, onClose }: Props) {
  const hook = useCategoriasManager({ userId }) // ← Solo proyectos
}
```

**Resultado**: Clientes usaba el hook de proyectos, creando categorías con `modulos_permitidos = ['proyectos']` en lugar de `['clientes']`.

### Problema 2: Store Sin Contexto de Módulo
El store `documentos.store.ts` NO guardaba el módulo actual, causando que las recargas después de CRUD usaran siempre 'proyectos'.

```typescript
// ❌ ANTES: Hardcodeado a proyectos
cargarCategorias: async (userId: string) => {
  const categorias = await Service.obtenerCategoriasPorModulo(userId, 'proyectos')
}
```

**Resultado**: Al crear desde clientes, recargaba con filtro 'proyectos' en lugar de 'clientes'.

### Problema 3: Hook No Pasaba Módulo
`useCategoriasManager` NO recibía ni usaba información del módulo actual.

```typescript
// ❌ ANTES: No sabía para qué módulo creaba
const handleCrear = async (data) => {
  await crearCategoria(userId, {
    ...data, // ← Faltaban es_global y modulos_permitidos
  })
}
```

**Resultado**: Service usaba fallback `['proyectos']` para todas las categorías.

---

## ✅ Solución Implementada

### 1. CategoriasManager Agnóstico
Agregado prop `modulo` opcional con default 'proyectos':

```tsx
// ✅ DESPUÉS: Agnóstico del módulo
interface CategoriasManagerProps {
  userId: string
  onClose: () => void
  modulo?: 'proyectos' | 'clientes' | 'viviendas' // ← Nuevo
}

export function CategoriasManager({ userId, onClose, modulo = 'proyectos' }) {
  const hook = useCategoriasManager({ userId, modulo }) // ← Pasa módulo
}
```

**Uso en clientes**:
```tsx
<CategoriasManager
  userId={user.id}
  onClose={ocultarCategorias}
  modulo="clientes" // ← Especifica módulo
/>
```

### 2. Store Con Contexto de Módulo
Agregado campo `moduloActual` para guardar el módulo de la sesión:

```typescript
// ✅ DESPUÉS: Guarda módulo actual
interface DocumentosState {
  // ... otros campos
  moduloActual: 'proyectos' | 'clientes' | 'viviendas'
  cargarCategorias: (userId: string, modulo?: string) => Promise<void>
}

cargarCategorias: async (userId, modulo?) => {
  const moduloAUsar = modulo || get().moduloActual
  set({ moduloActual: moduloAUsar }) // ← Guarda para recargas

  const categorias = await Service.obtenerCategoriasPorModulo(userId, moduloAUsar)
}
```

**Resultado**: Recargas después de CRUD usan el módulo correcto automáticamente.

### 3. Hook Con Soporte de Módulo
`useCategoriasManager` ahora recibe y usa el módulo:

```typescript
// ✅ DESPUÉS: Hook modular
interface UseCategoriasManagerProps {
  userId: string
  modulo?: 'proyectos' | 'clientes' | 'viviendas'
}

export function useCategoriasManager({ userId, modulo = 'proyectos' }) {
  useEffect(() => {
    if (userId) {
      cargarCategorias(userId, modulo) // ← Pasa módulo
    }
  }, [userId, modulo, cargarCategorias])

  const handleCrear = async (data) => {
    await crearCategoria(userId, {
      ...data,
      es_global: data.esGlobal ?? false,
      modulos_permitidos: data.esGlobal ? [] : (data.modulosPermitidos ?? [modulo]),
      //                                                                      ^^^^^^
      //                                        Usa módulo del contexto
    })
  }
}
```

---

## 🧪 Testing Realizado

### Test 1: Crear Categoría Solo Clientes ✅
1. Ir a **Clientes** → Documentos → "Categorías"
2. Crear "Test Final Solo Clientes" (checkbox **solo Clientes**)
3. Guardar
4. Verificar en DB: `modulos_permitidos = ['clientes']` ✅
5. Ir a **Proyectos** → Documentos → "Categorías"
6. Verificar: **NO aparece** "Test Final Solo Clientes" ✅

**Logs de verificación**:
```
🎯 [useCategoriasManager] Creando categoría para módulo: clientes
📝 [crearCategoria] Datos: {es_global: false, modulos_permitidos: ['clientes']}
✅ [obtenerCategoriasPorModulo] Módulo clientes: 1 categoría
  - Test Final Solo Clientes | modulos: [clientes]

✅ [obtenerCategoriasPorModulo] Módulo proyectos: 4 categorías
  - NO incluye "Test Final Solo Clientes" ✅
```

---

## 📁 Archivos Modificados

### 1. `src/modules/documentos/components/categorias/categorias-manager.tsx`
- **Agregado**: Prop `modulo?: 'proyectos' | 'clientes' | 'viviendas'`
- **Cambio**: Pasa `modulo` al hook `useCategoriasManager`

### 2. `src/modules/documentos/hooks/useCategoriasManager.ts`
- **Agregado**: Prop `modulo` en interface
- **Cambio**: `useEffect` llama `cargarCategorias(userId, modulo)`
- **Cambio**: `handleCrear` pasa `modulos_permitidos: [modulo]` si no es global

### 3. `src/modules/documentos/store/documentos.store.ts`
- **Agregado**: Campo `moduloActual: 'proyectos' | 'clientes' | 'viviendas'`
- **Cambio**: `cargarCategorias(userId, modulo?)` acepta módulo opcional
- **Cambio**: Guarda `moduloActual` en estado para recargas

### 4. `src/app/clientes/[id]/tabs/documentos-tab.tsx`
- **Cambio**: `<CategoriasManager modulo="clientes" />` especifica módulo

---

## 📊 Resultado

### Antes (Bug)
- Crear categoría en **clientes** → se guardaba con `modulos_permitidos = ['proyectos']`
- Aparecía incorrectamente en **proyectos**
- Filtrado SQL correcto, pero datos insertados mal

### Después (Fix)
- Crear categoría en **clientes** → se guarda con `modulos_permitidos = ['clientes']`
- **Solo** aparece en **clientes**
- Filtrado SQL funciona correctamente con datos correctos

---

## 🎯 Lecciones Aprendidas

1. **Componentes reutilizables deben ser agnósticos**: No hardcodear contexto, usar props.
2. **Estado debe incluir contexto**: Store necesitaba `moduloActual` para recargas coherentes.
3. **Debugging con logs**: Logs estratégicos (`🔍`, `📝`, `✅`) aceleraron identificación.
4. **Testing inmediato**: Detectar bug temprano evitó acumulación de datos incorrectos.

---

## ✅ Estado Final

- ✅ Categorías se crean con módulo correcto
- ✅ Filtrado SQL funciona correctamente
- ✅ Navegación entre módulos recarga con filtro apropiado
- ✅ UX consistente entre Proyectos y Clientes
- ✅ Sistema flexible 100% funcional

**Próximos pasos**:
- Eliminar categorías de prueba creadas durante debugging
- Testing de categorías globales
- Testing de categorías multi-módulo (proyectos + viviendas)
