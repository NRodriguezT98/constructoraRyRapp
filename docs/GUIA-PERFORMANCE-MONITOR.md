# 📊 Guía del Monitor de Rendimiento

## 🎯 Objetivo

Herramienta integrada para medir y diagnosticar el rendimiento de la navegación entre módulos en RyR Constructora App.

---

## ⚡ Activación Rápida

### 1️⃣ Abrir el Panel de Debug

Presiona: **`Ctrl + Shift + P`**

Se abrirá un panel flotante morado/rosa en la esquina superior derecha.

### 2️⃣ Ver Métricas en Tiempo Real

El panel muestra:
- **Ruta actual**: Qué página estás viendo
- **Total navegaciones**: Cuántas veces has cambiado de módulo
- **Tiempo promedio**: Promedio de carga de todos los módulos
- **Última carga**:
  - ⏱️ **Primer Render**: Tiempo hasta que el componente se monta
  - 📦 **Datos Cargados**: Tiempo hasta que los datos de la DB llegan
  - 🎯 **Tiempo Total**: Tiempo completo de navegación
- **Ruta más lenta**: Qué módulo tarda más en cargar

### 3️⃣ Colores de Rendimiento

- 🟢 **Verde** (< 500ms): Excelente
- 🟡 **Amarillo** (< 1000ms): Aceptable
- 🔴 **Rojo** (> 1000ms): Lento, necesita optimización

---

## 🔍 Cómo Usarlo

### **Prueba de Navegación**

1. Refresca el navegador (F5)
2. Presiona `Ctrl + Shift + P` para abrir el panel
3. Navega entre módulos:
   - Clientes → Proyectos → Abonos → Viviendas
4. Observa los tiempos en el panel
5. Identifica el módulo más lento

### **Consola del Navegador**

Abre DevTools (F12) → Pestaña **Console**

Verás logs con colores:
```
🚀 NAVEGACIÓN → /clientes (ClientesPageMain)
🔖 Datos cargados (124 clientes) +245.67ms
📊 MÉTRICAS - /clientes
  ⏱️  Primer Render: 3.45ms
  📦 Datos Cargados: 245.67ms
  🎯 Tiempo Total: 245.67ms
  🔄 Re-renders: 2
```

**⚠️ Advertencias Automáticas:**
- Si un módulo tarda **> 1 segundo** → Warning en consola
- Si un componente hace **> 5 re-renders** → Warning en consola

---

## 📤 Exportar Reporte

### Desde el Panel

1. Click en botón **"Exportar Reporte"**
2. Se copia un JSON completo al portapapeles
3. Pégalo en un archivo `.json` o compártelo

### Desde el Código

```typescript
import { exportMetricsReport } from '@/hooks/usePerformanceMonitor'

const reporte = exportMetricsReport()
console.log(reporte)
```

**Ejemplo de Reporte:**
```json
{
  "generatedAt": "2025-01-22T10:30:45.123Z",
  "totalNavigations": 8,
  "averageLoadTime": 342.56,
  "slowestRoute": {
    "route": "/abonos",
    "time": 1234.56
  },
  "routeMetrics": {
    "/clientes": {
      "navigationStart": 1234567890,
      "firstRender": 3.45,
      "dataLoaded": 245.67,
      "totalTime": 245.67,
      "renderCount": 2,
      "customMarks": [
        { "name": "Datos cargados (124 clientes)", "timestamp": 1234568135 }
      ]
    }
  }
}
```

---

## 🧪 Qué Medir

### **Tiempos Esperados**

| Métrica | Excelente | Aceptable | Lento |
|---------|-----------|-----------|-------|
| **Primer Render** | < 50ms | < 100ms | > 100ms |
| **Datos Cargados** | < 300ms | < 800ms | > 1000ms |
| **Tiempo Total** | < 500ms | < 1000ms | > 1500ms |

### **Re-renders**

- **Ideal**: 1-2 renders
- **Aceptable**: 3-4 renders
- **Problema**: > 5 renders → Revisar dependencias de `useEffect`

---

## 🛠️ Integración en Nuevos Módulos

### **Paso 1**: Importar el Hook

```tsx
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor'
```

### **Paso 2**: Usar en el Componente

```tsx
export function MiModuloPage() {
  const { markDataLoaded, mark } = usePerformanceMonitor('MiModuloPage')
  const { datos, isLoading } = useMiModulo()

  // Marcar cuando los datos se carguen
  useEffect(() => {
    if (!isLoading && datos.length >= 0) {
      mark(`Datos cargados (${datos.length} items)`)
      markDataLoaded()
    }
  }, [isLoading, datos.length, markDataLoaded, mark])

  return <div>...</div>
}
```

