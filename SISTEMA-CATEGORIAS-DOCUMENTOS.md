# 🗂️ SISTEMA DE CATEGORÍAS PARA DOCUMENTOS

## ✅ COMPLETADO

### 1. **Botón "Asignar Categoría"**
- ✅ Agregado botón naranja con ícono `FolderPlus`
- ✅ Aparece en cada documento (excepto cédula)
- ✅ Ubicación: Junto a botones Ver/Descargar

### 2. **Modal de Selección de Categorías**
- ✅ Lista todas las categorías disponibles
- ✅ Muestra íconos y colores de cada categoría
- ✅ Indica categoría actual (si existe)
- ✅ Opción "Sin Categoría" para remover

### 3. **Servicio de Base de Datos**
- ✅ Método `actualizarCategoria()` en DocumentosClienteService
- ✅ Actualiza `categoria_id` en documentos_cliente

### 4. **Handlers en Componente**
- ✅ `handleAsignarCategoria()` - Abre modal
- ✅ `handleConfirmarCategoria()` - Guarda en BD
- ✅ Refrescar documentos después de categorizar

---

## 📋 PENDIENTE: Crear Categorías en BD

**Necesitas ejecutar el SQL manualmente en Supabase:**

### Paso 1: Ve a Supabase Dashboard → SQL Editor

### Paso 2: Copia y pega este SQL:

```sql
-- Insertar categorías predefinidas
INSERT INTO categorias_documentos (nombre, descripcion, color, icono, created_by)
VALUES
  ('Evidencias', 'Capturas de pantalla, correos, confirmaciones', '#3B82F6', 'Camera', (SELECT id FROM auth.users LIMIT 1)),
  ('Documentos Legales', 'Contratos, promesas, actas, escrituras', '#10B981', 'FileText', (SELECT id FROM auth.users LIMIT 1)),
  ('Identidad', 'Cédulas, RUT, certificados personales', '#F59E0B', 'IdCard', (SELECT id FROM auth.users LIMIT 1)),
  ('Financiero', 'Aprobaciones de crédito, extractos, cartas laborales', '#8B5CF6', 'DollarSign', (SELECT id FROM auth.users LIMIT 1)),
  ('Sin Categoría', 'Documentos sin clasificar', '#6B7280', 'Folder', (SELECT id FROM auth.users LIMIT 1))
ON CONFLICT (nombre) DO NOTHING;
```

### Paso 3: Click "Run"

### Paso 4: Verifica
Ve a **Table Editor → categorias_documentos**
Deberías ver 5 categorías creadas

---

## 🎨 CÓMO USAR

### **Para categorizar un documento:**

1. **Ve a Cliente → Tab "Documentos"**
2. **Click en botón naranja** (ícono de carpeta) en cualquier documento
3. **Selecciona una categoría** del modal
4. **¡Listo!** El documento ahora tiene categoría

### **Para cambiar categoría:**

1. **Click nuevamente** en botón de categoría
2. **Selecciona otra categoría**
3. Se actualiza automáticamente

### **Para quitar categoría:**

1. **Click en botón de categoría**
2. **Selecciona "Sin Categoría"**
3. El documento queda sin categorizar

---

## 🎯 CARACTERÍSTICAS

✅ **Asignación manual** - Usuario decide la categoría de cada documento
✅ **Visual claro** - Colores e íconos distinguen cada categoría
✅ **No afecta cédula** - Cédula de ciudadanía no se puede categorizar
✅ **Cambio fácil** - Puedes cambiar categoría cuando quieras
✅ **Sin categoría** - Opción para documentos sin clasificar

---

## 📊 CATEGORÍAS DISPONIBLES

| Categoría | Color | Ícono | Uso |
|-----------|-------|-------|-----|
| 📷 **Evidencias** | Azul | Camera | Capturas, correos, confirmaciones |
| 📄 **Documentos Legales** | Verde | FileText | Contratos, promesas, actas |
| 🪪 **Identidad** | Naranja | IdCard | Cédulas, RUT, certificados |
| 💰 **Financiero** | Morado | DollarSign | Créditos, extractos, cartas laborales |
| 📁 **Sin Categoría** | Gris | Folder | Sin clasificar |

---

## 🚀 PRÓXIMOS PASOS (Opcional)

**Si quieres vista agrupada:**
- Vista con acordeones por categoría
- Toggle para alternar entre lista/agrupada
- Drag & drop entre categorías

**¿Quieres implementar vista agrupada?** Avísame y la agrego. 🎯

---

¡Sistema de categorías listo! 🎉
