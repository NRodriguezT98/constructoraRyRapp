# 📊 Plan de Implementación: Sistema de Auditoría Completa

**Fecha**: 4 de noviembre de 2025
**Objetivo**: Registrar TODAS las acciones en la aplicación (CRUD completo)
**Estado**: 📋 Planificación

---

## 🎯 ¿Qué es un Audit Trail?

Un **Audit Trail** (rastro de auditoría) es un registro cronológico de TODAS las acciones que ocurren en un sistema, incluyendo:

- **QUÉ** se hizo (acción: crear, editar, eliminar, etc.)
- **QUIÉN** lo hizo (usuario)
- **CUÁNDO** lo hizo (timestamp exacto)
- **DÓNDE** lo hizo (IP, dispositivo, ubicación)
- **DATOS ANTERIORES** (before)
- **DATOS NUEVOS** (after)
- **CONTEXTO** (metadata adicional)

---

## ✅ ¿Es normal usar esto?

**SÍ, es ESTÁNDAR** en aplicaciones empresariales serias:

### Industrias que LO REQUIEREN por ley:
- 🏦 **Banca y finanzas** (PCI-DSS, SOX)
- 🏥 **Salud** (HIPAA)
- 🏛️ **Gobierno** (FISMA)
- 📊 **Contabilidad** (SOX, GAAP)
- 🏢 **Empresas públicas** (Sarbanes-Oxley)

### Software empresarial que LO USA:
- **Salesforce** → Audita cada cambio en CRM
- **SAP** → Audita transacciones financieras
- **QuickBooks** → Audita movimientos contables
- **Shopify** → Audita cambios en productos/pedidos
- **GitHub** → Audita commits, PRs, cambios
- **Google Workspace** → Audita accesos y cambios

### Beneficios clave:
✅ **Trazabilidad completa** → Saber quién hizo qué
✅ **Cumplimiento legal** → Demostrar integridad de datos
✅ **Detección de fraudes** → Identificar patrones sospechosos
✅ **Resolución de conflictos** → "¿Quién cambió esto?"
✅ **Recuperación de datos** → Rollback a versión anterior
✅ **Análisis de comportamiento** → Optimizar procesos

---

## 🏗️ Arquitectura del Sistema

### 1. Tabla Principal de Auditoría

```sql
CREATE TABLE audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- ¿QUÉ?
  tabla varchar(100) NOT NULL,              -- 'viviendas', 'clientes', 'negociaciones'
  accion varchar(20) NOT NULL,              -- 'CREATE', 'UPDATE', 'DELETE'
  registro_id uuid NOT NULL,                -- ID del registro afectado

  -- ¿QUIÉN?
  usuario_id uuid REFERENCES usuarios(id),
  usuario_email varchar(255) NOT NULL,
  usuario_rol varchar(50),

  -- ¿CUÁNDO?
  fecha_evento timestamp with time zone DEFAULT now(),

  -- ¿DÓNDE?
  ip_address inet,
  user_agent text,
  pais varchar(100),
  ciudad varchar(100),

  -- ¿QUÉ CAMBIÓ?
  datos_anteriores jsonb,                   -- Snapshot ANTES del cambio
  datos_nuevos jsonb,                       -- Snapshot DESPUÉS del cambio
  cambios_especificos jsonb,                -- Solo campos que cambiaron

  -- CONTEXTO
  metadata jsonb DEFAULT '{}',
  modulo varchar(50),                       -- 'viviendas', 'clientes', etc.

  -- INDICES
  CONSTRAINT valid_accion CHECK (accion IN ('CREATE', 'UPDATE', 'DELETE'))
);

-- Indices para búsqueda rápida
CREATE INDEX idx_audit_tabla ON audit_log(tabla);
CREATE INDEX idx_audit_registro_id ON audit_log(registro_id);
CREATE INDEX idx_audit_usuario ON audit_log(usuario_id);
CREATE INDEX idx_audit_fecha ON audit_log(fecha_evento DESC);
CREATE INDEX idx_audit_tabla_registro ON audit_log(tabla, registro_id);
```

### 2. Tabla de Auditoría de Seguridad (YA EXISTE ✅)

```sql
-- Ya tienes esta tabla implementada
CREATE TABLE audit_log_seguridad (
  id uuid PRIMARY KEY,
  tipo varchar(50) NOT NULL,
  usuario_email varchar(255) NOT NULL,
  usuario_id uuid,
  ip_address inet,
  user_agent text,
  metadata jsonb DEFAULT '{}',
  fecha_evento timestamp with time zone DEFAULT now()
);
```

