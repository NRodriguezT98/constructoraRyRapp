# 🔄 Sistema de Versiones para Negociaciones

## 📋 Descripción

Sistema completo para rastrear cambios en negociaciones desde la asignación inicial hasta la firma de la minuta de compraventa.

## 🎯 Casos de Uso Soportados

### 1. **Asignación Inicial**
```
Cliente asignado a Vivienda A1
Valor: $100.000.000
Fuentes:
- Crédito Hipotecario: $80M (Bancolombia - Pendiente)
- Cuota Inicial: $20M (Aprobado)

→ Se crea automáticamente Versión 1
```

### 2. **Modificación por Avalúo**
```
Administrador modifica:
Motivo: "Banco aprobó $60M según avalúo"
Tipo: ajuste_avaluo

Versión 2:
- Crédito: $60M (antes $80M)
- Cuota Inicial: $40M (antes $20M)
```

### 3. **Aplicación de Descuento**
```
Administrador aplica descuento:
Monto: $5M
Tipo: pre-escritura
Motivo: "Descuento por cierre rápido"

Versión 3:
Valor final: $95M
```

## 📊 Estructura de Datos

### **Tabla: negociaciones_versiones**
```sql
id                  UUID
negociacion_id      UUID → negociaciones
version             INTEGER (1, 2, 3...)
valor_vivienda      NUMERIC
descuento_aplicado  NUMERIC
valor_total         NUMERIC
fuentes_pago        JSONB (snapshot completo)
motivo_cambio       TEXT
tipo_cambio         ENUM
es_version_activa   BOOLEAN (solo 1 true por negociación)
creado_por          UUID → usuarios
creado_en           TIMESTAMP
```

### **Tabla: descuentos_negociacion**
```sql
id                      UUID
negociacion_version_id  UUID → negociaciones_versiones
monto                   NUMERIC
porcentaje              NUMERIC (calculado automático)
tipo_descuento          ENUM
motivo                  TEXT
aplicado_por            UUID → usuarios
aplicado_en             TIMESTAMP
```

## 🔐 Permisos

- **Lectura**: Todos los usuarios autenticados
- **Creación/Modificación**: Solo administradores

## 🚀 Funciones Disponibles

### 1. **Crear Nueva Versión** (Solo Admin)
```sql
SELECT crear_nueva_version_negociacion(
  p_negociacion_id := '123e4567-...',
  p_valor_vivienda := 100000000,
  p_descuento_aplicado := 5000000,
  p_valor_total := 95000000,
  p_fuentes_pago := '[
    {
      "tipo": "Crédito Hipotecario",
      "monto_aprobado": 60000000,
      "entidad": "Bancolombia",
      "estado": "Aprobado"
    },
    {
      "tipo": "Cuota Inicial",
      "monto_aprobado": 35000000,
      "entidad": null,
      "estado": "Aprobado"
    }
  ]'::jsonb,
  p_motivo_cambio := 'Descuento por cierre rápido',
  p_tipo_cambio := 'aplicacion_descuento'
);
```

### 2. **Consultar Historial**
```sql
-- Todas las versiones de una negociación
SELECT
  version,
  valor_total,
  motivo_cambio,
  creado_en,
  (SELECT nombre_completo FROM usuarios WHERE id = creado_por)
FROM negociaciones_versiones
WHERE negociacion_id = '123e4567-...'
ORDER BY version DESC;

-- Solo versión activa
SELECT *
FROM negociaciones_con_version_actual
WHERE id = '123e4567-...';
```

### 3. **Comparar Versiones**
```sql
-- Versión 2 vs Versión 1
WITH v1 AS (
  SELECT fuentes_pago FROM negociaciones_versiones
  WHERE negociacion_id = '123e4567-...' AND version = 1
),
v2 AS (
  SELECT fuentes_pago FROM negociaciones_versiones
  WHERE negociacion_id = '123e4567-...' AND version = 2
)
SELECT
  'Anterior' as version, v1.fuentes_pago
FROM v1
UNION ALL
SELECT
  'Nueva' as version, v2.fuentes_pago
FROM v2;
```

## 🔄 Flujo Automático

### **Al crear negociación:**
1. Trigger detecta INSERT en `negociaciones`
2. Crea automáticamente Versión 1 en `negociaciones_versiones`
3. Marca como `es_version_activa = true`

