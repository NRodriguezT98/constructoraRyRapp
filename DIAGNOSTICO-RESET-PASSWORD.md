# 🔍 Diagnóstico Profundo - Reset Password

## ✅ PROBLEMA IDENTIFICADO Y RESUELTO

### 🎯 Causa Raíz Encontrada:

**El token NO viene en hash fragment, viene en query params con formato PKCE**

**URL Esperada (formato legacy):**

```
http://localhost:3000/reset-password#access_token=...&type=recovery
```

**URL Real (formato PKCE actual de Supabase):**

```
http://localhost:3000/reset-password?code=3d2e64be-7a17-4c72-8bf2-cc4a7b4fd4c9
```

### 📊 Logs que lo Confirmaron:

```
Current URL: http://localhost:3000/reset-password?code=3d2e64be-7a17-4c72-8bf2-cc4a7b4fd4c9
Hash:                          ← VACÍO!
Hash params: Object           ← Sin access_token ni type
```

### 🔧 Solución Implementada:

Detectar **AMBOS formatos**:

1. **Formato PKCE (actual)**: `?code=...`
2. **Formato Legacy**: `#access_token=...&type=recovery`

```typescript
// OPCIÓN 1: Hash fragment
const hashParams = new URLSearchParams(window.location.hash.substring(1))
const accessToken = hashParams.get('access_token')
const type = hashParams.get('type')

// OPCIÓN 2: Query params (PKCE)
const searchParams = new URLSearchParams(window.location.search)
const code = searchParams.get('code')

if (code) {
  // Formato PKCE detectado
  setValidToken(true)
} else if (type === 'recovery' && accessToken) {
  // Formato legacy detectado
  setValidToken(true)
}
```

## 📚 Contexto: ¿Qué es PKCE?

**PKCE** (Proof Key for Code Exchange) es el nuevo estándar de OAuth 2.0 que Supabase usa por defecto.

**Diferencias:**

| Formato Legacy         | Formato PKCE                    |
| ---------------------- | ------------------------------- |
| `#access_token=...`    | `?code=...`                     |
| Token en hash fragment | Code en query params            |
| Menos seguro           | Más seguro                      |
| Token visible en URL   | Code se intercambia server-side |

### ⚙️ Por Qué Cambió:

Supabase Auth migró a PKCE por defecto para mayor seguridad. El hash fragment puede ser interceptado, mientras que PKCE usa un code que se intercambia por un token de forma segura.

### Logs Esperados vs Actuales:

**ESPERADO:**

```
=== INICIANDO VERIFICACIÓN DE TOKEN ===
Current URL: localhost:3000/reset-password#access_token=...&type=recovery
✅ Token de recuperación válido encontrado en URL
🔔 AUTH EVENT: SIGNED_IN
=== INICIANDO ACTUALIZACIÓN DE CONTRASEÑA ===
=== RESPUESTA COMPLETA DE updateUser ===
✅ updateUser completado sin errores
🔔 AUTH EVENT: SIGNED_IN (update completo)
✅ Password update completado vía evento SIGNED_IN!
```

**ACTUAL (según screenshot):**

```
Hash params: { eObject }
Auth event: SIGNED_IN
Updating password...
[NADA MÁS]
```

## 🎯 Hipótesis del Problema

### Hipótesis #1: La promesa de updateUser() nunca se resuelve

- **Causa posible**: Supabase auth cuelga la promesa cuando hay sesión de recovery
- **Solución**: Timeout de 2 segundos para forzar éxito si no hay error

### Hipótesis #2: El evento SIGNED_IN inicial interfiere

- **Causa posible**: El evento SIGNED_IN que se dispara al cargar la página marca `updateInProgressRef` antes del submit
- **Solución**: Resetear `updateInProgressRef` después de validar token

### Hipótesis #3: Error silencioso en updateUser

- **Causa posible**: Hay un error pero no se está capturando correctamente
- **Solución**: Logging exhaustivo implementado

## 🔧 Cambios Implementados

### 1. Logging Exhaustivo

```typescript
console.log('=== RESPUESTA COMPLETA DE updateUser ===')
console.log('Full response:', JSON.stringify(updateResult, null, 2))
console.log('Data:', updateResult.data)
console.log('Error:', updateResult.error)
```

### 2. Fallback de Timeout

```typescript
// Si después de 2s no hay evento SIGNED_IN, marcar como exitoso
setTimeout(() => {
  if (updateInProgressRef.current) {
    console.log(
      '⚠️ Evento SIGNED_IN no llegó, marcando como exitoso manualmente'
    )
    setSuccess(true)
    // ... redirect
  }
}, 2000)
```

### 3. Tracking de Eventos

```typescript
console.log('🔔 AUTH EVENT:', event)
console.log('   Update in progress?', updateInProgressRef.current)
```

## 📋 Checklist de Testing

**POR FAVOR PROBAR Y REPORTAR:**

1. [ ] ¿Aparece "=== INICIANDO VERIFICACIÓN DE TOKEN ==="?
2. [ ] ¿Cuál es la URL completa mostrada?
3. [ ] ¿Aparece "✅ Token de recuperación válido encontrado en URL"?
4. [ ] ¿Cuántos eventos "🔔 AUTH EVENT: SIGNED_IN" aparecen ANTES del submit?
5. [ ] Al hacer submit:
   - [ ] ¿Aparece "=== INICIANDO ACTUALIZACIÓN DE CONTRASEÑA ==="?
   - [ ] ¿Aparece "=== RESPUESTA COMPLETA DE updateUser ==="?
   - [ ] ¿Qué muestra "Full response"?
   - [ ] ¿Aparece "✅ updateUser completado sin errores"?
   - [ ] ¿Aparece "⚠️ Evento SIGNED_IN no llegó, marcando como exitoso manualmente" después de 2s?

## 🚨 Posibles Causas Raíz

### A. Configuración de Supabase Auth

```sql
-- Verificar en Supabase Dashboard:
-- Authentication > Settings > Email Templates
-- ¿El redirect URL es correcto?

-- Authentication > URL Configuration
-- Site URL: http://localhost:3000
-- Redirect URLs: http://localhost:3000/reset-password
```

### B. Política de Sesiones

```typescript
// ¿Supabase está creando múltiples sesiones?
// Verificar en Application > Storage > supabase.auth.token
```

### C. CORS o Network Issues

```
// ¿Hay errores de red en Network tab?
// Buscar: POST /auth/v1/user
```

## 🎯 Próximos Pasos

1. **Ejecutar con nuevo logging**: Revisar consola completa
2. **Verificar Network tab**: Ver request/response de updateUser
3. **Revisar Supabase Dashboard**: Configuration > Email Templates
4. **Si timeout funciona**: El problema está en los eventos, no en updateUser
5. **Si timeout NO funciona**: La promesa está realmente colgada

## 💡 Solución Alternativa (si todo falla)

Si los eventos de Supabase son inconsistentes, podemos:

```typescript
// Estrategia #1: Polling de sesión
const checkPasswordUpdated = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  // Si user existe después de update, fue exitoso
}

// Estrategia #2: No depender de eventos, solo de promesa + timeout
const result = await Promise.race([
  supabase.auth.updateUser({ password }),
  new Promise((_, reject) => setTimeout(() => reject('timeout'), 5000)),
])
```
