# 🔐 Sistema de Validación Automática de Documentos

## 🎯 Problema Resuelto

**Antes**: No había validación de documentos obligatorios → Podían registrar desembolsos sin respaldo documental.

**Ahora**:
- ✅ Vinculación automática documento ↔ paso
- ✅ Bloqueo de desembolsos si falta documento obligatorio
- ✅ Invalidación automática al eliminar documento
- ✅ Notificaciones visuales de faltantes
- ✅ Sistema de documentos pendientes integrado

---

## 📐 Arquitectura del Sistema

### 1. Base de Datos

```
pasos_fuente_pago
├── documento_id (UUID) ← NUEVA COLUMNA
│   └── Vincula con documentos_proyecto
├── completado (BOOLEAN)
├── nivel_validacion (ENUM)
└── fecha_completado (TIMESTAMPTZ)

documentos_proyecto
├── id (UUID)
├── entidad_tipo (TEXT) = 'cliente'
├── entidad_id (UUID) = cliente_id
├── tipo_documento (TEXT)
└── categoria (TEXT)

requisitos_fuentes_pago_config
├── paso_identificador (TEXT)
├── tipo_documento_sugerido (TEXT)
└── categoria_documento (TEXT)
```

### 2. Flujo Automático

```
┌─────────────────────────────────────────────────────────┐
│ 1. Usuario sube documento (ej: Boleta de Registro)     │
└──────────────────┬──────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────┐
│ 2. Trigger validar_paso_con_documento()                │
│    - Busca config de requisitos                        │
│    - Coincide por tipo_documento o categoría           │
│    - Busca pasos pendientes del cliente                │
└──────────────────┬──────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Vincular automáticamente                            │
│    UPDATE pasos_fuente_pago SET                        │
│      documento_id = NEW.id,                            │
│      completado = true,                                │
│      fecha_completado = NOW()                          │
└──────────────────┬──────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────┐
│ 4. Registrar en auditoría                              │
│    INSERT INTO audit_log (vinculación automática)      │
└─────────────────────────────────────────────────────────┘
```

### 3. Flujo de Eliminación

```
┌─────────────────────────────────────────────────────────┐
│ 1. Usuario elimina documento                           │
└──────────────────┬──────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────┐
│ 2. Trigger invalidar_paso_al_eliminar_documento()      │
│    - Busca pasos vinculados a este documento           │
│    - Solo invalida si nivel = DOCUMENTO_OBLIGATORIO    │
└──────────────────┬──────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Invalidar paso                                      │
│    UPDATE pasos_fuente_pago SET                        │
│      completado = false,                               │
│      fecha_completado = NULL,                          │
│      documento_id = NULL                               │
└──────────────────┬──────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────┐
│ 4. Bloquear desembolso automáticamente                 │
│    puede_desembolsar = false                           │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Casos de Uso

### Caso 1: Subir Boleta de Registro (Feliz)

```typescript
// 1. Usuario sube documento
await subirDocumento({
  entidad_tipo: 'cliente',
  entidad_id: clienteId,
  tipo_documento: 'Boleta de Registro',
  categoria: 'escrituras',
  archivo: file
})

// ✅ Trigger automático vincula con paso pendiente
// ✅ Paso marcado como completado
// ✅ Banner de validación actualizado (verde)
// ✅ Puede registrar desembolso
```

### Caso 2: Eliminar Boleta (Error o prueba)

```typescript
// 1. Usuario elimina documento
await eliminarDocumento(documentoId)

// ⚠️ Trigger automático invalida paso
// ⚠️ Paso marcado como incompleto
// ⚠️ Banner cambia a rojo (bloqueado)
// 🚫 NO puede registrar desembolso
// 📧 Notificación: "Falta Boleta de Registro"
```

### Caso 3: Intentar Desembolsar sin Documentos

```typescript
// En modal de desembolso
const { verificarAntesDeDesembolsar } = useValidacionDesembolso(fuenteId)

