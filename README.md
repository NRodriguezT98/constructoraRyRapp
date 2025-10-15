# 🏗️ RyR Constructora - Sistema de Gestión Administrativa

> Aplicación web moderna para la gestión administrativa de la constructora RyR

![Version](https://img.shields.io/badge/version-1.0.0--alpha-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-3.0-cyan)

## 📋 Descripción

Sistema integral de gestión administrativa desarrollado con Next.js 14, TypeScript y Supabase. Diseñado con arquitectura modular, separación de responsabilidades y enfoque en la experiencia del usuario.

## ✨ Características Principales

### Módulos Implementados
- ✅ **Proyectos**: Gestión completa de proyectos de construcción
- ⏳ **Viviendas**: Administración de viviendas por proyecto
- ⏳ **Clientes**: Base de datos de clientes
- ⏳ **Abonos**: Sistema de pagos y abonos
- ⏳ **Renuncias**: Gestión de renuncias
- ⏳ **Admin**: Panel de administración

### Funcionalidades
- 🎨 Diseño moderno con animaciones fluidas
- 🌓 Modo oscuro/claro
- 📱 Responsive design (mobile, tablet, desktop)
- 🔍 Búsqueda y filtros avanzados
- 📊 Vistas múltiples (grid, lista)
- 💾 Persistencia de preferencias
- 🎯 Estados visuales (loading, empty, error)
- ⚡ Sincronización en tiempo real (Supabase)

## 🚀 Stack Tecnológico

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) v3
- **Animaciones**: [Framer Motion](https://www.framer.com/motion/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Iconos**: [Lucide React](https://lucide.dev/)
- **Temas**: [next-themes](https://github.com/pacocoursey/next-themes)

### Estado y Formularios
- **Estado Global**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Formularios**: [React Hook Form](https://react-hook-form.com/)
- **Validación**: [Zod](https://zod.dev/)
- **Fechas**: [date-fns](https://date-fns.org/)

### Backend
- **BaaS**: [Supabase](https://supabase.com/)
- **Database**: PostgreSQL
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **Realtime**: Supabase Realtime

## 📦 Instalación

### Requisitos Previos
- Node.js 18+ 
- npm o yarn

### Pasos

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd constructoraRyR-app
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env.local
```

Editar `.env.local` con tus credenciales de Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Iniciar servidor de desarrollo**
```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## 🏗️ Arquitectura

El proyecto sigue una **arquitectura modular** con separación clara de responsabilidades:

```
src/
├── shared/          # Recursos compartidos (hooks, utils, types)
└── modules/         # Módulos de la aplicación
    └── [modulo]/
        ├── components/   # UI específica
        ├── hooks/        # Lógica de negocio
        ├── services/     # API/DB operations
        ├── store/        # Estado (Zustand)
        ├── types/        # Tipos TypeScript
        ├── constants/    # Configuración
        └── styles/       # Estilos/animaciones
```

### Documentación Detallada
- 📐 [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitectura completa
- 📋 [MODULE_TEMPLATE.md](./MODULE_TEMPLATE.md) - Template para nuevos módulos
- 🌍 [SHARED_INFRASTRUCTURE.md](./SHARED_INFRASTRUCTURE.md) - Recursos compartidos
- 📊 [PROJECT_INDEX.md](./PROJECT_INDEX.md) - Índice general del proyecto

## 📁 Estructura del Proyecto

```
constructoraRyR-app/
├── app/                    # Next.js App Router
│   ├── (dashboard)/       # Rutas protegidas
│   └── page.tsx          # Landing page
│
├── src/
│   ├── shared/           # ✅ Infraestructura compartida
│   │   ├── hooks/           # 6 custom hooks
│   │   ├── constants/       # 50+ constantes
│   │   ├── types/           # Tipos comunes
│   │   ├── utils/           # 30+ utilidades
│   │   ├── styles/          # Animaciones y clases
│   │   └── components/      # Componentes UI
│   │
│   └── modules/          # Módulos de la app
│       └── proyectos/       # ✅ Ejemplo completo
│
├── components/           # Components legacy (migrar)
├── lib/                 # Configuraciones
└── public/             # Assets estáticos
```

## 🎯 Guía de Uso

### Crear un Nuevo Módulo

1. Seguir el template en [MODULE_TEMPLATE.md](./MODULE_TEMPLATE.md)
2. Copiar estructura de `src/modules/proyectos/`
3. Adaptar tipos y lógica específica
4. Crear página en `app/(dashboard)/[modulo]/page.tsx`

### Usar Recursos Compartidos

```typescript
import { 
  // Hooks
  useDebounce,
  useLocalStorage,
  useIsMobile,
  
  // Utils
  formatCurrency,
  isValidEmail,
  
  // Components
  LoadingSpinner,
  EmptyState,
  Modal,
  
  // Constants
  ROUTES,
  ERROR,
  SUCCESS,
  
  // Types
  type ApiResponse
} from '@/shared'
```

Ver [src/shared/README.md](./src/shared/README.md) para documentación completa.

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

## 🚀 Deployment

### Vercel (Recomendado)

1. Push a GitHub
2. Importar proyecto en [Vercel](https://vercel.com)
3. Configurar variables de entorno
4. Deploy automático

### Build Manual

```bash
npm run build
npm run start
```

## 📊 Progreso del Proyecto

| Módulo | Estado | Progreso |
|--------|--------|----------|
| Shared Infrastructure | ✅ Completo | 100% |
| Proyectos | ✅ Completo | 100% |
| Viviendas | ⏳ Pendiente | 0% |
| Clientes | ⏳ Pendiente | 0% |
| Abonos | ⏳ Pendiente | 0% |
| Renuncias | ⏳ Pendiente | 0% |
| Admin Panel | ⏳ Pendiente | 0% |

## 🎨 Capturas de Pantalla

_(Agregar capturas cuando esté en producción)_

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

### Convenciones
- Seguir [ARCHITECTURE.md](./ARCHITECTURE.md) para estructura
- TypeScript estricto
- Prettier para formateo
- ESLint para linting

## 📝 Scripts Disponibles

```bash
npm run dev          # Desarrollo (puerto 3000)
npm run build        # Build producción
npm run start        # Servidor producción
npm run lint         # Linter
npm run format       # Prettier
```

## 🔐 Seguridad

- Autenticación con Supabase Auth
- Row Level Security (RLS) en base de datos
- Validación de inputs con Zod
- HTTPS en producción
- Variables de entorno seguras

## 📈 Performance

- Server Components por defecto
- Code splitting automático
- Lazy loading de componentes
- Optimización de imágenes (Next.js Image)
- Caching estratégico

## 🐛 Troubleshooting

### Puerto 3000 en uso
```bash
# Cambiar puerto
npm run dev -- -p 3001
```

### Errores de TypeScript
```bash
# Limpiar caché
rm -rf .next
npm run dev
```

### Problemas de dependencias
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📚 Recursos

### Documentación Interna
- [Arquitectura](./ARCHITECTURE.md)
- [Template de Módulos](./MODULE_TEMPLATE.md)
- [Shared Resources](./src/shared/README.md)
- [Índice del Proyecto](./PROJECT_INDEX.md)

### Documentación Externa
- [Next.js Docs](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Framer Motion](https://www.framer.com/motion/)

## 📄 Licencia

Privado - RyR Constructora © 2025

## 👥 Equipo

**Desarrollo**: Equipo RyR  
**Versión**: 1.0.0-alpha  
**Última actualización**: Enero 2025

---

## 🎉 Estado Actual

```
✅ Infraestructura Compartida - COMPLETA
✅ Módulo Proyectos - COMPLETO
⏳ Módulos Restantes - EN ESPERA
🚀 Listo para desarrollo de nuevos módulos
```

---

**¿Necesitas ayuda?** Consulta la [documentación](./ARCHITECTURE.md) o abre un issue.

**¿Quieres contribuir?** Lee la guía de [contribución](#-contribución).