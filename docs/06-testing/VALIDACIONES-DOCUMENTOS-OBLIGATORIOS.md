# 🔒 Validaciones de Documentos Obligatorios - Módulo Negociaciones

## 📅 Fecha: 20 de octubre de 2025

---

## 🎯 REGLAS CRÍTICAS IMPLEMENTADAS

### 1️⃣ **Cédula de Ciudadanía del Cliente (OBLIGATORIA)**

**Validación**: ANTES de crear cualquier negociación

**Regla**:
```
SI cliente.documento_identidad_url === null
  → BLOQUEAR creación de negociación
  → MOSTRAR error: "El cliente debe tener cargada su cédula de ciudadanía antes de crear una negociación"
```

**Implementado en**:
- `src/modules/clientes/hooks/useCrearNegociacion.ts`
- Función: `validarDocumentoIdentidad()`

**Flujo**:
```typescript
const validarDocumentoIdentidad = async (clienteId: string): Promise<boolean> => {
  const cliente = await clientesService.obtenerCliente(clienteId)

  if (!cliente.documento_identidad_url) {
    setError('El cliente debe tener cargada su cédula de ciudadanía...')
    return false
  }

  return true
}
```

**Ubicación en el flujo**:
```
Usuario intenta crear negociación
  ↓
1. Validar datos del formulario ✓
2. ⚠️ VALIDAR CÉDULA DEL CLIENTE ✓ ← NUEVO
3. Verificar negociación activa existente ✓
4. Crear negociación ✓
```

---

### 2️⃣ **Carta de Aprobación - Crédito Hipotecario (OBLIGATORIA)**

**Validación**: ANTES de guardar fuentes de pago

**Regla**:
```
SI tipo_fuente === 'Crédito Hipotecario'
  Y carta_aprobacion_url === null
  → BLOQUEAR guardado
  → MOSTRAR error: "Crédito Hipotecario requiere carta de aprobación del banco"
```

**Campo en DB**: `fuentes_pago.carta_aprobacion_url`

**UI Implementada**:
- Zona de drop para subir archivo
- Formatos aceptados: PDF, JPG, PNG
- Estado visual:
  - ❌ Sin documento: zona de drop con borde punteado morado
  - ✅ Con documento: badge verde + link "Ver documento" + botón "Cambiar"
- Hint: _"Documento obligatorio antes de activar la negociación"_

---

### 3️⃣ **Carta de Aprobación - Subsidio Caja Compensación (OBLIGATORIA)**

**Validación**: ANTES de guardar fuentes de pago

**Regla**:
```
SI tipo_fuente === 'Subsidio Caja Compensación'
  Y carta_aprobacion_url === null
  → BLOQUEAR guardado
  → MOSTRAR error: "Subsidio Caja Compensación requiere carta de aprobación"
```

**Campo en DB**: `fuentes_pago.carta_aprobacion_url`

**UI Implementada**: Igual que Crédito Hipotecario

---

## 📋 TABLA DE DOCUMENTOS REQUERIDOS

| Fuente de Pago | Cédula Cliente | Carta de Aprobación | Entidad | Nº Referencia |
|---|---|---|---|---|
| **Cuota Inicial** | ✅ Obligatoria | ❌ No requiere | ❌ No | ❌ No |
| **Crédito Hipotecario** | ✅ Obligatoria | ✅ **OBLIGATORIA** | ✅ Select de bancos | ✅ Opcional |
| **Subsidio Mi Casa Ya** | ✅ Obligatoria | ❌ No requiere | ❌ No | ✅ Opcional |
| **Subsidio Caja Compensación** | ✅ Obligatoria | ✅ **OBLIGATORIA** | ✅ Input texto | ✅ Opcional |

---

## 🛠️ IMPLEMENTACIÓN TÉCNICA

### Servicio: `fuentes-pago.service.ts`

**Nuevo método**: `subirCartaAprobacion()`

```typescript
async subirCartaAprobacion(datos: SubirCartaAprobacionDTO): Promise<string> {
  // 1. Validar fuente existe
  // 2. Generar nombre único del archivo
  // 3. Subir a Supabase Storage (bucket: documentos-clientes)
  // 4. Obtener URL pública
  // 5. Actualizar campo carta_aprobacion_url en fuentes_pago
  // 6. Retornar URL
}
```

**Nuevo método**: `validarDocumentosRequeridos()`

```typescript
async validarDocumentosRequeridos(negociacionId: string): Promise<{
  valido: boolean
  errores: string[]
}> {
  const fuentes = await obtenerFuentesPagoNegociacion(negociacionId)
  const errores = []

  // Validar cada fuente según su tipo
  if (tipo === 'Crédito Hipotecario' && !carta_aprobacion_url) {
    errores.push('Crédito Hipotecario requiere carta...')
  }

  if (tipo === 'Subsidio Caja Compensación' && !carta_aprobacion_url) {
    errores.push('Subsidio Caja Compensación requiere carta...')
  }

  return { valido: errores.length === 0, errores }
}
```

