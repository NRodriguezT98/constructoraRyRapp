# 🏗️ Análisis Arquitectónico: Sistema de Documentos Pendientes

## 🚨 Problema Actual (Implementación Parcial)

### ❌ **Lo Que Está Mal:**

```
┌─────────────────────────────────────────────────────────────┐
│ FLUJO ACTUAL (ROTO)                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Usuario crea fuente_pago                                │
│     ↓                                                       │
│  2. ❓ ¿Quién crea el documento_pendiente?                  │
│     → NO hay trigger en fuentes_pago                        │
│     → Frontend debe crear manualmente                       │
│     → SI FALLA → No hay pendiente, no hay alerta           │
│                                                             │
│  3. Usuario sube documento                                  │
│     ↓                                                       │
│  4. ✅ Trigger vincula automáticamente (AHORA SÍ FUNCIONA)  │
│     → Completa pendiente                                    │
│     → Actualiza fuente_pago                                 │
│                                                             │
│  PROBLEMA: Paso 2 depende de Frontend (NO GARANTIZADO)     │
└─────────────────────────────────────────────────────────────┘
```

### 🔴 **Problemas Identificados:**

1. **No hay trigger que cree `documentos_pendientes` automáticamente** cuando se inserta `fuentes_pago` sin carta
2. **Frontend puede olvidar crear el pendiente** → Usuario no ve alerta
3. **Inserción directa en BD (admin, scripts)** → Se salta creación de pendiente
4. **Lógica duplicada**: Cada módulo debe "recordar" crear pendientes

---

## ✅ Arquitectura Profesional Completa (RECOMENDADA)

### 📐 **Patrón: Event-Driven Database Triggers + Application Layer**

```sql
┌──────────────────────────────────────────────────────────────────┐
│ ARQUITECTURA PROFESIONAL (3 CAPAS)                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ CAPA 1: DATABASE TRIGGERS (Garantías a nivel BD)                │
│ ════════════════════════════════════════════════════════════════ │
│                                                                  │
│  Trigger A: crear_documento_pendiente_automatico()              │
│  ┌────────────────────────────────────────────────────┐         │
│  │ WHEN:  INSERT/UPDATE ON fuentes_pago               │         │
│  │ IF:    carta_aprobacion_url IS NULL                │         │
│  │ THEN:  INSERT INTO documentos_pendientes           │         │
│  │        - tipo_documento: 'Carta de Aprobación'     │         │
│  │        - metadata: { fuente_pago_id, tipo, entidad }│        │
│  │        - estado: 'Pendiente'                       │         │
│  │        - prioridad: 'Alta' (si monto > 10M)        │         │
│  └────────────────────────────────────────────────────┘         │
│                                                                  │
│  Trigger B: vincular_documento_pendiente_automatico()           │
│  ┌────────────────────────────────────────────────────┐         │
│  │ WHEN:  INSERT ON documentos_cliente                │         │
│  │ IF:    metadata->>'fuente_pago_id' EXISTS          │         │
│  │ THEN:  1. UPDATE fuentes_pago                      │         │
│  │           SET carta_aprobacion_url = NEW.url       │         │
│  │        2. UPDATE documentos_pendientes             │         │
│  │           SET estado = 'Completado'                │         │
│  └────────────────────────────────────────────────────┘         │
│                                                                  │
│ CAPA 2: APPLICATION SERVICES (Lógica de negocio enriquecida)    │
│ ════════════════════════════════════════════════════════════════ │
│                                                                  │
│  FuentePagoService.crear()                                      │
│  ┌────────────────────────────────────────────────────┐         │
│  │ 1. INSERT fuentes_pago (sin carta_aprobacion_url)  │         │
│  │    → Trigger A crea documentos_pendientes AUTO     │         │
│  │                                                     │         │
│  │ 2. (Opcional) Enviar email recordatorio            │         │
│  │    → "Recuerda subir carta de aprobación"          │         │
│  │                                                     │         │
│  │ 3. (Opcional) Programar reminder en 7 días         │         │
│  │    → Notificación push si sigue pendiente          │         │
│  └────────────────────────────────────────────────────┘         │
│                                                                  │
│  DocumentoService.subir()                                       │
│  ┌────────────────────────────────────────────────────┐         │
│  │ 1. INSERT documentos_cliente (con metadata)        │         │
│  │    → Trigger B vincula y completa AUTO             │         │
│  │                                                     │         │
│  │ 2. (Opcional) Enviar confirmación email            │         │
│  │    → "Documento vinculado exitosamente"            │         │
│  │                                                     │         │
│  │ 3. (Opcional) Cancelar reminders programados       │         │
│  └────────────────────────────────────────────────────┘         │
│                                                                  │
│ CAPA 3: UI COMPONENTS (Presentación reactiva)                   │
│ ════════════════════════════════════════════════════════════════ │
│                                                                  │
│  BannerDocumentosPendientes                                     │
│  ┌────────────────────────────────────────────────────┐         │
│  │ - Suscripción Realtime a documentos_pendientes     │         │
│  │ - Muestra alertas automáticamente                  │         │
│  │ - Desaparece cuando trigger completa                │         │
│  └────────────────────────────────────────────────────┘         │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Implementación: Trigger Faltante (CRÍTICO)

### **Trigger A: Crear Pendiente Automáticamente**

```sql
-- ============================================
-- TRIGGER: Crear documento pendiente cuando fuente_pago NO tiene carta
-- ============================================

