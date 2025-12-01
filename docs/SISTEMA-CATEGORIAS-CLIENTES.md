# 📋 Sistema de Categorías de Documentos para Clientes

## ✅ Estado: IMPLEMENTADO

Sistema de categorías automáticas para gestión documental del módulo de Clientes.

---

## 📂 Categorías Creadas (5 en total)

### 1. **Documentos de Identidad** (Azul - #3B82F6)
- **Icono**: `id-card`
- **Descripción**: Cédula del cliente, cédula del cónyuge, pasaporte, documentos de identificación
- **Orden**: 1

### 2. **Certificados** (Verde - #10B981)
- **Icono**: `file-badge`
- **Descripción**: Certificado de tradición y libertad, certificados de dominio
- **Orden**: 2
- **Nota**: Consistente con módulo de Viviendas

### 3. **Documentos Legales** (Púrpura - #8B5CF6)
- **Icono**: `scale`
- **Descripción**: Promesa de compraventa, escrituras, minuta, acta de entrega, resoluciones
- **Orden**: 3
- **Nota**: Consistente con módulos de Proyectos y Viviendas

### 4. **Gastos Notariales y Avalúos** (Naranja - #F59E0B)
- **Icono**: `receipt`
- **Descripción**: Estudio de títulos, avalúos, gastos notariales, paz y salvos
- **Orden**: 4

### 5. **Otros Documentos** (Gris - #6B7280)
- **Icono**: `folder`
- **Descripción**: Fotos, correspondencia, documentos generales y varios
- **Orden**: 5
- **Nota**: Categoría catch-all consistente con todos los módulos

---

## 🔄 Funcionamiento Automático

El sistema crea automáticamente las categorías cuando:

1. **Primer acceso del usuario** al módulo de documentos de clientes
2. **No existen categorías previas** para el módulo `'clientes'` de ese usuario

### Función Principal

```sql
crear_categorias_clientes_default(p_user_id UUID)
```

**Características**:
- ✅ Verifica existencia previa antes de insertar
- ✅ Evita duplicados con constraint `idx_categorias_globales_nombre`
- ✅ Categorías marcadas como `es_global = true`
- ✅ Array de módulos: `ARRAY['clientes']`

---

## 📁 Archivos Creados

### Seeds SQL

1. **`supabase/seeds/categorias-clientes-default.sql`**
   - Función `crear_categorias_clientes_default()`
   - 5 categorías predefinidas
   - Lógica de verificación anti-duplicados

2. **`supabase/seeds/ejecutar-categorias-default.sql`** (ACTUALIZADO)
   - Ejecuta creación para TODOS los módulos:
     - `crear_categorias_proyectos_default()`
     - `crear_categorias_viviendas_default()`
     - `crear_categorias_clientes_default()` ← NUEVO
   - Muestra resumen de categorías creadas por módulo

### Verificación

3. **`supabase/verification/verificar-categorias-clientes.sql`**
   - Query para listar categorías del módulo clientes
   - Ordenadas por `orden`

4. **`supabase/verification/ejecutar-y-verificar-clientes.sql`**
   - Ejecuta función manualmente
   - Muestra resultado inmediato

---

## 🚀 Cómo Usar

### Para nuevo usuario

```sql
-- La función se ejecuta automáticamente
-- NO se requiere acción manual
```

### Ejecutar manualmente (si es necesario)

```bash
# 1. Crear función
npm run db:exec supabase/seeds/categorias-clientes-default.sql

# 2. Ejecutar para usuario específico
npm run db:exec supabase/verification/ejecutar-y-verificar-clientes.sql
```

### Verificar categorías existentes

```bash
npm run db:exec supabase/verification/verificar-categorias-clientes.sql
```

---

## 📊 Consistencia con Otros Módulos

| Categoría | Proyectos | Viviendas | Clientes |
|-----------|-----------|-----------|----------|
| Permisos y Licencias | ✅ | ❌ | ❌ |
| Certificados | ❌ | ✅ | ✅ |
| Documentos Legales | ✅ | ✅ | ✅ |
| Documentos Técnicos | ✅ | ✅ | ❌ |
| Planos | ✅ | ✅ (en Técnicos) | ❌ |
| Facturas y Pagos | ✅ | ✅ | ❌ |
| Documentos de Identidad | ❌ | ❌ | ✅ |
| Gastos Notariales | ❌ | ❌ | ✅ |
| Fotos | ❌ | ✅ | ❌ (en Otros) |
| Otros Documentos | ✅ | ✅ | ✅ |

**Notas de diseño**:
- **"Certificados"**: Dedicado a certificados de tradición (Viviendas y Clientes)
- **"Documentos Legales"**: Promesas, escrituras, minutas (3 módulos)
- **"Documentos de Identidad"**: Exclusivo para Clientes (cédulas, pasaportes)
- **"Gastos Notariales y Avalúos"**: Exclusivo para Clientes (gastos externos)

---

## ✅ Estado de Implementación

- [x] Función SQL creada
- [x] Seed ejecutado en base de datos
- [x] Verificación exitosa
- [x] Documentación completa
- [ ] Integración en UI de módulo de documentos clientes
- [ ] Tipos TypeScript actualizados
- [ ] Componentes de selección de categoría

---

## 🔜 Próximos Pasos

1. **Actualizar tipos TypeScript**
   ```typescript
   export const CATEGORIAS_CLIENTES = [
     { id: 'identidad', nombre: 'Documentos de Identidad', color: '#3B82F6', icono: 'id-card' },
     { id: 'certificados', nombre: 'Certificados', color: '#10B981', icono: 'file-badge' },
     // ...
   ]
   ```

2. **Crear servicio de categorías**
   ```typescript
   obtenerCategoriasClientes(userId: string)
   ```

3. **Componente de selección**
   - Dropdown con colores
   - Iconos de Lucide React
   - Filtrado por categoría

4. **Integrar en upload de documentos**
   - Selector de categoría obligatorio
   - Preview con color de categoría
   - Validación antes de subir

---

## 📞 Contacto

Para dudas o ajustes, revisar:
- `supabase/seeds/categorias-proyectos-default.sql` (referencia)
- `supabase/seeds/categorias-viviendas-default.sql` (referencia)
- `docs/DATABASE-SCHEMA-REFERENCE-ACTUALIZADO.md` (schema completo)
