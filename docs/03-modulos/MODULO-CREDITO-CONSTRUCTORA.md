# Módulo: Crédito con la Constructora

> **Implementado**: 2026-03-17
> **Estado**: ✅ Completo
> **Módulo base**: `src/modules/fuentes-pago/`

---

## Qué hace este módulo

Permite que la constructora financie directamente una parte del valor de la vivienda al cliente, generando un plan de cuotas (tabla de amortización) con interés simple. El cliente paga cuotas mensuales directamente a la constructora, sin pasar por banco ni entidad financiera.

**Diferencia clave con otras fuentes de pago** (crédito hipotecario, Mi Casa Ya, etc.): en lugar de registrar un solo monto aprobado, se genera una tabla de cuotas con fechas concretas, seguimiento de mora y posibilidad de reestructuración.

---

## Fórmula financiera

Se usa **interés simple** (no compuesto) por transparencia con el cliente:

```
interes_total = capital × (tasaMensual / 100) × numCuotas
monto_total   = capital + interes_total
valor_cuota   = monto_total / numCuotas (redondeado a entero)
```

**Decisión de diseño**: Se favorece interés simple sobre compuesto porque el cliente puede verificar el cálculo manualmente y el monto total es fijo desde el inicio.

### Ejemplo

| Campo | Valor |
|-------|-------|
| Capital | $50.000.000 |
| Tasa mensual | 1,5% |
| Cuotas | 24 |
| Interés total | $50M × 0,015 × 24 = $18.000.000 |
| Monto total | $68.000.000 |
| Cuota mensual | $68M / 24 = $2.833.333 |

---

## Cierre financiero

**Invariante crítico**: el campo `capital_para_cierre` en `fuentes_pago` contiene solo el **capital** (no el monto total con intereses). Este es el valor que suma al total de fuentes para cerrar la negociación.

```
Valor vivienda        = $200.000.000
Cuota Inicial         =  $50.000.000
Mi Casa Ya            =  $80.000.000
Crédito Constructora:
  capital_para_cierre =  $70.000.000 ← suma esto (no el monto total $95M)
─────────────────────────────────────
Total fuentes         = $200.000.000 ✓ Cierre logrado
```

Si se usara el monto total con intereses ($95M), el total superaría el valor de la vivienda y nunca cerraría.

---

## Tablas de base de datos

### `creditos_constructora`
Guarda los parámetros financieros del crédito. Hay uno por fuente de pago de tipo crédito constructora.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | uuid | PK |
| `fuente_pago_id` | uuid | FK → `fuentes_pago.id` |
| `capital` | numeric(14,2) | Monto prestado (sin intereses) |
| `tasa_mensual` | numeric(5,4) | % mensual (1,5 = 1,5%) |
| `num_cuotas` | integer | Número de cuotas |
| `fecha_inicio` | date | Fecha de la primera cuota |
| `valor_cuota` | numeric(14,2) | Cuota calculada (COP, sin decimales) |
| `interes_total` | numeric(14,2) | Total de intereses |
| `monto_total` | numeric(14,2) | Capital + intereses |
| `tasa_mora_diaria` | numeric(8,6) | % diario mora (0,001 = 0,1%/día) |
| `version_actual` | integer | Versión del plan (sube al reestructurar) |

### `cuotas_credito`
Una fila por cada cuota del plan de amortización.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | uuid | PK |
| `fuente_pago_id` | uuid | FK → `fuentes_pago.id` |
| `numero_cuota` | integer | 1, 2, 3... |
| `fecha_vencimiento` | date | Fecha de pago esperada |
| `valor_cuota` | numeric(12,2) | Monto base de la cuota |
| `mora_aplicada` | numeric(12,2) | Mora registrada (0 si no aplica) |
| `total_a_cobrar` | numeric(12,2) | `valor_cuota + mora_aplicada` |
| `estado` | text | `Pendiente` / `Pagada` / `Reestructurada` |
| `fecha_pago` | date | Cuándo se pagó (null si pendiente) |
| `version_plan` | integer | Versión del plan al que pertenece |

### `vista_cuotas_vigentes`
Vista que solo muestra las cuotas de la **versión actual** de cada crédito, con columnas adicionales calculadas en tiempo real:

| Columna extra | Descripción |
|---------------|-------------|
| `estado_efectivo` | `Pendiente` / `Pagada` / `Reestructurada` / `Vencida` |
| `esta_vencida` | `true` si fecha_vencimiento < hoy y estado = Pendiente |
| `dias_mora` | Días desde vencimiento (0 si no vencida) |

### Columnas añadidas a tablas existentes

| Tabla | Columna | Para qué |
|-------|---------|----------|
| `fuentes_pago` | `capital_para_cierre` | Capital sin intereses para cierre financiero |
| `fuentes_pago` | `mora_total_recibida` | Mora cobrada (separada del monto_recibido) |
| `abonos_historial` | `mora_incluida` | Cuánto de un abono es mora |
| `tipos_fuentes_pago` | `logica_negocio` | Feature flags JSONB del tipo |

---

## Lógica de negocio en `tipos_fuentes_pago`

El campo `logica_negocio` (JSONB) activa comportamientos especiales:

```json
{
  "genera_cuotas": true,
  "capital_para_cierre": true,
  "permite_mora": true,
  "formula_interes": "simple"
}
```

Cuando `genera_cuotas = true`, el formulario de configurar fuente de pago muestra `CreditoConstructoraForm` en lugar del campo de monto manual.

