# 📋 Plantilla: Integrar Auditoría en Módulo

**Copiar esta plantilla para agregar auditoría a cualquier módulo nuevo**

---

## ⚡ Quick Start (15 minutos)

### **1. En el Service/Hook del Módulo**

```typescript
// [NOMBRE_MODULO]/hooks/use[Modulo].ts o services/[modulo].service.ts

// ✅ PASO 1: Import
import { auditService } from '@/services/audit.service'

// ✅ PASO 2: En función de CREAR
const crear[Entidad] = async (datos: [Entidad]Input) => {
  const { data: nuevo, error } = await supabase
    .from('[tabla]')
    .insert(datos)
    .select()
    .single()

  if (error) throw error

  // 🔍 AUDITORÍA
  try {
    await auditService.auditarCreacion(
      '[tabla]',              // ← Nombre de tabla DB
      nuevo.id,
      nuevo,
      {
        // Metadata enriquecida (valores formateados, relaciones)
        campo_clave: nuevo.campo_clave,
        campo_formateado: `formato(${nuevo.campo})`,
        relacion_id: datos.relacion_id,
        relacion_nombre: datos.relacion?.nombre
      },
      '[modulo]'              // ← Nombre del módulo
    )
  } catch (auditError) {
    console.error('Error en auditoría:', auditError)
    // No bloqueamos la operación
  }

  return nuevo
}

// ✅ PASO 3: En función de ACTUALIZAR
const actualizar[Entidad] = async (id: string, cambios: Partial<[Entidad]>) => {
  // Obtener datos anteriores
  const { data: anterior } = await supabase
    .from('[tabla]')
    .select('*')
    .eq('id', id)
    .single()

  const { data: actualizado, error } = await supabase
    .from('[tabla]')
    .update(cambios)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  // 🔍 AUDITORÍA
  try {
    await auditService.auditarActualizacion(
      '[tabla]',
      id,
      anterior,
      actualizado,
      {
        campos_modificados: Object.keys(cambios),
        motivo: 'actualización manual'
      },
      '[modulo]'
    )
  } catch (auditError) {
    console.error('Error en auditoría:', auditError)
  }

  return actualizado
}

// ✅ PASO 4: En función de ELIMINAR
const eliminar[Entidad] = async (id: string) => {
  const { data: entidad } = await supabase
    .from('[tabla]')
    .select('*')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('[tabla]')
    .delete()
    .eq('id', id)

  if (error) throw error

  // 🔍 AUDITORÍA
  try {
    await auditService.auditarEliminacion(
      '[tabla]',
      id,
      entidad,
      {
        motivo: 'eliminación manual'
      },
      '[modulo]'
    )
  } catch (auditError) {
    console.error('Error en auditoría:', auditError)
  }
}
```

---

### **2. Render Especializado (Opcional)**

**Archivo:** `src/modules/auditorias/components/detalle-renders/[Modulo]DetalleRender.tsx`

```typescript
/**
 * [Modulo]DetalleRender - Vista especializada para auditoría de [módulo]
 */
'use client'

import { [Icon1], [Icon2], [Icon3] } from 'lucide-react'
import { InfoCard } from '../shared'

interface [Modulo]DetalleRenderProps {
  metadata: Record<string, any>
}

export function [Modulo]DetalleRender({ metadata }: [Modulo]DetalleRenderProps) {
  // Extraer datos de metadata
  const campo1 = metadata.campo1 || 'N/A'
  const campo2 = metadata.campo2 || 'N/A'
  const campo3Formateado = metadata.campo3_formateado || 'N/A'

  return (
    <div className="space-y-4">
      {/* Grid de información clave */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoCard
          icon={[Icon1]}
          label="Campo 1"
          value={campo1}
        />
        <InfoCard
          icon={[Icon2]}
          label="Campo 2"
          value={campo2}
        />
        <InfoCard
          icon={[Icon3]}
          label="Campo 3"
          value={campo3Formateado}
        />
      </div>

      {/* Sección adicional (si es necesario) */}
      {metadata.detalle_adicional && (
        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Información Adicional
          </h4>
          <p className="text-xs text-gray-700 dark:text-gray-300">
            {metadata.detalle_adicional}
          </p>
        </div>
      )}
    </div>
  )
}
```

---

### **3. Exportar Render**

**Archivo:** `src/modules/auditorias/components/detalle-renders/index.ts`

```typescript
// Agregar línea:
export { [Modulo]DetalleRender } from './[Modulo]DetalleRender'
```

---

### **4. Actualizar Modal de Auditoría**

**Archivo:** `src/modules/auditorias/components/DetalleAuditoriaModal.tsx`

