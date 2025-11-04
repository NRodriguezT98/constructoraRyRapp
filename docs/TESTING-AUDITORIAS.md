# 🧪 INSTRUCCIONES PARA PROBAR MÓDULO AUDITORÍAS

## 🎯 Objetivo
Validar que el módulo de Auditorías refactorizado funcione correctamente con los componentes estandarizados.

---

## ✅ Pre-requisitos

1. **Servidor de desarrollo corriendo**
   ```powershell
   npm run dev
   ```

2. **Usuario con permisos de Administrador**
   - Solo Administradores pueden acceder al módulo
   - Verificar rol en Supabase Auth

3. **Datos de auditoría existentes**
   - Al menos algunos registros en la tabla `audit_log`
   - Si no hay, crear un proyecto para generar registros

---

## 🔍 Checklist de Pruebas

### 1. Navegación y Acceso

- [ ] Abrir `http://localhost:3000/auditorias`
- [ ] Verificar que la página carga sin errores
- [ ] Revisar consola del navegador (F12) - no debe haber errores
- [ ] Verificar que RequireView funciona (solo Admins acceden)

**Resultado esperado**: Página carga correctamente, módulo visible

---

### 2. Header del Módulo

- [ ] Verificar título "Auditorías del Sistema"
- [ ] Verificar descripción debajo del título
- [ ] Verificar icono de Activity a la izquierda
- [ ] Verificar botones "Refrescar" y "Exportar" a la derecha
- [ ] Hacer clic en "Refrescar" - debe recargar datos

**Resultado esperado**:
- Header bien formateado
- Icono visible
- Botones funcionales
- Layout responsive (probar en móvil con DevTools)

---

### 3. Tarjetas de Estadísticas

- [ ] Verificar 4 tarjetas en una fila (desktop)
- [ ] Verificar que se apilan en móvil (2 columnas en tablet, 1 en móvil)
- [ ] Verificar números correctos en cada tarjeta:
  - Total de Eventos
  - Eventos Hoy
  - Usuarios Activos
  - Eliminaciones Totales
- [ ] Verificar iconos de colores en cada tarjeta
- [ ] Probar modo oscuro (tema del sistema o toggle)

**Resultado esperado**:
- 4 tarjetas con datos
- Grid responsive
- Iconos de colores
- Dark mode funciona

---

### 4. Sección de Búsqueda y Filtros

#### Búsqueda
- [ ] Campo de búsqueda visible con icono de lupa
- [ ] Escribir en el campo - debe filtrar en tiempo real
- [ ] Buscar por:
  - Email de usuario
  - Nombre de tabla
  - ID de registro
- [ ] Verificar que los resultados cambian

#### Botón "Mostrar filtros"
- [ ] Hacer clic en "Mostrar filtros"
- [ ] Verificar que aparecen 4 filtros adicionales + botón limpiar
- [ ] Verificar layout responsive (1 columna móvil, 2 tablet, 4 desktop)

#### Filtros Avanzados
- [ ] **Filtro de Módulo**: Seleccionar "proyectos" - debe filtrar
- [ ] **Filtro de Acción**: Seleccionar "Creaciones" - debe filtrar
- [ ] **Fecha Desde**: Seleccionar fecha - debe filtrar
- [ ] **Fecha Hasta**: Seleccionar fecha - debe filtrar
- [ ] **Combinar filtros**: Aplicar múltiples filtros a la vez
- [ ] **Limpiar filtros**: Hacer clic - debe resetear todo

**Resultado esperado**:
- Filtros funcionales
- Búsqueda en tiempo real
- Resultados correctos
- Botón limpiar resetea todo

---

### 5. Tabla de Auditorías

#### Estructura
- [ ] Verificar 6 columnas:
  1. Fecha/Hora (con icono de calendario)
  2. Acción (badge de color)
  3. Módulo
  4. Tabla (código en monospace)
  5. Usuario
  6. Detalles (botón con icono ojo)
- [ ] Verificar header con fondo gris claro
- [ ] Verificar hover effect en filas (gris claro al pasar mouse)
- [ ] Verificar scroll horizontal en móvil

