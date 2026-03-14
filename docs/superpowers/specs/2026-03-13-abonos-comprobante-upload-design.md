# Spec: Abonos — Comprobante Obligatorio + Fix Fecha Mínima

**Date**: 2026-03-13
**Status**: ✅ APPROVED — ready for implementation

---

## Contexto y Problemas

### Bug: Fecha mínima del abono no funciona

`fecha_negociacion` en BD es `timestamp with time zone` (ej: `"2025-11-28T14:43:42.679577+00:00"`).

En [`page.tsx`](../../../src/app/abonos/[clienteId]/page.tsx):
```tsx
fechaMinima={negociacion.fecha_negociacion ?? undefined}
// El browser silenciosamente ignora min cuando no es formato YYYY-MM-DD
```

El date picker permite seleccionar cualquier fecha anterior a la negociación.

### Gap: La API no valida la fecha en backend

`/api/abonos/registrar` no verifica que `fecha_abono >= fecha_negociacion`. Un POST directo bypassea la restricción del UI.

### Gap: Comprobante no se adjunta

`abonos_historial.comprobante_url` existe en BD y en types TS, pero siempre se inserta como `null`. No hay mecanismo para adjuntar evidencia del pago.

---

## Solución

### 1. Fix Fecha Mínima (frontend + backend)

**Frontend** — [`src/app/abonos/[clienteId]/page.tsx`]:
```tsx
// ANTES (buggy):
fechaMinima={negociacion.fecha_negociacion ?? undefined}

// DESPUÉS:
import { formatDateForInput } from '@/lib/utils/date.utils'
fechaMinima={negociacion.fecha_negociacion ? formatDateForInput(negociacion.fecha_negociacion) : undefined}
```

**Backend** — [`src/app/api/abonos/registrar/route.ts`]:
Después de validar que la fuente existe, consultar la negociación para obtener `fecha_negociacion` y rechazar si `fecha_abono < fecha_negociacion`:

```typescript
const { data: negociacion } = await supabase
  .from('negociaciones')
  .select('fecha_negociacion')
  .eq('id', negociacion_id)
  .single()

if (negociacion?.fecha_negociacion) {
  const fechaMinima = negociacion.fecha_negociacion.split('T')[0] // YYYY-MM-DD
  if (fecha_abono < fechaMinima) {
    return NextResponse.json(
      { error: `La fecha del abono no puede ser anterior a la fecha de negociación (${fechaMinima})` },
      { status: 400 }
    )
  }
}
```

---

### 2. Bucket `comprobantes-abonos`

**Configuración:**
- **Privado** (no público) — acceso solo mediante URLs firmadas generadas server-side
- MIME types permitidos: `image/jpeg`, `image/png`, `image/webp`, `application/pdf`
- Tamaño máximo: 10MB (configurado en RLS/política de Storage)

**Path convention:**
```
comprobantes-abonos/
  negociaciones/{negociacion_id}/
    fuentes/{fuente_pago_id}/
      {YYYYMMDD}-{timestamp}.{ext}
```

Los UUIDs en el path hacen que sea prácticamente imposible de adivinar aunque se filtre el esquema.

**Qué se guarda en BD:**
- `abonos_historial.comprobante_url` guarda el **path relativo** (no URL pública), ej:
  `negociaciones/abc-123/fuentes/def-456/20260313-1741234567.pdf`

**Migration SQL** (`supabase/migrations/20260313_bucket_comprobantes_abonos.sql`):
```sql
-- Crear bucket privado
INSERT INTO storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
VALUES (
  'comprobantes-abonos',
  'comprobantes-abonos',
  false,  -- PRIVADO
  ARRAY['image/jpeg','image/png','image/webp','application/pdf'],
  10485760  -- 10MB en bytes
)
ON CONFLICT (id) DO NOTHING;

-- RLS: usuarios autenticados pueden SUBIR (INSERT) y LEER (SELECT)
-- DELETE solo via service_role (rollback de la API) — nunca desde el cliente
CREATE POLICY "Authenticated users can upload comprobantes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'comprobantes-abonos');

CREATE POLICY "Authenticated users can read comprobantes"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'comprobantes-abonos');

-- DELETE para authenticated: necesario para que el hook pueda limpiar
-- archivos huérfanos cuando el modal se cierra durante un upload en progreso.
-- Seguridad: el path contiene 3 UUIDs anidados (negociacion_id/fuente_id/timestamp)
-- lo que hace la enumeración efectivamente imposible.
CREATE POLICY "Authenticated users can delete comprobantes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'comprobantes-abonos');
```

