# 🎯 Sistema de Roles en Campos Dinámicos

## ❓ El Problema

**Pregunta del usuario**:
> "Si yo llamo al campo 'Campo1' en lugar de 'monto_aprobado', ¿cómo sabe la aplicación que ese campo contiene el monto para calcular totales y asignar la vivienda?"

## ✅ La Solución: **ROLES**

Cada campo tiene un **rol** que identifica su propósito en el sistema, independientemente de cómo lo nombres.

---

## 📋 Roles Disponibles

| Rol | Emoji | Descripción | Uso en el Sistema | Cantidad Permitida |
|-----|-------|-------------|-------------------|--------------------|
| `monto` | 💰 | Valor monetario principal | Calcular totales, diferencias, validar suma | **UNO POR FUENTE** ⚠️ |
| `entidad` | 🏦 | Banco, caja o cooperativa | Mostrar en reportes, vincular documentos | Múltiples |
| `referencia` | 📄 | Número de radicado/trámite | Buscar, filtrar, auditar | Múltiples |
| `informativo` | ℹ️ | Campo adicional sin rol crítico | Solo almacenar información | Ilimitados |

### ⚠️ Regla CRÍTICA: UN SOLO MONTO

**Solo puede haber UN campo con `rol='monto'` por tipo de fuente.**

**¿Por qué?**
- ✅ **Claridad**: Sistema sabe exactamente qué valor usar para cálculos
- ✅ **Sin ambigüedad**: No hay duda sobre cuál es el "monto principal"
- ✅ **Validación**: Garantiza consistencia en negociaciones

**Validación automática**: Si intentas crear un segundo campo con `rol='monto'`, el sistema mostrará error.

---

## 🎨 Cómo Funciona en la UI Admin

### 1️⃣ Crear Campo con Rol

```
/admin/configuracion/fuentes-pago
→ Configurar "Crédito Hipotecario"
→ Agregar Campo
→ Completar formulario:

┌─────────────────────────────────┐
│ Nombre (ID) *                   │
│ [campo1                       ] │ ← Puedes usar CUALQUIER nombre
├─────────────────────────────────┤
│ Tipo de Campo *                 │
│ [Moneda (COP)              ▼  ] │
├─────────────────────────────────┤
│ Rol del Campo *                 │ ← 🔥 AQUÍ DEFINES EL ROL
│ [💰 Monto Principal         ▼  ] │
│ ℹ️ Campo que contiene el valor   │
│    monetario (usado para         │
│    calcular totales)             │
├─────────────────────────────────┤
│ Etiqueta (Label) *              │
│ [Valor Aprobado               ] │
└─────────────────────────────────┘

→ Guardar
```

**Resultado en BD**:
```json
{
  "nombre": "campo1",
  "tipo": "currency",
  "rol": "monto",
  "label": "Valor Aprobado"
}
```

### 2️⃣ Sistema Identifica Automáticamente

```typescript
// Al calcular total de fuentes
const totalFuentes = fuentes.reduce((sum, fuente) => {
  const camposConfig = obtenerCamposConfig(fuente.tipo)

  // 🔥 Busca campo con rol='monto' (NO por nombre)
  const monto = obtenerMonto(fuente.config, camposConfig)

  return sum + monto
}, 0)
```

---

## 💡 Ejemplos Prácticos

### Ejemplo 1: Campo con Nombre Arbitrario

**Configuración**:
```json
{
  "nombre": "valor_total_credito",  // Nombre custom
  "tipo": "currency",
  "rol": "monto",                   // ← ROL identifica propósito
  "label": "Valor Total del Crédito"
}
```

**Resultado**: Sistema lo reconoce como monto principal ✅

### Ejemplo 2: Múltiples Campos Monetarios

```json
[
  {
    "nombre": "monto_credito",
    "tipo": "currency",
    "rol": "monto",              // ← MONTO PRINCIPAL
    "label": "Monto del Crédito"
  },
  {
    "nombre": "seguros",
    "tipo": "currency",
    "rol": "informativo",        // ← Solo informativo
    "label": "Valor de Seguros"
  },
  {
    "nombre": "comisiones",
    "tipo": "currency",
    "rol": "informativo",        // ← Solo informativo
    "label": "Comisiones"
  }
]
```