#### Badges de Acción
- [ ] **CREATE**: Badge verde con texto "Creación"
- [ ] **UPDATE**: Badge azul con texto "Actualización"
- [ ] **DELETE**: Badge rojo con texto "Eliminación"
- [ ] Verificar dark mode en badges

#### Datos
- [ ] Verificar que las fechas se muestran correctamente (formato español)
- [ ] Verificar que los emails de usuario son correctos
- [ ] Verificar que los nombres de tabla están en código (monospace)

**Resultado esperado**:
- Tabla bien formateada
- Badges de colores correctos
- Datos correctos
- Hover funciona
- Responsive

---

### 6. Modal de Detalles

- [ ] Hacer clic en icono de ojo en cualquier registro
- [ ] Verificar que se abre modal
- [ ] Verificar contenido del modal:
  - Título "Detalles de Auditoría"
  - Botón X para cerrar (arriba derecha)
  - Badge de acción
  - Email de usuario
  - Rol de usuario (entre paréntesis)
  - Fecha y hora
  - Nombre de tabla
  - Cambios realizados (JSON formateado)
  - Botón "Cerrar" abajo
- [ ] Hacer clic fuera del modal - debe cerrar
- [ ] Hacer clic en X - debe cerrar
- [ ] Hacer clic en "Cerrar" - debe cerrar
- [ ] Verificar scroll interno si el contenido es largo
- [ ] Probar en móvil (debe ser responsive)

**Resultado esperado**:
- Modal se abre correctamente
- Datos completos visibles
- JSON formateado legible
- 3 formas de cerrar funcionan
- Responsive

---

### 7. Paginación

- [ ] Verificar texto "Mostrando X - Y de Z"
- [ ] Verificar botones "Anterior" y "Siguiente"
- [ ] Verificar texto "Página X de Y"
- [ ] Hacer clic en "Siguiente" - debe cambiar de página
- [ ] Hacer clic en "Anterior" - debe regresar
- [ ] Verificar que "Anterior" está disabled en página 1
- [ ] Verificar que "Siguiente" está disabled en última página

**Resultado esperado**:
- Paginación funcional
- Botones disabled correctamente
- Números correctos

---

### 8. Estados de UI

#### Estado de Carga
- [ ] Refrescar página con throttling 3G (DevTools Network)
- [ ] Verificar que aparece LoadingState con spinner
- [ ] Verificar mensaje "Cargando registros de auditoría..."

#### Estado Vacío
- [ ] Aplicar filtros que no retornen resultados
- [ ] Verificar que aparece EmptyState
- [ ] Verificar icono de FileText
- [ ] Verificar título "No hay registros de auditoría"
- [ ] Verificar descripción
- [ ] Verificar botón "Limpiar filtros" (solo si hay filtros activos)
- [ ] Hacer clic en "Limpiar filtros" - debe resetear

#### Estado de Error
- [ ] Desconectar internet (modo avión)
- [ ] Refrescar página
- [ ] Verificar que aparece ErrorState
- [ ] Verificar icono de AlertCircle rojo
- [ ] Verificar mensaje de error
- [ ] Verificar botón "Reintentar"
- [ ] Reconectar internet
- [ ] Hacer clic en "Reintentar" - debe cargar datos

**Resultado esperado**:
- 3 estados funcionan correctamente
- Mensajes claros
- Botones de acción funcionan

---

### 9. Dark Mode

- [ ] Cambiar tema del sistema a oscuro (o usar toggle si existe)
- [ ] Verificar que TODOS los elementos cambian:
  - **Fondo**: Degradado oscuro
  - **Tarjetas**: Fondo gris oscuro
  - **Texto**: Blanco/gris claro
  - **Bordes**: Gris oscuro
  - **Inputs**: Fondo oscuro, border oscuro
  - **Selects**: Fondo oscuro
  - **Tabla**: Header oscuro, hover oscuro
  - **Modal**: Fondo oscuro, overlay más oscuro
  - **Badges**: Colores adaptados (ej: bg-blue-900/30)
  - **Botones**: Variantes adaptadas
- [ ] Verificar que NO hay texto ilegible (contraste adecuado)
- [ ] Verificar que los iconos son visibles

**Resultado esperado**:
- Dark mode 100% funcional
- Todos los elementos adaptados
- Buen contraste
- Sin texto ilegible

---

### 10. Responsive Design

