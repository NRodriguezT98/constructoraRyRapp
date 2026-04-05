# 🛡️ Sistema de Permisos - Módulo Usuarios

## 📚 Documentación Completa

Sistema granular de permisos por rol con arquitectura preparada para migración a base de datos.

---

## 🎯 Características

- ✅ **Permisos Granulares**: Control por módulo × acción
- ✅ **4 Roles**: Administrador, Contabilidad, Gerencia, Administrador de Obra
- ✅ **9 Módulos**: Proyectos, Viviendas, Clientes, Abonos, Renuncias, Usuarios, Procesos, Reportes, Administración
- ✅ **9 Acciones**: Ver, Crear, Editar, Eliminar, Aprobar, Rechazar, Exportar, Importar, Gestionar
- ✅ **Migrable a DB**: Estructura preparada para futuras actualizaciones dinámicas
- ✅ **TypeScript**: Tipado estricto y autocompletado

---

## 🚀 Uso Rápido

### 1️⃣ Hook `usePermissions`

```tsx
import { usePermissions } from '@/modules/usuarios/hooks'

function MiComponente() {
  const { puede, esAdmin, rol } = usePermissions()

  if (puede('clientes', 'crear')) {
    return <ButtonCrear />
  }

  return <div>Sin permiso</div>
}
```

### 2️⃣ Componente `ProtectedAction`

```tsx
import { ProtectedAction } from '@/modules/usuarios/components'

function ToolbarClientes() {
  return (
    <div>
      {/* Mostrar solo si puede crear */}
      <ProtectedAction modulo='clientes' accion='crear'>
        <Button>Crear Cliente</Button>
      </ProtectedAction>

      {/* Mostrar solo si puede editar O eliminar */}
      <ProtectedAction modulo='clientes' acciones={['editar', 'eliminar']}>
        <MenuAcciones />
      </ProtectedAction>

      {/* Mostrar solo si puede editar Y eliminar */}
      <ProtectedAction
        modulo='usuarios'
        acciones={['editar', 'eliminar']}
        requireAll
      >
        <PanelAdmin />
      </ProtectedAction>

      {/* Mostrar fallback si no tiene permiso */}
      <ProtectedAction
        modulo='reportes'
        accion='exportar'
        fallback={<Text>No tienes permiso</Text>}
      >
        <ExportButton />
      </ProtectedAction>
    </div>
  )
}
```

### 3️⃣ Componentes Simplificados

```tsx
import {
  CanCreate,
  CanEdit,
  CanDelete,
  AdminOnly,
} from '@/modules/usuarios/components'

function Toolbar() {
  return (
    <>
      <CanCreate modulo='proyectos'>
        <CreateProjectButton />
      </CanCreate>

      <CanEdit modulo='viviendas'>
        <EditButton />
      </CanEdit>

      <CanDelete modulo='abonos'>
        <DeleteButton />
      </CanDelete>

      <AdminOnly fallback={<Text>Solo admins</Text>}>
        <DangerZone />
      </AdminOnly>
    </>
  )
}
```

---

## 📖 API Completa

### Hook: `usePermissions()`

```typescript
const {
  // Verificación de permisos
  puede, // (modulo, accion) => boolean
  puedeAlguno, // (modulo, acciones[]) => boolean (OR)
  puedeTodos, // (modulo, acciones[]) => boolean (AND)

  // Información de permisos
  permisosModulo, // (modulo) => Accion[]
  modulosConAcceso, // () => Modulo[]
  todosLosPermisos, // () => { modulo, accion, descripcion }[]
  obtenerDescripcionPermiso, // (modulo, accion) => string

  // Helpers de rol
  esAdmin, // boolean
  esGerencia, // boolean
  esContabilidad, // boolean
  esAdminObra, // boolean
  rol, // Rol | undefined
  tieneRol, // boolean
} = usePermissions()
```

### Hook Simplificado: `useCan()`

```typescript
const { puede, puedeAlguno, puedeTodos } = useCan()
```

### Hook Rol: `useIsAdmin()`

```typescript
const isAdmin = useIsAdmin() // boolean
```

### Hook Rol: `useRole()`

```typescript
const rol = useRole() // 'Administrador' | 'Contabilidad' | 'Gerencia' | 'Administrador de Obra' | undefined
```

---

## 🔐 Matriz de Permisos

### Administrador (Acceso Total)

