# 🛡️ Seguridad en Reset Password - Prevención de Enumeración de Usuarios

## ❓ Pregunta Común

**"¿Debemos verificar si el email existe antes de enviar el enlace de reset?"**

**Respuesta: ❌ NO**

---

## 🎯 Decisión de Diseño

### ✅ Implementación Actual (Segura)

```typescript
// src/app/login/reset-password-modal.tsx
const handleSubmit = async (e: React.FormEvent) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })

  // SIEMPRE mostramos éxito (aunque el email no exista)
  if (!error) {
    setSuccess(true)
    // Mensaje: "Si el email está registrado, recibirás un enlace..."
  }
}
```

### ❌ Implementación Insegura (NO HACER)

```typescript
// ❌ MAL - Revela qué emails existen
const { data: user } = await supabase
  .from('users')
  .select('email')
  .eq('email', email)
  .single()

if (!user) {
  setError('Este email no está registrado') // ❌ Vulnerabilidad
  return
}
```

---

## 🚨 Ataque: Enumeración de Usuarios

### ¿Qué es?

Un ataque donde un malicioso descubre qué emails están registrados en el sistema.

### 🎭 Ejemplo de Ataque:

```python
# Script de un atacante
emails_to_test = [
  "admin@empresa.com",
  "ceo@empresa.com",
  "juan.perez@empresa.com",
  # ... millones de combinaciones
]

for email in emails_to_test:
  response = reset_password(email)

  if "no está registrado" in response:
    print(f"❌ {email} - No existe")
  else:
    print(f"✅ {email} - EXISTE! <- Objetivo para phishing")
```

### 💀 Consecuencias:

1. **Base de datos de usuarios revelada**: El atacante sabe quiénes usan el sistema
2. **Ataques dirigidos**: Phishing personalizado a usuarios reales
3. **Violación de privacidad**: Se revela información sensible
4. **Daño reputacional**: Mala práctica de seguridad

---

## ✅ Mejores Prácticas (Implementadas)

### 1️⃣ Mensaje Ambiguo

```tsx
// Mensaje que NO revela si el email existe
<p>
  Si el email está registrado, recibirás un enlace para
  restablecer tu contraseña en tu bandeja de entrada.
</p>
```

**Por qué funciona:**
- Usuario con email válido: ✅ Recibe email
- Usuario con email inválido: ⏸️ No recibe nada, pero tampoco sabe que falló

### 2️⃣ Comportamiento Consistente

```typescript
// SIEMPRE el mismo flujo (exista o no el email)
const { error } = await supabase.auth.resetPasswordForEmail(email)

// Supabase internamente:
// - Email existe → Envía email ✅
// - Email NO existe → No envía nada, PERO tampoco da error ❌

// App siempre muestra éxito
if (!error) {
  setSuccess(true) // Mismo mensaje para ambos casos
}
```

### 3️⃣ Rate Limiting (Supabase lo hace automáticamente)

Supabase limita la cantidad de requests de reset password para:
- Prevenir spam
- Prevenir ataques de fuerza bruta
- Proteger la infraestructura

---

## 🌐 Empresas que Usan Esta Práctica

- ✅ **Google**: "Si existe una cuenta con ese email, recibirás..."
- ✅ **GitHub**: "Hemos enviado un email si existe..."
- ✅ **Microsoft**: "Revisa tu email si la cuenta existe..."
- ✅ **Facebook**: "Si encontramos tu cuenta, te enviaremos..."

**Todas usan mensajes ambiguos por seguridad.**

---

## 📊 Comparación de UX

### ❌ Revelando Existencia (Inseguro)

| Escenario | Mensaje | Problema |
|-----------|---------|----------|
| Email existe | ✅ "Email enviado" | OK |
| Email NO existe | ❌ "Email no registrado" | **Revela información** |

**Atacante prueba 1000 emails → Descubre 47 válidos → Ataque dirigido**

### ✅ Mensaje Consistente (Seguro)

| Escenario | Mensaje | Seguridad |
|-----------|---------|-----------|
| Email existe | ✅ "Si está registrado, recibirás..." | OK |
| Email NO existe | ✅ "Si está registrado, recibirás..." | **No revela nada** |

**Atacante prueba 1000 emails → No aprende nada → Ataque inefectivo**

---

## 🔒 Capas de Seguridad en Nuestra App

### 1. Middleware de Autenticación
```typescript
// src/middleware.ts
// Bloquea acceso sin login
```

### 2. RLS en Supabase
```sql
-- Solo ve sus propios datos
CREATE POLICY "Ver solo propios datos"
  ON public.documentos_cliente FOR SELECT
  USING (auth.uid()::text = subido_por);
```

### 3. Sin Registro Público
```typescript
// Solo login, no signup
// Usuarios creados manualmente por admin
```

### 4. Reset Password Seguro (Este)
```typescript
// No revela qué emails existen
// Mensaje ambiguo consistente
```

### 5. Protección de Rutas
```typescript
// Middleware redirecciona a /login si no autenticado
```

---

## 🎓 Referencias

- **OWASP**: [User Enumeration](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/03-Identity_Management_Testing/04-Testing_for_Account_Enumeration_and_Guessable_User_Account)
- **NIST**: [Digital Identity Guidelines](https://pages.nist.gov/800-63-3/sp800-63b.html#sec5)
- **CWE-204**: [Observable Response Discrepancy](https://cwe.mitre.org/data/definitions/204.html)

---

## ✅ Checklist de Seguridad

- [x] Mensaje ambiguo en reset password
- [x] No revela si email existe
- [x] Comportamiento consistente (exista o no)
- [x] Supabase Auth maneja rate limiting
- [x] Registro público deshabilitado
- [x] Middleware protege rutas
- [x] RLS en todas las tablas
- [ ] Habilitar 2FA (futuro)
- [ ] Monitoreo de intentos sospechosos (futuro)

---

## 📝 Resumen

**Pregunta Original:**
> "¿Verificamos que el email exista antes de enviar el enlace?"

**Respuesta Definitiva:**
> ❌ NO. Por seguridad, **SIEMPRE** mostramos el mismo mensaje de éxito,
> exista o no el email. Esto previene que atacantes descubran qué usuarios
> están registrados en el sistema.

**Implementación:**
> Supabase.auth.resetPasswordForEmail() ya maneja esto correctamente.
> Solo enviará el email si existe, pero nunca nos dirá si no existe.
> Nuestra UI muestra: "Si el email está registrado, recibirás..."

---

**Fecha de creación**: 2025-01-17
**Última actualización**: 2025-01-17
**Autor**: Sistema de Seguridad RyR