#### Desktop (>1024px)
- [ ] 4 columnas en estadísticas
- [ ] 4 filtros en una fila
- [ ] Tabla completa visible
- [ ] Header con título y acciones en una fila

#### Tablet (768px - 1024px)
- [ ] 2 columnas en estadísticas
- [ ] 2 filtros por fila
- [ ] Tabla con scroll horizontal
- [ ] Header responsive

#### Móvil (<768px)
- [ ] 1 columna en estadísticas (apiladas)
- [ ] 1 filtro por fila (apilados)
- [ ] Tabla con scroll horizontal
- [ ] Header apilado (título arriba, botones abajo)
- [ ] Modal ocupa 90% del ancho
- [ ] Padding reducido (p-4 en lugar de p-8)

**Resultado esperado**:
- Perfecto en los 3 breakpoints
- Sin elementos cortados
- Scroll funcional donde es necesario
- Padding adaptativo

---

### 11. Validación de Componentes Estandarizados

Abrir DevTools > React DevTools y verificar:

- [ ] `<ModuleContainer>` en raíz
- [ ] `<ModuleHeader>` con props correctas
- [ ] `<Card>` en estadísticas y filtros
- [ ] `<Button>` con variantes (ghost, secondary, primary)
- [ ] `<Badge>` con variantes (create, update, delete)
- [ ] `<LoadingState>` cuando carga
- [ ] `<EmptyState>` cuando no hay datos
- [ ] `<ErrorState>` cuando hay error

**Resultado esperado**:
- Todos los componentes estandarizados presentes
- Props correctas
- Jerarquía correcta

---

## 🐛 Errores Comunes a Verificar

### En Consola (F12)
- [ ] No hay errores 404 (archivos no encontrados)
- [ ] No hay errores de TypeScript
- [ ] No hay warnings de React (keys, deps, etc)
- [ ] No hay errores de permisos

### En Network (F12 > Network)
- [ ] Consulta a `/rest/v1/audit_log` es exitosa (200)
- [ ] RPC functions responden correctamente
- [ ] No hay requests fallidos (4xx, 5xx)

### Visuales
- [ ] No hay texto cortado
- [ ] No hay elementos superpuestos
- [ ] No hay scroll horizontal no deseado
- [ ] No hay elementos fuera de pantalla

---

## ✅ Checklist Final

Una vez completadas todas las pruebas:

- [ ] **Funcionalidad**: Todo funciona correctamente
- [ ] **Diseño**: Consistente con estándares
- [ ] **Dark Mode**: 100% funcional
- [ ] **Responsive**: Perfecto en móvil/tablet/desktop
- [ ] **Performance**: Carga rápida, sin lag
- [ ] **Sin errores**: Consola limpia
- [ ] **UX**: Intuitivo y fácil de usar
- [ ] **Accesibilidad**: Contraste adecuado, elementos clickeables

---

## 📸 Screenshots Recomendados

Tomar capturas de:

1. **Vista completa** (desktop light mode)
2. **Vista completa** (desktop dark mode)
3. **Estadísticas** (4 tarjetas)
4. **Tabla con datos**
5. **Modal de detalles abierto**
6. **Estado vacío** (EmptyState)
7. **Filtros expandidos**
8. **Vista móvil** (responsive)

---

## 🎯 Criterios de Aceptación

El módulo está listo si:

✅ Todas las pruebas del checklist pasan
✅ No hay errores en consola
✅ Dark mode funciona al 100%
✅ Responsive en todos los dispositivos
✅ Componentes estandarizados se usan correctamente
✅ UX es fluida y sin bugs

---

## 🚀 Siguiente Paso

Si todo funciona correctamente:

1. ✅ Marcar módulo Auditorías como **REFACTORIZADO**
2. 📋 Usar como **REFERENCIA** para otros módulos
3. 🎯 Empezar con el siguiente módulo (sugerido: **Proyectos**)

---

## 📝 Notas de Testing

Anota aquí cualquier issue encontrado:

```
Fecha: ___________
Tester: ___________

Issues encontrados:
1.
2.
3.

Sugerencias:
1.
2.
3.
```

---

**Estado**: 🧪 LISTO PARA TESTING
**Tiempo estimado**: 15-20 minutos
**Prioridad**: ALTA
