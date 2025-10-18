# 📊 Referencia de Esquema de Base de Datos

> **⚠️ DOCUMENTO CRÍTICO - CONSULTAR SIEMPRE ANTES DE CREAR/MODIFICAR CÓDIGO**
>
> Este documento es la **fuente única de verdad** para nombres de tablas, columnas y tipos.
> **NUNCA** asumas nombres de campos - **SIEMPRE** verifica aquí primero.

---

## 🎯 REGLA DE ORO

### ❌ PROHIBIDO:
- Asumir nombres de columnas sin verificar
- Copiar nombres de otros archivos sin validar
- Usar nombres en inglés cuando la DB usa español
- Inventar nombres "lógicos" sin confirmar

### ✅ OBLIGATORIO:
- Consultar este documento PRIMERO
- Verificar en Supabase Table Editor si hay dudas
- Actualizar este documento cuando se agreguen campos
- Usar los nombres EXACTOS como están en la DB

---

## 📋 TABLAS PRINCIPALES

### 1️⃣ `clientes`

```typescript
{
  id: string (UUID)
  nombres: string              // ⚠️ NO "nombre"
  apellidos: string            // ⚠️ NO "apellido"
  nombre_completo: string      // ⚠️ Generado, NO editable
  tipo_documento: string       // 'CC' | 'CE' | 'NIT' | 'Pasaporte'
  numero_documento: string     // ⚠️ NO "documento"
  email: string
  telefono: string
  direccion: string
  ciudad: string
  fecha_nacimiento: Date
  estado_civil: string
  profesion: string
  empresa: string
  cargo: string
  ingresos_mensuales: number
  notas: string
  fecha_creacion: Date
  fecha_actualizacion: Date
  usuario_creacion: string
}
```

**Errores comunes:**
- ❌ `cliente.nombre` → ✅ `cliente.nombres`
- ❌ `cliente.documento` → ✅ `cliente.numero_documento`

---

### 2️⃣ `proyectos`

```typescript
{
  id: string (UUID)
  nombre: string               // ⚠️ Singular
  descripcion: string
  ubicacion: string
  estado: string               // ⚠️ Snake_case: 'en_planificacion' | 'en_construccion' | 'finalizado' | 'pausado'
  fecha_inicio: Date
  fecha_fin_estimada: Date
  presupuesto_total: number
  area_total: number
  imagen_url: string
  fecha_creacion: Date
  fecha_actualizacion: Date
  usuario_creacion: string
}
```

**Estados válidos (snake_case lowercase):**
- `'en_planificacion'`
- `'en_construccion'`
- `'finalizado'`
- `'pausado'`

---

### 3️⃣ `viviendas`

```typescript
{
  id: string (UUID)
  manzana_id: string (UUID)
  numero: string               // ⚠️ String, no number
  tipo: string                 // 'Casa' | 'Apartamento' | 'Local'
  area_construida: number
  area_terreno: number
  numero_habitaciones: number
  numero_banos: number
  numero_pisos: number
  tiene_garaje: boolean
  valor_total: number          // ⚠️ NO "precio" o "valor"
  estado: string               // ⚠️ Snake_case: 'disponible' | 'reservada' | 'vendida' | 'en_construccion'
  descripcion: string
  imagen_url: string
  fecha_creacion: Date
  fecha_actualizacion: Date
  usuario_creacion: string
}
```

**Estados válidos (snake_case lowercase):**
- `'disponible'`
- `'reservada'`
- `'vendida'`
- `'en_construccion'`

**Errores comunes:**
- ❌ `vivienda.precio` → ✅ `vivienda.valor_total`
- ❌ `vivienda.estado = 'Disponible'` → ✅ `'disponible'`

---

### 4️⃣ `manzanas`

```typescript
{
  id: string (UUID)
  proyecto_id: string (UUID)
  nombre: string               // Ej: "Manzana A"
  numero_viviendas: number
  descripcion: string
  fecha_creacion: Date
  fecha_actualizacion: Date
  usuario_creacion: string
}
```

---

### 5️⃣ `cliente_intereses` ⭐ ACTUALIZADO

