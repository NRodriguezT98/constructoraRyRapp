# 📝 Ejemplo de Implementación: Auditoría en Módulo de Viviendas

**Fecha**: 4 de noviembre de 2025
**Módulo**: Viviendas
**Objetivo**: Mostrar cómo implementar auditoría completa en un módulo

---

## 🎯 Objetivo

Auditar TODAS las operaciones CRUD en el módulo de viviendas:
- ✅ Crear vivienda
- ✅ Actualizar vivienda (datos generales)
- ✅ Actualizar linderos
- ✅ Cambiar estado
- ✅ Eliminar vivienda

---

## 📁 Archivo: `src/modules/viviendas/services/viviendas.service.ts`

```typescript
import { supabase } from '@/lib/supabase/client'
import { auditService } from '@/services/audit.service'

/**
 * ✅ CREAR VIVIENDA
 */
export async function crearVivienda(datos: ViviendaInput) {
  try {
    // 1. Crear vivienda en BD
    const { data: nuevaVivienda, error } = await supabase
      .from('viviendas')
      .insert({
        manzana_id: datos.manzana_id,
        numero: datos.numero,
        area: datos.area,
        valor_base: datos.valor_base,
        es_esquinera: datos.es_esquinera || false,
        recargo_esquinera: datos.recargo_esquinera || 0,
        gastos_notariales: datos.gastos_notariales || 5000000,
        estado: 'disponible'
      })
      .select('*, manzanas(nombre, proyecto:proyectos(nombre))')
      .single()

    if (error) throw error

    // 2. AUDITAR creación
    await auditService.auditarCreacion(
      'viviendas',
      nuevaVivienda.id,
      {
        numero: nuevaVivienda.numero,
        manzana_id: nuevaVivienda.manzana_id,
        area: nuevaVivienda.area,
        valor_base: nuevaVivienda.valor_base,
        es_esquinera: nuevaVivienda.es_esquinera,
        estado: nuevaVivienda.estado
      },
      {
        // Metadata con contexto adicional
        manzana_nombre: nuevaVivienda.manzanas?.nombre,
        proyecto_nombre: nuevaVivienda.manzanas?.proyecto?.nombre,
        valor_total: nuevaVivienda.valor_total,
        accion_descripcion: 'Vivienda creada en el sistema'
      },
      'viviendas'
    )

    console.log('✅ Vivienda creada y auditada:', nuevaVivienda.id)
    return nuevaVivienda
  } catch (error) {
    console.error('❌ Error creando vivienda:', error)
    throw error
  }
}

/**
 * ✅ ACTUALIZAR VIVIENDA (Datos generales)
 */
export async function actualizarVivienda(
  id: string,
  cambios: Partial<Vivienda>
) {
  try {
    // 1. Obtener datos ANTES del cambio
    const { data: viviendaAnterior, error: errorAnterior } = await supabase
      .from('viviendas')
      .select('*, manzanas(nombre, proyecto:proyectos(nombre))')
      .eq('id', id)
      .single()

    if (errorAnterior) throw errorAnterior

    // 2. Actualizar vivienda
    const { data: viviendaActualizada, error } = await supabase
      .from('viviendas')
      .update(cambios)
      .eq('id', id)
      .select('*, manzanas(nombre, proyecto:proyectos(nombre))')
      .single()

    if (error) throw error

    // 3. AUDITAR actualización
    await auditService.auditarActualizacion(
      'viviendas',
      id,
      {
        // Solo incluir campos relevantes para auditoría
        numero: viviendaAnterior.numero,
        area: viviendaAnterior.area,
        valor_base: viviendaAnterior.valor_base,
        es_esquinera: viviendaAnterior.es_esquinera,
        recargo_esquinera: viviendaAnterior.recargo_esquinera,
        gastos_notariales: viviendaAnterior.gastos_notariales,
        estado: viviendaAnterior.estado
      },
      {
        numero: viviendaActualizada.numero,
        area: viviendaActualizada.area,
        valor_base: viviendaActualizada.valor_base,
        es_esquinera: viviendaActualizada.es_esquinera,
        recargo_esquinera: viviendaActualizada.recargo_esquinera,
        gastos_notariales: viviendaActualizada.gastos_notariales,
        estado: viviendaActualizada.estado
      },
      {
        // Metadata
        campos_modificados: Object.keys(cambios),
        manzana_nombre: viviendaActualizada.manzanas?.nombre,
        proyecto_nombre: viviendaActualizada.manzanas?.proyecto?.nombre,
        cambio_precio: cambios.valor_base ? true : false,
        accion_descripcion: 'Datos generales de vivienda actualizados'
      },
      'viviendas'
    )

    console.log('✅ Vivienda actualizada y auditada:', id)
    return viviendaActualizada
  } catch (error) {
    console.error('❌ Error actualizando vivienda:', error)
    throw error
  }
}

/**
 * ✅ ACTUALIZAR LINDEROS (Caso específico)
 */
export async function actualizarLinderos(
  id: string,
  linderos: {
    lindero_norte?: string
    lindero_sur?: string
    lindero_oriente?: string
    lindero_occidente?: string
  }
) {
  try {
    // 1. Obtener linderos ANTES del cambio
    const { data: viviendaAnterior, error: errorAnterior } = await supabase
      .from('viviendas')
      .select('id, numero, lindero_norte, lindero_sur, lindero_oriente, lindero_occidente, manzanas(nombre)')
      .eq('id', id)
      .single()

    if (errorAnterior) throw errorAnterior

    // 2. Actualizar linderos
    const { data: viviendaActualizada, error } = await supabase
      .from('viviendas')
      .update(linderos)
      .eq('id', id)
      .select('id, numero, lindero_norte, lindero_sur, lindero_oriente, lindero_occidente, manzanas(nombre)')
      .single()

    if (error) throw error

    // 3. AUDITAR actualización de linderos
    await auditService.auditarActualizacion(
      'viviendas',
      id,
      {
        lindero_norte: viviendaAnterior.lindero_norte,
        lindero_sur: viviendaAnterior.lindero_sur,
        lindero_oriente: viviendaAnterior.lindero_oriente,
        lindero_occidente: viviendaAnterior.lindero_occidente
      },
      {
        lindero_norte: viviendaActualizada.lindero_norte,
        lindero_sur: viviendaActualizada.lindero_sur,
        lindero_oriente: viviendaActualizada.lindero_oriente,
        lindero_occidente: viviendaActualizada.lindero_occidente
      },
      {
        // Metadata específica para linderos
        numero_vivienda: viviendaActualizada.numero,
        manzana_nombre: viviendaActualizada.manzanas?.nombre,
        tipo_cambio: 'linderos',
        linderos_modificados: Object.keys(linderos),
        accion_descripcion: 'Linderos de vivienda actualizados'
      },
      'viviendas'
    )

    console.log('✅ Linderos actualizados y auditados:', id)
    return viviendaActualizada
  } catch (error) {
    console.error('❌ Error actualizando linderos:', error)
    throw error
  }
}

/**
 * ✅ CAMBIAR ESTADO (Disponible → Asignada → Entregada)
 */
export async function cambiarEstadoVivienda(
  id: string,
  nuevoEstado: 'disponible' | 'Asignada' | 'Entregada',
  datosAdicionales?: {
    cliente_id?: string
    negociacion_id?: string
    fecha_entrega?: string
  }
) {
  try {
    // 1. Obtener estado ANTES del cambio
    const { data: viviendaAnterior, error: errorAnterior } = await supabase
      .from('viviendas')
      .select('*, manzanas(nombre, proyecto:proyectos(nombre))')
      .eq('id', id)
      .single()

    if (errorAnterior) throw errorAnterior

    // 2. Actualizar estado
    const updateData: any = { estado: nuevoEstado }
    if (datosAdicionales?.cliente_id) updateData.cliente_id = datosAdicionales.cliente_id
    if (datosAdicionales?.negociacion_id) updateData.negociacion_id = datosAdicionales.negociacion_id
    if (datosAdicionales?.fecha_entrega) updateData.fecha_entrega = datosAdicionales.fecha_entrega

    const { data: viviendaActualizada, error } = await supabase
      .from('viviendas')
      .update(updateData)
      .eq('id', id)
      .select('*, manzanas(nombre, proyecto:proyectos(nombre))')
      .single()

    if (error) throw error

    // 3. AUDITAR cambio de estado (CRÍTICO)
    await auditService.auditarActualizacion(
      'viviendas',
      id,
      {
        estado: viviendaAnterior.estado,
        cliente_id: viviendaAnterior.cliente_id,
        negociacion_id: viviendaAnterior.negociacion_id,
        fecha_entrega: viviendaAnterior.fecha_entrega
      },
      {
        estado: viviendaActualizada.estado,
        cliente_id: viviendaActualizada.cliente_id,
        negociacion_id: viviendaActualizada.negociacion_id,
        fecha_entrega: viviendaActualizada.fecha_entrega
      },
      {
        // Metadata CRÍTICA para cambios de estado
        numero_vivienda: viviendaActualizada.numero,
        manzana_nombre: viviendaActualizada.manzanas?.nombre,
        proyecto_nombre: viviendaActualizada.manzanas?.proyecto?.nombre,
        estado_anterior: viviendaAnterior.estado,
        estado_nuevo: nuevoEstado,
        tipo_cambio: 'estado',
        accion_descripcion: `Estado cambió de ${viviendaAnterior.estado} a ${nuevoEstado}`,
        requiere_validacion: nuevoEstado === 'Entregada' // Flag para revisión
      },
      'viviendas'
    )

    console.log(`✅ Estado de vivienda cambiado: ${viviendaAnterior.estado} → ${nuevoEstado}`)
    return viviendaActualizada
  } catch (error) {
    console.error('❌ Error cambiando estado de vivienda:', error)
    throw error
  }
}

/**
 * ✅ ELIMINAR VIVIENDA (CRÍTICO - Requiere autorización)
 */
export async function eliminarVivienda(id: string, motivo: string) {
  try {
    // 1. Obtener datos completos ANTES de eliminar
    const { data: viviendaAEliminar, error: errorAnterior } = await supabase
      .from('viviendas')
      .select('*, manzanas(nombre, proyecto:proyectos(nombre))')
      .eq('id', id)
      .single()

    if (errorAnterior) throw errorAnterior

    // Validación: No eliminar si tiene negociación activa
    if (viviendaAEliminar.negociacion_id) {
      throw new Error('No se puede eliminar una vivienda con negociación activa')
    }

    // 2. Eliminar vivienda
    const { error } = await supabase
      .from('viviendas')
      .delete()
      .eq('id', id)

    if (error) throw error

    // 3. AUDITAR eliminación (MUY IMPORTANTE)
    await auditService.auditarEliminacion(
      'viviendas',
      id,
      {
        numero: viviendaAEliminar.numero,
        manzana_id: viviendaAEliminar.manzana_id,
        area: viviendaAEliminar.area,
        valor_base: viviendaAEliminar.valor_base,
        valor_total: viviendaAEliminar.valor_total,
        estado: viviendaAEliminar.estado,
        es_esquinera: viviendaAEliminar.es_esquinera,
        linderos: {
          norte: viviendaAEliminar.lindero_norte,
          sur: viviendaAEliminar.lindero_sur,
          oriente: viviendaAEliminar.lindero_oriente,
          occidente: viviendaAEliminar.lindero_occidente
        }
      },
      {
        // Metadata CRÍTICA para eliminaciones
        motivo,
        numero_vivienda: viviendaAEliminar.numero,
        manzana_nombre: viviendaAEliminar.manzanas?.nombre,
        proyecto_nombre: viviendaAEliminar.manzanas?.proyecto?.nombre,
        valor_vivienda: viviendaAEliminar.valor_total,
        estado_al_eliminar: viviendaAEliminar.estado,
        tenia_cliente: !!viviendaAEliminar.cliente_id,
        accion_descripcion: `Vivienda ${viviendaAEliminar.numero} eliminada`,
        requiere_revision: true, // Flag para auditoría administrativa
        autorizacion: 'Administrador' // Indicar quién autorizó
      },
      'viviendas'
    )

    console.log('✅ Vivienda eliminada y auditada:', id)
    return true
  } catch (error) {
    console.error('❌ Error eliminando vivienda:', error)
    throw error
  }
}
```