| Módulo             | Permisos                                                  |
| ------------------ | --------------------------------------------------------- |
| **Proyectos**      | Ver, Crear, Editar, Eliminar, Exportar                    |
| **Viviendas**      | Ver, Crear, Editar, Eliminar, Exportar                    |
| **Clientes**       | Ver, Crear, Editar, Eliminar, Exportar                    |
| **Abonos**         | Ver, Crear, Editar, Eliminar, Aprobar, Rechazar, Exportar |
| **Renuncias**      | Ver, Crear, Editar, Eliminar, Aprobar, Rechazar           |
| **Usuarios**       | Ver, Crear, Editar, Eliminar, Gestionar                   |
| **Procesos**       | Ver, Crear, Editar, Eliminar, Gestionar                   |
| **Reportes**       | Ver, Exportar                                             |
| **Administración** | Ver, Gestionar                                            |

### Contabilidad (Gestión sin Eliminación)

| Módulo             | Permisos                                          |
| ------------------ | ------------------------------------------------- |
| **Proyectos**      | Ver, Crear, Editar, Exportar                      |
| **Viviendas**      | Ver, Crear, Editar, Exportar                      |
| **Clientes**       | Ver, Crear, Editar, Exportar                      |
| **Abonos**         | Ver, Crear, Editar, Aprobar, Rechazar, Exportar   |
| **Renuncias**      | Ver, Crear, Editar, Aprobar, Rechazar             |
| **Usuarios**       | Ver, Crear, Editar _(no puede eliminar usuarios)_ |
| **Procesos**       | Ver, Crear, Editar                                |
| **Reportes**       | Ver, Exportar                                     |
| **Administración** | Ver                                               |

### Administrador de Obra (Solo lectura)

| Módulo             | Permisos           |
| ------------------ | ------------------ |
| **Proyectos**      | Ver                |
| **Viviendas**      | Ver                |
| **Clientes**       | Ver, Crear, Editar |
| **Abonos**         | Ver, Crear         |
| **Renuncias**      | Ver, Crear         |
| **Usuarios**       | Ver                |
| **Procesos**       | Ver                |
| **Reportes**       | Ver                |
| **Administración** | _(sin acceso)_     |

---

## 📝 Ejemplos de Uso Completo

### Proteger Página Completa

```tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePermissions } from '@/modules/usuarios/hooks'

export default function ProyectosPage() {
  const router = useRouter()
  const { puede } = usePermissions()

  useEffect(() => {
    if (!puede('proyectos', 'ver')) {
      router.push('/dashboard')
    }
  }, [puede, router])

  return <ProyectosContent />
}
```

### Condicionar Acciones en Tabla

```tsx
import { CanEdit, CanDelete } from '@/modules/usuarios/components'

function TablaClientes({ clientes }) {
  return (
    <table>
      {clientes.map(cliente => (
        <tr key={cliente.id}>
          <td>{cliente.nombre}</td>
          <td>
            <CanEdit modulo='clientes'>
              <EditButton onClick={() => edit(cliente)} />
            </CanEdit>

            <CanDelete modulo='clientes'>
              <DeleteButton onClick={() => delete cliente} />
            </CanDelete>
          </td>
        </tr>
      ))}
    </table>
  )
}
```

### Menú Dinámico por Permisos

```tsx
import { usePermissions } from '@/modules/usuarios/hooks'

function Sidebar() {
  const { modulosConAcceso, puede } = usePermissions()

  return (
    <nav>
      {modulosConAcceso.includes('proyectos') && (
        <Link href='/proyectos'>
          Proyectos
          {puede('proyectos', 'crear') && <Badge>+</Badge>}
        </Link>
      )}

      {modulosConAcceso.includes('clientes') && (
        <Link href='/clientes'>Clientes</Link>
      )}

      {/* ... */}
    </nav>
  )
}
```

### Verificar Múltiples Permisos

```tsx
import { usePermissions } from '@/modules/usuarios/hooks'

function PanelAbonos() {
  const { puedeAlguno, puedeTodos } = usePermissions()

  // Mostrar panel si puede crear O editar
  const puedeGestionar = puedeAlguno('abonos', ['crear', 'editar'])

  // Mostrar controles admin si puede aprobar Y rechazar
  const esAprobador = puedeTodos('abonos', ['aprobar', 'rechazar'])

  return (
    <div>
      {puedeGestionar && <FormularioAbono />}
      {esAprobador && <PanelAprobacion />}
    </div>
  )
}
```

### Mostrar Información de Permisos