### **Al modificar (solo admin):**
1. Frontend llama `crear_nueva_version_negociacion()`
2. Función valida rol de administrador
3. Desactiva versión anterior (`es_version_activa = false`)
4. Crea nueva versión con snapshot completo
5. Actualiza tabla principal `negociaciones`

## 📌 Tipos de Cambio Soportados

```typescript
tipo_cambio:
  - 'creacion_inicial'        // Automático al crear
  - 'modificacion_fuentes'    // Cambio en fuentes de pago
  - 'aplicacion_descuento'    // Nuevo descuento
  - 'ajuste_avaluo'           // Cambio por avalúo bancario
  - 'cambio_entidad'          // Cambio de banco/entidad
  - 'otro'                    // Otros cambios
```

## 📌 Tipos de Descuento

```typescript
tipo_descuento:
  - 'inicial'         // Descuento al asignar vivienda
  - 'temporal'        // Promoción por temporada
  - 'pre-escritura'   // Antes de firmar minuta
  - 'referido'        // Por referir otro cliente
  - 'otro'            // Otros motivos
```

## 🛠️ Ejecución de Migración

```bash
# PowerShell
npm run db:exec supabase/migrations/20251126_crear_sistema_versiones_negociaciones.sql

# O directamente
node ejecutar-sql.js supabase/migrations/20251126_crear_sistema_versiones_negociaciones.sql
```

## ✅ Validaciones Post-Migración

```sql
-- 1. Verificar tablas creadas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('negociaciones_versiones', 'descuentos_negociacion');

-- 2. Verificar función existe
SELECT routine_name
FROM information_schema.routines
WHERE routine_name = 'crear_nueva_version_negociacion';

-- 3. Verificar trigger
SELECT trigger_name
FROM information_schema.triggers
WHERE trigger_name = 'trigger_crear_version_inicial';

-- 4. Verificar vista
SELECT table_name
FROM information_schema.views
WHERE table_name = 'negociaciones_con_version_actual';
```

## 📱 Integración con Frontend

### **TypeScript Types**
```typescript
interface NegociacionVersion {
  id: string
  negociacion_id: string
  version: number
  valor_vivienda: number
  descuento_aplicado: number
  valor_total: number
  fuentes_pago: FuentePagoSnapshot[]
  motivo_cambio: string
  tipo_cambio: TipoCambio
  es_version_activa: boolean
  creado_por: string
  creado_en: string
}

interface FuentePagoSnapshot {
  id: string
  tipo: TipoFuentePago
  monto_aprobado: number
  entidad?: string
  estado: EstadoFuente
}

type TipoCambio =
  | 'creacion_inicial'
  | 'modificacion_fuentes'
  | 'aplicacion_descuento'
  | 'ajuste_avaluo'
  | 'cambio_entidad'
  | 'otro'

type TipoDescuento =
  | 'inicial'
  | 'temporal'
  | 'pre-escritura'
  | 'referido'
  | 'otro'
```

## 🔍 Queries Útiles

### **Historial completo con nombres**
```sql
SELECT
  nv.version,
  nv.valor_total,
  nv.motivo_cambio,
  nv.tipo_cambio,
  nv.creado_en,
  u.nombre_completo as modificado_por,
  COUNT(d.id) as descuentos_aplicados
FROM negociaciones_versiones nv
LEFT JOIN usuarios u ON nv.creado_por = u.id
LEFT JOIN descuentos_negociacion d ON d.negociacion_version_id = nv.id
WHERE nv.negociacion_id = '123e4567-...'
GROUP BY nv.id, u.nombre_completo
ORDER BY nv.version DESC;
```

### **Cambios en fuentes de pago**
```sql
SELECT
  version,
  jsonb_array_elements(fuentes_pago) as fuente
FROM negociaciones_versiones
WHERE negociacion_id = '123e4567-...'
ORDER BY version;
```

## 🎯 Próximos Pasos

1. ✅ Ejecutar migración
2. ⏳ Crear service TypeScript (`negociaciones-versiones.service.ts`)
3. ⏳ Actualizar formulario UI con campo descuento mejorado
4. ⏳ Crear modal de modificación (solo admin)
5. ⏳ Componente historial de versiones

---

**Creado**: 2025-11-26
**Autor**: Sistema RyR
**Estado**: ✅ Listo para ejecutar