CREATE OR REPLACE FUNCTION crear_documento_pendiente_automatico()
RETURNS TRIGGER AS $$
DECLARE
  v_categoria_carta_id UUID;
  v_prioridad TEXT;
BEGIN
  -- Solo crear pendiente si NO tiene carta de aprobación
  IF NEW.carta_aprobacion_url IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Determinar prioridad según monto
  IF NEW.monto_aprobado > 10000000 THEN
    v_prioridad := 'Alta';
  ELSIF NEW.monto_aprobado > 5000000 THEN
    v_prioridad := 'Media';
  ELSE
    v_prioridad := 'Normal';
  END IF;

  -- Obtener ID de categoría "Carta de Aprobación" (desde categorias_documentos)
  -- Si no existe, usar NULL (el sistema debe permitirlo)
  SELECT id INTO v_categoria_carta_id
  FROM categorias_documentos
  WHERE nombre = 'Carta de Aprobación'
  LIMIT 1;

  -- Crear documento pendiente
  INSERT INTO documentos_pendientes (
    fuente_pago_id,
    cliente_id,
    tipo_documento,
    categoria_id,
    metadata,
    estado,
    prioridad,
    fecha_limite
  )
  SELECT
    NEW.id,                           -- fuente_pago_id
    n.cliente_id,                     -- cliente_id desde negociacion
    'Carta de Aprobación',            -- tipo_documento
    v_categoria_carta_id,             -- categoria_id
    jsonb_build_object(
      'tipo_fuente', NEW.tipo,
      'entidad', NEW.entidad,
      'monto_aprobado', NEW.monto_aprobado,
      'negociacion_id', NEW.negociacion_id,
      'creado_automaticamente', true
    ),
    'Pendiente',                      -- estado
    v_prioridad,                      -- prioridad
    CURRENT_DATE + INTERVAL '15 days' -- fecha_limite (15 días)
  FROM negociaciones n
  WHERE n.id = NEW.negociacion_id;

  -- Registrar en auditoría
  INSERT INTO audit_log (
    tabla,
    accion,
    registro_id,
    usuario_email,
    metadata
  ) VALUES (
    'documentos_pendientes',
    'INSERT',
    (SELECT id FROM documentos_pendientes
     WHERE fuente_pago_id = NEW.id
     ORDER BY fecha_creacion DESC
     LIMIT 1)::TEXT,
    COALESCE(auth.email(), 'sistema'),
    jsonb_build_object(
      'trigger', 'crear_documento_pendiente_automatico',
      'fuente_pago_id', NEW.id,
      'tipo_fuente', NEW.tipo,
      'prioridad', v_prioridad
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger en INSERT y UPDATE
CREATE TRIGGER trigger_crear_documento_pendiente
  AFTER INSERT OR UPDATE OF carta_aprobacion_url ON fuentes_pago
  FOR EACH ROW
  EXECUTE FUNCTION crear_documento_pendiente_automatico();
```

---

## 📊 Comparación de Arquitecturas

| Aspecto | ❌ Solo Frontend | ⚠️ Trigger Parcial (Actual) | ✅ Triggers Completos |
|---------|-----------------|----------------------------|---------------------|
| **Garantía de creación** | NO (puede fallar) | NO (depende de frontend) | SÍ (siempre se crea) |
| **Consistencia BD** | Baja | Media | Alta |
| **Inserción directa SQL** | ❌ Se salta pendiente | ❌ Se salta pendiente | ✅ Crea automático |
| **Vinculación automática** | NO | ✅ SÍ (después de fix) | ✅ SÍ |
| **Auditoría completa** | Parcial | Parcial | Completa |
| **Notificaciones** | Frontend | Frontend | Frontend (opcional) |
| **Complejidad** | Baja | Media | Alta (pero robusta) |

---

## 🎯 Recomendación Final

### ✅ **Implementar Arquitectura Completa en 3 Fases:**

**FASE 1 (CRÍTICO - Hacer YA):**
```bash
# Crear trigger faltante
node ejecutar-sql.js supabase/migrations/20251204_trigger_crear_pendiente_auto.sql
```

**FASE 2 (Opcional - UX Mejorado):**
- Sistema de notificaciones por email
- Recordatorios programados (usando Supabase Edge Functions)
- Dashboard de documentos pendientes con filtros

**FASE 3 (Escalabilidad):**
- Workflow engine para documentos complejos
- OCR automático para validar contenido de cartas
- IA para extraer metadata de PDFs

---

## 🚫 Alternativas NO Recomendadas

### ❌ **Opción 1: Solo Lógica en Frontend**
```typescript
// ❌ NO HACER ESTO
async function crearFuentePago(data) {
  const fuente = await supabase.from('fuentes_pago').insert(data)

  // PROBLEMA: Si esta línea falla, no hay alerta
  await supabase.from('documentos_pendientes').insert({
    fuente_pago_id: fuente.id,
    // ...
  })
}
```

**Problemas:**
- ❌ No funciona con inserción directa en BD
- ❌ Código duplicado en múltiples módulos
- ❌ Si falla insert de pendiente, no hay rollback de fuente

### ❌ **Opción 2: Stored Procedure con Llamada Manual**
```sql
-- ❌ NO RECOMENDADO
CREATE PROCEDURE crear_fuente_con_pendiente(...)
AS $$
  INSERT INTO fuentes_pago ...
  INSERT INTO documentos_pendientes ...
$$;
```

**Problemas:**
- ❌ Requiere cambiar TODOS los inserts existentes
- ❌ No cubre UPDATE (cambio de estado documentación)
- ❌ Más complejo de mantener que trigger

---

## ✅ Conclusión: Tu Instinto es Correcto

**El trigger ES la forma profesional**, pero necesitas **ambos triggers**:

1. ✅ **Trigger Crear** (FALTA) → Cuando se crea fuente_pago sin carta
2. ✅ **Trigger Vincular** (YA EXISTE) → Cuando se sube documento

**Estado Actual:**
- Tienes el 50% implementado
- Necesitas completar con trigger de creación
- La arquitectura base es correcta

**¿Procedo a crear el Trigger A faltante?**