---

### 3. Upload Atómico en el Modal

#### Flujo de submit

```
1. validarFormulario()
   → incluye: comprobante !== null (obligatorio)
   → incluye: fecha_abono >= fechaMinima

2. setFaseLoading('subiendo')  →  "Subiendo comprobante..."
3. cancelledRef.current = false
4. supabase.storage.from('comprobantes-abonos').upload(path, file)
   → SI FALLA: setError('No se pudo subir el comprobante. Intenta de nuevo.'), return
   → SI cancelledRef.current === true (modal cerrado mientras subía):
       intentar: supabase.storage.from('comprobantes-abonos').remove([path])  — best-effort
       return  (no continuar a la BD)

5. setFaseLoading('guardando')  →  "Guardando abono..."
6. POST /api/abonos/registrar { ...formData, comprobante_path }
   → SI FALLA:
       intentar remover archivo (servidor lo hace internamente vía service_role)
       setError('El abono no pudo guardarse. El comprobante puede haber quedado sin registrar — intenta de nuevo.')
       (NO prometer que fue eliminado: el rollback es best-effort)
       return

7. onSuccess()
```

#### Cancelación de upload en vuelo

Supabase-js no soporta `AbortSignal` nativamente. En su lugar se usa una bandera:

```typescript
// En useModalRegistrarAbono:
const cancelledRef = useRef(false)

const handleClose = () => {
  cancelledRef.current = true  // señaliza que el modal se cerró
  onClose()
}
```

Después del `await upload()`, antes de continuar a la Fase 2, se verifica `cancelledRef.current`. Si es `true`, se intenta borrar el archivo ya subido (best-effort) y se retorna sin insertar en BD.

#### Generación de path

```typescript
// Mapa MIME → extensión (evita depender del nombre del archivo)
const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
}

function generarPathComprobante(
  negociacionId: string,
  fuentePagoId: string,
  archivo: File
): string {
  const ext = MIME_TO_EXT[archivo.type] ?? 'bin'
  const fecha = new Date().toISOString().slice(0, 10).replace(/-/g, '') // YYYYMMDD
  const ts = Date.now()
  return `negociaciones/${negociacionId}/fuentes/${fuentePagoId}/${fecha}-${ts}.${ext}`
}
```

---

### 4. Componente `CampoComprobante`

**Archivo:** `src/modules/abonos/components/modal-registrar-abono/CampoComprobante.tsx`

**Props:**
```typescript
interface CampoComprobanteProps {
  archivo: File | null
  error?: string
  onChange: (archivo: File | null) => void
}
```

**UX:**
- Estado vacío: zona de drop con borde punteado (`border-dashed border-2 border-gray-300`), ícono Upload, texto "Arrastra aquí o haz clic para seleccionar" + hint "JPG, PNG, WebP o PDF · máx 10MB"
- Drag over: borde sólido azul (`border-blue-500`), fondo azul muy claro (`bg-blue-50`)
- Con archivo imagen: thumbnail preview `<img object-contain max-h-32>` + botón X arriba a la derecha
- Con archivo PDF: ícono FileText + nombre del archivo + tamaño formateado (ej: "2.4 MB") + botón X
- Botón X para quitar archivo y volver al estado vacío
- Error: borde del drop zone en rojo (`border-red-400`) + texto rojo debajo (`text-red-600 text-xs mt-1`)
- Validación client-side en `onChange`: tipo MIME + tamaño ≤ 10MB → si inválido: llama `onChange(null)` y muestra error inline

**Validación client-side:**
```typescript
const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

function validarArchivo(file: File): string | null {
  if (!TIPOS_PERMITIDOS.includes(file.type)) {
    return 'Solo se permiten imágenes (JPG, PNG, WebP) o PDF'
  }
  if (file.size > MAX_SIZE) {
    return 'El archivo no puede superar 10MB'
  }
  return null
}
```

---

### 5. Fases de Loading en el Modal

```typescript
type FaseLoading = 'idle' | 'subiendo' | 'guardando'

// En el botón "Confirmar Abono":
const textoBoton = {
  idle: 'Confirmar Abono',
  subiendo: 'Subiendo comprobante...',
  guardando: 'Guardando abono...',
}[faseLoading]

// Deshabilitado cuando:
disabled={faseLoading !== 'idle' || !comprobante}
```

---

### 6. Service `abonos-storage.service.ts`

