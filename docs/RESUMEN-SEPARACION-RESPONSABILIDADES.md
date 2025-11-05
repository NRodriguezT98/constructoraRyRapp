# 📋 RESUMEN: SEPARACIÓN DE RESPONSABILIDADES - REGLA INVIOLABLE

**Fecha**: 5 de noviembre de 2025
**Impacto**: 🔴 **CRÍTICO** - Afecta TODA nueva implementación

---

## 🎯 QUÉ SE IMPLEMENTÓ

Se estableció como **REGLA #0 INVIOLABLE** del proyecto la **Separación Estricta de Responsabilidades** (lógica/vista/estilos).

Esta regla es ahora la **PRIORIDAD MÁXIMA** y aparece:

1. ✅ En `.github/copilot-instructions.md` como **REGLA CRÍTICA #0**
2. ✅ En `README.md` como primer elemento visible
3. ✅ En documentación completa: `docs/ARQUITECTURA-SEPARACION-RESPONSABILIDADES.md`
4. ✅ En referencia rápida: `docs/SEPARACION-RESPONSABILIDADES-QUICK-REF.md`

---

## 📐 PATRÓN OBLIGATORIO

```
src/modules/[modulo]/
├── components/[Componente].tsx       # SOLO UI (< 150 líneas)
├── hooks/use[Componente].ts          # SOLO lógica
├── services/[modulo].service.ts      # SOLO API/DB
└── styles/[componente].styles.ts     # SOLO estilos
```

---

## 🚫 PROHIBICIONES ABSOLUTAS

❌ Lógica en componentes (useState/useEffect complejos)
❌ Llamadas API/DB directas en componentes
❌ Strings de Tailwind > 80 caracteres inline
❌ Componentes > 150 líneas
❌ Código duplicado

---

## ✅ IMPLEMENTACIÓN CORRECTA

```typescript
// Hook con lógica
export function useMiComponente() {
  const [data, setData] = useState([])
  const { fetchData } = useService()

  useEffect(() => { fetchData().then(setData) }, [])

  return { data }
}

// Componente presentacional
export function MiComponente() {
  const { data } = useMiComponente()
  return <div className={styles.container}>{data}</div>
}

// Service con API
export class MiService {
  async fetchData() {
    return await supabase.from('tabla').select('*')
  }
}
```

---

## 📏 LÍMITES ESTRICTOS

| Tipo | Máx Líneas | Acción si excede |
|------|-----------|------------------|
| Componente | **150** | Dividir en sub-componentes |
| Hook | **200** | Dividir en sub-hooks |
| Service | **300** | Dividir por dominio |
| String Tailwind | **80 chars** | Mover a .styles.ts |

---

## 🔍 CHECKLIST PRE-COMMIT

```bash
[ ] Componente < 150 líneas
[ ] Sin lógica en componente
[ ] Sin API calls en componente
[ ] Strings Tailwind < 80 chars
[ ] Lógica en hooks
[ ] API/DB en services
[ ] Barrel exports (index.ts)
```

---

## 🎯 BENEFICIOS

✅ **Mantenibilidad**: Cambios localizados, bajo riesgo
✅ **Testabilidad**: Hooks y services independientes
✅ **Reusabilidad**: Lógica compartible
✅ **Escalabilidad**: Crecimiento ordenado
✅ **Legibilidad**: Código autodocumentado

---

## ⚡ PRÓXIMO PASO

Refactorizar `DetalleAuditoriaModal.tsx` (696 líneas → arquitectura modular):

```
components/
  ├── DetalleAuditoriaModal.tsx (100 líneas - orchestrator)
  ├── detalle-renders/
  │   ├── ProyectoDetalleRender.tsx
  │   ├── ViviendaDetalleRender.tsx
  │   └── ...
  ├── shared/
  │   ├── AccionBadge.tsx
  │   ├── InfoCard.tsx
  │   └── DataGrid.tsx
  └── hooks/
      └── useDetalleAuditoria.ts
```

**Tiempo estimado**: 6-8 horas
**Impacto**: Escalable a 20+ módulos sin problemas

---

## 📚 DOCUMENTACIÓN

1. **Guía completa**: `docs/ARQUITECTURA-SEPARACION-RESPONSABILIDADES.md`
2. **Quick Reference**: `docs/SEPARACION-RESPONSABILIDADES-QUICK-REF.md`
3. **Instrucciones Copilot**: `.github/copilot-instructions.md`
4. **README principal**: `README.md` (primera sección)

---

## 🚨 REGLA DE ORO

> **Si dudas dónde va el código → va en el HOOK, NO en el componente**

**Esta regla NO es negociable. Es la base del código escalable.** 🏗️

---

## ✅ VALIDACIÓN

Antes de implementar CUALQUIER funcionalidad nueva:

1. **Consultar**: `docs/ARQUITECTURA-SEPARACION-RESPONSABILIDADES.md`
2. **Validar**: Checklist de separación
3. **Confirmar**: Límites de líneas respetados
4. **Verificar**: No hay violaciones de anti-patterns

**Si viola la separación → Code review RECHAZADO** ❌
