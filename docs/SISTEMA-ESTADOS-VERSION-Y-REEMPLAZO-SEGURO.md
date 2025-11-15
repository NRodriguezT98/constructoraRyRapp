# 📋 Sistema de Estados de Versión y Reemplazo Seguro con Backup

**Fecha:** 15 de noviembre de 2025
**Proyecto:** RyR Constructora - Sistema de Gestión Administrativa
**Módulo:** Documentos (Proyectos y Viviendas)
**Prioridad:** Media
**Esfuerzo estimado:** 2-3 horas

---

## 🎯 CONTEXTO Y PROBLEMA

### Situación Actual

El sistema de versionado de documentos tiene las siguientes características:

1. **Versiones inmutables:** Una vez creada, una versión permanece en el historial
2. **Sin distinción de calidad:** No hay forma de marcar versiones erróneas o problemáticas
3. **Sin reemplazo seguro:** No existe función para corregir errores sin crear nueva versión

### Problema Identificado

**Escenario real:**
```
Usuario sube nueva versión de "Licencia de Construcción"
├── v1: Licencia antigua (correcta) ✅
├── v2: Usuario sube "cedula.pdf" por error ❌
├── v3: Usuario sube licencia correcta (después de detectar error) ✅

Problema actual:
- v2 (error) queda en historial para siempre sin distinción
- No hay forma de marcar que v2 es un error
- No hay forma de reemplazar v2 sin crear v3
- Navegación confusa (v1 → v2 error → v3)
- Auditoría no refleja naturaleza del error
```

### Por Qué NO Eliminar Versiones

**Razones arquitectónicas y legales:**

1. **Auditoría completa:** Una constructora es un negocio regulado que requiere historial completo
2. **Valor probatorio:** Los errores SON parte de la historia y demuestran control de calidad
3. **Cumplimiento legal:** Inspectores/auditores necesitan ver proceso completo (incluyendo errores)
4. **Integridad de datos:** Eliminar + renumerar = reescribir historia (problema en auditorías)
5. **Estándares profesionales:** Google Docs, Confluence, GitHub NO permiten eliminar versiones intermedias

**Ejemplo legal:**
```
Inspector municipal: "Muéstrame la licencia v3 del 15 de octubre"
Admin: "Esa versión fue eliminada y renumerada"
Inspector: ❌ SOSPECHA DE ALTERACIÓN DE DOCUMENTOS
```

---

## ✅ SOLUCIÓN: Sistema de Estados de Versión

### Concepto

En lugar de eliminar versiones erróneas, implementar sistema de **etiquetado de estados** que:

1. Marca versiones como válidas, erróneas, obsoletas, etc.
2. Muestra advertencias visuales en versiones problemáticas
3. Guía al usuario a la versión correcta
4. Preserva historial completo para auditoría
5. Permite filtrado opcional de versiones erróneas

### Beneficios

- ✅ Historial completo e intacto (auditoría perfecta)
- ✅ UX clara (usuario ve advertencias en versiones erróneas)
- ✅ Valor legal (prueba de control de calidad)
- ✅ Simple de implementar (1 columna + lógica de filtrado)
- ✅ Reversible (cambiar estado en cualquier momento)
- ✅ Profesional (así lo hacen sistemas enterprise)

---

## 🔧 PARTE 1: SISTEMA DE ESTADOS DE VERSIÓN

### 1.1. Migración de Base de Datos

**Archivo:** `supabase/migrations/XXX_sistema_estados_version.sql`

```sql
-- =============================================
-- MIGRACIÓN: Sistema de Estados de Versión
-- Descripción: Agregar estados y metadata para
--              marcar versiones erróneas/obsoletas
-- =============================================

-- 1. Agregar columna estado_version
ALTER TABLE documentos_proyecto
ADD COLUMN IF NOT EXISTS estado_version VARCHAR(20) DEFAULT 'valida'
  CHECK (estado_version IN ('valida', 'erronea', 'obsoleta', 'supersedida'));

-- 2. Agregar columna motivo_estado
ALTER TABLE documentos_proyecto
ADD COLUMN IF NOT EXISTS motivo_estado TEXT;

-- 3. Agregar referencia a versión que corrige (FK a mismo documento)
ALTER TABLE documentos_proyecto
ADD COLUMN IF NOT EXISTS version_corrige_a UUID REFERENCES documentos_proyecto(id);

-- 4. Índices para performance
CREATE INDEX IF NOT EXISTS idx_documentos_estado_version
  ON documentos_proyecto(estado_version);

CREATE INDEX IF NOT EXISTS idx_documentos_version_corrige
  ON documentos_proyecto(version_corrige_a);

-- 5. Comentarios descriptivos
COMMENT ON COLUMN documentos_proyecto.estado_version IS
  'Estado de la versión: valida (uso normal), erronea (archivo incorrecto), obsoleta (desactualizada), supersedida (reemplazada por otra)';

COMMENT ON COLUMN documentos_proyecto.motivo_estado IS
  'Descripción del motivo del estado (requerido si estado != valida)';

COMMENT ON COLUMN documentos_proyecto.version_corrige_a IS
  'ID de la versión correcta (usado cuando estado = erronea)';

-- 6. Llenar datos existentes (todas las versiones actuales son válidas)
UPDATE documentos_proyecto
SET estado_version = 'valida'
WHERE estado_version IS NULL;
```

**Ejecutar con:**
```bash
npm run db:exec supabase/migrations/XXX_sistema_estados_version.sql
```

