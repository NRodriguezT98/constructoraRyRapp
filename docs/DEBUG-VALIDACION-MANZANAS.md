# 🐛 DEBUG: Validación de Manzanas No Funciona

> **Problema reportado:** Al editar proyecto "Las Américas 2", la Manzana A (con 3 viviendas) aparece como editable cuando debería estar bloqueada.

---

## 🔍 PASOS PARA DEBUGGING

### **1. Verificar logs en consola del navegador**

Al abrir el modal de "Editar Proyecto", deberías ver estos logs:

```
🔍 Validando manzanas con IDs: ['manzana-a-id', 'manzana-b-id']
🔍 [useManzanasEditables] Iniciando validación de manzanas: ['manzana-a-id', 'manzana-b-id']
✅ Manzana encontrada: A (ID: manzana-a-id)
📊 Manzana "A": 3 viviendas → 🔒 BLOQUEADA
✅ Manzana encontrada: B (ID: manzana-b-id)
📊 Manzana "B": 0 viviendas → 🔓 EDITABLE
✅ [useManzanasEditables] Validación completada. Estado final: Map(2) {...}
🎨 [ProyectosForm] Renderizando manzana: {
  index: 0,
  manzanaId: 'manzana-a-id',
  nombre: 'A',
  esEditable: false,  ← DEBE SER FALSE
  esEliminable: false,
  estadoManzana: { esEditable: false, cantidadViviendas: 3 },
  totalManzanasEnState: 2
}
```

---

### **2. Si NO ves los logs**

**Problema:** El `useEffect` no se está ejecutando.

**Verificar:**
```typescript
// En useProyectosForm.ts línea ~92
useEffect(() => {
  if (isEditing && fields.length > 0) {
    console.log('✅ useEffect ejecutado')
    console.log('   - isEditing:', isEditing)
    console.log('   - fields:', fields)
    // ...
  }
}, [isEditing, fields.length])
```

**Posibles causas:**
- ❌ `isEditing` es `false` (no se está pasando correctamente)
- ❌ `fields.length` es 0 (manzanas no se cargaron en React Hook Form)

---

### **3. Si ves los logs pero `manzanaId` es `undefined`**

**Problema:** Las manzanas no tienen el campo `id` en `initialData`.

**Verificar en console:**
```javascript
// En el modal de edición, ejecuta:
console.log('initialData:', initialData)
console.log('Manzanas:', initialData?.manzanas)

// Deberías ver algo como:
{
  nombre: "Las Américas 2",
  manzanas: [
    { id: 'uuid-1', nombre: 'A', totalViviendas: 10 },
    { id: 'uuid-2', nombre: 'B', totalViviendas: 8 }
  ]
}
```

**Si NO tienen `id`:**
- Verificar `proyectos.service.ts` línea 283 (transformarProyectoDeDB)
- Asegurar que la query SELECT incluye `manzanas.id`

---

### **4. Si los IDs existen pero validación no funciona**

**Ejecutar script de prueba:**

1. Abre la consola del navegador
2. Copia y pega el contenido de `debug-manzanas-validacion.js`
3. Ejecuta y verifica la salida

**Salida esperada:**
```
🧪 Iniciando prueba de consulta de manzanas...
✅ Proyecto encontrado: Las Américas 2
📋 Manzanas: [{ id: 'uuid-1', nombre: 'A' }, { id: 'uuid-2', nombre: 'B' }]
📊 Manzana "A" (ID: uuid-1):
   - Viviendas en DB: 3
   - Estado: 🔒 BLOQUEADA
📊 Manzana "B" (ID: uuid-2):
   - Viviendas en DB: 0
   - Estado: 🔓 EDITABLE
```

**Si la consulta falla:**
- Verificar que tabla `viviendas` tiene columna `manzana_id`
- Verificar permisos RLS en Supabase

---

### **5. Si todo lo anterior funciona pero UI no actualiza**

**Problema:** El `manzanasState` no se está propagando correctamente.

**Verificar:**
```typescript
// En ProyectosForm.tsx, dentro del map:
console.log('manzanasState completo:', manzanasState)
console.log('Estado de manzana actual:', manzanasState.get(manzana.id))
```

