# ⚡ Configuración Rápida de Supabase - 30 Minutos

**Objetivo**: Tener Supabase 100% configurado y funcionando
**Tiempo estimado**: 30-45 minutos
**Dificultad**: ⭐⭐☆☆☆ (Fácil)

---

## 🎯 PASO 1: Crear Proyecto Supabase (10 minutos)

### 1.1 Ir a Supabase Dashboard

```
🌐 https://supabase.com/dashboard
```

**Acciones**:
1. Click en "New Project"
2. Selecciona tu organización (o crea una)
3. Completa el formulario:

```
Project Name:       ryr-constructora
Database Password:  [GUARDA ESTO - LO NECESITARÁS]
Region:            South America (São Paulo) - más cercano a Chile
Pricing Plan:      Free (suficiente para empezar)
```

4. Click "Create new project"
5. ⏱️ **Espera 2-3 minutos** mientras Supabase configura todo

---

## 🎯 PASO 2: Obtener Credenciales (5 minutos)

### 2.1 Ir a Settings > API

En el dashboard de tu proyecto:

```
Left Sidebar → Settings (⚙️) → API
```

### 2.2 Copiar Credenciales

Verás dos valores importantes:

```
📍 Project URL:
https://abcdefghijk.supabase.co

🔑 anon public (public key):
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmF...
```

⚠️ **IMPORTANTE**: Copia estos valores, los necesitarás en el siguiente paso

---

## 🎯 PASO 3: Configurar Variables de Entorno (2 minutos)

### 3.1 Editar .env.local

Abre el archivo `.env.local` en tu proyecto:

```bash
# Windows
notepad .env.local

# O usa VS Code
code .env.local
```

### 3.2 Reemplazar con tus valores reales

```bash
# 🗄️ SUPABASE CONFIGURATION
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU-ANON-KEY-AQUI

# Resto de variables (dejar como están)
NEXT_PUBLIC_COMPANY_NAME="RyR Constructora"
NEXT_PUBLIC_DEFAULT_CURRENCY="CLP"
NEXT_PUBLIC_DEBUG_MODE=true
```

### 3.3 Guardar y cerrar

---

## 🎯 PASO 4: Crear Tablas en Supabase (15 minutos)

### 4.1 Ir a SQL Editor

```
Left Sidebar → SQL Editor → New query
```

### 4.2 Copiar Schema SQL

Abre el archivo `supabase/schema.sql` de tu proyecto y copia TODO el contenido.

**Atajos**:
```bash
# Ver el archivo
code supabase/schema.sql

# O navega a:
d:\constructoraRyRapp\supabase\schema.sql
```

### 4.3 Ejecutar en Supabase

1. Pega el contenido en el SQL Editor de Supabase
2. Click en "Run" (o Ctrl+Enter)
3. Espera a que termine (verás "Success" en verde)

**Deberías ver creadas**:
- ✅ Tabla `proyectos`
- ✅ Tabla `manzanas`
- ✅ Tabla `viviendas`
- ✅ Tabla `clientes`
- ✅ Tabla `abonos`
- ✅ Tabla `renuncias`
- ✅ Tabla `categorias_documento`
- ✅ Tabla `documentos_proyecto`

### 4.4 Verificar Tablas Creadas

```
Left Sidebar → Table Editor
```

Deberías ver todas las tablas listadas.

---

## 🎯 PASO 5: Configurar Storage (10 minutos)

### 5.1 Crear Bucket

```
Left Sidebar → Storage → Create bucket
```

**Configuración**:
```
Name:              documentos
Public bucket:     NO (privado)
Allowed MIME types: [dejar en blanco para permitir todos]
```

Click "Create bucket"

### 5.2 Configurar Políticas de Storage

Ir a: `Storage → documentos → Policies`

**Crear política de Upload**:
```sql
CREATE POLICY "Users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documentos');
```

**Crear política de Download**:
```sql
CREATE POLICY "Users can download own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documentos');
```

**Crear política de Delete**:
```sql
CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documentos');
```

---