const handleRegistrarDesembolso = () => {
  // ✅ Verificación previa
  if (!verificarAntesDeDesembolsar()) {
    // 🚫 Toast: "Faltan documentos obligatorios: Boleta de Registro"
    return
  }

  // Continuar con desembolso...
}
```

---

## 📊 Componentes del Sistema

### 1. Banner de Validación

```tsx
import { BannerValidacionFuente, useEstadoValidacionFuente } from '@/modules/fuentes-pago/components'

function FuentePagoCard({ fuente }) {
  const { data: estado } = useEstadoValidacionFuente(fuente.id)

  return (
    <div>
      {/* Banner si faltan documentos */}
      {estado && <BannerValidacionFuente estado={estado} onSubirDocumento={abrirModalDocumentos} />}

      {/* Resto del card */}
    </div>
  )
}
```

**Estados del Banner:**
- 🚫 **Bloqueado** (rojo): Faltan documentos obligatorios → NO puede desembolsar
- ⚠️ **Incompleto** (ámbar): Faltan documentos opcionales → SÍ puede desembolsar
- ✅ **Listo** (no se muestra): Todos completados

### 2. Hook de Validación

```tsx
import { useValidacionDesembolso } from '@/modules/fuentes-pago/hooks'

function ModalDesembolso({ fuenteId }) {
  const {
    puede_desembolsar,
    pasos_faltantes,
    verificarAntesDeDesembolsar
  } = useValidacionDesembolso(fuenteId)

  const handleSubmit = () => {
    if (!verificarAntesDeDesembolsar()) return

    // Proceder con desembolso
  }

  return (
    <div>
      {!puede_desembolsar && (
        <div className="alert alert-danger">
          Faltan: {pasos_faltantes.map(p => p.titulo).join(', ')}
        </div>
      )}

      <button onClick={handleSubmit} disabled={!puede_desembolsar}>
        Registrar Desembolso
      </button>
    </div>
  )
}
```

### 3. Vista de Estado (SQL)

```sql
-- Consultar estado de validación
SELECT * FROM vista_estado_validacion_fuentes
WHERE fuente_pago_id = 'xxx';

-- Resultado:
-- puede_desembolsar: false
-- pasos_completados: 1
-- total_pasos: 2
-- progreso_porcentaje: 50
-- estado_validacion: 'bloqueado'
-- documentos_faltantes: [{ titulo: 'Boleta de Registro', ... }]
```

---

## 🔧 Instalación

### 1. Ejecutar Migración

```bash
npm run db:exec supabase/migrations/20251211_vinculacion_documentos_pasos.sql
```

**La migración crea:**
- ✅ Columna `documento_id` en `pasos_fuente_pago`
- ✅ Trigger `validar_paso_con_documento()` (vinculación automática)
- ✅ Trigger `invalidar_paso_al_eliminar_documento()` (invalidación)
- ✅ Función `puede_registrar_desembolso()` (verificación)
- ✅ Vista `vista_estado_validacion_fuentes` (consulta optimizada)
- ✅ Función `crear_pendiente_documento_paso()` (documentos pendientes)

### 2. Usar Componentes

```tsx
// En pestaña Vivienda Asignada
import { BannerValidacionFuente } from '@/modules/fuentes-pago/components'
import { useEstadoValidacionFuente } from '@/modules/fuentes-pago/components/BannerValidacionFuente'

function ViviendaAsignadaTab() {
  const { data: estado } = useEstadoValidacionFuente(fuenteId)

  return (
    <>
      <BannerValidacionFuente
        estado={estado}
        onSubirDocumento={() => setModalDocumentosOpen(true)}
      />

      {/* Cards de fuentes */}
    </>
  )
}
```

### 3. Validar en Modal de Desembolso

```tsx
import { useValidacionDesembolso } from '@/modules/fuentes-pago/hooks'

