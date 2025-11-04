# 🔍 GUÍA DE LOGS DE NAVEGACIÓN - DEBUG

## ✅ Cambios Aplicados

Se agregaron logs exhaustivos en los siguientes componentes:

### 1. **Auth Context** (`src/contexts/auth-context.tsx`)
- ✅ Logs de montaje del provider
- ✅ Timing de queries de perfil
- ✅ Eventos de cambio de autenticación
- ✅ Verificación de sesión

### 2. **Protected Route** (`src/modules/usuarios/components/ProtectedRoute.tsx`)
- ✅ Logs de renderizado por módulo
- ✅ Estado de autenticación y permisos
- ✅ Verificación de permisos detallada
- ✅ Decisiones de redirección

### 3. **UsePermissions Hook** (`src/modules/usuarios/hooks/usePermissions.ts`)
- ✅ Estado de carga de permisos
- ✅ Información de perfil y rol

### 4. **Auditorías Hook** (`src/modules/auditorias/hooks/useAuditorias.ts`)
- ✅ Timing de queries
- ✅ Conteo de registros cargados
- ✅ useEffect inicial

### 5. **Auditorías View** (`src/modules/auditorias/components/AuditoriasView.tsx`)
- ✅ Renderizado del componente
- ✅ Estado actual (cargando, registros, error)
- ✅ useEffect de carga inicial

---

## 📊 QUÉ BUSCAR EN LA CONSOLA

### **Navegación NORMAL (esperada)**

Cuando navegas de un módulo a otro, deberías ver esta secuencia:

```
1. 🛡️ [PROTECTED_ROUTE] Renderizando para módulo: auditorias
2. 🔑 [PERMISSIONS] Hook ejecutado: { authLoading: false, hasPerfil: true, rol: "Administrador" }
3. ✅ [PERMISSIONS] Permisos listos - Rol: Administrador
4. 🔐 [PROTECTED_ROUTE] useEffect disparado para auditorias
5. 🔍 [PROTECTED_ROUTE] Verificando permiso único: auditorias.ver = true
6. ✅ [PROTECTED_ROUTE] Acceso autorizado para auditorias
7. ✅ [PROTECTED_ROUTE] Renderizando children
8. 🎨 [AUDITORIAS_VIEW] Componente renderizado
9. 🎬 [AUDITORIAS_VIEW] useEffect de carga inicial ejecutado
10. 🎬 [AUDITORIAS] useEffect inicial - Cargando auditorías
11. 📊 [AUDITORIAS] Iniciando carga de auditorías
12. 📈 [AUDITORIAS] Cargando estadísticas
13. ✅ [AUDITORIAS] Auditorías cargadas en XXms - Y registros
14. ✅ [AUDITORIAS] Estadísticas cargadas en XXms
```

**Tiempos esperados:**
- Queries individuales: **< 200ms**
- Carga total del módulo: **< 1 segundo**

---

### **PROBLEMA #1: Re-autenticación en cada navegación** ❌

Si ves esto en CADA navegación entre módulos:

```
🚀 [AUTH] AuthProvider montado - Iniciando verificación de sesión
🔍 [AUTH] Sesión actual: { hasSession: true, ... }
🔄 [AUTH] Cargando perfil para userId: xxx
⏱️ [AUTH] Query perfil tomó XXms
✅ [AUTH] Perfil cargado: { email: "...", rol: "..." }
```

**Diagnóstico:**
- ❌ AuthProvider se está **desmontando y remontando** en cada navegación
- ❌ Esto causa **consultas innecesarias** a la DB
- ❌ Ralentiza la navegación

**Causa probable:**
- Layout no está envolviendo correctamente con `<AuthProvider>`
- Provider está dentro de un componente que se re-renderiza

**Solución:**
- Verificar que `AuthProvider` esté en `app/layout.tsx` (raíz)
- NO debe estar dentro de navegación dinámica

---

### **PROBLEMA #2: Múltiples cargas de permisos** ❌

Si ves esto repetido 3+ veces al navegar:

```
🔑 [PERMISSIONS] Hook ejecutado: ...
⏳ [PERMISSIONS] Auth loading = true
⏳ [PERMISSIONS] Auth loading = true
⏳ [PERMISSIONS] Auth loading = true
✅ [PERMISSIONS] Permisos listos - Rol: Administrador
```

**Diagnóstico:**
- ❌ Hook de permisos se está ejecutando **múltiples veces**
- ❌ Re-renders innecesarios

**Causa probable:**
- Componente padre se está re-renderizando
- Dependencias en hooks mal configuradas

---

### **PROBLEMA #3: Queries duplicadas** ❌

Si ves lo mismo 2+ veces seguidas:

