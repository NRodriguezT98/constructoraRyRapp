# ✅ Validación Rápida de Estados - Guía de Consulta Ultra Rápida

> **🎯 Consulta este documento cuando necesites validar estados rápidamente**
>
> Para información completa, consultar: `docs/DATABASE-SCHEMA-REFERENCE-ACTUALIZADO.md`

---

## 🚨 Estados Actuales (POST-MIGRACIÓN)

### Clientes (5 estados)
```typescript
'Interesado'              // ⭐ DEFAULT - Cliente recién registrado
'Activo'                  // Con negociación activa
'En Proceso de Renuncia'  // Tramitando renuncia
'Inactivo'                // Sin actividad
'Propietario'             // Vivienda entregada
```

### Negociaciones (4 estados)
```typescript
'Activa'                  // ⭐ DEFAULT - En proceso de pago
'Suspendida'              // Pausada temporalmente
'Cerrada por Renuncia'    // Cliente renunció (requiere fecha_renuncia_efectiva)
'Completada'              // Pago completo (requiere fecha_completada)
```

### Viviendas (3 estados)
```typescript
'Disponible'              // ⭐ DEFAULT - Sin asignar
'Asignada'                // En negociación (requiere negociacion_id + cliente_id)
'Entregada'               // Entregada al propietario (requiere fecha_entrega)
```

### Renuncias (3 estados)
```typescript
'Pendiente Devolución'    // ⭐ DEFAULT - Esperando devolución
'Cerrada'                 // Devolución completada
'Cancelada'               // Cliente continuó con negociación
```

### Fuentes de Pago (3 estados)
```typescript
'Pendiente'               // ⭐ DEFAULT - Aprobación pendiente
'En Proceso'              // Recibiendo abonos
'Completada'              // Monto completo recibido (requiere fecha_completado)
```

---

## ⚠️ Constraints que DEBES conocer

### Negociaciones
- ✅ Si `estado = 'Completada'` → `fecha_completada` es **OBLIGATORIO**
- ✅ Si `estado = 'Cerrada por Renuncia'` → `fecha_renuncia_efectiva` es **OBLIGATORIO**

### Viviendas
- ✅ Si `estado = 'Asignada'` → `negociacion_id` es **OBLIGATORIO**
- ✅ Si `estado = 'Asignada'` → `cliente_id` debe tener valor

### Fuentes de Pago
- ✅ Si `estado = 'Completada'` → `fecha_completado` es **OBLIGATORIO**

---

## 🚫 ESTADOS OBSOLETOS (NO USAR)

### ❌ Eliminados en Negociaciones:
- `'En Proceso'` → Usar `'Activa'`
- `'Cierre Financiero'` → Usar `'Activa'`
- `'Cancelada'` → Usar `'Cerrada por Renuncia'`
- `'Renuncia'` → Usar `'Cerrada por Renuncia'`

### ❌ Eliminados en Viviendas:
- `'reservada'` → Usar `'Asignada'`
- `'vendida'` → Usar `'Entregada'`

---

## 📋 Nombres de Campos Críticos

### Clientes
```typescript
cliente.nombres           // ✅ Plural
cliente.apellidos         // ✅ Plural
cliente.nombre_completo   // ✅ Snake case
cliente.numero_documento  // ✅ No "cedula"
```

### Negociaciones
```typescript
negociacion.estado                    // ✅ Ver estados arriba
negociacion.valor_negociado          // ✅ No "precio"
negociacion.fecha_renuncia_efectiva  // ✅ Nuevo campo
negociacion.fecha_completada         // ✅ No "fecha_completado"
```

### Viviendas
```typescript
vivienda.estado           // ✅ Ver estados arriba
vivienda.valor_base       // ✅ Usar este, no "precio"
vivienda.negociacion_id   // ✅ Nuevo FK (required si Asignada)
vivienda.fecha_entrega    // ✅ Nuevo campo
```

### Renuncias
```typescript
renuncia.estado                    // ✅ Ver estados arriba
renuncia.monto_a_devolver         // ✅ No "monto_devolver"
renuncia.fecha_renuncia           // ✅ Fecha de registro
renuncia.comprobante_devolucion_url  // ✅ Comprobante del pago
```

---

## 🔄 Flujo Rápido: Crear Negociación

```typescript
// 1. Crear negociación
await supabase.from('negociaciones').insert({
  cliente_id: clienteId,
  vivienda_id: viviendaId,
  estado: 'Activa',  // ⚠️ Siempre 'Activa', no 'En Proceso'
  valor_negociado: valor,
  // ... otros campos
})

// 2. Actualizar vivienda
await supabase.from('viviendas').update({
  estado: 'Asignada',  // ⚠️ No 'reservada'
  cliente_id: clienteId,
  negociacion_id: negociacionId,  // ⚠️ OBLIGATORIO
  fecha_asignacion: new Date().toISOString()
}).eq('id', viviendaId)

// 3. Actualizar cliente
await supabase.from('clientes').update({
  estado: 'Activo'
}).eq('id', clienteId)
```

---

## 🔄 Flujo Rápido: Cerrar por Renuncia

```typescript
// 1. Actualizar negociación
await supabase.from('negociaciones').update({
  estado: 'Cerrada por Renuncia',
  fecha_renuncia_efectiva: new Date().toISOString()  // ⚠️ OBLIGATORIO
}).eq('id', negociacionId)

// 2. Liberar vivienda
await supabase.from('viviendas').update({
  estado: 'Disponible',
  cliente_id: null,
  negociacion_id: null
}).eq('id', viviendaId)

// 3. Actualizar cliente
await supabase.from('clientes').update({
  estado: 'Inactivo'
}).eq('id', clienteId)
```

---

## 🎯 Checklist Antes de Codificar

- [ ] ¿Consulté los estados permitidos en este documento?
- [ ] ¿Verifiqué los nombres EXACTOS de los campos?
- [ ] ¿Revisé los constraints obligatorios?
- [ ] ¿Validé que no estoy usando estados obsoletos?
- [ ] ¿Consulté la documentación completa si tengo dudas?

---

**📖 Documentación Completa**: `docs/DATABASE-SCHEMA-REFERENCE-ACTUALIZADO.md`
**🔍 Última Actualización**: 2025-10-22