**Posibles causas:**
- ❌ El Map no se está actualizando (verificar `setManzanasState`)
- ❌ El ID de la manzana no coincide (verificar exactitud de UUIDs)

---

### **6. Verificar que el componente recibe las props correctas**

**En `proyectos-page-main.tsx`:**
```typescript
<ProyectosForm
  onSubmit={handleActualizarProyecto}
  onCancel={handleCerrarModal}
  isLoading={cargando}
  initialData={proyectoEditar}  // ← Debe tener manzanas con IDs
  isEditing={true}               // ← CRÍTICO: Debe ser true
/>
```

---

## 🛠️ FIXES COMUNES

### **Fix 1: Manzanas sin ID**

**Causa:** La query SELECT no incluye `manzanas.id`

**Solución:**
```typescript
// proyectos.service.ts
.select(`
  *,
  manzanas (
    id,          // ← ASEGURAR QUE EXISTE
    nombre,
    numero_viviendas
  )
`)
```

---

### **Fix 2: useEffect no se ejecuta**

**Causa:** Dependencias incorrectas o isEditing es false

**Solución:**
```typescript
useEffect(() => {
  console.log('🔍 useEffect manzanas', { isEditing, fieldsLength: fields.length })

  if (isEditing && fields.length > 0) {
    const manzanasIds = fields.map(m => (m as any).id).filter(Boolean)
    console.log('IDs extraídos:', manzanasIds)

    if (manzanasIds.length > 0) {
      validarManzanas(manzanasIds)
    }
  }
}, [isEditing, fields.length])
```

---

### **Fix 3: validarManzanas se ejecuta pero state no actualiza**

**Causa:** Posible problema con Map en React state

**Solución temporal (forzar re-render):**
```typescript
// En useManzanasEditables.ts
setManzanasState(new Map(newState)) // ← Crear nuevo Map para forzar update
```

---

### **Fix 4: Inputs siguen habilitados**

**Causa:** La lógica `disabled={!esEditable}` no se evalúa correctamente

**Verificar:**
```typescript
// En proyectos-form.tsx, dentro del map:
const esEditable = esManzanaEditable(index)
console.log(`Manzana ${index}: esEditable =`, esEditable)

<input
  disabled={!esEditable}
  // ...
/>
```

---

## ✅ CHECKLIST DE VALIDACIÓN

Antes de reportar que no funciona, verificar:

- [ ] ✅ Console muestra logs de `useManzanasEditables`
- [ ] ✅ Console muestra logs de `useProyectosForm`
- [ ] ✅ Console muestra logs de `ProyectosForm` (render)
- [ ] ✅ Los IDs de manzanas están presentes en `fields`
- [ ] ✅ La consulta a `viviendas` retorna el count correcto
- [ ] ✅ El `manzanasState` Map se actualiza correctamente
- [ ] ✅ `esEditable` es `false` para manzanas con viviendas
- [ ] ✅ Los inputs tienen `disabled={!esEditable}`
- [ ] ✅ El badge muestra el estado correcto
- [ ] ✅ `isEditing={true}` se pasa correctamente

---

## 🧪 PRUEBA MANUAL PASO A PASO

1. **Limpiar cache del navegador** (Ctrl + Shift + R)
2. **Abrir DevTools** (F12) → Pestaña Console
3. **Ir a módulo Proyectos**
4. **Hacer clic en "Editar" del proyecto "Las Américas 2"**
5. **Observar logs en consola**
6. **Verificar que:**
   - Manzana A tiene badge "🔒 3 viviendas"
   - Manzana A inputs deshabilitados (grisados)
   - Manzana A NO tiene botón eliminar
   - Manzana B tiene badge "🔓 Editable"
   - Manzana B inputs habilitados
   - Manzana B tiene botón eliminar

---

## 📋 INFORMACIÓN A REPORTAR SI SIGUE FALLANDO

Si después de seguir todos los pasos anteriores el problema persiste, reportar:

1. **Screenshot de consola** con todos los logs
2. **Screenshot del modal** mostrando las manzanas
3. **Resultado del script de debug** (`debug-manzanas-validacion.js`)
4. **Valor de `initialData`** (copiar objeto completo)
5. **Versión de React** y **navegador usado**

---

**Última actualización:** 5 de Noviembre de 2025
**Estado:** En debugging activo
