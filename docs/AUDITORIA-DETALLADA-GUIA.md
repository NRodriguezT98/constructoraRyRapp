# 🔍 Sistema de Auditoría Detallada - Guía de Implementación

**Última actualización**: 2025-11-04
**Versión**: 2.0 - Auditoría Contextual
**Estado**: ✅ Implementado en módulo Proyectos

---

## 📋 Tabla de Contenidos

1. [¿Qué es la Auditoría Detallada?](#qué-es-la-auditoría-detallada)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Métodos Disponibles](#métodos-disponibles)
4. [Ejemplos de Implementación](#ejemplos-de-implementación)
5. [Visualización en el Frontend](#visualización-en-el-frontend)
6. [Mejores Prácticas](#mejores-prácticas)

---

## 🎯 ¿Qué es la Auditoría Detallada?

La auditoría detallada es una mejora del sistema de auditoría base que captura **información contextual completa** de las operaciones CRUD, permitiendo:

### ✅ Antes (Auditoría Básica)
```json
{
  "tabla": "proyectos",
  "accion": "CREATE",
  "registro_id": "uuid-123",
  "metadata": {
    "total_manzanas": 3
  }
}
```

### 🚀 Ahora (Auditoría Detallada)
```json
{
  "tabla": "proyectos",
  "accion": "CREATE",
  "registro_id": "uuid-123",
  "metadata": {
    "proyecto_nombre": "Los Pinos",
    "proyecto_ubicacion": "Cali, Valle del Cauca",
    "proyecto_descripcion": "Proyecto residencial con 3 manzanas",
    "proyecto_presupuesto": 500000000,
    "proyecto_presupuesto_formateado": "$500.000.000",
    "total_manzanas": 3,
    "total_viviendas_planificadas": 45,
    "manzanas_detalle": [
      {
        "nombre": "A",
        "numero_viviendas": 15,
        "precio_base": 120000000,
        "superficie_total": 1200,
        "estado": "planificada"
      },
      {
        "nombre": "B",
        "numero_viviendas": 15,
        "precio_base": 130000000,
        "superficie_total": 1300,
        "estado": "planificada"
      },
      {
        "nombre": "C",
        "numero_viviendas": 15,
        "precio_base": 140000000,
        "superficie_total": 1400,
        "estado": "planificada"
      }
    ],
    "nombres_manzanas": "A, B, C"
  }
}
```

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────┐
│         SERVICE LAYER (*.service.ts)            │
│  - Lógica de negocio                            │
│  - Llamada a auditService.auditarCreacion*()    │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│       AUDIT SERVICE (audit.service.ts)          │
│  - auditarCreacionProyecto()                    │
│  - auditarCreacionVivienda()                    │
│  - auditarCreacionCliente()                     │
│  - auditarCreacionNegociacion()                 │
│  - Metadata enriquecida automática              │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│         DATABASE (audit_log table)              │
│  - tabla, accion, registro_id                   │
│  - datos_nuevos (JSONB)                         │
│  - metadata (JSONB) ← Información contextual    │
│  - cambios_especificos (JSONB)                  │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│     FRONTEND (DetalleAuditoriaModal.tsx)        │
│  - Parsea metadata según módulo                 │
│  - Renderiza UI contextual                      │
│  - Muestra detalles legibles                    │
└─────────────────────────────────────────────────┘
```

---

## 🔧 Métodos Disponibles

### 1. `auditarCreacionProyecto(proyecto, manzanas)`

**Uso**: Al crear un proyecto con sus manzanas

**Captura**:
- Nombre, ubicación, descripción del proyecto
- Presupuesto (valor y formateado)
- Responsable, teléfono, email
- Fechas de inicio y fin estimada
- Estado del proyecto
- **Detalle completo de cada manzana**:
  - Nombre
  - Número de viviendas
  - Precio base
  - Superficie total
  - Estado

**Ejemplo**:
```typescript
import { auditService } from '@/services/audit.service'

const proyecto = await crearProyecto(datos)
const manzanas = await crearManzanas(proyecto.id, datos.manzanas)

await auditService.auditarCreacionProyecto(proyecto, manzanas)
```

---

### 2. `auditarCreacionVivienda(vivienda, proyecto?, manzana?)`

**Uso**: Al crear una vivienda

**Captura**:
- Nombre y número de vivienda
- Valor base (valor y formateado)
- Área, habitaciones, baños
- Estado y tipo
- **Información del proyecto** (si se provee)
- **Información de la manzana** (si se provee)

**Ejemplo**:
```typescript
const vivienda = await crearVivienda(datos)
const proyecto = await obtenerProyecto(datos.proyecto_id)
const manzana = await obtenerManzana(datos.manzana_id)

await auditService.auditarCreacionVivienda(vivienda, proyecto, manzana)
```

---

### 3. `auditarCreacionCliente(cliente)`

**Uso**: Al crear un cliente

**Captura**:
- Nombre completo
- Tipo y número de documento
- Teléfono y email
- Ciudad y departamento
- Estado
- Origen y referido por (si aplica)

**Ejemplo**:
```typescript
const cliente = await crearCliente(datos)

await auditService.auditarCreacionCliente(cliente)
```

---

### 4. `auditarCreacionNegociacion(negociacion, cliente?, vivienda?, proyecto?)`

**Uso**: Al crear una negociación/venta

**Captura**:
- Estado de la negociación
- Valor total (valor y formateado)
- Cuota inicial y saldo pendiente
- Tipo de pago
- **Información del cliente** (si se provee)
- **Información de la vivienda** (si se provee)
- **Información del proyecto** (si se provee)

**Ejemplo**:
```typescript
const negociacion = await crearNegociacion(datos)
const cliente = await obtenerCliente(datos.cliente_id)
const vivienda = await obtenerVivienda(datos.vivienda_id)
const proyecto = await obtenerProyecto(vivienda.proyecto_id)

await auditService.auditarCreacionNegociacion(
  negociacion,
  cliente,
  vivienda,
  proyecto
)
```

---

## 💻 Ejemplos de Implementación

### Ejemplo Completo: Crear Proyecto

**Archivo**: `src/modules/proyectos/services/proyectos.service.ts`

```typescript
import { auditService } from '@/services/audit.service'

async crearProyecto(formData: ProyectoFormData): Promise<Proyecto> {
  // 1. Crear proyecto en DB
  const { data: proyecto, error } = await supabase
    .from('proyectos')
    .insert({ ...formData })
    .select()
    .single()

  if (error) throw error

  // 2. Crear manzanas
  let manzanas: Manzana[] = []
  if (formData.manzanas?.length > 0) {
    const { data: manzanasCreadas } = await supabase
      .from('manzanas')
      .insert(
        formData.manzanas.map(m => ({
          proyecto_id: proyecto.id,
          nombre: m.nombre,
          numero_viviendas: m.totalViviendas,
        }))
      )
      .select()

    manzanas = manzanasCreadas || []
  }

  // 3. 🔍 AUDITORÍA DETALLADA
  try {
    await auditService.auditarCreacionProyecto(proyecto, manzanas)
  } catch (auditError) {
    console.error('Error en auditoría:', auditError)
    // No interrumpir el flujo
  }

  return proyecto
}
```

---

### Ejemplo: Crear Vivienda con Contexto

```typescript
async crearVivienda(formData: ViviendaFormData): Promise<Vivienda> {
  // 1. Crear vivienda
  const { data: vivienda, error } = await supabase
    .from('viviendas')
    .insert({ ...formData })
    .select()
    .single()

  if (error) throw error

  // 2. Obtener contexto para auditoría
  const proyecto = await this.obtenerProyecto(formData.proyecto_id)
  const manzana = await this.obtenerManzana(formData.manzana_id)

  // 3. 🔍 AUDITORÍA DETALLADA CON CONTEXTO
  try {
    await auditService.auditarCreacionVivienda(vivienda, proyecto, manzana)
  } catch (auditError) {
    console.error('Error en auditoría:', auditError)
  }

  return vivienda
}
```

---

## 🎨 Visualización en el Frontend

El componente `DetalleAuditoriaModal` se encarga de renderizar la información de forma contextual:

### Renderizado por Módulo

```typescript
// DetalleAuditoriaModal.tsx

const renderDetallesModulo = () => {
  switch (registro.modulo) {
    case 'proyectos':
      return renderDetallesProyecto()  // ← Vista especializada
    case 'viviendas':
      return renderDetallesVivienda()
    case 'clientes':
      return renderDetallesCliente()
    case 'negociaciones':
      return renderDetallesNegociacion()
    default:
      return renderDetallesGenericos()  // ← Fallback JSON
  }
}
```

### Vista de Proyecto
- 📝 Información principal (nombre, ubicación, responsable)
- 💰 Presupuesto formateado
- 🏘️ **Grid de manzanas** con:
  - Nombre de manzana
  - Número de viviendas
  - Precio base
  - Superficie
  - Estado
- 📅 Fechas de inicio y fin

### Vista de Vivienda
- 🏠 Nombre y número
- 💵 Valor base
- 📐 Área, habitaciones, baños
- 🏗️ Proyecto y manzana asociados

---

## ✅ Mejores Prácticas

### 1. **Siempre llamar auditoría DESPUÉS de crear**
```typescript
// ✅ CORRECTO
const proyecto = await crearProyecto(datos)
await auditService.auditarCreacionProyecto(proyecto, manzanas)

// ❌ INCORRECTO
await auditService.auditarCreacionProyecto(proyecto, manzanas)
const proyecto = await crearProyecto(datos)  // Si falla, auditoría inválida
```

### 2. **Usar try-catch para no interrumpir flujo**
```typescript
try {
  await auditService.auditarCreacionProyecto(proyecto, manzanas)
} catch (auditError) {
  console.error('Error en auditoría:', auditError)
  // No lanzar error - la auditoría es secundaria
}
```

### 3. **Proveer contexto cuando esté disponible**
```typescript
// ✅ MEJOR - Con contexto completo
await auditService.auditarCreacionVivienda(vivienda, proyecto, manzana)

// ⚠️ FUNCIONA - Sin contexto (usa IDs del objeto)
await auditService.auditarCreacionVivienda(vivienda)
```

### 4. **Validar datos antes de auditar**
```typescript
// ✅ CORRECTO
const proyecto = await crearProyecto(datos)
if (proyecto?.id) {
  await auditService.auditarCreacionProyecto(proyecto, manzanas)
}

// ❌ INCORRECTO
await auditService.auditarCreacionProyecto(null, manzanas)  // Error
```

### 5. **Formatear valores monetarios**
```typescript
// El servicio formatea automáticamente
metadata: {
  proyecto_presupuesto: 500000000,
  proyecto_presupuesto_formateado: "$500.000.000"  // ← Auto-generado
}
```

---

## 🚀 Cómo Implementar en Nuevos Módulos

### Paso 1: Identificar operaciones CRUD

En tu servicio (`*.service.ts`), identifica dónde creas, actualizas o eliminas registros.

### Paso 2: Importar auditService

```typescript
import { auditService } from '@/services/audit.service'
```

### Paso 3: Llamar método de auditoría

**Opción A**: Si existe método especializado
```typescript
await auditService.auditarCreacionCliente(cliente)
```

**Opción B**: Si NO existe, usar genérico con metadata enriquecida
```typescript
await auditService.auditarCreacion(
  'nombre_tabla',
  registro.id,
  registro,
  {
    // Metadata contextual
    campo_importante: valor,
    campo_formateado: `$${valor.toLocaleString()}`,
    relacion_nombre: objetoRelacionado?.nombre
  },
  'nombre_modulo'
)
```

### Paso 4: Extender DetalleAuditoriaModal (opcional)

Si quieres vista personalizada, agrega caso en `renderDetallesModulo()`:

```typescript
case 'tu_modulo':
  return renderDetallesTuModulo()
```

---

## 📊 Resultados Esperados

Al implementar auditoría detallada verás en el sistema:

1. **Vista de tabla**:
   - Botón "Ver" en cada registro de auditoría

2. **Al hacer clic en "Ver"**:
   - Modal premium con gradiente
   - Badge de acción (Creación/Actualización/Eliminación)
   - Información del usuario y fecha
   - **Detalles contextuales legibles** (no solo JSON)
   - Secciones colapsables para datos técnicos

3. **En la metadata**:
   - Valores listos para mostrar en UI
   - Formateo de dinero, fechas, etc.
   - Relaciones completas (proyecto → manzanas → viviendas)

---

## ❓ FAQ

### ¿Qué pasa si no paso parámetros opcionales?

El servicio usará los IDs presentes en el objeto principal:
```typescript
await auditService.auditarCreacionVivienda(vivienda)
// Capturará: vivienda.proyecto_id, vivienda.manzana_id
// Pero NO tendrá nombres legibles
```

### ¿Puedo crear mi propio método de auditoría?

Sí, agrega método en `audit.service.ts`:
```typescript
async auditarCreacionTuModulo(objeto: any, relaciones?: any): Promise<void> {
  const metadataDetallada = {
    // Tu lógica aquí
  }

  return this.registrarAccion({
    tabla: 'tu_tabla',
    accion: 'CREATE',
    registroId: objeto.id,
    datosNuevos: objeto,
    metadata: metadataDetallada,
    modulo: 'tu_modulo'
  })
}
```

### ¿Cómo depuro errores de auditoría?

Los errores se loggean en consola sin interrumpir flujo:
```
❌ Error registrando auditoría: {error}
```

Verifica:
1. Usuario autenticado
2. Objeto tiene `.id`
3. Tabla existe en tipo `TablaAuditable`

---

## 📚 Referencias

- **Servicio de auditoría**: `src/services/audit.service.ts`
- **Componente de detalle**: `src/modules/auditorias/components/DetalleAuditoriaModal.tsx`
- **Ejemplo completo**: `src/modules/proyectos/services/proyectos.service.ts`
- **Schema de DB**: `docs/DATABASE-SCHEMA-REFERENCE-ACTUALIZADO.md`

---

**Autor**: Sistema de Auditoría RyR Constructora
**Fecha**: 2025-11-04
**Versión**: 2.0
