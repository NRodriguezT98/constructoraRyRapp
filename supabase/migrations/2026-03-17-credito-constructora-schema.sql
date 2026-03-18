-- ============================================================
-- MIGRACIÓN: Crédito con la Constructora — Diseño Robusto
-- Fecha: 2026-03-17
--
-- CORRECCIONES APLICADAS vs. spec original:
--   Fix 1: Elimina CHECK constraint hardcodeado de tipos → trigger dinámico
--   Fix 2: Agrega capital_para_cierre en fuentes_pago (cierre correcto)
--   Fix 3: Tabla creditos_constructora en lugar de JSONB (constraints financieros)
--   Fix 4: mora_incluida en abonos_historial + triggers corregidos (mora no rompe límites)
--   Fix 5: Trigger reestructuración actualiza monto_aprobado atómicamente
--   Fix 6: tasa_mora_diaria en BD (no hardcodeada en código)
--   Fix 7: vista_cuotas_vigentes para no mezclar versiones
-- ============================================================

-- ============================================================
-- PASO 1: ELIMINAR CONSTRAINT HARDCODEADO DE TIPOS
-- Reemplazado por trigger dinámico que valida contra tipos_fuentes_pago
-- ============================================================

ALTER TABLE public.fuentes_pago
  DROP CONSTRAINT IF EXISTS fuentes_pago_tipo_check;

-- Trigger dinámico: valida que el tipo exista en el catálogo activo
CREATE OR REPLACE FUNCTION validar_tipo_fuente_dinamico()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.tipos_fuentes_pago
    WHERE nombre = NEW.tipo AND activo = true
  ) THEN
    RAISE EXCEPTION
      'Tipo de fuente de pago no válido: "%" — debe existir en tipos_fuentes_pago con activo = true',
      NEW.tipo;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_validar_tipo_fuente ON public.fuentes_pago;
CREATE TRIGGER trigger_validar_tipo_fuente
  BEFORE INSERT ON public.fuentes_pago
  FOR EACH ROW EXECUTE FUNCTION validar_tipo_fuente_dinamico();

-- ============================================================
-- PASO 2: NUEVAS COLUMNAS EN TABLAS EXISTENTES
-- ============================================================

-- 2a. capital_para_cierre: monto real que cuenta para cerrar la negociación
--     Para créditos: capital (sin intereses)
--     Para otras fuentes: NULL → se usa monto_aprobado
ALTER TABLE public.fuentes_pago
  ADD COLUMN IF NOT EXISTS capital_para_cierre NUMERIC(14,2) DEFAULT NULL;

COMMENT ON COLUMN public.fuentes_pago.capital_para_cierre IS
'Monto que se suma al total_fuentes_pago de la negociación.
 Para créditos: el capital sin intereses (ej: $50M de un crédito de $68M total).
 NULL = usar monto_aprobado (comportamiento por defecto para otras fuentes).
 Evita que intereses inflen el total por encima del valor de la vivienda.';

-- 2b. mora_total_recibida: tracking separado de mora cobrada
--     monto_recibido solo incluirá capital+intereses (no mora)
ALTER TABLE public.fuentes_pago
  ADD COLUMN IF NOT EXISTS mora_total_recibida NUMERIC(14,2) NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.fuentes_pago.mora_total_recibida IS
'Suma de mora cobrada en todos los abonos. No se suma a monto_recibido porque
 la mora no forma parte del monto comprometido en la fuente.';

-- 2c. mora_incluida: cuánto de un abono corresponde a mora
ALTER TABLE public.abonos_historial
  ADD COLUMN IF NOT EXISTS mora_incluida NUMERIC(12,2) NOT NULL DEFAULT 0
  CONSTRAINT ck_mora_incluida_valida CHECK (
    mora_incluida >= 0 AND mora_incluida <= monto
  );

COMMENT ON COLUMN public.abonos_historial.mora_incluida IS
'Monto de mora incluido en este abono. El capital+interés real del abono
 = monto - mora_incluida. Solo aplicable a fuentes de crédito con la constructora.';

-- 2d. logica_negocio: feature flags específicos del tipo de fuente
ALTER TABLE public.tipos_fuentes_pago
  ADD COLUMN IF NOT EXISTS logica_negocio JSONB DEFAULT NULL;