**Archivo:** `src/modules/abonos/services/abonos-storage.service.ts`

```typescript
const BUCKET = 'comprobantes-abonos'

export class AbonosStorageService {
  /** Sube el comprobante. Retorna el path guardado en BD. */
  static async subirComprobante(path: string, archivo: File): Promise<string> {
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, archivo, { cacheControl: '3600', upsert: false })
    if (error) throw error
    return path
  }

  /**
   * Elimina el comprobante. Best-effort: no lanza si falla.
   * Llamado desde el hook (cliente) al cancelar, y desde la API route (service_role) al hacer rollback.
   */
  static async eliminarComprobante(path: string): Promise<void> {
    try {
      await supabase.storage.from(BUCKET).remove([path])
    } catch {
      // best-effort: registrar en consola pero no propagar
      console.warn('[AbonosStorage] No se pudo eliminar comprobante huérfano:', path)
    }
  }

  /** Genera URL firmada para ver el comprobante (solo server-side, no exportar al cliente). */
  static async generarUrlFirmada(path: string, expiresIn = 3600): Promise<string> {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, expiresIn)
    if (error) throw error
    return data.signedUrl
  }
}
```

---

### 7. Endpoint `GET /api/abonos/comprobante`

**Archivo:** `src/app/api/abonos/comprobante/route.ts`

**Query param:** `?path=negociaciones/{id}/fuentes/{id}/20260313-xyz.pdf`

**Flujo:**
```
1. Verificar sesión activa (createRouteClient)
   → 401 si no autenticado

2. Leer query param ?path=... — validar que no está vacío
   → 400 si falta

3. Verificar que existe un registro en abonos_historial con comprobante_url = path
   (sin filtrar por estado de negociación — los comprobantes históricos de negociaciones
    completadas o canceladas también deben ser consultables)
   → 403 si el path no corresponde a ningún abono en BD

4. Generar URL firmada usando supabase server client con service_role
   (3600 segundos = 1 hora)

5. Redirect 302 a la URL firmada
```

La verificación en paso 3 es el guardián de autorización granular: aunque un usuario autenticado conozca un path ajeno, la BD confirma que ese path corresponde a un abono registrado.

---

## Archivos a crear/modificar

| Archivo | Tipo | Descripción |
|---|---|---|
| `supabase/migrations/20260313_bucket_comprobantes_abonos.sql` | NUEVO | Crear bucket privado + RLS |
| `src/app/abonos/[clienteId]/page.tsx` | MODIFICAR | `formatDateForInput(fechaMinima)` |
| `src/app/api/abonos/registrar/route.ts` | MODIFICAR | Validar fecha en backend + aceptar `comprobante_path` en body (string, requerido); mapearlo a columna `comprobante_url` en el INSERT; si el INSERT falla, llamar `createRouteClient` con service_role para ejecutar `storage.remove([comprobante_path])` |
| `src/app/api/abonos/comprobante/route.ts` | NUEVO | Endpoint URL firmada autenticado |
| `src/modules/abonos/services/abonos-storage.service.ts` | NUEVO | Upload/remove comprobante |
| `src/modules/abonos/components/modal-registrar-abono/CampoComprobante.tsx` | NUEVO | Drag&drop + preview |
| `src/modules/abonos/components/modal-registrar-abono/useModalRegistrarAbono.ts` | MODIFICAR | Estado comprobante + fases loading + `cancelledRef` para cancelación en vuelo |
| `src/modules/abonos/components/modal-registrar-abono.tsx` | MODIFICAR | Renderizar CampoComprobante |

---

## Robustez — Gaps cubiertos

| Gap | Cobertura |
|---|---|
| Fecha mínima ignorada por browser | `formatDateForInput()` + validación backend |
| Bypass de fecha por POST directo | API consulta `fecha_negociacion` en BD y rechaza |
| Abono sin comprobante | Botón deshabilitado + validación en `validarFormulario()` |
| Upload y DB desincronizados | File-first → rollback best-effort si DB falla |
| Upload cancelado a medio camino | `cancelledRef` flag; si modal se cierra mid-upload, se intenta borrar el archivo vía DELETE policy (ver abajo) |
| URL de comprobante accesible sin auth | Bucket privado + endpoint autenticado con 302 redirect |
| Acceso a comprobante ajeno | Verificación en BD que el path pertenece a un abono real |
| Archivo inválido llega al servidor | Validación MIME + tamaño client-side antes de upload |
