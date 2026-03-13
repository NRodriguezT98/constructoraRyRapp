/**
 * ============================================
 * GUÍA: Sistema Dinámico de Requisitos de Fuentes
 * ============================================
 *
 * ## 🎯 Problema Resuelto
 *
 * Antes, los requisitos estaban hardcoded en `requisitos-fuentes.ts`.
 * Ahora están en una tabla de base de datos modificable desde UI admin.
 *
 * ## ✅ Beneficios
 *
 * 1. **Sin tocar código**: Modifica desde panel admin
 * 2. **Versionado**: Histórico de cambios
 * 3. **Activación/desactivación**: En tiempo real
 * 4. **Reordenamiento**: Drag & drop visual
 * 5. **Auditoría**: Quién cambió qué y cuándo
 *
 * ## 📐 Arquitectura
 *
 * ```
 * Base de Datos (requisitos_fuentes_pago_config)
 *   ↓
 * Service (requisitos.service.ts)
 *   ↓
 * Hook (useRequisitosQuery)
 *   ↓
 * UI Admin (/admin/requisitos-fuentes)
 * ```
 *
 * ## 📊 Estructura de Tabla
 *
 * ```sql
 * CREATE TABLE requisitos_fuentes_pago_config (
 *   id UUID PRIMARY KEY,
 *   tipo_fuente TEXT NOT NULL,
 *   paso_identificador TEXT NOT NULL,
 *   titulo TEXT NOT NULL,
 *   descripcion TEXT,
 *   instrucciones TEXT,
 *   nivel_validacion TEXT CHECK (nivel_validacion IN (
 *     'DOCUMENTO_OBLIGATORIO',
 *     'DOCUMENTO_OPCIONAL',
 *     'SOLO_CONFIRMACION'
 *   )),
 *   tipo_documento_sugerido TEXT,
 *   categoria_documento TEXT,
 *   orden INTEGER DEFAULT 1,
 *   activo BOOLEAN DEFAULT true,
 *   version INTEGER DEFAULT 1,
 *   fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
 *   fecha_actualizacion TIMESTAMPTZ DEFAULT NOW(),
 *   usuario_creacion UUID REFERENCES auth.users(id),
 *   usuario_actualizacion UUID REFERENCES auth.users(id)
 * )
 * ```
 *
 * ## 🚀 Pasos de Implementación
 *
 * ### 1. Ejecutar Migración SQL
 *
 * ```bash
 * npm run db:exec supabase/migrations/20251211_requisitos_fuentes_config.sql
 * ```
 *
 * La migración crea:
 * - ✅ Tabla `requisitos_fuentes_pago_config`
 * - ✅ Índices optimizados
 * - ✅ Políticas RLS (solo admins modifican)
 * - ✅ Función `obtener_requisitos_fuente()`
 * - ✅ Datos iniciales (configuración actual de 2 pasos)
 *
 * ### 2. Acceder al Panel Admin
 *
 * ```
 * URL: http://localhost:3000/admin/requisitos-fuentes
 * Permiso: Solo usuarios con rol 'admin'
 * ```
 *
 * ### 3. Configurar Requisitos
 *
 * #### Agregar Nuevo Requisito:
 *
 * 1. Selecciona tipo de fuente
 * 2. Click en "Agregar Requisito"
 * 3. Completa formulario:
 *    - **ID del paso**: snake_case (ej: `boleta_registro`)
 *    - **Título**: Texto amigable (ej: "Boleta de Registro")
 *    - **Descripción**: Para qué sirve el documento
 *    - **Nivel**: Obligatorio / Opcional / Solo Confirmación
 * 4. Click en "Crear Requisito"
 *
 * #### Editar Requisito Existente:
 *
 * 1. Hover sobre tarjeta de requisito
 * 2. Click en ícono de lápiz (editar)
 * 3. Modifica campos
 * 4. Click en ícono de guardar
 *
 * #### Eliminar Requisito:
 *
 * 1. Hover sobre tarjeta
 * 2. Click en ícono de basura
 * 3. Confirmar eliminación (soft delete → `activo = false`)
 *
 * #### Reordenar:
 *
 * - Arrastra con el ícono de grip (≡)
 * - Se guarda automáticamente
 *
 * ## 🔄 Cómo se Usa en el Código
 *
 * ### Antes (Hardcoded):
 *
 * ```typescript
 * import { REQUISITOS_CREDITO_HIPOTECARIO } from '@/modules/fuentes-pago/config/requisitos-fuentes'
 *
 * const requisitos = REQUISITOS_CREDITO_HIPOTECARIO // ❌ Estático
 * ```
 *
 * ### Ahora (Dinámico desde BD):
 *
 * ```typescript
 * import { requisitosService } from '@/modules/requisitos-fuentes/services/requisitos.service'
 *
 * // En React Query
 * const { data: requisitos } = useQuery({
 *   queryKey: ['requisitos-fuentes', tipoFuente],
 *   queryFn: () => requisitosService.obtenerRequisitosPorTipo(tipoFuente)
 * })
 * ```
 *
 * ### Actualizar Trigger de BD:
 *
 * El trigger `crear_pasos_fuente_pago()` debe leer de la tabla:
 *
 * ```sql
 * CREATE OR REPLACE FUNCTION crear_pasos_fuente_pago()
 * RETURNS TRIGGER AS $$
 * DECLARE
 *   paso RECORD;
 * BEGIN
 *   -- Obtener requisitos desde config
 *   FOR paso IN
 *     SELECT * FROM requisitos_fuentes_pago_config
 *     WHERE tipo_fuente = NEW.tipo_fuente
 *       AND activo = true
 *     ORDER BY orden ASC
 *   LOOP
 *     INSERT INTO pasos_fuente_pago (
 *       fuente_pago_id,
 *       paso,
 *       titulo,
 *       descripcion,
 *       nivel_validacion,
 *       completado,
 *       orden
 *     ) VALUES (
 *       NEW.id,
 *       paso.paso_identificador,
 *       paso.titulo,
 *       paso.descripcion,
 *       paso.nivel_validacion,
 *       false,
 *       paso.orden
 *     );
 *   END LOOP;
 *
 *   RETURN NEW;
 * END;
 * $$ LANGUAGE plpgsql;
 * ```
 *
 * ## 📝 Ejemplos de Configuración
 *
 * ### Crédito Hipotecario Simplificado (2 pasos):
 *
 * | Orden | Paso                  | Nivel      | Tipo Doc          |
 * |-------|-----------------------|------------|-------------------|
 * | 1     | Boleta de Registro    | OBLIGATORIO| Boleta Registro   |
 * | 2     | Solicitud Desembolso  | OPCIONAL   | Solicitud Desemb. |
 *
 * ### Crédito Hipotecario Completo (5 pasos):
 *
 * | Orden | Paso                  | Nivel      | Tipo Doc          |
 * |-------|-----------------------|------------|-------------------|
 * | 1     | Carta de Aprobación   | OBLIGATORIO| Carta Aprobación  |
 * | 2     | Avalúo Vivienda       | OPCIONAL   | Avalúo            |
 * | 3     | Escritura Firmada     | OBLIGATORIO| Escritura         |
 * | 4     | Boleta de Registro    | OBLIGATORIO| Boleta Registro   |
 * | 5     | Solicitud Desembolso  | OPCIONAL   | Solicitud Desemb. |
 *
 * ### Cuota Inicial (sin requisitos):
 *
 * - No crear registros → Sin pasos automáticos
 *
 * ## 🔐 Seguridad (RLS)
 *
 * ### Políticas Aplicadas:
 *
 * ```sql
 * -- Lectura: Todos los usuarios autenticados
 * CREATE POLICY "read_active_requisitos"
 *   ON requisitos_fuentes_pago_config
 *   FOR SELECT TO authenticated
 *   USING (activo = true);
 *
 * -- Modificación: Solo admins
 * CREATE POLICY "admin_modify_requisitos"
 *   ON requisitos_fuentes_pago_config
 *   FOR ALL TO authenticated
 *   USING (auth.uid() IN (
 *     SELECT id FROM usuarios WHERE rol = 'admin'
 *   ))
 *   WITH CHECK (auth.uid() IN (
 *     SELECT id FROM usuarios WHERE rol = 'admin'
 *   ));
 * ```
 *
 * ## 🧪 Testing
 *
 * ### 1. Verificar Datos Iniciales:
 *
 * ```sql
 * SELECT tipo_fuente, paso_identificador, titulo, nivel_validacion, orden
 * FROM requisitos_fuentes_pago_config
 * WHERE activo = true
 * ORDER BY tipo_fuente, orden;
 * ```
 *
 * ### 2. Probar en UI:
 *
 * 1. Acceder a `/admin/requisitos-fuentes`
 * 2. Seleccionar "Crédito Hipotecario"
 * 3. Verificar 2 pasos visibles
 * 4. Agregar nuevo paso temporal
 * 5. Editarlo
 * 6. Eliminarlo
 *
 * ### 3. Verificar en Frontend:
 *
 * 1. Ir a Cliente → Vivienda Asignada
 * 2. Ver fuente de pago (Crédito Hipotecario)
 * 3. Verificar pasos se crean desde config BD
 *
 * ## 📚 Archivos Creados
 *
 * ### Base de Datos:
 * - `supabase/migrations/20251211_requisitos_fuentes_config.sql`
 *
 * ### Backend:
 * - `src/modules/requisitos-fuentes/types/index.ts`
 * - `src/modules/requisitos-fuentes/services/requisitos.service.ts`
 *
 * ### Frontend:
 * - `src/app/admin/requisitos-fuentes/page.tsx`
 *
 * ### Documentación:
 * - `docs/SISTEMA-REQUISITOS-DINAMICO.md` (este archivo)
 *
 * ## 🎯 Próximos Pasos
 *
 * 1. **Ejecutar migración**: `npm run db:exec ...`
 * 2. **Acceder panel admin**: `/admin/requisitos-fuentes`
 * 3. **Probar configuración**: Agregar/editar/eliminar
 * 4. **Actualizar trigger BD**: Leer de tabla config
 * 5. **Actualizar hooks**: Usar `requisitosService`
 * 6. **Documentar cambios**: Actualizar README
 *
 * ## ⚠️ Consideraciones
 *
 * - **Migración de datos existentes**: Los pasos ya creados NO se actualizan automáticamente
 * - **Versionado**: Usar campo `version` para cambios importantes
 * - **Histórico**: No eliminar registros físicamente (soft delete con `activo = false`)
 * - **Performance**: Índices en `tipo_fuente` y `activo` para queries rápidas
 *
 * ## 🆘 Troubleshooting
 *
 * ### Error: "permission denied for table requisitos_fuentes_pago_config"
 *
 * **Causa**: Políticas RLS no permiten acceso
 * **Solución**: Verificar rol de usuario en tabla `usuarios`
 *
 * ```sql
 * SELECT id, email, rol FROM usuarios WHERE id = auth.uid();
 * ```
 *
 * ### Error: "No se muestran los pasos en la UI"
 *
 * **Causa**: Trigger no está leyendo de la tabla config
 * **Solución**: Actualizar función `crear_pasos_fuente_pago()`
 *
 * ### Error: "Requisitos duplicados"
 *
 * **Causa**: Constraint `uq_tipo_paso_version` violado
 * **Solución**: Cambiar `paso_identificador` o incrementar `version`
 *
 * ---
 *
 * **Fecha**: 2025-12-11
 * **Autor**: Sistema
 * **Versión**: 1.0.0
 */
