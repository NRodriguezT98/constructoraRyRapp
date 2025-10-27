# 🔒 Sistema de Bloqueo de Pasos en Procesos

**Fecha:** 2025-10-27
**Versión:** 1.0

---

## 📋 Descripción General

El sistema de bloqueo de pasos garantiza que los usuarios sigan el orden correcto al diligenciar los pasos de un proceso de negociación. Si un paso tiene dependencias configuradas, permanecerá **bloqueado** hasta que todos los pasos dependientes se completen.

---

## 🎯 Funcionamiento

### 1. Configuración de Dependencias

En el **Panel de Administración** (`/admin/procesos`), al crear o editar una plantilla de proceso:

1. Expande un paso
2. En la sección **"Depende de (pasos previos)"**
3. Selecciona los pasos que deben completarse primero
4. Guarda la plantilla

**Ejemplo:**
```
Paso 1: Envío promesa compraventa
  └─ (sin dependencias)

Paso 2: Recibido promesa firmada
  └─ Depende de: Paso 1
  └─ Estado: BLOQUEADO hasta que Paso 1 se complete

Paso 3: Envío minuta notaría
  └─ Depende de: Paso 2
  └─ Estado: BLOQUEADO hasta que Paso 2 se complete
```

---

## 🔐 Estados de Bloqueo

### ✅ Paso Desbloqueado
- **Condición:** Todas las dependencias están completadas u omitidas
- **Visual:** Colores normales (gris pendiente, azul en proceso)
- **Acciones:** Puede iniciar, completar y subir documentos

### 🔒 Paso Bloqueado
- **Condición:** Al menos una dependencia está pendiente o en proceso
- **Visual:**
  - Badge gris con icono de candado: `🔒 Bloqueado`
  - Fondo con opacidad reducida (60%)
  - Cursor `not-allowed`
  - Icono de candado en el timeline dot
  - Mensaje informativo con lista de pasos pendientes
- **Acciones:**
  - ❌ NO se puede expandir
  - ❌ NO se puede iniciar
  - ❌ NO se puede completar
  - ❌ NO se pueden subir documentos

---

## 💻 Implementación Técnica

### Hook: `useProcesoNegociacion.ts`

#### Nueva función: `estaBloqueado()`
```typescript
const estaBloqueado = useCallback((paso: ProcesoNegociacion): boolean => {
  // Si ya está completado u omitido, no está bloqueado
  if (paso.estado === EstadoPaso.COMPLETADO || paso.estado === EstadoPaso.OMITIDO) {
    return false
  }

  // Verificar si tiene dependencias sin completar
  if (paso.dependeDe && paso.dependeDe.length > 0) {
    const dependencias = pasos.filter(p => paso.dependeDe?.includes(p.id))
    const todasCompletadas = dependencias.every(
      d => d.estado === EstadoPaso.COMPLETADO || d.estado === EstadoPaso.OMITIDO
    )

    return !todasCompletadas // Bloqueado si NO todas están completadas
  }

  return false // No está bloqueado si no tiene dependencias
}, [pasos])
```

#### Nueva función: `obtenerDependenciasIncompletas()`
```typescript
const obtenerDependenciasIncompletas = useCallback((paso: ProcesoNegociacion): ProcesoNegociacion[] => {
  if (!paso.dependeDe || paso.dependeDe.length === 0) {
    return []
  }

  return pasos.filter(p =>
    paso.dependeDe?.includes(p.id) &&
    p.estado !== EstadoPaso.COMPLETADO &&
    p.estado !== EstadoPaso.OMITIDO
  )
}, [pasos])
```

#### Mejora en `puedeCompletar()`
```typescript
const puedeCompletar = useCallback((paso: ProcesoNegociacion): boolean => {
  // Si está bloqueado por dependencias, no se puede completar
  if (estaBloqueado(paso)) {
    return false
  }

  // ... resto de validaciones (documentos, etc.)
}, [pasos, estaBloqueado])
```

---

### Componente: `timeline-proceso.tsx`

#### Props del PasoItem
```typescript
interface PasoItemProps {
  // ... props existentes
  estaBloqueado: boolean
  dependenciasIncompletas: ProcesoNegociacion[]
}
```

#### Visual del Paso Bloqueado
```tsx
// Badge de estado bloqueado
{isBloqueado && (
  <span className="px-2.5 py-1 rounded-full bg-gray-200 text-gray-600 text-xs font-medium flex items-center gap-1">
    <Lock className="w-3 h-3" />
    Bloqueado
  </span>
)}

// Mensaje informativo
{isBloqueado && dependenciasIncompletas.length > 0 && (
  <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
    <div className="flex items-start gap-2">
      <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
      <div className="text-sm text-amber-800">
        <p className="font-medium mb-1">Paso bloqueado</p>
        <p className="text-xs">Debes completar primero:</p>
        <ul className="mt-1 space-y-0.5">
          {dependenciasIncompletas.map(dep => (
            <li key={dep.id} className="text-xs">
              • Paso {dep.orden}: {dep.nombre}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
)}
```

#### Deshabilitación de Acciones
```tsx
// No expandir si está bloqueado
onClick={!isBloqueado ? onToggle : undefined}

// No mostrar contenido expandido si está bloqueado
{isExpanded && !isBloqueado && (
  // ... contenido ...
)}

// Deshabilitar upload de documentos
disabled={subiendoDoc === doc.id || isBloqueado}

// No mostrar botones de acción
{isPendiente && !isBloqueado && (
  <button>Iniciar Paso</button>
)}
```

---

## 📊 Flujo de Usuario

### Escenario: Proceso con 3 pasos secuenciales

