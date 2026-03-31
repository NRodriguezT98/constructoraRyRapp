# 🚀 Guía de Prueba en Modo Producción

## 🎯 Opciones Disponibles

Tienes **3 formas** de probar la aplicación en modo producción:

---

### ✅ **OPCIÓN 1: Todo en Uno (RECOMENDADO)**

Ejecuta un solo comando que hace todo el proceso:

```powershell
.\test-production.ps1
```

**Qué hace:**
1. ✅ Verifica configuración
2. 🧹 Limpia builds anteriores
3. 📦 Construye la aplicación optimizada
4. 🚀 Inicia el servidor en `http://localhost:3000`

**Tiempo estimado:** 1-3 minutos (dependiendo del hardware)

---

### ⚙️ **OPCIÓN 2: Paso a Paso**

Si prefieres tener control total:

#### Paso 1: Construir
```powershell
.\build-production.ps1
```

#### Paso 2: Iniciar
```powershell
.\start-production.ps1
```

**Ventaja:** Puedes construir una vez y reiniciar el servidor varias veces sin reconstruir.

---

### 🛠️ **OPCIÓN 3: Comandos NPM Directos**

Si prefieres los comandos tradicionales:

```powershell
# Limpiar (opcional)
npm run clean

# Construir
npm run build

# Iniciar
npm start
```

---

## 📊 Métricas que Verás

Durante el proceso verás:

```
🔍 Verificando configuración...
   ✅ Archivo .env.local encontrado

📁 [1/3] Limpiando builds anteriores...
   ✅ Carpeta .next eliminada

📦 [2/3] Creando build de producción...
   [Logs de Next.js...]

✅ Build completado exitosamente!
   ⏱️  Tiempo de build: 45.32 segundos
   📦 Tamaño del build: 85.4 MB
   📄 Archivos generados: 1,245

🚀 [3/3] Iniciando servidor de producción...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ SERVIDOR DE PRODUCCIÓN INICIADO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   🌐 URL Local:      http://localhost:3000
   🔧 Modo:           Producción (optimizado)
   ⚡ Performance:    Máxima optimización
```

---

## 🧪 Checklist de Pruebas

Una vez que el servidor esté corriendo:

### ✅ **Funcionalidad Básica**
- [ ] Página de login carga correctamente
- [ ] Login con credenciales válidas funciona
- [ ] **Toast notification** aparece al iniciar sesión ✨ NUEVO
- [ ] Redirección después del login funciona
- [ ] Middleware protege rutas correctamente

### ✅ **Nuevo Sidebar Compact** ✨
- [ ] Sidebar aparece compacto (72px) al cargar
- [ ] Hover sobre sidebar lo expande a 280px
- [ ] Transición es suave y sin lag
- [ ] Tooltips aparecen cuando está colapsado
- [ ] Grupos se pueden colapsar/expandir
- [ ] Colores únicos por módulo funcionan
- [ ] Indicador de ruta activa se muestra correctamente

### ✅ **Navegación**
- [ ] Cambiar entre módulos es instantáneo
- [ ] No hay parpadeos ni recargas
- [ ] URL cambia correctamente
- [ ] Botón "atrás" del navegador funciona

### ✅ **Modo Oscuro**
- [ ] Toggle de tema funciona
- [ ] Sidebar se ve bien en ambos modos
- [ ] Transiciones de color son suaves
- [ ] No hay elementos con colores incorrectos

### ✅ **Performance**
- [ ] Página carga rápido (< 2 segundos)
- [ ] No hay warnings en consola
- [ ] No hay errores 404
- [ ] Imágenes cargan correctamente

### ✅ **Mobile / Responsive**
- [ ] Sidebar se oculta en mobile
- [ ] Botón de menú móvil funciona
- [ ] Overlay oscuro aparece al abrir sidebar
- [ ] Cerrar sidebar en mobile funciona

### ✅ **Módulos Principales**
- [ ] Dashboard muestra datos
- [ ] Proyectos carga correctamente
- [ ] Viviendas funciona
- [ ] Clientes funciona
- [ ] Otros módulos accesibles

---

## 🐛 Troubleshooting

### ❌ Error: "Cannot find module..."
**Solución:**
```powershell
npm install
.\test-production.ps1
```

### ❌ Error: "Port 3000 already in use"
**Solución:**
```powershell
# Detener proceso en puerto 3000
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force

# O cambiar puerto en package.json:
# "start": "next start -p 3001"
```

### ❌ Build muy lento
**Causas comunes:**
- Primera vez siempre es más lenta
- Antivirus escaneando archivos
- Disco duro lento (considera SSD)

**Solución:**
```powershell
# Limpiar caché y reconstruir
npm run clean
npm install
.\test-production.ps1
```

### ❌ Variables de entorno no funcionan
**Solución:**
1. Verifica que `.env.local` existe
2. Verifica que tiene las variables de Supabase:
   ```
   NEXT_PUBLIC_SUPABASE_URL=tu-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-key
   ```
3. Reconstruye:
   ```powershell
   .\test-production.ps1
   ```

---

## 📊 Comparación: Dev vs Producción

| Aspecto | Dev (npm run dev) | Producción (npm start) |
|---------|-------------------|------------------------|
| **Inicio** | ~5 segundos | ~1 segundo |
| **Optimización** | No optimizado | Totalmente optimizado |
| **Tamaño** | ~200 MB | ~85 MB |
| **Hot Reload** | ✅ Sí | ❌ No |
| **Source Maps** | ✅ Completos | ⚠️ Limitados |
| **Performance** | Lenta | **Máxima** |
| **Minificación** | No | ✅ Sí |
| **Code Splitting** | Básico | ✅ Avanzado |
| **Caching** | Mínimo | ✅ Agresivo |

---

## 🎯 Diferencias Clave que Notarás

1. **Carga Inicial**: 3-5x más rápida
2. **Navegación**: Casi instantánea
3. **Tamaño de Bundle**: Mucho más pequeño
4. **Animaciones**: Más suaves (60 FPS)
5. **Imágenes**: Optimizadas automáticamente
6. **CSS**: Minificado y optimizado
7. **JavaScript**: Minificado y tree-shaken

---

## ✨ Nuevas Características para Probar

### 1. **Toast de Login Exitoso**
- Al iniciar sesión verás una notificación moderna
- Se muestra por 2 segundos antes de redirigir
- Mensaje personalizado según destino

### 2. **Sidebar Compact Floating**
- Diseño compacto por defecto (72px)
- Hover para expandir automáticamente (280px)
- Grupos colapsables
- Tooltips informativos
- Colores únicos por módulo

### 3. **Performance**
- Navegación instantánea sin recargas
- Optimización de imágenes automática
- Code splitting inteligente

---

## 🚀 ¿Listo para Producción?

Si todas las pruebas pasan:

```powershell
# La aplicación está lista para deploy en:
# - Vercel
# - Netlify
# - VPS (con PM2)
# - Docker
# - Cloud (AWS, Azure, GCP)
```

---

## 📞 Soporte

Si encuentras problemas:
1. Revisa la consola del navegador (F12)
2. Revisa la consola del servidor
3. Verifica logs de build
4. Consulta la documentación de Next.js

---

**¡Disfruta probando la aplicación en modo producción!** 🎉
