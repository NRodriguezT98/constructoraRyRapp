# 📚 Sistema de Historial y Versionado de Negociaciones

## 🎯 Objetivo

Implementar un sistema robusto de **historial de cambios** y **versionado** para negociaciones, que permita:

1. ✅ **Rastrear todos los cambios** en negociaciones (valor, fuentes, documentos)
2. ✅ **Ver historial completo** con timeline visual
3. ✅ **Proteger integridad de datos** (no eliminar fuentes con dinero)
4. ✅ **Auditoría completa** para legal/contabilidad
5. ✅ **Prevenir conflictos** de edición concurrente

---

## 🗄️ Arquitectura de Base de Datos

### **1. Tabla Principal: `negociaciones`**

**Nuevas columnas:**
```sql
version_actual       INTEGER     -- Versión actual (incrementa con cambios)
version_lock         INTEGER     -- Para optimistic locking (evitar conflictos)
fecha_ultima_modificacion  TIMESTAMP
```

**Comportamiento:**
- `version_actual`: Se incrementa automáticamente en cada UPDATE significativo
- `version_lock`: Se incrementa en CADA UPDATE (sin importar cambios)
- Permite detectar si otro usuario modificó la negociación

---

### **2. Tabla Historial: `negociaciones_historial`**

**Estructura:**
```sql
CREATE TABLE negociaciones_historial (
  id UUID PRIMARY KEY,
  negociacion_id UUID,           -- FK a negociaciones
  version INTEGER,               -- Número de versión del snapshot

  -- Snapshots completos
  datos_negociacion JSONB,       -- Estado completo en ese momento
  fuentes_pago_snapshot JSONB,   -- Fuentes activas en ese momento
  documentos_snapshot JSONB,     -- Documentos activos

  -- Contexto del cambio
  tipo_cambio VARCHAR(100),      -- "Modificación Fuentes", "Cambio Estado"
  razon_cambio TEXT,             -- Razón ingresada por usuario
  campos_modificados TEXT[],     -- ["valor_negociado", "descuento"]

  -- Comparación rápida (para UI)
  datos_anteriores JSONB,        -- Estado antes del cambio
  datos_nuevos JSONB,            -- Estado después del cambio

  -- Auditoría
  usuario_id UUID,
  fecha_cambio TIMESTAMP,

  UNIQUE(negociacion_id, version)
)
```

**Cuándo se crea un snapshot:**
- ✅ Cambio en `valor_negociado`
- ✅ Cambio en `descuento_aplicado`
- ✅ Cambio en `estado`
- ✅ Cambio en `vivienda_id`

---

### **3. Tabla Fuentes: `fuentes_pago`**

**Nuevas columnas:**
```sql
estado_fuente VARCHAR(20)       -- 'activa', 'inactiva', 'reemplazada'
reemplazada_por UUID            -- ID de fuente que la reemplaza
razon_inactivacion TEXT         -- Por qué se inactivó
fecha_inactivacion TIMESTAMP
version_negociacion INTEGER     -- A qué versión pertenece
```

**Estados:**
- `activa`: Fuente válida y usable
- `inactiva`: Eliminada pero conservada en historial
- `reemplazada`: Sustituida por otra (ej: Caja → Mi Casa Ya)

---

### **4. Tabla Documentos: `documentos_cliente`**

**Nuevas columnas:**
```sql
estado_documento VARCHAR(20)         -- 'activo', 'obsoleto', 'archivado'
razon_obsolescencia TEXT            -- Por qué quedó obsoleto
fuente_pago_relacionada UUID        -- FK a fuente_pago
fecha_obsolescencia TIMESTAMP
```

**Estados:**
- `activo`: Documento vigente
- `obsoleto`: Ya no aplica, pero se conserva (ej: carta de subsidio que no salió)
- `archivado`: Guardado sin mostrar en UI principal

---

## ⚙️ Triggers Automáticos

### **1. Trigger: Incrementar `version_lock`**

```sql
CREATE TRIGGER trigger_version_lock
  BEFORE UPDATE ON negociaciones
  EXECUTE FUNCTION incrementar_version_lock()
```

**Qué hace:**
- Incrementa `version_lock` en CADA actualización
- Actualiza `fecha_ultima_modificacion`
- Permite validar edición concurrente

**Uso en frontend:**
```typescript
// Al cargar negociación
const versionCargada = negociacion.version_lock

// Al guardar cambios
const { data } = await supabase
  .from('negociaciones')
  .update(cambios)
  .eq('id', id)
  .eq('version_lock', versionCargada) // ⭐ Validar versión

if (data.length === 0) {
  throw new Error('Otro usuario modificó esta negociación. Recarga la página.')
}
```

---

### **2. Trigger: Crear Snapshot Automático**

```sql
CREATE TRIGGER trigger_snapshot_negociacion
  BEFORE UPDATE ON negociaciones
  EXECUTE FUNCTION crear_snapshot_negociacion()
```

