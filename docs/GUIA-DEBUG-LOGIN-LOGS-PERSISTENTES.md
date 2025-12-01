# 🔍 Guía para Debugear el Problema del Login con Logs Persistentes

## ⚠️ El Problema

Cuando haces logout y luego intentas iniciar sesión nuevamente, **el formulario se "recarga" (se limpia) justo antes de redirigir al dashboard**. Los logs normales de consola se perdían con la navegación.

## ✅ Solución: Logs Persistentes con sessionStorage

Ahora los logs **sobreviven a la navegación** usando `sessionStorage`. Verás TODO el flujo completo del login.

---

## 📋 Cómo Usar el Sistema de Debug

### 1️⃣ **Verás un Botón Flotante Azul**

En la página de login y en el dashboard, verás un botón flotante con un ícono de archivo (📄) en la esquina inferior derecha.

### 2️⃣ **Hacer el Test**

1. **Haz LOGOUT** desde el dashboard
2. **Abre la consola** del navegador (F12 → Pestaña Console)
3. **Haz LOGIN** nuevamente con tus credenciales

### 3️⃣ **Ver los Logs**

**Opción A: Botón Flotante (Recomendado)**
- Cuando cargue el dashboard, haz clic en el botón azul flotante
- Se abrirá un modal con TODOS los logs del proceso
- Verás timestamps exactos, componentes y mensajes
- Puedes copiar todo el contenido

**Opción B: Consola del Navegador**
```javascript
// Escribe en la consola:
debugLogger.printLogs()

// O también:
JSON.stringify(debugLogger.getLogs(), null, 2)
```

### 4️⃣ **Limpiar Logs**

Cuando termines de analizar:
```javascript
debugLogger.clearLogs()
```

O usa el botón "Limpiar" en el modal.

---

## 🔎 Qué Buscar en los Logs

Los logs tienen prefijos con emojis para identificar eventos:

### 🟢 Flujo Normal del Login

```
━━━ INICIO HANDLESUBMIT ━━━
📧 Email: usuario@mail.com
⏳ Estado loading activado
🔐 Llamando a signIn()...
✅ signIn() completado exitosamente
✨ Mostrando toast de éxito
👂 Configurando onAuthStateChange listener...
🔔 Auth event: SIGNED_IN | Session: true
🚀 SIGNED_IN detectado - Iniciando navegación
🎬 navegando=true activado
⏱️ Timeout cancelado
👋 Listener desuscrito
🔄 Invalidando queries...
➡️ Ejecutando router.push: /
✅ Navegación iniciada - Fin del proceso
```

### ❌ Lo Que Necesitamos Identificar

**Busca el momento EXACTO en que el formulario se "recarga":**

1. **¿Cuándo se activa `navegando=true`?**
   - Busca: `🎬 navegando=true activado`
   - Timestamp: ¿Cuánto después del login?

2. **¿Qué pasa entre `router.push()` y la carga del dashboard?**
   - Busca: `➡️ Ejecutando router.push`
   - ¿Hay logs de componente desmontándose?
   - Busca: `🔴 [PAGE] LoginForm desmontado`

3. **¿Se ejecuta INITIAL_SESSION o algún evento no esperado?**
   - Busca: `⚠️ INITIAL_SESSION ignorado`
   - Busca: `ℹ️ Evento no manejado`

4. **¿Cuántos milisegundos entre eventos clave?**
   - Compara timestamps entre:
     * `✅ signIn() completado`
     * `🚀 SIGNED_IN detectado`
     * `➡️ Ejecutando router.push`

---

## 📤 Qué Enviarme

### Opción 1: Desde el Modal (Más Fácil)

1. Abre el modal (botón flotante azul)
2. Toma una captura de pantalla de los logs
3. O copia todo el texto del modal

### Opción 2: Desde la Consola

1. Ejecuta:
   ```javascript
   copy(JSON.stringify(debugLogger.getLogs(), null, 2))
   ```
2. Pega el contenido en un archivo .txt o directamente en el chat

### Opción 3: Consola Normal

1. Toma capturas de TODA la consola desde el inicio del login
2. Asegúrate de que se vean los timestamps

---

## 🎯 Objetivo

Con estos logs voy a poder ver:

1. ✅ **Timing exacto** de cada evento (milisegundos)
2. ✅ **Orden de ejecución** (¿qué se ejecuta primero?)
3. ✅ **Eventos de Supabase** (SIGNED_IN, INITIAL_SESSION, etc.)
4. ✅ **Momento exacto** en que el formulario se desmonta
5. ✅ **Si `navegando=true` se activa a tiempo**

Con esto podré identificar **exactamente** qué causa que el formulario se vea "recargándose".

---

## 💡 Tip Adicional

Si quieres ver los logs en tiempo real mientras haces login:
1. Abre la consola ANTES de hacer login
2. Verás los logs aparecer en tiempo real con emojis
3. Los logs también se guardan en sessionStorage automáticamente

---

## 🚀 Resultado Esperado

Una vez identifiquemos el problema con los logs, voy a:
1. Ajustar el timing del overlay
2. Optimizar el listener de auth
3. Eliminar cualquier re-render innecesario
4. **Hacer que la transición sea perfecta sin "recarga" visible**

---

**¿Listo para probar?** 🎯

1. Cierra este archivo
2. Haz logout
3. Haz login con consola abierta
4. Click en el botón flotante azul
5. Copia los logs y envíamelos

¡Vamos a resolver esto! 💪
