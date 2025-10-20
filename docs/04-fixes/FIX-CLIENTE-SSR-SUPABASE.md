# 🔧 FIX APLICADO: Cliente Supabase SSR

## ❌ Problema Identificado

El error `401 Unauthorized` persistía **incluso con políticas RLS correctas** porque:

1. ✅ **Políticas RLS**: Correctamente aplicadas (4/4)
2. ❌ **Cliente Supabase**: Usando cliente SIN SSR (`@/lib/supabase/client.ts`)
3. ❌ **Sesión de autenticación**: NO se transmitía correctamente a las peticiones

---

## 🔍 Causa Raíz

### Cliente Incorrecto (ANTES)
```typescript
// ❌ src/modules/clientes/services/negociaciones.service.ts
import { supabase } from '@/lib/supabase'  // ← Cliente sin SSR

// ❌ src/modules/clientes/hooks/useRegistrarInteres.ts
import { supabase } from '@/lib/supabase'  // ← Cliente sin SSR
```

**Problema**: Este cliente NO maneja correctamente las cookies de sesión en Next.js 14+ con App Router.

---

## ✅ Solución Aplicada

### Cliente Correcto (AHORA)
```typescript
// ✅ src/modules/clientes/services/negociaciones.service.ts
import { supabase } from '@/lib/supabase/client-browser'  // ← Cliente con SSR

// ✅ src/modules/clientes/hooks/useRegistrarInteres.ts
import { supabase } from '@/lib/supabase/client-browser'  // ← Cliente con SSR
```

**Ventaja**: Este cliente usa `@supabase/ssr` que maneja correctamente:
- ✅ Cookies de sesión HTTP-only
- ✅ Tokens de autenticación en peticiones
- ✅ Refresh automático de tokens
- ✅ Compatibilidad con Next.js App Router

---

## 📂 Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `negociaciones.service.ts` | Importa `client-browser` en vez de `client` |
| `useRegistrarInteres.ts` | Importa `client-browser` en vez de `client` |

---

## 🧪 Prueba Ahora

1. **Guarda los cambios** (ya aplicados automáticamente)
2. **Recarga la aplicación** (`F5`)
3. **Abre el modal** "Registrar nuevo interés"
4. **Completa el formulario**:
   - Proyecto
   - Vivienda
   - Valor negociado
5. **Click en "Guardar"**

---

## ✅ Resultado Esperado

### ANTES del fix:
```
❌ POST /rest/v1/negociaciones 401 (Unauthorized)
❌ Error: new row violates row-level security policy
```

### DESPUÉS del fix:
```
✅ POST /rest/v1/negociaciones 201 (Created)
✅ Interés registrado exitosamente
✅ Modal se cierra
✅ Lista se actualiza
```

---

## 🔬 Explicación Técnica

### ¿Por qué necesitamos SSR client?

**Next.js 14+ App Router** usa Server Components por defecto:

1. **Componentes Server**: Renderización en servidor
2. **Cookies HTTP-only**: Mejor seguridad para tokens
3. **Hydration**: Transferencia estado servidor → cliente

**El cliente `@supabase/ssr`**:
- Maneja cookies automáticamente
- Sincroniza sesión entre servidor y cliente
- Pasa tokens de auth en headers de peticiones

**El cliente antiguo `createClient`**:
- Solo funciona en cliente puro
- NO accede a cookies HTTP-only
- NO pasa tokens en peticiones API

---

## 📊 Comparación

| Característica | `client.ts` | `client-browser.ts` |
|----------------|-------------|---------------------|
| SSR | ❌ | ✅ |
| Cookies HTTP-only | ❌ | ✅ |
| Auth automática | ❌ | ✅ |
| Next.js App Router | ⚠️ Limitado | ✅ Completo |
| RLS funciona | ⚠️ Parcial | ✅ Siempre |

---

## 🎯 Conclusión

El error NO era de las políticas RLS (estaban correctas).
El error ERA del cliente Supabase que NO enviaba el token de autenticación.

**Fix**: Cambiar a `client-browser` que maneja auth correctamente.

---

## 📚 Referencias

- [Supabase SSR Docs](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

---

## ⚡ Próximos Pasos

1. **Probar el formulario** (debería funcionar ahora)
2. Si funciona: ✅ **¡Listo!**
3. Si no funciona: Verificar que estés logueado

---

**Fecha del fix**: 18 de octubre de 2025
**Tiempo de solución**: ~15 minutos
**Prioridad**: 🔴 CRÍTICA (bloqueaba funcionalidad)
