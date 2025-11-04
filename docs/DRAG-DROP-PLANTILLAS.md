# 🎯 Drag & Drop para Reordenamiento de Pasos en Plantillas

## 📋 Resumen

Implementación de funcionalidad drag & drop para reordenar pasos en el editor de plantillas de proceso utilizando Framer Motion's Reorder component.

---

## ✨ Características Implementadas

### 1. **Reordenamiento Visual**
- Arrastrar y soltar pasos para cambiar su orden
- Feedback visual durante el arrastre (escala, sombra)
- Animaciones suaves al reordenar

### 2. **Handle de Arrastre**
- Ícono `GripVertical` como indicador visual
- Cursor cambia a `grab` / `grabbing`
- Color cambia a azul en hover para mayor claridad

### 3. **Persistencia de Orden**
- El orden se actualiza en tiempo real en el estado
- Al guardar, se asigna `orden: index + 1` a cada paso
- Sin necesidad de refrescar la página

---

## 🏗️ Arquitectura de Componentes

```
FormularioPlantilla
├── Reorder.Group (contenedor)
│   ├── axis="y" (vertical)
│   ├── values={pasos}
│   └── onReorder={handleReordenar}
│
└── PasoPlantillaItem (cada paso)
    ├── Reorder.Item
    │   ├── value={paso}
    │   ├── whileDrag (animaciones)
    │   └── style (cursor)
    │
    └── GripVertical (handle)
```

---

## 📁 Archivos Modificados

### 1. `formulario-plantilla.tsx`

**Imports:**
```typescript
import { Reorder } from 'framer-motion'
```

**Handler:**
```typescript
// Handler para reordenar pasos mediante drag & drop
const handleReordenar = (nuevoPasos: PasoPlantilla[]) => {
  setPasos(nuevoPasos)
}
```

**Render:**
```tsx
<Reorder.Group
  axis="y"
  values={pasos}
  onReorder={handleReordenar}
  className="space-y-3"
>
  {pasos.map((paso, index) => (
    <PasoPlantillaItem key={paso.id} ... />
  ))}
</Reorder.Group>
```

### 2. `paso-plantilla-item.tsx`

**Imports:**
```typescript
import { Reorder } from 'framer-motion'
```

**Componente:**
```tsx
<Reorder.Item
  value={paso}
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, x: -20 }}
  transition={{ duration: 0.2 }}
  className={styles.pasoItem.container(hasErrors)}
  style={{ cursor: 'grab' }}
  whileDrag={{
    cursor: 'grabbing',
    scale: 1.02,
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
    zIndex: 1000
  }}
>
  {/* Contenido del paso */}
</Reorder.Item>
```

### 3. `formulario-plantilla.styles.ts`

**Estilos mejorados:**
```typescript
gripIcon: 'w-5 h-5 text-gray-400 flex-shrink-0 cursor-grab active:cursor-grabbing hover:text-blue-500 transition-colors'
```

---

## 🎨 Experiencia de Usuario

### Estados Visuales:

| Estado | Efecto Visual |
|--------|--------------|
| **Normal** | GripVertical gris, cursor grab |
| **Hover** | GripVertical azul |
| **Arrastrando** | Escala 1.02, sombra elevada, cursor grabbing |
| **Soltando** | Animación suave a nueva posición |

### Animaciones:

- **Entrada**: Fade in + slide desde abajo (0.2s)
- **Salida**: Fade out + slide a la izquierda (0.2s)
- **Drag**: Scale up + sombra elevada
- **Reorder**: Smooth transition entre posiciones

---

## 🔧 Cómo Funciona

### 1. **Estado Local**
```typescript
const [pasos, setPasos] = useState<PasoPlantilla[]>([])
```

### 2. **Drag & Drop**
- Usuario arrastra un paso por el handle `GripVertical`
- `Reorder.Group` detecta el movimiento
- Array `pasos` se reordena automáticamente
- `handleReordenar()` actualiza el estado

### 3. **Guardado**
```typescript
const handleGuardar = async () => {
  const pasosConOrden = pasos.map((paso, index) => ({
    ...paso,
    orden: index + 1  // ✅ Orden basado en posición actual
  }))

  await guardarPlantilla({ pasos: pasosConOrden })
}
```

---

## ✅ Ventajas de Framer Motion Reorder

1. **Simplicidad**: Sin configuración compleja de DnD
2. **Animaciones**: Smooth transitions automáticas
3. **Tamaño**: Ya está instalado (usado en toda la app)
4. **Performance**: Optimizado para React
5. **Touch**: Funciona en dispositivos móviles

---

## 🧪 Testing Manual

### Escenarios de Prueba:

1. ✅ Arrastrar primer paso al final
2. ✅ Arrastrar último paso al principio
3. ✅ Reordenar paso en medio
4. ✅ Soltar paso en misma posición (no cambios)
5. ✅ Guardar plantilla con nuevo orden
6. ✅ Cargar plantilla y verificar orden guardado
7. ✅ Reordenar mientras paso está expandido
8. ✅ Funcionalidad touch en móvil

---

## 🎯 Mejoras Futuras

- [ ] Toast de confirmación al reordenar
- [ ] Indicador visual de "drop zone"
- [ ] Deshacer/Rehacer cambios de orden
- [ ] Atajos de teclado (↑↓ para reordenar)
- [ ] Drag & drop entre plantillas (copiar pasos)

---

## 📚 Referencias

- [Framer Motion Reorder](https://www.framer.com/motion/reorder/)
- [Drag Controls](https://www.framer.com/motion/drag/)
- [Layout Animations](https://www.framer.com/motion/layout-animations/)

---

**Fecha de implementación**: Enero 2025
**Versión**: 1.0.0
**Framework**: Framer Motion 12.23.24