```
📊 [AUDITORIAS] Iniciando carga de auditorías
✅ [AUDITORIAS] Auditorías cargadas en 150ms - 50 registros
📊 [AUDITORIAS] Iniciando carga de auditorías  ← DUPLICADO
✅ [AUDITORIAS] Auditorías cargadas in 145ms - 50 registros
```

**Diagnóstico:**
- ❌ `useEffect` se está ejecutando **múltiples veces**
- ❌ Queries innecesarias a Supabase

**Causa probable:**
- Array de dependencias cambiando en cada render
- `useCallback` sin memoización correcta

---

### **PROBLEMA #4: Loading infinito** ❌

Si ves esto y se queda atascado:

```
🛡️ [PROTECTED_ROUTE] Renderizando para módulo: auditorias
⏳ [PROTECTED_ROUTE] Esperando carga... (auth: true, permisos: false)
⏳ [PROTECTED_ROUTE] Mostrando loading (auth: true, permisos: false)
⏳ [PROTECTED_ROUTE] Esperando carga... (auth: true, permisos: false)
⏳ [PROTECTED_ROUTE] Mostrando loading (auth: true, permisos: false)
```

**Diagnóstico:**
- ❌ `permisosLoading` nunca cambia a `false`
- ❌ Perfil cargado pero sin rol

**Causa probable:**
- Perfil no tiene campo `rol` en DB
- Query de perfil falla silenciosamente

---

## 🎯 INSTRUCCIONES DE PRUEBA

### Paso 1: Abrir DevTools Console
1. Presiona `F12` en el navegador
2. Ve a la pestaña **Console**
3. Limpia la consola (ícono 🚫 o Ctrl+L)

### Paso 2: Filtrar logs (opcional)
Para ver solo logs específicos:
```javascript
// En la consola, pega esto para filtrar:
console.defaultLog = console.log.bind(console)
console.logs = []
console.log = function(){
    console.logs.push(Array.from(arguments))
    console.defaultLog.apply(console, arguments)
}
```

O usa el filtro de Chrome:
- Busca: `[AUTH]` o `[PROTECTED_ROUTE]` o `[AUDITORIAS]`

### Paso 3: Navegar entre módulos
1. Ve a **Viviendas** → Espera 2 segundos
2. Ve a **Auditorías** → **COPIA TODOS LOS LOGS** 📋
3. Ve a **Proyectos** → **COPIA TODOS LOS LOGS** 📋
4. Regresa a **Auditorías** → **COPIA TODOS LOS LOGS** 📋

### Paso 4: Analizar patrones
Busca:
- ✅ ¿Cuántas veces aparece `[AUTH] AuthProvider montado`?
  - **Esperado:** 1 vez (al cargar la app)
  - **Problema:** 3+ veces (en cada navegación)

- ✅ ¿Cuántas veces aparece `[AUDITORIAS] Iniciando carga`?
  - **Esperado:** 1 vez por visita al módulo
  - **Problema:** 2+ veces en una sola visita

- ✅ ¿Cuál es el tiempo de carga promedio?
  - **Esperado:** < 500ms total
  - **Problema:** > 2 segundos

- ✅ ¿Hay logs de `⏳ Esperando carga...` que se repiten?
  - **Esperado:** 0-2 veces (carga rápida)
  - **Problema:** 10+ veces (loading infinito)

---

## 📝 REPORTE DE RESULTADOS

Por favor envíame:

1. **Screenshot de la consola** durante navegación problemática
2. **Copia del texto** de todos los logs (Ctrl+A en consola → Copiar)
3. **Respuestas:**
   - ¿Cuántas veces se monta AuthProvider?
   - ¿Cuántas veces se cargan auditorías en una visita?
   - ¿Cuánto tiempo toma la navegación total?
   - ¿Hay algún patrón que se repite sospechosamente?

---

## 🔧 SOLUCIONES RÁPIDAS

Si identificas alguno de estos problemas:

### **Si AuthProvider se remonta:**
```typescript
// Verificar app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>  {/* ← Debe estar aquí */}
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

### **Si hay queries duplicadas:**
```typescript
// Verificar que useCallback tenga dependencias correctas
const cargarDatos = useCallback(async () => {
  // ...
}, []) // ← Array vacío si no depende de nada
```

### **Si loading infinito:**
- Verificar que el perfil del usuario tenga `rol` en DB
- Verificar que `permisosLoading` llegue a `false`

---

## 🚀 PRÓXIMOS PASOS

Una vez identificado el problema:
1. **Comparte los logs** conmigo
2. **Identificaremos** el patrón problemático
3. **Aplicaremos** el fix específico
4. **Removeremos** los console.log para producción

---

**Nota:** Estos logs son temporales para debugging. Los removeremos una vez resuelto el problema.
