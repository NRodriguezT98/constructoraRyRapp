# 📄 Documentos

> Gestión documental completa con versionado y categorías
> **Color tema**: 🔴 Rojo / Rosa / Pink
> **Ruta**: `/documentos`

---

## Relaciones

- Pertenece a → [[RyR Constructora]]
- Asociado a → [[Proyectos]], [[Viviendas]], [[Clientes]]
- Requerido por → [[Fuentes de Pago]]
- Almacenado en → [[Storage]]
- Registrado en → [[Auditorías]]
- Parte del → [[Flujo de Documentos]]

---

## Estructura del Módulo

```
src/modules/documentos/
├── components/
│   └── modals/
│       ├── DocumentoReemplazarArchivoModal.tsx
│       └── DocumentoReemplazarArchivoModal.styles.ts
├── hooks/
├── services/  (8 servicios)
│   ├── documentos.service.ts
│   ├── documentos-versiones.service.ts
│   ├── documentos-reemplazo.service.ts
│   ├── documentos-storage.service.ts
│   ├── documentos-estados.service.ts
│   ├── documentos-eliminacion.service.ts
│   ├── categorias.service.ts
│   └── documentos-base.service.ts
├── schemas/
├── store/documentos.store.ts  ← [[Zustand Stores]]
├── styles/
├── types/
├── utils/
└── constants/
```

---

## Servicios (8)

| Servicio | Función |
|----------|---------|
| `documentos.service.ts` | CRUD principal |
| `documentos-versiones.service.ts` | Sistema de versionado |
| `documentos-reemplazo.service.ts` | Reemplazo de archivos |
| `documentos-storage.service.ts` | Upload/download [[Storage]] |
| `documentos-estados.service.ts` | Gestión de estados |
| `documentos-eliminacion.service.ts` | Eliminación segura |
| `categorias.service.ts` | Categorías de docs |

---

## Funcionalidades Clave

- **Versionado**: Cada documento mantiene historial de versiones
- **Categorías**: Sistema de categorías configurables desde [[Admin Panel]]
- **Pendientes**: Vista `vista_documentos_pendientes_fuentes` calcula en tiempo real
- **Vinculación automática**: Al subir, detecta y vincula con [[Fuentes de Pago]]
- **Eliminación**: Solo administradores (ver [[Admin Panel]])

---

## Datos Clave

- **Tabla BD**: `documentos_proyecto` (NO `documentos`)
- **Campos**: id, titulo, categoria, url_storage, fecha_documento
- **Versiones**: tabla `versiones_documento`
- **Store**: [[Zustand Stores]] `documentos.store.ts`

#módulo #soporte #documentos
