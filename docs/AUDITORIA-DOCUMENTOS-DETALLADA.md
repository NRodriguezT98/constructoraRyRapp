# 📋 Sistema de Auditoría Detallada para Documentos

## 🎯 Objetivo

Registrar **TODAS** las operaciones críticas sobre documentos con información **ultra detallada** para trazabilidad completa.

> **🎨 Nueva UI/UX**: Los registros de auditoría ahora se muestran con una interfaz visual profesional y amigable. Ver [AUDITORIA-DOCUMENTOS-UI-UX-MEJORADA.md](./AUDITORIA-DOCUMENTOS-UI-UX-MEJORADA.md) para detalles.

---

## ✅ Operaciones Auditadas

### 1. **REEMPLAZO DE ARCHIVO** (`reemplazarArchivoSeguro`)

**Qué se registra:**

#### 📁 Archivo Original (reemplazado)
- Nombre del archivo
- Tamaño en bytes y MB
- Tipo MIME
- **URL de descarga del backup** (válida por 1 año)
- Path del backup en Storage

#### 📁 Archivo Nuevo
- Nombre del archivo
- Tamaño en bytes y MB
- Tipo MIME
- **URL de descarga actual** (válida por 1 año)

#### ⏱️ Información de Tiempo
- Fecha de creación del documento original
- Fecha exacta del reemplazo
- Horas transcurridas desde creación
- Validación de ventana de 48 horas

#### 📊 Comparación de Tamaños
- Diferencia en bytes
- Diferencia en MB
- Porcentaje de cambio de tamaño

#### 🏗️ Contexto del Documento
- Proyecto ID
- Categoría ID
- Título del documento
- Versión
- Estado de versión actual

#### 👤 Usuario
- ID de usuario
- Email
- Timestamp exacto

#### 📝 Justificación
- Motivo del reemplazo (capturado del usuario)

**Ejemplo de metadata registrada:**
```json
{
  "tipo_operacion": "REEMPLAZO_ARCHIVO",
  "motivo_reemplazo": "Corrección de error en plano",
  "archivo_original": {
    "nombre": "plano-v1.pdf",
    "tamano_bytes": 2048576,
    "tamano_mb": "1.95",
    "tipo_mime": "application/pdf",
    "url_backup": "https://...",
    "backup_path": "proyecto-123/backups/doc-456_backup_1699123456_plano-v1.pdf"
  },
  "archivo_nuevo": {
    "nombre": "plano-v1-corregido.pdf",
    "tamano_bytes": 2156432,
    "tamano_mb": "2.06",
    "tipo_mime": "application/pdf",
    "url_actual": "https://..."
  },
  "tiempo": {
    "fecha_creacion_documento": "2025-11-15T10:00:00Z",
    "fecha_reemplazo": "2025-11-15T14:30:00Z",
    "horas_transcurridas": 4,
    "ventana_48h_cumplida": true
  },
  "comparacion": {
    "diferencia_bytes": 107856,
    "diferencia_mb": "0.10",
    "porcentaje_cambio": "5.27"
  }
}
```

---

### 2. **MARCAR VERSIÓN COMO ERRÓNEA** (`marcarVersionComoErronea`)

**Qué se registra:**

#### 📄 Información del Documento
- ID, título, versión
- Categoría
- Estado anterior y nuevo
- Si es versión actual

#### 🔗 Versión Correcta (si aplica)
- ID de la versión que corrige el error
- Vinculación explícita

#### 📝 Motivo
- Razón detallada por la cual se marca como errónea

#### 👤 Usuario y Timestamp
- Quién marcó
- Cuándo exactamente

**Ejemplo de metadata:**
```json
{
  "tipo_operacion": "MARCAR_VERSION_ERRONEA",
  "motivo_cambio": "Datos incorrectos en sección 3",
  "documento": {
    "id": "doc-123",
    "titulo": "Licencia de Construcción",
    "version": 2,
    "categoria": "Documentos Legales",
    "estado_anterior": "valida",
    "estado_nuevo": "erronea",
    "es_version_actual": false
  },
  "version_correcta": {
    "id": "doc-456",
    "vinculacion": "Esta versión errónea es corregida por la versión indicada"
  },
  "fecha_marcado": "2025-11-15T15:45:00Z",
  "usuario": {
    "usuario_id": "user-789",
    "email": "admin@constructora.com"
  }
}
```

---

### 3. **MARCAR VERSIÓN COMO OBSOLETA** (`marcarVersionComoObsoleta`)

**Qué se registra:**

#### 📄 Información del Documento
- ID, título, versión
- Categoría
- Estado anterior y nuevo

