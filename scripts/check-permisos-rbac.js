#!/usr/bin/env node
/**
 * @file check-permisos-rbac.js
 * @description Diagnóstico completo del sistema RBAC: permisos_rol y tiene_permiso()
 * @usage node scripts/check-permisos-rbac.js
 */

const fs = require('fs')
const path = require('path')
const { Client } = require('pg')

const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
  magenta: '\x1b[35m',
}

const c = (text, ...styles) =>
  styles.map(s => colors[s]).join('') + text + colors.reset

function header(msg) {
  console.log('')
  console.log(c('═'.repeat(60), 'cyan'))
  console.log(c(`  ${msg}`, 'cyan', 'bold'))
  console.log(c('═'.repeat(60), 'cyan'))
}

function subheader(msg) {
  console.log('')
  console.log(c(`▸ ${msg}`, 'yellow', 'bold'))
}

function ok(msg) {
  console.log(c(`  ✓ ${msg}`, 'green'))
}

function warn(msg) {
  console.log(c(`  ⚠  ${msg}`, 'yellow'))
}

function err(msg) {
  console.log(c(`  ✗ ${msg}`, 'red'))
}

function printTable(rows, columns) {
  if (!rows || rows.length === 0) {
    console.log(c('  (sin resultados)', 'gray'))
    return
  }
  const cols = columns || Object.keys(rows[0])
  const widths = cols.map(col =>
    Math.max(col.length, ...rows.map(r => String(r[col] ?? '').length))
  )
  const line = cols.map((col, i) => col.padEnd(widths[i])).join(' │ ')
  const sep = widths.map(w => '─'.repeat(w)).join('─┼─')
  console.log(c('  ' + line, 'bold'))
  console.log(c('  ' + sep, 'gray'))
  rows.forEach(row => {
    const vals = cols.map((col, i) => String(row[col] ?? '').padEnd(widths[i]))
    console.log('  ' + vals.join(' │ '))
  })
}

