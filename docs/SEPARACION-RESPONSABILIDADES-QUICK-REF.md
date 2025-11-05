# ⚡ SEPARACIÓN DE RESPONSABILIDADES - REFERENCIA RÁPIDA

> **Quick Reference Card** - Imprime esto y pégalo en tu monitor 📌

---

## 🎯 LA REGLA DE ORO

```
❓ ¿Dónde va este código?

├─ ¿Es JSX/renderizado?           → components/*.tsx
├─ ¿Es useState/useEffect?         → hooks/use*.ts
├─ ¿Es fetch/supabase?             → services/*.service.ts
├─ ¿Es string Tailwind > 80 chars? → styles/*.styles.ts
└─ ¿Es función pura?               → utils/*.ts
```

---

## 📁 ESTRUCTURA DE ARCHIVOS

```bash
src/modules/mi-modulo/
├── components/
│   ├── MiComponente.tsx          # SOLO UI (< 150 líneas)
│   └── MiComponente.styles.ts    # SOLO estilos
├── hooks/
│   └── useMiComponente.ts        # SOLO lógica
├── services/
│   └── mi-modulo.service.ts      # SOLO API/DB
└── types/
    └── index.ts                   # SOLO tipos
```

---

## ✅ COMPONENTE CORRECTO

```typescript
// ✅ components/MiComponente.tsx
import { useMiComponente } from '../hooks/useMiComponente'
import { styles } from './MiComponente.styles'

export function MiComponente() {
  const { data, loading } = useMiComponente() // ← Hook

  if (loading) return <LoadingState />

  return <div className={styles.container}>{data}</div>
}
```

---

## ✅ HOOK CORRECTO

```typescript
// ✅ hooks/useMiComponente.ts
export function useMiComponente() {
  const [data, setData] = useState([])
  const { fetchData } = useService() // ← Service

  useEffect(() => {
    fetchData().then(setData)
  }, [])

  const computed = useMemo(() =>
    data.filter(x => x.active),
    [data]
  )

  return { data, computed, loading }
}
```

---

## ✅ SERVICE CORRECTO

```typescript
// ✅ services/mi-modulo.service.ts
export class MiModuloService {
  async fetchData() {
    const { data } = await supabase
      .from('tabla')
      .select('*')
    return data
  }
}

export const miModuloService = new MiModuloService()
```

---

## ✅ ESTILOS CORRECTOS

```typescript
// ✅ styles/mi-componente.styles.ts
export const styles = {
  container: `
    flex items-center gap-3 p-4
    bg-blue-50 dark:bg-blue-950
    rounded-xl shadow-lg
  `.trim()
}
```

---

## 🚫 ERRORES COMUNES

### ❌ Error #1: Lógica en componente

```typescript
// ❌ MAL
export function Component() {
  const [data, setData] = useState([])
  useEffect(() => {
    fetch('/api').then(setData) // ← Mover a hook
  }, [])
  return <div>{data}</div>
}
```

### ❌ Error #2: Fetch en componente

```typescript
// ❌ MAL
export function Component() {
  const handleClick = async () => {
    await supabase.from('x').insert(y) // ← Mover a service
  }
}
```

### ❌ Error #3: Estilos inline largos

```typescript
// ❌ MAL
<div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30">
  {/* ← Mover a .styles.ts */}
</div>
```

---

## 📏 LÍMITES MÁXIMOS

| Archivo | Líneas Máx |
|---------|-----------|
| Componente `.tsx` | **150** |
| Hook `use*.ts` | **200** |
| Service `.service.ts` | **300** |
| String Tailwind inline | **80** |

---

## 🔍 CHECKLIST PRE-COMMIT

```bash
[ ] Componente < 150 líneas?
[ ] Sin useState/useEffect en componente?
[ ] Sin fetch/supabase en componente?
[ ] Strings Tailwind < 80 chars?
[ ] Lógica en hooks?
[ ] API calls en services?
[ ] Barrel exports (index.ts)?
```

---

## ⚡ COMANDO RÁPIDO

```bash
# Si el archivo tiene > 150 líneas → REFACTORIZAR
wc -l components/MiComponente.tsx
```

---

## 📚 DOCUMENTACIÓN COMPLETA

- 📖 **Guía completa**: `docs/ARQUITECTURA-SEPARACION-RESPONSABILIDADES.md`
- 📋 **Checklist**: `docs/DESARROLLO-CHECKLIST.md`
- 🎯 **Instrucciones**: `.github/copilot-instructions.md`

---

## 🎯 REGLA FINAL

> **¿Dónde va este código?**
>
> **Si dudas → va en el HOOK, NO en el componente**

---

**Esta es la regla más importante del proyecto. NO es negociable.** 🚨
