-- Intentar UPDATE de prueba
DO $$
DECLARE
    fuente_id uuid;
    resultado text;
BEGIN
    -- Obtener una fuente activa
    SELECT id INTO fuente_id
    FROM fuentes_pago
    WHERE negociacion_id = '105f3121-8d56-4b29-adac-380cebdc1faf'
      AND estado_fuente = 'activa'
      AND tipo = 'Subsidio Mi Casa Ya'
    LIMIT 1;

    IF fuente_id IS NULL THEN
        RAISE NOTICE 'No se encontró fuente "Subsidio Mi Casa Ya"';
        RETURN;
    END IF;

    -- Intentar UPDATE (solo prueba, NO commitear)
    BEGIN
        UPDATE fuentes_pago
        SET estado_fuente = 'inactiva',
            razon_inactivacion = 'TEST - Prueba de actualización',
            fecha_inactivacion = NOW()
        WHERE id = fuente_id;

        resultado := 'UPDATE exitoso para fuente: ' || fuente_id::text;
        RAISE NOTICE '%', resultado;

        -- ROLLBACK para no guardar cambios
        RAISE EXCEPTION 'ROLLBACK INTENCIONAL - Solo prueba';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'ERROR en UPDATE: %', SQLERRM;
            RAISE EXCEPTION '%', SQLERRM;
    END;
END $$;
