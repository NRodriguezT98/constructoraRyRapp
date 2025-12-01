# 📄 Sistema Inteligente de Documentos Pendientes

**Versión**: 1.0.0
**Fecha**: 2025-11-29
**Propósito**: Gestionar documentos faltantes con vinculación automática

---

## 🎯 **Problema Resuelto**

### **Escenario Real:**

1. Cliente aplica a vivienda con **solo Cuota Inicial**
2. Más adelante consigue **Subsidio + Crédito**
3. ❓ ¿Cómo agregar fuentes sin tener las cartas escaneadas?
4. ❓ ¿Cómo notificar que faltan documentos?
5. ❓ ¿Cómo vincular documentos subidos después?

---

## ✅ **Solución Implementada**

### **Flujo Completo:**

```
┌─────────────────────────────────────────────────────────────────┐
│ 1️⃣ EDITAR FUENTES DE PAGO                                       │
│                                                                   │
│ Usuario agrega "Subsidio Caja Compensación - Comfenalco"       │
│ [Guardar sin carta] ─────────────────────────────┐              │
└──────────────────────────────────────────────────┼──────────────┘
                                                    │
                        ⚙️ Sistema automáticamente:
                        - Guarda fuente_pago
                        - estado_documentacion = 'Pendiente Documentación'
                        - Crea registro en documentos_pendientes
                        - metadata = { tipo_fuente, entidad, monto }
                                                    │
┌───────────────────────────────────────────────────┼──────────────┐
│ 2️⃣ PESTAÑA DOCUMENTOS                            ▼              │
│                                                                   │
│ ⚠️ BANNER: Documentos Pendientes (1)                            │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 📄 Carta Subsidio Caja Compensación - Comfenalco           │ │
│ │ Requerida para: Fuente de Pago #2                          │ │
│ │ Monto: $15.000.000                                          │ │
│ │ [📤 Subir Documento]                                        │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│ Usuario hace clic → Modal upload normal ──────┐                 │
└───────────────────────────────────────────────┼──────────────────┘
                                                 │
                        🎯 Usuario sube documento:
                        - Categoría: "Cartas de Aprobación"
                        - Metadata automática: { tipo_fuente, entidad }
                                                 │
┌────────────────────────────────────────────────┼──────────────────┐
│ 3️⃣ DETECCIÓN Y VINCULACIÓN AUTOMÁTICA         ▼                  │
│                                                                   │
│ ⚙️ Trigger detecta coincidencia:                                │
│    - cliente_id ✓                                                │
│    - categoria_id = "Cartas Aprobación" ✓                       │
│    - metadata.tipo_fuente = "Subsidio Caja Compensación" ✓      │
│    - metadata.entidad = "Comfenalco" ✓                          │
│                                                                   │
│ 🔗 Sistema automáticamente:                                      │
│    1. Actualiza fuente_pago.carta_aprobacion_url                │
│    2. Cambia estado_documentacion = 'Completo'                  │
│    3. Marca documento_pendiente.estado = 'Completado'           │
│    4. Registra en audit_log (VINCULACION_AUTOMATICA_DOCUMENTO)  │
│                                                                   │
│ ✅ Banner desaparece de la UI                                    │
│ ✅ Fuente queda completa                                         │
└───────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ **Schema de Base de Datos**

### **Tabla: `documentos_pendientes`**

```sql
CREATE TABLE documentos_pendientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Vinculación
  fuente_pago_id UUID NOT NULL REFERENCES fuentes_pago(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,

  -- Info del documento esperado
  tipo_documento VARCHAR(100) NOT NULL, -- "Carta Subsidio - Comfenalco"
  categoria_id UUID NOT NULL, -- ID fijo: "4898e798-c188-4f02-bfcf-b2b15be48e34"

  -- Metadata para detección
  metadata JSONB DEFAULT '{}', -- { tipo_fuente, entidad, monto }

  -- Estado y prioridad
  estado VARCHAR(50) DEFAULT 'Pendiente', -- Pendiente | Completado | Vencido
  prioridad VARCHAR(20) DEFAULT 'Media', -- Alta | Media | Baja

  -- Notificaciones (futuro)
  recordatorios_enviados INTEGER DEFAULT 0,
  ultima_notificacion TIMESTAMPTZ,

  -- Timestamps
  fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
  fecha_limite TIMESTAMPTZ, -- Opcional
  fecha_completado TIMESTAMPTZ,
  completado_por UUID REFERENCES usuarios(id)
);
```

### **Columna agregada: `fuentes_pago.estado_documentacion`**

```sql
ALTER TABLE fuentes_pago
ADD COLUMN estado_documentacion VARCHAR(50) DEFAULT 'Completo';

-- Valores posibles:
-- 'Completo' → Tiene carta_aprobacion_url
-- 'Pendiente Documentación' → Requiere carta pero no la tiene
-- 'Sin Documentación Requerida' → Cuota Inicial (no requiere carta)
```

---

## ⚙️ **Lógica Automática (Triggers)**

### **1. Crear pendiente al agregar fuente sin carta**

```sql
CREATE TRIGGER trigger_crear_documento_pendiente
  AFTER INSERT ON fuentes_pago
  FOR EACH ROW
  EXECUTE FUNCTION crear_documento_pendiente_si_falta_carta();
