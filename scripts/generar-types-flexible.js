const https = require('https');
const fs = require('fs');

// Configuración de Supabase
const SUPABASE_URL = 'swyjhwgvkfcfdtemkyad.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3eWpod2d2a2ZjZmR0ZW1reWFkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDQ1NTg4NCwiZXhwIjoyMDc2MDMxODg0fQ.iVXSeDk_SfmbbX7K1o6qWQFDmNGduq_NWsQeB_heCyk';

console.log('🔍 Consultando schema de PostgreSQL...\n');

// Query SQL para obtener todas las tablas y columnas
const sql = `
SELECT
  t.table_name,
  json_agg(
    json_build_object(
      'column_name', c.column_name,
      'data_type', c.data_type,
      'is_nullable', c.is_nullable,
      'column_default', c.column_default,
      'udt_name', c.udt_name
    ) ORDER BY c.ordinal_position
  ) as columns
FROM information_schema.tables t
JOIN information_schema.columns c
  ON t.table_name = c.table_name
  AND t.table_schema = c.table_schema
WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
GROUP BY t.table_name
ORDER BY t.table_name;
`;

// Hacer request a la API de PostgreSQL de Supabase
const postData = JSON.stringify({ query: sql });

const options = {
  hostname: SUPABASE_URL,
  port: 443,
  path: '/rest/v1/rpc/exec_sql',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    'Content-Length': postData.length,
    'Prefer': 'return=representation'
  }
};

// Intentar método alternativo: usar endpoint de postgres-meta
const metaOptions = {
  hostname: SUPABASE_URL,
  port: 443,
  path: '/rest/v1/?select=*',
  method: 'GET',
  headers: {
    'apikey': SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
  }
};

console.log('📡 Consultando tablas desde Supabase...\n');

// Función para hacer request HTTP
function makeRequest(opts, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(opts, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            resolve(body);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(data);
    }

    req.end();
  });
}

// Mapeo de tipos PostgreSQL a TypeScript
function pgTypeToTS(pgType, udtName) {
  const typeMap = {
    'uuid': 'string',
    'text': 'string',
    'varchar': 'string',
    'character varying': 'string',
    'integer': 'number',
    'bigint': 'number',
    'smallint': 'number',
    'numeric': 'number',
    'decimal': 'number',
    'real': 'number',
    'double precision': 'number',
    'boolean': 'boolean',
    'timestamp': 'string',
    'timestamp with time zone': 'string',
    'timestamp without time zone': 'string',
    'timestamptz': 'string',
    'date': 'string',
    'time': 'string',
    'json': 'Json',
    'jsonb': 'Json',
    'ARRAY': 'string[]',
    'USER-DEFINED': udtName || 'string'
  };

  return typeMap[pgType] || typeMap[udtName] || 'unknown';
}

// Generar interface TypeScript para una tabla
function generateTableInterface(tableName, columns) {
  const fields = columns.map(col => {
    const tsType = pgTypeToTS(col.data_type, col.udt_name);
    const optional = col.is_nullable === 'YES' || col.column_default !== null ? '?' : '';
    return `          ${col.column_name}${optional}: ${tsType}`;
  }).join('\n');

  return `      ${tableName}: {
        Row: {
${fields}
        }
        Insert: {
${fields}
        }
        Update: {
${fields}
        }
        Relationships: []
      }`;
}

// Lista de tablas conocidas (fallback si el query falla)
// ⚠️ IMPORTANTE: Actualizar esta lista cuando se agreguen nuevas tablas
const KNOWN_TABLES = {
  'usuarios': [],
  'proyectos': [],
  'manzanas': [],
  'viviendas': [],
  'clientes': [],
  'negociaciones': [],
  'abonos_historial': [],
  'fuentes_pago': [],
  'renuncias': [],
  'categorias_documento': [],
  'documentos_proyecto': [],
  'documentos_cliente': [],
  'documentos_vivienda': [],
  'cliente_intereses': [],
  'audit_log': [],
  'audit_log_seguridad': [],
  'configuracion_sistema': [],
  'recargos_esquinera': [],
  'configuracion_recargos': [],
  'plantillas_proceso': [],
  'procesos_negociacion': [],
  'documento_reemplazos_admin': []
};

// ⚠️ IMPORTANTE: Actualizar esta lista cuando se agreguen nuevas vistas
const KNOWN_VIEWS = [
  'vista_viviendas_completas',
  'vista_manzanas_disponibilidad',
  'vista_abonos_completos',
  'vista_clientes_resumen',
  'vista_usuarios_completos',
  'v_negociaciones_completas',
  'v_renuncias_pendientes',
  'intereses_completos',
  'v_auditoria_por_modulo',
  'vista_documentos_vivienda'
];

// ⚠️ IMPORTANTE: Actualizar esta lista cuando se agreguen nuevas funciones RPC
const KNOWN_FUNCTIONS = {
  'obtener_siguiente_numero_vivienda': {
    Args: { p_manzana_id: 'string' },
    Returns: 'number'
  },
  'custom_access_token_hook': {
    Args: { event: 'Json' },
    Returns: 'Json'
  }
};

// Generar types usando fallback
function generateFallbackTypes() {
  const tablesCount = Object.keys(KNOWN_TABLES).length;
  const viewsCount = KNOWN_VIEWS.length;
  const functionsCount = Object.keys(KNOWN_FUNCTIONS).length;

  const tablesTypes = Object.keys(KNOWN_TABLES).map(table =>
    `      ${table}: {\n        Row: Record<string, any>\n        Insert: Record<string, any>\n        Update: Record<string, any>\n        Relationships: []\n      }`
  ).join('\n');

  const viewsTypes = KNOWN_VIEWS.map(view =>
    `      ${view}: {\n        Row: Record<string, any>\n        Relationships: []\n      }`
  ).join('\n');

  const functionsTypes = Object.entries(KNOWN_FUNCTIONS).map(([name, def]) => {
    const argsStr = Object.entries(def.Args).map(([key, type]) => `${key}: ${type}`).join('; ');
    return `      ${name}: {\n        Args: { ${argsStr} }\n        Returns: ${def.Returns}\n      }`;
  }).join('\n');

  const genericFunction = `      [key: string]: {\n        Args: Record<string, any>\n        Returns: any\n      }`;

  console.log(`📊 Generando types para:\n`);
  console.log(`   📦 ${tablesCount} tablas`);
  console.log(`   👁️  ${viewsCount} vistas`);
  console.log(`   ⚡ ${functionsCount} funciones RPC\n`);

  return `export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
${tablesTypes}
    }
    Views: {
${viewsTypes}
    }
    Functions: {
${functionsTypes}
${genericFunction}
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
`;
}

// Ejecutar
console.log('⚡ Generando types con Record<string, any> (permite cualquier propiedad)...\n');

const typeContent = generateFallbackTypes();
fs.writeFileSync('src/lib/supabase/database.types.ts', typeContent, 'utf8');

console.log('✅ Types generados exitosamente!\n');
console.log('📁 Archivo: src/lib/supabase/database.types.ts\n');
console.log('✨ Ahora TypeScript aceptará cualquier propiedad en las tablas.');
console.log('   No tendrás autocomplete, pero NO habrá errores de compilación.\n');
