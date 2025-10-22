# 📖 Guía: Cómo Generar y Mantener la Documentación de Base de Datos

## 🎯 Propósito

Mantener una **fuente única de verdad** sobre el esquema de la base de datos para evitar errores como:
- ❌ Usar nombres de campos que no existen
- ❌ Asumir tipos de datos incorrectos
- ❌ Olvidar campos obligatorios vs opcionales
- ❌ Duplicar información desactualizada

---

## 🚀 Proceso de Actualización (Cada vez que cambies la DB)

### Paso 1: Ejecutar el Script en Supabase

1. Abre **Supabase Dashboard**
2. Ve a **SQL Editor**
3. Abre el archivo: `supabase/migrations/GENERAR-DOCUMENTACION-COMPLETA-DB.sql`
4. **Copia TODO el contenido** del archivo
5. **Pega** en el SQL Editor de Supabase
6. Click en **RUN** o presiona `Ctrl + Enter`

### Paso 2: Copiar los Resultados

El script generará múltiples tablas de resultados:

- 🗂️ Lista de todas las tablas
- 📋 Detalle de cada tabla (columnas, tipos, nullable)
- 🔗 Relaciones (Foreign Keys)
- ✅ Constraints y validaciones
- 🔍 Índices
- 🎨 Enums y tipos personalizados
- 📊 Resumen general

**Copia TODOS los resultados** (puedes usar Ctrl+A en la sección de resultados)

### Paso 3: Actualizar el Documento de Referencia

1. Abre: `docs/DATABASE-SCHEMA-REFERENCE.md`
2. Reemplaza la sección correspondiente con los **datos REALES**
3. Mantén el formato Markdown para legibilidad
4. Agrega la fecha de última actualización al inicio del documento

### Paso 4: Validar

Verifica que el documento contenga:
- ✅ Todas las tablas existentes
- ✅ Nombres EXACTOS de columnas (respetando mayúsculas/minúsculas)
- ✅ Tipos de datos correctos
- ✅ Indicadores de campos obligatorios vs opcionales
- ✅ Relaciones entre tablas
- ✅ Valores permitidos en enums

---

## 📅 Frecuencia de Actualización

### ✅ OBLIGATORIO actualizar cuando:

- 🔴 Creas una nueva tabla
- 🔴 Agregas/eliminas columnas
- 🔴 Cambias tipos de datos
- 🔴 Modificas constraints o validaciones
- 🔴 Cambias valores de enums
- 🔴 Agregas/eliminas relaciones (Foreign Keys)

### 💡 RECOMENDADO actualizar cuando:

- 🟡 Terminas una migración de DB
- 🟡 Antes de empezar un nuevo módulo
- 🟡 Después de resolver un bug relacionado con DB
- 🟡 Cada semana (mantenimiento preventivo)

---

## 🔄 Flujo de Trabajo Recomendado

### Al CREAR/MODIFICAR esquema de DB:

```
1. ✍️  Escribir migración SQL
2. ▶️  Ejecutar migración en Supabase
3. ✅  Verificar que funcionó correctamente
4. 📄  Ejecutar GENERAR-DOCUMENTACION-COMPLETA-DB.sql
5. 📝  Actualizar docs/DATABASE-SCHEMA-REFERENCE.md
6. 💾  Commit ambos archivos juntos
```

### Al DESARROLLAR nuevo código:

```
1. 📖  Consultar docs/DATABASE-SCHEMA-REFERENCE.md
2. ✅  Verificar nombres EXACTOS de campos
3. ✅  Verificar tipos de datos
4. ✅  Verificar campos opcionales vs obligatorios
5. 💻  Escribir código usando nombres exactos
6. ✅  Ejecutar y probar
```

---

## 🛠️ Herramientas Complementarias

### Script SQL de Verificación Rápida

Para verificar una tabla específica sin ejecutar todo el script:

```sql
-- Reemplaza 'nombre_tabla' con la tabla que quieres verificar
SELECT
  column_name as "COLUMNA",
  data_type as "TIPO",
  CASE
    WHEN is_nullable = 'YES' THEN '✅ Opcional'
    ELSE '❌ Obligatorio'
  END as "NULLABLE"
FROM information_schema.columns
WHERE table_name = 'nombre_tabla'
  AND table_schema = 'public'
ORDER BY ordinal_position;
```

### VS Code Snippet (Opcional)

Puedes crear un snippet en VS Code para recordar verificar la documentación:

```json
{
  "Verificar campo DB": {
    "prefix": "dbcheck",
    "body": [
      "// ⚠️ VERIFICADO en DATABASE-SCHEMA-REFERENCE.md",
      "// Tabla: ${1:nombre_tabla}",
      "// Campo: ${2:nombre_campo}",
      "// Tipo: ${3:tipo}",
      "$0"
    ],
    "description": "Recordatorio para verificar campo en documentación"
  }
}
```

---

## ✅ Checklist de Buenas Prácticas

Antes de escribir código que acceda a la DB:

- [ ] Abrí `docs/DATABASE-SCHEMA-REFERENCE.md`
- [ ] Busqué la tabla que voy a usar
- [ ] Verifiqué los nombres EXACTOS de las columnas
- [ ] Confirmé qué campos son obligatorios vs opcionales
- [ ] Revisé el tipo de dato de cada campo
- [ ] Si hay enums, verifiqué los valores permitidos
- [ ] Copié los nombres exactos (no los escribí de memoria)

---

## 🚨 Ante la Duda

### SI NO ESTÁS SEGURO de un nombre de campo:

1. ❌ **NO** asumas
2. ❌ **NO** copies de código antiguo sin verificar
3. ✅ **CONSULTA** `docs/DATABASE-SCHEMA-REFERENCE.md`
4. ✅ **EJECUTA** el script de verificación si el documento parece desactualizado
5. ✅ **ACTUALIZA** el documento si encontraste diferencias

---

## 📝 Ejemplo de Uso Correcto

### ❌ INCORRECTO (Asumir):

```typescript
// Asumiendo que existe el campo "profesion"
const { data } = await supabase
  .from('clientes')
  .select('id, nombre, profesion')  // ❌ Error si no existe
```

### ✅ CORRECTO (Verificar primero):

```typescript
// 1. Consulté DATABASE-SCHEMA-REFERENCE.md
// 2. Verifiqué que solo existen: id, nombres, apellidos, numero_documento, telefono, email, ciudad
// 3. Usé los nombres exactos

const { data } = await supabase
  .from('clientes')
  .select('id, nombres, apellidos, numero_documento, telefono, email, ciudad')  // ✅ Campos verificados
```

---

## 🎓 Lecciones Aprendidas

### Errores Comunes que se Evitan con esta Guía:

1. **Error**: `column clientes_1.profesion does not exist`
   - **Causa**: Asumimos que existía sin verificar
   - **Prevención**: Consultar documentación primero

2. **Error**: `cliente.nombre is undefined`
   - **Causa**: El campo se llama `nombres` (plural) no `nombre`
   - **Prevención**: Copiar nombre exacto del documento

3. **Error**: Tipo de dato incorrecto en TypeScript
   - **Causa**: Definimos `number` pero en DB es `text`
   - **Prevención**: Verificar tipo en documentación

---

## 🔗 Archivos Relacionados

- 📄 **Script SQL**: `supabase/migrations/GENERAR-DOCUMENTACION-COMPLETA-DB.sql`
- 📚 **Documentación**: `docs/DATABASE-SCHEMA-REFERENCE.md`
- 📋 **Checklist**: `docs/DESARROLLO-CHECKLIST.md`

---

## ⚡ Comando Rápido (PowerShell)

Para abrir todos los archivos relevantes de una vez:

```powershell
code "supabase/migrations/GENERAR-DOCUMENTACION-COMPLETA-DB.sql"
code "docs/DATABASE-SCHEMA-REFERENCE.md"
```

---

**✅ Mantén este proceso y nunca más tendrás errores de nombres de campos**
