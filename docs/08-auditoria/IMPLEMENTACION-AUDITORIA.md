# 🚀 Implementación del Sistema de Auditoría

**Fecha**: 4 de noviembre de 2025
**Estado**: ✅ Infraestructura lista para usar

---

## ✅ Lo que acabamos de crear

### 1️⃣ Migración SQL (`supabase/migrations/20251104_create_audit_log.sql`)

**Incluye**:
- ✅ Tabla `audit_log` con validaciones
- ✅ 8 índices optimizados para búsquedas
- ✅ 4 políticas RLS (seguridad)
- ✅ 3 funciones RPC (consultas avanzadas)
- ✅ 1 vista resumen (`v_auditoria_por_modulo`)
- ✅ Función auxiliar para calcular cambios
- ✅ Comentarios en todas las columnas

**Características**:
- Inmutable (no se puede editar/borrar auditoría)
- Solo administradores pueden leer
- Cualquier usuario autenticado puede insertar
- Valida que CREATE tenga `datos_nuevos` y no `datos_anteriores`
- Valida que DELETE tenga `datos_anteriores` y no `datos_nuevos`

### 2️⃣ Servicio TypeScript (`src/services/audit.service.ts`)

**Métodos principales**:
```typescript
// 1. Método genérico
auditService.registrarAccion({ tabla, accion, registroId, datosAnteriores, datosNuevos })

// 2. Shortcuts convenientes
auditService.auditarCreacion(tabla, id, datos, metadata)
auditService.auditarActualizacion(tabla, id, antes, despues, metadata)
auditService.auditarEliminacion(tabla, id, datos, metadata)

// 3. Consultas
auditService.obtenerHistorial(tabla, registroId)
auditService.obtenerActividadUsuario(usuarioId, dias, limit)
auditService.obtenerCambiosRecientes(limit)
auditService.obtenerResumenPorModulo()
auditService.detectarEliminacionesMasivas(dias, umbral)
```

**Características**:
- ✅ TypeScript con tipos estrictos
- ✅ Calcula automáticamente cambios específicos
- ✅ Falla silenciosamente (no interrumpe flujo principal)
- ✅ Incluye metadata automática (user_agent, URL, timestamp)
- ✅ Infiere módulo automáticamente desde tabla
- ✅ Singleton (una sola instancia)

---

## 🚀 Paso 1: Ejecutar la Migración

### Opción A: Desde Supabase Dashboard (RECOMENDADO)

1. Ir a: https://supabase.com/dashboard/project/swyjhwgvkfcfdtemkyad
2. Ir a: **SQL Editor** (menú lateral)
3. Click en **New Query**
4. Copiar TODO el contenido de `supabase/migrations/20251104_create_audit_log.sql`
5. Pegar en el editor
6. Click en **Run** (▶️)
7. Verificar mensaje: `✅ Migración completada exitosamente`

### Opción B: Desde CLI (Avanzado)

```bash
# Asegurarse de tener Supabase CLI instalado
supabase db push

# O ejecutar manualmente
psql postgresql://postgres:Wx8EwiZFhsPcHzAr@db.swyjhwgvkfcfdtemkyad.supabase.co:5432/postgres < supabase/migrations/20251104_create_audit_log.sql
```

---

## 📝 Paso 2: Implementar Auditoría en Módulos

### Ejemplo: Auditar CRUD de Viviendas

#### 1. Crear Vivienda

```typescript
// src/modules/viviendas/services/viviendas.service.ts

import { auditService } from '@/services/audit.service'

async function crearVivienda(datos: ViviendaInput) {
  // 1. Crear la vivienda en BD
  const { data: nuevaVivienda, error } = await supabase
    .from('viviendas')
    .insert(datos)
    .select()
    .single()

  if (error) throw error

  // 2. AUDITAR la creación
  await auditService.auditarCreacion(
    'viviendas',
    nuevaVivienda.id,
    nuevaVivienda,
    {
      proyecto_id: datos.proyecto_id,
      manzana_nombre: datos.manzana_nombre,
      numero_vivienda: datos.numero
    },
    'viviendas'
  )

  return nuevaVivienda
}
```

#### 2. Actualizar Vivienda

```typescript
async function actualizarVivienda(id: string, cambios: Partial<Vivienda>) {
  // 1. Obtener datos ANTES del cambio
  const { data: viviendaAnterior } = await supabase
    .from('viviendas')
    .select('*')
    .eq('id', id)
    .single()

  // 2. Actualizar la vivienda
  const { data: viviendaActualizada, error } = await supabase
    .from('viviendas')
    .update(cambios)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  // 3. AUDITAR la actualización
  await auditService.auditarActualizacion(
    'viviendas',
    id,
    viviendaAnterior,
    viviendaActualizada,
    {
      campos_modificados: Object.keys(cambios),
      motivo: 'Actualización por usuario'
    },
    'viviendas'
  )

  return viviendaActualizada
}
```

#### 3. Eliminar Vivienda