**Qué hace:**
1. Detecta cambios significativos
2. Incrementa `version_actual`
3. Guarda snapshot en `negociaciones_historial`
4. Actualiza `version_negociacion` en `fuentes_pago`

**Ejemplo:**
```
Usuario cambia valor_negociado de $120M a $118M
→ version_actual: 1 → 2
→ Se guarda snapshot en negociaciones_historial:
  {
    version: 1,
    tipo_cambio: "Modificación de Valor",
    datos_anteriores: { valor_negociado: 120000000 },
    datos_nuevos: { valor_negociado: 118000000 }
  }
```

---

### **3. Trigger: Marcar Documentos Obsoletos**

```sql
CREATE TRIGGER trigger_fuente_inactivada
  AFTER UPDATE ON fuentes_pago
  EXECUTE FUNCTION handle_fuente_inactivada()
```

**Qué hace:**
1. Detecta cambio de `estado_fuente` de `activa` a `inactiva`
2. **Valida que NO tenga dinero recibido** (bloqueará si tiene)
3. Marca documentos relacionados como `obsoleto`
4. Registra en `audit_log`

**Ejemplo:**
```
Fuente: Subsidio Caja ($30M)
├─ monto_recibido: $0
├─ Documento: "Carta Aprobación COMFANDI.pdf"
└─ Usuario inactiva fuente

→ estado_fuente: 'activa' → 'inactiva'
→ Documento: estado_documento: 'activo' → 'obsoleto'
→ razon_obsolescencia: "Cliente no fue favorecido"
```

---

### **4. Trigger: Prevenir Eliminación con Dinero**

```sql
CREATE TRIGGER trigger_prevent_delete_fuente_con_dinero
  BEFORE DELETE ON fuentes_pago
  EXECUTE FUNCTION prevent_delete_fuente_con_dinero()
```

**Qué hace:**
- **BLOQUEA** eliminación si `monto_recibido > 0`
- Lanza excepción con mensaje claro
- Protección adicional a la validación en código

**Ejemplo de error:**
```
PROHIBIDO: No se puede eliminar una fuente de pago que ha recibido dinero ($ 15000000)
HINT: Debe marcar como inactiva en lugar de eliminar
```

---

## 🔒 Protecciones Implementadas

### **Nivel 1: Frontend**
```typescript
// Hook: useConfigurarFuentesPago.ts
if (fuente.monto_recibido > 0) {
  setError(
    '⚠️ No se puede eliminar esta fuente porque ya ha recibido dinero. ' +
    'Para mantener la integridad del historial de abonos, esta fuente debe permanecer activa.'
  )
  return
}
```

### **Nivel 2: Service**
```typescript
// fuentes-pago.service.ts
if (fuente.monto_recibido > 0) {
  throw new Error(
    `No se puede eliminar una fuente con $${fuente.monto_recibido.toLocaleString()} recibidos`
  )
}
```

### **Nivel 3: Base de Datos (Trigger UPDATE)**
```sql
-- handle_fuente_inactivada()
IF NEW.monto_recibido > 0 THEN
  RAISE EXCEPTION 'PROHIBIDO: No se puede inactivar fuente con dinero'
END IF
```

### **Nivel 4: Base de Datos (Trigger DELETE)**
```sql
-- prevent_delete_fuente_con_dinero()
IF OLD.monto_recibido > 0 THEN
  RAISE EXCEPTION 'PROHIBIDO: No se puede eliminar fuente con dinero'
END IF
```

---

## 📊 Flujo de Usuario Completo

### **Escenario: Cambio de Subsidio**

```
1. Estado Inicial (v1)
   ├─ Valor: $120M
   ├─ Fuentes:
   │  ├─ Cuota Inicial: $30M (monto_recibido: $0)
   │  ├─ Crédito: $60M (monto_recibido: $0)
   │  └─ Subsidio Caja: $30M (monto_recibido: $0) ← Carta subida
   └─ Documentos: "Carta Aprobación COMFANDI.pdf" (activo)

2. Usuario elimina "Subsidio Caja"
   ├─ Frontend valida: monto_recibido = 0 ✅
   ├─ Service llama: inactivarFuentePago(id, "No salió favorecido")
   ├─ Trigger valida: monto_recibido = 0 ✅
   └─ Trigger ejecuta:
       ├─ estado_fuente: 'activa' → 'inactiva'
       ├─ Documento: estado_documento: 'activo' → 'obsoleto'
       └─ audit_log: Registro del cambio

3. Usuario agrega "Subsidio Mi Casa Ya"
   ├─ Nueva fuente creada (estado_fuente: 'activa')
   ├─ Se crea documento_pendiente automático
   └─ Usuario debe subir nueva carta

4. Estado Final (v2)
   ├─ Valor: $120M (sin cambios)
   ├─ Fuentes:
   │  ├─ Cuota Inicial: $30M (activa)
   │  ├─ Crédito: $60M (activa)
   │  ├─ Subsidio Caja: $30M (inactiva) ← Conservada
   │  └─ Subsidio Mi Casa Ya: $30M (activa) ← Nueva
   ├─ Documentos:
   │  ├─ "Carta COMFANDI.pdf" (obsoleto) ← Conservado
   │  └─ Pendiente: "Carta Mi Casa Ya" ← Por subir
   └─ Historial:
       └─ v1 → Snapshot guardado con fuentes y documentos
```

