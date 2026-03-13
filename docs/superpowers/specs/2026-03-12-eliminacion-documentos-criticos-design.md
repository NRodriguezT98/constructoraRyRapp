# Spec: Eliminación Segura de Documentos Críticos + Bug Fix Versionado

**Fecha:** 2026-03-12
**Estado:** Aprobado
**Alcance:** Módulo de Documentos (clientes)

---

## Problema

Tres issues independientes relacionados con el ciclo de vida de documentos que son requisitos obligatorios para desembolso (ej: Carta de Aprobación de Crédito Hipotecario):

1. **No existe modal de confirmación al eliminar** — el sistema elimina sin advertencia, sin contexto.
2. **`crearNuevaVersion` no propaga `fuente_pago_relacionada` ni `tipo_documento`** — la nueva versión queda "flotando": existe en BD pero la vista `vista_documentos_pendientes_fuentes` no la encuentra porque el JOIN falla, y el pendiente reaparece aunque el documento esté subido.
3. **`useEliminarDocumento` es un stub vacío** — no implementa lógica real, varios componentes usan `window.confirm()` nativo como workaround.

---

## Decisiones de Diseño

### Eliminación: cascada total
Al eliminar un documento, **todas sus versiones** (mismo `documento_padre_id`) pasan a estado `'eliminado'`. No hay eliminación parcial por versión desde este flujo — eso corresponde al panel Admin de papelera.

Razón: semánticamente correcto para documentos con peso legal. Si la carta de aprobación se elimina, el requisito queda sin cubrir sin ambigüedad.

### Nueva versión hereda campos críticos
La carta de ratificación (v2) se sube usando "Nueva Versión" sobre la carta de aprobación (v1). El `tipo_documento` se hereda del original, por lo que el sistema reconoce que el requisito sigue cubierto. El `titulo` puede cambiarse para reflejar el nombre real del documento nuevo. No se crea un requisito separado en `requisitos_fuentes_pago_config` para la ratificación.

### Detección de documento crítico: dos señales
Un documento es considerado "crítico" si cumple al menos una de estas condiciones:
1. `documento.fuente_pago_relacionada IS NOT NULL` — señal directa, ya vinculado a una fuente.
2. `documento.tipo_documento` coincide con `requisitos_fuentes_pago_config.tipo_documento_sugerido WHERE activo = true` — detección por tipo.

La consulta de detección es un `count` mínimo, se ejecuta solo al abrir el modal.

---

## Arquitectura (Opción C)

```
useEliminarDocumento (hook)
    ├── detectarSiEsCritico(documento) → bool + entidad
    ├── abrirConfirmacion(documento)   → calcula variant + mensaje
    ├── ejecutarEliminacion()          → llama DocumentosEliminacionService
    └── estado: { confirmacionAbierta, esDocumentoCritico, entidadAfectada, eliminando }

useDocumentoCard (existente, modificado)
    └── consume useEliminarDocumento
    └── renderiza ConfirmacionModal con props dinámicas

ConfirmacionModal (existente, reutilizado sin cambios)
    ├── variant="danger"   → doc normal
    └── variant="warning"  → doc crítico

[Bug fix]
documentos-versiones.service.ts → crearNuevaVersion
    └── insertData ahora incluye fuente_pago_relacionada + tipo_documento del original
```

---

## Comportamiento del Modal

### Caso A — Documento normal
```
Variante:  danger (rojo)
Título:    ¿Eliminar documento?
Mensaje:   Esta acción moverá el documento y todas sus versiones a la papelera.
           Puede recuperarlo desde el panel de administración.
Botón:     Sí, eliminar
```

### Caso B — Documento crítico (es requisito de desembolso)
```
Variante:  warning (ámbar)
Título:    ¿Eliminar documento crítico?
Mensaje:   Este documento es un requisito obligatorio para el desembolso de [entidad].
           Al eliminarlo, quedará registrado como pendiente nuevamente y deberás
           subir uno nuevo para continuar el proceso.

           ⚠️  Todas las versiones (N en total) serán movidas a la papelera.
Botón:     Entiendo, eliminar de todas formas
```

---

## Archivos Afectados

| Archivo | Tipo de cambio |
|---------|----------------|
| `src/modules/documentos/hooks/useEliminarDocumento.ts` | Reemplazar stub → implementación real |
| `src/modules/documentos/hooks/useDocumentoCard.ts` | Añadir wiring con useEliminarDocumento |
| `src/modules/documentos/services/documentos-versiones.service.ts` | Propagar `fuente_pago_relacionada` y `tipo_documento` en `crearNuevaVersion` |
| `src/modules/clientes/components/documentos/seccion-documentos-identidad.tsx` | Migrar `window.confirm()` → hook |

---

## Lo que NO cambia

- `ConfirmacionModal` — se reutiliza sin modificaciones.
- `DocumentosEliminacionService.eliminarDocumento` — la lógica de cascada ya existe y es correcta.
- `vista_documentos_pendientes_fuentes` — el pendiente reaparece automáticamente porque filtra `dc.estado = 'activo'`.
- Schema de BD — sin nuevas tablas ni migraciones.
- `requisitos_fuentes_pago_config` — no se añaden entradas para "Carta de Ratificación".

---

## Flujo de Versionado: Carta de Aprobación → Carta de Ratificación

```
v1  titulo: "Carta de Aprobación Bancolombia"
    tipo_documento: "Carta de Aprobación"      ← satisface requisito
    fuente_pago_relacionada: <uuid fuente>

v2  titulo: "Carta de Ratificación Bancolombia"  ← nombre actualizado por usuario
    tipo_documento: "Carta de Aprobación"         ← heredado del original (bug fix)
    fuente_pago_relacionada: <uuid fuente>         ← heredado del original (bug fix)
```

La vista encuentra v2 por el JOIN en `tipo_documento` y `fuente_pago_relacionada`. El requisito sigue cubierto. El historial muestra ambas versiones con sus nombres reales.
