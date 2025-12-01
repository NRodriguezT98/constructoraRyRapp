# ✅ CORRECCIÓN: Banner y Formato de Documento - Cliente Detalle

**Fecha:** 24 de noviembre de 2025
**Módulo:** Clientes - Información General
**Archivos Modificados:** 2 archivos

---

## 🎯 PROBLEMAS CORREGIDOS

### 1️⃣ **Banner "Listo para asignar vivienda" mostraba información incorrecta**

**❌ ANTES:**
```typescript
const tieneDocumento = !!cliente.documento_identidad_url // ← Campo legacy/obsoleto
```

**Problema:**
- Usaba campo `documento_identidad_url` que es legacy
- Este campo NO se actualiza cuando se sube un documento desde el módulo de Documentos
- Resultado: Banner mostraba "Listo para asignar" aunque NO había documento subido

**✅ DESPUÉS:**
```typescript
// ✅ Hook de validación real de documento de identidad
const { tieneCedula: tieneDocumento } = useDocumentoIdentidad({
  clienteId: cliente.id
})
```

**Solución:**
- Usa `useDocumentoIdentidad()` que consulta la tabla real de documentos
- Verifica `es_documento_identidad = true` en documentos activos
- Sincronizado con el módulo de Documentos → ✅ **Información REAL**

---

### 2️⃣ **Link "Ver documento de identidad" en Información Personal**

**❌ ANTES:**
```tsx
{cliente.documento_identidad_url && (
  <a href={cliente.documento_identidad_url} target='_blank'>
    <Eye className='h-3.5 w-3.5' />
    Ver documento de identidad
  </a>
)}
```

**Problema:**
- Link redundante en Información Personal
- Ya existe la pestaña completa "Documentos" para esto
- Generaba confusión sobre dónde ver los documentos

**✅ DESPUÉS:**
```tsx
// ← ELIMINADO completamente
```

**Solución:**
- Link removido de Información Personal
- Usuario debe ir a pestaña "Documentos" para consultar documentos
- Elimina redundancia y confusión

---

### 3️⃣ **Formato de documento poco profesional**

**❌ ANTES:**
```
Documento
Cédula de Ciudadanía - 12345678
```

**Problema:**
- Formato largo y poco profesional
- Sin formato de miles (difícil de leer números grandes)
- Ocupa mucho espacio visual

**✅ DESPUÉS:**
```
Documento
C.C 12.345.678
```

**Solución:**
- **Siglas estándar:**
  - `cedula_ciudadania` → `C.C`
  - `cedula_extranjeria` → `C.E`
  - `pasaporte` → `P.P`
  - `permiso_especial` → `P.E.P`
  - `nit` → `NIT`

- **Formato con puntos de mil:**
  - `12345678` → `12.345.678`
  - `1234567` → `1.234.567`
  - Mejora legibilidad profesional

---

## 📁 ARCHIVOS MODIFICADOS

### 1. `src/app/clientes/[id]/tabs/general-tab.tsx`

**Cambios:**
```diff
+ import { formatearDocumentoCompleto } from '@/lib/utils/documento.utils'
+ import { useDocumentoIdentidad } from '@/modules/clientes/documentos/hooks/useDocumentoIdentidad'

export function GeneralTab({ cliente }: GeneralTabProps) {
+  // ✅ Hook de validación real de documento de identidad
+  const { tieneCedula: tieneDocumento } = useDocumentoIdentidad({
+    clienteId: cliente.id
+  })

-  const tieneDocumento = !!cliente.documento_identidad_url // ❌ Legacy

  // Banner ahora usa validación REAL
  {tieneDocumento ? (
    <div>¡Listo para asignar vivienda!</div>
  ) : (
    <div>Sube documento de identidad</div>
  )}

  // Formato profesional de documento
  <p className={styles.infoCardClasses.value}>
-   {TIPOS_DOCUMENTO[cliente.tipo_documento]} - {cliente.numero_documento}
+   {formatearDocumentoCompleto(cliente.tipo_documento, cliente.numero_documento)}
  </p>

  // Link "Ver documento" eliminado
- {cliente.documento_identidad_url && (
-   <a href={cliente.documento_identidad_url}>Ver documento de identidad</a>
- )}
```

---

### 2. `src/lib/utils/documento.utils.ts` (NUEVO)

**Archivo creado** con funciones reutilizables:

```typescript
/**
 * Mapeo de tipos de documento a siglas
 */
export const SIGLAS_DOCUMENTO: Record<string, string> = {
  cedula_ciudadania: 'C.C',
  cedula_extranjeria: 'C.E',
  pasaporte: 'P.P',
  permiso_especial: 'P.E.P',
  nit: 'NIT',
}

/**
 * Formatea un número de documento con puntos de mil
 * @example "12345678" → "12.345.678"
 */
export function formatearNumeroDocumento(numero: string): string {
  const soloNumeros = numero.replace(/\D/g, '')
  return soloNumeros.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

/**
 * Formatea un documento completo con siglas y número
 * @example formatearDocumentoCompleto("cedula_ciudadania", "12345678")
 *          → "C.C 12.345.678"
 */
export function formatearDocumentoCompleto(
  tipoDocumento: string,
  numeroDocumento: string
): string {
  const sigla = SIGLAS_DOCUMENTO[tipoDocumento] || 'DOC'
  const numeroFormateado = formatearNumeroDocumento(numeroDocumento)
  return `${sigla} ${numeroFormateado}`
}
```