---

## 🎨 UI: Vista de Historial

### **Ubicación:**
```
Tab "Historial" en Detalle de Negociación
```

### **Componentes:**

#### **1. Timeline Vertical**
```tsx
<NegociacionTimeline negociacionId={id} />

Muestra:
├─ v3 - 2025-02-01 - Cambio de Estado
│  └─ Estado: "En Proceso" → "Completada"
│
├─ v2 - 2025-01-15 - Modificación de Fuentes
│  ├─ ❌ Eliminada: Subsidio Caja ($30M)
│  ├─ ✅ Agregada: Subsidio Mi Casa Ya ($18M)
│  ├─ 📝 Modificada: Cuota Inicial ($30M → $42M)
│  └─ Razón: "Cliente no fue favorecido"
│
└─ v1 - 2025-01-10 - Negociación Creada
   └─ Valor: $120M, 3 fuentes creadas
```

#### **2. Comparador de Versiones**
```tsx
<ComparadorVersiones
  negociacionId={id}
  versionA={1}
  versionB={2}
/>

Vista lado a lado:
┌─────────────────┬─────────────────┐
│ Versión 1       │ Versión 2       │
├─────────────────┼─────────────────┤
│ Fuentes:        │ Fuentes:        │
│ - Cuota: $30M   │ - Cuota: $42M ✨│
│ - Crédito: $60M │ - Crédito: $60M │
│ - Caja: $30M    │ - Mi Casa: $18M │
│                 │   (nueva) ✅    │
└─────────────────┴─────────────────┘
```

---

## 🔧 Funciones Helper

### **Obtener Historial**
```sql
SELECT * FROM obtener_historial_negociacion('uuid-negociacion');

Retorna:
version | fecha_cambio | tipo_cambio        | razon_cambio        | campos_modificados
--------+--------------+--------------------+---------------------+-------------------
   3    | 2025-02-01   | Cambio de Estado   | 100% pagado         | {estado}
   2    | 2025-01-15   | Modificación...    | No salió favorecido | {fuentes}
   1    | 2025-01-10   | Creación           | -                   | {}
```

---

## 🚀 Próximos Pasos (Opcional)

### **Fase 2: UX Mejorada**
- [ ] Notificaciones en tiempo real (Supabase Realtime)
- [ ] Exportar historial a PDF
- [ ] Dashboard de auditoría para admin

### **Fase 3: Edge Cases**
- [ ] Documentos compartidos entre fuentes (array)
- [ ] Trigger cambio de vivienda
- [ ] Restaurar versión anterior (requiere aprobación admin)

---

## ✅ Validación de Implementación

### **Checklist:**
- [x] Migración SQL ejecutada correctamente
- [x] Triggers creados y funcionando
- [x] Service actualizado (`inactivarFuentePago`)
- [x] Hook actualizado (mensajes de error claros)
- [x] Protección en 4 niveles (frontend, service, 2 triggers)
- [x] Documentos se marcan obsoletos automáticamente
- [x] Historial se guarda en cada cambio

### **Pruebas Recomendadas:**

1. **Crear negociación** → Verificar v1 en historial
2. **Modificar valor** → Verificar snapshot v2
3. **Agregar fuente** → Verificar en historial
4. **Eliminar fuente SIN dinero** → Debe permitir
5. **Eliminar fuente CON dinero** → Debe rechazar (4 niveles)
6. **Ver timeline** → Verificar orden correcto
7. **Comparar versiones** → Verificar diff visual

---

## 📚 Archivos Modificados

```
supabase/
└── migrations/
    └── 20251203_sistema_historial_negociaciones.sql

src/modules/clientes/
├── services/
│   └── fuentes-pago.service.ts        (inactivarFuentePago)
└── hooks/
    └── useConfigurarFuentesPago.ts    (mensajes de error)
```

---

## 🎓 Conceptos Implementados

- ✅ **Event Sourcing Lite**: Snapshots + audit_log
- ✅ **Optimistic Locking**: Prevenir conflictos concurrentes
- ✅ **Soft Delete**: Inactivar en lugar de eliminar
- ✅ **Audit Trail**: Historial completo inmutable
- ✅ **Database Triggers**: Lógica de negocio en BD
- ✅ **JSONB Snapshots**: Estado completo en JSON

---

**Fecha de implementación:** 2025-12-03
**Versión del sistema:** 1.0.0
**Estado:** ✅ Producción