---

## 📦 Módulos a Auditar (Prioridad)

### 🔴 **PRIORIDAD ALTA** (Implementar primero)

#### 1. Viviendas
```typescript
// Acciones a auditar:
- Crear vivienda ✅
- Editar vivienda (datos generales) ✅
- Editar linderos ✅
- Cambiar estado ✅
- Eliminar vivienda ✅
- Asignar a negociación ✅
- Desasignar de negociación ✅

// Datos a registrar:
{
  tabla: 'viviendas',
  accion: 'UPDATE',
  registro_id: 'uuid-vivienda',
  datos_anteriores: {
    numero_vivienda: '101',
    valor_base: 150000,
    estado: 'Disponible',
    linderos: { norte: '...', sur: '...' }
  },
  datos_nuevos: {
    numero_vivienda: '101',
    valor_base: 155000,  // ← Cambió
    estado: 'Disponible',
    linderos: { norte: '...', sur: '...' }
  },
  cambios_especificos: {
    valor_base: { antes: 150000, despues: 155000 }
  }
}
```

#### 2. Clientes
```typescript
// Acciones a auditar:
- Crear cliente ✅
- Editar cliente (datos personales) ✅
- Editar datos de contacto ✅
- Cambiar estado (Activo/Inactivo) ✅
- Eliminar cliente ✅
- Convertir de interés a negociación ✅

// Datos a registrar:
{
  tabla: 'clientes',
  accion: 'UPDATE',
  registro_id: 'uuid-cliente',
  datos_anteriores: {
    nombres: 'Juan',
    apellidos: 'Pérez',
    cedula: '001234567',
    telefono: '0999999999',
    email: 'juan@example.com'
  },
  datos_nuevos: {
    nombres: 'Juan Carlos',  // ← Cambió
    apellidos: 'Pérez',
    cedula: '001234567',
    telefono: '0988888888',  // ← Cambió
    email: 'juan@example.com'
  },
  cambios_especificos: {
    nombres: { antes: 'Juan', despues: 'Juan Carlos' },
    telefono: { antes: '0999999999', despues: '0988888888' }
  }
}
```

#### 3. Negociaciones
```typescript
// Acciones a auditar:
- Crear negociación ✅
- Cambiar estado (Activa → Completada) ✅
- Cancelar negociación ✅
- Editar condiciones de pago ✅
- Completar pasos del proceso ✅
- Corregir fecha de paso ✅ (ya implementado parcialmente)

// Datos a registrar:
{
  tabla: 'negociaciones',
  accion: 'UPDATE',
  registro_id: 'uuid-negociacion',
  datos_anteriores: {
    estado: 'Activa',
    precio_final: 150000,
    cuota_inicial: 30000
  },
  datos_nuevos: {
    estado: 'Completada',  // ← Cambió
    precio_final: 150000,
    cuota_inicial: 30000
  },
  cambios_especificos: {
    estado: { antes: 'Activa', despues: 'Completada' }
  },
  metadata: {
    motivo: 'Pagos completados',
    pasos_completados: 7
  }
}
```

#### 4. Abonos
```typescript
// Acciones a auditar:
- Crear abono ✅
- Editar abono ✅
- Eliminar abono ✅
- Subir comprobante ✅
- Cambiar fuente de pago ✅

// Datos a registrar:
{
  tabla: 'abonos',
  accion: 'CREATE',
  registro_id: 'uuid-abono',
  datos_anteriores: null,  // No hay datos anteriores en CREATE
  datos_nuevos: {
    negociacion_id: 'uuid-neg',
    monto: 5000,
    metodo_pago: 'Transferencia',
    fuente_pago: 'Banco Pichincha',
    numero_referencia: 'TRANS-12345',
    comprobante_url: 'https://...',
    fecha_abono: '2025-11-04'
  },
  metadata: {
    cliente_email: 'juan@example.com',
    vivienda_numero: '101',
    saldo_anterior: 100000,
    saldo_nuevo: 95000
  }
}
```

### 🟡 **PRIORIDAD MEDIA**

#### 5. Proyectos
- Crear proyecto
- Editar proyecto
- Cambiar estado
- Agregar/quitar manzanas

#### 6. Renuncias
- Crear renuncia
- Procesar renuncia
- Cancelar renuncia
- Devolver abonos

#### 7. Usuarios
- Crear usuario
- Editar rol
- Activar/desactivar
- Cambiar permisos

### 🟢 **PRIORIDAD BAJA**

#### 8. Documentos
- Subir documento
- Eliminar documento
- Reemplazar documento

