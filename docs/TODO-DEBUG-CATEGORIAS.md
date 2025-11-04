# 🔍 TODO: Debug Sistema de Categorías de Documentos

## ✅ Completado

1. **Migración SQL ejecutada exitosamente**
   - Tabla `categorias_documento` creada
   - 4 categorías insertadas para todos los usuarios
   - Políticas RLS configuradas
   - Resultado: "Success. No rows returned" ✅

2. **Componentes creados**
   - ✅ `DocumentosFiltrosCliente` - Filtros específicos para clientes
   - ✅ `DocumentoCategoriasModal` - Modal para asignar categorías
   - ✅ `DocumentosAgrupados` - Vista agrupada por categorías
   - ✅ Botón naranja (FolderPlus) en tarjetas de documentos

3. **Lógica implementada**
   - ✅ `useEffect` para cargar documentos y categorías al montar
   - ✅ Filtros por categoría, búsqueda, importantes
   - ✅ Servicio para actualizar categoría de documento
   - ✅ Toggle entre vista normal y agrupada

4. **Documentación**
   - ✅ `docs/EJECUTAR-SQL-CATEGORIAS.md` - Guía paso a paso
   - ✅ SQL actualizado con nombres correctos de tabla

---

## ⏳ PENDIENTE - Debug Post-Push

### Verificar después del push:

1. **Refrescar aplicación y verificar:**
   - [ ] Panel de debug muestra categorías: `categorias.length: 4`
   - [ ] Dropdown de filtros muestra las 4 categorías
   - [ ] Documentos se cargan correctamente
   - [ ] Filtros funcionan (búsqueda, categoría, importantes)

2. **Revisar consola del navegador (F12):**
   - [ ] Buscar logs: `📋 [DocumentosListaCliente] Montando componente`
   - [ ] Verificar: `📊 [DocumentosListaCliente] Estado actual`
   - [ ] Confirmar sin errores de API

3. **Probar funcionalidad:**
   - [ ] Click en botón naranja (FolderPlus) → Modal con 4 categorías
   - [ ] Asignar categoría a documento → Guardar correctamente
   - [ ] Filtrar por categoría → Solo muestra documentos de esa categoría
   - [ ] Vista agrupada → Acordeones por categoría funcionales

4. **Si hay problemas:**
   - [ ] Verificar en Supabase que categorías existen:
     ```sql
     SELECT COUNT(*) FROM categorias_documento;
     ```
   - [ ] Verificar que documentos existen:
     ```sql
     SELECT COUNT(*) FROM documentos_cliente;
     ```
   - [ ] Revisar Network tab (F12) para errores 401/403

---

## 📋 Archivos Modificados (Listos para Push)

### Nuevos componentes:
- `src/modules/clientes/documentos/components/documentos-filtros-cliente.tsx`
- `src/modules/clientes/documentos/components/documento-categorias-modal.tsx`
- `src/modules/clientes/documentos/components/documentos-agrupados.tsx`

### Modificados:
- `src/modules/clientes/documentos/components/documentos-lista-cliente.tsx`
  - Agregado useEffect para cargar datos
  - Reemplazado DocumentosFiltros por DocumentosFiltrosCliente
  - Agregado panel de debug temporal
  - Integrada vista agrupada

- `src/modules/clientes/documentos/components/index.ts`
  - Exportados nuevos componentes

- `src/modules/clientes/documentos/services/documentos-cliente.service.ts`
  - Agregado método `actualizarCategoria()`

- `src/modules/documentos/components/lista/documento-card-horizontal.tsx`
  - Agregado botón naranja FolderPlus
  - Agregado prop `onAsignarCategoria`

### Migración:
- `supabase/migrations/20251024_crear_categorias_predefinidas.sql`
  - ✅ EJECUTADA en BD
  - Tabla `categorias_documento` creada
  - 4 categorías insertadas
  - RLS habilitado

### Documentación:
- `docs/EJECUTAR-SQL-CATEGORIAS.md` - Guía completa
- `SISTEMA-CATEGORIAS-DOCUMENTOS.md` - Documentación del sistema
- `TODO-DEBUG-CATEGORIAS.md` - Este archivo

---

## 🎯 Próximos Pasos (Después del Push)

1. **Push a Git**
   ```bash
   git add .
   git commit -m "feat: Sistema de categorías para documentos de clientes"
   git push
   ```

2. **Refrescar aplicación** (F5)

3. **Verificar panel de debug:**
   - Si muestra `categorias.length: 4` → ✅ Todo OK
   - Si muestra `categorias.length: 0` → ⚠️ Investigar por qué no carga

4. **Remover panel de debug** (si todo funciona)

5. **Testing completo:**
   - Asignar categorías
   - Filtrar por categoría
   - Vista agrupada
   - Búsqueda

---

## 🐛 Troubleshooting Preparado

Si después del push sigue mostrando "0 de 0 documentos":

### Caso 1: `categorias.length: 0`
**Problema**: No se cargan categorías desde BD
**Solución**: Verificar políticas RLS, consultar BD directamente

### Caso 2: `documentos.length: 0`
**Problema**: No se cargan documentos desde BD
**Solución**: Verificar que `cargarDocumentos(clienteId)` se llama con ID correcto

### Caso 3: Ambos son 0
**Problema**: `useEffect` no se ejecuta o `user` es null
**Solución**: Verificar AuthContext, agregar más logs

---

## 📝 Notas Importantes

- **Panel de debug es temporal**: Remover después de verificar que funciona
- **Console.logs están activos**: Para facilitar debugging
- **SQL ya ejecutado**: No volver a ejecutar (tiene `ON CONFLICT DO NOTHING`)
- **RLS habilitado**: Solo cada usuario ve sus categorías

---

## ✨ Features Implementadas

1. **Categorización manual** de documentos (4 categorías predefinidas)
2. **Filtros avanzados** (categoría + búsqueda + importantes)
3. **Vista agrupada** con acordeones por categoría
4. **Modal elegante** para asignar categorías
5. **Indicador visual** de categoría en cada documento
6. **Sistema flexible** para agregar más categorías después

---

**Estado actual**: ✅ Código listo para push, pendiente verificación en runtime
**Prioridad**: Media (funcionalidad nueva, no crítica)
**Tiempo estimado debug**: 10-15 minutos después del push
