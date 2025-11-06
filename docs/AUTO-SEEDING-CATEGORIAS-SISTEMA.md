# ✅ AUTO-SEEDING DE CATEGORÍAS DEL SISTEMA

## 🎯 Problema Resuelto

**Escenario**: Base de datos limpia → Usuario intenta subir documento → NO hay categorías → ❌ ERROR

**Solución**: Auto-creación automática de categorías del sistema cuando no existen

---

## 🚀 Cómo Funciona

### **Flujo Automático (Sin intervención del usuario)**

```
1. Usuario entra a módulo Viviendas
   ↓
2. Hook useCategoriasSistemaViviendas se ejecuta
   ↓
3. Query: ¿Existen categorías del sistema?
   ├─ SÍ → Retorna categorías existentes ✅
   └─ NO → Auto-ejecuta seed de categorías 🌱
      ↓
      Crea 8 categorías predefinidas
      ↓
      Re-hace query
      ↓
      Retorna categorías recién creadas ✅
```

### **Código Implementado**

**Hook actualizado**: `src/modules/viviendas/hooks/useCategoriasSistemaViviendas.ts`

```typescript
// ✅ ANTES: Solo hacía query
const { data } = await supabase
  .from('categorias_documento')
  .select('*')
  .contains('modulos_permitidos', ['viviendas'])

// ✅ AHORA: Query + Auto-seed si está vacío
if (!data || data.length === 0) {
  console.warn('⚠️ No hay categorías. Creando automáticamente...')
  await seedCategoriasSistema(supabase, user.id)
  // Re-fetch y retornar categorías nuevas
}
```

---

## 📊 Categorías Predefinidas (8 totales)

| # | Nombre | Color | Icono | Descripción |
|---|--------|-------|-------|-------------|
| 1 | Certificado de Tradición | 🔵 Azul | FileText | Certificados de tradición y libertad |
| 2 | Escrituras Públicas | 🟣 Púrpura | FileSignature | Escrituras de compraventa |
| 3 | Planos Arquitectónicos | 🟢 Verde | Ruler | Planos y diseños |
| 4 | Licencias y Permisos | 🟠 Ámbar | Shield | Licencias de construcción |
| 5 | Avalúos Comerciales | 🔴 Rojo | DollarSign | Avalúos de la propiedad |
| 6 | Fotos de Progreso | 🔵 Cyan | Camera | Fotografías de obra |
| 7 | Contrato de Promesa | 🌸 Rosa | FileContract | Contratos de promesa |
| 8 | Recibos de Servicios | 🟢 Teal | Receipt | Recibos de servicios |

---

## 🛠️ Opciones de Ejecución

### **Opción 1: Automático (Recomendado) ✅**
- **Cuándo**: Al cargar cualquier componente que use `useCategoriasSistemaViviendas`
- **Cómo**: Nada, es automático
- **Ventaja**: Cero intervención manual

### **Opción 2: Manual desde SQL**
- **Archivo**: `supabase/seeds/categorias-sistema-viviendas.sql`
- **Cuándo**: Después de limpiar la base de datos
- **Cómo**: Ejecutar en Supabase Studio → SQL Editor

```sql
-- Copiar y pegar todo el contenido del archivo seed
-- Ejecutar
```

### **Opción 3: Desde migración**
- **Archivo**: `supabase/migrations/20250106000001_sistema_documentos_viviendas.sql`
- **Cuándo**: Primera instalación
- **Cómo**: Ya ejecutado (incluye las categorías)

---

## ✅ Verificación

### **Desde la App (Consola del navegador)**

```javascript
// Al cargar formulario de upload de documentos, verás:
🌱 Seeding categorías del sistema para viviendas...
✅ Categorías del sistema creadas correctamente
✅ 8 categorías del sistema cargadas
```

### **Desde Supabase SQL Editor**

```sql
SELECT
  nombre,
  color,
  orden,
  es_sistema,
  modulos_permitidos
FROM categorias_documento
WHERE 'viviendas' = ANY(modulos_permitidos)
  AND es_sistema = true
ORDER BY orden;

-- Debe retornar 8 filas
```

---

## 🔒 Características de Seguridad

✅ **No duplica categorías**: Usa `ON CONFLICT DO NOTHING` en SQL
✅ **Requiere usuario autenticado**: No se ejecuta si no hay sesión
✅ **Marcadas como sistema**: `es_sistema = true` → No eliminables
✅ **Globales**: `es_global = true` → Disponibles para todos los usuarios
✅ **Idempotente**: Ejecutar múltiples veces no causa problemas

---

## 📝 Logs de Debugging

```typescript
// ✅ Categorías encontradas (DB tiene datos)
✅ 8 categorías del sistema encontradas

// 🌱 Auto-seeding (DB limpia)
⚠️ No se encontraron categorías del sistema. Creando automáticamente...
🌱 Seeding categorías del sistema para viviendas...
✅ Categorías del sistema creadas correctamente
✅ 8 categorías del sistema cargadas

// ❌ Error (no hay usuario autenticado)
❌ No hay usuario autenticado para crear categorías
```

---

## 🎓 Casos de Uso

### ✅ **Caso 1: Base de datos nueva (limpia)**
1. Usuario instala app por primera vez
2. Navega a Viviendas → Documentos
3. Hook detecta 0 categorías
4. **Auto-crea las 8 categorías** 🌱
5. Usuario puede subir documentos normalmente ✅

### ✅ **Caso 2: Base de datos borrada (mantenimiento)**
1. Admin limpia todas las tablas
2. Primer usuario accede a formulario de documentos
3. Hook detecta 0 categorías
4. **Auto-crea las 8 categorías** 🌱
5. Sistema funciona normalmente ✅

### ✅ **Caso 3: Migración desde otra DB**
1. Importas datos de otra fuente
2. No hay categorías del sistema
3. Usuario sube "certificado-tradicion.pdf"
4. Hook detecta 0 categorías → **Auto-seed** 🌱
5. Auto-categoriza correctamente ✅

---

## 🚀 Próximos Pasos

- [ ] Implementar lo mismo para **Proyectos** (categorías diferentes)
- [ ] Implementar lo mismo para **Clientes** (categorías diferentes)
- [ ] Crear función SQL genérica: `seed_categorias_sistema(modulo TEXT)`
- [ ] Dashboard de admin para ver estado de seeds

---

## 💡 Notas Importantes

⚠️ **Requiere columna `es_sistema`**: Asegúrate de que la migración `20250106000001` esté ejecutada
⚠️ **User ID**: El seed usa el ID del usuario autenticado actual
⚠️ **Performance**: El seed solo se ejecuta UNA VEZ (al detectar 0 categorías)
⚠️ **Cache**: Las categorías se cachean con `staleTime: Infinity`

---

**✅ Estado**: IMPLEMENTADO Y FUNCIONAL
**📅 Fecha**: 2025-01-06
**🎯 Resultado**: Categorías siempre disponibles, cero intervención manual
