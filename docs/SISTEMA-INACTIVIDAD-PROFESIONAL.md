# 🔒 Sistema Profesional de Inactividad - Nivel Enterprise

## 📋 Descripción

Sistema de seguridad de **nivel enterprise** que cierra automáticamente la sesión después de un período de inactividad, con advertencias escalonadas, modal interactivo y pantalla explicativa profesional.

---

## ✨ Características de Nivel Profesional

### 🎯 **1. Advertencias Escalonadas (3 Niveles)**

| Tiempo | Nivel | Comportamiento |
|--------|-------|----------------|
| **50 min** (83.3%) | ℹ️ INFO | Toast discreto con botón "Mantener activa" |
| **55 min** (91.7%) | ⚠️ WARNING | Modal con countdown y advertencia visual |
| **58 min** (96.7%) | 🚨 CRITICAL | Modal crítico con animación y alerta urgente |
| **60 min** (100%) | 🔒 LOGOUT | Cierre automático con explicación |

### 🔔 **2. Modal de Advertencia Interactivo**

- **Diseño premium**: Gradientes dinámicos según nivel de urgencia
- **Countdown visual**: Timer en tiempo real + barra de progreso
- **Animaciones**: Icon bounce en modo crítico
- **Acciones claras**:
  - ✅ Botón primario: "Mantener sesión activa"
  - ❌ Botón secundario: "Cerrar sesión"
- **Responsive**: Funciona perfectamente en móvil/tablet

### 📊 **3. Pantalla de Explicación**

Cuando se cierra por inactividad, el usuario ve:

- ✅ **Por qué se cerró** (inactividad)
- ✅ **Cuándo se cerró** (timestamp exacto)
- ✅ **Cómo funciona** el sistema (educativo)
- ✅ **Por qué existe** (seguridad de datos)
- ✅ **Botón para reiniciar** sesión

### 📝 **4. Logging Profesional**

```typescript
[IdleTimer] ▶️ Iniciando sistema de inactividad
[IdleTimer] ⚙️ Configuración: { timeoutMinutes: 60, warningLevels: {...} }
[IdleTimer] 🔍 Verificando inactividad: 83.5% (50 min)
[IdleTimer] ℹ️ Advertencia INFO: 10 min restantes
[IdleTimer] ⚠️ Advertencia WARNING: 5 min restantes
[IdleTimer] 🚨 Advertencia CRÍTICA: 2 min restantes
[IdleTimer] ♻️ Actividad detectada - Reiniciando timers
[IdleTimer] 🔒 Ejecutando logout por inactividad
[IdleTimer] 📊 Estado: { lastActivity, inactiveDuration, warningsShown }
```

### 🔄 **5. Sistema "Keep Alive" Robusto**

- **Detección automática** de actividad (mouse, teclado, scroll, touch)
- **Throttling inteligente** (no reiniciar en cada mousemove)
- **Botón manual** en modal y toasts
- **Feedback inmediato** con toast de confirmación

---

## 🏗️ Arquitectura (Separación Perfecta de Responsabilidades)

```
src/
├── hooks/
│   └── useIdleTimer.ts              # ✅ LÓGICA PURA (sin UI)
│                                    # - Estado en refs (sin closures)
│                                    # - Callbacks estables
│                                    # - API limpia
│
├── components/
│   ├── IdleTimerProvider.tsx        # ✅ ORQUESTADOR
│   │                                # - Integra hook + UI
│   │                                # - Maneja callbacks
│   │                                # - Coordina toasts
│   │
│   ├── modals/
│   │   └── IdleWarningModal.tsx     # ✅ UI PRESENTACIONAL
│   │                                # - Modal interactivo
│   │                                # - Countdown visual
│   │                                # - Barra de progreso
│   │
│   └── auth/
│       └── SessionClosedByInactivity.tsx  # ✅ PANTALLA EXPLICATIVA
│                                    # - Diseño educativo
│                                    # - Información clara
│                                    # - Call to action
│
└── app/
    ├── layout.tsx                   # ✅ INTEGRACIÓN
    │                                # - Monta provider
    │
    └── login/
        └── page.tsx                 # ✅ DETECCIÓN
                                     # - Detecta motivo cierre
                                     # - Muestra pantalla apropiada
```

---

## 🎯 Flujos de Usuario

### **Escenario 1: Usuario Activo Normal**

```
Usuario trabaja → Mueve mouse/teclas → Timer se reinicia constantemente → ✅ Sin interrupciones
```

### **Escenario 2: Inactividad con Recuperación Temprana**

```
50 min inactivo → Toast INFO → Usuario hace clic "Mantener activa" → Timer reinicia → ✅ Trabajo continúa
```

### **Escenario 3: Inactividad con Recuperación Tardía**

```
55 min inactivo → Modal WARNING → Countdown 5 min → Usuario hace clic "Mantener sesión" → ✅ Recuperado
```

### **Escenario 4: Inactividad Total (Logout)**

```
58 min inactivo → Modal CRÍTICO → 2 min countdown → Sin respuesta → 🔒 Logout automático
↓
Redirige a /login → Detecta sessionStorage['logout_reason'] === 'inactivity'
↓
Muestra pantalla explicativa con timestamp → Usuario entiende el por qué
↓
Botón "Iniciar sesión nuevamente" → ✅ Login normal
```

---