#### 9. Categorías
- Crear categoría
- Editar categoría
- Eliminar categoría

---

## 🛠️ Implementación Técnica

### Opción 1: Triggers de Base de Datos (RECOMENDADA) ⭐

**Ventajas**:
- ✅ Automático (no olvidas auditar)
- ✅ Consistente (siempre se ejecuta)
- ✅ No depende del código frontend
- ✅ Captura cambios directos en BD
- ✅ Performance óptimo

**Desventajas**:
- ❌ Más complejo de configurar inicial
- ❌ Requiere conocimiento de PostgreSQL

**Ejemplo de trigger**:

```sql
-- Función genérica de auditoría
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
  usuario_actual jsonb;
  cambios jsonb;
BEGIN
  -- Obtener usuario de auth.jwt()
  usuario_actual := current_setting('request.jwt.claims', true)::jsonb;

  -- Calcular cambios específicos
  IF TG_OP = 'UPDATE' THEN
    SELECT jsonb_object_agg(key, jsonb_build_object(
      'antes', OLD.row_to_json->>key,
      'despues', NEW.row_to_json->>key
    ))
    INTO cambios
    FROM jsonb_each_text(to_jsonb(NEW))
    WHERE to_jsonb(NEW)->>key IS DISTINCT FROM to_jsonb(OLD)->>key;
  END IF;

  -- Insertar en audit_log
  INSERT INTO audit_log (
    tabla,
    accion,
    registro_id,
    usuario_id,
    usuario_email,
    datos_anteriores,
    datos_nuevos,
    cambios_especificos,
    ip_address
  ) VALUES (
    TG_TABLE_NAME,
    TG_OP,
    CASE
      WHEN TG_OP = 'DELETE' THEN OLD.id
      ELSE NEW.id
    END,
    (usuario_actual->>'sub')::uuid,
    usuario_actual->>'email',
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(OLD) END,
    CASE WHEN TG_OP = 'INSERT' THEN to_jsonb(NEW) ELSE to_jsonb(NEW) END,
    cambios,
    inet_client_addr()
  );

  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a viviendas
CREATE TRIGGER viviendas_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON viviendas
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Aplicar trigger a clientes
CREATE TRIGGER clientes_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON clientes
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Aplicar a TODAS las tablas críticas
-- (repetir para negociaciones, abonos, proyectos, etc.)
```

---

### Opción 2: Servicio de Auditoría en TypeScript

**Ventajas**:
- ✅ Más control desde código
- ✅ Metadata personalizada fácil
- ✅ Más fácil de entender

**Desventajas**:
- ❌ Fácil olvidar llamar el servicio
- ❌ No captura cambios directos en BD
- ❌ Más código duplicado

**Implementación**:

