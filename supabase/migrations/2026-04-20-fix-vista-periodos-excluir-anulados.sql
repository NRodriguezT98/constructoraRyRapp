-- ============================================================
-- Fix: vista_estado_periodos_credito — excluir abonos anulados
-- Fecha: 2026-04-20
--
-- Problema:
--   El CTE capital_por_fuente en vista_estado_periodos_credito
--   no filtraba estado = 'Activo' en abonos_historial.
--   Un abono anulado seguía contando en el capital acumulado,
--   lo que hacía que cuotas aparecieran como "Cubierto" aunque
--   el pago ya hubiera sido anulado.
--
-- Fix: agregar AND ah.estado = 'Activo' al CTE capital_por_fuente.
-- ============================================================

CREATE OR REPLACE VIEW vista_estado_periodos_credito AS
WITH
-- Cuotas del plan vigente con acumulado previo (para relleno secuencial)
cuotas_vigentes AS (
  SELECT
    cc.id,
    cc.fuente_pago_id,
    cc.numero_cuota,
    cc.fecha_vencimiento,
    cc.valor_cuota,
    cc.version_plan,
    cc.notas,
    cc.created_at,
    cc.updated_at,
    -- Suma de valor_cuota de todas las cuotas ANTERIORES a esta (para offset)
    COALESCE(
      SUM(cc.valor_cuota) OVER (
        PARTITION BY cc.fuente_pago_id
        ORDER BY cc.numero_cuota
        ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
      ), 0
    ) AS capital_sumado_previo
  FROM cuotas_credito cc
  JOIN creditos_constructora cr
    ON cr.fuente_pago_id = cc.fuente_pago_id
  WHERE cc.version_plan = cr.version_actual
),

-- Capital total abonado por fuente (excluyendo mora y abonos ANULADOS)
capital_por_fuente AS (
  SELECT
    fuente_pago_id,
    COALESCE(SUM(monto - COALESCE(mora_incluida, 0)), 0) AS capital_total
  FROM abonos_historial
  WHERE estado = 'Activo'                -- ← Fix: excluir abonos anulados
  GROUP BY fuente_pago_id
),

-- Datos de tasa mora por fuente
tasa_mora AS (
  SELECT fuente_pago_id, tasa_mora_diaria
  FROM creditos_constructora
),

-- Calcular capital_aplicado y deficit por período
periodos_cal AS (
  SELECT
    cv.id,
    cv.fuente_pago_id,
    cv.numero_cuota,
    cv.fecha_vencimiento,
    cv.valor_cuota,
    cv.version_plan,
    cv.notas,
    cv.created_at,
    cv.updated_at,
    COALESCE(tm.tasa_mora_diaria, 0.001)          AS tasa_mora_diaria,
    COALESCE(cpf.capital_total, 0)                AS capital_total,
    -- Cuánto capital cubre este período
    GREATEST(0,
      LEAST(
        cv.valor_cuota,
        COALESCE(cpf.capital_total, 0) - cv.capital_sumado_previo
      )
    )                                             AS capital_aplicado,
    -- Cuánto falta por cubrir
    GREATEST(0,
      cv.valor_cuota - GREATEST(0,
        LEAST(
          cv.valor_cuota,
          COALESCE(cpf.capital_total, 0) - cv.capital_sumado_previo
        )
      )
    )                                             AS deficit
  FROM cuotas_vigentes cv
  LEFT JOIN capital_por_fuente cpf ON cpf.fuente_pago_id = cv.fuente_pago_id
  LEFT JOIN tasa_mora tm ON tm.fuente_pago_id = cv.fuente_pago_id
),

-- El primer período con déficit (para asignarle "En curso")
primera_con_deficit AS (
  SELECT fuente_pago_id, MIN(numero_cuota) AS primer_numero
  FROM periodos_cal
  WHERE deficit > 0
  GROUP BY fuente_pago_id
)

SELECT
  p.id,
  p.fuente_pago_id,
  p.numero_cuota,
  p.fecha_vencimiento,
  p.valor_cuota,
  p.version_plan,
  p.notas,
  p.created_at,
  p.updated_at,
  p.capital_total,
  p.capital_aplicado,
  p.deficit,

  -- Estado del período
  CASE
    WHEN p.capital_aplicado >= p.valor_cuota        THEN 'Cubierto'
    WHEN p.fecha_vencimiento::date < CURRENT_DATE   THEN 'Atrasado'
    WHEN p.numero_cuota = pcd.primer_numero         THEN 'En curso'
    ELSE 'Futuro'
  END::text AS estado_periodo,

  -- Días de atraso (solo si Atrasado)
  CASE
    WHEN p.deficit > 0 AND p.fecha_vencimiento::date < CURRENT_DATE
    THEN (CURRENT_DATE - p.fecha_vencimiento::date)
    ELSE 0
  END AS dias_atraso,

  -- Mora sugerida (interés sobre el déficit atrasado)
  CASE
    WHEN p.deficit > 0 AND p.fecha_vencimiento::date < CURRENT_DATE
    THEN ROUND(
      p.deficit
      * p.tasa_mora_diaria
      * (CURRENT_DATE - p.fecha_vencimiento::date)
    )::bigint
    ELSE 0
  END AS mora_sugerida

FROM periodos_cal p
LEFT JOIN primera_con_deficit pcd
  ON pcd.fuente_pago_id = p.fuente_pago_id;

COMMENT ON VIEW vista_estado_periodos_credito IS
'Estado de cada cuota del crédito calculado dinámicamente desde abonos activos.
 Algoritmo: relleno secuencial — el capital acumulado cubre cuotas en orden (1, 2, 3...).
 Los abonos anulados (estado = Anulado) se excluyen del cálculo.
 Estados: Cubierto | Atrasado | En curso | Futuro';
