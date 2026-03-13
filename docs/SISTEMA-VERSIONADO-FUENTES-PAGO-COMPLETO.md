# 🔄 Sistema de Versionado de Fuentes de Pago - Implementación Completa

## 📋 Resumen

Sistema completo de versionado e historial para fuentes de pago en negociaciones, con **soft delete**, **vinculación automática**, **auditoría completa**, y **modal de confirmación visual**.

---

## 🆕 ACTUALIZACIÓN: Modal de Confirmación Visual (v2.0)

### **Mejoras UX Implementadas (2025-12-03)**

#### ✅ **1. Modal de Confirmación de Cambios**
Antes de guardar, el usuario ve un **diff visual detallado**:
- **Fuentes Agregadas** → Tarjeta verde con icono `+`
- **Fuentes Eliminadas** → Tarjeta roja con icono `-` (tachado)
- **Fuentes Modificadas** → Tarjeta azul con diff anterior → nuevo
- **Sin Cambios** → Tarjeta gris informativa

**Documentación completa**: `docs/MODAL-CONFIRMACION-CAMBIOS-FUENTES.md`

#### ✅ **2. Formato de Montos en Peso Colombiano**
Todos los montos se muestran con formato `$150.000.000` (COP)

#### ✅ **3. Botón Eliminar Centrado**
Botón de eliminar fuente correctamente alineado verticalmente

---

## ✅ ¿QUÉ SUCEDE CUANDO...?

### **Caso 1: Eliminar "Crédito Hipotecario" y agregar "Subsidio de Vivienda"**

#### **🎬 Flujo Completo:**

```
1. Usuario abre modal "Editar Fuentes"
   ├─ Ve: Crédito Hipotecario ($50,000,000)
   └─ Acción: Elimina y agrega Subsidio ($20,000,000)

2. Frontend valida
   ├─ ✅ Crédito sin abonos (monto_recibido = 0)
   └─ ✅ Permite eliminación

3. Service: actualizarFuentesPago()
   ├─ Consulta fuentes activas actuales
   ├─ Detecta: Crédito Hip. no está en nueva lista
   ├─ Valida: monto_recibido = 0 ✅
   ├─ UPDATE fuentes_pago SET:
   │   ├─ estado_fuente = 'inactiva'
   │   ├─ fecha_inactivacion = NOW()
   │   └─ razon_inactivacion = "Fuente eliminada/reemplazada..."
   └─ INSERT nueva fuente (Subsidio)

4. Trigger DB: trigger_snapshot_cambio_fuente
   ├─ Detecta UPDATE con estado_fuente → 'inactiva'
   ├─ Incrementa version_lock en negociaciones
   ├─ Obtiene snapshot de fuentes ACTIVAS
   ├─ INSERT en negociaciones_historial:
   │   ├─ version: 2
   │   ├─ tipo_cambio: 'fuente_inactivada'
   │   ├─ razon_cambio: 'Fuente de pago inactivada'
   │   ├─ fuentes_pago_snapshot: [Solo Subsidio]
   │   ├─ datos_anteriores: {Crédito Hip. datos}
   │   └─ datos_nuevos: {Crédito Hip. inactiva}
   └─ Incrementa version_actual en negociaciones

5. Trigger DB: trigger_snapshot_cambio_fuente (nueva fuente)
   ├─ Detecta INSERT de Subsidio
   ├─ Incrementa version_lock
   ├─ INSERT en negociaciones_historial:
   │   ├─ version: 3
   │   ├─ tipo_cambio: 'fuente_agregada'
   │   ├─ razon_cambio: 'Nueva fuente: Subsidio de Vivienda'
   │   └─ fuentes_pago_snapshot: [Subsidio]
   └─ Incrementa version_actual

6. Service: Vinculación Automática
   ├─ Detecta tipo coincidente (ambos son hipoteca/subsidio)
   ├─ UPDATE fuentes_pago (Crédito inactivo) SET:
   │   ├─ reemplazada_por = [id_subsidio]
   │   └─ razon_inactivacion = "Reemplazada por Subsidio..."
   └─ ✅ Vínculo creado

7. React Query
   ├─ invalidateQueries(['fuentes_pago', negociacionId])
   ├─ Refetch automático
   └─ UI muestra solo Subsidio (activa)

8. Resultado Final en BD
   ├─ fuentes_pago:
   │   ├─ Crédito Hip: estado_fuente='inactiva', reemplazada_por=[id]
   │   └─ Subsidio: estado_fuente='activa'
   ├─ negociaciones:
   │   ├─ version_actual: 3
   │   └─ version_lock: 3
   └─ negociaciones_historial:
       ├─ Versión 2: fuente_inactivada
       └─ Versión 3: fuente_agregada
```

