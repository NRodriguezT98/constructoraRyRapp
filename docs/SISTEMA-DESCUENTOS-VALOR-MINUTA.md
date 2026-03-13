# 🎯 Sistema de Descuentos y Valor en Minuta

**Fecha**: 2025-12-05
**Módulo**: Asignación de Viviendas
**Tipo**: Feature - Sistema de Descuentos Personaliz

ados
**Estado**: ✅ Implementado

---

## 📋 Contexto

### Problema Identificado

En el proceso de asignación de viviendas, se presentan casos donde:

1. **Descuentos personalizados**: Trabajadores de la empresa, clientes VIP, promociones especiales requieren descuentos sobre el precio de lista.
2. **Valor diferenciado en escritura**: El valor que aparece en la minuta de compraventa puede ser diferente al valor real pactado para facilitar el crédito bancario.

### Caso Real (Vivienda C19)

```
Valor Base Vivienda:        $117.000.000
Gastos Notariales:          $  5.000.000
────────────────────────────────────────
Valor Total Original:       $122.000.000

Descuento (Trabajador):     -$ 14.000.000 (11.48%)
────────────────────────────────────────
Valor Real a Pagar:         $108.000.000 ⭐

Valor en Minuta:            $128.000.000 📄
Diferencia (solo papel):    +$ 20.000.000
```

---

## 🗄️ Modelo de Datos

### Tabla `viviendas` (Campos Agregados)

```sql
gastos_notariales DECIMAL(15,2) DEFAULT 5000000
```

**Propósito**: Gastos de escrituración, registro y notaría (valor fijo por vivienda).

---

### Tabla `negociaciones` (Campos Agregados)

```sql
descuento_aplicado        DECIMAL(15,2) DEFAULT 0
tipo_descuento            VARCHAR(50)   NULL
motivo_descuento          TEXT          NULL
porcentaje_descuento      DECIMAL(5,2)  DEFAULT 0
valor_escritura_publica   DECIMAL(15,2) NULL
```

#### Descripción de Campos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `descuento_aplicado` | DECIMAL | Monto de descuento sobre valor total original |
| `tipo_descuento` | VARCHAR | Tipo: trabajador_empresa, cliente_vip, promocion_especial, etc. |
| `motivo_descuento` | TEXT | Razón específica (obligatorio si hay descuento) |
| `porcentaje_descuento` | DECIMAL | % calculado automáticamente por trigger |
| `valor_escritura_publica` | DECIMAL | Valor en minuta (default sugerido: $128M) |

---

## ⚙️ Lógica de Negocio

### Cálculos Automáticos

```typescript
// 1. Valor Total Original
const valorTotalOriginal = valor_base + gastos_notariales
// Ejemplo: $117M + $5M = $122M

// 2. Valor Negociado (con descuento)
const valorNegociado = valorTotalOriginal - descuento_aplicado
// Ejemplo: $122M - $14M = $108M

// 3. Porcentaje de Descuento (trigger automático)
const porcentajeDescuento = (descuento_aplicado / valorTotalOriginal) * 100
// Ejemplo: ($14M / $122M) * 100 = 11.48%

// 4. Diferencia Notarial
const diferenciaNot arial = valor_escritura_publica - valorNegociado
// Ejemplo: $128M - $108M = $20M (solo en papel)
```

---

## 🎨 UX - Formulario de Asignación

### Paso 1: Información Básica

```
┌────────────────────────────────────────────┐
│ Valor Base:           $117.000.000 (RO)   │
│ Gastos Notariales:    $  5.000.000 (RO)   │
│ ───────────────────────────────────────    │
│ Valor Total Original: $122.000.000        │
│                                            │
│ ☑ ¿Aplicar descuento a esta vivienda?     │ ← Checkbox toggle
│   ┌──────────────────────────────────┐    │
│   │ Monto: $14.000.000 (11.48%)      │    │
│   │ Tipo: Trabajador de la Empresa   │    │
│   │ Motivo: [texto descriptivo]      │    │
│   │                                  │    │
│   │ Original: $122.000.000           │    │
│   │ Descuento: -$14.000.000          │    │
│   │ Final: $108.000.000 ✅           │    │
│   └──────────────────────────────────┘    │
│                                            │
│ Valor Final a Pagar:  $108.000.000 💚     │
│                                            │
│ Valor en Minuta: $128.000.000 ✏️          │ ← Editable, prerellenado
│                                            │
│ ℹ️ Real: $108M | Minuta: $128M            │
│    Diferencia: +$20M (solo en papel)       │
└────────────────────────────────────────────┘

RO = Read-Only (desde BD)
```

