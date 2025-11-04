# 🔍 Módulo de Auditorías - Documentación Completa

**Fecha de creación**: 2025-11-04
**Estado**: ✅ Implementado y Funcional
**Ruta**: `/auditorias`

---

## 📋 Descripción

Módulo completo para visualizar y consultar **todos los registros de auditoría** del sistema. Permite a los administradores:

- ✅ Ver todas las operaciones CRUD realizadas
- ✅ Filtrar por módulo, acción, fecha, usuario
- ✅ Buscar por texto (email, tabla, ID)
- ✅ Ver detalles completos de cada cambio
- ✅ Estadísticas en tiempo real
- ✅ Detectar eliminaciones masivas sospechosas
- ✅ Exportar datos (próximamente)

---

## 🏗️ Arquitectura del Módulo

Siguiendo la arquitectura de **módulo de proyectos** (ejemplo perfecto):

```
src/modules/auditorias/
├── components/
│   ├── AuditoriasView.tsx      # Componente principal
│   └── index.ts                # Barrel export
├── hooks/
│   └── useAuditorias.ts        # Lógica completa
├── services/
│   └── auditorias.service.ts   # Queries a DB
├── types/
│   └── index.ts                # TypeScript types
├── styles/
│   └── classes.ts              # Tailwind classes
└── index.ts                    # Barrel export
```

---

## 🎯 Características Principales

### 1. **Estadísticas en Tiempo Real**

Dashboard con 4 métricas clave:

- **Total de Eventos**: Contador total de auditorías
- **Eventos Hoy**: Operaciones realizadas hoy
- **Usuarios Activos**: Usuarios únicos que han realizado acciones
- **Eliminaciones Totales**: Total de eliminaciones registradas

### 2. **Tabla de Auditorías**

Columnas:
- **Fecha/Hora**: Timestamp exacto de la operación
- **Acción**: Badge visual (CREATE/UPDATE/DELETE)
- **Módulo**: Proyectos, Viviendas, Clientes, etc.
- **Tabla**: Nombre técnico de la tabla afectada
- **Usuario**: Email del usuario que realizó la acción
- **Detalles**: Botón para ver información completa

### 3. **Filtros Avanzados**

- **Búsqueda por texto**: Email, tabla, ID de registro
- **Por módulo**: Proyectos, Viviendas, Clientes, Negociaciones, Abonos
- **Por acción**: Creaciones, Actualizaciones, Eliminaciones
- **Por rango de fechas**: Desde/hasta
- **Limpiar filtros**: Resetear todos los filtros

### 4. **Modal de Detalles**

Al hacer clic en "Detalles", se muestra:

- ✅ Acción realizada (con badge visual)
- ✅ Usuario que realizó la acción (email + rol)
- ✅ **Cambios específicos** en formato JSON
  - Para **UPDATE**: muestra `antes` y `después` de cada campo modificado
  - Para **CREATE**: muestra todos los datos nuevos
  - Para **DELETE**: muestra snapshot del registro eliminado

### 5. **Paginación**

- 50 registros por página
- Navegación Anterior/Siguiente
- Contador: "Mostrando X-Y de Z"

---

## 🔌 Integración con Base de Datos

### Tabla Principal: `audit_log`

```sql
SELECT
  id, tabla, accion, registro_id,
  usuario_email, fecha_evento,
  cambios_especificos, metadata
FROM audit_log
ORDER BY fecha_evento DESC
```

### RPC Functions Utilizadas

1. **`obtener_historial_registro`**
   - Obtiene historial de un registro específico
   - Uso: Ver todos los cambios de una vivienda/cliente/etc.

2. **`obtener_actividad_usuario`**
   - Actividad de un usuario en los últimos N días
   - Uso: Auditar acciones de un usuario específico

3. **`detectar_eliminaciones_masivas`**
   - Detecta eliminaciones sospechosas (> 5 en 1 día)
   - Uso: Alertas de seguridad

### Vista: `v_auditoria_por_modulo`

Resumen de actividad por módulo:
- Total de eventos por módulo
- Usuarios activos
- Conteo por tipo de acción (CREATE/UPDATE/DELETE)

---

## 🎨 UX/UI Diseñada

### Paleta de Colores

**Badges de Acción:**
- 🟢 **CREATE** → Verde (`bg-green-100 text-green-800`)
- 🔵 **UPDATE** → Azul (`bg-blue-100 text-blue-800`)
- 🔴 **DELETE** → Rojo (`bg-red-100 text-red-800`)

