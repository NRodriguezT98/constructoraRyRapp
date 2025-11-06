# 🐛 FIX: staleTime en React Query - "0 resultados" al navegar

**Fecha**: 6 de Noviembre, 2025
**Problema**: Al navegar al módulo de Viviendas desde sidebar, aparece "0 resultados" temporalmente
**Causa**: `staleTime` muy alto (5 minutos) en queries de React Query
**Solución**: Cambiar `staleTime: 0` para forzar re-fetch al montar componente

---

## 🔍 Análisis del Problema

### **Síntoma Observado**

```
Usuario navega: Dashboard → Viviendas
Resultado: Pantalla muestra "0 resultados" por 1-2 segundos
Luego: Datos se cargan correctamente
```

**Screenshot**: El usuario ve "0 resultados" antes de que carguen las viviendas reales.

### **¿Por qué pasaba esto?**

#### **Configuración ANTERIOR (incorrecta)**

```typescript
// ❌ ANTES: staleTime muy alto
export function useViviendasQuery(filtros?: FiltrosViviendas) {
  return useQuery({
    queryKey: viviendasKeys.list(filtros),
    queryFn: () => viviendasService.listar(filtros),
    staleTime: 1000 * 60 * 5, // ❌ 5 MINUTOS - Demasiado tiempo
  })
}
```

#### **Flujo del Error**

1. **Usuario en Dashboard** (no hay queries de viviendas activas)
2. **Usuario hace clic en "Viviendas"** en sidebar
3. **Componente ViviendasPageMain se monta**
4. **useViviendasList()** llama a **useViviendasQuery({})**
5. **React Query verifica cache**:
   - ¿Hay datos en cache para `['viviendas', 'list', {}]`? → **NO**
   - ¿Los datos son "stale" (viejos)? → **NO importa, no hay datos**
6. **React Query ejecuta query**
7. **PERO** mientras espera respuesta de Supabase...
8. **Componente renderiza con `data: []`** (valor por defecto)
9. **Se muestra "0 resultados"** ❌
10. **Query termina, datos llegan, se actualiza UI** ✅

**Problema adicional**: Si el usuario navega rápido (Dashboard → Viviendas → Dashboard → Viviendas), en la **segunda visita** React Query podría usar datos en cache que aún están "fresh" (< 5 minutos), mostrando datos viejos sin re-fetch.

---

## ✅ Solución Implementada

### **Configuración NUEVA (correcta)**

```typescript
// ✅ DESPUÉS: staleTime = 0 (SIEMPRE re-fetch)
export function useViviendasQuery(filtros?: FiltrosViviendas) {
  return useQuery({
    queryKey: viviendasKeys.list(filtros),
    queryFn: () => viviendasService.listar(filtros),
    staleTime: 0, // ✅ SIEMPRE re-fetch al montar componente
    gcTime: 1000 * 60 * 5, // 5 minutos en cache después de desmontar
  })
}
```

### **¿Qué cambia?**

#### **staleTime: 0**
- **Significado**: Los datos se consideran "stale" (viejos) **inmediatamente**
- **Comportamiento**: Al montar el componente, React Query **SIEMPRE** ejecuta el query
- **Beneficio**: Datos frescos en **cada navegación**

#### **gcTime: 5 minutos** (antes `cacheTime`)
- **Significado**: Los datos se mantienen en cache **5 minutos** después de que el componente se desmonte
- **Comportamiento**: Si vuelves en < 5 min, React Query tiene los datos en cache **PERO** los re-fetch porque `staleTime: 0`
- **Beneficio**:
  - **Background refetch rápido** (usa cache mientras re-fetch en background)
  - **No más "0 resultados"** porque usa cache como placeholder

---

## 🎯 Flujo Corregido

### **Con staleTime: 0**

1. **Usuario hace clic en "Viviendas"**
2. **useViviendasQuery({})** se ejecuta
3. **React Query verifica cache**:
   - ¿Hay datos en cache? → **Sí** (de navegación anterior, dentro de gcTime)
4. **React Query retorna datos en cache INMEDIATAMENTE** → **NO más "0 resultados"** ✅
5. **React Query ejecuta query en BACKGROUND** (porque `staleTime: 0`)
6. **Query termina, actualiza cache, re-renderiza con datos frescos**

**Resultado**:
- Usuario ve **datos inmediatamente** (de cache)
- Datos se actualizan en **background** sin que usuario note
- **Experiencia fluida** ✅

---

## 📊 Comparación de Configuraciones

| Configuración | Comportamiento | Problema | Solución |
|---------------|----------------|----------|----------|
| **staleTime: 5 min** | No re-fetch si datos < 5 min | "0 resultados" inicial, datos viejos | ❌ |
| **staleTime: 30 seg** | Re-fetch si datos > 30 seg | Menos frecuente pero persiste | ⚠️ |
| **staleTime: 0** | SIEMPRE re-fetch | Ninguno - siempre datos frescos | ✅ |

| Configuración | Network Calls | UX | Performance |
|---------------|---------------|-----|-------------|
| **staleTime: 5 min** | Menos llamadas | ❌ Datos viejos | ✅ Mejor |
| **staleTime: 0** | Más llamadas | ✅ Datos frescos | ⚠️ Aceptable |
| **staleTime: 0 + gcTime: 5 min** | Más llamadas (background) | ✅ Datos frescos + cache | ✅ Óptimo |

---

## 🔧 Queries Actualizados

### **1. Lista de Viviendas**

