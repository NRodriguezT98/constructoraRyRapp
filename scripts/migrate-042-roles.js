/**
 * Migración 042: Renombrar roles del sistema
 *
 * Script Node.js porque hay 34+ políticas RLS que dependen del ENUM rol_usuario.
 * El script:
 *   1. Captura definiciones exactas de todas las políticas afectadas
 *   2. Las elimina temporalmente
 *   3. Hace la migración del ENUM (TEXT -> UPDATE -> ENUM nuevo)
 *   4. Recrea todas las políticas exactamente como estaban
 */

const { Client } = require('pg')
require('dotenv').config({ path: '.env.local' })

async function main() {
  const url = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL
  if (!url) throw new Error('No se encontró SUPABASE_DB_URL o DATABASE_URL')

  const client = new Client({ connectionString: url })
  await client.connect()
  console.log('✓ Conectado a la base de datos\n')

  try {
    await client.query('BEGIN')

    // ===== PASO 1: Capturar TODAS las políticas que referencian rol_usuario o usuarios.rol =====
    console.log('PASO 1: Capturando políticas RLS afectadas...')

    const { rows: policies } = await client.query(`
      SELECT
        schemaname,
        tablename,
        policyname,
        permissive,
        cmd,
        qual,
        with_check,
        roles
      FROM pg_policies
      WHERE qual::text ILIKE '%rol_usuario%'
        OR with_check::text ILIKE '%rol_usuario%'
        OR qual::text ILIKE '%\\.rol%'
        OR with_check::text ILIKE '%\\.rol%'
      ORDER BY tablename, policyname
    `)

    // También capturar las políticas de la tabla usuarios (incluyendo las que no mencionan rol)
    const { rows: usuariosPolicies } = await client.query(`
      SELECT
        schemaname,
        tablename,
        policyname,
        permissive,
        cmd,
        qual,
        with_check,
        roles
      FROM pg_policies
      WHERE tablename = 'usuarios'
      ORDER BY policyname
    `)

    // Fusión sin duplicados
    const allPoliciesMap = new Map()
    ;[...policies, ...usuariosPolicies].forEach(p => {
      const key = `${p.tablename}.${p.policyname}`
      if (!allPoliciesMap.has(key)) allPoliciesMap.set(key, p)
    })
    const allPolicies = Array.from(allPoliciesMap.values())

    console.log(`  → ${allPolicies.length} políticas capturadas\n`)

    // ===== PASO 2: Eliminar vista y función que dependen del ENUM =====
    console.log('PASO 2: Eliminando vista y función...')
    await client.query('DROP VIEW IF EXISTS vista_usuarios_completos')
    await client.query('DROP FUNCTION IF EXISTS handle_new_user() CASCADE')
    console.log('  → Vista y función eliminadas\n')

    // ===== PASO 3: Eliminar TODAS las políticas capturadas =====
    console.log('PASO 3: Eliminando políticas RLS...')
    for (const p of allPolicies) {
      const schema = p.schemaname === 'storage' ? 'storage.' : ''
      await client.query(
        `DROP POLICY IF EXISTS "${p.policyname}" ON ${schema}"${p.tablename}"`
      )
      console.log(`  → Eliminated: ${p.tablename}.${p.policyname}`)
    }
    console.log('')

    // ===== PASO 4: Convertir columna a TEXT y eliminar ENUM =====
    console.log('PASO 4: ALTER usuarios.rol TEXT + DROP ENUM...')
    await client.query('ALTER TABLE usuarios ALTER COLUMN rol DROP DEFAULT')
    await client.query('ALTER TABLE usuarios ALTER COLUMN rol TYPE TEXT')
    await client.query('DROP TYPE IF EXISTS rol_usuario CASCADE')
    console.log(
      '  → Default eliminado, columna convertida a TEXT, ENUM eliminado\n'
    )

    // ===== PASO 5: Renombrar roles en datos =====
    console.log('PASO 5: Renombrando roles en datos...')

    const r1 = await client.query(
      `UPDATE usuarios SET rol = 'Contabilidad', fecha_actualizacion = NOW() WHERE rol IN ('Contador', 'Vendedor')`
    )
    console.log(`  → ${r1.rowCount} usuarios: Contador/Vendedor → Contabilidad`)

    const r2 = await client.query(
      `UPDATE usuarios SET rol = 'Administrador de Obra', fecha_actualizacion = NOW() WHERE rol = 'Supervisor'`
    )
    console.log(
      `  → ${r2.rowCount} usuarios: Supervisor → Administrador de Obra`
    )

    const r3 = await client.query(
      `UPDATE usuarios SET rol = 'Gerencia', fecha_actualizacion = NOW() WHERE rol = 'Gerente'`
    )
    console.log(`  → ${r3.rowCount} usuarios: Gerente → Gerencia`)

    // permisos_rol (ya es TEXT pero tiene CHECK constraint)
    await client.query(
      'ALTER TABLE permisos_rol DROP CONSTRAINT IF EXISTS permisos_rol_rol_check'
    )
    await client.query(
      'ALTER TABLE permisos_rol DROP CONSTRAINT IF EXISTS chk_permisos_rol_valido'
    )
    await client.query(
      `UPDATE permisos_rol SET rol = 'Contabilidad' WHERE rol = 'Contador'`
    )
    await client.query(
      `UPDATE permisos_rol SET rol = 'Administrador de Obra' WHERE rol = 'Supervisor'`
    )
    await client.query(
      `UPDATE permisos_rol SET rol = 'Gerencia' WHERE rol = 'Gerente'`
    )
    await client.query(`DELETE FROM permisos_rol WHERE rol = 'Vendedor'`)
    console.log('  → permisos_rol actualizados\n')

    // ===== PASO 6: Recrear ENUM con nuevos valores =====
    console.log('PASO 6: Recreando ENUM rol_usuario...')
    await client.query(`
      CREATE TYPE rol_usuario AS ENUM (
        'Administrador',
        'Contabilidad',
        'Gerencia',
        'Administrador de Obra'
      )
    `)
    await client.query(
      'ALTER TABLE usuarios ALTER COLUMN rol TYPE rol_usuario USING rol::rol_usuario'
    )
    console.log('  → ENUM recreado y columna convertida\n')

    // ===== PASO 7: Recrear función handle_new_user =====
    console.log('PASO 7: Recreando función handle_new_user...')
    await client.query(`
      CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS trigger
        LANGUAGE plpgsql
        SECURITY DEFINER
      AS $function$
      DECLARE
        v_nombres VARCHAR(100);
        v_apellidos VARCHAR(100);
        v_rol rol_usuario;
      BEGIN
        v_nombres := COALESCE(NEW.raw_user_meta_data->>'nombres', '');
        v_apellidos := COALESCE(NEW.raw_user_meta_data->>'apellidos', '');
        v_rol := COALESCE(
          (NEW.raw_user_meta_data->>'rol')::rol_usuario,
          'Contabilidad'::rol_usuario
        );
        INSERT INTO usuarios (id, email, nombres, apellidos, rol, estado, debe_cambiar_password)
        VALUES (NEW.id, NEW.email, v_nombres, v_apellidos, v_rol, 'Activo'::estado_usuario, true);
        RETURN NEW;
      END;
      $function$
    `)
    await client.query(
      'DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users'
    )
    await client.query(`
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW
        EXECUTE FUNCTION public.handle_new_user()
    `)
    console.log('  → Función y trigger recreados\n')

    // ===== PASO 8: Recrear vista =====
    console.log('PASO 8: Recreando vista vista_usuarios_completos...')
    await client.query(`
      CREATE OR REPLACE VIEW vista_usuarios_completos AS
      SELECT u.id, u.email, u.nombres, u.apellidos,
        (((u.nombres)::text || ' '::text) || (u.apellidos)::text) AS nombre_completo,
        u.telefono, u.rol, u.estado, u.avatar_url, u.ultimo_acceso,
        u.debe_cambiar_password, u.intentos_fallidos, u.bloqueado_hasta,
        u.fecha_creacion, u.fecha_actualizacion,
        (((creator.nombres)::text || ' '::text) || (creator.apellidos)::text) AS creado_por_nombre,
        au.created_at AS fecha_registro_auth,
        au.last_sign_in_at AS ultimo_login_auth
      FROM ((usuarios u
        LEFT JOIN usuarios creator ON ((creator.id = u.creado_por)))
        LEFT JOIN auth.users au ON ((au.id = u.id)))
    `)
    console.log('  → Vista recreada\n')

    // ===== PASO 9: Recrear TODAS las políticas RLS =====
    console.log('PASO 9: Recreando políticas RLS...')
    for (const p of allPolicies) {
      const schema = p.schemaname === 'storage' ? 'storage.' : ''
      const permissive =
        p.permissive === 'PERMISSIVE' ? 'PERMISSIVE' : 'RESTRICTIVE'

      let sql = `CREATE POLICY "${p.policyname}" ON ${schema}"${p.tablename}"`
      sql += ` AS ${permissive}`
      sql += ` FOR ${p.cmd}`

      // Roles
      if (p.roles && p.roles !== '{public}') {
        sql += ` TO ${p.roles.replace(/[{}]/g, '')}`
      }

      if (p.qual) {
        sql += ` USING (${p.qual})`
      }
      if (p.with_check) {
        sql += ` WITH CHECK (${p.with_check})`
      }

      try {
        await client.query(sql)
        console.log(`  ✓ ${p.tablename}.${p.policyname}`)
      } catch (err) {
        console.error(`  ✗ ${p.tablename}.${p.policyname}: ${err.message}`)
        throw err
      }
    }
    console.log('')

    // ===== PASO 10: Limpiar constraints obsoletos =====
    console.log('PASO 10: Limpiando constraints...')
    await client.query(
      'ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_rol_check'
    )
    await client.query(
      'ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS chk_rol_valido'
    )
    await client.query(
      'ALTER TABLE permisos_rol DROP CONSTRAINT IF EXISTS permisos_rol_rol_check'
    )
    await client.query(
      'ALTER TABLE permisos_rol DROP CONSTRAINT IF EXISTS chk_permisos_rol_valido'
    )
    console.log('  → Constraints limpiados\n')

    // ===== PASO 11: Verificación =====
    console.log('PASO 11: Verificación final...')
    const {
      rows: [{ count: invalidos }],
    } = await client.query(`
      SELECT COUNT(*) as count FROM usuarios
      WHERE rol::text NOT IN ('Administrador', 'Contabilidad', 'Gerencia', 'Administrador de Obra')
    `)
    const {
      rows: [{ count: total }],
    } = await client.query('SELECT COUNT(*) as count FROM usuarios')

    if (parseInt(invalidos) > 0) {
      throw new Error(`Hay ${invalidos} usuarios con roles inválidos!`)
    }

    await client.query('COMMIT')

    console.log('='.repeat(60))
    console.log('✅ MIGRACIÓN 042 COMPLETADA EXITOSAMENTE')
    console.log(`✅ ${total} usuarios con roles válidos`)
    console.log(
      '✅ Roles: Administrador, Contabilidad, Gerencia, Administrador de Obra'
    )
    console.log(`✅ ${allPolicies.length} políticas RLS restauradas`)
    console.log('='.repeat(60))
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('\n❌ ERROR - ROLLBACK ejecutado')
    console.error(error.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()
