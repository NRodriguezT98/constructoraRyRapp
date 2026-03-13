# 🎯 Sistema de Validación de Requisitos por Fuente de Pago

## 📋 Descripción General

Sistema modular just-in-time que valida requisitos de documentación por tipo de fuente de pago antes de permitir desembolsos. **NO es intrusivo** - solo genera pendientes tempranos para documentos necesarios en etapas iniciales (carta de aprobación).

---

## 🏗️ Arquitectura

### **Estrategia: Validación por Etapas**

```
┌──────────────────────────────────────────────────────┐
│ ETAPA 1: Creación de Fuente (temprano)              │
│ ✅ Generar pendiente: Carta de Aprobación           │
│ ❌ NO generar: Boleta de Registro (muy temprano)     │
└──────────────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────────────┐
│ ETAPA 2: Visualización en Tab Fuentes (informativo) │
│ 📊 Semáforo visual por fuente                        │
│    🟢 Lista para desembolso                          │
│    🟡 Advertencia (solo opcionales faltantes)        │
│    🔴 Bloqueada (obligatorios faltantes)             │
└──────────────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────────────┐
│ ETAPA 3: Intento de Desembolso (just-in-time)       │
│ ⚡ Validación en tiempo real                         │
│ 🚫 Bloqueo si falta obligatorio                      │
│ ⚠️ Advertencia si falta opcional                     │
└──────────────────────────────────────────────────────┘
```

---

## 🗄️ Base de Datos

### **Tabla: `fuentes_pago_requisitos_config`** (Catálogo)

Define qué documentos requiere cada tipo de fuente.

```sql
CREATE TABLE fuentes_pago_requisitos_config (
  id UUID PRIMARY KEY,
  tipo_fuente TEXT NOT NULL,           -- 'Crédito Hipotecario', 'Subsidio Mi Casa Ya', etc.
  tipo_documento TEXT NOT NULL,         -- 'Carta de Aprobación', 'Boleta de Registro', etc.
  es_obligatorio BOOLEAN DEFAULT true,  -- true = bloquea desembolso
  orden INT DEFAULT 0,                  -- Orden de presentación
  se_valida_en TEXT DEFAULT 'desembolso', -- 'creacion' | 'desembolso'
  descripcion TEXT,
  icono TEXT,                           -- Nombre del ícono Lucide
  UNIQUE(tipo_fuente, tipo_documento)
);
```

### **Configuración Inicial**

| Tipo Fuente              | Documento               | Obligatorio | Valida en   |
|--------------------------|-------------------------|-------------|-------------|
| Crédito Hipotecario      | Carta de Aprobación     | ✅ Sí       | Creación    |
| Crédito Hipotecario      | Boleta de Registro      | ✅ Sí       | Desembolso  |
| Crédito Hipotecario      | Solicitud Desembolso    | ❌ No       | Desembolso  |
| Subsidio Mi Casa Ya      | Carta de Aprobación     | ✅ Sí       | Creación    |
| Subsidio Mi Casa Ya      | Boleta de Registro      | ✅ Sí       | Desembolso  |
| Subsidio Caja Comp.      | Carta de Aprobación     | ✅ Sí       | Creación    |
| Subsidio Caja Comp.      | Boleta de Registro      | ✅ Sí       | Desembolso  |

---

## ⚙️ Funciones PostgreSQL

### **`validar_requisitos_desembolso(fuente_pago_id)`**

Valida si una fuente cumple requisitos para desembolso.

**Retorna:**
```typescript
{
  cumple_requisitos: boolean        // NO hay obligatorios faltantes
  puede_continuar: boolean          // Mismo que cumple_requisitos
  total_requisitos: number
  requisitos_completados: number
  obligatorios_faltantes: number    // 🚫 Si > 0, bloquea desembolso
  opcionales_faltantes: number      // ⚠️ Solo advertencia
  documentos_faltantes: RequisitoDocumento[]
  documentos_completados: DocumentoCompletado[]
}
```

### **`obtener_estado_documentacion_fuente(fuente_pago_id)`**

Obtiene estado general con progreso.

**Retorna:**
```typescript
{
  fuente_pago_id: string
  tipo_fuente: string
  entidad: string
  estado_general: 'completo' | 'advertencia' | 'bloqueado'
  progreso_porcentaje: number       // 0-100
  validacion: ValidacionRequisitos  // Objeto completo
}
```

---

## 🎨 Componentes Frontend

