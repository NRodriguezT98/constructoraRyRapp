# 🎨 Sistema de Theming

> Colores dinámicos por módulo usando `moduleThemes`

---

## Relaciones

- Parte de → [[RyR Constructora]]
- Configura → [[Proyectos]], [[Viviendas]], [[Clientes]], [[Negociaciones]], [[Abonos]], [[Documentos]], [[Auditorías]]
- Archivo → `src/shared/config/module-themes.ts`

---

## Paleta de Colores

| Módulo | Colores | Gradiente |
|--------|---------|-----------|
| [[Proyectos]] | 🟢 Verde/Esmeralda/Teal | `from-green-600 via-emerald-600 to-teal-600` |
| [[Viviendas]] | 🟠 Naranja/Ámbar/Amarillo | `from-orange-600 via-amber-600 to-yellow-600` |
| [[Clientes]] | 🔵 Cyan/Azul/Índigo | `from-cyan-600 via-blue-600 to-indigo-600` |
| [[Negociaciones]] | 🟣 Rosa/Púrpura/Índigo | `from-pink-600 via-purple-600 to-indigo-600` |
| [[Abonos]] | 🔵 Azul/Índigo/Púrpura | `from-blue-600 via-indigo-600 to-purple-600` |
| [[Documentos]] | 🔴 Rojo/Rosa/Pink | `from-red-600 via-rose-600 to-pink-600` |
| [[Auditorías]] | 🟣 Azul/Índigo/Púrpura | `from-blue-600 via-indigo-600 to-purple-600` |

---

## Uso

```tsx
import { moduleThemes, type ModuleName } from '@/shared/config/module-themes'

// En componentes genéricos
<MiComponente moduleName="proyectos" />   // → Verde
<MiComponente moduleName="viviendas" />   // → Naranja
<MiComponente moduleName="clientes" />    // → Cyan
```

---

## Regla

> ❌ NUNCA hardcodear colores en componentes compartidos
> ✅ SIEMPRE usar `moduleThemes[moduleName]`

#infraestructura #theming