```typescript
{
  // Campos base
  id: string (UUID)
  cliente_id: string (UUID)
  proyecto_id: string (UUID)
  vivienda_id: string (UUID)   // Opcional
  notas: string
  estado: string               // ⚠️ PascalCase: 'Activo' | 'Pendiente' | 'Contactado' | 'En Seguimiento' | 'Negociación' | 'Descartado' | 'Perdido'
  motivo_descarte: string
  fecha_interes: Date
  fecha_actualizacion: Date
  usuario_creacion: string

  // Campos nuevos (agregados 2025-10-18)
  valor_estimado: number       // ⚠️ NUEVO - Valor estimado del interés
  origen: string               // ⚠️ NUEVO - 'Visita Presencial' | 'Llamada Telefónica' | 'WhatsApp' | 'Email' | 'Redes Sociales' | 'Referido' | 'Sitio Web' | 'Otro'
  prioridad: string            // ⚠️ NUEVO - 'Alta' | 'Media' | 'Baja'
  fecha_ultimo_contacto: Date  // ⚠️ NUEVO
  proximo_seguimiento: Date    // ⚠️ NUEVO
  negociacion_id: string (UUID)// ⚠️ NUEVO - Se llena al convertir a negociación
  fecha_conversion: Date       // ⚠️ NUEVO - Fecha cuando se convirtió
}
```

**Estados válidos (PascalCase con espacios):**
- `'Activo'`
- `'Pendiente'`
- `'Contactado'`
- `'En Seguimiento'`
- `'Negociación'`
- `'Descartado'`
- `'Perdido'`

**Orígenes válidos:**
- `'Visita Presencial'`
- `'Llamada Telefónica'`
- `'WhatsApp'`
- `'Email'`
- `'Redes Sociales'`
- `'Referido'`
- `'Sitio Web'`
- `'Otro'`

**Prioridades válidas:**
- `'Alta'`
- `'Media'`
- `'Baja'`

---

### 6️⃣ `negociaciones`

```typescript
{
  id: string (UUID)
  cliente_id: string (UUID)
  vivienda_id: string (UUID)
  valor_negociado: number      // ⚠️ NO "precio_negociado"
  descuento_aplicado: number
  estado: string               // 'En Proceso' | 'Aprobada' | 'Rechazada' | 'Cancelada'
  notas: string
  fecha_creacion: Date
  fecha_actualizacion: Date
  usuario_creacion: string
}
```

**Errores comunes:**
- ❌ `negociacion.precio` → ✅ `negociacion.valor_negociado`

---

### 7️⃣ `fuentes_pago` ⭐ SISTEMA DE PAGO

```typescript
{
  id: string (UUID)
  negociacion_id: string (UUID)
  tipo: string                 // ⚠️ 'Cuota Inicial' | 'Crédito Hipotecario' | 'Subsidio Mi Casa Ya' | 'Subsidio Caja Compensación'
  monto_aprobado: number
  monto_recibido: number
  saldo_pendiente: number      // ⚠️ CALCULADO (monto_aprobado - monto_recibido)
  porcentaje_completado: number// ⚠️ CALCULADO (monto_recibido / monto_aprobado * 100)

  // Detalles
  entidad: string              // Banco o Caja de Compensación
  numero_referencia: string    // Radicado/Número de crédito

  // Comportamiento
  permite_multiples_abonos: boolean // ⚠️ true solo para 'Cuota Inicial'

  // Documentos
  carta_aprobacion_url: string
  carta_asignacion_url: string

  // Estado
  estado: string               // 'Pendiente' | 'En Proceso' | 'Completada'
  fecha_completado: Date
  fecha_creacion: Date
  fecha_actualizacion: Date
}
```

**Tipos válidos**:
- `'Cuota Inicial'` → permite_multiples_abonos = **true**
- `'Crédito Hipotecario'` → permite_multiples_abonos = **false**
- `'Subsidio Mi Casa Ya'` → permite_multiples_abonos = **false**
- `'Subsidio Caja Compensación'` → permite_multiples_abonos = **false**

**Estados válidos**:
- `'Pendiente'`
- `'En Proceso'`
- `'Completada'`

---

### 8️⃣ `procesos_negociacion`

```typescript
{
  id: string (UUID)
  negociacion_id: string (UUID)
  nombre: string
  descripcion: string
  orden: number
  es_obligatorio: boolean
  permite_omitir: boolean
  estado: string               // 'Pendiente' | 'En Proceso' | 'Completado' | 'Omitido'
  depende_de: string[]         // Array de IDs de procesos previos
  documentos_requeridos: object
  documentos_urls: object
  fecha_inicio: Date
  fecha_completado: Date
  fecha_limite: Date
  notas: string
  motivo_omision: string
  fecha_creacion: Date
  fecha_actualizacion: Date
  usuario_completo: string (UUID)
}
```

---

## 🔍 VISTAS (Views)

### Vista: `intereses_completos`

**Columnas disponibles:**