1. **Inicial:**
   ```
   ✅ Paso 1: Envío promesa (disponible)
   🔒 Paso 2: Promesa firmada (bloqueado)
   🔒 Paso 3: Envío minuta (bloqueado)
   ```

2. **Usuario completa Paso 1:**
   ```
   ✓ Paso 1: Envío promesa (completado)
   ✅ Paso 2: Promesa firmada (desbloqueado automáticamente)
   🔒 Paso 3: Envío minuta (bloqueado)
   ```

3. **Usuario completa Paso 2:**
   ```
   ✓ Paso 1: Envío promesa (completado)
   ✓ Paso 2: Promesa firmada (completado)
   ✅ Paso 3: Envío minuta (desbloqueado automáticamente)
   ```

---

## ⚙️ Configuración en Base de Datos

### Tabla: `procesos_negociacion`

```sql
CREATE TABLE procesos_negociacion (
  id UUID PRIMARY KEY,
  negociacion_id UUID NOT NULL,
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  orden INTEGER NOT NULL,
  estado VARCHAR(20) DEFAULT 'Pendiente',

  -- Campo de dependencias
  depende_de TEXT[], -- Array de IDs de pasos previos requeridos

  -- ... otros campos
);
```

### Ejemplo de datos:
```sql
-- Paso 1: Sin dependencias
INSERT INTO procesos_negociacion (nombre, orden, depende_de)
VALUES ('Envío promesa', 1, NULL);

-- Paso 2: Depende del Paso 1
INSERT INTO procesos_negociacion (nombre, orden, depende_de)
VALUES ('Promesa firmada', 2, ARRAY['<id-paso-1>']);

-- Paso 3: Depende del Paso 2
INSERT INTO procesos_negociacion (nombre, orden, depende_de)
VALUES ('Envío minuta', 3, ARRAY['<id-paso-2>']);
```

---

## ✅ Ventajas del Sistema

1. **Orden Garantizado:** Los usuarios no pueden saltarse pasos
2. **Prevención de Errores:** Evita completar pasos fuera de secuencia
3. **Claridad Visual:** El usuario ve claramente qué debe hacer primero
4. **Flexibilidad:** Admite dependencias múltiples y ramificaciones
5. **UX Mejorada:** Mensajes informativos claros

---

## 🎨 Indicadores Visuales

| Estado | Icono | Badge | Color Dot | Opacidad |
|--------|-------|-------|-----------|----------|
| Pendiente | ○ Circle | Pendiente | Gris | 100% |
| En Proceso | ⏱ Clock | En Proceso | Azul pulsante | 100% |
| Completado | ✓ CheckCircle | Completado | Verde | 100% |
| Omitido | ✕ X | Omitido | Gris | 100% |
| **Bloqueado** | 🔒 **Lock** | **Bloqueado** | **Gris** | **60%** |

---

## 📝 Casos de Uso

### Caso 1: Dependencia Simple
```
Paso 2 depende del Paso 1
→ Paso 2 se desbloquea cuando Paso 1 se completa
```

### Caso 2: Dependencia Múltiple
```
Paso 4 depende de los Pasos 2 y 3
→ Paso 4 se desbloquea cuando AMBOS Pasos 2 y 3 se completan
```

### Caso 3: Cadena de Dependencias
```
Paso 2 depende de Paso 1
Paso 3 depende de Paso 2
Paso 4 depende de Paso 3
→ Flujo secuencial estricto
```

### Caso 4: Paso Omitido
```
Paso 2 depende de Paso 1
→ Si Paso 1 se OMITE (no se completa), Paso 2 también se desbloquea
```

---

## 🧪 Testing

### Pruebas Manuales

1. **Crear plantilla con dependencias:**
   - Ir a `/admin/procesos`
   - Crear plantilla con 3 pasos secuenciales
   - Paso 2 depende de Paso 1
   - Paso 3 depende de Paso 2

2. **Verificar bloqueo inicial:**
   - Ir a cliente con negociación activa
   - Tab "Actividad"
   - Verificar que Paso 2 y 3 muestran badge "🔒 Bloqueado"

3. **Verificar desbloqueo:**
   - Completar Paso 1
   - Verificar que Paso 2 se desbloquea automáticamente
   - Verificar que Paso 3 permanece bloqueado

4. **Verificar mensaje informativo:**
   - Paso bloqueado debe mostrar:
     - Badge "Bloqueado"
     - Mensaje: "Debes completar primero:"
     - Lista con nombres y números de pasos pendientes

---

## 🔄 Actualizaciones Futuras

### Posibles Mejoras:
- [ ] Dependencias condicionales (por fuente de pago)
- [ ] Dependencias temporales (X días después)
- [ ] Notificaciones cuando un paso se desbloquea
- [ ] Vista de grafo de dependencias
- [ ] Validación de dependencias circulares
- [ ] Historial de bloqueos/desbloqueos

---

## 📚 Referencias

- **Hook:** `src/modules/admin/procesos/hooks/useProcesoNegociacion.ts`
- **Componente:** `src/modules/admin/procesos/components/timeline-proceso.tsx`
- **Tipos:** `src/modules/admin/procesos/types/index.ts`
- **DB Schema:** `docs/DATABASE-SCHEMA-REFERENCE-ACTUALIZADO.md`

---

## 🆘 Troubleshooting

### Problema: Paso no se desbloquea después de completar dependencias
**Solución:** Refrescar la página o verificar que el estado del paso previo sea "Completado" u "Omitido"

### Problema: Paso bloqueado pero no tiene dependencias
**Solución:** Verificar en BD que `depende_de` no esté vacío. Si es `[]` o `NULL`, debería estar desbloqueado.

### Problema: No se puede subir documentos a paso bloqueado
**Solución:** Es el comportamiento esperado. Completar primero las dependencias.

---

**✅ Sistema implementado y funcional**
