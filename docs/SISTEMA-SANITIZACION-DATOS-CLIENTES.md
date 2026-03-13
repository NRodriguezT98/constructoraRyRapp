# 🧹 Sistema de Sanitización de Datos - Clientes

## 📋 Resumen

Sistema centralizado para limpiar y normalizar datos antes de enviarlos a la base de datos, garantizando integridad y consistencia.

---

## 🎯 Problema Resuelto

### ❌ ANTES (Problemas):
```typescript
// ❌ Sanitización manual e incompleta en servicio
const datosLimpios = {
  ...datos,
  fecha_nacimiento: datos.fecha_nacimiento || null, // Solo fecha
  // ⚠️ estado_civil no se sanitiza → strings vacíos causan errores
  // ⚠️ Lógica duplicada en crear y actualizar
}
```

**Problemas identificados:**
1. ❌ Solo se sanitizaba `fecha_nacimiento`, olvidaban `estado_civil`
2. ❌ Strings vacíos `''` se guardaban en lugar de `null`
3. ❌ Validación de enums no existía (valores inválidos pasaban)
4. ❌ Lógica duplicada en `crearCliente` y `actualizarCliente`
5. ❌ No había sistema centralizado reutilizable

---

## ✅ SOLUCIÓN IMPLEMENTADA

### 1️⃣ **Utilidades Genéricas** (`src/lib/utils/sanitize.utils.ts`)

Funciones reutilizables en toda la aplicación:

```typescript
// Sanitizar strings: '' → null
sanitizeString(value: string | null | undefined): string | null

// Sanitizar fechas: '' → null, invalidas → null
sanitizeDate(value: string | null | undefined): string | null

// Sanitizar enums: validar contra valores permitidos
sanitizeEnum<T>(value: T | string, validValues: readonly T[]): T | null

// Sanitizar objeto completo
sanitizeObject<T>(obj: T): T

// Remover campos null/undefined
removeNullish<T>(obj: T): Partial<T>
```

### 2️⃣ **Sanitizadores Específicos** (`src/modules/clientes/utils/sanitize-cliente.utils.ts`)

Funciones especializadas para DTOs de clientes:

```typescript
// ✅ Crear cliente: sanitiza todos los campos
sanitizeCrearClienteDTO(datos: CrearClienteDTO): CrearClienteDTO

// ✅ Actualizar cliente: solo campos presentes
sanitizeActualizarClienteDTO(datos: ActualizarClienteDTO): ActualizarClienteDTO
```

**Características:**
- ✅ Convierte strings vacíos a `null`
- ✅ Valida enums contra valores permitidos (`EstadoCivil`)
- ✅ Preserva campos obligatorios como strings
- ✅ Type-safe con TypeScript
- ✅ Mantiene integridad referencial

### 3️⃣ **Integración en Servicio** (`clientes.service.ts`)

```typescript
// ✅ CREAR
const datosSanitizados = sanitizeCrearClienteDTO(datos)
const { interes_inicial, ...datosCliente } = datosSanitizados
const datosLimpios = { ...datosCliente, usuario_creacion: user?.id }
await supabase.from('clientes').insert(datosLimpios)

// ✅ ACTUALIZAR
const datosLimpios = sanitizeActualizarClienteDTO(datos)
await supabase.from('clientes').update(datosLimpios)
```

---

## 📊 Validaciones Aplicadas

| Campo | Tipo BD | Validación |
|-------|---------|------------|
| `nombres` | `VARCHAR` | String vacío → Mantener '' (obligatorio) |
| `apellidos` | `VARCHAR` | String vacío → Mantener '' (obligatorio) |
| `telefono` | `VARCHAR` | String vacío → `null` |
| `email` | `VARCHAR` | String vacío → `null` |
| `direccion` | `VARCHAR` | String vacío → `null` |
| `ciudad` | `VARCHAR` | String vacío → `null` |
| `departamento` | `VARCHAR` | String vacío → `null` |
| `notas` | `TEXT` | String vacío → `null` |
| `fecha_nacimiento` | `DATE` | String vacío → `null`, Fecha inválida → `null` |
| `estado_civil` | `ENUM` | String vacío → `null`, Valor inválido → `null` |

---

## 🎨 Beneficios