```typescript
{
  // Todas las columnas de cliente_intereses (i.*)
  ...cliente_intereses_fields,

  // Datos del cliente
  cliente_nombre: string,        // ⚠️ c.nombres
  cliente_apellido: string,      // ⚠️ c.apellidos
  nombre_completo: string,       // ⚠️ c.nombre_completo
  cliente_email: string,
  cliente_telefono: string,
  cliente_documento: string,     // ⚠️ c.numero_documento

  // Datos del proyecto
  proyecto_nombre: string,       // ⚠️ NO "proyecto_ubicacion"
  proyecto_estado: string,       // ⚠️ p.estado (snake_case)

  // Datos de la vivienda
  vivienda_numero: string,
  vivienda_valor: number,        // ⚠️ NO "vivienda_precio"
  vivienda_estado: string,       // ⚠️ v.estado (snake_case)

  // Datos de manzana
  manzana_nombre: string,

  // Campos calculados
  dias_desde_interes: number,    // ⚠️ Calculado, no editable
  seguimiento_urgente: boolean   // ⚠️ Calculado, no editable
}
```

**⚠️ ERRORES COMUNES QUE HEMOS TENIDO:**

1. ❌ `estado_interes` → ✅ `estado` (la columna se llama solo "estado")
2. ❌ `vivienda_precio` → ✅ `vivienda_valor`
3. ❌ `proyecto_ubicacion` → ✅ `proyecto_estado`

---

## 📝 FUNCIONES PostgreSQL

### `convertir_interes_a_negociacion()`

```sql
convertir_interes_a_negociacion(
  p_interes_id UUID,
  p_valor_negociado DECIMAL,
  p_descuento DECIMAL DEFAULT 0
) RETURNS UUID
```

**Uso desde servicio:**

```typescript
const { data, error } = await supabase.rpc('convertir_interes_a_negociacion', {
  p_interes_id: interesId,
  p_valor_negociado: valorNegociado,
  p_descuento: descuento
})
```

---

## 🛡️ CONVENCIONES DE NOMBRES

### Base de Datos (PostgreSQL)
- **Tablas**: `snake_case` plural o singular según contexto
  - `clientes`, `proyectos`, `viviendas`, `cliente_intereses`
- **Columnas**: `snake_case`
  - `numero_documento`, `fecha_creacion`, `valor_total`
- **Estados de proyectos/viviendas**: `snake_case` lowercase
  - `'en_planificacion'`, `'disponible'`, `'en_construccion'`
- **Estados de intereses**: `PascalCase` con espacios
  - `'Activo'`, `'En Seguimiento'`, `'Negociación'`

### TypeScript (Frontend)
- **Interfaces**: `PascalCase`
  - `Cliente`, `Proyecto`, `ClienteInteres`
- **Propiedades**: `snake_case` (coincide con DB)
  - `cliente.numero_documento`, `vivienda.valor_total`
- **Servicios**: `camelCase`
  - `interesesService`, `proyectosService`

### React (Componentes)
- **Componentes**: `PascalCase` o `kebab-case` en archivos
  - `ClienteDetalle`, `modal-registrar-interes.tsx`
- **Hooks**: `camelCase` con prefijo `use`
  - `useRegistrarInteres`, `useClienteDetalle`

---

## ✅ CHECKLIST ANTES DE CREAR CÓDIGO

Cuando vayas a trabajar con datos de DB:

- [ ] ¿Consulté `DATABASE-SCHEMA-REFERENCE.md`?
- [ ] ¿Verifiqué los nombres EXACTOS de las columnas?
- [ ] ¿Confirmé el formato de los estados (snake_case vs PascalCase)?
- [ ] ¿Revisé si la columna es de una tabla o una vista?
- [ ] ¿Actualicé este documento si agregué campos nuevos?

---

## 🔄 MANTENIMIENTO

**Última actualización**: 2025-10-18

**Cambios recientes**:
- ✅ Agregados 7 campos nuevos a `cliente_intereses`
- ✅ Documentada vista `intereses_completos`
- ✅ Aclarados errores comunes en nombres de campos

**Responsable de actualizar**: Cualquier desarrollador que modifique el schema de DB

---

## 📞 EN CASO DE DUDA

1. **Consulta este documento primero**
2. Si no está aquí: **Verifica en Supabase Table Editor**
3. **Actualiza este documento** con lo que encontraste
4. **Nunca asumas** - siempre verifica

---

> **🎯 Objetivo**: Reducir a CERO los errores de nombres de campos/columnas