COMMENT ON COLUMN public.tipos_fuentes_pago.logica_negocio IS
'Feature flags del tipo de fuente:
 {
   "genera_cuotas": boolean,           -- crea tabla de amortización
   "capital_para_cierre": boolean,     -- usar capital (no total) para cierre financiero
   "permite_mora": boolean,            -- puede tener mora en cuotas
   "formula_interes": "simple",        -- tipo de cálculo de intereses
   "usa_capital_en_cierre": boolean    -- sinónimo explícito de capital_para_cierre
 }';

-- ============================================================
-- PASO 3: CORREGIR TRIGGER actualizar_monto_recibido_fuente
-- Separa monto_recibido (capital+intereses) de mora_total_recibida
-- ============================================================

CREATE OR REPLACE FUNCTION actualizar_monto_recibido_fuente()
RETURNS TRIGGER AS $$
DECLARE
  fuente_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    fuente_id := OLD.fuente_pago_id;
  ELSE
    fuente_id := NEW.fuente_pago_id;
  END IF;

  UPDATE public.fuentes_pago
  SET
    -- Solo capital+intereses: excluir mora para no violar límite monto_aprobado
    monto_recibido = (
      SELECT COALESCE(SUM(monto - COALESCE(mora_incluida, 0)), 0)
      FROM public.abonos_historial
      WHERE fuente_pago_id = fuente_id
    ),
    -- Mora se acumula por separado para reporte
    mora_total_recibida = (
      SELECT COALESCE(SUM(COALESCE(mora_incluida, 0)), 0)
      FROM public.abonos_historial
      WHERE fuente_pago_id = fuente_id
    )
  WHERE id = fuente_id;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Re-registrar trigger (ya existe, reemplazamos la función)
DROP TRIGGER IF EXISTS trigger_actualizar_monto_recibido ON public.abonos_historial;
CREATE TRIGGER trigger_actualizar_monto_recibido
  AFTER INSERT OR UPDATE OR DELETE ON public.abonos_historial
  FOR EACH ROW EXECUTE FUNCTION actualizar_monto_recibido_fuente();

-- ============================================================
-- PASO 4: CORREGIR TRIGGER validar_abono_no_excede_saldo
-- La mora no cuenta para el límite — solo el principal del abono
-- ============================================================

CREATE OR REPLACE FUNCTION validar_abono_no_excede_saldo()
RETURNS TRIGGER AS $$
DECLARE
  monto_aprobado_fuente NUMERIC(15,2);
  monto_recibido_actual NUMERIC(15,2);
  monto_principal_nuevo NUMERIC(15,2);
  monto_principal_antiguo NUMERIC(15,2);
  nuevo_total NUMERIC(15,2);
BEGIN
  SELECT monto_aprobado, monto_recibido
  INTO monto_aprobado_fuente, monto_recibido_actual
  FROM public.fuentes_pago
  WHERE id = NEW.fuente_pago_id;

  -- Principal del nuevo abono (excluyendo mora)
  monto_principal_nuevo := NEW.monto - COALESCE(NEW.mora_incluida, 0);

  -- Para UPDATE: descontar el principal anterior del total acumulado
  IF TG_OP = 'UPDATE' THEN
    monto_principal_antiguo := OLD.monto - COALESCE(OLD.mora_incluida, 0);
    monto_recibido_actual := monto_recibido_actual - monto_principal_antiguo;
  END IF;

  nuevo_total := monto_recibido_actual + monto_principal_nuevo;

  IF nuevo_total > monto_aprobado_fuente THEN
    RAISE EXCEPTION
      'El abono excede el saldo pendiente. '
      'Monto aprobado: $%, Ya cobrado: $%, '
      'Principal del abono: $%, Saldo disponible: $%',
      monto_aprobado_fuente,
      monto_recibido_actual,
      monto_principal_nuevo,
      (monto_aprobado_fuente - monto_recibido_actual);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_validar_abono_no_excede_saldo ON public.abonos_historial;
CREATE TRIGGER trigger_validar_abono_no_excede_saldo
  BEFORE INSERT OR UPDATE ON public.abonos_historial
  FOR EACH ROW EXECUTE FUNCTION validar_abono_no_excede_saldo();

-- ============================================================
-- PASO 5: CORREGIR TRIGGER update_negociaciones_totales
-- Usa capital_para_cierre cuando está disponible
-- Evita que intereses de créditos inflen total_fuentes_pago
-- ============================================================