---

## Archivos del módulo

```
src/modules/fuentes-pago/
├── types/index.ts                        # CreditoConstructora, CuotaVigente, ParametrosCredito, etc.
├── utils/calculos-credito.ts             # Funciones puras: calcularTablaAmortizacion, calcularMoraSugerida
├── services/
│   ├── creditos-constructora.service.ts  # CRUD hacia creditos_constructora
│   └── cuotas-credito.service.ts         # CRUD hacia cuotas_credito (incluye aplicarMora, reestructurar)
├── hooks/
│   └── useCreditoConstructora.ts         # Hook principal — carga credito + cuotas + resumen
└── components/
    ├── CreditoConstructoraForm.tsx        # Form de parámetros con preview de amortización en tiempo real
    ├── CuotasCreditoTab.tsx               # Tab con tabla de cuotas, botones mora/reestructurar
    ├── AplicarMoraModal.tsx               # Modal para registrar mora en una cuota vencida
    └── ReestructurarCreditoModal.tsx      # Modal para reestructurar el crédito (nuevo plan)
```

### Integración en `configurar-fuentes-pago.tsx`

`CreditoConstructoraForm` se muestra condicionalmente cuando el tipo de fuente tiene `logica_negocio.genera_cuotas = true`. Reemplaza el campo de monto manual y envía tres valores al estado del formulario padre:

- `monto_aprobado` ← `calculo.montoTotal` (capital + intereses)
- `capital_para_cierre` ← `params.capital` (solo capital)
- `parametrosCredito` ← objeto con todos los parámetros para guardar el plan

---

## Flujo de uso

### 1. Crear crédito

1. Usuario configura una fuente de pago de tipo "Crédito con la Constructora"
2. `CreditoConstructoraForm` muestra inputs: capital, tasa mensual, n° cuotas, fecha inicio
3. El preview de amortización se actualiza en tiempo real (`calcularTablaAmortizacion`)
4. Al guardar la negociación, el hook `useConfigurarFuentesPago` detecta `genera_cuotas = true` y llama `crearCreditoConCuotas()` del service
5. Se insertan: 1 fila en `creditos_constructora` + N filas en `cuotas_credito` (una por cuota)

### 2. Ver cuotas

Tab `CuotasCreditoTab` dentro del detalle de la fuente de pago:
- Muestra stats (total/pendientes/pagadas/vencidas)
- Tabla completa con estado visual y días de mora para cuotas vencidas
- Usa `vista_cuotas_vigentes` para evitar mostrar cuotas de planes anteriores

### 3. Aplicar mora

Cuando una cuota aparece como "Vencida" y sin mora, aparece el botón **Mora**:
1. Abre `AplicarMoraModal` con el monto sugerido pre-calculado
2. `calcularMoraSugerida(valorCuota, fechaVencimiento, tasa_mora_diaria)` usa la tasa desde BD
3. El admin puede ajustar el monto antes de confirmar
4. Se actualiza `mora_aplicada` y `total_a_cobrar` en la cuota

### 4. Reestructurar

Botón **Reestructurar** en la barra de info del crédito:
1. Abre `ReestructurarCreditoModal`
2. Calcula automáticamente el capital pendiente (suma de `capitalPorCuota` de cuotas no pagadas)
3. Admin ingresa: nueva tasa, nuevas cuotas, nueva fecha inicio
4. Preview de nueva cuota mensual en tiempo real
5. Al confirmar:
   - Las cuotas pendientes del plan anterior se marcan como `Reestructurada`
   - Se insertan nuevas cuotas con `version_plan = version_anterior + 1`
   - `vista_cuotas_vigentes` solo muestra las nuevas automáticamente

---

## Validaciones importantes

| Regla | Dónde se aplica |
|-------|----------------|
| Capital > 0 | `calcularTablaAmortizacion` (lanza Error) |
| Tasa mensual: 0 < t ≤ 10% | `calcularTablaAmortizacion` |
| Cuotas: 1–360 | `calcularTablaAmortizacion` |
| Tipo de fuente debe existir en `tipos_fuentes_pago` | Trigger DB `trigger_validar_tipo_fuente` |
| `mora_incluida ≤ monto` en abono | CHECK constraint en `abonos_historial` |

---

## Migración ejecutada

```
supabase/migrations/2026-03-17-credito-constructora-schema.sql
```

Ejecutar por primera vez:
```bash
node ejecutar-sql.js supabase/migrations/2026-03-17-credito-constructora-schema.sql
```

---

## Configurar el tipo "Crédito con la Constructora" en BD

El tipo debe existir en `tipos_fuentes_pago` con `logica_negocio` correctamente configurado:

```sql
INSERT INTO tipos_fuentes_pago (nombre, descripcion, activo, orden, logica_negocio)
VALUES (
  'Crédito con la Constructora',
  'Financiación directa por la constructora con plan de cuotas',
  true,
  5,
  '{"genera_cuotas": true, "capital_para_cierre": true, "permite_mora": true, "formula_interes": "simple"}'::jsonb
);
```

Si el tipo ya existe, actualizar su `logica_negocio`:

```sql
UPDATE tipos_fuentes_pago
SET logica_negocio = '{"genera_cuotas": true, "capital_para_cierre": true, "permite_mora": true, "formula_interes": "simple"}'::jsonb
WHERE nombre = 'Crédito con la Constructora';
```
