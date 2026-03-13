-- ============================================================================
-- SEED: Tipos de Fuentes de Pago (4 Oficiales con IDs fijos)
-- ============================================================================
--
-- ⚠️ IMPORTANTE:
-- - Los IDs deben mantenerse EXACTOS para no romper relaciones
-- - Si ya existen, actualiza nombre/descripción sin cambiar ID
-- - Son las 4 fuentes estándar de la constructora
--
-- 💡 USO:
-- - Ejecutar en instalación inicial
-- - Ejecutar si se borró accidentalmente una fuente
-- - Ejecutar después de cambios en catálogo
--
-- 📌 ICONOS VÁLIDOS (Lucide React):
-- - Wallet, Building2, Home, Shield, CreditCard, Landmark
-- - BadgeDollarSign, DollarSign, Banknote, HandCoins
--
-- 🎨 COLORES VÁLIDOS:
-- - blue, green, purple, orange, red, cyan, pink, indigo, yellow, emerald
--
-- ============================================================================

-- Usar INSERT ON CONFLICT para upsert
INSERT INTO tipos_fuentes_pago (
  id,
  nombre,
  codigo,
  descripcion,
  es_subsidio,
  requiere_entidad,
  permite_multiples_abonos,
  color,
  icono,
  orden,
  activo
) VALUES
  -- 1. CUOTA INICIAL
  (
    '25336a87-035e-47ac-a382-335af02219cf',
    'Cuota Inicial',
    'cuota_inicial',
    'Pagos directos del cliente (permite múltiples abonos)',
    false,
    false,  -- requiere_entidad
    true,   -- permite_multiples_abonos
    'blue',
    'DollarSign',
    1,
    true
  ),

  -- 2. CRÉDITO HIPOTECARIO
  (
    'e635231f-6f71-4180-8e79-e50e1a82ef7d',
    'Crédito Hipotecario',
    'credito_hipotecario',
    'Financiación bancaria',
    false,
    true,   -- requiere_entidad
    false,  -- permite_multiples_abonos
    'purple',
    'Building2',
    2,
    true
  ),

  -- 3. SUBSIDIO MI CASA YA
  (
    '6a58205b-7297-4fd8-a0ae-b899b8a2c2ce',
    'Subsidio Mi Casa Ya',
    'subsidio_mi_casa_ya',
    'Subsidio del gobierno nacional',
    true,
    false,  -- requiere_entidad
    false,  -- permite_multiples_abonos
    'green',
    'HandCoins',  -- ✅ CORREGIDO: Gift → HandCoins (icono válido)
    3,
    true
  ),

  -- 4. SUBSIDIO CAJA COMPENSACIÓN
  (
    '2a21e525-2731-4270-8668-4d64359eeeb6',
    'Subsidio Caja Compensación',
    'subsidio_caja_compensacion',
    'Subsidio de caja de compensación familiar',
    true,
    true,   -- requiere_entidad
    false,  -- permite_multiples_abonos
    'orange',
    'Home',  -- ✅ CORREGIDO: HomeIcon → Home (icono válido)
    4,
    true
  )

ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  codigo = EXCLUDED.codigo,
  descripcion = EXCLUDED.descripcion,
  es_subsidio = EXCLUDED.es_subsidio,
  requiere_entidad = EXCLUDED.requiere_entidad,
  permite_multiples_abonos = EXCLUDED.permite_multiples_abonos,
  color = EXCLUDED.color,
  icono = EXCLUDED.icono,
  orden = EXCLUDED.orden,
  activo = EXCLUDED.activo,
  updated_at = NOW();

-- Verificar que se crearon/actualizaron correctamente
SELECT
  id,
  nombre,
  codigo,
  es_subsidio,
  orden,
  activo
FROM tipos_fuentes_pago
ORDER BY orden;
