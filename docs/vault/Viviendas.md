# 🏠 Viviendas

> Administración de propiedades, lotes y manzanas
> **Color tema**: 🟠 Naranja / Ámbar / Amarillo
> **Ruta**: `/viviendas` → `/viviendas/nueva` → `/viviendas/[slug]`

---

## Relaciones

- Pertenece a → [[RyR Constructora]]
- Contenida en → [[Proyectos]]
- Asignada en → [[Negociaciones]]
- Genera → [[Documentos]]
- Registrado en → [[Auditorías]]

---

## Estructura del Módulo

```
src/modules/viviendas/
├── components/
├── hooks/
├── services/
│   ├── viviendas.service.ts
│   ├── vivienda-validation.service.ts
│   ├── viviendas-validacion.service.ts
│   ├── viviendas-conflictos.service.ts
│   ├── viviendas-inactivacion.service.ts
│   └── documentos-vivienda.service.ts
├── styles/
├── types/
├── utils/
├── constants/
└── schemas/
```

---

## Servicios (7)

| Servicio | Función |
|----------|---------|
| `viviendas.service.ts` | CRUD principal |
| `vivienda-validation.service.ts` | Validación de datos |
| `viviendas-conflictos.service.ts` | Detección de conflictos |
| `viviendas-inactivacion.service.ts` | Lógica de inactivación |
| `documentos-vivienda.service.ts` | Documentos asociados |

---

## Datos Clave

- **Tabla BD**: `viviendas`
- **Campos**: id, proyecto_id, manzana, numero_lote, estado, valor_base
- **Estados**: Disponible, Asignada, Escriturada, Inactiva
- Usa [[Storage]] para documentos de vivienda

---

## Referencia

- Usa [[Sistema de Theming]] con `moduleName="viviendas"`
- Sigue [[Patrón de Módulos]] basado en [[Proyectos]]
- Validación con [[Zod]]

#módulo #core #viviendas
