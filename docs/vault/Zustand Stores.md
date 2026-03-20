# 🐻 Zustand Stores

> Estado global ligero para módulos específicos

---

## Relaciones

- Parte de → [[Stack Tecnológico]]
- Usado por → [[Documentos]], [[Clientes]]
- Complementa → [[React Query]]

---

## Stores Existentes

| Store | Módulo | Ubicación |
|-------|--------|-----------|
| `documentos.store.ts` | [[Documentos]] | `src/modules/documentos/store/` |
| `documentos-cliente.store.ts` | [[Clientes]] | `src/modules/clientes/documentos/store/` |

---

## Cuándo usar Zustand vs React Query

| Zustand | [[React Query]] |
|---------|-------------|
| Estado UI local/global | Datos del servidor |
| Modales, filtros, selección | Queries, mutations, cache |
| Sincrónico | Asincrónico |

#infraestructura #estado
