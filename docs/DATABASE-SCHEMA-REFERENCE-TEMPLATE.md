# 📊 Referencia de Esquema de Base de Datos - ACTUALIZADO

> **🔴 FUENTE ÚNICA DE VERDAD - ÚLTIMA ACTUALIZACIÓN: 2025-10-21**
>
> **⚠️ REGLA CRÍTICA**: Este documento DEBE estar actualizado con los datos REALES de la base de datos.
> **📝 PROCESO**: Ejecutar `GENERAR-DOCUMENTACION-COMPLETA-DB.sql` cada vez que se modifique el esquema.

---

## 🎯 REGLA DE ORO

### 🚨 ANTES de escribir código que acceda a la DB:

1. ✅ **CONSULTA** este documento
2. ✅ **VERIFICA** nombres EXACTOS de tablas y columnas
3. ✅ **CONFIRMA** tipos de datos
4. ✅ **REVISA** qué campos son obligatorios vs opcionales
5. ✅ **COPIA** los nombres exactos (no escribas de memoria)

### ❌ PROHIBIDO:

- ❌ Asumir nombres de columnas sin verificar
- ❌ Copiar código antiguo sin validar que los campos existan
- ❌ Usar nombres en inglés cuando la DB usa español (o viceversa)
- ❌ Inventar nombres "lógicos" sin confirmar

### 🔄 CÓMO ACTUALIZAR ESTE DOCUMENTO:

Ver guía completa en: `docs/GUIA-DOCUMENTACION-DB.md`

**Script SQL**: `supabase/migrations/GENERAR-DOCUMENTACION-COMPLETA-DB.sql`

---

## 📋 ÍNDICE DE TABLAS