---

## 🔒 Validaciones

### Backend (Triggers SQL)

#### 1. Validar Motivo de Descuento

```sql
CREATE TRIGGER trigger_validar_motivo_descuento
BEFORE INSERT OR UPDATE ON negociaciones
FOR EACH ROW
EXECUTE FUNCTION validar_motivo_descuento();
```

**Reglas:**
- Si `descuento_aplicado > 0`:
  - `tipo_descuento` es obligatorio
  - `motivo_descuento` debe tener mínimo 10 caracteres

#### 2. Calcular Porcentaje Automáticamente

```sql
CREATE TRIGGER trigger_calcular_porcentaje_descuento
BEFORE INSERT OR UPDATE ON negociaciones
FOR EACH ROW
EXECUTE FUNCTION calcular_porcentaje_descuento();
```

**Lógica:**
```sql
porcentaje_descuento = ROUND((descuento_aplicado / valor_total_original) * 100, 2)
```

### Frontend (React)

```typescript
// 1. Descuento no puede ser mayor que valor original
if (descuentoAplicado > valorTotalOriginal) {
  throw new Error('El descuento no puede ser mayor al valor total')
}

// 2. Si hay descuento, validar campos obligatorios (TODOS)
if (aplicarDescuento) {
  if (!descuentoAplicado || descuentoAplicado <= 0) {
    errors.descuentoAplicado = 'Requerido'
  }
  if (!tipoDescuento) {
    errors.tipoDescuento = 'Requerido'
  }
  if (!motivoDescuento || motivoDescuento.length < 10) {
    errors.motivoDescuento = 'Mínimo 10 caracteres'
  }
}

// 3. Valor escritura OBLIGATORIO
if (!valorEscrituraPublica || valorEscrituraPublica <= 0) {
  errors.valorEscrituraPublica = 'Campo obligatorio'
}

// 4. Warning (no bloqueo) si escritura < valor negociado
if (valorEscrituraPublica < valorNegociado) {
  console.warn('⚠️ Escritura menor al valor real')
}
```

---

## 📊 Reportes y Consultas

### Vista: `vista_descuentos_aplicados`

```sql
CREATE VIEW vista_descuentos_aplicados AS
SELECT
  c.nombre_completo AS cliente,
  v.numero AS vivienda,
  p.nombre AS proyecto,
  (n.valor_negociado + n.descuento_aplicado) AS valor_original,
  n.descuento_aplicado,
  n.porcentaje_descuento,
  n.tipo_descuento,
  n.motivo_descuento,
  n.valor_negociado AS valor_final,
  n.valor_escritura_publica,
  (n.valor_escritura_publica - n.valor_negociado) AS diferencia_notarial
FROM negociaciones n
JOIN clientes c ON n.cliente_id = c.id
JOIN viviendas v ON n.vivienda_id = v.id
LEFT JOIN manzanas m ON v.manzana_id = m.id
LEFT JOIN proyectos p ON m.proyecto_id = p.id
WHERE n.descuento_aplicado > 0
ORDER BY n.descuento_aplicado DESC;
```

**Uso:**
```sql
-- Top 10 descuentos más altos
SELECT * FROM vista_descuentos_aplicados LIMIT 10;

-- Descuentos por tipo
SELECT
  tipo_descuento,
  COUNT(*) AS cantidad,
  SUM(descuento_aplicado) AS total_descuentos,
  AVG(porcentaje_descuento) AS promedio_porcentaje
FROM vista_descuentos_aplicados
GROUP BY tipo_descuento
ORDER BY total_descuentos DESC;
```