#### 📝 Razón de Obsolescencia
- Por qué quedó obsoleta (nueva versión disponible, cambio de normativa, etc.)

#### 👤 Usuario y Timestamp

**Ejemplo de metadata:**
```json
{
  "tipo_operacion": "MARCAR_VERSION_OBSOLETA",
  "motivo_cambio": "Reemplazada por versión 4 con actualizaciones",
  "documento": {
    "id": "doc-123",
    "titulo": "Planos Arquitectónicos",
    "version": 3,
    "categoria": "Planos",
    "estado_anterior": "valida",
    "estado_nuevo": "obsoleta",
    "es_version_actual": false
  },
  "razon_obsolescencia": "Reemplazada por versión 4 con actualizaciones",
  "fecha_marcado": "2025-11-15T16:00:00Z"
}
```

---

### 4. **RESTAURAR ESTADO DE VERSIÓN** (`restaurarEstadoVersion`)

**Qué se registra:**

#### 📄 Información del Documento
- Estado anterior (errónea/obsoleta)
- Motivo original por el cual fue marcada
- Estado nuevo (valida)

#### 🔄 Información de Restauración
- Desde qué estado se restauró
- Motivo original
- Fecha exacta de restauración
- Razón de la restauración

#### 👤 Usuario y Timestamp

**Ejemplo de metadata:**
```json
{
  "tipo_operacion": "RESTAURAR_ESTADO_VERSION",
  "documento": {
    "id": "doc-123",
    "titulo": "Contrato de Venta",
    "version": 1,
    "estado_anterior": "erronea",
    "estado_nuevo": "valida",
    "motivo_anterior": "Datos incorrectos (fueron verificados y eran correctos)"
  },
  "restauracion": {
    "desde_estado": "erronea",
    "motivo_original": "Datos incorrectos",
    "fecha_restauracion": "2025-11-15T17:00:00Z",
    "razon": "Restauración manual de estado a válido"
  }
}
```

---

## 🔍 Visualización en Módulo de Auditorías

### Información Disponible

Cuando consultes el módulo de auditorías, podrás ver:

1. **Tabla afectada**: `documentos_proyecto`
2. **Acción**: `UPDATE`
3. **Registro ID**: ID del documento afectado
4. **Usuario**: Quién realizó la acción
5. **Fecha y hora exacta**: Timestamp completo
6. **Datos anteriores vs nuevos**: Cambios específicos en campos
7. **Metadata completa**: Toda la información detallada arriba

### Acceso a Archivos Reemplazados

- Las URLs de backup son **válidas por 1 año**
- Puedes descargar el archivo original incluso después del reemplazo
- Comparar ambas versiones del archivo

### Filtros Disponibles

- Por tipo de operación (`tipo_operacion`)
- Por usuario
- Por documento específico
- Por rango de fechas
- Por proyecto

---

## 📊 Casos de Uso

### Auditoría Legal
"¿Quién reemplazó el contrato el 15 de noviembre a las 2:30 PM?"
→ Accedes al registro, ves el usuario, la justificación, y puedes descargar ambas versiones

### Recuperación de Datos
"Necesito el archivo original que fue reemplazado ayer"
→ El backup está disponible con URL directa en la metadata

### Validación de Procesos
"¿Se cumplió la ventana de 48 horas para el reemplazo?"
→ La metadata muestra `horas_transcurridas` y `ventana_48h_cumplida`

### Investigación de Errores
"¿Por qué esta versión fue marcada como errónea?"
→ Metadata muestra el motivo, quién lo marcó, cuándo, y qué versión la corrige

---

## ✅ Checklist de Implementación

- [x] Auditoría de reemplazo de archivo
- [x] Auditoría de marcar versión errónea
- [x] Auditoría de marcar versión obsoleta
- [x] Auditoría de restaurar estado
- [x] URLs de descarga en backups (1 año de validez)
- [x] Metadata ultra detallada
- [x] Usuario y timestamp en todas las operaciones
- [x] Contexto completo del documento
- [x] Comparaciones de tamaño en reemplazos
- [x] Validación de ventana de 48 horas

---

## 🎯 Próximos Pasos

1. **Visualización en UI**: Crear componente en módulo de auditorías para mostrar esta información de forma amigable
2. **Exportación**: Permitir exportar auditorías a PDF/Excel
3. **Alertas**: Notificar automáticamente cuando se reemplazan archivos importantes
4. **Dashboard**: Gráficas de actividad de documentos

---

**Fecha de implementación**: 15 de noviembre de 2025
**Versión**: 1.0
**Autor**: Sistema de Auditoría RyR Constructora