**Estadísticas:**
- 📄 Total Eventos → Azul (`bg-blue-100`)
- ⚡ Eventos Hoy → Verde (`bg-green-100`)
- 👤 Usuarios Activos → Púrpura (`bg-purple-100`)
- ⚠️ Eliminaciones → Rojo (`bg-red-100`)

### Iconografía (Lucide React)

- `Activity` → Módulo de Auditorías (menú lateral)
- `Search` → Barra de búsqueda
- `Filter` → Botón de filtros
- `RefreshCw` → Refrescar datos
- `Eye` → Ver detalles
- `Calendar` → Fecha/hora
- `User` → Usuario
- `FileText` → Documentos
- `CheckCircle2` → Crear
- `Edit3` → Actualizar
- `Trash2` → Eliminar

### Animaciones

- **Spinner**: Animación de carga (`animate-spin`)
- **Hover**: Transiciones suaves en botones y filas de tabla
- **Modal**: Overlay con backdrop oscuro (50% opacidad)

---

## 📊 Servicios Implementados

### `auditoriasService`

**Métodos Principales:**

```typescript
// Obtener auditorías con filtros
await auditoriasService.obtenerAuditorias({
  modulo: 'proyectos',
  accion: 'UPDATE',
  fechaDesde: '2025-11-01',
  limite: 50,
  offset: 0
})

// Buscar por texto
await auditoriasService.buscarAuditorias('admin@ryr.com', 50)

// Historial de un registro
await auditoriasService.obtenerHistorialRegistro('proyectos', 'uuid-proyecto', 100)

// Actividad de usuario
await auditoriasService.obtenerActividadUsuario('uuid-usuario', 30, 100)

// Eliminaciones masivas
await auditoriasService.detectarEliminacionesMasivas(7, 5)

// Resumen por módulos
await auditoriasService.obtenerResumenModulos()

// Estadísticas generales
await auditoriasService.obtenerEstadisticas()
```

---

## 🎣 Hook: `useAuditorias`

**Estado manejado:**

```typescript
const {
  // Datos
  registros,              // Lista de auditorías
  resumenModulos,         // Resumen por módulo
  eliminacionesMasivas,   // Eliminaciones sospechosas
  estadisticas,           // Métricas generales
  registroSeleccionado,   // Registro abierto en modal

  // UI
  cargando,               // Loading state
  error,                  // Error message
  filtros,                // Filtros activos
  vista,                  // Tipo de vista (tabla/timeline/cambios)
  paginaActual,           // Página actual
  totalRegistros,         // Total de registros
  totalPaginas,           // Total de páginas

  // Acciones
  cargarAuditorias,
  buscar,
  aplicarFiltros,
  limpiarFiltros,
  cambiarPagina,
  cambiarVista,
  seleccionarRegistro,
  refrescar,
} = useAuditorias()
```

---

## 🔒 Seguridad y Permisos

### Row Level Security (RLS)

Solo **administradores** pueden:
- ✅ Ver registros de `audit_log`
- ✅ Acceder al módulo `/auditorias`

### Políticas Aplicadas

```sql
-- Solo administradores pueden leer
CREATE POLICY "Administradores pueden ver audit_log"
ON audit_log FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE usuarios.id = auth.uid()
    AND usuarios.rol = 'Administrador'
  )
);

-- Auditoría es INMUTABLE (no se puede modificar/eliminar)
CREATE POLICY "Auditoría es inmutable"
ON audit_log FOR UPDATE
USING (false);

CREATE POLICY "Auditoría no se puede eliminar"
ON audit_log FOR DELETE
USING (false);
```

---

## 🧪 Cómo Probar

### 1. Acceso al Módulo

1. Inicia sesión como **Administrador**
2. Ve al menú lateral → **Sistema** → **Auditorías**
3. Deberías ver la interfaz con estadísticas

### 2. Ver Auditorías de Proyectos

1. Ve a **Proyectos** → Crea/Edita un proyecto
2. Regresa a **Auditorías**
3. Filtra por módulo: **Proyectos**
4. Deberías ver la creación/actualización registrada

### 3. Ver Detalles de un Cambio

1. En la tabla, haz clic en el botón **👁️ Ver detalles**
2. Se abre un modal con:
   - Acción realizada
   - Usuario que lo hizo
   - **Cambios específicos** (si es UPDATE)

