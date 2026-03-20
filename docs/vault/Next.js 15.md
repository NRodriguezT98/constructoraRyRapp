# ⚛️ Next.js 15

> Framework React con App Router, SSR y Turbopack

---

## Relaciones

- Framework principal de → [[RyR Constructora]]
- Parte del → [[Stack Tecnológico]]
- Integra → [[Supabase]] via SSR
- Integra → [[Autenticación]] via middleware

---

## Características Usadas

- **App Router** (`src/app/`) → Rutas basadas en archivos
- **Server Components** → Rendering server-side
- **Middleware** → Verificación de auth
- **Turbopack** → Dev server rápido (`next dev --turbo`)
- **Route Groups** → `(dashboard)` para layouts

---

## Estructura de Rutas

```
src/app/
├── (dashboard)/layout.tsx  → Layout principal
├── login/                  → [[Autenticación]]
├── proyectos/             → [[Proyectos]]
├── viviendas/             → [[Viviendas]]
├── clientes/              → [[Clientes]]
├── abonos/                → [[Abonos]]
├── auditorias/            → [[Auditorías]]
├── documentos/            → [[Documentos]]
├── admin/                 → [[Admin Panel]]
└── reportes/              → [[Reportes]]
```

#tecnología #frontend