## ⚙️ Configuración

### **Tiempos Actuales** (`IdleTimerProvider.tsx`):

```typescript
useIdleTimer({
  timeoutMinutes: 60,  // 1 hora total
  enabled: !!user,     // Solo si hay sesión activa
  onWarning: handleWarning,
  onTimeout: handleTimeout,
})
```

### **Niveles de Advertencia** (`useIdleTimer.ts`):

```typescript
const WARNING_LEVELS = {
  info: 0.833,     // 83.3% del tiempo (50 min en 60 min)
  warning: 0.917,  // 91.7% del tiempo (55 min en 60 min)
  critical: 0.967, // 96.7% del tiempo (58 min en 60 min)
}
```

### **Modificar Tiempos**:

```typescript
// Ejemplo: 30 minutos con advertencias más tempranas
useIdleTimer({
  timeoutMinutes: 30,  // ← Cambiar aquí
  // Advertencias en: 25 min (info), 27.5 min (warning), 29 min (critical)
})
```

### **Desactivar Temporalmente** (desarrollo):

```typescript
useIdleTimer({
  timeoutMinutes: 60,
  enabled: false,  // ← Desactivar aquí
})
```

---

## 📊 API del Hook

### **`useIdleTimer(config)`**

**Returns:**
```typescript
{
  keepAlive: () => void,           // Reiniciar timer manualmente
  getRemainingTime: () => {        // Obtener tiempo restante
    remainingMs: number,
    remainingMinutes: number,
    remainingSeconds: number,
    progress: number,              // 0-1 (porcentaje)
  },
  resetActivity: () => void,       // Forzar reset (interno)
}
```

**Config:**
```typescript
interface IdleTimerConfig {
  timeoutMinutes?: number           // Default: 60
  enabled?: boolean                 // Default: true
  onWarning?: (                     // Callback de advertencias
    level: 'info' | 'warning' | 'critical',
    remainingMinutes: number
  ) => void
  onTimeout?: () => void            // Callback de logout
}
```

---

## 🔒 Persistencia de Estado

### **SessionStorage**:

Cuando se ejecuta logout por inactividad:

```typescript
sessionStorage.setItem('logout_reason', 'inactivity')
sessionStorage.setItem('logout_timestamp', Date.now().toString())
```

En la página de login:

```typescript
const reason = sessionStorage.getItem('logout_reason')
if (reason === 'inactivity') {
  // Mostrar pantalla explicativa
}
```

Se limpia automáticamente después de leer.

---

## ✅ Ventajas Sobre el Sistema Anterior

| Aspecto | Sistema Anterior | Sistema Nuevo |
|---------|-----------------|---------------|
| **Advertencias** | 1 nivel (5 min antes) | 3 niveles escalonados |
| **UI** | Solo toasts | Modal interactivo + toasts |
| **Explicación** | Ninguna | Pantalla dedicada educativa |
| **Logging** | Básico | Profesional y detallado |
| **Closures** | ❌ Problemas stale | ✅ Sin problemas (refs) |
| **Separación** | ❌ Mezclado | ✅ Perfecta |
| **Countdown** | ❌ No visual | ✅ Timer + barra progreso |
| **Educación** | ❌ Usuario confundido | ✅ Usuario informado |

---

## 🐛 Debugging

### **Ver logs en consola**:

```javascript
// Logs automáticos del sistema
[IdleTimer] ▶️ Iniciando...
[IdleTimer] 🔍 Verificando inactividad...
[IdleTimer] ⚠️ Advertencia NORMAL...
[IdleTimer] 🔒 Ejecutando logout...
```

### **Forzar logout (dev console)**:

```javascript
// Ejecutar en DevTools
sessionStorage.setItem('logout_reason', 'inactivity')
sessionStorage.setItem('logout_timestamp', Date.now().toString())
window.location.href = '/login'
```

### **Ver estado actual**:

```javascript
// En componente que usa el hook
const { getRemainingTime } = useIdleTimer({ /* config */ })
console.log(getRemainingTime())
// → { remainingMinutes: 10, progress: 0.833, ... }
```

---

## 📱 Responsive y Accesibilidad

### **✅ Responsive**:
- Modal adapta tamaño en móvil/tablet
- Textos legibles en pantallas pequeñas
- Botones táctiles apropiados

### **✅ Accesibilidad**:
- Focus trap en modal
- ESC para cerrar (mantiene sesión)
- Click en backdrop (mantiene sesión)
- Contraste WCAG AAA
- Textos descriptivos

---

## 🚀 Próximas Mejoras (Opcionales)

- [ ] **Notificaciones del sistema** (browser notifications API)
- [ ] **Sonido de alerta** en nivel crítico (opcional)
- [ ] **Configuración por rol** (admin → 2h, usuario → 1h)
- [ ] **Historial de cierres** por inactividad (auditoría)
- [ ] **Dashboard de inactividad** (métricas)

---

## 📚 Referencias

- **Hooks**: `src/hooks/useIdleTimer.ts`
- **Provider**: `src/components/IdleTimerProvider.tsx`
- **Modal**: `src/components/modals/IdleWarningModal.tsx`
- **Pantalla**: `src/components/auth/SessionClosedByInactivity.tsx`
- **Integración**: `src/app/layout.tsx`

---

**Sistema implementado el 15 de diciembre de 2025 ✅**