function ModalRegistrarDesembolso({ fuenteId }) {
  const { verificarAntesDeDesembolsar } = useValidacionDesembolso(fuenteId)

  const handleGuardar = () => {
    // ✅ Verificación obligatoria
    if (!verificarAntesDeDesembolsar()) {
      return // Ya muestra toast automáticamente
    }

    // Proceder...
  }
}
```

---

## 🎨 UX del Sistema

### Estado: Bloqueado (Rojo)

```
┌──────────────────────────────────────────────────────┐
│ 🚫 Desembolso Bloqueado                              │
│ Faltan 1 documento(s) obligatorio(s) para poder     │
│ registrar el desembolso.                             │
│                                                      │
│ ┌──────────────────────────────────────────────┐   │
│ │ 📄 Boleta de Registro                        │   │
│ │    Documento expedido por la Oficina de      │   │
│ │    Registro que certifica propiedad          │   │
│ └──────────────────────────────────────────────┘   │
│                                                      │
│ [📄 Subir Documento Faltante]             0%        │
│ ▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0/2     │
└──────────────────────────────────────────────────────┘
```

### Estado: Incompleto (Ámbar)

```
┌──────────────────────────────────────────────────────┐
│ ⚠️ Validación Incompleta                             │
│ 1/2 pasos completados (50%)                          │
│                                                      │
│ ┌──────────────────────────────────────────────┐   │
│ │ 📄 Solicitud de Desembolso (Opcional)        │   │
│ │    Evidencia de solicitud de cobro           │   │
│ └──────────────────────────────────────────────┘   │
│                                                      │
│ [📄 Subir Documento Faltante]            50%        │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░  1/2     │
└──────────────────────────────────────────────────────┘
```

### Estado: Listo (Sin Banner)

*(No se muestra banner, solo indicador verde en card)*

---

## 🧪 Testing

### Test 1: Vinculación Automática

```sql
-- 1. Crear negociación y fuente de pago
-- 2. Verificar pasos creados (sin documento_id)
SELECT * FROM pasos_fuente_pago WHERE fuente_pago_id = 'xxx';

-- 3. Subir boleta de registro del cliente
INSERT INTO documentos_proyecto (...);

-- 4. Verificar vinculación automática
SELECT documento_id, completado FROM pasos_fuente_pago
WHERE paso = 'boleta_registro';
-- Debe tener documento_id vinculado ✅
```

### Test 2: Invalidación al Eliminar

```sql
-- 1. Tener paso completado con documento vinculado
-- 2. Eliminar documento
DELETE FROM documentos_proyecto WHERE id = 'xxx';

-- 3. Verificar invalidación
SELECT completado, documento_id FROM pasos_fuente_pago WHERE ...;
-- completado = false, documento_id = NULL ✅
```

### Test 3: Bloqueo de Desembolso

```sql
-- 1. Fuente con pasos obligatorios incompletos
SELECT * FROM puede_registrar_desembolso('fuente_id');
-- puede_desembolsar = false ✅

-- 2. Completar todos los obligatorios
-- 3. Verificar nuevamente
SELECT * FROM puede_registrar_desembolso('fuente_id');
-- puede_desembolsar = true ✅
```

---

## ⚡ Performance

- **Triggers**: Ejecutan en < 50ms (operaciones simples)
- **Vista materializada**: Cache de estados (consulta instantánea)
- **React Query**: Polling cada 5 segundos (actualización en tiempo real)
- **Índices**: `documento_id`, `fuente_pago_id`, `completado`

---

## 🆘 Troubleshooting

### Error: "Documento no se vincula automáticamente"

**Causa**: `tipo_documento` o `categoria` no coinciden con config

**Solución**:
```sql
-- Verificar configuración
SELECT tipo_documento_sugerido, categoria_documento
FROM requisitos_fuentes_pago_config
WHERE paso_identificador = 'boleta_registro';

-- Ajustar documento o config
```

### Error: "Paso no se invalida al eliminar"

**Causa**: `nivel_validacion != 'DOCUMENTO_OBLIGATORIO'`

**Solución**: Solo los obligatorios se invalidan (opcionales permanecen completados)

---

**Fecha**: 2025-12-11
**Autor**: Sistema
**Versión**: 1.0.0