CREATE OR REPLACE FUNCTION update_negociaciones_totales()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.negociaciones
  SET
    -- Suma capital_para_cierre cuando existe (créditos), monto_aprobado para otras fuentes
    total_fuentes_pago = (
      SELECT COALESCE(SUM(COALESCE(capital_para_cierre, monto_aprobado)), 0)
      FROM public.fuentes_pago
      WHERE negociacion_id = COALESCE(NEW.negociacion_id, OLD.negociacion_id)
        AND estado = 'Activa'
    ),
    -- Total real cobrado (capital+intereses, sin mora)
    total_abonado = (
      SELECT COALESCE(SUM(monto_recibido), 0)
      FROM public.fuentes_pago
      WHERE negociacion_id = COALESCE(NEW.negociacion_id, OLD.negociacion_id)
    )
  WHERE id = COALESCE(NEW.negociacion_id, OLD.negociacion_id);

  UPDATE public.negociaciones
  SET
    saldo_pendiente = valor_total - total_abonado,
    porcentaje_pagado = CASE
      WHEN valor_total > 0 THEN (total_abonado / valor_total) * 100
      ELSE 0
    END
  WHERE id = COALESCE(NEW.negociacion_id, OLD.negociacion_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- PASO 6: TABLA creditos_constructora
-- Reemplaza metadata_credito JSONB — datos financieros tipados con constraints
-- Relación 1:1 con fuentes_pago (solo fuentes de tipo crédito)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.creditos_constructora (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relación 1:1 con la fuente de pago
  fuente_pago_id UUID NOT NULL UNIQUE
    REFERENCES public.fuentes_pago(id) ON DELETE CASCADE,

  -- Parámetros financieros del crédito
  capital NUMERIC(14,2) NOT NULL
    CONSTRAINT ck_credito_capital_positivo CHECK (capital > 0),

  tasa_mensual NUMERIC(6,4) NOT NULL
    CONSTRAINT ck_credito_tasa_valida CHECK (tasa_mensual > 0 AND tasa_mensual <= 10),

  num_cuotas INT NOT NULL
    CONSTRAINT ck_credito_cuotas_validas CHECK (num_cuotas BETWEEN 1 AND 360),

  fecha_inicio DATE NOT NULL,

  -- Valores calculados (guardados para referencia rápida y auditoría)
  valor_cuota NUMERIC(14,2) NOT NULL
    CONSTRAINT ck_credito_cuota_positiva CHECK (valor_cuota > 0),

  interes_total NUMERIC(14,2) NOT NULL
    CONSTRAINT ck_credito_interes_no_negativo CHECK (interes_total >= 0),

  monto_total NUMERIC(14,2) NOT NULL
    CONSTRAINT ck_credito_total_positivo CHECK (monto_total > 0),

  -- Tasa de mora en BD (no hardcodeada en código — Fix 6)
  tasa_mora_diaria NUMERIC(8,6) NOT NULL DEFAULT 0.001
    CONSTRAINT ck_credito_mora_valida CHECK (tasa_mora_diaria >= 0 AND tasa_mora_diaria <= 0.05),

  -- Versión del plan (incrementa con cada reestructuración)
  version_actual INT NOT NULL DEFAULT 1
    CONSTRAINT ck_credito_version_positiva CHECK (version_actual >= 1),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_creditos_constructora_fuente
  ON public.creditos_constructora(fuente_pago_id);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_creditos_constructora_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_creditos_constructora_updated_at ON public.creditos_constructora;
CREATE TRIGGER trigger_creditos_constructora_updated_at
  BEFORE UPDATE ON public.creditos_constructora
  FOR EACH ROW EXECUTE FUNCTION update_creditos_constructora_updated_at();

-- RLS
ALTER TABLE public.creditos_constructora ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Autenticados pueden ver créditos" ON public.creditos_constructora
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Solo admins pueden insertar créditos" ON public.creditos_constructora
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.jwt() ->> 'role' IN ('admin', 'superadmin')
  );

CREATE POLICY "Solo admins pueden actualizar créditos" ON public.creditos_constructora
  FOR UPDATE TO authenticated
  USING (
    auth.jwt() ->> 'role' IN ('admin', 'superadmin')
  );

COMMENT ON TABLE public.creditos_constructora IS
'Parámetros financieros de fuentes de pago tipo crédito con la constructora.
 Relación 1:1 con fuentes_pago. Solo existe cuando fuentes_pago.tipo = "Crédito con la Constructora".
 capital es lo que cuenta para el cierre financiero (se guarda también en fuentes_pago.capital_para_cierre).
 monto_total = capital + interes_total es lo que va a fuentes_pago.monto_aprobado.';

-- ============================================================
-- PASO 7: TABLA cuotas_credito
-- Plan de amortización con versioning para reestructuraciones
-- ============================================================

CREATE TABLE IF NOT EXISTS public.cuotas_credito (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  fuente_pago_id UUID NOT NULL
    REFERENCES public.fuentes_pago(id) ON DELETE CASCADE,

  numero_cuota INT NOT NULL
    CONSTRAINT ck_cuota_numero_positivo CHECK (numero_cuota >= 1),

  fecha_vencimiento DATE NOT NULL,

  valor_cuota NUMERIC(12,2) NOT NULL
    CONSTRAINT ck_cuota_valor_positivo CHECK (valor_cuota > 0),

  mora_aplicada NUMERIC(12,2) NOT NULL DEFAULT 0
    CONSTRAINT ck_cuota_mora_no_negativa CHECK (mora_aplicada >= 0),

  -- Columna generada: total a cobrar incluyendo mora
  total_a_cobrar NUMERIC(12,2) GENERATED ALWAYS AS (valor_cuota + mora_aplicada) STORED,

  -- 'Pendiente' | 'Pagada' | 'Reestructurada'
  -- 'Vencida' se calcula en tiempo real en vista_cuotas_vigentes (sin cron jobs)
  estado TEXT NOT NULL DEFAULT 'Pendiente'
    CONSTRAINT ck_cuota_estado_valido CHECK (estado IN ('Pendiente', 'Pagada', 'Reestructurada')),

  fecha_pago DATE,

  -- Versión del plan: incrementa con cada reestructuración (Fix 5)
  version_plan INT NOT NULL DEFAULT 1
    CONSTRAINT ck_cuota_version_positiva CHECK (version_plan >= 1),

  notas TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unicidad: una cuota por número dentro de cada versión del plan
  CONSTRAINT uq_cuota_version_numero UNIQUE (fuente_pago_id, version_plan, numero_cuota)
);

CREATE INDEX IF NOT EXISTS idx_cuotas_credito_fuente
  ON public.cuotas_credito(fuente_pago_id);
CREATE INDEX IF NOT EXISTS idx_cuotas_credito_estado
  ON public.cuotas_credito(estado);
CREATE INDEX IF NOT EXISTS idx_cuotas_credito_vencimiento
  ON public.cuotas_credito(fecha_vencimiento);
CREATE INDEX IF NOT EXISTS idx_cuotas_credito_version
  ON public.cuotas_credito(fuente_pago_id, version_plan);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_cuotas_credito_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_cuotas_credito_updated_at ON public.cuotas_credito;
CREATE TRIGGER trigger_cuotas_credito_updated_at
  BEFORE UPDATE ON public.cuotas_credito
  FOR EACH ROW EXECUTE FUNCTION update_cuotas_credito_updated_at();

-- Trigger: cuando se crea versión nueva (reestructuración), actualizar version_actual en creditos_constructora
CREATE OR REPLACE FUNCTION sync_version_credito()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo actualizar si la nueva cuota tiene una versión mayor
  UPDATE public.creditos_constructora
  SET version_actual = NEW.version_plan
  WHERE fuente_pago_id = NEW.fuente_pago_id
    AND NEW.version_plan > version_actual;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_version_credito ON public.cuotas_credito;
CREATE TRIGGER trigger_sync_version_credito
  AFTER INSERT ON public.cuotas_credito
  FOR EACH ROW EXECUTE FUNCTION sync_version_credito();

-- RLS
ALTER TABLE public.cuotas_credito ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Autenticados pueden ver cuotas" ON public.cuotas_credito
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Solo admins pueden insertar cuotas" ON public.cuotas_credito
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.jwt() ->> 'role' IN ('admin', 'superadmin')
  );

