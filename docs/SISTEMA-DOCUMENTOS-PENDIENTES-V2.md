# 🎯 SISTEMA COMPLETO DE DOCUMENTOS PENDIENTES PARA FUENTES DE PAGO

## ✅ IMPLEMENTACIÓN COMPLETADA

**Fecha:** 17 de diciembre de 2025
**Objetivo:** Sistema colapsable para mostrar TODOS los documentos requeridos de fuentes de pago (no solo cartas de aprobación)

---

## 📋 LO QUE SE IMPLEMENTÓ

### 1. **Migración SQL Completa** ✅

**Archivo:** `supabase/migrations/20251217_expandir_documentos_pendientes_fuentes.sql`

**Cambios:**

#### a) Trigger Mejorado
- **Antes:** Solo creaba pendiente para "Carta de Aprobación"
- **Ahora:** Crea pendientes para TODOS los documentos en `requisitos_fuentes_pago_config`
- **Lógica:**
  - Al crear fuente → Query a `requisitos_fuentes_pago_config`
  - Por cada requisito activo → Verificar si ya existe documento
  - Si NO existe → Crear pendiente con prioridad según nivel

```sql
-- Función nueva: crear_documentos_pendientes_fuente_completos()
-- Recorre requisitos_fuentes_pago_config
-- Crea pendiente por cada documento faltante
-- Prioridad: Alta para obligatorios, Media para opcionales
```

#### b) Vinculación Mejorada
- **PRIORIDAD 1:** Vinculación directa por UUID (`fuente_pago_relacionada`)
- **PRIORIDAD 2:** Fallback a detección por metadata (método anterior)
- **Ventaja:** Vinculación más precisa y confiable

```sql
-- Función: vincular_documento_subido_a_pendiente_mejorado()
-- 1. Busca por fuente_pago_relacionada (UUID explícito)
-- 2. Si no encuentra, busca por metadata (tipo_fuente + entidad)
```

#### c) Función Helper
```sql
-- regenerar_pendientes_fuente(fuente_id UUID)
-- Útil para regenerar pendientes de fuentes existentes
-- Detecta documentos ya subidos y no crea duplicados
```

#### d) Migración de Datos
- Se ejecutó regeneración automática para fuentes existentes
- Creó pendientes faltantes sin duplicar

---

### 2. **Componente Colapsable Nuevo** ✅

**Archivo:** `src/modules/clientes/components/documentos-pendientes/SeccionDocumentosPendientes.tsx`

**Características:**

#### UX No Invasiva
```tsx
// Estado colapsado (por defecto)
┌──────────────────────────────────────────────────────┐
│ ⚠️ Tienes 6 documentos pendientes [▼]                │
└──────────────────────────────────────────────────────┘
// Solo 1 línea discreta
```

#### Expandible con Detalles
```tsx
// Al expandir
┌──────────────────────────────────────────────────────┐
│ ⚠️ Documentos Pendientes (6) [▲ Ocultar]             │
├──────────────────────────────────────────────────────┤
│ 🏦 Crédito Hipotecario - Davivienda                  │
│ ├─ 📋 Carta de aprobación (OBLIGATORIO) [Subir]    │
│ ├─ 📄 Extracto bancario (OBLIGATORIO) [Subir]      │
│ └─ 📄 Certificado ingresos (Opcional) [Subir]      │
│                                                       │
│ 🏠 Mi Casa Ya - Comfandi                             │
│ └─ 📋 Certificado Comfandi (OBLIGATORIO) [Subir]   │
└──────────────────────────────────────────────────────┘
```

#### Funcionalidades

1. **Agrupación por Fuente**
   - Documentos organizados por fuente de pago
   - Header con tipo e entidad financiera
   - Contador de pendientes vs completados

2. **Badges Visuales**
   - 🔴 Rojo para OBLIGATORIO
   - 🔵 Azul para Opcional
   - Badge en header con total obligatorios

3. **Botones Directos**
   - Botón [Subir] por documento
   - Abre modal pre-llenado con metadata
   - Vinculación automática a fuente

4. **Animaciones Suaves**
   - Framer Motion para expand/collapse
   - Hover effects en items
   - Pulse animation en contador

---

### 3. **Integración en Documentos Tab** ✅

**Archivo:** `src/app/clientes/[id]/tabs/documentos-tab.tsx`

**Cambios:**

```tsx
// ANTES
import { BannerDocumentosPendientes } from '...'
<BannerDocumentosPendientes ... />

// AHORA
import { SeccionDocumentosPendientes } from '...'
<SeccionDocumentosPendientes ... />
```

**Comportamiento:**
- Reemplaza banner anterior
- Colapsado por defecto (no invasivo)
- Mantiene misma funcionalidad de subir documentos
- Compatible con modal de cartas y modal genérico

---

## 🎯 FLUJO COMPLETO

### Escenario: Usuario crea fuente "Crédito Hipotecario"

1. **Creación de Fuente**
   ```sql
   INSERT INTO fuentes_pago (...) VALUES (...)
   → Trigger: crear_documentos_pendientes_fuente_completos()
   ```