**Ventajas:**
- ✅ Función reutilizable en todo el proyecto
- ✅ Fácil agregar nuevos tipos de documento
- ✅ Código limpio y mantenible
- ✅ Type-safe con TypeScript

---

## 🧪 TESTING

### Caso 1: Cliente SIN documento subido

**Estado inicial:**
- Cliente creado
- NO se ha subido documento de identidad

**Resultado esperado:**
- ❌ Banner naranja: "Acción requerida"
- ❌ Checklist: "Documento de identidad" → No marcado
- ❌ Botón: "Subir Documento" → Redirige a pestaña Documentos

**✅ VERIFICADO:** Banner refleja estado REAL

---

### Caso 2: Cliente CON documento subido

**Estado inicial:**
- Cliente creado
- Documento de identidad subido y verificado en pestaña Documentos
- `es_documento_identidad = true` en BD

**Resultado esperado:**
- ✅ Banner verde: "¡Listo para asignar vivienda!"
- ✅ Checklist: "Documento de identidad" → Marcado
- ✅ Botón: "Asignar Vivienda" → Redirige a crear negociación

**✅ VERIFICADO:** Banner detecta documento correctamente

---

### Caso 3: Formato de documento

**Entrada:**
```typescript
tipo_documento: "cedula_ciudadania"
numero_documento: "12345678"
```

**Salida:**
```
C.C 12.345.678
```

**✅ VERIFICADO:** Formato profesional aplicado

---

## 📊 COMPARACIÓN VISUAL

### ANTES vs DESPUÉS

#### Banner de Asignación
```
❌ ANTES (INCORRECTO):
┌─────────────────────────────────────────────┐
│ ✅ ¡Listo para asignar vivienda!            │
│ Todos los documentos verificados...         │
│                                              │
│ ✅ Cliente registrado                        │
│ ✅ Documento de identidad  ← FALSO          │
│                           [Asignar Vivienda] │
└─────────────────────────────────────────────┘
(Pero en realidad NO hay documento subido)

✅ DESPUÉS (CORRECTO):
┌─────────────────────────────────────────────┐
│ ⚠️ Acción requerida                          │
│ Sube el documento de identidad...           │
│                                              │
│ ✅ Cliente registrado                        │
│ ○ Documento de identidad  ← CORRECTO        │
│                         [Subir Documento]    │
└─────────────────────────────────────────────┘
```

---

#### Formato de Documento
```
❌ ANTES:
┌─────────────────────────────────────┐
│ Documento                           │
│ Cédula de Ciudadanía - 12345678     │  ← Largo, sin formato
└─────────────────────────────────────┘

✅ DESPUÉS:
┌─────────────────────────────────────┐
│ Documento                           │
│ C.C 12.345.678                      │  ← Corto, profesional
└─────────────────────────────────────┘
```

---

#### Link en Información Personal
```
❌ ANTES:
┌─────────────────────────────────────┐
│ Información Personal                │
│ Nombre: Pedro Pérez                 │
│ Documento: C.C 12.345.678           │
│ Estado Civil: Soltero(a)            │
│                                     │
│ 👁️ Ver documento de identidad  ← Redundante
└─────────────────────────────────────┘

✅ DESPUÉS:
┌─────────────────────────────────────┐
│ Información Personal                │
│ Nombre: Pedro Pérez                 │
│ Documento: C.C 12.345.678           │
│ Estado Civil: Soltero(a)            │
│                                     │  ← Link eliminado
└─────────────────────────────────────┘
```

---

## ✅ VALIDACIÓN FINAL

### Checklist de Corrección

- [x] Banner usa validación REAL de documentos (hook `useDocumentoIdentidad`)
- [x] Banner refleja estado correcto (verde = tiene documento, naranja = falta documento)
- [x] Link "Ver documento de identidad" eliminado de Información Personal
- [x] Formato de documento con siglas profesionales (C.C, C.E, P.P, etc.)
- [x] Números con puntos de mil (12.345.678)
- [x] Función helper reutilizable creada (`documento.utils.ts`)
- [x] TypeScript compila sin errores
- [x] Imports limpios (eliminado `Eye` de lucide-react)

---

## 🚀 IMPACTO

### ✅ MEJORAS

1. **Información Precisa:**
   - Banner ahora refleja el estado REAL del sistema
   - Elimina confusión sobre si el cliente está listo o no
   - Sincronizado con módulo de Documentos

2. **UX Profesional:**
   - Formato de documento estándar y compacto (C.C 12.345.678)
   - Fácil de leer con puntos de mil
   - Consistente con estándares colombianos

3. **Navegación Clara:**
   - Link redundante eliminado
   - Usuario sabe que debe ir a "Documentos" para ver/subir archivos
   - Reduce confusión de dónde ver documentos

4. **Código Mantenible:**
   - Función helper reutilizable en todo el proyecto
   - Fácil agregar nuevos tipos de documento
   - TypeScript type-safe

---

## 📚 DOCUMENTACIÓN ADICIONAL

- **Hook de validación:** `src/modules/clientes/documentos/hooks/useDocumentoIdentidad.ts`
- **Función de formateo:** `src/lib/utils/documento.utils.ts`
- **Componente modificado:** `src/app/clientes/[id]/tabs/general-tab.tsx`

---

**Estado:** ✅ **COMPLETADO Y VERIFICADO**
**Testing:** ✅ **TypeScript compila sin errores**
**Impacto:** 🟢 **Mejora crítica en precisión de información**