---

## 🎯 Puntos Clave de la Implementación

### 1. **Siempre obtener datos ANTES del cambio**
```typescript
// ❌ MAL - No puedes auditar sin datos anteriores
const { data } = await supabase.from('viviendas').update(cambios).eq('id', id)
await auditService.auditarActualizacion('viviendas', id, ???, data) // No tienes datos anteriores

// ✅ BIEN - Primero obtener, luego actualizar
const { data: antes } = await supabase.from('viviendas').select('*').eq('id', id).single()
const { data: despues } = await supabase.from('viviendas').update(cambios).eq('id', id).select().single()
await auditService.auditarActualizacion('viviendas', id, antes, despues)
```

### 2. **Metadata rica y descriptiva**
```typescript
// ❌ MAL - Metadata vacía
await auditService.auditarCreacion('viviendas', id, datos)

// ✅ BIEN - Metadata con contexto
await auditService.auditarCreacion('viviendas', id, datos, {
  manzana_nombre: 'A',
  proyecto_nombre: 'Los Pinos',
  valor_total: 150000000,
  accion_descripcion: 'Vivienda creada en el sistema'
})
```

### 3. **Validaciones ANTES de eliminar**
```typescript
// ✅ Validar que se puede eliminar
if (vivienda.negociacion_id) {
  throw new Error('No se puede eliminar con negociación activa')
}

// ✅ Auditar con metadata explicativa
await auditService.auditarEliminacion('viviendas', id, datos, {
  motivo: 'Error en registro - duplicado',
  autorizacion: 'Gerencia',
  requiere_revision: true
})
```