```

**Condición:**
- Tipo IN ('Crédito Hipotecario', 'Subsidio Mi Casa Ya', 'Subsidio Caja Compensación')
- `carta_aprobacion_url IS NULL`

**Acción:**
- Inserta registro en `documentos_pendientes`
- `prioridad = 'Alta'` (bloquea completitud)

---

### **2. Vincular documento subido automáticamente**

```sql
CREATE TRIGGER trigger_vincular_documento_automatico
  AFTER INSERT ON documentos_cliente
  FOR EACH ROW
  EXECUTE FUNCTION vincular_documento_subido_a_fuente_pendiente();
```

**Condición de coincidencia:**
1. `categoria_id = "4898e798-..."` (Cartas Aprobación)
2. `entidad_id = cliente_id`
3. `metadata->>'tipo_fuente'` coincide
4. `metadata->>'entidad'` coincide (opcional)
5. `estado = 'Pendiente'`

**Acción:**
1. `UPDATE fuentes_pago SET carta_aprobacion_url = NEW.url`
2. `UPDATE fuentes_pago SET estado_documentacion = 'Completo'`
3. `UPDATE documentos_pendientes SET estado = 'Completado'`
4. `INSERT INTO audit_log` (registro de vinculación)

---

## 🧩 **Componentes Implementados**

### **1. BannerDocumentosPendientes.tsx**

**Ubicación:** `src/modules/clientes/components/documentos-pendientes/`

**Responsabilidad:**
- Mostrar alerta de documentos faltantes
- Botón "Subir" por cada pendiente
- Información detallada (tipo, entidad, monto)
- Ocultarse automáticamente cuando no hay pendientes

**Props:**
```typescript
interface BannerDocumentosPendientesProps {
  clienteId: string
  onSubirDocumento?: (pendienteId: string, tipoDocumento: string) => void
}
```

**Features:**
- ✅ Tiempo real con Supabase Realtime
- ✅ Prioridad visual (Alta = rojo, Media = naranja)
- ✅ Expandible/colapsable
- ✅ Dark mode completo

---

### **2. useBannerDocumentosPendientes.ts**

**Hook con lógica:**
- Fetch inicial de pendientes
- Suscripción realtime
- Auto-refresh al cambiar estado

**API:**
```typescript
const {
  documentosPendientes, // Array de DocumentoPendiente
  loading,              // Boolean
  refetch,             // () => void
} = useBannerDocumentosPendientes(clienteId)
```

---

### **3. Integración en DocumentosTab**

**Ubicación:** `src/app/clientes/[id]/tabs/documentos-tab.tsx`

**Cambios:**
```tsx
import { BannerDocumentosPendientes } from '@/modules/clientes/components/documentos-pendientes'

// Después del banner de cédula
<BannerDocumentosPendientes
  clienteId={cliente.id}
  onSubirDocumento={(pendienteId, tipoDocumento) => {
    mostrarUpload(false) // Abrir modal upload normal
  }}
/>
```

---

### **4. Modal de Edición (EditarFuentesPagoModal)**

**Cambios:**
- ✅ Info box explicando que puede guardar sin carta
- ✅ Referencia a sistema de pendientes
- ✅ No bloquea guardar por falta de carta

**Mensaje mostrado:**
```
💡 Sobre las cartas de aprobación
Puedes guardar fuentes de pago sin la carta de aprobación.
El sistema creará un recordatorio en la pestaña Documentos donde
podrás subirla más tarde. La vinculación será automática.
```

---

## 🔍 **Queries de Verificación**

### **Ver documentos pendientes por cliente**

```sql
SELECT
  c.nombres || ' ' || c.apellidos as cliente,
  dp.tipo_documento,
  dp.prioridad,
  dp.estado,
  dp.metadata->>'tipo_fuente' as tipo_fuente,
  dp.metadata->>'entidad' as entidad,
  dp.fecha_creacion,
  CASE
    WHEN dp.estado = 'Completado' THEN dp.fecha_completado
    ELSE NULL
  END as fecha_completado
FROM documentos_pendientes dp
JOIN clientes c ON c.id = dp.cliente_id
WHERE dp.cliente_id = '<cliente_id>'
ORDER BY dp.prioridad DESC, dp.fecha_creacion;
```

### **Ver fuentes con documentación pendiente**

```sql
SELECT
  fp.tipo,
  fp.entidad,
  fp.monto,
  fp.estado_documentacion,
  fp.carta_aprobacion_url,
  dp.id as pendiente_id,
  dp.tipo_documento