```tsx
import { usePermissions } from '@/modules/usuarios/hooks'

function PerfilUsuario() {
  const { rol, todosLosPermisos, permisosModulo } = usePermissions()

  return (
    <div>
      <h2>Rol: {rol}</h2>

      <h3>Permisos en Clientes:</h3>
      <ul>
        {permisosModulo('clientes').map(accion => (
          <li key={accion}>{accion}</li>
        ))}
      </ul>

      <h3>Todos mis permisos:</h3>
      <ul>
        {todosLosPermisos.map(p => (
          <li key={`${p.modulo}-${p.accion}`}>
            {p.modulo} → {p.accion}: {p.descripcion}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

---

## 🔄 Migración Futura a Base de Datos

El sistema está diseñado para migrar a DB cuando necesites actualizar permisos dinámicamente:

### Estructura DB Propuesta

```sql
-- Tabla de permisos base
CREATE TABLE permisos (
  id UUID PRIMARY KEY,
  modulo TEXT NOT NULL,
  accion TEXT NOT NULL,
  descripcion TEXT,
  UNIQUE(modulo, accion)
);

-- Permisos por rol (default)
CREATE TABLE permisos_rol (
  rol TEXT NOT NULL,
  permiso_id UUID REFERENCES permisos(id),
  PRIMARY KEY(rol, permiso_id)
);

-- Permisos personalizados por usuario
CREATE TABLE permisos_usuario (
  usuario_id UUID REFERENCES usuarios(id),
  permiso_id UUID REFERENCES permisos(id),
  permitido BOOLEAN DEFAULT true,
  PRIMARY KEY(usuario_id, permiso_id)
);
```

### Seed Data

Los valores actuales de `PERMISOS_POR_ROL` se insertarán como datos iniciales:

```sql
-- Insertar permisos base (9 módulos × 9 acciones)
INSERT INTO permisos (modulo, accion, descripcion) VALUES
  ('proyectos', 'ver', 'Ver lista y detalles de proyectos'),
  ('proyectos', 'crear', 'Crear nuevos proyectos'),
  -- ... (todos los permisos del sistema)

-- Insertar permisos por rol (basado en PERMISOS_POR_ROL)
INSERT INTO permisos_rol (rol, permiso_id)
SELECT 'Administrador', id FROM permisos;  -- Admin tiene todos
-- ...
```

### Actualización del Hook

```typescript
// Después de migración, el hook consultará DB:
export function usePermissions() {
  const { perfil } = useAuth()
  const { data: permisos } = useQuery(['permisos', perfil?.id], () =>
    fetchPermisos(perfil?.id)
  )

  // La API del hook NO cambia ✅
  return {
    puede: (modulo, accion) =>
      permisos?.some(p => p.modulo === modulo && p.accion === accion),
    // ... resto igual
  }
}
```

**Ventaja**: Los componentes NO requieren cambios. La migración es transparente.

---

## 🎨 Estilos y UI

El sistema incluye componentes listos para mostrar permisos en UI:

- **Badges de Rol**: Gradientes únicos por rol
- **Tooltips**: Descripciones de permisos
- **Iconos**: Visualización de acciones (Shield, Lock, Eye, etc.)

```tsx
import { DESCRIPCION_PERMISOS } from '@/modules/usuarios/types'

function PermisoBadge({ modulo, accion }) {
  const descripcion = DESCRIPCION_PERMISOS[modulo][accion]

  return (
    <Badge tooltip={descripcion}>
      {modulo} → {accion}
    </Badge>
  )
}
```

---

## 🐛 Debugging

```tsx
import { usePermissions } from '@/modules/usuarios/hooks'

function DebugPermisos() {
  const permisos = usePermissions()

  console.log('Rol actual:', permisos.rol)
  console.log('¿Es admin?:', permisos.esAdmin)
  console.log('Módulos accesibles:', permisos.modulosConAcceso)
  console.log('Permisos en clientes:', permisos.permisosModulo('clientes'))
  console.log('Todos los permisos:', permisos.todosLosPermisos)

  return null
}
```

---

## ✅ Checklist de Implementación

- [x] Tipos de permisos definidos
- [x] Matriz PERMISOS_POR_ROL completa
- [x] Funciones helper de verificación
- [x] Hook usePermissions creado
- [x] Componente ProtectedAction creado
- [x] Componentes simplificados (CanCreate, CanEdit, etc.)
- [x] Integración en página usuarios
- [x] Documentación completa
- [ ] Componente ProtectedRoute
- [ ] Integración en módulos (proyectos, clientes, etc.)
- [ ] Tests unitarios
- [ ] UI gestión de permisos (futuro)
- [ ] Migración a base de datos (cuando sea necesario)

---

## 📞 Soporte

Para dudas o sugerencias sobre el sistema de permisos, consulta:

- `src/modules/usuarios/types/index.ts` - Definición completa
- `src/modules/usuarios/hooks/usePermissions.ts` - Hook principal
- `src/modules/usuarios/components/ProtectedAction.tsx` - Componente de protección