**Nuevo DTO**:
```typescript
interface SubirCartaAprobacionDTO {
  fuentePagoId: string
  archivo: File
  tipoDocumento: 'aprobacion' | 'asignacion'
}
```

---

### Hook: `useCrearNegociacion.ts`

**Validación agregada**:

```typescript
// ANTES (solo 2 validaciones)
const crearNegociacion = async () => {
  1. validarDatos() ✓
  2. existeNegociacionActiva() ✓
  3. crearNegociacion() ✓
}

// DESPUÉS (3 validaciones)
const crearNegociacion = async () => {
  1. validarDatos() ✓
  2. validarDocumentoIdentidad() ✓ ← NUEVO
  3. existeNegociacionActiva() ✓
  4. crearNegociacion() ✓
}
```

---

### Componente: `CierreFinanciero.tsx`

**Nuevos elementos UI**:

1. **Estado**: `subiendoArchivo: string | null`
2. **Función**: `subirCartaAprobacion()`
3. **Campo condicional**: Solo visible si tipo requiere documento
4. **Validación en `guardarFuentes()`**:

```typescript
// ⚠️ Validar documentos requeridos
for (const fuente of fuentesPago) {
  if (fuente.tipo === 'Crédito Hipotecario' && !fuente.carta_aprobacion_url) {
    setError('Crédito Hipotecario requiere carta de aprobación del banco')
    return
  }
  if (fuente.tipo === 'Subsidio Caja Compensación' && !fuente.carta_aprobacion_url) {
    setError('Subsidio Caja Compensación requiere carta de aprobación')
    return
  }
}
```

**Upload UI**:
```tsx
{(fuente.tipo === 'Crédito Hipotecario' || fuente.tipo === 'Subsidio Caja Compensación') && (
  <div>
    <label>Carta de Aprobación <span className="text-red-500">*</span></label>

    {fuente.carta_aprobacion_url ? (
      // Documento YA cargado
      <div className="border-green bg-green">
        ✓ Documento cargado
        <a href={url}>Ver documento</a>
        <button>Cambiar</button>
      </div>
    ) : (
      // Zona de drop
      <label className="border-dashed">
        <Upload /> Subir carta (PDF, JPG, PNG)
        <input type="file" accept=".pdf,.jpg,.jpeg,.png" />
      </label>
    )}

    <p>Documento obligatorio antes de activar la negociación</p>
  </div>
)}
```

---

## 🔐 PUNTOS DE VALIDACIÓN

### Validación 1: Al crear negociación
**Archivo**: `useCrearNegociacion.ts`
**Línea**: ~105-120
**Condición**: `!cliente.documento_identidad_url`
**Bloquea**: Creación de negociación

### Validación 2: Al guardar fuentes
**Archivo**: `cierre-financiero.tsx`
**Línea**: ~285-295
**Condición**: Fuente requiere documento Y no tiene `carta_aprobacion_url`
**Bloquea**: Guardado de fuentes

### Validación 3: Al activar negociación
**Archivo**: `cierre-financiero.tsx`
**Línea**: ~330-340
**Condición**: `verificarCierreFinancieroCompleto()` incluye validación de documentos
**Bloquea**: Activación de negociación

---

## 📁 STORAGE EN SUPABASE

**Bucket**: `documentos-clientes`

**Estructura de carpetas**:
```
documentos-clientes/
├── fuentes-pago/
│   ├── {fuentePagoId}/
│   │   ├── aprobacion-{timestamp}.pdf
│   │   ├── aprobacion-{timestamp}.jpg
│   │   └── asignacion-{timestamp}.pdf
│   └── ...
└── clientes/
    └── {clienteId}/
        └── cedula-{timestamp}.pdf
```

**Naming convention**:
```
fuentes-pago/{fuentePagoId}/{tipoDocumento}-{timestamp}.{extension}
```

**Permisos**: Públicos (URL pública generada automáticamente)

---

## 🎨 ESTADOS VISUALES

### Sin documento cargado
```
┌─────────────────────────────────────┐
│  ↑  Subir carta de aprobación      │
│     (PDF, JPG, PNG)                 │
│  Zona con borde punteado morado     │
└─────────────────────────────────────┘
  Documento obligatorio antes de activar
```

### Subiendo documento
```
┌─────────────────────────────────────┐
│  ⟳  Subiendo...                     │
│  Loader animado                     │
└─────────────────────────────────────┘
```

### Documento ya cargado
```
┌─────────────────────────────────────┐
│  ✓  Documento cargado               │
│     Ver documento  [Cambiar]        │
│  Fondo verde con check              │
└─────────────────────────────────────┘
```

---

## 🚨 MENSAJES DE ERROR

| Escenario | Mensaje de Error |
|-----------|------------------|
| Cliente sin cédula | "El cliente debe tener cargada su cédula de ciudadanía antes de crear una negociación" |
| Crédito sin carta | "Crédito Hipotecario requiere carta de aprobación del banco" |
| Subsidio caja sin carta | "Subsidio Caja Compensación requiere carta de aprobación" |
| Error al subir | "Error subiendo documento: {detalle}" |

