# 🔍 Auditorías

> Trazabilidad completa de cambios y acciones del sistema
> **Color tema**: 🟣 Azul / Índigo / Púrpura
> **Ruta**: `/auditorias`

---

## Relaciones

- Pertenece a → [[RyR Constructora]]
- Registra cambios de → [[Proyectos]], [[Viviendas]], [[Clientes]]
- Registra cambios de → [[Negociaciones]], [[Fuentes de Pago]], [[Abonos]]
- Registra cambios de → [[Documentos]]
- Vinculado a → [[Usuarios]]

---

## Estructura del Módulo

```
src/modules/auditorias/
├── components/
│   ├── sections/
│   │   ├── AuditoriaHeader.tsx
│   │   ├── AuditoriaEstado.tsx
│   │   └── AuditoriaMetadata.tsx
│   ├── renderers/          ← Factory Pattern
│   │   ├── proyectos/
│   │   │   ├── CreacionProyectoRenderer.tsx
│   │   │   └── ActualizacionProyectoRenderer.tsx
│   │   ├── shared/
│   │   │   └── RendererGenerico.tsx
│   │   └── index.ts        ← Registry
│   └── DetalleAuditoriaModal.tsx
├── hooks/
├── services/
│   └── auditorias.service.ts
├── styles/
├── types/
└── utils/
```

---

## Arquitectura: Factory Pattern

Los renderers se registran en un mapa y se resuelven dinámicamente:

```
RENDERERS_MAP = {
  proyectos: { CREATE: CreacionProyectoRenderer, UPDATE: ... },
  viviendas: { CREATE: ..., UPDATE: ... },
  ...
}
```

---

## Datos Clave

- **Tabla BD**: `audit_log`
- **Campos**: id, usuario_id, accion, modulo, metadata (JSONB)
- **Servicios globales**: `src/services/audit.service.ts`, `audit-log.service.ts`
- Renderers específicos por módulo y acción

#módulo #soporte #auditorías