---

### **Caso 2: Intentar eliminar fuente CON abonos**

#### **🛡️ Protección Multi-Nivel:**

```
1. Usuario intenta eliminar "Cuota Inicial" con $5,000,000 recibidos

2. Frontend (Modal)
   ├─ Botón "Eliminar" está DESHABILITADO
   ├─ Tooltip: "No se puede eliminar (tiene abonos)"
   └─ ❌ Usuario no puede hacer clic

3. SI burla frontend (manipulación DevTools)
   ├─ Service: actualizarFuentesPago()
   ├─ Valida: monto_recibido > 0
   ├─ throw Error("No puedes eliminar fuentes con abonos")
   └─ ❌ Operación bloqueada

4. SI burla service (SQL directo)
   ├─ Trigger: prevent_delete_fuente_con_dinero
   ├─ RAISE EXCEPTION
   └─ ❌ DELETE bloqueado en BD

5. Resultado: Fuente NUNCA se elimina
```

---

## 🗂️ Archivos Modificados

### **1. Backend / Base de Datos**

```sql
📄 supabase/migrations/20251203_sistema_historial_negociaciones.sql
- Tabla: negociaciones_historial
- Columnas en negociaciones: version_actual, version_lock
- Columnas en fuentes_pago: estado_fuente, reemplazada_por, razon_inactivacion
- Trigger: prevent_delete_fuente_con_dinero
- Trigger: handle_fuente_inactivada (obsolescencia docs)

📄 supabase/migrations/20251203_trigger_snapshot_fuentes.sql (NUEVO)
- Function: crear_snapshot_por_cambio_fuente()
- Trigger: trigger_snapshot_cambio_fuente
- Eventos: INSERT, UPDATE, DELETE en fuentes_pago
```

### **2. Services**

```typescript
📄 src/modules/clientes/services/negociaciones.service.ts
✅ actualizarFuentesPago()
  - Cambio DELETE → UPDATE (soft delete)
  - Filtro .eq('estado_fuente', 'activa')
  - Vinculación automática con reemplazada_por
  - Logs detallados

📄 src/modules/clientes/services/fuentes-pago.service.ts
✅ obtenerFuentesPagoNegociacion()
  - Filtro .eq('estado_fuente', 'activa')
  - Solo retorna fuentes activas
```

### **3. Frontend**

```typescript
📄 src/app/clientes/[id]/tabs/negociaciones/EditarFuentesPagoModal.tsx
✅ Botón eliminar
  - disabled={fuente.monto_recibido > 0}
  - Tooltip explicativo

📄 src/app/clientes/[id]/tabs/negociaciones/hooks/useEditarFuentesPagoModal.ts
✅ handleEliminarFuente()
  - Validación frontend
  - Alert si tiene abonos
```

### **4. Tipos**

```typescript
📄 src/lib/supabase/database.types.ts
✅ Regenerados con npm run types:generate
  - estado_fuente: string | null
  - reemplazada_por: string | null
  - razon_inactivacion: string | null
  - fecha_inactivacion: string | null
  - version_negociacion: number
```

---

## 📊 Estructura de Datos

### **Tabla: fuentes_pago**

```sql
CREATE TABLE fuentes_pago (
  id UUID PRIMARY KEY,
  negociacion_id UUID REFERENCES negociaciones(id),
  tipo VARCHAR(50),
  monto_aprobado NUMERIC(12,2),
  monto_recibido NUMERIC(12,2) DEFAULT 0,

  -- ✅ NUEVAS COLUMNAS (Sistema de Versionado)
  estado_fuente VARCHAR(20) DEFAULT 'activa'
    CHECK (estado_fuente IN ('activa', 'inactiva', 'reemplazada')),
  reemplazada_por UUID REFERENCES fuentes_pago(id),
  razon_inactivacion TEXT,
  fecha_inactivacion TIMESTAMPTZ,
  version_negociacion INTEGER DEFAULT 1
);
```

### **Tabla: negociaciones_historial**

