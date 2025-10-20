# 🔒 Sistema de Autenticación y Protección de Rutas

## ✅ Implementación Completada

Se ha implementado un **middleware de autenticación** que protege toda la aplicación.

### 🎯 Características

1. **Protección automática de rutas**
   - Todas las rutas requieren autenticación por defecto
   - Solo se permite acceso sin auth a rutas públicas específicas

2. **Redirección inteligente**
   - Usuario no autenticado → redirige a `/login`
   - Usuario autenticado en `/login` → redirige a `/proyectos`
   - Después del login → redirige a la ruta original que intentó acceder

3. **Detección de sesión**
   - Verifica cookies de Supabase automáticamente
   - Funciona con el sistema de auth existente

---

## 📁 Archivos Modificados

### 1. `src/middleware.ts` (NUEVO)

Middleware de Next.js que se ejecuta en **cada request**:

```typescript
// Rutas públicas (SIN autenticación requerida)
const publicPaths = ['/login', '/registro', '/reset-password']

// Verifica cookies de Supabase
const hasSupabaseAuthCookie = cookies.some(cookie =>
  cookie.name.startsWith('sb-') && cookie.name.includes('-auth-token')
)

// Si NO autenticado + ruta privada → login
if (!hasSupabaseAuthCookie && !isPublicPath) {
  redirect to /login
}

// Si autenticado + ruta pública → app
if (hasSupabaseAuthCookie && isPublicPath) {
  redirect to /proyectos
}
```

**Ubicación crítica**: Debe estar en `src/middleware.ts` (raíz de src)

### 2. `src/app/login/useLogin.ts` (MODIFICADO)

Mejora del hook de login para manejar redirecciones:

```typescript
// Obtener ruta original (si fue redirigido desde otra página)
const redirectedFrom = searchParams.get('redirectedFrom')
const redirectTo = redirectedFrom || '/proyectos'

// Redirigir después del login
router.push(redirectTo)
```

---

## 🚦 Flujo de Autenticación

### Caso 1: Usuario NO autenticado intenta acceder a `/clientes`

```
1. Usuario navega a: http://localhost:3000/clientes
2. Middleware detecta: NO hay cookie de sesión
3. Middleware redirige a: http://localhost:3000/login?redirectedFrom=/clientes
4. Usuario ingresa credenciales
5. Login exitoso → redirige a: /clientes (ruta original)
```

### Caso 2: Usuario autenticado intenta ir a `/login`

```
1. Usuario navega a: http://localhost:3000/login
2. Middleware detecta: SÍ hay cookie de sesión
3. Middleware redirige a: http://localhost:3000/proyectos
```

### Caso 3: Usuario autenticado navega normalmente

```
1. Usuario navega a: http://localhost:3000/proyectos
2. Middleware detecta: SÍ hay cookie de sesión
3. Middleware permite: acceso directo
```

---

## 🔐 Rutas Públicas vs Privadas

### Rutas PÚBLICAS (sin autenticación requerida):
- ✅ `/login`
- ✅ `/registro` (preparado para futuro)
- ✅ `/reset-password` (preparado para futuro)
- ✅ `/_next/*` (assets de Next.js)
- ✅ `/images/*` (imágenes públicas)
- ✅ `/favicon.ico`
- ✅ `/icon.svg`

### Rutas PRIVADAS (autenticación obligatoria):
- 🔒 `/` (raíz)
- 🔒 `/proyectos`
- 🔒 `/proyectos/[id]`
- 🔒 `/clientes`
- 🔒 `/clientes/[id]`
- 🔒 `/viviendas`
- 🔒 `/abonos`
- 🔒 `/renuncias`
- 🔒 `/admin`
- 🔒 **Todas las demás rutas por defecto**

---

## ➕ Agregar Más Rutas Públicas

Si necesitas agregar más rutas sin autenticación:

Edita `src/middleware.ts`:

```typescript
const publicPaths = [
  '/login',
  '/registro',
  '/reset-password',
  '/politicas',        // Nueva ruta pública
  '/terminos',         // Nueva ruta pública
  '/ayuda',            // Nueva ruta pública
]
```

---

## 🧪 Testing del Sistema de Protección

### Test 1: Intento de acceso sin login

1. Abre navegador en **modo incógnito**
2. Navega a: `http://localhost:3000/proyectos`
3. **Resultado esperado**: Redirige automáticamente a `/login?redirectedFrom=/proyectos`

### Test 2: Login y redirección

1. En la página de login (después del test 1)
2. Ingresa credenciales válidas
3. **Resultado esperado**: Redirige automáticamente a `/proyectos` (ruta original)