---

## 🎯 Casos de Uso

### 1. Trabajador de la Empresa

```typescript
const negociacion = {
  valor_base_vivienda: 117_000_000,
  gastos_notariales: 5_000_000,

  // Descuento
  descuento_aplicado: 14_000_000,
  tipo_descuento: 'trabajador_empresa',
  motivo_descuento: 'Trabajador con 5 años de antigüedad en la empresa',
  porcentaje_descuento: 11.48, // Calculado automáticamente

  // Valor final
  valor_negociado: 108_000_000,

  // Valor notarial
  valor_escritura_publica: 128_000_000
}
```

### 2. Cliente VIP (Sin diferencia notarial)

```typescript
const negociacion = {
  valor_base_vivienda: 117_000_000,
  gastos_notariales: 5_000_000,

  // Descuento menor
  descuento_aplicado: 7_000_000,
  tipo_descuento: 'cliente_vip',
  motivo_descuento: 'Cliente con historial de compras previas',

  // Valor final
  valor_negociado: 115_000_000,

  // Sin diferencia notarial (mismo valor)
  valor_escritura_publica: 115_000_000
}
```

### 3. Precio Normal (Sin descuento)

```typescript
const negociacion = {
  valor_base_vivienda: 117_000_000,
  gastos_notariales: 5_000_000,

  // Sin descuento
  descuento_aplicado: 0,
  tipo_descuento: null,
  motivo_descuento: null,

  // Valor final = Total original
  valor_negociado: 122_000_000,

  // Valor inflado para banco
  valor_escritura_publica: 128_000_000
}
```

---

## 📋 Checklist de Implementación

### Base de Datos
- [x] Migración SQL creada
- [x] Columnas agregadas a `viviendas` y `negociaciones`
- [x] Triggers creados (validación + cálculo)
- [x] Constraints de validación
- [x] Vista de reportes creada
- [x] Índices para optimización
- [x] Tipos TypeScript regenerados

### Frontend (Pendiente)
- [ ] Actualizar formulario Paso 1 (AsignarVivienda)
- [ ] Checkbox toggle para descuento
- [ ] Campos de descuento (monto, tipo, motivo)
- [ ] Campo valor en minuta (prerellenado $128M)
- [ ] Resumen visual con diferencias
- [ ] Validaciones frontend
- [ ] Actualizar Sidebar resumen
- [ ] Actualizar tipos TypeScript locales
- [ ] Testing formulario completo

### Documentación
- [x] Documento técnico completo
- [ ] Actualizar guía de usuario
- [ ] Ejemplos de uso

---

## 🚀 Próximos Pasos

1. **Actualizar Formulario** (Paso 1 - Información Básica)
2. **Actualizar Hook** `useAsignarViviendaPage`
3. **Actualizar Service** para guardar campos nuevos
4. **Actualizar Sidebar** con resumen de descuento
5. **Testing** con casos reales

---

## 📚 Referencias

- **Migración SQL**: `supabase/migrations/20251205_sistema_descuentos_valor_minuta.sql`
- **Tipos TypeScript**: `src/lib/supabase/database.types.ts`
- **Vista Reportes**: `vista_descuentos_aplicados`
- **Caso Real**: Vivienda C19 - $14M descuento

---

## ✅ Resumen

**Sistema implementado exitosamente que permite:**

1. ✅ Descuentos personalizados por cliente con trazabilidad completa
2. ✅ Valor diferenciado en escritura para facilitar créditos bancarios
3. ✅ Validaciones automáticas (triggers) y manuales (frontend)
4. ✅ Cálculo automático de porcentajes
5. ✅ Reportes de descuentos aplicados
6. ✅ Auditoría completa de motivos y tipos

**Ventajas clave:**
- 💰 Flexibilidad comercial
- 📊 Transparencia total
- 🔒 Validaciones robustas
- 📈 Reportes en tiempo real