---

### 1.2. Actualizar Tipos TypeScript

**Archivo:** `src/modules/documentos/types/documento.types.ts`

Agregar tipos para estados:

```typescript
/**
 * Estados posibles de una versión de documento
 */
export type EstadoVersion = 'valida' | 'erronea' | 'obsoleta' | 'supersedida'

/**
 * Motivos predefinidos para marcar versión como errónea
 */
export const MOTIVOS_VERSION_ERRONEA = {
  ARCHIVO_INCORRECTO: 'Archivo incorrecto subido',
  ARCHIVO_CORRUPTO: 'Archivo corrupto o ilegible',
  INFORMACION_INCORRECTA: 'Información incorrecta o desactualizada',
  DUPLICADO: 'Versión duplicada',
  OTRO: 'Otro (especificar en descripción)',
} as const

/**
 * Interfaz extendida con nuevos campos
 */
export interface DocumentoProyecto {
  // ... campos existentes ...

  // Nuevos campos para estados
  estado_version?: EstadoVersion
  motivo_estado?: string
  version_corrige_a?: string // UUID de versión correcta
}
```

**Regenerar tipos de Supabase:**
```bash
npm run types:generate
```

---

### 1.3. Servicio para Marcar Estados

**Archivo:** `src/modules/documentos/services/documentos.service.ts`

Agregar nuevos métodos:

```typescript
/**
 * ========================================
 * GESTIÓN DE ESTADOS DE VERSIÓN
 * ========================================
 */

/**
 * Marcar versión como errónea
 *
 * @param versionId - ID de la versión a marcar
 * @param motivo - Motivo del error
 * @param versionCorrectaId - (Opcional) ID de la versión correcta
 */
static async marcarVersionComoErronea(
  versionId: string,
  motivo: string,
  versionCorrectaId?: string
): Promise<void> {
  if (!motivo || motivo.trim().length < 10) {
    throw new Error('El motivo debe tener al menos 10 caracteres')
  }

  const { error } = await supabase
    .from('documentos_proyecto')
    .update({
      estado_version: 'erronea',
      motivo_estado: motivo.trim(),
      version_corrige_a: versionCorrectaId || null,
    })
    .eq('id', versionId)

  if (error) {
    console.error('Error al marcar versión como errónea:', error)
    throw new Error('No se pudo marcar la versión como errónea')
  }

  // Auditoría
  await this.registrarAuditoria({
    accion: 'MARCAR_VERSION_ERRONEA',
    tabla_afectada: 'documentos_proyecto',
    registro_id: versionId,
    datos_nuevos: {
      estado_version: 'erronea',
      motivo_estado: motivo,
      version_corrige_a: versionCorrectaId,
    },
  })
}

/**
 * Marcar versión como obsoleta
 *
 * @param versionId - ID de la versión a marcar
 * @param motivo - Motivo de obsolescencia
 */
static async marcarVersionComoObsoleta(
  versionId: string,
  motivo: string
): Promise<void> {
  if (!motivo || motivo.trim().length < 10) {
    throw new Error('El motivo debe tener al menos 10 caracteres')
  }

  const { error } = await supabase
    .from('documentos_proyecto')
    .update({
      estado_version: 'obsoleta',
      motivo_estado: motivo.trim(),
    })
    .eq('id', versionId)

  if (error) {
    console.error('Error al marcar versión como obsoleta:', error)
    throw new Error('No se pudo marcar la versión como obsoleta')
  }

  // Auditoría
  await this.registrarAuditoria({
    accion: 'MARCAR_VERSION_OBSOLETA',
    tabla_afectada: 'documentos_proyecto',
    registro_id: versionId,
    datos_nuevos: {
      estado_version: 'obsoleta',
      motivo_estado: motivo,
    },
  })
}

/**
 * Restaurar versión a estado válido
 *
 * @param versionId - ID de la versión a restaurar
 */
static async restaurarEstadoVersion(versionId: string): Promise<void> {
  const { error } = await supabase
    .from('documentos_proyecto')
    .update({
      estado_version: 'valida',
      motivo_estado: null,
      version_corrige_a: null,
    })
    .eq('id', versionId)

  if (error) {
    console.error('Error al restaurar estado de versión:', error)
    throw new Error('No se pudo restaurar el estado de la versión')
  }

  // Auditoría
  await this.registrarAuditoria({
    accion: 'RESTAURAR_ESTADO_VERSION',
    tabla_afectada: 'documentos_proyecto',
    registro_id: versionId,
    datos_nuevos: {
      estado_version: 'valida',
    },
  })
}

/**
 * Obtener versión que corrige a una errónea
 */
static async obtenerVersionCorrecta(versionId: string): Promise<DocumentoProyecto | null> {
  const { data: versionErronea, error: errorVersion } = await supabase
    .from('documentos_proyecto')
    .select('version_corrige_a')
    .eq('id', versionId)
    .single()

  if (errorVersion || !versionErronea?.version_corrige_a) {
    return null
  }

  const { data: versionCorrecta, error: errorCorrecta } = await supabase
    .from('documentos_proyecto')
    .select('*')
    .eq('id', versionErronea.version_corrige_a)
    .single()

  if (errorCorrecta) {
    return null
  }

  return versionCorrecta
}
```

---

### 1.4. Hook para Gestión de Estados

**Archivo:** `src/modules/documentos/hooks/useEstadosVersion.ts`

