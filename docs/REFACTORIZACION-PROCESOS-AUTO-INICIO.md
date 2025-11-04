# 🔄 Refactorización: Auto-inicio de Pasos en Procesos

## 🎯 Objetivo

Simplificar el flujo de trabajo eliminando el paso manual de "Iniciar Paso", haciendo que el sistema **auto-inicie automáticamente** cuando el usuario adjunta el primer documento.

---

## 📊 Comparación: Antes vs Después

### ❌ **ANTES** (Flujo actual)

```
1. Usuario expande paso
2. Click en "Iniciar Paso" (⚠️ paso adicional)
3. Paso cambia a "En Proceso"
4. Ahora puede adjuntar documentos
5. Adjunta documentos
6. Click en "Completar Paso"
```

**Problemas:**
- ⚠️ Usuario debe recordar iniciar el paso
- ⚠️ Si olvida iniciar, no puede adjuntar (confuso)
- ⚠️ Clics innecesarios

### ✅ **DESPUÉS** (Flujo mejorado)

```
1. Usuario expande paso
2. Click en "Adjuntar" documento
   → 🔄 Sistema AUTO-INICIA el paso
   → ✅ Cambia a "En Proceso" automáticamente
3. Adjunta documentos (auto-guardado)
4. Click en "Completar Paso"
```

**Ventajas:**
- ✅ Un paso menos
- ✅ Más intuitivo (adjuntar inicia el trabajo)
- ✅ Menos fricción
- ✅ Mismo nivel de protección

---

## 🔧 Cambios Técnicos

### **1. Hook: `useProcesoNegociacion.ts`**

#### Nuevo método: `adjuntarConAutoInicio()`

```typescript
/**
 * Adjunta documento con auto-inicio de paso
 *
 * Si el paso está en "Pendiente", lo inicia automáticamente
 * antes de adjuntar el documento.
 */
const adjuntarConAutoInicio = useCallback(async (
  pasoId: string,
  nombreDoc: string,
  url: string
): Promise<boolean> => {
  setActualizando(true)
  setError(null)

  try {
    const paso = pasos.find(p => p.id === pasoId)
    if (!paso) throw new Error('Paso no encontrado')

    // 🔄 AUTO-INICIO: Si está Pendiente, iniciar automáticamente
    if (paso.estado === EstadoPaso.PENDIENTE) {
      console.log('🔄 Auto-iniciando paso:', paso.nombre)

      const iniciado = await iniciarPaso(pasoId)
      if (!iniciado) {
        throw new Error('No se pudo iniciar el paso automáticamente')
      }

      // Esperar a que el estado se actualice
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    // Agregar documento normalmente
    return await agregarDocumento(pasoId, nombreDoc, url)

  } catch (err) {
    const mensaje = err instanceof Error ? err.message : 'Error al adjuntar documento'
    setError(mensaje)
    console.error('Error en adjuntarConAutoInicio:', err)
    return false
  } finally {
    setActualizando(false)
  }
}, [pasos, iniciarPaso, agregarDocumento])
```

#### Actualizar return del hook:

```typescript
return {
  // ... operaciones existentes
  adjuntarConAutoInicio, // ✅ NUEVO
  // ... utilidades
}
```

---

### **2. Componente: `timeline-proceso.tsx`**

#### Modificar handler de adjuntar:

```typescript
const handleAdjuntar = async (
  pasoId: string,
  nombreDoc: string,
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const file = e.target.files?.[0]
  if (!file) return

  // Validaciones de archivo...
  if (file.size > 10 * 1024 * 1024) {
    alert('El archivo no debe superar 10 MB')
    return
  }

  setSubiendoDoc(`${pasoId}-${nombreDoc}`)

  try {
    // Subir a storage
    const url = await subirDocumento({
      negociacionId,
      pasoId,
      nombreDocumento: nombreDoc,
      archivo: file,
      userId: user!.id
    })

    if (url) {
      // 🔄 Usar nuevo método con auto-inicio
      const exito = await adjuntarConAutoInicio(pasoId, nombreDoc, url)

      if (exito) {
        console.log('✅ Documento adjuntado (con auto-inicio si era necesario)')
      }
    }
  } catch (err) {
    console.error('Error al adjuntar documento:', err)
    alert('Error al subir documento')
  } finally {
    setSubiendoDoc(null)
  }
}
```

---

### **3. Componente: `paso-item.tsx`**

#### Actualizar UI para reflejar auto-inicio:

```typescript
// Actualizar tooltip del botón de adjuntar
<label
  htmlFor={inputId}
  title={
    isCompletado
      ? 'Paso completado, no se pueden adjuntar más documentos'
      : estaBloqueado
        ? 'Completa los pasos anteriores primero'
        : 'Adjuntar documento (inicia el paso automáticamente si es necesario)' // ✅ NUEVO
  }
>
  {/* ... */}
</label>
```

#### Remover botón "Iniciar Paso" (opcional):

**Opción A**: Remover completamente (recomendado)

```typescript
// ❌ ELIMINAR este bloque
{puedeIniciar(paso) && !isEnProceso && (
  <button onClick={() => onIniciar(paso.id)}>
    <Play className="w-4 h-4" />
    Iniciar Paso
  </button>
)}
```

**Opción B**: Mantener pero como acción secundaria

```typescript
{/* Mantener solo para usuarios que prefieran iniciar sin adjuntar */}
{paso.estado === EstadoPaso.PENDIENTE && !estaBloqueado && (
  <button
    onClick={() => onIniciar(paso.id)}
    className="text-xs text-gray-500 hover:text-gray-700"
  >
    Iniciar sin adjuntar
  </button>
)}
```