```typescript
// src/services/audit.service.ts

import { supabase } from '@/lib/supabase/client'

type TablaAuditable =
  | 'viviendas'
  | 'clientes'
  | 'negociaciones'
  | 'abonos'
  | 'proyectos'
  | 'renuncias'
  | 'usuarios'

type AccionAuditoria = 'CREATE' | 'UPDATE' | 'DELETE'

interface AuditLogParams<T = any> {
  tabla: TablaAuditable
  accion: AccionAuditoria
  registroId: string
  datosAnteriores?: T | null
  datosNuevos?: T
  metadata?: Record<string, any>
}

class AuditService {
  /**
   * Registra una acción en el audit log
   */
  async registrarAccion<T>({
    tabla,
    accion,
    registroId,
    datosAnteriores = null,
    datosNuevos,
    metadata = {}
  }: AuditLogParams<T>): Promise<void> {
    try {
      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.warn('⚠️ No se pudo obtener usuario para auditoría')
        return
      }

      // Calcular cambios específicos (solo en UPDATE)
      let cambiosEspecificos = null
      if (accion === 'UPDATE' && datosAnteriores && datosNuevos) {
        cambiosEspecificos = this.calcularCambios(datosAnteriores, datosNuevos)
      }

      // Preparar datos
      const auditData = {
        tabla,
        accion,
        registro_id: registroId,
        usuario_id: user.id,
        usuario_email: user.email!,
        datos_anteriores: datosAnteriores,
        datos_nuevos: datosNuevos,
        cambios_especificos: cambiosEspecificos,
        user_agent: window.navigator.userAgent,
        metadata: {
          ...metadata,
          timestamp_cliente: new Date().toISOString(),
          url: window.location.href
        }
      }

      // Insertar en BD
      const { error } = await supabase
        .from('audit_log')
        .insert(auditData)

      if (error) {
        console.error('❌ Error registrando auditoría:', error)
      } else {
        console.log(`✅ Auditoría registrada: ${accion} en ${tabla}`)
      }
    } catch (error) {
      console.error('❌ Excepción en auditoría:', error)
      // Fallar silenciosamente para no interrumpir flujo
    }
  }

  /**
   * Calcula diferencias entre dos objetos
   */
  private calcularCambios(antes: any, despues: any): Record<string, any> {
    const cambios: Record<string, any> = {}

    for (const key in despues) {
      if (JSON.stringify(antes[key]) !== JSON.stringify(despues[key])) {
        cambios[key] = {
          antes: antes[key],
          despues: despues[key]
        }
      }
    }

    return cambios
  }

  /**
   * Shorthand: Auditar creación
   */
  async auditarCreacion<T>(
    tabla: TablaAuditable,
    registroId: string,
    datos: T,
    metadata?: Record<string, any>
  ) {
    return this.registrarAccion({
      tabla,
      accion: 'CREATE',
      registroId,
      datosNuevos: datos,
      metadata
    })
  }

  /**
   * Shorthand: Auditar actualización
   */
  async auditarActualizacion<T>(
    tabla: TablaAuditable,
    registroId: string,
    datosAnteriores: T,
    datosNuevos: T,
    metadata?: Record<string, any>
  ) {
    return this.registrarAccion({
      tabla,
      accion: 'UPDATE',
      registroId,
      datosAnteriores,
      datosNuevos,
      metadata
    })
  }

  /**
   * Shorthand: Auditar eliminación
   */
  async auditarEliminacion<T>(
    tabla: TablaAuditable,
    registroId: string,
    datos: T,
    metadata?: Record<string, any>
  ) {
    return this.registrarAccion({
      tabla,
      accion: 'DELETE',
      registroId,
      datosAnteriores: datos,
      metadata
    })
  }

  /**
   * Obtener historial de un registro específico
   */
  async obtenerHistorial(tabla: TablaAuditable, registroId: string) {
    const { data, error } = await supabase
      .from('audit_log')
      .select('*')
      .eq('tabla', tabla)
      .eq('registro_id', registroId)
      .order('fecha_evento', { ascending: false })

    if (error) {
      console.error('Error obteniendo historial:', error)
      return []
    }

    return data
  }

  /**
   * Obtener actividad de un usuario
   */
  async obtenerActividadUsuario(usuarioId: string, limit = 50) {
    const { data, error } = await supabase
      .from('audit_log')
      .select('*')
      .eq('usuario_id', usuarioId)
      .order('fecha_evento', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error obteniendo actividad:', error)
      return []
    }

    return data
  }

  /**
   * Obtener cambios recientes (para dashboard de admin)
   */
  async obtenerCambiosRecientes(limit = 100) {
    const { data, error } = await supabase
      .from('audit_log')
      .select('*')
      .order('fecha_evento', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error obteniendo cambios recientes:', error)
      return []
    }

    return data
  }
}

// Exportar instancia única
export const auditService = new AuditService()
```

**Uso en código**:

```typescript
// Al crear vivienda
const nuevaVivienda = await crearVivienda(datos)
await auditService.auditarCreacion('viviendas', nuevaVivienda.id, nuevaVivienda, {
  proyecto_id: datos.proyecto_id,
  numero_vivienda: datos.numero_vivienda
})

// Al editar vivienda
const viviendaAnterior = await obtenerVivienda(id)
const viviendaActualizada = await actualizarVivienda(id, cambios)
await auditService.auditarActualizacion(
  'viviendas',
  id,
  viviendaAnterior,
  viviendaActualizada,
  { campos_modificados: Object.keys(cambios) }
)

// Al eliminar vivienda
const viviendaAEliminar = await obtenerVivienda(id)
await eliminarVivienda(id)
await auditService.auditarEliminacion('viviendas', id, viviendaAEliminar, {
  motivo: 'Solicitud de administrador'
})
```

---

## 🎨 UI de Auditoría

### 1. Vista de Historial de Registro

