# 📦 Storage

> Almacenamiento de archivos con [[Supabase]] Storage

---

## Relaciones

- Parte de → [[RyR Constructora]]
- Provisto por → [[Supabase]]
- Usado por → [[Documentos]], [[Abonos]], [[Viviendas]]
- Protegido por → RLS en [[Base de Datos]]

---

## Buckets

Los archivos se organizan en buckets de Supabase Storage.
Cada módulo tiene su propio service de storage:

- `documentos-storage.service.ts` → [[Documentos]]
- `abonos-storage.service.ts` → [[Abonos]]
- `documentos-vivienda.service.ts` → [[Viviendas]]

---

## Operaciones

| Operación | Service |
|-----------|---------|
| Upload | `*.storage.service.ts` |
| Download | URL pública/firmada |
| Delete | Solo admin ([[Admin Panel]]) |
| Replace | Con versionado ([[Documentos]]) |

#infraestructura #storage