---

## ✅ CHECKLIST DE TESTING

### Test 1: Validar cédula al crear negociación
- [ ] Intentar crear negociación con cliente SIN cédula
- [ ] **Verificar**: Modal se cierra y muestra error
- [ ] **Verificar**: Negociación NO se crea
- [ ] Subir cédula del cliente
- [ ] **Verificar**: Ahora sí permite crear negociación

### Test 2: Validar carta de crédito hipotecario
- [ ] Agregar fuente "Crédito Hipotecario"
- [ ] Llenar monto, banco, referencia
- [ ] NO subir carta de aprobación
- [ ] Click "Guardar Fuentes"
- [ ] **Verificar**: Muestra error "requiere carta de aprobación"
- [ ] Subir carta de aprobación (PDF)
- [ ] **Verificar**: Se muestra "✓ Documento cargado"
- [ ] Click "Guardar Fuentes"
- [ ] **Verificar**: Se guarda exitosamente

### Test 3: Validar carta de subsidio caja
- [ ] Agregar fuente "Subsidio Caja Compensación"
- [ ] Llenar monto, entidad, referencia
- [ ] NO subir carta de aprobación
- [ ] Click "Guardar Fuentes"
- [ ] **Verificar**: Muestra error "requiere carta de aprobación"
- [ ] Subir carta de aprobación (JPG)
- [ ] **Verificar**: Se muestra "✓ Documento cargado"
- [ ] Click "Guardar Fuentes"
- [ ] **Verificar**: Se guarda exitosamente

### Test 4: Verificar que NO se requiere para otras fuentes
- [ ] Agregar "Cuota Inicial"
- [ ] **Verificar**: NO aparece campo de carta
- [ ] Agregar "Subsidio Mi Casa Ya"
- [ ] **Verificar**: NO aparece campo de carta
- [ ] Guardar sin problemas

### Test 5: Upload de archivos
- [ ] Intentar subir archivo > 5MB
- [ ] **Verificar**: Manejo de error
- [ ] Subir PDF válido
- [ ] **Verificar**: URL pública generada
- [ ] Click "Ver documento"
- [ ] **Verificar**: Abre en nueva pestaña
- [ ] Click "Cambiar"
- [ ] Subir nuevo archivo
- [ ] **Verificar**: Reemplaza el anterior

---

## 📊 IMPACTO

**Seguridad Legal**:
- ✅ Garantiza trazabilidad documental
- ✅ Cumple con requisitos legales de aprobaciones
- ✅ Previene negociaciones sin respaldo

**Experiencia de Usuario**:
- ✅ Validaciones claras y tempranas
- ✅ Mensajes de error específicos
- ✅ UI intuitiva para upload de archivos
- ✅ Feedback visual de documentos cargados

**Calidad de Datos**:
- ✅ No se pueden activar negociaciones incompletas
- ✅ 100% de negociaciones con documentación requerida
- ✅ Auditoría completa de documentos

---

## 📁 ARCHIVOS MODIFICADOS

1. ✅ `src/modules/clientes/hooks/useCrearNegociacion.ts`
   - Agregada función `validarDocumentoIdentidad()`
   - Integrada en flujo de `crearNegociacion()`

2. ✅ `src/modules/clientes/services/fuentes-pago.service.ts`
   - Agregado método `subirCartaAprobacion()`
   - Agregado método `validarDocumentosRequeridos()`
   - Agregado DTO `SubirCartaAprobacionDTO`

3. ✅ `src/modules/clientes/components/negociaciones/cierre-financiero.tsx`
   - Agregado estado `subiendoArchivo`
   - Agregada función `subirCartaAprobacion()`
   - Agregado campo UI de upload condicional
   - Agregadas validaciones en `guardarFuentes()`
   - Agregado import `FileText`, `Upload`

---

## 🎯 RESUMEN EJECUTIVO

**3 validaciones críticas implementadas**:
1. ✅ Cédula del cliente (obligatoria para crear negociación)
2. ✅ Carta de aprobación para Crédito Hipotecario
3. ✅ Carta de aprobación para Subsidio Caja Compensación

**Puntos de bloqueo**:
- ❌ No se puede crear negociación sin cédula del cliente
- ❌ No se puede guardar fuente de pago sin documento requerido
- ❌ No se puede activar negociación sin documentos completos

**UI implementada**:
- ✅ Zona de drop para archivos
- ✅ Estados visuales (sin doc, subiendo, cargado)
- ✅ Link para ver documentos cargados
- ✅ Botón para cambiar/reemplazar documentos

**Seguridad**:
- ✅ Archivos almacenados en Supabase Storage
- ✅ URLs públicas únicas
- ✅ Validación de formatos (PDF, JPG, PNG)
- ✅ Naming convention con timestamp

---

**Fecha de implementación**: 20 de octubre de 2025
**Errores TypeScript**: 0 ✅
**Estado**: ✅ Completado y listo para testing
**Próximo paso**: Testing end-to-end del flujo completo con validaciones de documentos
