# ✅ CHECKLIST: Configuración de Supabase

**TIEMPO TOTAL**: 30-45 minutos
**EMPEZADO**: ⏰ [Marca la hora cuando empieces]
**COMPLETADO**: ⏰ [Marca cuando termines]

---

## 📋 ANTES DE EMPEZAR

- [ ] Tengo una cuenta de email activa
- [ ] Tengo navegador web abierto
- [ ] Tengo VS Code abierto con el proyecto
- [ ] Tengo este checklist visible

---

## 🎯 PASO 1: CREAR CUENTA Y PROYECTO (10 min)

### 1.1 Ir a Supabase

- [ ] Abrir en navegador: https://supabase.com/dashboard
- [ ] Click en "Sign Up" (si no tienes cuenta)
- [ ] O "Sign In" (si ya tienes cuenta)

### 1.2 Autenticarse

- [ ] Elegir método de autenticación:
  - [ ] GitHub (RECOMENDADO - más rápido)
  - [ ] Google
  - [ ] Email

### 1.3 Crear Organización (si es primera vez)

- [ ] Nombre de organización: `ryr-constructora`
- [ ] Plan: **Free** (suficiente para empezar)
- [ ] Click "Create Organization"

### 1.4 Crear Proyecto

- [ ] Click en "New Project"
- [ ] Completar formulario:

```
Project Name:       constructora-ryr
Database Password:  [GENERA UNA CONTRASEÑA FUERTE]
                    ⚠️ GUÁRDALA EN UN LUGAR SEGURO ⚠️
Region:            South America (São Paulo)
                    ✅ Más cercano a Chile
Pricing Plan:      Free
```

- [ ] Click "Create new project"
- [ ] ⏱️ **ESPERAR 2-3 MINUTOS** (el proyecto se está configurando)
- [ ] Verificar que el proyecto muestre "Active" en verde

**CONTRASEÑA DEL PROYECTO**: ________________________
(Escríbela aquí temporalmente, luego bórrala de este archivo)

---

## 🔑 PASO 2: OBTENER CREDENCIALES (5 min)

### 2.1 Ir a Settings

- [ ] En el dashboard de tu proyecto
- [ ] Sidebar izquierdo → Click en ⚙️ **Settings**
- [ ] Click en **API**

### 2.2 Copiar URL del Proyecto

- [ ] Buscar sección "Project URL"
- [ ] Copiar la URL (algo como: `https://abcdefghijk.supabase.co`)
- [ ] Pegar en `.env.local` (siguiente paso)

### 2.3 Copiar Anon Key

- [ ] Buscar sección "Project API keys"
- [ ] Copiar la clave `anon` / `public` (es una clave larga que empieza con `eyJ...`)
- [ ] Pegar en `.env.local` (siguiente paso)

⚠️ **IMPORTANTE**: NO copies la `service_role` key (es para backend, no la usarás ahora)

---

## 📝 PASO 3: CONFIGURAR .env.local (2 min)

### 3.1 Abrir archivo

- [ ] En VS Code, abrir: `.env.local`
- [ ] Buscar las líneas:
  ```bash
  NEXT_PUBLIC_SUPABASE_URL=tu-url-de-supabase-aqui
  NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
  ```

### 3.2 Reemplazar con tus valores

- [ ] Pegar tu URL de Supabase
- [ ] Pegar tu Anon Key
- [ ] **GUARDAR EL ARCHIVO** (Ctrl+S)

**Ejemplo**:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xyzproject.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
```

---

## 🗄️ PASO 4: CREAR TABLAS (15 min)

### 4.1 Ir a SQL Editor

- [ ] Sidebar izquierdo → Click en 🔧 **SQL Editor**
- [ ] Click en "New query"

### 4.2 Abrir schema.sql en VS Code

- [ ] En VS Code, abrir: `supabase/schema.sql`
- [ ] Seleccionar TODO el contenido (Ctrl+A)
- [ ] Copiar (Ctrl+C)

### 4.3 Pegar en Supabase SQL Editor

- [ ] Volver al navegador (Supabase SQL Editor)
- [ ] Pegar el código (Ctrl+V)
- [ ] Click en "RUN" (o presionar Ctrl+Enter)

### 4.4 Verificar Ejecución

- [ ] Esperar a que termine (verás "Success" en verde)
- [ ] Verificar que NO haya errores rojos

### 4.5 Verificar Tablas Creadas

- [ ] Sidebar izquierdo → Click en **Table Editor**
- [ ] Deberías ver 8 tablas:

```
✅ proyectos
✅ manzanas
✅ viviendas
✅ clientes
✅ abonos
✅ renuncias
✅ categorias_documento
✅ documentos_proyecto
```

**Si no ves todas las tablas**: Vuelve al SQL Editor y ejecuta el schema.sql de nuevo

---

## 📦 PASO 5: CONFIGURAR STORAGE (10 min)

### 5.1 Ir a Storage

- [ ] Sidebar izquierdo → Click en **Storage**
- [ ] Click en "Create a new bucket"

### 5.2 Crear Bucket

- [ ] Completar formulario:

```
Name:              documentos-proyectos
Public bucket:     NO ❌ (dejar desmarcado)
File size limit:   10MB (10485760 bytes)
Allowed MIME:      [dejar en blanco - permite todos]
```

- [ ] Click "Create bucket"

### 5.3 Configurar Políticas de Storage

- [ ] Click en el bucket recién creado
- [ ] Click en "Policies"
- [ ] Click en "New policy"

**Política 1: Upload (INSERT)**

- [ ] Click en "Create policy from template"
- [ ] Elegir: "Enable insert for authenticated users only"
- [ ] Modificar si es necesario
- [ ] Click "Review" → "Save policy"

**Política 2: Download (SELECT)**

- [ ] Click en "New policy"
- [ ] Elegir: "Enable read access for authenticated users only"
- [ ] Click "Review" → "Save policy"

**Política 3: Delete**

- [ ] Click en "New policy"
- [ ] Elegir: "Enable delete for authenticated users only"
- [ ] Click "Review" → "Save policy"

---

## 🔐 PASO 6: RLS POLICIES (OPCIONAL - 5 min)

⚠️ **NOTA**: Esto es opcional para empezar. Puedes hacerlo después.

### 6.1 Ir a SQL Editor

- [ ] SQL Editor → New query

### 6.2 Habilitar RLS

```sql
-- Pega esto en el SQL Editor y ejecuta:
ALTER TABLE proyectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE manzanas ENABLE ROW LEVEL SECURITY;
ALTER TABLE viviendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE abonos ENABLE ROW LEVEL SECURITY;
ALTER TABLE renuncias ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_documento ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos_proyecto ENABLE ROW LEVEL SECURITY;
```

- [ ] Ejecutar (RUN)

### 6.3 Crear Política Permisiva (para testing)

```sql
-- Política para permitir todo temporalmente (SOLO PARA DESARROLLO)
CREATE POLICY "Enable all for authenticated users"
ON proyectos
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Repetir para cada tabla si quieres
```

- [ ] Ejecutar

⚠️ **ADVERTENCIA**: Esta política es muy permisiva. En producción, debes hacerlas más estrictas.

---

## ✅ PASO 7: VERIFICAR CONEXIÓN (2 min)

### 7.1 Reiniciar Servidor de Desarrollo

- [ ] En VS Code, abrir terminal (Ctrl+`)
- [ ] Si el servidor está corriendo, detenerlo (Ctrl+C)
- [ ] Ejecutar:

```bash
npm run dev
```

- [ ] Esperar a que inicie (verás "Ready in X.Xs")

### 7.2 Abrir en Navegador

- [ ] Abrir: http://localhost:3000
- [ ] Verificar que la página cargue
- [ ] Abrir consola del navegador (F12)

### 7.3 Verificar Sin Errores de Supabase

- [ ] En la consola del navegador:
  - [ ] NO debe haber errores rojos de "Supabase"
  - [ ] NO debe haber "Invalid API key"
  - [ ] NO debe haber "Connection refused"

### 7.4 Test de Conexión Rápido

- [ ] Ir a: http://localhost:3000/proyectos
- [ ] Debería cargar sin errores
- [ ] Puede mostrar lista vacía (normal si no hay datos)

---

## 🎉 PASO 8: FINALIZAR Y DOCUMENTAR (1 min)

### 8.1 Documentar Credenciales

- [ ] Guardar las credenciales en un lugar seguro:
  - URL de Supabase: _______________________
  - Contraseña de DB: _______________________
  - Proyecto ID: _______________________

### 8.2 Borrar Contraseñas Temporales

- [ ] Borrar la contraseña que escribiste en este checklist
- [ ] Asegurarte de que `.env.local` esté en `.gitignore`

### 8.3 Marcar Completado

- [ ] ✅ **SUPABASE CONFIGURADO EXITOSAMENTE**
- [ ] Tiempo total tomado: _______ minutos
- [ ] Fecha de completación: _______

---

## 🆘 TROUBLESHOOTING

### Error: "Invalid API key"

**Solución**:
1. Verifica que copiaste bien la Anon Key en `.env.local`
2. Verifica que NO haya espacios al inicio o final
3. Reinicia el servidor (`npm run dev`)

### Error: "relation does not exist"

**Solución**:
1. Ve a Table Editor en Supabase
2. Verifica que las 8 tablas existan
3. Si no existen, vuelve a ejecutar `schema.sql`

### Error: "Storage object not found"

**Solución**:
1. Ve a Storage en Supabase
2. Verifica que el bucket `documentos-proyectos` exista
3. Verifica que las políticas estén aplicadas

### No puedo insertar datos

**Solución**:
1. Verifica que RLS esté habilitado
2. Crea políticas permisivas temporalmente:
```sql
ALTER TABLE proyectos DISABLE ROW LEVEL SECURITY;
```
3. O crea políticas que permitan todo para testing

---

## 📚 RECURSOS ADICIONALES

- [Guía completa](./docs/SUPABASE-SETUP-RAPIDO.md)
- [Documentación de Supabase](https://supabase.com/docs)
- [SQL Editor](https://supabase.com/docs/guides/database/overview)

---

## ✅ CHECKLIST FINAL

```
✅ Cuenta Supabase creada
✅ Proyecto creado y activo
✅ Credenciales copiadas a .env.local
✅ 8 tablas creadas en la base de datos
✅ Storage bucket creado
✅ Políticas de storage aplicadas
✅ RLS habilitado (opcional)
✅ Servidor reiniciado
✅ Conexión verificada sin errores
✅ Todo funciona correctamente
```

---

**🎉 ¡FELICITACIONES!**

Tu Supabase está completamente configurado y listo para usar.

**Próximos pasos**:
1. Leer `MODULE_TEMPLATE.md`
2. Estudiar `src/modules/proyectos/`
3. Empezar a desarrollar módulos

**¿Necesitas ayuda?** Revisa `docs/SUPABASE-SETUP-RAPIDO.md`

---

**NOTA**: Puedes borrar este archivo después de completar el setup, o guardarlo como referencia.
