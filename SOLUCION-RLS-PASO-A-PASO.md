# 🚨 ERROR 401: ROW LEVEL SECURITY BLOQUEANDO NEGOCIACIONES

## ❌ Error Actual
```
POST /rest/v1/negociaciones 401 (Unauthorized)
code: '42501'
message: 'new row violates row-level security policy for table "negociaciones"'
```

---

## 🎯 SOLUCIÓN (5 MINUTOS)

### Paso 1: Abrir Supabase Dashboard

1. Ve a: https://supabase.com/dashboard
2. Selecciona tu proyecto: **constructoraRyR**
3. Click en el menú lateral: **SQL Editor** 📝

### Paso 2: Ejecutar el SQL

1. Click en botón verde: **"New query"**
2. Copia TODO el contenido de: `supabase/EJECUTAR-ESTE-SQL-AHORA.sql`
3. Pégalo en el editor
4. Click en **"Run"** (o presiona `Ctrl + Enter`)

### Paso 3: Verificar Resultado

Deberías ver en la pestaña **"Results"**:

```
✅ 4 filas retornadas:

Política                                                | Comando | Permisiva
------------------------------------------------------- | ------- | ---------
Usuarios autenticados pueden crear negociaciones       | INSERT  | PERMISSIVE
Usuarios autenticados pueden actualizar negociaciones  | UPDATE  | PERMISSIVE
Usuarios autenticados pueden eliminar negociaciones    | DELETE  | PERMISSIVE
Usuarios autenticados pueden ver negociaciones         | SELECT  | PERMISSIVE
```

---

## 🧪 TEST INMEDIATO

1. **Recarga** la página de tu aplicación (`F5`)
2. Abre el modal "Registrar nuevo interés"
3. Completa el formulario:
   - Selecciona **Proyecto**
   - Selecciona **Vivienda**
   - Ingresa **Valor Negociado**: `122000000` (se verá como `$122.000.000`)
   - (Opcional) Agrega **Observaciones**
4. Click en **"Guardar"**

### ✅ Si funciona:
- ✅ Modal se cierra
- ✅ Aparece notificación de éxito
- ✅ Lista de negociaciones se actualiza
- ✅ NO aparece error 401

### ❌ Si sigue fallando:
1. Verifica que estás **logueado** en la app
2. Abre DevTools → Console
3. Copia el error completo
4. Avísame para revisar

---

## 📋 Archivos Listos

✅ **SQL Script**: `supabase/EJECUTAR-ESTE-SQL-AHORA.sql`
✅ **Backup completo**: `supabase/clientes-negociaciones-rls.sql`
✅ **Esta guía**: `SOLUCION-RLS-PASO-A-PASO.md`

---

## 🔍 ¿Por qué pasa esto?

**Row Level Security (RLS)** es un firewall de PostgreSQL:

- ✅ Está **habilitado** en tu tabla `negociaciones`
- ❌ Pero las **políticas NO están aplicadas**
- 🔒 Resultado: Bloquea TODO por defecto (incluso authenticated)

**Solución**: Aplicar políticas que permitan a usuarios autenticados operar en la tabla.

---

## ⚠️ IMPORTANTE

- Debes estar **autenticado** en Supabase Dashboard
- El SQL debe ejecutarse en el proyecto correcto
- Las políticas aplican para rol `authenticated` (tu usuario logueado)
- **NO uses `anon`** (usuario anónimo sin login)

---

## 🚀 Después del Fix

Una vez ejecutado el SQL:

1. ✅ Podrás registrar intereses sin error
2. ✅ El modal funcionará correctamente
3. ✅ Los datos se guardarán en la BD
4. ✅ La lista se actualizará en tiempo real

---

## 📞 ¿Necesitas ayuda?

Si después de ejecutar el SQL sigues viendo el error:

1. Captura pantalla del resultado en SQL Editor
2. Verifica que las 4 políticas aparezcan
3. Revisa que estés logueado en la app
4. Avísame y revisamos juntos

---

**⏱️ Tiempo estimado: 5 minutos**
**🎯 Dificultad: Básica (copiar/pegar SQL)**
**🔒 Seguridad: 100% seguro (solo habilita permisos)**

---

## 🎬 Video Tutorial (si lo necesitas)

Si quieres ver cómo se hace:
1. Dashboard → SQL Editor
2. New Query
3. Pegar SQL
4. Run
5. Ver 4 políticas ✅

**¡Es muy sencillo!** 💪
