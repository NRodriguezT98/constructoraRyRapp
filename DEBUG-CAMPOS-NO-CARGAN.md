# 🔧 Debug: Campos No Cargan en Modo Edición

## 🐛 Problema Reportado

**Síntomas específicos**:
- ✅ **Número de documento**: SÍ carga
- ❌ **Nombres**: NO carga
- ❌ **Apellidos**: NO carga
- ❌ **Fecha de nacimiento**: NO carga
- ❌ **Dirección**: NO carga
- ❌ **Ciudad**: NO carga
- ❌ **Departamento**: NO carga

## 🔍 Investigación

### Verificación de Flujo de Datos

1. **Hook `useFormularioCliente`** ✅
   - Retorna `handleChange` correctamente
   - El `useEffect` ahora usa `[clienteInicial?.id]` como dependencia

2. **Contenedor** ✅
   - Pasa `onChange={handleChange}` al formulario
   - Pasa `formData` con todos los datos

3. **Componente Formulario** ✅
   - Mapea correctamente `value={formData.nombres}`
   - Mapea correctamente `onChange={(e) => onChange('nombres', e.target.value)}`

### Patrón Observado

**Campos que SÍ cargan**:
- Número de documento (step 0)
- Tipo de documento (step 0, select)

**Campos que NO cargan**:
- Nombres, Apellidos (step 0, inputs de texto)
- Fecha nacimiento (step 0, input date)
- Dirección, Ciudad, Departamento (step 1)

## 💡 Hipótesis

El problema NO es el mapeo de datos (está correcto), sino posiblemente:

1. **Timing de renderizado**: Los datos llegan pero el componente ya renderizó
2. **Estado del formulario**: React no detecta el cambio en `formData` como prop
3. **Controlled vs Uncontrolled**: Los inputs podrían estar en estado mixto

## ✅ Soluciones Implementadas

### 1. Console Logs para Debug

```typescript
// En FormularioCliente
console.log('📋 FormularioCliente - formData recibido:', formData)
console.log('📋 FormularioCliente - esEdicion:', esEdicion)
```

**Verificar en consola**:
- Cuando abres el modal en modo edición
- Deberías ver el objeto completo con todos los datos del cliente

### 2. Reset del Step al Abrir Modal

```typescript
// Resetear step cuando se abre/cierra el modal
useEffect(() => {
  if (isOpen) {
    setCurrentStep(0)
  }
}, [isOpen])
```

**Razón**: Asegura que siempre empiece en el paso 0 cuando se abre

## 🧪 Pasos para Verificar

### 1. Verificar Console Logs

Abre la consola del navegador (F12) y:

```bash
# Al hacer clic en "Editar"
→ Deberías ver en consola:
   🔄 Precargando datos del cliente: {...}
   📋 FormularioCliente - formData recibido: {
     nombres: "Juan Carlos",
     apellidos: "Pérez García",
     numero_documento: "11075469512",
     ...
   }
   📋 FormularioCliente - esEdicion: true
```

### 2. Verificar Valores en DevTools

Con las DevTools abiertas:
1. Ve a la pestaña **Components**
2. Busca `FormularioCliente`
3. Verifica las props:
   - `formData.nombres` → ¿Tiene valor?
   - `formData.apellidos` → ¿Tiene valor?
   - `formData.numero_documento` → ¿Tiene valor?

### 3. Si los Datos Están en formData pero NO en los Inputs

Esto indicaría un problema de **React controlled components**. Posible causa:

```typescript
// ❌ PROBLEMA: Input no reconoce cambios en prop value
<input value={formData.nombres} onChange={...} />

// ✅ SOLUCIÓN: Forzar re-render con key
<input key={clienteId} value={formData.nombres} onChange={...} />
```

## 🔧 Solución Adicional (si persiste el problema)

Si después de verificar los console.logs ves que los datos SÍ llegan pero NO aparecen en los inputs, necesitamos forzar un re-render del formulario completo:

### Opción A: Agregar key al formulario

```typescript
// En formulario-cliente-modern.tsx
<form onSubmit={onSubmit} className='p-8' key={esEdicion ? 'edit' : 'create'}>
```

### Opción B: Usar defaultValue en vez de value (NO RECOMENDADO)

```typescript
// Cambiaría el componente a uncontrolled
<input defaultValue={formData.nombres} />
```

### Opción C: Forzar remount del componente completo

```typescript
// En formulario-cliente-container.tsx
return (
  <FormularioCliente
    key={clienteSeleccionado?.id || 'new'}  // ← Fuerza remount
    isOpen={modalFormularioAbierto}
    ...
  />
)
```

## 📊 Resultado Esperado

Después de implementar los console.logs, deberías ver en consola:

```
🔄 Precargando datos del cliente: {
  id: "123",
  nombres: "Juan Carlos",
  apellidos: "Pérez García",
  tipo_documento: "CC",
  numero_documento: "11075469512",
  fecha_nacimiento: "1990-01-15",
  telefono: "3001234567",
  direccion: "Calle 123",
  ciudad: "Cali",
  departamento: "Valle del Cauca",
  ...
}
📋 FormularioCliente - formData recibido: {
  nombres: "Juan Carlos",  ← Debe tener valor
  apellidos: "Pérez García",  ← Debe tener valor
  numero_documento: "11075469512",  ← Debe tener valor
  ...
}
📋 FormularioCliente - esEdicion: true
```

## 🎯 Acciones Inmediatas

1. **Recargar la página** en el navegador
2. **Abrir DevTools** (F12) → Console
3. **Hacer clic en "Editar"** en un cliente
4. **Capturar** los console.logs que aparecen
5. **Compartir** los logs para analizar qué datos llegan

---

## 📝 Checklist de Debug

- [ ] Console logs muestran `clienteInicial` con datos completos
- [ ] Console logs muestran `formData` con datos completos
- [ ] `esEdicion` es `true`
- [ ] Input de "Número de Documento" SÍ muestra el valor
- [ ] Input de "Nombres" NO muestra el valor (problema confirmado)
- [ ] React DevTools → FormularioCliente → props → formData.nombres tiene valor
- [ ] React DevTools → FormularioCliente → props → formData.numero_documento tiene valor

---

**Próximo paso**: Analizar los console.logs para determinar si es problema de datos o de rendering.
