# Módulo de Auditorías

Panel completo para visualizar y consultar el registro de auditoría del sistema.

## 🎯 Características

- ✅ **Estadísticas en tiempo real**: Eventos totales, hoy, semana, mes
- ✅ **Búsqueda avanzada**: Por email, tabla, registro ID
- ✅ **Filtros múltiples**: Módulo, acción, rango de fechas
- ✅ **Detalles completos**: Ver cambios específicos campo por campo
- ✅ **Paginación**: 50 registros por página
- ✅ **Seguridad RLS**: Solo administradores tienen acceso

## 📁 Estructura

```
auditorias/
├── components/
│   └── AuditoriasView.tsx       # Componente principal con UI completa
├── hooks/
│   └── useAuditorias.ts         # Lógica: filtros, paginación, queries
├── services/
│   └── auditorias.service.ts    # Queries a audit_log + RPC functions
├── types/
│   └── index.ts                 # TypeScript interfaces
└── styles/
    └── classes.ts               # Tailwind classes centralizadas
```

## 🚀 Uso Rápido

```typescript
import { AuditoriasView } from '@/modules/auditorias'

export default function AuditoriasPage() {
  return <AuditoriasView />
}
```

## 🔍 Servicios Disponibles

```typescript
import { auditoriasService } from '@/modules/auditorias'

// Obtener auditorías con filtros
const resultado = await auditoriasService.obtenerAuditorias({
  modulo: 'proyectos',
  accion: 'UPDATE',
  limite: 50,
})

// Historial de un registro
const historial = await auditoriasService.obtenerHistorialRegistro(
  'viviendas',
  'uuid-vivienda'
)

// Estadísticas
const stats = await auditoriasService.obtenerEstadisticas()
```

## 🎨 Componentes de UI

- **Dashboard de Estadísticas**: 4 métricas clave
- **Tabla de Auditorías**: Con filtros y paginación
- **Modal de Detalles**: Ver cambios completos
- **Badges de Acción**: CREATE (verde), UPDATE (azul), DELETE (rojo)

## 📊 RPC Functions Integradas

1. `obtener_historial_registro(tabla, id)` → Historial completo
2. `obtener_actividad_usuario(userId)` → Actividad de un usuario
3. `detectar_eliminaciones_masivas()` → Alertas de seguridad

## 🔒 Seguridad

- **RLS habilitado**: Solo administradores pueden leer `audit_log`
- **Auditoría inmutable**: No se puede modificar ni eliminar registros
- **Datos sensibles**: Nunca se guardan contraseñas ni tokens

## 📚 Documentación Completa

Ver: `docs/08-auditoria/MODULO-AUDITORIAS-COMPLETO.md`
