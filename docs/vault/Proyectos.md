# 🏗️ Proyectos

> Gestión de obras y proyectos de construcción
> **Color tema**: 🟢 Verde / Esmeralda / Teal
> **Ruta**: `/proyectos` → `/proyectos/[id]`

---

## Relaciones

- Pertenece a → [[RyR Constructora]]
- Contiene → [[Viviendas]]
- Genera → [[Documentos]]
- Registrado en → [[Auditorías]]

---

## Estructura del Módulo

```
src/modules/proyectos/
├── components/
│   ├── proyectos-page-main.tsx        ← Orquestador
│   ├── ProyectosHeaderPremium.tsx     ← Header con gradiente
│   ├── ProyectosMetricasPremium.tsx   ← 4 métricas KPI
│   ├── ProyectosFiltrosPremium.tsx    ← Filtros sticky
│   └── proyectos-card.tsx            ← Card de proyecto
├── hooks/
│   └── useProyectos.ts
├── services/
│   └── proyectos.service.ts
├── styles/
├── types/
├── utils/
└── constants/
```

---

## Servicios

| Servicio | Función |
|----------|---------|
| `proyectos.service.ts` | CRUD de proyectos en [[Supabase]] |

---

## Datos Clave

- **Tabla BD**: `proyectos`
- **Campos**: id, nombre, estado, ubicacion, presupuesto
- ⭐ **Este módulo es la PLANTILLA ESTÁNDAR** para crear otros módulos

---

## Referencia

- Este es el módulo modelo según [[Patrón de Módulos]]
- Usa [[Sistema de Theming]] con `moduleName="proyectos"`
- Consultar [[Separación de Responsabilidades]]

#módulo #core #proyectos
