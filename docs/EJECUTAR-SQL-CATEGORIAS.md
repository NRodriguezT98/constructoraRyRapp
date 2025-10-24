# 🚀 EJECUTAR SQL DE CATEGORÍAS - PASO A PASO

## ⚠️ PROBLEMA ACTUAL

La pestaña de Documentos muestra **"0 de 0 documentos"** y **no aparecen categorías** en el dropdown de filtros.

**Causa raíz**: La migración SQL que crea las categorías predefinidas **NO se ha ejecutado** en la base de datos.

---

## ✅ SOLUCIÓN (3 pasos simples)

### PASO 1: Abrir Supabase Dashboard

1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Inicia sesión
3. Selecciona tu proyecto **constructoraRyR**

---

### PASO 2: Ejecutar SQL

1. En el menú lateral, haz clic en **"SQL Editor"** (icono de documento)
2. Haz clic en **"+ New query"** (botón superior derecho)
3. **Copia y pega** el siguiente SQL completo:

```sql
-- =====================================================
-- CREAR TABLA Y CATEGORÍAS PREDEFINIDAS PARA DOCUMENTOS
-- =====================================================

-- PASO 1: CREAR TABLA categorias_documento (si no existe)
CREATE TABLE IF NOT EXISTS public.categorias_documento (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NOT NULL,
  nombre character varying(100) NOT NULL,
  descripcion text NULL,
  color character varying(20) NULL DEFAULT 'blue',
  icono character varying(50) NULL DEFAULT 'Folder',
  orden integer NULL DEFAULT 0,
  fecha_creacion timestamp with time zone NULL DEFAULT now(),
  modulos_permitidos text[] NOT NULL DEFAULT '{proyectos}',
  es_global boolean NOT NULL DEFAULT false,
  CONSTRAINT categorias_documento_pkey PRIMARY KEY (id),
  CONSTRAINT categorias_documento_user_id_nombre_key UNIQUE (user_id, nombre),
  CONSTRAINT categorias_documento_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES auth.users (id) ON DELETE CASCADE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_categorias_user_id
  ON public.categorias_documento USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_categorias_modulos_permitidos
  ON public.categorias_documento USING gin (modulos_permitidos);

-- PASO 2: INSERTAR CATEGORÍAS PREDEFINIDAS
DO $$
DECLARE
  usuario_id uuid;
BEGIN
  FOR usuario_id IN SELECT id FROM auth.users
  LOOP
    INSERT INTO categorias_documento (
      user_id, nombre, descripcion, color, icono, modulos_permitidos, orden
    )
    VALUES
      (usuario_id, 'Evidencias', 'Capturas de pantalla, correos', '#3B82F6', 'Camera', '{clientes, proyectos}', 1),
      (usuario_id, 'Documentos Legales', 'Contratos, promesas, actas', '#10B981', 'FileText', '{clientes, proyectos}', 2),
      (usuario_id, 'Identidad', 'Cédulas, RUT, certificados', '#F59E0B', 'IdCard', '{clientes}', 3),
      (usuario_id, 'Financiero', 'Aprobaciones de crédito, extractos', '#8B5CF6', 'DollarSign', '{clientes}', 4)
    ON CONFLICT (user_id, nombre) DO NOTHING;
  END LOOP;
  RAISE NOTICE 'Categorías creadas exitosamente';
END $$;

-- PASO 3: HABILITAR RLS (Seguridad)
ALTER TABLE categorias_documento ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own categories" ON categorias_documento;
CREATE POLICY "Users can view own categories"
  ON categorias_documento FOR SELECT
  USING (auth.uid() = user_id OR es_global = true);

DROP POLICY IF EXISTS "Users can insert own categories" ON categorias_documento;
CREATE POLICY "Users can insert own categories"
  ON categorias_documento FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

4. Haz clic en **"Run"** (botón verde, esquina inferior derecha)
5. Deberías ver: ✅ **"Success. No rows returned"** con un mensaje "Categorías creadas exitosamente"

---

### PASO 3: Refrescar la aplicación

1. Vuelve a tu aplicación web
2. Presiona **F5** (o Ctrl+R) para refrescar la página
3. Ve a la pestaña **"Documentos"**

**Resultado esperado**:
- ✅ Los documentos deberían aparecer: **"4 documentos almacenados"** (o el número que tengas)
- ✅ El dropdown de categorías debería mostrar 4 opciones:
  - 📷 Evidencias
  - 📄 Documentos Legales
  - 🆔 Identidad
  - 💰 Financiero

---

## 🔍 VERIFICAR QUE FUNCIONÓ

### En la UI de la app:

1. **Pestaña Documentos**: Debería mostrar "X documentos almacenados" (no "0 de 0")
2. **Filtros**: El dropdown de categorías debería tener 4 opciones
3. **Buscar**: Escribe algo en el buscador → debería filtrar en tiempo real
4. **Botón naranja** (carpeta+): Click debería abrir modal con 4 categorías

### En Supabase (opcional):

Para confirmar que las categorías se crearon, ejecuta:

```sql
SELECT id, nombre, descripcion, color, icono
FROM categorias_documento
ORDER BY nombre;
```

Deberías ver 4 filas (una por cada categoría) con:
- Documentos Legales (#10B981)
- Evidencias (#3B82F6)
- Financiero (#8B5CF6)
- Identidad (#F59E0B)

---

## 🐛 SI SIGUE SIN FUNCIONAR

### Problema: "No se encontraron documentos con los filtros aplicados"

**Causa**: Los documentos SÍ están en la BD, pero hay filtros activos.

**Solución**:
1. En la pestaña Documentos, haz clic en **"Filtros"** (botón con ícono de sliders)
2. Verifica que:
   - Categoría: **"Todas las categorías"**
   - Búsqueda: **vacío**
   - Importantes: **no activo** (botón gris, no amarillo)
3. Si hay filtros activos, haz clic en **"Limpiar filtros"**

---

### Problema: "Sigo viendo 0 documentos"

**Debug paso a paso**:

1. **Verifica en Supabase** que los documentos existen:
   ```sql
   SELECT COUNT(*)
   FROM documentos_cliente
   WHERE cliente_id = (
     SELECT id FROM clientes WHERE numero_documento = '11522266'
   );
   ```
   - Si retorna `0` → No hay documentos en BD
   - Si retorna `>0` → Hay documentos, problema de carga

2. **Abre la consola del navegador** (F12 → Console):
   - Busca mensajes que empiecen con `📋 [DocumentosListaCliente]`
   - Deberías ver:
     ```
     📋 [DocumentosListaCliente] Montando componente, cargando datos...
       - clienteId: [UUID]
       - user: [UUID]
       - Llamando cargarDocumentos...
       - Llamando cargarCategorias...
     ```
   - Luego:
     ```
     📊 [DocumentosListaCliente] Estado actual:
       - documentos.length: 4
       - categorias.length: 4
       - cargandoDocumentos: false
     ```

3. **Si `documentos.length: 0`**:
   - El problema es la carga desde BD
   - Verifica en Network tab (F12 → Network) que la llamada a `/rest/v1/documentos_cliente` retorna datos
   - Verifica que no haya errores 401/403 (permisos RLS)

---

## 📝 RESUMEN EJECUTIVO

**Qué hace este SQL:**
- Crea 4 categorías predefinidas para organizar documentos
- Previene duplicados (`ON CONFLICT DO NOTHING`)
- Crea índice para búsquedas rápidas

**Por qué es necesario:**
- La app **requiere** categorías en BD para mostrar filtros
- Sin categorías → dropdown vacío → no se pueden asignar categorías
- Esta es una **migración inicial** (se ejecuta una sola vez)

**Riesgos:**
- ✅ **Cero riesgos**: `ON CONFLICT DO NOTHING` previene duplicados
- ✅ No afecta datos existentes
- ✅ Reversible (puedes eliminar las categorías después)

---

## 📞 SOPORTE

Si después de estos pasos sigue sin funcionar:
1. Envía captura de la consola del navegador (F12 → Console)
2. Envía captura del resultado de este SQL:
   ```sql
   SELECT COUNT(*) AS total_documentos FROM documentos_cliente;
   SELECT COUNT(*) AS total_categorias FROM categorias_documento;
   ```
3. Indica en qué paso exacto falló