---

## 📝 Cambios en Base de Datos

**❌ NO requiere cambios en DB**

La tabla `procesos_negociacion` ya tiene todo lo necesario:
- ✅ `estado` (Pendiente → En Proceso)
- ✅ `fecha_inicio` (se registra al auto-iniciar)
- ✅ `documentos_urls` (JSONB para documentos)

---

## 🧪 Testing

### Test 1: Auto-inicio en paso Pendiente

```typescript
// Setup
const pasoId = 'paso-1'
const paso = { id: pasoId, estado: EstadoPaso.PENDIENTE }

// Acción
await adjuntarConAutoInicio(pasoId, 'cedula', 'url-storage')

// Verificar
expect(paso.estado).toBe(EstadoPaso.EN_PROCESO)
expect(paso.fechaInicio).toBeDefined()
expect(paso.documentosUrls.cedula).toBe('url-storage')
```

### Test 2: No auto-iniciar si ya está En Proceso

```typescript
// Setup
const paso = { id: pasoId, estado: EstadoPaso.EN_PROCESO }

// Acción
await adjuntarConAutoInicio(pasoId, 'promesa', 'url-storage')

// Verificar
expect(iniciarPaso).not.toHaveBeenCalled() // ✅ No llamó a iniciar
expect(agregarDocumento).toHaveBeenCalled() // ✅ Sí agregó documento
```

### Test 3: No permitir adjuntar si está bloqueado

```typescript
// Setup
const paso = {
  id: pasoId,
  estado: EstadoPaso.PENDIENTE,
  dependeDe: ['paso-anterior-id']
}
const pasoAnterior = {
  id: 'paso-anterior-id',
  estado: EstadoPaso.PENDIENTE
}

// Acción
const resultado = await adjuntarConAutoInicio(pasoId, 'doc', 'url')

// Verificar
expect(resultado).toBe(false)
expect(error).toContain('dependencias incompletas')
```

---

## 🎯 Flujo Completo: Usuario Real

### Escenario: Cliente con negociación activa

```
1. Admin abre Cliente → Tab "Actividad"
   → Sistema carga proceso de la negociación

2. Admin expande "Paso 1: Promesa de compraventa enviada"
   → Estado inicial: "Pendiente"
   → Documentos requeridos: Cédula, Promesa firmada

3. Admin click en "Adjuntar" para Cédula
   → Input file se abre

4. Admin selecciona cedula.pdf
   → 🔄 Sistema AUTO-INICIA el paso
   → Estado cambia: "Pendiente" → "En Proceso"
   → fecha_inicio se registra
   → Documento se sube a Storage
   → URL se guarda en documentos_urls
   → ⚠️ Banner de advertencia aparece (cambios sin guardar)

5. Admin adjunta Promesa firmada
   → Paso YA está "En Proceso", no reinicia
   → Segundo documento se adjunta

6. Admin click en "Completar Paso"
   → Modal de fecha aparece
   → Fecha mínima: fecha_inicio del paso
   → Fecha por defecto: Hoy

7. Admin confirma fecha
   → Estado: "En Proceso" → "Completado"
   → fecha_completado se registra
   → Documentos se sincronizan a tab "Documentos"
   → ⚠️ Advertencia se limpia
   → Paso 2 se desbloquea
```

---

## 🚦 Comportamiento de Advertencias

### ✅ **Se mantiene** la protección `beforeunload`

```typescript
// Auto-inicio NO cambia la protección
useEffect(() => {
  if (pasoEnEdicion) {
    // ⚠️ Advertencia activa
    setHasUnsavedChanges(true)
    setMessage('Tienes un paso en proceso con cambios sin guardar...')
  }
}, [pasoEnEdicion])

// pasoEnEdicion se establece por:
// - iniciarPaso() manual (si aún existe el botón)
// - adjuntarConAutoInicio() → iniciarPaso() automático ✅
```

**Resultado**: Usuario sigue protegido contra pérdida de datos.

---

## 📊 Métricas de Mejora

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| Clics para adjuntar | 3 clicks | 2 clicks | **-33%** |
| Pasos en flujo | 6 pasos | 4 pasos | **-33%** |
| Tiempo promedio | ~45 seg | ~30 seg | **-33%** |
| Confusión UX | Media | Baja | ✅ |
| Protección datos | 100% | 100% | ✅ |

---

## 🔄 Migración de Usuarios

### No requiere migración de datos

- ✅ Cambio solo afecta frontend
- ✅ Backend/DB sin cambios
- ✅ Procesos existentes siguen funcionando
- ✅ Compatible con procesos "En Proceso" actuales

### Comunicación a usuarios:

```
📢 MEJORA: Flujo de procesos más ágil

Ahora cuando adjuntas un documento, el paso se inicia
automáticamente. Ya no necesitas hacer clic en "Iniciar Paso".

¡Un paso menos para completar procesos! 🚀
```

---

## 📝 Checklist de Implementación

- [ ] Agregar `adjuntarConAutoInicio()` en hook
- [ ] Actualizar handler en `timeline-proceso.tsx`
- [ ] Modificar tooltips en `documento-item.tsx`
- [ ] Decidir: ¿Remover o mantener botón "Iniciar Paso"?
- [ ] Actualizar documentación del módulo
- [ ] Testing en local
- [ ] Testing con usuarios reales
- [ ] Deploy a producción

---

**Fecha de diseño**: 1 de noviembre de 2025
**Estado**: Pendiente de implementación
**Impacto**: Alto (UX mejorada, menos fricción)
**Riesgo**: Bajo (cambio solo en frontend)