```typescript
// Componente: HistorialAuditoria.tsx
// Ubicación: Al lado de detalles de vivienda/cliente

<Card>
  <CardHeader>
    <h3>📜 Historial de Cambios</h3>
  </CardHeader>
  <CardContent>
    <Timeline>
      {historial.map(evento => (
        <TimelineItem key={evento.id}>
          <Badge>{evento.accion}</Badge>
          <p>{evento.usuario_email}</p>
          <small>{formatDate(evento.fecha_evento)}</small>

          {/* Mostrar cambios específicos */}
          {evento.cambios_especificos && (
            <div className="cambios">
              {Object.entries(evento.cambios_especificos).map(([campo, valores]) => (
                <div key={campo}>
                  <strong>{campo}:</strong>
                  <span className="text-red-500">{valores.antes}</span>
                  →
                  <span className="text-green-500">{valores.despues}</span>
                </div>
              ))}
            </div>
          )}
        </TimelineItem>
      ))}
    </Timeline>
  </CardContent>
</Card>
```

### 2. Dashboard de Administrador

```typescript
// Página: /admin/auditoria

<Page>
  <h1>🔍 Panel de Auditoría</h1>

  {/* Filtros */}
  <Filters>
    <Select label="Tabla" options={tablas} />
    <Select label="Acción" options={['CREATE', 'UPDATE', 'DELETE']} />
    <Select label="Usuario" options={usuarios} />
    <DateRangePicker label="Rango de fechas" />
  </Filters>

  {/* Tabla de eventos */}
  <DataTable
    columns={[
      'Fecha',
      'Usuario',
      'Tabla',
      'Acción',
      'Registro',
      'Cambios',
      'Detalles'
    ]}
    data={eventos}
  />
</Page>
```

---

## 📊 Reportes de Auditoría

### Reportes que puedes generar:

1. **Actividad por usuario**
   - Cuántas acciones realizó cada usuario
   - Qué tipo de acciones (más creaciones, ediciones, etc.)
   - Horarios de actividad

2. **Cambios por módulo**
   - Qué módulo tiene más movimiento
   - Identificar módulos críticos

3. **Detección de anomalías**
   - Eliminaciones masivas
   - Cambios fuera de horario laboral
   - Patrones sospechosos

4. **Cumplimiento legal**
   - Exportar audit trail completo
   - Demostrar integridad de datos
   - Respaldo ante auditorías externas

---

## 🚀 Plan de Implementación (Fases)

### Fase 1: Infraestructura (1-2 días)
- [ ] Crear tabla `audit_log`
- [ ] Crear servicio `audit.service.ts`
- [ ] Documentar uso

### Fase 2: Módulos Críticos (3-5 días)
- [ ] Auditar Viviendas (CRUD completo)
- [ ] Auditar Clientes (CRUD completo)
- [ ] Auditar Negociaciones (CRUD + cambios de estado)
- [ ] Auditar Abonos (CRUD completo)

### Fase 3: Módulos Secundarios (2-3 días)
- [ ] Auditar Proyectos
- [ ] Auditar Renuncias
- [ ] Auditar Usuarios

### Fase 4: UI de Consulta (2-3 días)
- [ ] Componente HistorialAuditoria
- [ ] Dashboard de administrador
- [ ] Filtros y búsqueda

### Fase 5: Reportes (2-3 días)
- [ ] Exportar a Excel/PDF
- [ ] Reportes predefinidos
- [ ] Alertas automáticas

---

## 💰 Costo vs Beneficio

### Costos:
- ⏱️ **Tiempo de desarrollo**: ~10-15 días
- 💾 **Almacenamiento**: ~2-5 MB por 1000 eventos (mínimo)
- 🔧 **Mantenimiento**: Bajo (automatizado)

### Beneficios:
- ✅ **Transparencia total** → Confianza del cliente
- ✅ **Protección legal** → Evidencia ante disputas
- ✅ **Detección temprana** → Prevenir fraudes
- ✅ **Análisis de procesos** → Optimizar flujos
- ✅ **Recuperación de datos** → Rollback si es necesario
- ✅ **Profesionalismo** → Imagen corporativa seria

---

## 🎯 Recomendación Final

**SÍ, DEBES IMPLEMENTARLO** por estas razones:

1. Tu aplicación maneja **dinero** (abonos, negociaciones) → Es crítico auditar
2. Múltiples usuarios con diferentes permisos → Necesitas trazabilidad
3. Datos financieros y legales → Puede ser requerido por ley
4. Profesionalismo → Los clientes serios lo esperan
5. Escalabilidad → Si crece tu empresa, ya lo tienes

**No es "demasiado restrictivo", es SER PROFESIONAL** ✅

---

## 📞 Siguiente Paso

¿Quieres que implemente:

**A)** La infraestructura base (tabla + servicio) primero?
**B)** Un módulo completo (ej: Viviendas) como ejemplo?
**C)** La versión con triggers de PostgreSQL (automática)?

Dime qué prefieres y empezamos 🚀