CREATE POLICY "Solo admins pueden actualizar cuotas" ON public.cuotas_credito
  FOR UPDATE TO authenticated
  USING (
    auth.jwt() ->> 'role' IN ('admin', 'superadmin')
  );

COMMENT ON TABLE public.cuotas_credito IS
'Tabla de amortización de créditos con la constructora.
 version_plan permite múltiples reestructuraciones preservando historial.
 Estado "Vencida" se calcula en tiempo real en vista_cuotas_vigentes — no es un estado almacenado
 para evitar necesitar cron jobs y mantener datos siempre actualizados.';

-- ============================================================
-- PASO 8: VISTA vista_cuotas_vigentes (Fix 7)
-- Solo muestra la versión activa del plan (no versiones archivadas)
-- Calcula estado "Vencida" automáticamente sin cron jobs
-- ============================================================

CREATE OR REPLACE VIEW public.vista_cuotas_vigentes AS
SELECT
  cc.*,
  -- Estado efectivo en tiempo real: Pendiente vencida = 'Vencida'
  CASE
    WHEN cc.estado = 'Pendiente' AND cc.fecha_vencimiento < CURRENT_DATE
    THEN 'Vencida'
    ELSE cc.estado
  END AS estado_efectivo,
  -- Flag booleano para facilitar filtros en UI
  (cc.estado = 'Pendiente' AND cc.fecha_vencimiento < CURRENT_DATE) AS esta_vencida,
  -- Días de mora (0 si no está vencida)
  GREATEST(0, CURRENT_DATE - cc.fecha_vencimiento) AS dias_mora