```sql
CREATE TABLE negociaciones_historial (
  id UUID PRIMARY KEY,
  negociacion_id UUID REFERENCES negociaciones(id),
  version INTEGER NOT NULL,

  -- Snapshots completos
  datos_negociacion JSONB NOT NULL,
  fuentes_pago_snapshot JSONB,      -- Solo fuentes activas
  documentos_snapshot JSONB,

  -- Metadatos del cambio
  tipo_cambio VARCHAR(100) NOT NULL, -- 'fuente_inactivada', 'fuente_agregada'
  razon_cambio TEXT NOT NULL,
  campos_modificados TEXT[],

  -- Diff
  datos_anteriores JSONB,
  datos_nuevos JSONB,

  -- Auditoría
  usuario_id UUID,
  fecha_cambio TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔍 Consultas de Auditoría

### **Ver historial completo de una negociación**

```sql
SELECT
  version,
  tipo_cambio,
  razon_cambio,
  fecha_cambio,
  fuentes_pago_snapshot
FROM negociaciones_historial
WHERE negociacion_id = '105f3121-8d56-4b29-adac-380cebdc1faf'
ORDER BY version DESC;
```

### **Ver fuentes inactivas y sus reemplazos**

```sql
SELECT
  f1.tipo AS fuente_original,
  f1.estado_fuente,
  f1.razon_inactivacion,
  f2.tipo AS reemplazada_por_tipo,
  f2.monto_aprobado AS nuevo_monto
FROM fuentes_pago f1
LEFT JOIN fuentes_pago f2 ON f1.reemplazada_por = f2.id
WHERE f1.negociacion_id = '...'
  AND f1.estado_fuente = 'inactiva';
```

### **Timeline de cambios (UI futura)**

```sql
SELECT
  version,
  tipo_cambio,
  razon_cambio,
  fecha_cambio,
  (datos_nuevos->>'tipo')::text AS fuente_tipo,
  (datos_nuevos->>'monto_aprobado')::numeric AS monto
FROM negociaciones_historial
WHERE negociacion_id = '...'
  AND tipo_cambio IN ('fuente_agregada', 'fuente_inactivada')
ORDER BY version DESC;
```

---

## ✅ Checklist de Validación

- [x] **Soft delete implementado** (UPDATE en lugar de DELETE)
- [x] **Trigger de snapshot** para cambios en fuentes_pago
- [x] **Vinculación automática** con `reemplazada_por`
- [x] **Filtro de activas** en todas las consultas
- [x] **Protección multi-nivel** contra eliminación con abonos
- [x] **Tipos TypeScript** regenerados
- [x] **Logs detallados** en service
- [x] **UI deshabilitada** para fuentes con abonos
- [x] **Historial completo** en negociaciones_historial
- [x] **Auditoría automática** con usuario y timestamp

---

## 🚀 Próximos Pasos (Fase 2)

### **1. UI de Timeline (Componente Visual)**

```tsx
<NegociacionTimeline negociacionId={id} />

// Muestra:
// v3 → ✅ Nueva fuente: Subsidio de Vivienda ($20M)
// v2 → 🔄 Fuente inactivada: Crédito Hipotecario
// v1 → 📝 Negociación creada
```

### **2. Modal de Comparación**

```tsx
<ComparadorVersiones
  versionAnterior={2}
  versionNueva={3}
/>

// Muestra diff visual:
// - Crédito Hipotecario ($50M) ❌
// + Subsidio de Vivienda ($20M) ✅
```

### **3. Notificaciones Automáticas**

```sql
-- Trigger para enviar email cuando se inactiva fuente importante
CREATE FUNCTION notificar_cambio_fuente() ...
```

### **4. Restauración de Versión (Admin Only)**

```typescript
async restaurarVersion(negociacionId: string, version: number) {
  // Obtener snapshot
  // Aplicar datos anteriores
  // Crear nueva versión "restaurada desde v{X}"
}
```

---

## 📚 Documentación Relacionada

- **Migración original**: `supabase/migrations/20251203_sistema_historial_negociaciones.sql`
- **Docs técnicos**: `docs/SISTEMA-HISTORIAL-NEGOCIACIONES.md`
- **Schema DB**: `docs/DATABASE-SCHEMA-REFERENCE-ACTUALIZADO.md`

---

## 🎯 Resumen Ejecutivo

**Antes:**
- ❌ Eliminar fuente = DELETE permanente
- ❌ Sin historial de cambios
- ❌ Documentos huérfanos
- ❌ Sin auditoría

**Ahora:**
- ✅ Soft delete con `estado_fuente = 'inactiva'`
- ✅ Historial completo con snapshots
- ✅ Documentos marcados como obsoletos
- ✅ Vinculación automática de reemplazos
- ✅ Protección multi-nivel
- ✅ Auditoría con usuario y timestamp
- ✅ Timeline de versiones

**Beneficios:**
- 🔒 Integridad de datos garantizada
- 📊 Auditoría completa
- 🔄 Rastreabilidad total
- 🛡️ Protección contra errores
- 📈 Base para analytics
