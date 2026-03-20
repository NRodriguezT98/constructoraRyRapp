# 📦 Patrón de Módulos

> Estructura estándar que todo módulo DEBE seguir
> Basado en [[Proyectos]] como plantilla de referencia

---

## Relaciones

- Define estructura de → Todos los módulos en [[RyR Constructora]]
- Aplica → [[Separación de Responsabilidades]]
- Referencia → [[Proyectos]] (plantilla)

---

## Estructura Obligatoria

```
src/modules/[modulo]/
├── components/
│   ├── [Componente].tsx         ← UI pura (< 150 líneas)
│   ├── [Componente].styles.ts   ← Estilos Tailwind
│   ├── modals/                  ← Diálogos
│   ├── tabs/                    ← Pestañas
│   └── index.ts                 ← Barrel export
├── hooks/
│   ├── use[Modulo].ts           ← Lógica principal
│   ├── use[Componente].ts       ← Lógica específica
│   └── index.ts
├── services/
│   └── [modulo].service.ts      ← Llamadas a [[Supabase]]
├── types/
│   └── index.ts                 ← Interfaces TypeScript
├── utils/
│   └── sanitize.utils.ts        ← Sanitización
├── styles/
├── store/                       ← [[Zustand Stores]] (opcional)
└── constants/
```

---

## Límites Estrictos

| Archivo | Máximo líneas |
|---------|--------------|
| Componente `.tsx` | 150 |
| Hook `use*.ts` | 200 |
| Service `.service.ts` | 300 |
| String Tailwind inline | 80 caracteres |

---

## Regla de Oro

> Si dudas "¿esto va en componente o hook?" → **SIEMPRE en el hook**

Ver [[Separación de Responsabilidades]] para detalles completos.

#arquitectura #patrón
