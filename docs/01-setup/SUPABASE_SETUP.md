# 🗄️ Guía de Configuración de Supabase

## Paso 1: Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Inicia sesión o crea una cuenta
3. Click en "New Project"
4. Completa:
   - **Name**: RyR Constructora
   - **Database Password**: (genera una segura y guárdala)
   - **Region**: Elige la más cercana (ej: South America - São Paulo)
5. Click "Create new project" y espera ~2 minutos

## Paso 2: Obtener Credenciales

1. En tu proyecto, ve a **Settings** (⚙️) → **API**
2. Copia los siguientes valores:
   - **Project URL**: `https://xxxxxxx.supabase.co`
   - **anon public**: `eyJhbGc...` (key larga)

3. Pega estos valores en el archivo `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

## Paso 3: Ejecutar el Script SQL

1. En Supabase, ve a **SQL Editor** (icono de código)
2. Click en "New Query"
3. Copia y pega TODO el contenido del archivo `supabase/schema.sql`
4. Click en "Run" (▶️)
5. Verifica que aparezca "Success. No rows returned"

## Paso 4: Verificar Tablas Creadas

1. Ve a **Table Editor** (icono de tabla)
2. Deberías ver las siguientes tablas:
   - ✅ proyectos
   - ✅ manzanas
   - ✅ viviendas
   - ✅ clientes
   - ✅ abonos
   - ✅ renuncias

## Paso 5: Configurar Autenticación (Opcional)

1. Ve a **Authentication** → **Providers**
2. Habilita **Email** (ya está habilitado por defecto)
3. Opcional: Habilita **Google**, **GitHub**, etc.

## Paso 6: Verificar Row Level Security

1. Ve a **Authentication** → **Policies**
2. Verifica que cada tabla tenga políticas de seguridad habilitadas
3. Las políticas ya están configuradas en el script SQL

## 📊 Estructura de la Base de Datos

```
proyectos (1)
  └── manzanas (N)
        └── viviendas (N)
              ├── abonos (N)
              └── renuncias (N)

clientes (N) ←→ viviendas (N)
```

## 🔒 Seguridad Implementada

- ✅ Row Level Security (RLS) habilitado en todas las tablas
- ✅ Los usuarios solo pueden ver/editar sus propios proyectos
- ✅ Triggers automáticos para fecha_actualizacion
- ✅ Validaciones en campos (CHECK constraints)
- ✅ Índices para optimizar consultas

## 🚀 Próximos Pasos

Una vez completado esto:

1. Reinicia el servidor de desarrollo: `npm run dev`
2. El sistema automáticamente usará Supabase en lugar de localStorage
3. Los datos serán persistentes y compartidos entre sesiones

## 🆘 Solución de Problemas

**Error: "relation does not exist"**

- Asegúrate de haber ejecutado el script SQL completo

**Error: "invalid input syntax for type uuid"**

- Verifica que las extensiones estén habilitadas (primera línea del SQL)

**Error de autenticación**

- Verifica que las variables de entorno estén correctas en `.env.local`
- Reinicia el servidor después de cambiar `.env.local`