```typescript
// ✅ PASO 1: Import
import {
  // ... imports existentes
  [Modulo]DetalleRender,
} from './detalle-renders'

// ✅ PASO 2: Agregar case en renderDetallesModulo()
const renderDetallesModulo = () => {
  const metadata = datosFormateados.metadata

  switch (registro.modulo) {
    // ... casos existentes
    case '[modulo]':
      return <[Modulo]DetalleRender metadata={metadata} />
    // ... resto de casos
    default:
      return <GenericoDetalleRender registro={registro} />
  }
}
```

---

## 🧪 Pruebas

### **Checklist de Validación:**

- [ ] **1. Crear registro en módulo**
  - [ ] Operación exitosa
  - [ ] No hay errores en consola
  - [ ] Ir a `/auditorias`
  - [ ] Verificar aparece nuevo registro
  - [ ] Tabla = `[tabla]`
  - [ ] Acción = `CREATE`
  - [ ] Módulo = `[modulo]`

- [ ] **2. Ver detalles**
  - [ ] Click en botón "Ver" 👁️
  - [ ] Modal se abre correctamente
  - [ ] Renderiza vista especializada (si se creó)
  - [ ] Metadata visible y formateada
  - [ ] Datos corresponden al registro creado

- [ ] **3. Actualizar registro**
  - [ ] Modificar 2-3 campos
  - [ ] Operación exitosa
  - [ ] Ir a `/auditorias`
  - [ ] Verificar nuevo registro UPDATE
  - [ ] Click en "Ver"
  - [ ] Sección "Cambios Específicos" muestra solo campos modificados
  - [ ] Valores ANTES y DESPUÉS correctos

- [ ] **4. Eliminar registro**
  - [ ] Eliminar registro
  - [ ] Ir a `/auditorias`
  - [ ] Verificar registro DELETE
  - [ ] Click en "Ver"
  - [ ] Snapshot completo del registro eliminado visible

- [ ] **5. Consulta SQL (verificación técnica)**
```sql
SELECT
  id,
  accion,
  tabla,
  modulo,
  metadata,
  fecha_evento
FROM audit_log
WHERE tabla = '[tabla]'
ORDER BY fecha_evento DESC
LIMIT 5;
```

---

## 📊 Metadata Recomendada por Tipo de Módulo

### **Módulo con Relaciones (ej: Viviendas, Negociaciones)**
```typescript
metadata: {
  // Relación principal
  proyecto_id: datos.proyecto_id,
  proyecto_nombre: datos.proyecto?.nombre,

  // Valores clave
  campo_principal: nuevo.campo_principal,
  campo_formateado: formatear(nuevo.campo),

  // Estado
  estado_actual: nuevo.estado,

  // Timestamp
  timestamp: new Date().toISOString()
}
```

### **Módulo con Dinero (ej: Abonos, Viviendas)**
```typescript
metadata: {
  monto: nuevo.monto,
  monto_formateado: `$${nuevo.monto.toLocaleString('es-CO')}`,
  moneda: 'COP'
}
```

### **Módulo de Personas (ej: Clientes, Usuarios)**
```typescript
metadata: {
  nombre_completo: `${nuevo.nombres} ${nuevo.apellidos}`,
  documento_tipo: nuevo.documento_tipo,
  documento_numero: nuevo.documento_numero,
  email: nuevo.email,
  telefono: nuevo.telefono
}
```

### **Módulo con Estados (ej: Negociaciones, Procesos)**
```typescript
metadata: {
  estado_anterior: anterior?.estado,
  estado_nuevo: nuevo.estado,
  cambio_estado: anterior?.estado !== nuevo.estado,
  fecha_cambio: new Date().toISOString()
}
```

---

## 🎯 Tips y Mejores Prácticas

### **DO ✅**
- ✅ Usar `try/catch` en auditoría (no bloquear operación principal)
- ✅ Formatear valores en metadata (dinero, fechas, porcentajes)
- ✅ Incluir relaciones con nombres legibles
- ✅ Agregar timestamps cuando sea relevante
- ✅ Usar metadata para contexto enriquecido

### **DON'T ❌**
- ❌ No incluir contraseñas ni datos sensibles en metadata
- ❌ No lanzar errores si falla auditoría
- ❌ No hacer auditoría síncrona bloqueante
- ❌ No duplicar datos que ya están en `datos_nuevos`/`datos_anteriores`
- ❌ No usar metadata para datos estructurados grandes (usar `datos_nuevos`)

---

## 📚 Referencias

- **Servicio de auditoría**: `src/services/audit.service.ts`
- **Ejemplo completo**: `src/modules/proyectos/services/proyectos.service.ts`
- **Renders existentes**: `src/modules/auditorias/components/detalle-renders/`
- **Documentación completa**: `docs/AUDITORIA-ESCALABILIDAD-ANALISIS.md`

---

**Tiempo estimado de implementación:** 15-30 minutos por módulo simple

**¡Listo para copiar y pegar!** 🚀