```typescript
/**
 * Hook para gestionar estados de versiones
 * Funcionalidad:
 * - Marcar versión como errónea
 * - Marcar versión como obsoleta
 * - Restaurar versión a estado válido
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { DocumentosService } from '../services/documentos.service'

export function useEstadosVersion() {
  const queryClient = useQueryClient()

  // Mutation: Marcar como errónea
  const marcarErronea = useMutation({
    mutationFn: ({
      versionId,
      motivo,
      versionCorrectaId,
    }: {
      versionId: string
      motivo: string
      versionCorrectaId?: string
    }) => DocumentosService.marcarVersionComoErronea(versionId, motivo, versionCorrectaId),
    onSuccess: () => {
      toast.success('Versión marcada como errónea')
      queryClient.invalidateQueries({ queryKey: ['documentos'] })
      queryClient.invalidateQueries({ queryKey: ['versiones-documento'] })
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`)
    },
  })

  // Mutation: Marcar como obsoleta
  const marcarObsoleta = useMutation({
    mutationFn: ({ versionId, motivo }: { versionId: string; motivo: string }) =>
      DocumentosService.marcarVersionComoObsoleta(versionId, motivo),
    onSuccess: () => {
      toast.success('Versión marcada como obsoleta')
      queryClient.invalidateQueries({ queryKey: ['documentos'] })
      queryClient.invalidateQueries({ queryKey: ['versiones-documento'] })
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`)
    },
  })

  // Mutation: Restaurar a estado válido
  const restaurarEstado = useMutation({
    mutationFn: (versionId: string) => DocumentosService.restaurarEstadoVersion(versionId),
    onSuccess: () => {
      toast.success('Estado de versión restaurado')
      queryClient.invalidateQueries({ queryKey: ['documentos'] })
      queryClient.invalidateQueries({ queryKey: ['versiones-documento'] })
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`)
    },
  })

  return {
    marcarErronea,
    marcarObsoleta,
    restaurarEstado,
    isLoading: marcarErronea.isPending || marcarObsoleta.isPending || restaurarEstado.isPending,
  }
}
```

---

### 1.5. Componente Modal para Marcar Estado

**Archivo:** `src/modules/documentos/components/modals/MarcarEstadoVersionModal.tsx`

```tsx
/**
 * Modal para marcar estado de una versión
 * Permite marcar como errónea u obsoleta con justificación
 */

import { useState } from 'react'
import { AlertTriangle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MOTIVOS_VERSION_ERRONEA, type DocumentoProyecto } from '../../types/documento.types'
import { useEstadosVersion } from '../../hooks/useEstadosVersion'

interface MarcarEstadoVersionModalProps {
  isOpen: boolean
  onClose: () => void
  version: DocumentoProyecto
  versionesDisponibles?: DocumentoProyecto[] // Para seleccionar versión correcta
}

