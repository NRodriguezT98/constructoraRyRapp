# 🏗️ RyR Constructora

> Sistema de Gestión Administrativa para Constructora RyR
> **Stack**: [[Next.js 15]] + [[TypeScript]] + [[Supabase]] + [[Tailwind CSS]]

---

## 🧩 Módulos del Sistema

### Core
- [[Proyectos]] — Gestión de obras de construcción
- [[Viviendas]] — Administración de propiedades/lotes
- [[Clientes]] — Gestión integral de clientes

### Financiero
- [[Negociaciones]] — Acuerdos comerciales cliente-vivienda
- [[Fuentes de Pago]] — Financiamiento (créditos, subsidios, cuotas)
- [[Abonos]] — Registro de pagos y cuotas
- [[Requisitos de Fuentes]] — Documentos requeridos por fuente

### Soporte
- [[Documentos]] — Gestión documental con versionado
- [[Auditorías]] — Trazabilidad y logs de cambios
- [[Reportes]] — Informes y estadísticas

### Administración
- [[Admin Panel]] — Configuración del sistema
- [[Usuarios]] — Gestión de usuarios y roles
- [[Configuración]] — Entidades financieras, tipos, plantillas

---

## 🏛️ Arquitectura

- [[Arquitectura General]]
- [[Stack Tecnológico]]
- [[Patrón de Módulos]]
- [[Capas de la Aplicación]]
- [[Separación de Responsabilidades]]

---

## 🔧 Infraestructura

- [[Autenticación]]
- [[Base de Datos]]
- [[Storage]]
- [[Sistema de Theming]]
- [[React Query]]
- [[Zustand Stores]]

---

## 🔄 Flujos

- [[Flujo de Negociación]]
- [[Flujo de Documentos]]
- [[Flujo CRUD]]

---

## 📂 Estructura de Archivos

```
src/
├── app/              → Rutas Next.js (App Router)
├── modules/          → 12 módulos domain-driven
├── shared/           → Componentes y hooks reutilizables
├── components/       → Componentes globales
├── contexts/         → Auth, UnsavedChanges
├── services/         → Audit service global
└── lib/              → Supabase, utils, validations
```

---

#índice #arquitectura #ryr