### **Paso 3**: Marcas Personalizadas (Opcional)

```tsx
const handleBuscar = async (query: string) => {
  mark('Inicio búsqueda')

  const resultados = await buscarEnDB(query)
  mark('Búsqueda completada')

  setResultados(resultados)
  mark('UI actualizada')
}
```

---

## 📋 Módulos Instrumentados

### ✅ **Integrados**
- **Clientes** (`ClientesPageMain`)
- **Proyectos** (`ProyectosPage`)

### ⏳ **Pendientes**
- Abonos
- Viviendas
- Renuncias
- Detalle de Cliente
- Detalle de Proyecto

---

## 🐛 Diagnóstico de Problemas Comunes

### **Problema: Navegación lenta (> 1s)**

**Posibles causas:**
1. ❌ Consulta DB pesada sin índices
2. ❌ Componente cargando muchos datos de golpe
3. ❌ Animaciones de Framer Motion bloqueando render
4. ❌ Server Component bloqueando Client Component

**Solución:**
```typescript
// Ver en consola qué marca tarda más
🔖 Inicio carga → 5ms
🔖 Consulta DB → 850ms ← AQUÍ ESTÁ EL PROBLEMA
🔖 Render lista → 12ms
```

### **Problema: Muchos Re-renders (> 5)**

**Posibles causas:**
1. ❌ Dependencias mal configuradas en `useEffect`
2. ❌ Estado cambiando en cada render
3. ❌ Callbacks sin `useCallback`

**Solución:**
```typescript
// Revisar warns en consola
⚠️ Re-renders excesivos en /clientes: 8 renders
```

### **Problema: Panel no aparece**

1. Verifica que estés en **modo desarrollo** (`NODE_ENV=development`)
2. Presiona `Ctrl + Shift + P` de nuevo
3. Revisa la consola por errores

---

## 🎯 Interpretación de Resultados

### **Ejemplo: Módulo Rápido**

```
📊 MÉTRICAS - /proyectos
  ⏱️  Primer Render: 2.34ms       ✅ Excelente
  📦 Datos Cargados: 234.56ms    ✅ Excelente
  🎯 Tiempo Total: 234.56ms      ✅ Excelente
  🔄 Re-renders: 2                ✅ Ideal
```
**Conclusión**: No necesita optimización

### **Ejemplo: Módulo Lento**

```
📊 MÉTRICAS - /abonos
  ⏱️  Primer Render: 156.78ms     ⚠️ Lento
  📦 Datos Cargados: 2345.67ms   ❌ MUY LENTO
  🎯 Tiempo Total: 2502.45ms     ❌ MUY LENTO
  🔄 Re-renders: 7                ⚠️ Excesivo

⚠️ WARNING: Carga lenta en /abonos (2502.45ms)
⚠️ WARNING: Re-renders excesivos en /abonos: 7
```
**Conclusión**:
1. La consulta de datos tarda **2.3 segundos** → Optimizar query
2. Hay **7 re-renders** → Revisar `useEffect` dependencies
3. El primer render tarda **156ms** → Posible componente pesado

---

## 🔄 Limpieza de Métricas

### **Desde el Panel**
Click en **"Limpiar Métricas"**

### **Desde el Código**
```typescript
import { clearMetrics } from '@/hooks/usePerformanceMonitor'

clearMetrics()
```

---

## 🚀 Próximos Pasos

1. **Instrumentar módulos faltantes** (Abonos, Viviendas, etc.)
2. **Medir en producción** con Vercel Analytics
3. **Establecer umbrales** de rendimiento automáticos
4. **Crear tests E2E** que validen tiempos < 1s

---

## 📚 Referencias

- **Archivo principal**: `src/hooks/usePerformanceMonitor.ts`
- **Panel UI**: `src/hooks/PerformanceDebugPanel.tsx`
- **Ejemplo de uso**: `src/hooks/EJEMPLO-USO-PERFORMANCE.tsx`
- **Integración**: `src/app/layout.tsx`
- **Módulos instrumentados**:
  - `src/modules/clientes/components/clientes-page-main.tsx`
  - `src/modules/proyectos/components/proyectos-page-main.tsx`

---

**✅ Sistema listo para usar** - Presiona `Ctrl + Shift + P` y empieza a medir! 🎉