### **`EstadoDocumentacionFuenteCard`** (Nuevo ⭐)

Card compacto con semáforo visual.

**Props:**
```typescript
interface Props {
  fuentePagoId: string
  onSubirDocumento?: (requisito: RequisitoDocumento) => void
  compact?: boolean
}
```

**Features:**
- 🎨 Semáforo de estado (verde/amarillo/rojo)
- 📊 Barra de progreso animada
- 📋 Lista de documentos faltantes con indicador obligatorio/opcional
- 🔄 Actualización en tiempo real (Supabase Realtime)
- 🌙 Dark mode completo
- 📱 Diseño responsive compacto

**Uso:**
```tsx
import { EstadoDocumentacionFuenteCard } from '@/modules/fuentes-pago/components'

<EstadoDocumentacionFuenteCard
  fuentePagoId={fuente.id}
  onSubirDocumento={(requisito) => {
    // Abrir modal de upload con metadata:
    // { fuente_pago_id: x, tipo_documento: requisito.tipo_documento }
  }}
/>
```

---

## 🪝 Hooks con React Query

### **`useEstadoDocumentacionFuente(fuentePagoId)`**

Hook principal con cache y tiempo real.

```typescript
const {
  estado,       // EstadoDocumentacionFuente
  loading,      // boolean
  error,        // Error | null
  refetch       // () => Promise<void>
} = useEstadoDocumentacionFuente(fuenteId)
```

**Features:**
- ✅ Cache de 30 segundos (staleTime)
- ✅ Revalidación automática con Supabase Realtime
- ✅ Retry automático (2 intentos)
- ✅ TypeScript strict

### **`useValidacionRequisitos(fuentePagoId)`**

Hook simplificado solo para validación rápida.

```typescript
const {
  validacion,         // ValidacionRequisitos
  cumpleRequisitos,   // boolean (shortcut)
  puedeDesembolsar,   // boolean (shortcut)
  loading
} = useValidacionRequisitos(fuenteId)
```

---

## 🔄 Flujo Completo del Usuario

### **1. Crear Fuente de Pago**
```
Usuario asigna vivienda con fuentes
    ↓
Trigger: crear_documento_pendiente_automatico
    ↓
SOLO crea pendiente de "Carta de Aprobación"
    ↓
Banner muestra pendiente (NO intrusivo)
```

### **2. Visualizar Estado en UI**
```
Usuario entra a tab "Fuentes de Pago"
    ↓
Hook: useEstadoDocumentacionFuente (React Query)
    ↓
Muestra semáforo:
  🟢 Completo → Puede desembolsar
  🟡 Advertencia → Puede desembolsar (sin opcionales)
  🔴 Bloqueado → NO puede desembolsar
```

### **3. Intentar Registrar Desembolso**
```
Usuario hace clic en "Registrar Desembolso"
    ↓
Validación: validar_requisitos_desembolso()
    ↓
SI falta obligatorio:
  → Modal bloqueo con lista de faltantes
  → Botón "Subir Documentos"
    ↓
SI solo falta opcional:
  → AlertDialog de advertencia
  → Botón "Continuar de todas formas"
    ↓
TODO OK:
  → Abre modal de desembolso normal
```

---

## 📦 Instalación y Configuración

### **Paso 1: Ejecutar Migraciones SQL**

```bash
# 1. Sistema de validación de requisitos
npm run db:exec supabase/migrations/20251212_sistema_validacion_requisitos_fuentes.sql

# 2. Actualizar trigger (solo carta temprana)
npm run db:exec supabase/migrations/20251212_actualizar_trigger_documentos_pendientes.sql
```

### **Paso 2: Verificar en Supabase**

```sql
-- Ver configuración insertada
SELECT tipo_fuente, COUNT(*) AS requisitos
FROM fuentes_pago_requisitos_config
GROUP BY tipo_fuente;

-- Probar validación
SELECT * FROM validar_requisitos_desembolso('UUID-DE-FUENTE');
```

### **Paso 3: Regenerar Tipos TypeScript** (opcional)

```bash
npm run types:generate
```

---

## 🎯 Ejemplos de Integración

### **Ejemplo 1: Tab Fuentes de Pago (Recomendado)**

Ver archivo completo: `src/modules/fuentes-pago/examples/integracion-validacion-requisitos.tsx`

