# 🔧 Modo Desarrollo - Módulo de Procesos

## 📋 Descripción

Sistema para probar plantillas de proceso en tiempo real sin necesidad de crear nuevos clientes.

## ⚙️ Activación del Modo Desarrollo

### 1. Configurar Variable de Entorno

Agrega esta línea a tu archivo `.env.local`:

```bash
# Activar modo desarrollo para módulo de procesos
NEXT_PUBLIC_DEV_MODE=true
```

### 2. Reiniciar el Servidor

```bash
npm run dev
```

## 🎯 Funcionalidades Disponibles

### Botón "🔧 DEV: Recargar Plantilla"

**Ubicación:** Tab "Actividad" de cualquier cliente con negociación activa

**Función:**
- Elimina todos los pasos actuales del proceso
- Recarga los pasos desde la plantilla predeterminada actual
- Mantiene los documentos ya subidos (no los elimina)
- Refresca automáticamente la vista

**Flujo de Uso:**

1. **Editar Plantilla:**
   - Ve a `Admin → Procesos`
   - Edita la plantilla predeterminada
   - Agrega, elimina o modifica pasos
   - Guarda los cambios

2. **Probar en Cliente:**
   - Ve a cualquier cliente con negociación
   - Haz clic en tab "Actividad"
   - Presiona el botón "🔧 DEV: Recargar Plantilla"
   - Confirma la acción
   - ✅ Los pasos se actualizan inmediatamente

3. **Iterar:**
   - Vuelve a editar la plantilla
   - Recarga nuevamente desde el cliente
   - Repite hasta que la plantilla esté perfecta

## ⚠️ Advertencias de Seguridad

### ❌ NUNCA en Producción

Este modo **DEBE estar desactivado** en producción:

```bash
# En producción (.env.production):
NEXT_PUBLIC_DEV_MODE=false
# O simplemente no incluir la variable
```

### 🚨 Razones:

1. **Datos Reales:** En producción hay clientes reales con procesos activos
2. **Pérdida de Progreso:** Recargar plantilla elimina el progreso real del cliente
3. **Confusión:** Los usuarios reales no deben ver esta opción
4. **Auditoría:** Se pierde el historial de cambios en procesos

## 📊 Comportamiento Esperado

### ✅ Con `NEXT_PUBLIC_DEV_MODE=true`:

```
┌─────────────────────────────────────────────┐
│  Proceso de Compra    75% Completado  🔧 DEV │
│                                       Recargar│
└─────────────────────────────────────────────┘
```

### ✅ Sin la variable (Producción):

```
┌─────────────────────────────────────────────┐
│  Proceso de Compra    75% Completado         │
│                                              │
└─────────────────────────────────────────────┘
```

## 🔄 Proceso de Recarga

```
1. Usuario presiona "Recargar Plantilla"
   ↓
2. Confirmación con warning
   ↓
3. Busca plantilla predeterminada activa
   ↓
4. Elimina pasos actuales de procesos_negociacion
   ↓
5. Crea nuevos pasos desde plantilla.pasos
   ↓
6. Refresca automáticamente la página
   ↓
7. ✅ Timeline actualizado con nuevos pasos
```

## 📝 Ejemplo de Uso Real

### Escenario: Agregar nuevo paso "Avalúo de Vivienda"

**Paso 1:** Editar plantilla
```typescript
// En Admin → Procesos → Editar Plantilla
Agregar paso:
- Nombre: "Avalúo de Vivienda"
- Orden: 4
- Obligatorio: Sí
- Documentos: ["Certificado de Avalúo"]
```

**Paso 2:** Guardar plantilla
- Clic en "Guardar Plantilla"
- ✅ Plantilla actualizada

**Paso 3:** Probar en cliente existente
```
1. Ir a Cliente → Juan Pérez
2. Tab "Actividad"
3. Clic "🔧 DEV: Recargar Plantilla"
4. Confirmar
5. ✅ Ahora ves el nuevo paso en el timeline
```

**Paso 4:** Iterar si es necesario
- Si el paso necesita ajustes, vuelve al Paso 1
- Recarga nuevamente desde el cliente
- Repite hasta que esté perfecto

## 🎨 Vista del Botón

El botón aparece con:
- 🟡 Fondo ámbar/amarillo (color de warning)
- 🔧 Ícono de herramienta + texto "DEV"
- ♻️ Ícono RefreshCw que gira durante la recarga
- 🔒 Se deshabilita mientras recarga

## 🐛 Troubleshooting

### El botón no aparece:

1. Verifica `.env.local`:
   ```bash
   NEXT_PUBLIC_DEV_MODE=true
   ```

2. Reinicia el servidor:
   ```bash
   npm run dev
   ```

3. Limpia caché del navegador (Ctrl + Shift + R)

### Error "No se encontró plantilla predeterminada":

1. Ve a `Admin → Procesos`
2. Asegúrate de tener al menos una plantilla
3. Marca una como "Predeterminada"
4. Verifica que esté activa

### Los pasos no se recargan:

1. Verifica la consola del navegador (F12)
2. Chequea errores en terminal del servidor
3. Verifica permisos de la base de datos
4. Asegúrate que la negociación tenga ID válido

## 📚 Archivos Modificados

- `src/modules/admin/procesos/components/timeline-proceso.tsx`
  - Agregada constante `IS_DEV_MODE`
  - Agregada función `handleRecargarPlantilla()`
  - Agregado botón condicional en Header

## ✅ Checklist Pre-Producción

Antes de desplegar a producción:

- [ ] Remover o comentar `NEXT_PUBLIC_DEV_MODE=true` de `.env.local`
- [ ] Agregar `NEXT_PUBLIC_DEV_MODE=false` a `.env.production`
- [ ] Verificar que el botón NO aparezca en build de producción
- [ ] Documentar claramente que esta función es solo desarrollo
- [ ] Agregar comentarios en código indicando propósito de desarrollo

## 🎯 Conclusión

Este modo desarrollo te permite:
- ✅ Probar plantillas rápidamente
- ✅ Iterar sin crear clientes nuevos
- ✅ Ver cambios en tiempo real
- ✅ Acelerar el proceso de desarrollo

**Pero NUNCA debe estar activo en producción.**

---

**Fecha:** 2025-10-27
**Autor:** Sistema de Gestión RyR Constructora
