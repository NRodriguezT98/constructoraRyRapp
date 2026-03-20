# ⚖️ Separación de Responsabilidades

> Regla INVIOLABLE del proyecto [[RyR Constructora]]

---

## Relaciones

- Regla core de → [[RyR Constructora]]
- Aplicada en → [[Patrón de Módulos]]
- Define → [[Capas de la Aplicación]]

---

## Las 5 Separaciones

| Capa | Archivo | Responsabilidad | Máx líneas |
|------|---------|----------------|-----------|
| UI | `*.tsx` | Solo renderizar | 150 |
| Lógica | `use*.ts` | useState, useEffect, cálculos | 200 |
| Estilos | `*.styles.ts` | Clases [[Tailwind CSS]] | Sin límite |
| Datos | `*.service.ts` | Llamadas a [[Supabase]] | 300 |
| Estado | `*.store.ts` | [[Zustand Stores]] global | — |

---

## Prohibido en Componentes

- ❌ `useState` con lógica compleja → Mover a hook
- ❌ `useEffect` con fetch → Mover a hook + service
- ❌ `supabase.from('tabla')` → Mover a service
- ❌ Cálculos/transformaciones → Mover a hook con `useMemo`
- ❌ Strings Tailwind > 80 chars → Mover a `.styles.ts`

---

## Regla de Oro

> Si dudas "¿componente o hook?" → **SIEMPRE en el hook**

#arquitectura #regla
