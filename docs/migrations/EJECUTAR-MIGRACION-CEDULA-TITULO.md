# Migración: Agregar Título Personalizado para Cédula

## ✅ **Qué hace esta migración**

Agrega la columna `documento_identidad_titulo` a la tabla `clientes` para guardar títulos personalizados de la cédula.

## 📝 **Pasos para ejecutar**

### **Opción 1: Desde Supabase Dashboard (Recomendado)**

1. Ve a: https://supabase.com/dashboard/project/swyjhwgvkfcfdtemkyad
2. SQL Editor → New Query
3. Copia y pega el contenido de:
   ```
   supabase\migrations\add_documento_identidad_titulo.sql
   ```
4. Click **Run** o presiona `Ctrl+Enter`

### **Opción 2: Desde VS Code (Con extensión PostgreSQL)**

Si tienes la extensión PostgreSQL configurada:

1. Abre el archivo: `supabase\migrations\add_documento_identidad_titulo.sql`
2. Click derecho → Run Query
3. O selecciona todo y presiona `F5`

---

## 🔍 **Verificar que funcionó**

```sql
-- Ver la nueva columna
SELECT column_name, data_type, is_nullable, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'clientes'
  AND column_name = 'documento_identidad_titulo';

-- Debería retornar:
-- column_name                  | data_type        | is_nullable | character_maximum_length
-- documento_identidad_titulo   | character varying| YES         | 200
```

---

## 📊 **Qué cambia en la app**

### **Antes** (sin migración):
```typescript
❌ Error al renombrar cédula
ℹ️ "Para renombrar la cédula, debes volver a subirla con el nombre deseado"
```

### **Después** (con migración):
```typescript
✅ "Cédula renombrada exitosamente"
// Se guarda en: clientes.documento_identidad_titulo
// Se muestra en UI sin recargar página
```

---

## 🎯 **Funcionalidad implementada**

1. **Renombrar cédula**: Click en menú → Renombrar → Guardar
2. **Persistencia**: El título se guarda en la base de datos
3. **Visualización**: Se muestra el título personalizado en la lista de documentos
4. **Fallback**: Si `documento_identidad_titulo` es NULL, muestra "Cédula de Ciudadanía"

---

## ⚠️ **Importante**

- La migración es **segura**: Solo agrega una columna (no modifica datos existentes)
- La columna es **nullable**: Los clientes existentes tendrán NULL (se usa título por defecto)
- **No hay downtime**: La app sigue funcionando durante la migración

---

## 🔄 **Rollback (si algo sale mal)**

```sql
-- Para deshacer la migración:
ALTER TABLE clientes DROP COLUMN IF EXISTS documento_identidad_titulo;
```

---

## ✅ **Checklist**

- [ ] Ejecutar migración SQL
- [ ] Verificar columna creada
- [ ] Refrescar aplicación (F5)
- [ ] Probar renombrar cédula
- [ ] Verificar que se guarda el título
- [ ] Verificar que se muestra correctamente