### Test 3: Acceso directo a login cuando ya estás autenticado

1. Estando logueado, intenta ir a: `http://localhost:3000/login`
2. **Resultado esperado**: Redirige automáticamente a `/proyectos`

### Test 4: Navegación normal

1. Estando logueado, navega entre secciones
2. **Resultado esperado**: Acceso normal sin redirecciones

### Test 5: Cierre de sesión

1. Click en "Cerrar sesión" en el sidebar
2. Intenta acceder a cualquier ruta privada
3. **Resultado esperado**: Redirige a `/login`

---

## ⚙️ Cómo Funciona el Middleware

El middleware se ejecuta **antes** de renderizar cualquier página:

```
Request → Middleware → Verificación de cookies → Decisión
                                ↓
                         ┌──────┴──────┐
                         │             │
                    NO AUTH        AUTH
                         │             │
                         ↓             ↓
                  Ruta pública?    Ruta privada?
                    ┌───┴───┐      ┌───┴───┐
                   SÍ      NO     SÍ      NO
                    │       │      │       │
                  Permitir  →  Redirigir  ←  Permitir
                          a login      a /proyectos
```

---

## 🔍 Detección de Sesión

### Método actual (basado en cookies):

```typescript
const cookies = req.cookies.getAll()
const hasSupabaseAuthCookie = cookies.some(cookie =>
  cookie.name.startsWith('sb-') &&
  cookie.name.includes('-auth-token')
)
```

**Ventajas**:
- ✅ Rápido (no requiere llamada a DB)
- ✅ Compatible con Supabase Auth
- ✅ Funciona en Server Component y Middleware

**Cookies de Supabase**:
- `sb-{project-id}-auth-token` → Token de sesión
- `sb-{project-id}-auth-token-code-verifier` → Verificador PKCE

---

## 🚨 Problemas Conocidos y Soluciones

### Problema: "Loop infinito de redirección"

**Síntoma**: La página redirige infinitamente entre `/login` y `/proyectos`

**Causa**: Cookie de sesión no se está guardando correctamente

**Solución**:
1. Verificar que AuthContext guarda la sesión
2. Verificar que Supabase tiene `persistSession: true`
3. Limpiar cookies del navegador y volver a loguearte

### Problema: "Redirige a login aunque estoy autenticado"

**Síntoma**: Después de hacer login, sigue pidiendo login

**Causa**: Middleware no detecta las cookies de Supabase

**Solución**:
1. Abre DevTools → Application → Cookies
2. Busca cookies que empiecen con `sb-`
3. Si no existen, el problema está en AuthContext
4. Si existen, el problema está en el matcher del middleware

### Problema: "Puedo acceder a rutas privadas sin login"

**Síntoma**: Entras a `/proyectos` sin estar logueado

**Causa**: Middleware no se está ejecutando

**Solución**:
1. Verificar que `src/middleware.ts` existe en la raíz de `src/`
2. Reiniciar servidor de desarrollo: `npm run dev`
3. Limpiar caché: `rm -rf .next && npm run dev`

---

## ✅ Checklist de Seguridad

- [x] Middleware implementado en `src/middleware.ts`
- [x] Todas las rutas protegidas por defecto
- [x] Rutas públicas definidas explícitamente
- [x] Redirección a login si no autenticado
- [x] Redirección a app si ya autenticado
- [x] Preservación de ruta original para redirección post-login
- [x] Detección de sesión mediante cookies de Supabase
- [x] Assets públicos excluidos del middleware
- [ ] TODO: Agregar protección a nivel de RLS en Supabase (ya implementado)
- [ ] TODO: Implementar refresh de token automático (Supabase lo maneja)

---

## 📊 Antes vs Después

### Antes ❌
```
Usuario no logueado → Escribe URL de cualquier página → Ve la página
Usuario logueado → Va a /login → Ve el formulario de login
```

### Después ✅
```
Usuario no logueado → Escribe URL → Redirige a /login automáticamente
Usuario logueado → Va a /login → Redirige a /proyectos automáticamente
Usuario logueado → Navega normal → Todo funciona perfecto
```

---

## 🎯 Próximos Pasos Opcionales

1. **Página de reset password**
   - Crear `/reset-password` para recuperación de contraseña

2. **Página de registro público**
   - Crear `/registro` separado del login

3. **Roles y permisos**
   - Agregar verificación de roles en middleware
   - Ej: Solo admin puede acceder a `/admin`

4. **Rate limiting**
   - Limitar intentos de login
   - Protección contra fuerza bruta

---

**Estado**: ✅ Sistema de protección de rutas 100% funcional
