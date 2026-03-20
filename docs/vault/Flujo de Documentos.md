# 📄 Flujo de Documentos

> Ciclo de vida completo de un documento en el sistema

---

## Relaciones

- Parte de → [[RyR Constructora]]
- Módulo → [[Documentos]]
- Almacenado en → [[Storage]]
- Trazado en → [[Auditorías]]

---

## Ciclo de Vida

```mermaid
flowchart TD
    A[📤 Subida] --> B[Sanitización de metadata]
    B --> C[Upload a Storage]
    C --> D[Insert en BD]
    D --> E{¿Doc pendiente existe?}

    E -->|Sí| F[🔗 Vinculación automática]
    F --> G[Eliminar pendiente]
    E -->|No| H[Registro normal]

    G & H --> I[📄 Documento activo v1]

    I --> J{¿Necesita actualización?}
    J -->|Sí| K[Reemplazo]
    K --> L[Nueva versión v2+]
    L --> M[Audit log registrado]
    M --> I

    J -->|No| N{¿Eliminar?}
    N -->|Solo Admin| O[🗑️ Eliminación segura]
    O --> P[Audit log registrado]
```

---

## Componentes Clave

- **Documentos pendientes**: Vista SQL calcula en tiempo real
- **Versionado**: Historial completo de cada documento
- **Reemplazo**: Modal genérico con [[Sistema de Theming]]
- **Eliminación**: Solo desde [[Admin Panel]]
- **Auditoría**: Toda acción queda en [[Auditorías]]

#flujo #documentos
