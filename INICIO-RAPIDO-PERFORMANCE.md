# 🚀 INICIO RÁPIDO - Performance Monitor

## ✅ Instalación Completa

El sistema de monitoreo de rendimiento ya está **100% instalado y configurado**.

---

## 🎮 Cómo Usar (3 Pasos)

### 1️⃣ Abre tu aplicación
```
Tu servidor ya está corriendo en:
http://localhost:3000
```

### 2️⃣ Activa el Panel de Debug
Presiona las teclas:
```
Ctrl + Shift + P
```

Verás aparecer un panel flotante morado/rosa en la esquina superior derecha.

### 3️⃣ Navega y Observa
- Click en **Clientes** → Observa el tiempo de carga
- Click en **Proyectos** → Compara el tiempo
- Click en **Abonos** → ¿Es más lento?
- Click en **Viviendas** → Mide el rendimiento

---

## 📊 Qué Vas a Ver

### En el Panel Flotante:
```
┌─────────────────────────────────────────┐
│  Performance Monitor                    │
├─────────────────────────────────────────┤
│  Ruta actual: /clientes                 │
│  Total navegaciones: 5                  │
│  Tiempo promedio: 342.5ms               │
│                                         │
│  Renders: 2                             │
│                                         │
│  Última carga:                          │
│    Primer render: 2.4ms                 │
│    Datos cargados: 245.7ms    (verde)   │
│    Total: 245.7ms             (verde)   │
│                                         │
│  Ruta más lenta:                        │
│    /abonos - 1.2s             (rojo)    │
│                                         │
│  [Limpiar] [Exportar]                   │
└─────────────────────────────────────────┘
```

### En la Consola del Navegador (F12):
```
🚀 NAVEGACIÓN → /clientes (ClientesPageMain)
🔖 Datos cargados (124 clientes) +245.67ms
📊 MÉTRICAS - /clientes
  ⏱️  Primer Render: 2.45ms
  📦 Datos Cargados: 245.67ms
  🎯 Tiempo Total: 245.67ms
  🔄 Re-renders: 2
```

---

## 🎨 Código de Colores

- **Verde** (< 500ms) = ✅ **Excelente rendimiento**
- **Amarillo** (< 1s) = ⚠️ **Aceptable**
- **Rojo** (> 1s) = ❌ **Lento - Necesita optimización**

---

## 🔥 Test Rápido

1. Refresca tu navegador (F5)
2. Presiona `Ctrl + Shift + P`
3. Navega: Clientes → Abonos → Proyectos → Viviendas
4. Observa qué módulo tarda más
5. Comparte los resultados:
   ```
   Click en "Exportar Reporte"
   Se copia al portapapeles
   Pega en un mensaje
   ```

---

## 🐛 Problemas Comunes

### "No veo el panel"
- ✅ Verifica que estés en modo desarrollo (`npm run dev`)
- ✅ Presiona `Ctrl + Shift + P` nuevamente
- ✅ Refresca la página (F5)

### "El panel se ve raro"
- Arrastra el panel desde el header (área morada)
- Puedes moverlo a cualquier parte de la pantalla

### "No veo métricas"
- Navega entre módulos primero
- Las métricas aparecen después de la primera navegación

---

## 📚 Documentación Completa

Para detalles avanzados, ver:
**`docs/GUIA-PERFORMANCE-MONITOR.md`**

---

## ✨ Próximos Pasos

1. **Identifica el módulo más lento**
2. **Exporta el reporte**
3. **Comparte los tiempos** para análisis
4. **Optimizaremos** el código según los resultados

---

**Todo listo! Presiona `Ctrl + Shift + P` y empieza a medir! 🎯**