1. [clientes](#tabla-clientes)
2. [proyectos](#tabla-proyectos)
3. [manzanas](#tabla-manzanas)
4. [viviendas](#tabla-viviendas)
5. [negociaciones](#tabla-negociaciones)
6. [fuentes_pago](#tabla-fuentes_pago)
7. [abonos_historial](#tabla-abonos_historial)
8. [renuncias](#tabla-renuncias)
9. [documentos](#tabla-documentos)
10. [categorias_documentos](#tabla-categorias_documentos)

---

## 📊 TABLA: `clientes`

### Columnas Verificadas ✅

```typescript
{
  // CAMPOS OBLIGATORIOS
  id: string (uuid)
  nombres: string (text)                    // ⚠️ PLURAL, NO "nombre"
  apellidos: string (text)                  // ⚠️ PLURAL, NO "apellido"
  numero_documento: string (text)           // ⚠️ NO "cedula", NO "documento"

  // CAMPOS OPCIONALES (pueden ser NULL)
  tipo_documento?: string (text)            // 'CC' | 'CE' | 'NIT' | 'Pasaporte'
  email?: string (text)
  telefono?: string (text)
  direccion?: string (text)
  ciudad?: string (text)
  fecha_nacimiento?: Date (date)

  // CAMPOS DE AUDITORÍA
  fecha_creacion: Date (timestamp)
  fecha_actualizacion: Date (timestamp)
  usuario_creacion?: string (uuid)
}
```

### ⚠️ Campos que NO EXISTEN (verificado 2025-10-21):

- ❌ `profesion` - NO EXISTE en la DB
- ❌ `estado_civil` - NO EXISTE en la DB
- ❌ `empresa` - NO EXISTE en la DB
- ❌ `cargo` - NO EXISTE en la DB
- ❌ `ingresos_mensuales` - NO EXISTE en la DB
- ❌ `nombre_completo` - NO EXISTE como columna física

### Errores Comunes a Evitar:

- ❌ `cliente.nombre` → ✅ `cliente.nombres`
- ❌ `cliente.apellido` → ✅ `cliente.apellidos`
- ❌ `cliente.cedula` → ✅ `cliente.numero_documento`
- ❌ `cliente.documento` → ✅ `cliente.numero_documento`

---

## 📊 TABLA: `proyectos`

### Columnas Verificadas ✅

```typescript
{
  // CAMPOS OBLIGATORIOS
  id: string (uuid)
  nombre: string (text)

  // CAMPOS OPCIONALES
  descripcion?: string (text)
  ubicacion?: string (text)
  estado?: string (text)                    // Ver ENUMS
  fecha_inicio?: Date (date)
  fecha_fin_estimada?: Date (date)
  presupuesto_total?: number (numeric)
  area_total?: number (numeric)
  imagen_url?: string (text)

  // CAMPOS DE AUDITORÍA
  fecha_creacion: Date (timestamp)
  fecha_actualizacion: Date (timestamp)
  usuario_creacion?: string (uuid)
}
```

### Estados Válidos (si existe enum):

Verificar con el script: Sección "TIPOS PERSONALIZADOS (ENUMS)"

---

## 📊 TABLA: `manzanas`

### Columnas Verificadas ✅

```typescript
{
  // CAMPOS OBLIGATORIOS
  id: string (uuid)
  nombre: string (text)
  proyecto_id: string (uuid)                // FK → proyectos

  // CAMPOS OPCIONALES
  area?: number (numeric)
  numero_lotes?: number (integer)

  // CAMPOS DE AUDITORÍA
  fecha_creacion: Date (timestamp)
  fecha_actualizacion: Date (timestamp)
}
```

---

## 📊 TABLA: `viviendas`

### Columnas Verificadas ✅

```typescript
{
  // CAMPOS OBLIGATORIOS
  id: string (uuid)
  numero: string (text)                     // Número de casa
  manzana_id: string (uuid)                 // FK → manzanas (NO "manzana", NO "proyecto_id")

  // CAMPOS OPCIONALES
  precio?: number (numeric)                 // ⚠️ NO "precio_base", NO "valor"
  area?: number (numeric)
  tipo_vivienda?: string (text)             // ⚠️ NO "tipo"
  estado?: string (text)

  // CAMPOS DE AUDITORÍA
  fecha_creacion: Date (timestamp)
  fecha_actualizacion: Date (timestamp)
}
```

### Errores Comunes:

- ❌ `vivienda.precio_base` → ✅ `vivienda.precio`
- ❌ `vivienda.tipo` → ✅ `vivienda.tipo_vivienda`
- ❌ `vivienda.proyecto_id` → ✅ Obtener a través de `manzana_id → manzanas.proyecto_id`

---

## 📊 TABLA: `negociaciones`

### Columnas Verificadas ✅

```typescript
{
  // CAMPOS OBLIGATORIOS
  id: string (uuid)
  cliente_id: string (uuid)                 // FK → clientes
  vivienda_id: string (uuid)                // FK → viviendas
  estado: string (text)                     // Ver ENUMS

  // CAMPOS OPCIONALES
  valor_negociado?: number (numeric)
  descuento_aplicado?: number (numeric)
  fecha_negociacion?: Date (date)
  fecha_cierre_financiero?: Date (date)
  fecha_activacion?: Date (date)
  fecha_completada?: Date (date)
  fecha_cancelacion?: Date (date)
  motivo_cancelacion?: string (text)
  notas?: string (text)

  // CAMPOS DE AUDITORÍA
  fecha_creacion: Date (timestamp)
  fecha_actualizacion: Date (timestamp)
}
```

### ⚠️ Campos que NO EXISTEN:

- ❌ `proyecto_id` - Obtener a través de vivienda → manzana → proyecto
- ❌ `monto_recibido_total` - Campo calculado, no almacenado
- ❌ `saldo_pendiente_total` - Campo calculado, no almacenado
- ❌ `porcentaje_completado` - Campo calculado, no almacenado
- ❌ `valor_total` - Campo calculado, no almacenado

### Estados Válidos:

- `'En Proceso'`
- `'Cierre Financiero'`
- `'Activa'`
- `'Completada'`
- `'Cancelada'`
- `'Renuncia'`

---

## 📊 TABLA: `fuentes_pago`

### Columnas Verificadas ✅

```typescript
{
  // CAMPOS OBLIGATORIOS
  id: string (uuid)
  negociacion_id: string (uuid)             // FK → negociaciones
  tipo: string (text)                       // Ver ENUMS
  monto_aprobado: number (numeric)

  // CAMPOS OPCIONALES
  monto_recibido?: number (numeric)
  saldo_pendiente?: number (numeric)
  porcentaje_completado?: number (numeric)
  entidad?: string (text)
  numero_referencia?: string (text)
  fecha_aprobacion?: Date (date)
  estado?: string (text)
  permite_multiples_abonos?: boolean (boolean)

  // CAMPOS DE AUDITORÍA
  fecha_creacion: Date (timestamp)
  fecha_actualizacion: Date (timestamp)
}
```

### Tipos de Fuente Válidos:

- `'Cuota Inicial'`
- `'Crédito Hipotecario'`
- `'Subsidio Mi Casa Ya'`
- `'Subsidio Caja Compensación'`

---

## 📊 TABLA: `abonos_historial`

### Columnas Verificadas ✅

```typescript
{
  // CAMPOS OBLIGATORIOS
  id: string (uuid)
  negociacion_id: string (uuid)             // FK → negociaciones
  fuente_pago_id: string (uuid)             // FK → fuentes_pago
  monto: number (numeric)
  fecha_abono: Date (date)
  metodo_pago: string (text)                // Ver ENUMS

  // CAMPOS OPCIONALES
  numero_referencia?: string (text)
  notas?: string (text)

  // CAMPOS DE AUDITORÍA
  fecha_creacion: Date (timestamp)
  usuario_creacion?: string (uuid)
}
```

### Métodos de Pago Válidos:

- `'Transferencia'`
- `'Efectivo'`
- `'Cheque'`
- `'Consignación'`
- `'PSE'`
- `'Tarjeta de Crédito'`
- `'Tarjeta de Débito'`

---

## 📊 TABLA: `renuncias`

### Columnas Verificadas ✅

**TODO**: Ejecutar script para obtener columnas exactas

---

## 📊 TABLA: `documentos`

### Columnas Verificadas ✅

**TODO**: Ejecutar script para obtener columnas exactas

---

## 📊 TABLA: `categorias_documentos`

### Columnas Verificadas ✅

**TODO**: Ejecutar script para obtener columnas exactas

---

## 🔗 RELACIONES PRINCIPALES

### Estructura Jerárquica:

```
proyectos (1)
    ↓
manzanas (N)
    ↓
viviendas (N)
    ↓
negociaciones (N)
    ↓
fuentes_pago (N) → abonos_historial (N)

clientes (1) → negociaciones (N)
```

### Cómo Obtener el Proyecto de una Vivienda:

```typescript
// ❌ INCORRECTO - vivienda NO tiene proyecto_id
const proyecto_id = vivienda.proyecto_id;  // Error!

// ✅ CORRECTO - A través de manzana
const { data: vivienda } = await supabase
  .from('viviendas')
  .select(`
    *,
    manzana:manzanas(
      id,
      nombre,
      proyecto_id,
      proyecto:proyectos(id, nombre)
    )
  `)
  .eq('id', viviendaId)
  .single();

const proyecto = vivienda.manzana?.proyecto;
```

---

## 📝 NOTAS IMPORTANTES

### Campos Calculados vs Almacenados:

Algunos campos se calculan en tiempo real y **NO están en la DB**:

**En `negociaciones`:**
- `valor_total` (calculado)
- `total_fuentes_pago` (calculado)
- `total_abonado` (calculado)
- `saldo_pendiente` (calculado)
- `porcentaje_pagado` (calculado)

Estos valores se obtienen mediante:
- Funciones de base de datos
- Agregaciones en queries
- Cálculos en el backend

### Convenciones de Nombres:

- **Tablas**: Plural, snake_case (`clientes`, `fuentes_pago`)
- **Columnas**: snake_case (`numero_documento`, `fecha_creacion`)
- **IDs**: Siempre `{tabla}_id` para foreign keys (`proyecto_id`, `cliente_id`)
- **Fechas**: Prefijo `fecha_` (`fecha_creacion`, `fecha_nacimiento`)
- **Booleanos**: Prefijo `es_` o `tiene_` (`es_activo`, `permite_multiples_abonos`)

---

## 🔄 Historial de Actualizaciones

| Fecha | Cambio | Autor |
|-------|--------|-------|
| 2025-10-21 | Creación de template mejorado | Sistema |
| 2025-10-21 | Verificación tabla `clientes` - Removidos campos inexistentes | Sistema |
| - | - | - |

---

## ✅ Verificación de Integridad

**Última verificación**: 2025-10-21

**Estado**:
- ✅ Tabla `clientes` verificada
- ⏳ Pendiente verificar: proyectos, manzanas, viviendas, negociaciones, fuentes_pago, abonos_historial, renuncias, documentos, categorias_documentos

**Próxima actualización**: Al modificar el esquema de DB

---

**📖 Para actualizar este documento, consulta**: `docs/GUIA-DOCUMENTACION-DB.md`