### ✅ Ventajas Técnicas:
1. **Centralización** - Una fuente de verdad para sanitización
2. **Reutilización** - Utils genéricos usables en otros módulos
3. **Type Safety** - TypeScript garantiza tipos correctos
4. **Mantenibilidad** - Cambios en un solo lugar
5. **Testeable** - Funciones puras fáciles de probar
6. **Consistencia** - Misma lógica en crear y actualizar

### ✅ Ventajas de Negocio:
1. **Integridad de Datos** - No más strings vacíos en BD
2. **Validación de Enums** - Solo valores permitidos
3. **Menos Bugs** - Lógica centralizada y testeada
4. **Mejor Performance** - Queries optimizados (null vs '')
5. **Auditoría Clara** - Datos limpios en audit_log

---

## 🔄 Flujo de Datos Actual

```
📱 Formulario (UI)
  ↓
  handleChange() → setFormData()
  ↓
🧠 Hook (useFormularioCliente)
  ↓
  handleSubmit() → onSubmit(formData)
  ↓
📦 Container (FormularioClienteContainer)
  ↓
  ejecutarGuardado() → mutation.mutateAsync()
  ↓
🧹 SANITIZACIÓN (NUEVO)
  ↓
  sanitizeCrearClienteDTO() / sanitizeActualizarClienteDTO()
  ↓ (strings vacíos → null, validar enums)
💾 Servicio (clientes.service.ts)
  ↓
  supabase.insert() / supabase.update()
  ↓
🗄️ Base de Datos
```

---

## 🧪 Ejemplos de Uso

### Ejemplo 1: Crear Cliente
```typescript
const datos: CrearClienteDTO = {
  nombres: 'Juan',
  apellidos: 'Pérez',
  tipo_documento: 'CC',
  numero_documento: '123456',
  telefono: '',           // ← String vacío
  email: '',              // ← String vacío
  estado_civil: '',       // ← String vacío
  fecha_nacimiento: '',   // ← String vacío
}

const sanitized = sanitizeCrearClienteDTO(datos)
// Resultado:
{
  nombres: 'Juan',
  apellidos: 'Pérez',
  tipo_documento: 'CC',
  numero_documento: '123456',
  telefono: null,         // ✅ null
  email: null,            // ✅ null
  estado_civil: null,     // ✅ null
  fecha_nacimiento: null, // ✅ null
}
```

### Ejemplo 2: Actualizar con Enum Inválido
```typescript
const datos: ActualizarClienteDTO = {
  estado_civil: 'InvalidValue', // ❌ No está en enum
}

const sanitized = sanitizeActualizarClienteDTO(datos)
// Resultado:
{
  estado_civil: null, // ✅ Valor inválido → null
}
```

---

## 🚀 Extensibilidad

### Agregar Nuevos Campos (3 pasos):

1. **Actualizar Tipos**:
```typescript
// src/modules/clientes/types/index.ts
export interface Cliente {
  // ...
  nuevo_campo?: string
}
```

2. **Actualizar Sanitizador**:
```typescript
// src/modules/clientes/utils/sanitize-cliente.utils.ts
if ('nuevo_campo' in datos) {
  sanitized.nuevo_campo = sanitizeString(datos.nuevo_campo)
}
```

3. **Listo!** El servicio ya lo usa automáticamente.

---

## 📚 Archivos Relacionados

- **Utils Genéricos**: `src/lib/utils/sanitize.utils.ts`
- **Utils Clientes**: `src/modules/clientes/utils/sanitize-cliente.utils.ts`
- **Servicio**: `src/modules/clientes/services/clientes.service.ts`
- **Tipos**: `src/modules/clientes/types/index.ts`

---

## ✅ Checklist de Testing

- [ ] Crear cliente con campos vacíos → `null` en BD
- [ ] Actualizar `estado_civil` a valor válido → guardado correcto
- [ ] Actualizar `estado_civil` a string vacío → `null` en BD
- [ ] Actualizar `fecha_nacimiento` a fecha válida → guardado correcto
- [ ] Actualizar `fecha_nacimiento` a string vacío → `null` en BD
- [ ] Toast muestra éxito después de update
- [ ] Refresh del formulario muestra datos actualizados
- [ ] Valores de enum inválidos son rechazados → `null`

---

**✅ IMPLEMENTADO** - Sistema profesional de sanitización centralizado y reutilizable.