**Cálculo de total**: Solo usa `monto_credito` (rol='monto') ✅

### Ejemplo 3: Sin Campo de Monto

```json
[
  {
    "nombre": "descripcion",
    "tipo": "textarea",
    "rol": "informativo",
    "label": "Descripción"
  }
]
```

**Validación**: ❌ Sistema alerta "Debe configurar al menos un campo con rol 'Monto Principal'"

---

## 🔧 API de Utilidades

### `obtenerMonto(config, camposConfig)`

Busca el valor del campo con `rol === 'monto'`

```typescript
import { obtenerMonto } from '@/modules/clientes/utils/fuentes-pago-campos.utils'

const monto = obtenerMonto(fuente.config, camposConfig)
// → Retorna el valor del campo con rol='monto'
// → Fallback a nombres convencionales: monto_aprobado, monto, valor
// → Fallback a propiedad legacy: config.monto_aprobado
```

### `obtenerEntidad(config, camposConfig)`

Busca el valor del campo con `rol === 'entidad'`

```typescript
const entidad = obtenerEntidad(fuente.config, camposConfig)
// → "Banco de Bogotá", "Comfandi", etc.
```

### `obtenerReferencia(config, camposConfig)`

Busca el valor del campo con `rol === 'referencia'`

```typescript
const referencia = obtenerReferencia(fuente.config, camposConfig)
// → "#BCO-2025-789456", "RES-2025-12345", etc.
```

### `validarTieneCampoMonto(camposConfig)`

Valida que exista al menos un campo con `rol === 'monto'`

```typescript
if (!validarTieneCampoMonto(camposConfig)) {
  throw new Error('Debe configurar un campo de monto')
}
```

---

## 🎯 Flujo Completo

```
1. Admin configura campo:
   ┌─────────────────────────┐
   │ Nombre: mi_campo_custom │
   │ Tipo: currency          │
   │ Rol: 💰 Monto          │ ← Define propósito
   └─────────────────────────┘
                ↓
2. Se guarda en BD:
   tipos_fuentes_pago.configuracion_campos
   { "nombre": "mi_campo_custom", "rol": "monto", ... }
                ↓
3. React Query carga configuración:
   useTiposFuentesConCampos() → camposConfig
                ↓
4. Usuario completa formulario:
   [Mi Campo Custom: 50.000.000]
                ↓
5. Se captura valor:
   config.campos = { "mi_campo_custom": 50000000 }
                ↓
6. Sistema calcula total:
   obtenerMonto(config, camposConfig)
   → Busca campo con rol='monto'
   → Encuentra "mi_campo_custom"
   → Retorna 50000000 ✅
                ↓
7. Total calculado correctamente:
   Total Fuentes: $50.000.000
```

---

## ✅ Ventajas del Sistema de Roles

1. **Nombres Libres**: Puedes usar cualquier nombre (campo1, valor_total, monto_credito)
2. **Identificación Clara**: Sistema sabe qué campo usar por su rol, no por su nombre
3. **Múltiples Campos**: Puedes tener varios campos currency, solo uno con rol='monto'
4. **Validación**: Alerta si falta campo crítico (monto, entidad)
5. **Compatibilidad**: Fallback a nombres convencionales y legacy
6. **Type-Safe**: TypeScript garantiza que solo uses roles válidos
7. **UI Intuitiva**: Admin ve badge de rol en cada campo

---

## 🔍 Ejemplos de Configuraciones Reales

### Cuota Inicial (Simple)

```json
{
  "campos": [
    {
      "nombre": "valor_cuota",
      "tipo": "currency",
      "rol": "monto",
      "label": "Valor de Cuota Inicial"
    }
  ]
}
```

### Crédito Hipotecario (Completo)

```json
{
  "campos": [
    {
      "nombre": "monto_aprobado",
      "tipo": "currency",
      "rol": "monto",
      "label": "Monto Aprobado",
      "requerido": true
    },
    {
      "nombre": "banco",
      "tipo": "select_banco",
      "rol": "entidad",
      "label": "Entidad Bancaria",
      "requerido": true
    },
    {
      "nombre": "radicado",
      "tipo": "text",
      "rol": "referencia",
      "label": "Número de Radicado",
      "requerido": false
    },
    {
      "nombre": "tasa_interes",
      "tipo": "number",
      "rol": "informativo",
      "label": "Tasa de Interés (%)",
      "requerido": false
    },
    {
      "nombre": "plazo_meses",
      "tipo": "number",
      "rol": "informativo",
      "label": "Plazo (meses)",
      "requerido": false
    }
  ]
}
```

