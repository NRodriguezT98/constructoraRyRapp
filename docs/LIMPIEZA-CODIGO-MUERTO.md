# 🧹 CÓDIGO MUERTO - Archivos Obsoletos Detectados

**Fecha**: 6 de Noviembre, 2025  
**Contexto**: Post-migración a React Query  
**Estado**: ⚠️ Archivos sin usar detectados

---

## 📋 ARCHIVOS OBSOLETOS (PUEDEN ELIMINARSE)

### 1️⃣ Store Zustand Antiguo - Proyectos (Raíz)

```
📁 src/store/proyectos-store.ts
```

**Estado**: ⚠️ **CÓDIGO MUERTO**

**Análisis**:
- ✅ Solo usado por: `src/components/proyectos/lista-proyectos.tsx`
- ❌ `lista-proyectos.tsx` NO se usa en ningún lugar
- ✅ Módulo de proyectos usa: `src/modules/proyectos/store/proyectos.store.ts`
- ✅ Pero ese store TAMPOCO se usa directamente (solo wrapper interno)

**Recomendación**: ✅ **ELIMINAR**

---

### 2️⃣ Componente Legacy - Lista Proyectos

```
📁 src/components/proyectos/lista-proyectos.tsx
```

**Estado**: ⚠️ **CÓDIGO MUERTO**

**Análisis**:
- ❌ NO importado en ningún archivo
- ❌ NO usado en ninguna página
- ✅ Reemplazado por: `src/modules/proyectos/components/proyectos-lista.tsx`
- ✅ Usa Zustand antiguo (obsoleto)

**Recomendación**: ✅ **ELIMINAR**

---

### 3️⃣ Store Zustand del Módulo - Proyectos

```
📁 src/modules/proyectos/store/proyectos.store.ts
```

**Estado**: ⚠️ **SEMI-OBSOLETO**

**Análisis**:
- ✅ Solo usado por: `src/modules/proyectos/hooks/useProyectos.ts`
- ⚠️ `useProyectos.ts` NO se usa directamente en componentes
- ✅ Componentes usan: `useProyectosQuery.ts` (React Query)
- ⚠️ Puede tener dependencias indirectas (validar antes)

**Recomendación**: 🟡 **VALIDAR ANTES DE ELIMINAR**

**Comando de validación**:
```powershell
# Buscar todos los imports de useProyectos (sin Query)
grep -r "useProyectos[^Q]" src/
```

---

## ✅ PLAN DE LIMPIEZA RECOMENDADO

### Paso 1: Eliminar Código Muerto Confirmado (SEGURO)

```powershell
# 1. Eliminar store antiguo (raíz)
Remove-Item "src\store\proyectos-store.ts" -Force

# 2. Eliminar componente legacy
Remove-Item "src\components\proyectos\lista-proyectos.tsx" -Force
```

**Impacto**: ✅ **CERO** - No se usan en ningún lugar

---

### Paso 2: Validar Wrapper useProyectos (OPCIONAL)

```powershell
# Buscar imports de useProyectos (wrapper)
grep -r "import.*useProyectos" src/ | grep -v "useProyectosQuery"
```

**Posibles resultados**:
- Si NO hay imports → **ELIMINAR** wrapper + store
- Si HAY imports → **MANTENER** hasta migrar esos archivos

---

### Paso 3: Eliminar Store si es Seguro (SOLO SI PASO 2 NO ENCUENTRA NADA)

```powershell
# Solo si useProyectos.ts NO se usa:
Remove-Item "src\modules\proyectos\hooks\useProyectos.ts" -Force
Remove-Item "src\modules\proyectos\store\proyectos.store.ts" -Force
```

**Impacto**: ✅ **CERO** si no se usa en componentes

---

## 📊 RESUMEN DE LIMPIEZA

| Archivo | Estado | Usado Por | Acción |
|---------|--------|-----------|--------|
| `src/store/proyectos-store.ts` | 🔴 Muerto | `lista-proyectos.tsx` (muerto) | ✅ Eliminar |
| `src/components/proyectos/lista-proyectos.tsx` | 🔴 Muerto | Nadie | ✅ Eliminar |
| `src/modules/proyectos/hooks/useProyectos.ts` | 🟡 Posible | ⚠️ Validar | 🟡 Validar |
| `src/modules/proyectos/store/proyectos.store.ts` | 🟡 Posible | `useProyectos.ts` | 🟡 Validar |

**Líneas de código a eliminar**: ~450 líneas (aprox.)

---

## 🎯 BENEFICIOS DE LA LIMPIEZA

### ✅ Reducción de Complejidad
- Menos archivos = Más fácil navegar
- Menos dependencias = Menos confusión
- Menos Zustand = Menos riesgo de usar código obsoleto

### ✅ Mejora de Mantenibilidad
- Solo React Query = Un solo patrón
- Sin código duplicado = Sin inconsistencias
- Arquitectura clara = Nuevos devs entienden rápido

### ✅ Performance
- Bundle size más pequeño
- Menos código muerto en compilación
- TypeScript compila más rápido

---

## 🔍 VERIFICACIÓN POST-LIMPIEZA

Después de eliminar archivos, verificar:

```powershell
# 1. Build exitoso
npm run build

# 2. TypeScript sin errores
npx tsc --noEmit

# 3. Tests pasan (si existen)
npm test

# 4. Buscar imports rotos
grep -r "proyectos-store" src/
grep -r "lista-proyectos" src/
```

**Resultado esperado**:
- ✅ Build exitoso
- ✅ 0 errores TypeScript
- ✅ 0 referencias a archivos eliminados

---

## 📚 DOCUMENTACIÓN RELACIONADA

- `docs/VERIFICACION-REACT-QUERY-MIGRACION.md` - Estado de migración
- `docs/MIGRACION-CLIENTES-REACT-QUERY.md` - Ejemplo de migración completa
- `docs/ARQUITECTURA-SEPARACION-RESPONSABILIDADES.md` - Patrón actual

---

**Creado por**: GitHub Copilot  
**Fecha**: 6 de Noviembre, 2025  
**Prioridad**: 🟡 Media (No urgente, pero recomendado)
