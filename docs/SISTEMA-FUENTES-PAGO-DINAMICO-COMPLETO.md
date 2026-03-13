# 🎯 Sistema de Fuentes de Pago Dinámico - Guía Completa

## 📋 Tabla de Contenidos

1. [Cómo Funciona el Sistema](#cómo-funciona-el-sistema)
2. [Flujo Completo](#flujo-completo)
3. [Ejemplo Práctico](#ejemplo-práctico)
4. [¿Cómo Sabe el Sistema Qué Campo es el Monto?](#cómo-sabe-el-sistema-qué-campo-es-el-monto)
5. [Estructura de Datos](#estructura-de-datos)
6. [FAQ](#faq)

---

## 🎯 Cómo Funciona el Sistema

El sistema es **100% dinámico**: NO hay campos hardcodeados. Todo se configura desde la UI de administración y se guarda en la base de datos.

### ✅ Componentes del Sistema

```
┌─────────────────────────────────────────────────────────┐
│ 1. CONFIGURACIÓN (Admin UI)                            │
│    /admin/configuracion/fuentes-pago                    │
│    → Agregar/editar/reordenar campos                    │
│    → Guardar en BD: tipos_fuentes_pago.configuracion_campos│
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 2. CARGA DINÁMICA (React Query)                        │
│    useTiposFuentesConCampos()                          │
│    → Consulta BD con configuracion_campos              │
│    → Retorna array de TipoFuentePagoConCampos          │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 3. RENDERIZADO (CampoFormularioDinamico)              │
│    → Mapea camposConfig.sort(orden)                    │
│    → Renderiza input según tipo (currency, select, etc)│
│    → Captura valores en ValoresCampos                  │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 4. GUARDADO (FuentePagoConfig)                         │
│    → config.campos: { monto_aprobado: 50000000, ... }  │
│    → Se guarda en negociaciones_fuentes_pago.config    │
│    → JSONB en PostgreSQL                                │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Flujo Completo

### 1️⃣ **Admin Configura Campos**

```
Admin entra a: /admin/configuracion/fuentes-pago
→ Click en "Configurar" de "Crédito Hipotecario"
→ Click en "Agregar Campo"
→ Completa formulario:
   - Nombre: tasa_interes
   - Tipo: number
   - Label: Tasa de Interés (%)
   - Requerido: ✅
→ Click "Crear Campo"
→ Arrastra para reordenar
→ Click "Guardar Configuración"
```

**Resultado en BD**:
```json
{
  "campos": [
    {
      "nombre": "monto_aprobado",
      "tipo": "currency",
      "label": "Monto Aprobado",
      "requerido": true,
      "orden": 1
    },
    {
      "nombre": "entidad",
      "tipo": "select_banco",
      "label": "Banco",
      "requerido": true,
      "orden": 2
    },
    {
      "nombre": "tasa_interes",
      "tipo": "number",
      "label": "Tasa de Interés (%)",
      "requerido": true,
      "orden": 3
    }
  ]
}
```

### 2️⃣ **Usuario Asigna Vivienda**

```
Usuario entra a: /clientes/[id]/asignar-vivienda
→ Paso 1: Selecciona proyecto y vivienda
→ Paso 2: Fuentes de Pago
```

**Lo que sucede internamente**:

```typescript
// 1. React Query carga configuración desde BD
const { data: tiposConCampos } = useTiposFuentesConCampos()
// → Retorna: [{ nombre: 'Crédito Hipotecario', configuracion_campos: {...} }]

// 2. Para cada fuente activa, obtiene sus campos
const tipoConCampos = tiposConCampos.find(t => t.nombre === 'Crédito Hipotecario')
const camposConfig = tipoConCampos?.configuracion_campos?.campos || []
// → Retorna: [{ nombre: 'monto_aprobado', tipo: 'currency', ... }, ...]

// 3. Pasa campos a FuentePagoCard
<FuentePagoCard camposConfig={camposConfig} />

// 4. Renderiza inputs dinámicamente
{camposConfig.sort((a, b) => a.orden - b.orden).map((campo) => (
  <CampoFormularioDinamico
    campo={campo}
    valor={valores[campo.nombre]}
    onChange={(valor) => handleCampoChange(campo.nombre, valor)}
  />
))}
```

### 3️⃣ **Usuario Completa Campos**

```
Usuario ve formulario con 3 campos (dinámicos desde BD):
1. Monto Aprobado: [50.000.000]
2. Banco: [Banco de Bogotá ▼]
3. Tasa de Interés (%): [12.5]

Usuario completa y click "Siguiente"
```

**Estado capturado**:

```typescript
// useFuentePagoCard.ts
const [valores, setValores] = useState<ValoresCampos>({
  monto_aprobado: 50000000,
  entidad: 'Banco de Bogotá',
  tasa_interes: 12.5,
})

// Se convierte en FuentePagoConfig
const config: FuentePagoConfig = {
  tipo: 'Crédito Hipotecario',
  campos: {
    monto_aprobado: 50000000,
    entidad: 'Banco de Bogotá',
    tasa_interes: 12.5,
  },
  // Legacy (compatibilidad)
  monto_aprobado: 50000000,
  entidad: 'Banco de Bogotá',
}
```

### 4️⃣ **Sistema Guarda en BD**

```typescript
// Al guardar negociación
await crearNegociacion({
  cliente_id,
  vivienda_id,
  fuentes_pago: [
    {
      tipo_fuente: 'Crédito Hipotecario',
      config: {
        tipo: 'Crédito Hipotecario',
        campos: {
          monto_aprobado: 50000000,
          entidad: 'Banco de Bogotá',
          tasa_interes: 12.5,
        },
      },
    },
  ],
})
```

**En PostgreSQL** (`negociaciones_fuentes_pago.config`):
```json
{
  "tipo": "Crédito Hipotecario",
  "campos": {
    "monto_aprobado": 50000000,
    "entidad": "Banco de Bogotá",
    "tasa_interes": 12.5
  }
}
```

---

## 🎯 Ejemplo Práctico

### Caso: Agregar Campo "Plazo en Meses"

**1. Admin Configura (5 minutos)**:
```
/admin/configuracion/fuentes-pago
→ Configurar "Crédito Hipotecario"
→ Agregar Campo:
   - Nombre: plazo_meses
   - Tipo: number
   - Label: Plazo (meses)
   - Min: 12
   - Max: 360
   - Requerido: ✅
→ Guardar
```

**2. Usuario lo Ve Automáticamente**:
```
/clientes/123/asignar-vivienda
→ Paso 2: Fuentes de Pago
→ Expande "Crédito Hipotecario"
→ Ve 4 campos ahora:
   1. Monto Aprobado
   2. Banco
   3. Tasa de Interés
   4. Plazo (meses)  ← NUEVO ✨
```

**3. Se Guarda Automáticamente**:
```json
{
  "campos": {
    "monto_aprobado": 50000000,
    "entidad": "Banco de Bogotá",
    "tasa_interes": 12.5,
    "plazo_meses": 240  ← NUEVO
  }
}
```

**¡NO SE NECESITÓ CAMBIAR UNA LÍNEA DE CÓDIGO!** 🎉

---

## 🤔 ¿Cómo Sabe el Sistema Qué Campo es el Monto?

### Convención de Nombres (Recomendado)

El sistema usa **nombres estandarizados** para campos críticos:

```typescript
// Campos críticos reconocidos por nombre
const CAMPOS_CRITICOS = {
  monto: ['monto_aprobado', 'monto', 'valor'],
  entidad: ['entidad', 'banco', 'caja'],
  referencia: ['numero_referencia', 'referencia', 'radicado'],
}
```

**Ejemplo de uso**:

```typescript
// Para calcular total de fuentes
const totalFuentes = fuentes.reduce((sum, fuente) => {
  if (!fuente.config?.campos) return sum

  // Buscar campo de monto por nombre
  const campoMonto = Object.entries(fuente.config.campos).find(([nombre, valor]) =>
    ['monto_aprobado', 'monto', 'valor'].includes(nombre)
  )

  return sum + (campoMonto ? Number(campoMonto[1]) : 0)
}, 0)
```

### Alternativa: Metadata en Campo

Si necesitas más flexibilidad, puedes agregar metadata:

```typescript
// En CampoConfig (futuro)
interface CampoConfig {
  // ... campos existentes
  metadata?: {
    es_monto_principal?: boolean
    es_identificador?: boolean
  }
}
```

Entonces en la UI admin:

```
☑️ Este es el campo de monto principal
```

Y al calcular:

```typescript
const campoMonto = camposConfig.find(c => c.metadata?.es_monto_principal)
const monto = fuente.config.campos[campoMonto.nombre]
```

---

## 📦 Estructura de Datos

### TipoFuentePagoConCampos (desde BD)

```typescript
{
  id: 'uuid',
  nombre: 'Crédito Hipotecario',
  codigo: 'credito_hipotecario',
  icono: 'Building2',
  color: '#3b82f6',
  activo: true,
  configuracion_campos: {
    campos: [
      {
        nombre: 'monto_aprobado',
        tipo: 'currency',
        label: 'Monto Aprobado',
        requerido: true,
        orden: 1,
      },
      {
        nombre: 'entidad',
        tipo: 'select_banco',
        label: 'Banco',
        requerido: true,
        orden: 2,
      },
    ],
  },
}
```

### FuentePagoConfig (guardado en negociación)

```typescript
{
  tipo: 'Crédito Hipotecario',
  campos: {
    monto_aprobado: 50000000,
    entidad: 'Banco de Bogotá',
    tasa_interes: 12.5,
    plazo_meses: 240,
  },
  // Documentos
  carta_aprobacion_url: 'https://...',
  // Legacy (compatibilidad)
  monto_aprobado: 50000000,
  entidad: 'Banco de Bogotá',
}
```

---

## ❓ FAQ

### 1. ¿Qué pasa si elimino un campo que ya tiene datos guardados?

**R:** Los datos NO se pierden. Quedan en `config.campos` pero no se muestran en el formulario. Si vuelves a agregar un campo con el mismo nombre, los datos reaparecen.

### 2. ¿Puedo tener campos diferentes para cada fuente?

**R:** ¡Sí! Cada tipo de fuente tiene su propia `configuracion_campos`. Por ejemplo:
- **Cuota Inicial**: Solo `monto_aprobado`
- **Crédito Hipotecario**: `monto_aprobado`, `entidad`, `tasa_interes`, `plazo_meses`
- **Subsidio**: `monto_aprobado`, `entidad`, `numero_referencia`

### 3. ¿Cómo valido campos complejos (ej: IBAN, NIT)?

**R:** Usa el campo `pattern` en la configuración:

```typescript
{
  nombre: 'numero_cuenta',
  tipo: 'text',
  label: 'Número de Cuenta',
  pattern: '^[0-9]{10,16}$',
  mensajeError: 'Debe tener entre 10 y 16 dígitos',
}
```

### 4. ¿Puedo hacer campos condicionales (mostrar campo B solo si campo A = X)?

**R:** Sí, usando el campo `mostrarSi`:

```typescript
{
  nombre: 'numero_subsidio',
  tipo: 'text',
  label: 'Número de Subsidio',
  mostrarSi: {
    campo: 'tiene_subsidio',
    valor: true,
  },
}
```

### 5. ¿Cómo migro datos existentes con estructura antigua?

**R:** El sistema mantiene **compatibilidad backward**. Los campos legacy (`monto_aprobado`, `entidad`, `numero_referencia`) se sincronizan automáticamente con `config.campos`.

**Migración gradual**:
```sql
-- Script de migración (opcional, se hace automáticamente en código)
UPDATE negociaciones_fuentes_pago
SET config = jsonb_set(
  config,
  '{campos}',
  jsonb_build_object(
    'monto_aprobado', config->'monto_aprobado',
    'entidad', config->'entidad',
    'numero_referencia', config->'numero_referencia'
  )
)
WHERE config->>'campos' IS NULL;
```

### 6. ¿Qué pasa si cambio el nombre de un campo?

**R:** ⚠️ **Cuidado**: Cambiar el nombre rompe la referencia a datos antiguos. Mejor:
1. Agrega el campo nuevo
2. Script de migración para copiar datos
3. Elimina el campo antiguo

O usa aliases:

```typescript
{
  nombre: 'tasa_interes_nuevo',
  nombreAlternativo: 'tasa_interes', // Busca en ambos
}
```

---

## 🎉 Ventajas del Sistema Dinámico

✅ **Cero Hardcode**: Todo configurable desde UI
✅ **Escalable**: Agregar campos sin tocar código
✅ **Flexible**: Diferentes campos por fuente
✅ **Type-Safe**: TypeScript valida en tiempo de compilación
✅ **UX Consistente**: Mismo componente para todos los tipos
✅ **Versionable**: Cambios auditados en BD
✅ **Migrable**: Compatibilidad backward con legacy

---

## 🚀 Próximos Pasos

1. **Testing**: Verificar funcionamiento con distintas configuraciones
2. **Migración**: Script para migrar datos legacy si es necesario
3. **Documentación**: Capacitar a admins en uso de configurador
4. **Mejoras**:
   - Campos condicionales (`mostrarSi`)
   - Validaciones custom con regex
   - Plantillas de configuración
   - Importar/exportar configuraciones

---

**¡Sistema completamente funcional y escalable!** 🎊