### 4. Buscar Auditorías

1. En la barra de búsqueda, escribe el email de un usuario
2. Presiona Enter
3. Deberías ver solo las auditorías de ese usuario

### 5. Filtrar por Fecha

1. Haz clic en **Filtros** (icono de embudo)
2. Selecciona un rango de fechas
3. La tabla se actualiza automáticamente

---

## 📈 Estadísticas Disponibles

### Dashboard Principal

```typescript
{
  totalEventos: 1543,      // Total de operaciones
  eventosHoy: 24,          // Operaciones hoy
  eventosSemana: 187,      // Esta semana
  eventosMes: 892,         // Este mes
  usuariosActivos: 5,      // Usuarios únicos
  moduloMasActivo: 'proyectos',
  accionMasComun: 'UPDATE',
  eliminacionesTotales: 12
}
```

### Resumen por Módulo

```typescript
[
  {
    modulo: 'proyectos',
    totalEventos: 423,
    usuariosActivos: 3,
    totalCreaciones: 45,
    totalActualizaciones: 367,
    totalEliminaciones: 11,
    ultimoEvento: '2025-11-04T10:30:00Z',
    primerEvento: '2025-01-15T08:00:00Z'
  },
  // ... más módulos
]
```

---

## 🚀 Próximas Mejoras

### 🔜 Funcionalidades Pendientes

1. **Vista Timeline** (cronología visual de cambios)
2. **Vista de Cambios** (diff lado a lado)
3. **Exportar a CSV/Excel**
4. **Gráficos de actividad** (Chart.js / Recharts)
5. **Filtro por IP Address**
6. **Filtro por User Agent** (navegador/dispositivo)
7. **Notificaciones de eliminaciones masivas**
8. **Panel de actividad por usuario** (dashboard individual)

### 🎨 Mejoras de UX

- [ ] Skeleton loaders en lugar de spinner
- [ ] Animaciones de entrada para estadísticas
- [ ] Tooltip con info adicional en hover
- [ ] Resaltar cambios importantes en rojo
- [ ] Mini-gráficos (sparklines) en estadísticas
- [ ] Tema oscuro completo

---

## 🐛 Troubleshooting

### Error: "Permission denied for table audit_log"

**Causa**: El usuario no tiene rol de Administrador
**Solución**:
```sql
UPDATE usuarios
SET rol = 'Administrador'
WHERE email = 'tu-email@ryr.com';
```

### No se muestran datos

**Verificar**:
1. ¿La tabla `audit_log` existe?
   ```sql
   SELECT COUNT(*) FROM audit_log;
   ```
2. ¿Hay datos en la tabla?
   ```sql
   SELECT * FROM audit_log LIMIT 5;
   ```
3. ¿El usuario es Administrador?
   ```sql
   SELECT rol FROM usuarios WHERE id = auth.uid();
   ```

### Estadísticas en 0

**Causa**: No hay datos de auditoría aún
**Solución**: Realiza algunas operaciones (crear/editar proyectos, clientes, etc.) y las estadísticas se actualizarán

---

## 📚 Referencias

- **Plan de auditoría**: `docs/08-auditoria/PLAN-AUDITORIA-COMPLETA.md`
- **Migración SQL**: `supabase/migrations/20251104_create_audit_log.sql`
- **Auditoría en Proyectos**: `docs/08-auditoria/AUDITORIA-PROYECTOS-IMPLEMENTADA.md`
- **Servicio de auditoría**: `src/services/audit.service.ts`
- **Tipos de auditoría**: `src/types/audit.types.ts`

---

## ✅ Checklist de Implementación

- [x] Estructura del módulo creada
- [x] Tipos TypeScript definidos
- [x] Servicio de consultas implementado
- [x] Hook `useAuditorias` funcional
- [x] Componente `AuditoriasView` completo
- [x] Estilos centralizados
- [x] Página principal `/auditorias`
- [x] Ruta agregada al menú lateral
- [x] Filtros funcionales
- [x] Búsqueda implementada
- [x] Paginación funcional
- [x] Modal de detalles
- [x] Estadísticas en tiempo real
- [x] RPC functions integradas
- [x] Seguridad RLS verificada
- [x] Documentación completa

---

**🎉 ¡Módulo de Auditorías Listo para Producción!**