export function MarcarEstadoVersionModal({
  isOpen,
  onClose,
  version,
  versionesDisponibles = [],
}: MarcarEstadoVersionModalProps) {
  const [tipoEstado, setTipoEstado] = useState<'erronea' | 'obsoleta'>('erronea')
  const [motivoPredefinido, setMotivoPredefinido] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [versionCorrectaId, setVersionCorrectaId] = useState('')

  const { marcarErronea, marcarObsoleta, isLoading } = useEstadosVersion()

  const handleConfirmar = async () => {
    const motivoCompleto = motivoPredefinido
      ? `${motivoPredefinido}${descripcion ? `: ${descripcion}` : ''}`
      : descripcion

    if (motivoCompleto.length < 10) {
      return // Validación en UI
    }

    try {
      if (tipoEstado === 'erronea') {
        await marcarErronea.mutateAsync({
          versionId: version.id,
          motivo: motivoCompleto,
          versionCorrectaId: versionCorrectaId || undefined,
        })
      } else {
        await marcarObsoleta.mutateAsync({
          versionId: version.id,
          motivo: motivoCompleto,
        })
      }
      onClose()
    } catch (error) {
      // Error manejado por mutation
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Marcar estado de versión
          </DialogTitle>
          <DialogDescription>
            Versión {version.version} - {version.titulo}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tipo de estado */}
          <div>
            <label className="text-sm font-medium">Tipo de estado:</label>
            <Select value={tipoEstado} onValueChange={(v) => setTipoEstado(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="erronea">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    Errónea (archivo incorrecto)
                  </div>
                </SelectItem>
                <SelectItem value="obsoleta">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    Obsoleta (desactualizada)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Motivo predefinido (solo para errónea) */}
          {tipoEstado === 'erronea' && (
            <div>
              <label className="text-sm font-medium">Motivo:</label>
              <Select value={motivoPredefinido} onValueChange={setMotivoPredefinido}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar motivo" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(MOTIVOS_VERSION_ERRONEA).map(([key, value]) => (
                    <SelectItem key={key} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Descripción */}
          <div>
            <label className="text-sm font-medium">
              Descripción {tipoEstado === 'obsoleta' ? '(obligatoria)' : '(opcional)'}:
            </label>
            <Textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción detallada del problema..."
              rows={3}
              minLength={tipoEstado === 'obsoleta' ? 10 : undefined}
            />
            <p className="text-xs text-gray-500 mt-1">
              {tipoEstado === 'obsoleta'
                ? 'Mínimo 10 caracteres'
                : 'Opcional para ampliar información'}
            </p>
          </div>

          {/* Versión correcta (solo para errónea) */}
          {tipoEstado === 'erronea' && versionesDisponibles.length > 0 && (
            <div>
              <label className="text-sm font-medium">Versión correcta (opcional):</label>
              <Select value={versionCorrectaId} onValueChange={setVersionCorrectaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar versión correcta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Ninguna</SelectItem>
                  {versionesDisponibles
                    .filter((v) => v.id !== version.id)
                    .map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        v{v.version} - {v.titulo}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Advertencia */}
          <Alert variant="default">
            <AlertDescription className="text-sm">
              Esta versión quedará marcada en el historial. Los usuarios verán una advertencia
              indicando que no deben usar esta versión.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmar}
            disabled={
              isLoading ||
              (tipoEstado === 'obsoleta' && descripcion.length < 10) ||
              (tipoEstado === 'erronea' && !motivoPredefinido && descripcion.length < 10)
            }
          >
            {isLoading ? 'Marcando...' : 'Marcar estado'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

---

### 1.6. UI para Mostrar Estados en Historial

**Archivo:** Actualizar componente de versión individual

Agregar indicadores visuales según estado:

```tsx
// En componente de versión (ej: VersionItem.tsx)

import { AlertTriangle, XCircle, CheckCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

// ...dentro del componente

{/* Badge según estado */}
{version.estado_version === 'erronea' && (
  <Badge variant="destructive" className="flex items-center gap-1">
    <XCircle className="h-3 w-3" />
    Errónea
  </Badge>
)}

{version.estado_version === 'obsoleta' && (
  <Badge variant="warning" className="flex items-center gap-1">
    <AlertTriangle className="h-3 w-3" />
    Obsoleta
  </Badge>
)}

{version.estado_version === 'valida' && (
  <Badge variant="success" className="flex items-center gap-1">
    <CheckCircle className="h-3 w-3" />
    Válida
  </Badge>
)}

{/* Alerta con motivo */}
{version.estado_version !== 'valida' && version.motivo_estado && (
  <Alert variant={version.estado_version === 'erronea' ? 'destructive' : 'warning'} className="mt-2">
    <AlertDescription>
      <p className="font-medium">
        {version.estado_version === 'erronea' ? '⚠️ Esta versión contiene un error' : '⚠️ Esta versión está obsoleta'}
      </p>
      <p className="text-sm mt-1">{version.motivo_estado}</p>

      {/* Link a versión correcta */}
      {version.estado_version === 'erronea' && version.version_corrige_a && (
        <button
          onClick={() => navegarAVersion(version.version_corrige_a)}
          className="text-sm underline mt-2"
        >
          Ver versión correcta →
        </button>
      )}
    </AlertDescription>
  </Alert>
)}
```

---

## 🔧 PARTE 2: REEMPLAZO SEGURO CON BACKUP

### 2.1. Estructura de Storage para Backups

**Estructura de carpetas:**
```
documentos_proyecto/ (bucket)
├── proyecto-123/
│   ├── licencias/
│   │   └── licencia-2024.pdf           ← Archivo activo
│   ├── contratos/
│   │   └── contrato-principal.pdf      ← Archivo activo
│   └── _reemplazos/                    ← Nueva carpeta para backups
│       ├── v2_20251115_143022_cedula.pdf
│       └── v5_20251120_091530_plano-antiguo.pdf
```

**Convención de nombres backup:**
```
v{VERSION}_{TIMESTAMP}_{NOMBRE_ORIGINAL}.{EXT}

Ejemplo:
v2_20251115_143022_cedula.pdf
└─┬──┴──────────────┴─────────┴─────
  │         │            └─ Nombre original
  │         └─ Timestamp (YYYYMMDDHHmmss)
  └─ Número de versión
```

---

### 2.2. Migración para Metadata de Reemplazos

**Archivo:** `supabase/migrations/XXX_reemplazo_archivo_metadata.sql`

```sql
-- =============================================
-- MIGRACIÓN: Metadata para Reemplazo de Archivos
-- Descripción: Agregar campos para auditoría de reemplazos
-- =============================================

-- 1. Verificar si columna metadata existe (debería existir)
-- Si no existe, crearla como JSONB
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documentos_proyecto'
    AND column_name = 'metadata'
  ) THEN
    ALTER TABLE documentos_proyecto
    ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- 2. Comentario descriptivo
COMMENT ON COLUMN documentos_proyecto.metadata IS
  'Metadata en formato JSON. Incluye: reemplazado (bool), fecha_reemplazo (ISO), motivo_reemplazo (string), archivo_original_backup (string), nombre_original_previo (string)';

-- 3. Índice para búsquedas de reemplazos
CREATE INDEX IF NOT EXISTS idx_documentos_metadata_reemplazado
  ON documentos_proyecto USING gin(metadata);
```

---

### 2.3. Servicio de Reemplazo Seguro

**Archivo:** `src/modules/documentos/services/documentos.service.ts`

```typescript
/**
 * ========================================
 * REEMPLAZO SEGURO DE ARCHIVO
 * ========================================
 */

/**
 * Reemplazar archivo de versión actual CON backup del original
 *
 * REGLAS:
 * - Solo versión actual (es_version_actual = true)
 * - Solo Admin puede usar esta función
 * - Límite de 48 horas desde creación
 * - Backup automático del archivo original
 * - Auditoría completa
 *
 * @param versionId - ID de la versión a reemplazar
 * @param nuevoArchivo - Nuevo archivo a subir
 * @param motivo - Motivo del reemplazo (obligatorio)
 */
static async reemplazarArchivoSeguro(
  versionId: string,
  nuevoArchivo: File,
  motivo: string
): Promise<void> {
  // 1. Validaciones
  if (!motivo || motivo.trim().length < 20) {
    throw new Error('El motivo debe tener al menos 20 caracteres')
  }

  // 2. Obtener versión actual
  const { data: version, error: errorVersion } = await supabase
    .from('documentos_proyecto')
    .select('*')
    .eq('id', versionId)
    .single()

  if (errorVersion || !version) {
    throw new Error('Versión no encontrada')
  }

  // 3. Validar que es versión actual
  if (!version.es_version_actual) {
    throw new Error('Solo se puede reemplazar la versión actual')
  }

  // 4. Validar límite de tiempo (48 horas)
  const tiempoTranscurrido = Date.now() - new Date(version.fecha_creacion).getTime()
  const LIMITE_48H = 48 * 60 * 60 * 1000

  if (tiempoTranscurrido > LIMITE_48H) {
    throw new Error(
      'Han pasado más de 48 horas desde la creación. Crea una nueva versión en su lugar.'
    )
  }

  // 5. Obtener categoría para path
  const { data: categoria } = await supabase
    .from('categorias_documento')
    .select('nombre')
    .eq('id', version.categoria_id)
    .single()

  const categoriaNombre = categoria?.nombre || 'sin-categoria'

  // 6. Crear backup del archivo original
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0]
  const nombreBackup = `v${version.version}_${timestamp}_${version.nombre_original}`
  const pathBackup = `${version.proyecto_id}/_reemplazos/${nombreBackup}`

  try {
    // Copiar archivo original a backup
    const { data: archivoOriginal } = await supabase.storage
      .from('documentos_proyecto')
      .download(version.url_storage)

    if (!archivoOriginal) {
      throw new Error('No se pudo descargar archivo original para backup')
    }

    const { error: errorBackup } = await supabase.storage
      .from('documentos_proyecto')
      .upload(pathBackup, archivoOriginal, {
        contentType: archivoOriginal.type,
        upsert: false,
      })

    if (errorBackup) {
      throw new Error(`Error al crear backup: ${errorBackup.message}`)
    }

    // 7. Eliminar archivo original de ubicación activa
    await supabase.storage.from('documentos_proyecto').remove([version.url_storage])

    // 8. Subir nuevo archivo en misma ubicación
    const extensionNueva = nuevoArchivo.name.split('.').pop()
    const nombreNuevo = `${version.titulo.toLowerCase().replace(/\s+/g, '-')}.${extensionNueva}`
    const pathNuevo = `${version.proyecto_id}/${categoriaNombre}/${nombreNuevo}`

    const { error: errorSubida } = await supabase.storage
      .from('documentos_proyecto')
      .upload(pathNuevo, nuevoArchivo, {
        contentType: nuevoArchivo.type,
        upsert: true, // Sobrescribir si existe
      })

    if (errorSubida) {
      // Intentar restaurar backup
      await supabase.storage
        .from('documentos_proyecto')
        .upload(version.url_storage, archivoOriginal, { upsert: true })
      throw new Error(`Error al subir nuevo archivo: ${errorSubida.message}`)
    }

    // 9. Actualizar registro con metadata de reemplazo
    const { error: errorUpdate } = await supabase
      .from('documentos_proyecto')
      .update({
        url_storage: pathNuevo,
        nombre_original: nuevoArchivo.name,
        tamano_bytes: nuevoArchivo.size,
        metadata: {
          ...(typeof version.metadata === 'object' ? version.metadata : {}),
          reemplazado: true,
          fecha_reemplazo: new Date().toISOString(),
          motivo_reemplazo: motivo.trim(),
          archivo_original_backup: pathBackup,
          nombre_original_previo: version.nombre_original,
          tamano_bytes_previo: version.tamano_bytes,
        },
      })
      .eq('id', versionId)

    if (errorUpdate) {
      throw new Error(`Error al actualizar registro: ${errorUpdate.message}`)
    }

    // 10. Auditoría detallada
    await this.registrarAuditoria({
      accion: 'REEMPLAZO_ARCHIVO',
      tabla_afectada: 'documentos_proyecto',
      registro_id: versionId,
      datos_anteriores: {
        url_storage: version.url_storage,
        nombre_original: version.nombre_original,
        tamano_bytes: version.tamano_bytes,
      },
      datos_nuevos: {
        url_storage: pathNuevo,
        nombre_original: nuevoArchivo.name,
        tamano_bytes: nuevoArchivo.size,
        motivo_reemplazo: motivo,
        archivo_backup: pathBackup,
      },
    })
  } catch (error) {
    console.error('Error en reemplazo seguro:', error)
    throw error
  }
}

/**
 * Recuperar archivo original desde backup
 */
static async recuperarArchivoDesdeBackup(versionId: string): Promise<void> {
  // 1. Obtener versión
  const { data: version, error } = await supabase
    .from('documentos_proyecto')
    .select('*')
    .eq('id', versionId)
    .single()

  if (error || !version) {
    throw new Error('Versión no encontrada')
  }

  // 2. Validar que tiene backup
  const metadata = typeof version.metadata === 'object' ? version.metadata : {}
  if (!metadata.archivo_original_backup) {
    throw new Error('Esta versión no tiene archivo de backup')
  }

  // 3. Descargar archivo de backup
  const { data: archivoBackup } = await supabase.storage
    .from('documentos_proyecto')
    .download(metadata.archivo_original_backup)

  if (!archivoBackup) {
    throw new Error('No se pudo descargar archivo de backup')
  }

  // 4. Eliminar archivo actual
  await supabase.storage.from('documentos_proyecto').remove([version.url_storage])

  // 5. Restaurar archivo original
  const { error: errorRestaura } = await supabase.storage
    .from('documentos_proyecto')
    .upload(version.url_storage, archivoBackup, { upsert: true })

  if (errorRestaura) {
    throw new Error(`Error al restaurar archivo: ${errorRestaura.message}`)
  }

  // 6. Actualizar registro
  await supabase
    .from('documentos_proyecto')
    .update({
      nombre_original: metadata.nombre_original_previo || version.nombre_original,
      tamano_bytes: metadata.tamano_bytes_previo || version.tamano_bytes,
      metadata: {
        ...metadata,
        reemplazado: false,
        recuperado_de_backup: true,
        fecha_recuperacion: new Date().toISOString(),
      },
    })
    .eq('id', versionId)

  // 7. Auditoría
  await this.registrarAuditoria({
    accion: 'RECUPERAR_DESDE_BACKUP',
    tabla_afectada: 'documentos_proyecto',
    registro_id: versionId,
    datos_nuevos: {
      archivo_recuperado: metadata.archivo_original_backup,
    },
  })
}
```

---

### 2.4. Hook para Reemplazo de Archivo

**Archivo:** `src/modules/documentos/hooks/useReemplazarArchivo.ts`

```typescript
/**
 * Hook para reemplazar archivo de versión actual
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/auth'
import { DocumentosService } from '../services/documentos.service'
import type { DocumentoProyecto } from '../types/documento.types'

export function useReemplazarArchivo() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  // Validar si puede reemplazar
  const puedeReemplazar = (version: DocumentoProyecto) => {
    // 1. Solo Admin
    if (user?.rol !== 'Administrador') {
      return {
        puede: false,
        razon: 'Solo administradores pueden reemplazar archivos',
      }
    }

    // 2. Solo versión actual
    if (!version.es_version_actual) {
      return {
        puede: false,
        razon: 'Solo se puede reemplazar la versión actual',
      }
    }

    // 3. Validar límite de tiempo (48 horas)
    const tiempoTranscurrido = Date.now() - new Date(version.fecha_creacion).getTime()
    const LIMITE_48H = 48 * 60 * 60 * 1000

    if (tiempoTranscurrido > LIMITE_48H) {
      return {
        puede: false,
        razon: 'Han pasado más de 48 horas. Crea una nueva versión en su lugar.',
        sugerencia: 'crear_nueva_version',
      }
    }

    return { puede: true }
  }

  // Mutation: Reemplazar archivo
  const reemplazarArchivo = useMutation({
    mutationFn: ({
      versionId,
      archivo,
      motivo,
    }: {
      versionId: string
      archivo: File
      motivo: string
    }) => DocumentosService.reemplazarArchivoSeguro(versionId, archivo, motivo),
    onSuccess: () => {
      toast.success('Archivo reemplazado exitosamente', {
        description: 'El archivo original se guardó en backup',
      })
      queryClient.invalidateQueries({ queryKey: ['documentos'] })
      queryClient.invalidateQueries({ queryKey: ['versiones-documento'] })
    },
    onError: (error: Error) => {
      toast.error(`Error al reemplazar archivo: ${error.message}`)
    },
  })

  // Mutation: Recuperar desde backup
  const recuperarBackup = useMutation({
    mutationFn: (versionId: string) => DocumentosService.recuperarArchivoDesdeBackup(versionId),
    onSuccess: () => {
      toast.success('Archivo recuperado desde backup')
      queryClient.invalidateQueries({ queryKey: ['documentos'] })
      queryClient.invalidateQueries({ queryKey: ['versiones-documento'] })
    },
    onError: (error: Error) => {
      toast.error(`Error al recuperar archivo: ${error.message}`)
    },
  })

  return {
    puedeReemplazar,
    reemplazarArchivo,
    recuperarBackup,
    isLoading: reemplazarArchivo.isPending || recuperarBackup.isPending,
  }
}
```

---

### 2.5. Modal de Reemplazo de Archivo

**Archivo:** `src/modules/documentos/components/modals/ReemplazarArchivoModal.tsx`

```tsx
/**
 * Modal para reemplazar archivo de versión actual
 * Con validaciones y backup automático
 */

import { useState } from 'react'
import { AlertTriangle, Upload, FileCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import type { DocumentoProyecto } from '../../types/documento.types'
import { useReemplazarArchivo } from '../../hooks/useReemplazarArchivo'

interface ReemplazarArchivoModalProps {
  isOpen: boolean
  onClose: () => void
  version: DocumentoProyecto
}

const MOTIVOS_REEMPLAZO = {
  ARCHIVO_INCORRECTO: 'Archivo incorrecto subido',
  ARCHIVO_CORRUPTO: 'Archivo corrupto o ilegible',
  VERSION_ACTUALIZADA: 'Versión más actualizada recibida',
  CORRECCION_DATOS: 'Corrección de datos/información',
  OTRO: 'Otro (especificar)',
} as const

export function ReemplazarArchivoModal({
  isOpen,
  onClose,
  version,
}: ReemplazarArchivoModalProps) {
  const [archivo, setArchivo] = useState<File | null>(null)
  const [motivoPredefinido, setMotivoPredefinido] = useState('')
  const [descripcion, setDescripcion] = useState('')

  const { reemplazarArchivo, isLoading } = useReemplazarArchivo()

  const handleConfirmar = async () => {
    if (!archivo) return

    const motivoCompleto = motivoPredefinido
      ? `${motivoPredefinido}${descripcion ? `: ${descripcion}` : ''}`
      : descripcion

    if (motivoCompleto.length < 20) {
      return // Validación en UI
    }

    try {
      await reemplazarArchivo.mutateAsync({
        versionId: version.id,
        archivo,
        motivo: motivoCompleto,
      })
      onClose()
      // Reset
      setArchivo(null)
      setMotivoPredefinido('')
      setDescripcion('')
    } catch (error) {
      // Error manejado por mutation
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-500" />
            Reemplazar archivo de versión
          </DialogTitle>
          <DialogDescription>
            Versión {version.version} - {version.titulo}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Archivo actual */}
          <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p className="text-sm font-medium mb-1">Archivo actual:</p>
            <Badge variant="outline" className="font-mono text-xs">
              {version.nombre_original}
            </Badge>
          </div>

          {/* Selector de archivo nuevo */}
          <div>
            <label className="text-sm font-medium">Nuevo archivo:</label>
            <input
              type="file"
              onChange={(e) => setArchivo(e.target.files?.[0] || null)}
              className="mt-1 block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />
            {archivo && (
              <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                <FileCheck className="h-4 w-4" />
                {archivo.name} ({(archivo.size / 1024).toFixed(2)} KB)
              </div>
            )}
          </div>

          {/* Motivo predefinido */}
          <div>
            <label className="text-sm font-medium">Motivo del reemplazo:</label>
            <Select value={motivoPredefinido} onValueChange={setMotivoPredefinido}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar motivo" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(MOTIVOS_REEMPLAZO).map(([key, value]) => (
                  <SelectItem key={key} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Descripción detallada */}
          <div>
            <label className="text-sm font-medium">Descripción detallada (obligatoria):</label>
            <Textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Explicación detallada del reemplazo..."
              rows={3}
              minLength={20}
            />
            <p className="text-xs text-gray-500 mt-1">
              Mínimo 20 caracteres. Quedará registrado en auditoría.
            </p>
          </div>

          {/* Advertencias */}
          <Alert variant="default">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <p className="font-medium mb-1">El archivo original se preservará:</p>
              <ul className="list-disc list-inside text-xs space-y-0.5">
                <li>Se creará backup automático en carpeta _reemplazos/</li>
                <li>Podrás recuperar el archivo original si es necesario</li>
                <li>Se registrará en auditoría con motivo y timestamp</li>
              </ul>
            </AlertDescription>
          </Alert>

          <Alert variant="warning">
            <AlertDescription className="text-sm">
              ⏰ Solo puedes reemplazar versiones creadas hace menos de 48 horas. Para cambios
              posteriores, crea una nueva versión.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmar}
            disabled={
              isLoading ||
              !archivo ||
              (!motivoPredefinido && descripcion.length < 20) ||
              (motivoPredefinido && descripcion && descripcion.length + motivoPredefinido.length < 20)
            }
          >
            {isLoading ? 'Reemplazando...' : 'Reemplazar archivo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### Parte 1: Estados de Versión

- [ ] **Migración BD:** Ejecutar `XXX_sistema_estados_version.sql`
- [ ] **Tipos TypeScript:** Actualizar `documento.types.ts` con `EstadoVersion`
- [ ] **Regenerar tipos:** `npm run types:generate`
- [ ] **Servicio:** Agregar métodos `marcarVersionComoErronea`, `marcarVersionComoObsoleta`, `restaurarEstadoVersion`
- [ ] **Hook:** Crear `useEstadosVersion.ts`
- [ ] **Modal:** Crear `MarcarEstadoVersionModal.tsx`
- [ ] **UI:** Actualizar componentes de versión para mostrar badges y alertas según estado
- [ ] **Filtros:** Agregar opción "Mostrar versiones erróneas" (opcional)
- [ ] **Testing:** Probar marcar v2 como errónea, verificar advertencias, verificar link a v3

### Parte 2: Reemplazo Seguro

- [ ] **Migración BD:** Ejecutar `XXX_reemplazo_archivo_metadata.sql`
- [ ] **Storage:** Crear política RLS para carpeta `_reemplazos/`
- [ ] **Servicio:** Agregar método `reemplazarArchivoSeguro`
- [ ] **Hook:** Crear `useReemplazarArchivo.ts`
- [ ] **Modal:** Crear `ReemplazarArchivoModal.tsx`
- [ ] **Permisos:** Validar solo Admin puede reemplazar
- [ ] **Límite tiempo:** Validar límite de 48 horas
- [ ] **Testing:** Reemplazar archivo, verificar backup, verificar metadata, probar recuperación

### Validaciones Finales

- [ ] **Auditoría completa:** Verificar registros en tabla `auditoria`
- [ ] **Backup recuperable:** Probar `recuperarArchivoDesdeBackup`
- [ ] **UI responsive:** Validar en móvil/tablet
- [ ] **Dark mode:** Verificar todos los componentes
- [ ] **Navegación:** Probar link de versión errónea a correcta
- [ ] **Performance:** Verificar queries optimizadas con índices

---

## 🎯 CASOS DE USO COMPLETOS

### Caso 1: Marcar versión errónea

```
1. Usuario sube v2 con archivo incorrecto (cédula en lugar de licencia)
2. Usuario reporta error a Admin
3. Admin abre modal de historial de versiones
4. Admin hace clic en "Marcar como errónea" en v2
5. Modal se abre con formulario
6. Admin selecciona motivo "Archivo incorrecto subido"
7. Admin agrega descripción "Usuario subió cédula por error"
8. Admin selecciona v3 como versión correcta
9. Admin confirma
10. Sistema marca v2 con estado_version = 'erronea'
11. UI muestra badge rojo "Errónea" en v2
12. UI muestra alerta "Esta versión contiene un error" con link a v3
13. Auditoría registra acción
```

### Caso 2: Reemplazar archivo de versión actual

```
1. Usuario sube v4 con archivo corrupto (hace 2 horas)
2. Usuario reporta que el PDF no abre
3. Admin abre modal de historial
4. Admin hace clic en "Reemplazar archivo" en v4
5. Modal valida que v4 es versión actual y < 48 horas
6. Admin selecciona nuevo archivo "licencia-correcta.pdf"
7. Admin selecciona motivo "Archivo corrupto o ilegible"
8. Admin agrega descripción "PDF original no abre, cliente envió nueva copia"
9. Admin confirma
10. Sistema:
    - Copia archivo original a _reemplazos/v4_20251115_143022_licencia.pdf
    - Elimina archivo original de ubicación activa
    - Sube nuevo archivo en misma ubicación
    - Actualiza metadata con info de reemplazo
    - Registra auditoría detallada
11. UI muestra badge "Reemplazado" en v4
12. Metadata preserva nombre y tamaño del archivo original
```

### Caso 3: Recuperar desde backup

```
1. Admin reemplazó archivo de v4 por error
2. Admin se da cuenta que el original era el correcto
3. Admin abre modal de versión v4
4. Admin hace clic en "Recuperar archivo original"
5. Modal muestra info del backup disponible
6. Admin confirma recuperación
7. Sistema:
    - Descarga archivo desde _reemplazos/v4_...backup
    - Elimina archivo actual
    - Restaura archivo original en ubicación activa
    - Actualiza metadata con info de recuperación
    - Registra auditoría
8. UI muestra que archivo fue recuperado
```

---

## 🚨 CONSIDERACIONES IMPORTANTES

### Límites y Restricciones

1. **Solo versión actual:** Reemplazo solo permitido en `es_version_actual = true`
2. **Límite de tiempo:** 48 horas desde creación (configurable)
3. **Solo Admin:** Función exclusiva de administradores
4. **Motivo obligatorio:** Mínimo 20 caracteres
5. **Backup permanente:** Archivos en `_reemplazos/` NO se eliminan automáticamente

### Política de Retención de Backups

**Recomendación:** Política manual de limpieza trimestral

```sql
-- Query para identificar backups antiguos (> 90 días)
SELECT
  metadata->>'archivo_original_backup' as archivo_backup,
  fecha_creacion,
  titulo
FROM documentos_proyecto
WHERE metadata->>'reemplazado' = 'true'
  AND fecha_creacion < NOW() - INTERVAL '90 days'
ORDER BY fecha_creacion ASC;
```

### Seguridad

1. **RLS en Storage:** Carpeta `_reemplazos/` solo accesible por Admin
2. **Auditoría completa:** Cada reemplazo registrado con usuario, timestamp, motivo
3. **Metadata inmutable:** Una vez reemplazado, metadata preserva info original
4. **Sin eliminación física:** Archivos originales siempre recuperables

---

## 📚 DOCUMENTACIÓN ADICIONAL

### Referencias Internas

- **Tipos de base de datos:** `docs/DATABASE-SCHEMA-REFERENCE-ACTUALIZADO.md`
- **Sistema de auditoría:** `docs/SISTEMA-AUDITORIA-RESUMEN.md`
- **Manejo de fechas:** `docs/GUIA-MANEJO-FECHAS-PROFESIONAL.md`
- **Permisos JWT:** `docs/IMPLEMENTACION-JWT-CACHE-PERMISOS.md`

### Comandos Útiles

```bash
# Regenerar tipos TypeScript
npm run types:generate

# Ejecutar migración SQL
npm run db:exec supabase/migrations/XXX_nombre_migracion.sql

# Verificar tipos
npm run type-check

# Modo desarrollo
npm run dev
```

---

## ✅ CRITERIOS DE ÉXITO

La implementación estará completa cuando:

1. ✅ Admin puede marcar versión como errónea/obsoleta con justificación
2. ✅ UI muestra badges y alertas claras en versiones problemáticas
3. ✅ Link de versión errónea navega a versión correcta
4. ✅ Admin puede reemplazar archivo de versión actual (< 48h)
5. ✅ Backup automático se crea en carpeta `_reemplazos/`
6. ✅ Metadata preserva información del archivo original
7. ✅ Auditoría registra todas las acciones con detalles completos
8. ✅ Admin puede recuperar archivo original desde backup
9. ✅ Sistema valida permisos (solo Admin)
10. ✅ Sistema valida límite de tiempo (48 horas)
11. ✅ Todo funciona en modo oscuro y responsive
12. ✅ No hay errores de TypeScript ni warnings en consola

---

**FIN DEL DOCUMENTO**

Este documento debe servir como guía completa para implementar el sistema de estados de versión y reemplazo seguro con backup. Incluye toda la lógica de negocio, código de referencia, validaciones y casos de uso necesarios para una implementación profesional y segura.