### 4. **Auditoría NO debe bloquear operaciones**
```typescript
try {
  // Operación principal
  const resultado = await actualizarVivienda(id, cambios)

  // Auditoría (si falla, solo loguea - no lanza error)
  await auditService.auditarActualizacion(...)

  return resultado
} catch (error) {
  // Solo capturar errores de operación principal
  // Auditoría falla silenciosamente
  throw error
}
```

---

## 📊 Ejemplos de Consultas

### Ver historial de una vivienda específica

```typescript
const historial = await auditService.obtenerHistorial('viviendas', viviendaId)

// Resultado:
// [
//   {
//     accion: 'UPDATE',
//     fecha_evento: '2025-11-04T10:30:00Z',
//     usuario_email: 'admin@ryrconstruc.com',
//     cambios_especificos: {
//       valor_base: { antes: 150000000, despues: 155000000 }
//     }
//   },
//   {
//     accion: 'CREATE',
//     fecha_evento: '2025-11-01T08:00:00Z',
//     usuario_email: 'admin@ryrconstruc.com',
//     datos_nuevos: { numero: '101', valor_base: 150000000, ... }
//   }
// ]
```

### Detectar cambios de precio sospechosos

```sql
SELECT
  fecha_evento,
  registro_id,
  usuario_email,
  cambios_especificos->'valor_base'->>'antes' AS precio_anterior,
  cambios_especificos->'valor_base'->>'despues' AS precio_nuevo,
  ((cambios_especificos->'valor_base'->>'despues')::numeric -
   (cambios_especificos->'valor_base'->>'antes')::numeric) AS diferencia
FROM audit_log
WHERE tabla = 'viviendas'
  AND accion = 'UPDATE'
  AND cambios_especificos ? 'valor_base'
  AND ABS(
    (cambios_especificos->'valor_base'->>'despues')::numeric -
    (cambios_especificos->'valor_base'->>'antes')::numeric
  ) > 10000000  -- Cambio mayor a 10 millones
ORDER BY fecha_evento DESC;
```

---

## ✅ Checklist de Implementación

- [ ] Importar `auditService` en el archivo de servicio
- [ ] En `crearVivienda()`: Agregar `auditService.auditarCreacion()`
- [ ] En `actualizarVivienda()`: Agregar lógica antes/después + auditoría
- [ ] En `actualizarLinderos()`: Agregar auditoría específica
- [ ] En `cambiarEstadoVivienda()`: Agregar auditoría con metadata crítica
- [ ] En `eliminarVivienda()`: Agregar validaciones + auditoría detallada
- [ ] Probar cada operación en desarrollo
- [ ] Verificar que registros aparecen en `audit_log`
- [ ] Validar que `cambios_especificos` muestra solo campos modificados
- [ ] Documentar para el equipo

---

## 🎯 Próximo Paso

Replicar esta misma estructura en:
1. **Clientes** → `src/modules/clientes/services/clientes.service.ts`
2. **Negociaciones** → `src/modules/negociaciones/services/negociaciones.service.ts`
3. **Abonos** → `src/modules/abonos/services/abonos.service.ts`

¡La base está lista! 🚀