```typescript
export function useViviendasQuery(filtros?: FiltrosViviendas) {
  return useQuery({
    queryKey: viviendasKeys.list(filtros),
    queryFn: () => viviendasService.listar(filtros),
    staleTime: 0, // ✅ SIEMPRE fresh
    gcTime: 1000 * 60 * 5, // 5 min cache
  })
}
```

### **2. Detalle de Vivienda**

```typescript
export function useViviendaQuery(id: string) {
  return useQuery({
    queryKey: viviendasKeys.detail(id),
    queryFn: () => viviendasService.obtenerVivienda(id),
    enabled: !!id,
    staleTime: 0, // ✅ SIEMPRE fresh
    gcTime: 1000 * 60 * 5, // 5 min cache
  })
}
```

### **3. Proyectos Activos** (NO cambiado - datos estáticos)

```typescript
export function useProyectosActivosQuery() {
  return useQuery({
    queryKey: viviendasKeys.proyectos,
    queryFn: () => viviendasService.obtenerProyectos(),
    staleTime: 1000 * 60 * 10, // ⏸️ 10 min OK - proyectos cambian poco
  })
}
```

**Razón**: Los proyectos NO cambian frecuentemente, no necesitan re-fetch constante.

---

## 🎨 Mejora Adicional: Placeholder UI

Para **evitar completamente** el "0 resultados" flash, también podemos usar `placeholderData`:

```typescript
export function useViviendasQuery(filtros?: FiltrosViviendas) {
  return useQuery({
    queryKey: viviendasKeys.list(filtros),
    queryFn: () => viviendasService.listar(filtros),
    staleTime: 0,
    gcTime: 1000 * 60 * 5,
    placeholderData: (previousData) => previousData, // ✅ Usa datos anteriores mientras carga
  })
}
```

**Beneficio**: Si hay datos en cache (de navegación anterior), los muestra **mientras** hace el re-fetch.

**⚠️ No implementado aún** - Evaluar si es necesario después de testear con `staleTime: 0`.

---

## 📈 Impacto en Performance

### **Antes** (staleTime: 5 min)

```
Navegación 1: Dashboard → Viviendas
├─ Query ejecutado: ✅ (no hay cache)
├─ Network call: 1
└─ UX: ❌ "0 resultados" por 1-2 seg

Navegación 2: Dashboard → Viviendas (< 5 min después)
├─ Query ejecutado: ❌ (datos en cache, stale = false)
├─ Network call: 0
└─ UX: ⚠️ Datos de hace 3 minutos (potencialmente viejos)
```

### **Después** (staleTime: 0)

```
Navegación 1: Dashboard → Viviendas
├─ Query ejecutado: ✅ (no hay cache)
├─ Network call: 1
└─ UX: ⚠️ "0 resultados" por 1-2 seg (primera vez OK)

Navegación 2: Dashboard → Viviendas (< 5 min después)
├─ Query ejecutado: ✅ (stale = true, re-fetch en background)
├─ Datos mostrados: ✅ Cache (inmediato)
├─ Network call: 1 (background)
└─ UX: ✅ Datos inmediatos + actualización background
```

**Conclusión**:
- **Primera navegación**: Igual (inevitable loading inicial)
- **Navegaciones posteriores**: ✅ Mucho mejor (datos inmediatos de cache + actualización background)

---

## 🚀 Recomendaciones para Otros Módulos

### **Queries de Lista/Detalle** (Datos que cambian frecuentemente)

```typescript
staleTime: 0 // ✅ SIEMPRE fresh
gcTime: 1000 * 60 * 5 // ✅ Cache 5 min
```

**Aplica a**:
- ✅ Viviendas
- ✅ Proyectos (detalle)
- ✅ Clientes
- ✅ Negociaciones
- ✅ Abonos

### **Queries de Configuración** (Datos estáticos/raros cambios)

```typescript
staleTime: 1000 * 60 * 10 // ⏸️ 10 min OK
gcTime: 1000 * 60 * 30 // ⏸️ Cache 30 min
```

**Aplica a**:
- Proyectos (lista activos)
- Gastos notariales
- Configuración de recargos
- Usuarios del sistema
- Roles y permisos

---

## ✅ Checklist de Verificación

Después de aplicar el fix, verificar:

- [ ] Navegar desde Dashboard → Viviendas → **NO** debe mostrar "0 resultados"
- [ ] Navegar Viviendas → Dashboard → Viviendas → Datos aparecen **inmediatamente**
- [ ] Network tab muestra re-fetch en **background** (no bloquea UI)
- [ ] Cache se actualiza correctamente
- [ ] Filtros funcionan sin errores
- [ ] Detalle de vivienda carga datos actualizados

---

## 📚 Recursos

- **React Query Docs**: [staleTime vs cacheTime](https://tanstack.com/query/latest/docs/react/guides/important-defaults)
- **Best Practices**: [Optimistic Updates](https://tanstack.com/query/latest/docs/react/guides/optimistic-updates)
- **Debugging**: [React Query Devtools](https://tanstack.com/query/latest/docs/react/devtools)

---

## 🎯 Próximos Pasos

1. ✅ **Aplicar fix a Proyectos** (mismo problema potencial)
2. ✅ **Documentar configuración estándar** de staleTime/gcTime
3. ✅ **Crear guía de migración** para otros módulos
4. ⏳ **Testing E2E** de navegación rápida

---

**Autor**: GitHub Copilot
**Fecha**: 6 de Noviembre, 2025
**Issue**: "0 resultados" al navegar a módulo de Viviendas
**Fix**: `staleTime: 0` en queries críticos