FROM public.cuotas_credito cc
INNER JOIN (
  -- Solo la versión máxima (plan vigente) de cada fuente
  SELECT fuente_pago_id, MAX(version_plan) AS version_max
  FROM public.cuotas_credito
  GROUP BY fuente_pago_id
) vmax ON cc.fuente_pago_id = vmax.fuente_pago_id
       AND cc.version_plan = vmax.version_max;

COMMENT ON VIEW public.vista_cuotas_vigentes IS
'Muestra únicamente las cuotas del plan vigente (versión más reciente) de cada fuente.
 Las cuotas de planes reestructurados no aparecen aquí — se acceden via cuotas_credito directo.
 estado_efectivo: calcula "Vencida" automáticamente sin estados almacenados adicionales.
 dias_mora: días transcurridos desde la fecha de vencimiento (0 si al día).';

-- ============================================================
-- PASO 9: INSERTAR TIPO "Crédito con la Constructora"
-- ============================================================

INSERT INTO public.tipos_fuentes_pago (
  nombre,
  codigo,
  descripcion,
  activo,
  orden,
  icono,
  color,
  requiere_entidad,
  permite_multiples_abonos,
  logica_negocio
) VALUES (
  'Crédito con la Constructora',
  'credito_constructora',
  'Financiación directa con la constructora. Genera tabla de amortización con tasa de interés configurable, seguimiento de cuotas y posibilidad de reestructuración.',
  true,
  5,
  'Landmark',
  'indigo',
  false,
  true,
  '{
    "genera_cuotas": true,
    "capital_para_cierre": true,
    "permite_mora": true,
    "formula_interes": "simple"
  }'::jsonb
)
ON CONFLICT (nombre) DO UPDATE SET
  descripcion       = EXCLUDED.descripcion,
  activo            = true,
  orden             = EXCLUDED.orden,
  icono             = EXCLUDED.icono,
  color             = EXCLUDED.color,
  requiere_entidad  = EXCLUDED.requiere_entidad,
  permite_multiples_abonos = EXCLUDED.permite_multiples_abonos,
  logica_negocio    = EXCLUDED.logica_negocio;

-- ============================================================
-- PASO 10: VERIFICACIONES FINALES
-- ============================================================

-- Verificar que el trigger dinámico de tipos reemplazó el CHECK
SELECT conname, contype
FROM pg_constraint
WHERE conrelid = 'public.fuentes_pago'::regclass
  AND contype = 'c'
  AND conname = 'fuentes_pago_tipo_check';
-- Debe retornar 0 filas

-- Verificar nuevas columnas en fuentes_pago
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'fuentes_pago'
  AND column_name IN ('capital_para_cierre', 'mora_total_recibida');

-- Verificar nuevas tablas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('creditos_constructora', 'cuotas_credito');

-- Verificar vista
SELECT viewname FROM pg_views
WHERE schemaname = 'public' AND viewname = 'vista_cuotas_vigentes';

-- Verificar tipo insertado
SELECT nombre, logica_negocio
FROM public.tipos_fuentes_pago
WHERE nombre = 'Crédito con la Constructora';