```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* Lista de fuentes (2/3) */}
  <div className="lg:col-span-2">
    {fuentes.map(f => <FuentePagoCard key={f.id} fuente={f} />)}
  </div>

  {/* Panel de requisitos (1/3) - NUEVO ⭐ */}
  <div className="lg:col-span-1">
    <EstadoDocumentacionFuenteCard
      fuentePagoId={fuenteSeleccionada}
      onSubirDocumento={handleSubirDocumento}
    />
  </div>
</div>
```

### **Ejemplo 2: Modal de Desembolso (Validación Just-in-Time)**

```tsx
const handleAbrirModalDesembolso = async () => {
  const validacion = await FuentesPagoRequisitosService
    .validarRequisitosDesembolso(fuenteId)

  if (!validacion.puede_continuar) {
    // Mostrar modal de requisitos incompletos
    return <ModalRequisitosIncompletos
      documentosFaltantes={validacion.documentos_faltantes}
      onSubirDocumento={handleSubirDocumento}
    />
  }

  // OK, abrir modal normal
  setModalDesembolsoOpen(true)
}
```

---

## 🔐 Seguridad y Permisos

### **Row Level Security (RLS)**

```sql
-- Lectura: Todos los usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden leer requisitos"
  ON fuentes_pago_requisitos_config
  FOR SELECT TO authenticated
  USING (true);

-- Escritura: Solo administradores
CREATE POLICY "Solo admins pueden modificar requisitos"
  ON fuentes_pago_requisitos_config
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid() AND rol = 'Administrador'
    )
  );
```

---

## 🧪 Testing

### **Caso 1: Fuente con todos los documentos**

```sql
-- Insertar documentos de prueba
INSERT INTO documentos_cliente (cliente_id, tipo_documento, metadata)
VALUES
  ('cliente-id', 'Carta de Aprobación', '{"fuente_pago_id": "fuente-id"}'),
  ('cliente-id', 'Boleta de Registro', '{"fuente_pago_id": "fuente-id"}');

-- Validar
SELECT * FROM obtener_estado_documentacion_fuente('fuente-id');
-- Resultado esperado: estado_general = 'completo', progreso_porcentaje = 100
```

### **Caso 2: Fuente sin boleta (bloqueada)**

```sql
-- Solo carta, falta boleta obligatoria
SELECT * FROM validar_requisitos_desembolso('fuente-id');
-- Resultado: cumple_requisitos = false, obligatorios_faltantes = 1
```

---

## 📊 Métricas y Monitoreo

```sql
-- Dashboard: Estado global de documentación por fuentes
SELECT
  fp.tipo,
  COUNT(*) AS total_fuentes,
  COUNT(*) FILTER (WHERE estado.estado_general = 'completo') AS completas,
  COUNT(*) FILTER (WHERE estado.estado_general = 'bloqueado') AS bloqueadas
FROM fuentes_pago fp
CROSS JOIN LATERAL obtener_estado_documentacion_fuente(fp.id) AS estado
GROUP BY fp.tipo;
```

---

## 🚀 Roadmap Futuro

- [ ] **Notificaciones automáticas** cuando falta X días para vencimiento de carta
- [ ] **Dashboard admin** de estado global de documentación
- [ ] **Webhooks** para integración con sistemas bancarios
- [ ] **OCR automático** para extraer datos de cartas de aprobación
- [ ] **Recordatorios por email** de documentos pendientes

---

## 📚 Referencias

- **Migraciones SQL:** `supabase/migrations/20251212_*.sql`
- **Service:** `src/modules/fuentes-pago/services/requisitos.service.ts`
- **Hook:** `src/modules/fuentes-pago/hooks/useEstadoDocumentacionFuente.ts`
- **Componente:** `src/modules/fuentes-pago/components/EstadoDocumentacionFuenteCard.tsx`
- **Ejemplo:** `src/modules/fuentes-pago/examples/integracion-validacion-requisitos.tsx`

---

## ✅ Ventajas del Sistema

| Aspecto | Beneficio |
|---------|-----------|
| **UX** | No intrusivo, validación just-in-time |
| **Performance** | Cache con React Query + Supabase Realtime |
| **Seguridad** | Validación en DB (imposible bypassear) |
| **Escalabilidad** | Agregar requisitos = insert en tabla config |
| **Mantenibilidad** | Separación de responsabilidades estricta |
| **Auditabilidad** | Sistema de audit_log registra todo |
| **Type-safe** | TypeScript + tipos generados de Supabase |

---

**Fecha de creación:** 2025-12-12
**Versión:** 1.0.0
**Autor:** GitHub Copilot (Claude Sonnet 4.5)
