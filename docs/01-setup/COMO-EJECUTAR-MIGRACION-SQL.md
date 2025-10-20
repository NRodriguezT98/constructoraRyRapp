# 🚀 GUÍA: Ejecutar Migración SQL en Supabase

## Método 1: SQL Editor (Dashboard Web)

### Paso 1: Abrir SQL Editor
1. Ve a: https://supabase.com/dashboard
2. Selecciona tu proyecto `constructoraRyR`
3. En el menú izquierdo, click en **"SQL Editor"**
4. Click en **"+ New query"**

### Paso 2: Copiar y Ejecutar
1. Copia TODO el contenido del archivo `20250120_add_es_documento_identidad.sql`
2. Pégalo en el editor SQL
3. Click en **"Run"** (botón verde abajo a la derecha)

### Paso 3: Verificar Éxito
Deberías ver mensajes como:
```
NOTICE: Migrada cédula para cliente xxx: Laura
NOTICE: Migración completada. Cédulas convertidas a documentos.
Success. No rows returned
```

### Paso 4: Verificar Datos
Ejecuta esta consulta para confirmar:
```sql
-- Ver cédulas migradas
SELECT
  dc.titulo,
  dc.es_documento_identidad,
  dc.es_importante,
  c.nombres,
  c.apellidos
FROM documentos_cliente dc
INNER JOIN clientes c ON c.id = dc.cliente_id
WHERE dc.es_documento_identidad = TRUE;
```

Deberías ver la cédula de Laura Duque listada.

---

## Método 2: PowerShell con psql (Alternativo)

Si tienes PostgreSQL instalado localmente:

### Paso 1: Obtener Connection String
1. Dashboard → Settings → Database
2. Copia la **Connection string** (formato URI)
3. Debería verse así:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@[HOST]:5432/postgres
   ```

### Paso 2: Ejecutar desde terminal
```powershell
# Reemplaza [CONNECTION-STRING] con tu string real
psql "[CONNECTION-STRING]" -f "supabase/migrations/20250120_add_es_documento_identidad.sql"
```

---

## Método 3: JavaScript (Más Rápido)

Crear script Node.js para ejecutar la migración:

```javascript
// scripts/ejecutar-migracion-cedula.js
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // ⚠️ Necesitas SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function ejecutarMigracion() {
  const sql = readFileSync('supabase/migrations/20250120_add_es_documento_identidad.sql', 'utf-8')

  console.log('🚀 Ejecutando migración...')

  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  console.log('✅ Migración completada')
}

ejecutarMigracion()
```

---

## ⚠️ Si no funciona ninguno...

**Ejecuta SQL por partes** en el SQL Editor:

### Parte 1: Agregar campo
```sql
ALTER TABLE documentos_cliente
ADD COLUMN es_documento_identidad BOOLEAN DEFAULT FALSE NOT NULL;
```

### Parte 2: Crear índice
```sql
CREATE INDEX idx_documentos_cliente_es_identidad
ON documentos_cliente(cliente_id, es_documento_identidad, estado)
WHERE es_documento_identidad = TRUE;
```

### Parte 3: Migrar cédulas (copiar desde línea 24 a 91 del SQL)
```sql
DO $$
DECLARE
  cliente_record RECORD;
  nueva_categoria_id UUID;
  storage_path TEXT;
BEGIN
  -- [resto del código...]
```

---

## 🎯 Recomendación

**USA EL MÉTODO 1** (SQL Editor en Dashboard Web):
- ✅ Más fácil
- ✅ No requiere configuración
- ✅ Ves los resultados inmediatamente
- ✅ No necesitas credenciales extra

**¿Necesitas ayuda navegando el dashboard?**