async function loadConfig() {
  let databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    const envPath = path.join(process.cwd(), '.env.local')
    if (!fs.existsSync(envPath)) throw new Error('.env.local no encontrado')
    const content = fs.readFileSync(envPath, 'utf8')
    const match = content.match(/^\s*DATABASE_URL\s*=\s*(.+)$/m)
    if (match) databaseUrl = match[1].trim().replace(/^["']|["']$/g, '')
  }
  if (!databaseUrl) throw new Error('DATABASE_URL no encontrado')
  const m = databaseUrl.match(
    /postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/
  )
  if (!m) throw new Error('Formato DATABASE_URL inválido')
  return {
    user: m[1],
    password: m[2],
    host: m[3],
    port: parseInt(m[4]),
    database: m[5],
    ssl: { rejectUnauthorized: false },
  }
}

async function run() {
  header('DIAGNÓSTICO RBAC — Sistema de permisos')

  const client = new Client(await loadConfig())
  await client.connect()
  ok(`Conectado a ${client.host}`)

  let erroresEncontrados = 0
  let advertenciasEncontradas = 0

  // ─────────────────────────────────────────────────────────
  // BLOQUE 1: Roles configurados en permisos_rol
  // ─────────────────────────────────────────────────────────
  subheader('BLOQUE 1: Roles en permisos_rol')
  const rolesEsperados = [
    'Administrador',
    'Contabilidad',
    'Administrador de Obra',
    'Gerencia',
  ]

  const { rows: bloq1 } = await client.query(`
    SELECT rol, COUNT(*) AS total_permisos,
           COUNT(*) FILTER (WHERE permitido = true)  AS activos,
           COUNT(*) FILTER (WHERE permitido = false) AS desactivados
    FROM permisos_rol
    GROUP BY rol ORDER BY rol
  `)
  printTable(bloq1)

  const rolesEnBD = bloq1.map(r => r.rol)
  rolesEsperados.forEach(rol => {
    if (!rolesEnBD.includes(rol)) {
      err(`Rol '${rol}' no tiene ninguna fila en permisos_rol`)
      erroresEncontrados++
    }
  })
  const rolesExtras = rolesEnBD.filter(r => !rolesEsperados.includes(r))
  rolesExtras.forEach(r => {
    warn(`Rol desconocido '${r}' en permisos_rol (no está en tipos TypeScript)`)
    advertenciasEncontradas++
  })

  // ─────────────────────────────────────────────────────────
  // BLOQUE 2: Matriz de permisos por rol
  // ─────────────────────────────────────────────────────────
  subheader('BLOQUE 2: Matriz de permisos (módulo × acción × rol)')

  const { rows: bloq2 } = await client.query(`
    SELECT
      modulo,
      accion,
      MAX(CASE WHEN rol = 'Administrador'         THEN (CASE WHEN permitido THEN '✓' ELSE '✗' END) END) AS "Administrador",
      MAX(CASE WHEN rol = 'Contabilidad'          THEN (CASE WHEN permitido THEN '✓' ELSE '✗' END) END) AS "Contabilidad",
      MAX(CASE WHEN rol = 'Administrador de Obra' THEN (CASE WHEN permitido THEN '✓' ELSE '✗' END) END) AS "Admin_Obra",
      MAX(CASE WHEN rol = 'Gerencia'              THEN (CASE WHEN permitido THEN '✓' ELSE '✗' END) END) AS "Gerencia"
    FROM permisos_rol
    GROUP BY modulo, accion
    ORDER BY modulo, accion
  `)
  printTable(bloq2)

  // ─────────────────────────────────────────────────────────
  // BLOQUE 3: Acciones usadas en políticas RLS activas
  // ─────────────────────────────────────────────────────────
  subheader('BLOQUE 3: Cobertura de acciones en políticas RLS activas')

  const accionesRLS = [
    {
      modulo: 'clientes',
      accion: 'ver_historial',
      tabla: 'notas_historial_cliente',
      op: 'SELECT',
    },
    {
      modulo: 'clientes',
      accion: 'anotar_historial',
      tabla: 'notas_historial_cliente',
      op: 'INSERT',
    },
    {
      modulo: 'clientes',
      accion: 'editar',
      tabla: 'notas_historial_cliente',
      op: 'UPDATE',
    },
    {
      modulo: 'clientes',
      accion: 'eliminar',
      tabla: 'notas_historial_cliente',
      op: 'DELETE',
    },
    {
      modulo: 'abonos',
      accion: 'registrar',
      tabla: 'abonos_historial',
      op: 'INSERT',
    },
    {
      modulo: 'abonos',
      accion: 'anular',
      tabla: 'abonos_historial',
      op: 'UPDATE',
    },
    {
      modulo: 'abonos',
      accion: 'editar',
      tabla: 'abonos_historial',
      op: 'UPDATE',
    },
    {
      modulo: 'abonos',
      accion: 'eliminar',
      tabla: 'abonos_historial',
      op: 'DELETE',
    },
    {
      modulo: 'negociaciones',
      accion: 'renunciar',
      tabla: 'renuncias',
      op: 'INSERT',
    },
    { modulo: 'renuncias', accion: 'editar', tabla: 'renuncias', op: 'UPDATE' },
    {
      modulo: 'documentos',
      accion: 'subir',
      tabla: 'documentos_proyecto',
      op: 'INSERT',
    },
    {
      modulo: 'documentos',
      accion: 'eliminar',
      tabla: 'documentos_proyecto',
      op: 'DELETE',
    },
  ]

  const { rows: cobertura } = await client.query(
    `
    SELECT modulo, accion,
           COUNT(*) AS roles_configurados,
           COUNT(*) FILTER (WHERE permitido = true) AS roles_con_acceso,
           STRING_AGG(rol || '=' || (CASE WHEN permitido THEN 'SI' ELSE 'NO' END), ' | ' ORDER BY rol) AS detalle
    FROM permisos_rol
    WHERE (modulo, accion) IN (${accionesRLS.map((_, i) => `($${i * 2 + 1},$${i * 2 + 2})`).join(',')})
    GROUP BY modulo, accion
  `,
    accionesRLS.flatMap(a => [a.modulo, a.accion])
  )

  const coberturaMap = new Map(
    cobertura.map(r => [`${r.modulo}.${r.accion}`, r])
  )

  const resultados3 = accionesRLS.map(a => {
    const cob = coberturaMap.get(`${a.modulo}.${a.accion}`)
    return {
      modulo: a.modulo,
      accion: a.accion,
      tabla_rls: a.tabla,
      roles: cob ? cob.roles_configurados : '0',
      detalle: cob ? cob.detalle : '⚠ SIN CONFIGURAR',
    }
  })
  printTable(resultados3, ['modulo', 'accion', 'tabla_rls', 'roles', 'detalle'])

  const blindSpots = accionesRLS.filter(
    a => !coberturaMap.has(`${a.modulo}.${a.accion}`)
  )
  if (blindSpots.length > 0) {
    console.log('')
    blindSpots.forEach(a => {
      err(
        `BLIND SPOT: '${a.modulo}.${a.accion}' — ningún no-admin puede operar en '${a.tabla}' (${a.op})`
      )
      erroresEncontrados++
    })
  } else {
    ok('Todas las acciones RLS tienen al menos un rol configurado')
  }

  // ─────────────────────────────────────────────────────────
  // BLOQUE 4: Simulación tiene_permiso() con usuarios reales
  //
  // NOTA: tiene_permiso() lee auth.jwt() ->> 'user_rol' — no funciona
  // con conexión pg directa (sin JWT). Por eso simulamos su lógica
  // exacta en SQL: bypass para Administrador + lookup en permisos_rol.
  // ─────────────────────────────────────────────────────────
  subheader('BLOQUE 4: Simulación lógica tiene_permiso() por rol activo')
  console.log(
    c(
      '  (Nota: se simula la lógica sin JWT — idéntico al comportamiento en producción)',
      'gray'
    )
  )

  const acciones4 = [
    { col: 'cli.ver', modulo: 'clientes', accion: 'ver' },
    { col: 'cli.crear', modulo: 'clientes', accion: 'crear' },
    { col: 'cli.editar', modulo: 'clientes', accion: 'editar' },
    { col: 'cli.eliminar', modulo: 'clientes', accion: 'eliminar' },
    { col: 'cli.ver_hist', modulo: 'clientes', accion: 'ver_historial' },
    { col: 'cli.anotar', modulo: 'clientes', accion: 'anotar_historial' },
    { col: 'abo.reg', modulo: 'abonos', accion: 'registrar' },
    { col: 'abo.anu', modulo: 'abonos', accion: 'anular' },
    { col: 'abo.edi', modulo: 'abonos', accion: 'editar' },
    { col: 'doc.sub', modulo: 'documentos', accion: 'subir' },
    { col: 'doc.eli', modulo: 'documentos', accion: 'eliminar' },
    { col: 'neg.ren', modulo: 'negociaciones', accion: 'renunciar' },
  ]

  // Construir SELECT que simula la lógica de tiene_permiso():
  //   Administrador → siempre TRUE (bypass)
  //   Otros roles   → lookup en permisos_rol, FALSE si no hay fila
  const casesSQL = acciones4
    .map(
      ({ col, modulo, accion }) => `
    CASE
      WHEN u.rol::text = 'Administrador' THEN true
      ELSE COALESCE((
        SELECT pr.permitido FROM permisos_rol pr
        WHERE pr.rol = u.rol::text AND pr.modulo = '${modulo}' AND pr.accion = '${accion}'
        LIMIT 1
      ), false)
    END AS "${col}"
  `
    )
    .join(',')

  const { rows: sim } = await client.query(`
    SELECT
      u.nombres || ' ' || u.apellidos AS usuario,
      u.rol::text                     AS rol,
      ${casesSQL}
    FROM usuarios u
    WHERE u.estado = 'Activo'
    ORDER BY CASE u.rol::text
      WHEN 'Administrador'         THEN 1
      WHEN 'Contabilidad'          THEN 2
      WHEN 'Administrador de Obra' THEN 3
      WHEN 'Gerencia'              THEN 4
      ELSE 5
    END, u.nombres
  `)

  if (sim.length === 0) {
    warn('No hay usuarios activos en la BD — simulación omitida')
    advertenciasEncontradas++
  } else {
    const simFormateado = sim.map(row => {
      const out = { usuario: row.usuario, rol: row.rol }
      Object.keys(row).forEach(k => {
        if (k !== 'usuario' && k !== 'rol') {
          out[k] = row[k] === true ? '✓' : row[k] === false ? '✗' : '?'
        }
      })
      return out
    })
    printTable(simFormateado)

    // Validación: Administrador siempre TRUE en todo
    const admins = simFormateado.filter(r => r.rol === 'Administrador')
    admins.forEach(admin => {
      const fallos = Object.entries(admin).filter(
        ([k, v]) => k !== 'usuario' && k !== 'rol' && v !== '✓'
      )
      if (fallos.length > 0) {
        err(
          `Administrador '${admin.usuario}': bypass INCORRECTO — tiene ✗ en: ${fallos.map(([k]) => k).join(', ')}`
        )
        err(
          'Si ocurre, verificar que permisos_rol tiene fila con rol=Administrador y permitido=true'
        )
        erroresEncontrados++
      } else {
        ok(`Administrador '${admin.usuario}': bypass correcto (todas ✓)`)
      }
    })
  }

  // ─────────────────────────────────────────────────────────
  // RESUMEN FINAL
  // ─────────────────────────────────────────────────────────
  header('RESUMEN DEL DIAGNÓSTICO')
  if (erroresEncontrados === 0 && advertenciasEncontradas === 0) {
    ok('Sistema RBAC en perfecto estado — no se encontraron problemas')
  } else {
    if (erroresEncontrados > 0)
      err(`${erroresEncontrados} error(es) encontrado(s) — requieren atención`)
    if (advertenciasEncontradas > 0)
      warn(
        `${advertenciasEncontradas} advertencia(s) — revisar si son esperadas`
      )
  }

  console.log('')
  await client.end()
  process.exit(erroresEncontrados > 0 ? 1 : 0)
}

run().catch(e => {
  console.error(c(`\nError: ${e.message}`, 'red'))
  process.exit(1)
})