```typescript
async function eliminarVivienda(id: string, motivo: string) {
  // 1. Obtener datos ANTES de eliminar
  const { data: viviendaAEliminar } = await supabase
    .from('viviendas')
    .select('*')
    .eq('id', id)
    .single()

  // 2. Eliminar la vivienda
  const { error } = await supabase
    .from('viviendas')
    .delete()
    .eq('id', id)

  if (error) throw error

  // 3. AUDITAR la eliminación
  await auditService.auditarEliminacion(
    'viviendas',
    id,
    viviendaAEliminar,
    {
      motivo,
      autorizacion: 'Administrador'
    },
    'viviendas'
  )

  return true
}
```

---

## 🎯 Paso 3: Implementar en Módulos Críticos

### Checklist de Implementación

#### 🔴 **CRÍTICO** (Implementar YA)

- [ ] **Viviendas**
  - [ ] `crearVivienda()` → `auditarCreacion`
  - [ ] `actualizarVivienda()` → `auditarActualizacion`
  - [ ] `actualizarLinderos()` → `auditarActualizacion`
  - [ ] `eliminarVivienda()` → `auditarEliminacion`

- [ ] **Clientes**
  - [ ] `crearCliente()` → `auditarCreacion`
  - [ ] `actualizarCliente()` → `auditarActualizacion`
  - [ ] `eliminarCliente()` → `auditarEliminacion`

- [ ] **Negociaciones**
  - [ ] `crearNegociacion()` → `auditarCreacion`
  - [ ] `actualizarNegociacion()` → `auditarActualizacion`
  - [ ] `cambiarEstado()` → `auditarActualizacion` (metadata: estado_anterior, estado_nuevo)
  - [ ] `completarNegociacion()` → `auditarActualizacion`
  - [ ] `cancelarNegociacion()` → `auditarActualizacion`

- [ ] **Abonos**
  - [ ] `registrarAbono()` → `auditarCreacion`
  - [ ] `actualizarAbono()` → `auditarActualizacion`
  - [ ] `eliminarAbono()` → `auditarEliminacion` (CRÍTICO: involucra dinero)

- [ ] **Fuentes de Pago**
  - [ ] `crearFuentePago()` → `auditarCreacion`
  - [ ] `actualizarFuentePago()` → `auditarActualizacion`

#### 🟡 **IMPORTANTE** (Pronto)

- [ ] **Procesos de Negociación**
  - [ ] `completarPaso()` → `auditarActualizacion`
  - [ ] `corregirFechaPaso()` → `auditarActualizacion`

- [ ] **Renuncias**
  - [ ] `registrarRenuncia()` → `auditarCreacion`
  - [ ] `procesarRenuncia()` → `auditarActualizacion`
  - [ ] `cancelarRenuncia()` → `auditarActualizacion`

- [ ] **Usuarios**
  - [ ] `crearUsuario()` → `auditarCreacion`
  - [ ] `cambiarRol()` → `auditarActualizacion` (IMPORTANTE: seguridad)
  - [ ] `desactivarUsuario()` → `auditarActualizacion`

---

## 🎨 Paso 4: Crear UI de Consulta (Opcional - Fase 2)

### Componente: Historial de Registro

```typescript
// src/components/audit/HistorialAuditoria.tsx

'use client'

import { useEffect, useState } from 'react'
import { auditService, AuditLogRecord } from '@/services/audit.service'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface Props {
  tabla: string
  registroId: string
}

export function HistorialAuditoria({ tabla, registroId }: Props) {
  const [historial, setHistorial] = useState<AuditLogRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarHistorial()
  }, [tabla, registroId])

  const cargarHistorial = async () => {
    setLoading(true)
    const data = await auditService.obtenerHistorial(tabla, registroId)
    setHistorial(data)
    setLoading(false)
  }

  if (loading) return <div>Cargando historial...</div>

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">📜 Historial de Cambios</h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {historial.map((evento) => (
            <div key={evento.id} className="border-l-4 border-violet-500 pl-4 py-2">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={
                  evento.accion === 'CREATE' ? 'default' :
                  evento.accion === 'UPDATE' ? 'secondary' :
                  'destructive'
                }>
                  {evento.accion}
                </Badge>
                <span className="text-sm text-gray-600">
                  {formatDistanceToNow(new Date(evento.fecha_evento), {
                    addSuffix: true,
                    locale: es
                  })}
                </span>
              </div>

              <p className="text-sm">
                <strong>{evento.usuario_email}</strong>
                {evento.usuario_rol && ` (${evento.usuario_rol})`}
              </p>

              {evento.cambios_especificos && (
                <div className="mt-2 text-sm">
                  <strong>Cambios:</strong>
                  {Object.entries(evento.cambios_especificos).map(([campo, valores]) => (
                    <div key={campo} className="ml-4">
                      <span className="font-medium">{campo}:</span>{' '}
                      <span className="text-red-500">{JSON.stringify(valores.antes)}</span>
                      {' → '}
                      <span className="text-green-500">{JSON.stringify(valores.despues)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
```