## 🎯 PASO 6: Aplicar Row Level Security (OPCIONAL - 5 minutos)

### 6.1 Ir a SQL Editor

```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE proyectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE manzanas ENABLE ROW LEVEL SECURITY;
ALTER TABLE viviendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE abonos ENABLE ROW LEVEL SECURITY;
ALTER TABLE renuncias ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_documento ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos_proyecto ENABLE ROW LEVEL SECURITY;

-- Política para proyectos (ejemplo)
CREATE POLICY "Users can view own projects"
ON proyectos FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own projects"
ON proyectos FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own projects"
ON proyectos FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Repetir para otras tablas según necesites
```

⚠️ **NOTA**: Puedes hacer esto después si prefieres empezar rápido

---

## 🎯 PASO 7: Regenerar Tipos TypeScript (2 minutos)

### 7.1 Obtener Project ID

En Supabase Dashboard:
```
Settings → General → Reference ID
```

Copia el ID (algo como: `abcdefghijk`)

### 7.2 Configurar variable de entorno

Edita `.env.local`:
```bash
SUPABASE_PROJECT_ID=tu-reference-id-aqui
```

### 7.3 Regenerar tipos

```bash
npm run db:types
```

⚠️ **Si falla**: Es normal, los tipos temporales funcionan igual

---

## 🎯 PASO 8: Verificar Conexión (2 minutos)

### 8.1 Reiniciar servidor de desarrollo

```bash
# Detener el servidor (Ctrl+C)
# Reiniciar
npm run dev
```

### 8.2 Verificar en consola del navegador

Abre http://localhost:3000 y abre la consola (F12):

Deberías ver:
- ✅ Sin errores de conexión a Supabase
- ✅ Variables de entorno cargadas

### 8.3 Test rápido de conexión

Crea un archivo temporal `test-supabase.ts`:

```typescript
import { supabase } from '@/lib/supabase'

async function testConnection() {
  const { data, error } = await supabase
    .from('proyectos')
    .select('count')
    .limit(1)

  if (error) {
    console.error('❌ Error:', error)
  } else {
    console.log('✅ Conexión exitosa!')
  }
}

testConnection()
```

---

## ✅ VERIFICACIÓN FINAL

### Checklist de Completitud:

```
✅ Proyecto Supabase creado
✅ Credenciales en .env.local
✅ Tablas creadas (8 tablas)
✅ Storage bucket 'documentos' creado
✅ Políticas de storage aplicadas
✅ RLS habilitado (opcional)
✅ Tipos TypeScript actualizados (opcional)
✅ Servidor reiniciado
✅ Conexión verificada
```

---

## 🎉 ¡LISTO!

Tu Supabase está 100% configurado y funcionando.

### Ahora puedes:

1. **Desarrollar módulos** con persistencia real
2. **Guardar proyectos** en la base de datos
3. **Subir documentos** al storage
4. **Autenticación** con Supabase Auth

---

## 🆘 TROUBLESHOOTING

### Error: "Invalid API key"

**Solución**:
1. Verifica que copiaste bien la `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Reinicia el servidor (`npm run dev`)

### Error: "relation does not exist"

**Solución**:
1. Ve a SQL Editor en Supabase
2. Ejecuta nuevamente `supabase/schema.sql`
3. Verifica que las tablas aparezcan en Table Editor

### Error: "Storage object not found"

**Solución**:
1. Verifica que creaste el bucket 'documentos'
2. Verifica las políticas de storage
3. Asegúrate de estar autenticado

### No puedo insertar datos

**Solución**:
1. Verifica que RLS esté deshabilitado para testing:
```sql
ALTER TABLE proyectos DISABLE ROW LEVEL SECURITY;
```
2. O crea políticas permisivas de RLS

---

## 📚 RECURSOS ADICIONALES

- [Documentación Supabase](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage](https://supabase.com/docs/guides/storage)

---

**Tiempo total**: 30-45 minutos ⏱️
**Dificultad**: ⭐⭐☆☆☆
**Resultado**: Base de datos lista para producción ✅