2. **Sistema Consulta Requisitos**
   ```sql
   SELECT * FROM requisitos_fuentes_pago_config
   WHERE tipo_fuente_id = '...'
     AND activo = true
   ```

3. **Crea Pendientes**
   ```
   Inserta en documentos_pendientes:
   - Carta de aprobación (OBLIGATORIO)
   - Extracto bancario (OBLIGATORIO)
   - Certificado ingresos (OBLIGATORIO)
   - Cédula titular (OPCIONAL)
   ```

4. **Usuario Va a Documentos**
   ```
   Ve componente:
   "⚠️ Tienes 4 documentos pendientes [▼]"
   ```

5. **Expande y Ve Lista**
   ```
   🏦 Crédito Hipotecario - Davivienda
   ├─ Carta de aprobación [Subir] ← Click
   ```

6. **Modal Se Abre Pre-llenado**
   ```tsx
   {
     fuente_pago_relacionada: 'uuid-credito',
     tipo_documento: 'Carta de aprobación',
     categoria_id: '...'
   }
   ```

7. **Usuario Sube Archivo**
   ```sql
   INSERT INTO documentos_cliente (
     fuente_pago_relacionada: 'uuid-credito', ← UUID explícito
     ...
   )
   → Trigger: vincular_documento_subido_a_pendiente_mejorado()
   ```

8. **Sistema Detecta y Vincula**
   ```sql
   UPDATE documentos_pendientes
   SET estado = 'Completado'
   WHERE fuente_pago_id = 'uuid-credito'
     AND tipo_documento = '...'
   ```

9. **UI Se Actualiza**
   ```
   React Query invalida cache
   → Componente re-renderiza
   → Item desaparece de lista
   → Contador actualiza: "3 pendientes"
   ```

---

## 🔧 VENTAJAS DEL SISTEMA

### 1. **No Invasivo**
- Colapsado por defecto
- Solo 1 línea visible
- Usuario decide cuándo ver detalles

### 2. **Completo**
- Muestra TODOS los requisitos (no solo cartas)
- Agrupado por fuente
- Diferencia obligatorios vs opcionales

### 3. **Vinculación Precisa**
- Prioridad a UUID explícito
- Fallback a metadata
- Menos errores de detección

### 4. **Escalable**
- Agregar requisito en admin → Automáticamente aparece
- No hardcodear lógica
- Configuración centralizada

### 5. **Profesional**
- Animaciones suaves
- Feedback visual claro
- UX intuitivo

---

## 📊 DATOS TÉCNICOS

### Tablas Involucradas
1. `documentos_pendientes` - Registros de pendientes
2. `requisitos_fuentes_pago_config` - Configuración de requisitos
3. `fuentes_pago` - Fuentes del cliente
4. `documentos_cliente` - Documentos subidos

### Triggers Activos
1. `trigger_crear_documento_pendiente` - Al INSERT en fuentes_pago
2. `trigger_vincular_documento_automatico` - Al INSERT en documentos_cliente

### React Query Keys
- `['documentos-pendientes', clienteId]` - Pendientes por cliente
- Invalidación automática al subir documento

---

## 🚀 PRÓXIMOS PASOS (Opcional)

### Mejoras Futuras Posibles

1. **Notificaciones Push**
   ```typescript
   // Cuando pendiente > 7 días sin subir
   // Enviar recordatorio por email/SMS
   ```

2. **Progreso Visual**
   ```tsx
   // Barra de progreso: "3/7 documentos completados"
   // Por fuente individual
   ```

3. **Filtros**
   ```tsx
   // Filtrar por: Obligatorios | Opcionales | Por Fuente
   // Ordenar por: Prioridad | Fecha límite
   ```

4. **Dashboard Admin**
   ```tsx
   // Ver clientes con más pendientes
   // Alertas de documentos críticos
   ```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [x] Migración SQL ejecutada
- [x] Trigger ampliado a todos los requisitos
- [x] Vinculación mejorada con prioridad UUID
- [x] Componente colapsable creado
- [x] Integración en documentos-tab
- [x] Barrel export actualizado
- [x] Verificación SQL ejecutada
- [x] Limpieza de pendientes obsoletos
- [x] Documentación completa

---

## 🎉 RESULTADO FINAL

### ANTES
- Banner grande y fijo
- Solo mostraba cartas de aprobación
- 1 documento por fuente

### AHORA
- Componente colapsable discreto
- Muestra TODOS los requisitos configurados
- Agrupado por fuente
- 4-7 documentos por fuente (según config)
- UX profesional y escalable

---

## 📝 NOTAS IMPORTANTES

1. **Campo `fuente_pago_relacionada` es CRÍTICO**
   - Siempre llenar al subir documento de fuente
   - Permite vinculación precisa
   - Evita falsos positivos

2. **Configuración en Admin**
   - Requisitos se gestionan en `/admin/requisitos-fuentes`
   - Cambios se reflejan automáticamente
   - No require código adicional

3. **Compatible con Sistema Anterior**
   - Banner antiguo sigue existiendo (por si se necesita)
   - Puede coexistir o reemplazarse completamente
   - Migration no afecta datos existentes

---

**Implementado por:** GitHub Copilot
**Versión:** 2.0.0
**Estado:** ✅ Producción Ready
