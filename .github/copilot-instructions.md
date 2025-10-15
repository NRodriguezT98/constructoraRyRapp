# RyR Constructora - Sistema de Gestión Administrativa

## 🎯 PRINCIPIOS FUNDAMENTALES (APLICAR SIEMPRE)

### ⚠️ REGLA DE ORO: SEPARACIÓN DE RESPONSABILIDADES

**NUNCA mezclar lógica con UI. SIEMPRE separar en:**

1. **Hooks** (`use*.ts`) → Lógica de negocio
2. **Componentes** (`*.tsx`) → UI presentacional pura
3. **Estilos** (`*.styles.ts`) → Clases de Tailwind centralizadas
4. **Servicios** (`*.service.ts`) → Lógica de API/DB
5. **Stores** (`*.store.ts`) → Estado global

---

## 📁 Estructura OBLIGATORIA de Módulos

Al crear cualquier módulo nuevo, SEGUIR esta estructura:

```
src/modules/[nombre-modulo]/
├── components/
│   ├── [componente].tsx              # UI presentacional
│   ├── [componente].styles.ts        # Estilos centralizados
│   ├── tabs/                         # Si usa tabs
│   │   ├── [nombre]-tab.tsx
│   │   └── index.ts                  # Barrel export
│   └── index.ts                      # Barrel export
├── hooks/
│   ├── use[Modulo].ts                # Hook principal
│   ├── use[Componente].ts            # Hook por componente
│   └── index.ts                      # Barrel export
├── services/
│   └── [nombre].service.ts           # API/DB logic
├── store/
│   └── [nombre].store.ts             # Zustand store
├── types/
│   └── index.ts                      # TypeScript types
├── styles/
│   ├── classes.ts                    # Shared styles
│   ├── animations.ts                 # Framer Motion
│   └── index.ts                      # Barrel export
└── README.md                         # Módulo docs
```

**Referencia**: Ver `src/modules/proyectos/` como ejemplo perfecto

---

## ✅ Checklist OBLIGATORIO por Componente

- [ ] Lógica en hook separado (`use*.ts`)
- [ ] Estilos en `.styles.ts` (no strings largos inline)
- [ ] Componente < 150 líneas
- [ ] `useMemo` para valores calculados
- [ ] `useCallback` para funciones como props
- [ ] Tipos TypeScript estrictos (no `any`)
- [ ] Imports organizados (React → Next → External → Shared → Local → Hooks → Services → Types → Styles)
- [ ] Barrel export (`index.ts`) en carpeta

---

## 🚫 PROHIBIDO

❌ Lógica en componentes (useState, useEffect con lógica compleja)
❌ Strings de Tailwind > 100 caracteres inline
❌ Componentes > 150 líneas
❌ Usar `any` en TypeScript
❌ Duplicar código (extraer a shared/)

---

## ✅ REQUERIDO

✅ Hook personalizado por componente con lógica
✅ Archivo `.styles.ts` con estilos centralizados
✅ Barrel exports (`index.ts`) en cada carpeta
✅ Componentes presentacionales puros
✅ Tipos TypeScript estrictos

---

## 📚 Documentación Completa

- **Guía de estilos**: `docs/GUIA-ESTILOS.md`
- **Template de módulo**: `MODULE_TEMPLATE.md`
- **Arquitectura**: `ARCHITECTURE.md`

---

## Descripción del Proyecto

Aplicación web moderna para la gestión administrativa de la constructora RyR, desarrollada con Next.js 15, TypeScript, Supabase y Tailwind CSS.

## Funcionalidades Principales

- Gestión de proyectos de construcción
- Sistema de documentos con categorías personalizables
- Administración de viviendas
- Gestión de clientes
- Sistema de abonos y pagos
- Manejo de renuncias
- Panel de administración completo
- Sistema de auditoría y reportes
- Versionado de documentos
- Sincronización de datos en tiempo real

## Stack Tecnológico

- **Frontend**: Next.js 15 con App Router
- **Lenguaje**: TypeScript 5.9
- **Styling**: Tailwind CSS 3
- **Base de datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Storage**: Supabase Storage
- **UI Components**: Radix UI + shadcn/ui
- **Animaciones**: Framer Motion
- **Formularios**: React Hook Form + Zod
- **Estado**: Zustand
- **Validación**: Zod

## Estructura del Proyecto (Actualizada)

```
constructoraRyR-app/
├── app/                    # Next.js App Router
├── src/
│   ├── modules/           # Módulos separados por dominio
│   │   ├── proyectos/    # ✅ REFACTORIZADO (ejemplo perfecto)
│   │   └── documentos/   # ✅ Sistema completo
│   ├── shared/            # Recursos compartidos
│   ├── components/        # Componentes globales
│   ├── contexts/          # Contextos React
│   ├── services/          # Servicios globales
│   └── lib/              # Utilidades y configuraciones
├── docs/                  # Documentación
└── supabase/              # SQL scripts
```

## Características de Desarrollo

- Interfaz responsiva y moderna
- Navegación instantánea entre módulos
- Animaciones fluidas con Framer Motion
- Sincronización en tiempo real con Supabase
- Sistema de versionado para auditoría
- Carga optimizada de datos
- **Separación estricta de responsabilidades**
- **Código limpio y mantenible**
- **Hooks personalizados por componente**
- **Estilos centralizados**