**Uso**:
```tsx
<HistorialAuditoria tabla="viviendas" registroId={vivienda.id} />
```

---

## 🔍 Paso 5: Consultas Útiles

### Ver historial de una vivienda

```typescript
const historial = await auditService.obtenerHistorial('viviendas', viviendaId)
console.log(historial)
```

### Ver actividad de un usuario en los últimos 7 días

```typescript
const actividad = await auditService.obtenerActividadUsuario(usuarioId, 7, 50)
console.log(actividad)
```

### Ver cambios recientes (últimos 100)

```typescript
const cambiosRecientes = await auditService.obtenerCambiosRecientes(100)
console.log(cambiosRecientes)
```

### Detectar eliminaciones masivas sospechosas

```typescript
const eliminacionesMasivas = await auditService.detectarEliminacionesMasivas(7, 5)
if (eliminacionesMasivas.length > 0) {
  console.warn('⚠️ Eliminaciones masivas detectadas:', eliminacionesMasivas)
}
```

### Ver resumen por módulo

```typescript
const resumen = await auditService.obtenerResumenPorModulo()
console.log(resumen)
```

---

## 📊 Queries SQL Directas (Para reportes)

### Ver todos los cambios de precio en viviendas

```sql
SELECT
  fecha_evento,
  registro_id,
  usuario_email,
  cambios_especificos->'valor_base' AS cambio_precio
FROM audit_log
WHERE tabla = 'viviendas'
  AND accion = 'UPDATE'
  AND cambios_especificos ? 'valor_base'  -- Solo si cambió valor_base
ORDER BY fecha_evento DESC;
```

### Ver quién eliminó abonos (¡CRÍTICO!)

```sql
SELECT
  fecha_evento,
  usuario_email,
  usuario_rol,
  datos_anteriores->>'monto' AS monto_eliminado,
  metadata->>'motivo' AS motivo
FROM audit_log
WHERE tabla = 'abonos_historial'
  AND accion = 'DELETE'
ORDER BY fecha_evento DESC;
```

### Ver cambios de estado en negociaciones

```sql
SELECT
  fecha_evento,
  registro_id,
  usuario_email,
  cambios_especificos->'estado' AS cambio_estado,
  metadata
FROM audit_log
WHERE tabla = 'negociaciones'
  AND accion = 'UPDATE'
  AND cambios_especificos ? 'estado'
ORDER BY fecha_evento DESC;
```

---

## ⚠️ Consideraciones Importantes

### 1. Performance

- ✅ Auditoría NO bloquea operaciones (falla silenciosamente)
- ✅ Inserts son async (no afectan UX)
- ✅ Índices optimizados para queries comunes
- ⚠️ jsonb puede crecer: monitorear tamaño de tabla

### 2. Seguridad

- ✅ RLS habilitado (solo admins leen)
- ✅ Auditoría es inmutable (no se puede editar/borrar)
- ✅ Incluye IP y user agent
- ⚠️ No auditar datos sensibles (contraseñas, tokens)

### 3. Almacenamiento

- Cada evento: ~1-5 KB (depende de datos)
- 1,000 eventos ≈ 2-5 MB
- 10,000 eventos ≈ 20-50 MB
- 100,000 eventos ≈ 200-500 MB

**Recomendación**: Implementar política de retención (borrar eventos > 2 años)

### 4. Compliance

- ✅ Cumple con requisitos de auditoría
- ✅ Timestamp inmutable
- ✅ Trazabilidad completa
- ✅ Exportable para auditorías externas

---

## 🎯 Próximos Pasos

1. **HOY** → Ejecutar migración en Supabase
2. **HOY** → Implementar en módulo de viviendas (ejemplo)
3. **Esta semana** → Implementar en clientes, negociaciones, abonos
4. **Próxima semana** → Crear UI de consulta
5. **Mes que viene** → Dashboard de auditoría para admins

---

## 📚 Referencias

- **Script SQL**: `supabase/migrations/20251104_create_audit_log.sql`
- **Servicio TS**: `src/services/audit.service.ts`
- **Documentación completa**: `docs/08-auditoria/PLAN-AUDITORIA-COMPLETA.md`
- **Análisis de schema**: `docs/08-auditoria/ANALISIS-SCHEMA-ACTUAL-PARA-AUDITORIA.md`

---

## ✅ Checklist de Implementación

- [ ] Ejecutar migración SQL en Supabase
- [ ] Verificar que tabla `audit_log` existe
- [ ] Verificar que índices se crearon
- [ ] Probar `auditService.auditarCreacion()` con datos de prueba
- [ ] Implementar en servicio de viviendas
- [ ] Implementar en servicio de clientes
- [ ] Implementar en servicio de negociaciones
- [ ] Implementar en servicio de abonos
- [ ] Crear componente `HistorialAuditoria`
- [ ] Documentar uso para equipo

---

**¿Listo para ejecutar la migración?** 🚀

Copia el contenido de `supabase/migrations/20251104_create_audit_log.sql` y ejecútalo en Supabase Dashboard → SQL Editor.