### Subsidio Custom

```json
{
  "campos": [
    {
      "nombre": "subsidio_monto",
      "tipo": "currency",
      "rol": "monto",
      "label": "Monto del Subsidio"
    },
    {
      "nombre": "entidad_otorgante",
      "tipo": "text",
      "rol": "entidad",
      "label": "Entidad que Otorgó el Subsidio"
    },
    {
      "nombre": "resolucion",
      "tipo": "text",
      "rol": "referencia",
      "label": "Número de Resolución"
    },
    {
      "nombre": "fecha_aprobacion",
      "tipo": "date",
      "rol": "informativo",
      "label": "Fecha de Aprobación"
    }
  ]
}
```

---

## 🚨 Validaciones Importantes

### 1. Un Solo Campo de Monto por Fuente

```typescript
// ❌ INCORRECTO: Dos campos con rol='monto'
[
  { nombre: "monto1", rol: "monto", ... },
  { nombre: "monto2", rol: "monto", ... }
]

// ✅ CORRECTO: Un campo monto, otros informativos
[
  { nombre: "monto_principal", rol: "monto", ... },
  { nombre: "monto_adicional", rol: "informativo", ... }
]
```

### 2. Campo de Monto es Obligatorio

```typescript
// UI Admin valida:
if (!campos.some(c => c.rol === 'monto')) {
  return "Debe configurar al menos un campo de Monto Principal"
}
```

### 3. Rol Apropiado para Tipo

```typescript
// ✅ BUENAS PRÁCTICAS:
{ tipo: "currency", rol: "monto" }        // ← Correcto
{ tipo: "select_banco", rol: "entidad" }  // ← Correcto
{ tipo: "text", rol: "referencia" }       // ← Correcto
{ tipo: "date", rol: "informativo" }      // ← Correcto

// ⚠️ EVITAR (no bloquea pero no tiene sentido):
{ tipo: "text", rol: "monto" }            // ← Usar currency
{ tipo: "number", rol: "entidad" }        // ← Usar select o text
```

---

## ❓ Preguntas Frecuentes

### ¿Por qué solo UN campo puede tener rol='monto'?

**Respuesta**: El `rol='monto'` identifica el **valor principal** de la fuente de pago. Si permitimos múltiples campos con este rol:
- ❌ **Cálculos ambiguos**: ¿Cuál monto usa el sistema para calcular totales?
- ❌ **Confusión**: ¿Cuál es el "monto principal"?
- ❌ **Errores**: Validaciones de suma fallarían

**Solución**: Sistema valida que **exactamente UN campo** tenga `rol='monto'` por tipo de fuente.

**¿Qué pasa si necesito múltiples valores monetarios?**
- ✅ Crea campos adicionales con `rol='informativo'` (ej: "Gastos Notariales", "Comisión")
- ✅ El campo con `rol='monto'` debe ser el **valor principal** que se usa en cálculos de negociaciones

### ¿Qué pasa si llamo al campo "campo1" en lugar de "monto_aprobado"?

**Respuesta**: ¡No hay problema! Puedes usar cualquier nombre. El sistema busca por `rol='monto'`, no por nombre:

```typescript
// ✅ Ambos funcionan igual:
obtenerMonto(config, camposConfig)

// Con rol='monto':
{ nombre: "campo1", rol: "monto" }        // ← Funciona
{ nombre: "valor_total", rol: "monto" }   // ← Funciona
{ nombre: "monto_aprobado", rol: "monto" } // ← Funciona
```

El `rol` es lo importante, no el nombre del campo.

---

## 📚 Resumen

**Antes** (hardcoded):
```typescript
// ❌ Nombre DEBE ser exacto
const monto = config.monto_aprobado
```

**Ahora** (con roles):
```typescript
// ✅ Nombre puede ser CUALQUIERA
const monto = obtenerMonto(config, camposConfig)
// → Busca por rol='monto', no por nombre
```

**¡El sistema es completamente flexible y escalable!** 🎉