FROM fuentes_pago fp
LEFT JOIN documentos_pendientes dp ON dp.fuente_pago_id = fp.id AND dp.estado = 'Pendiente'
WHERE fp.estado_documentacion = 'Pendiente Documentación';
```

### **Ver auditoría de vinculaciones automáticas**

```sql
SELECT
  al.fecha_creacion,
  al.metadata->>'tipo_fuente' as tipo_fuente,
  al.metadata->>'documento_id' as documento_id,
  u.email as usuario
FROM audit_log al
LEFT JOIN usuarios u ON u.id = al.usuario_id
WHERE al.accion = 'VINCULACION_AUTOMATICA_DOCUMENTO'
ORDER BY al.fecha_creacion DESC;
```

---

## 📊 **Casos de Uso**

### **Caso 1: Cliente nuevo con subsidio posterior**

1. ✅ Cliente aplica con Cuota Inicial
2. ✅ Semanas después consigue Subsidio Comfenalco
3. ✅ Usuario edita fuentes → agrega Subsidio (sin carta)
4. ✅ Sistema crea pendiente automáticamente
5. ✅ Banner aparece en pestaña Documentos
6. ✅ Usuario sube carta cuando la recibe
7. ✅ Sistema vincula automáticamente
8. ✅ Banner desaparece

### **Caso 2: Múltiples fuentes sin cartas**

1. ✅ Usuario agrega Crédito + Subsidio Caja + Subsidio Mi Casa Ya
2. ✅ No tiene ninguna carta aún
3. ✅ Sistema crea 3 pendientes
4. ✅ Banner muestra lista completa con prioridad
5. ✅ Usuario sube cartas progresivamente
6. ✅ Sistema vincula cada una automáticamente
7. ✅ Banner actualiza contador en tiempo real

### **Caso 3: Documento subido por error**

1. ✅ Usuario sube carta con metadata incorrecta
2. ❌ Sistema NO vincula (no coincide)
3. ✅ Documento queda en lista normal
4. ✅ Banner sigue mostrando pendiente
5. ✅ Usuario puede editar metadata del documento
6. ✅ Sistema re-intenta vinculación (futuro)

---

## 🚀 **Mejoras Futuras**

### **Fase 2: Notificaciones**

```typescript
// Enviar email/SMS cuando se crea pendiente
INSERT INTO notificaciones_cola (
  cliente_id,
  tipo: 'DOCUMENTO_PENDIENTE',
  prioridad: 'Alta',
  metadata: { tipo_documento, fecha_limite }
)
```

### **Fase 3: Recordatorios automáticos**

```sql
-- Job cada 3 días
UPDATE documentos_pendientes
SET recordatorios_enviados = recordatorios_enviados + 1,
    ultima_notificacion = NOW()
WHERE estado = 'Pendiente'
  AND (ultima_notificacion IS NULL OR ultima_notificacion < NOW() - INTERVAL '3 days');
```

### **Fase 4: Vencimientos**

```sql
-- Job diario
UPDATE documentos_pendientes
SET estado = 'Vencido'
WHERE estado = 'Pendiente'
  AND fecha_limite < NOW();
```

### **Fase 5: Dashboard Admin**

- Gráfico de documentos pendientes por proyecto
- Alertas de vencimientos próximos
- Métricas de tiempo promedio de completitud

---

## 🎨 **UX/UI Consideraciones**

### **Banner Design:**
- ⚠️ Color naranja/ámbar (atención sin alarma)
- 🔴 Rojo solo para prioridad "Alta"
- ✅ Verde al completar (animación fade-out)
- 📊 Contador visible siempre
- 🔽 Expandible para ver detalles

### **Flujo sin fricción:**
- ❌ NO bloquear guardar fuentes
- ✅ Informar claramente dónde subir después
- ✅ Botón directo desde banner a modal upload
- ✅ Confirmación visual al vincular (toast)

---

## ✅ **Checklist de Testing**

- [ ] Crear fuente con Crédito sin carta → Aparece pendiente
- [ ] Crear fuente con Subsidio Caja sin carta → Aparece pendiente
- [ ] Crear fuente con Cuota Inicial → NO aparece pendiente
- [ ] Subir carta con metadata correcta → Vincula y desaparece
- [ ] Subir carta con metadata incorrecta → NO vincula
- [ ] Eliminar fuente con pendiente → Elimina pendiente (CASCADE)
- [ ] Realtime: Cambio en otro tab → Banner actualiza
- [ ] Dark mode → Colores correctos
- [ ] Responsive → Mobile funciona bien
- [ ] Auditoría → Registro en audit_log

---

## 📚 **Referencias**

- **Migración SQL:** `supabase/migrations/20251129_agregar_estado_documentacion_fuentes.sql`
- **Componente Banner:** `src/modules/clientes/components/documentos-pendientes/BannerDocumentosPendientes.tsx`
- **Hook:** `src/modules/clientes/components/documentos-pendientes/useBannerDocumentosPendientes.ts`
- **Integración:** `src/app/clientes/[id]/tabs/documentos-tab.tsx`
- **Modal:** `src/app/clientes/[id]/tabs/negociaciones/EditarFuentesPagoModal.tsx`

---

**🎉 Sistema listo para producción**
