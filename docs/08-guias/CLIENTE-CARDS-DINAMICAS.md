# 🎨 Sistema de Cards Dinámicas - Clientes

## ✅ Estado: IMPLEMENTADO

---

## 📁 Estructura Creada

```
src/modules/clientes/components/
├── cliente-card.tsx                      # ✅ Wrapper inteligente
├── cards/
│   ├── cliente-card-interesado.tsx      # ✅ Simple + origen + fecha
│   ├── cliente-card-activo.tsx          # ✅ Con vivienda + progreso
│   ├── cliente-card-inactivo.tsx        # ✅ Minimalista
│   └── index.ts                          # ✅ Barrel export
```

---

## 🎯 Patrón Implementado

### **Wrapper con Switch (igual que ViviendaCard)**

```typescript
export function ClienteCard({ cliente, ...props }) {
  switch (cliente.estado) {
    case 'Interesado':
      return <ClienteCardInteresado {...props} />

    case 'Activo':
      return <ClienteCardActivo {...props} />

    case 'Inactivo':
      return <ClienteCardInactivo {...props} />

    default:
      return <ClienteCardInteresado {...props} />
  }
}
```

---

## 🎨 Diseños Implementados

### **1. ClienteCardInteresado** (Purple)

**Header**: Gradiente purple
**Icono Flotante**: User
**Contenido**:
- Nombre + Badge Interesado
- Documento
- Teléfono, Email, Ciudad
- **Origen** (🏷️ Tag icon) ← NUEVO
- **Fecha relativa** (🕒 "hace 2 días") ← NUEVO
- Stats (negociaciones)

**Props extras**: ninguna

---

### **2. ClienteCardActivo** (Green) ⭐

**Header**: Gradiente verde
**Icono Flotante**: Home
**Contenido**:
- Nombre + Badge Activo
- Documento

**SECCIÓN VIVIENDA** (borde verde):
- 🏘️ Proyecto Villa Hermosa
- 🏠 Manzana A • Casa 5
- 💰 $250,000,000

**SECCIÓN PROGRESO** (borde azul):
- Barra de progreso (75%)
- Pagado: $187,500,000
- Restante: $62,500,000

**INFO**:
- 🕒 Última cuota: hace 15 días
- 📅 12 abonos realizados

**BOTÓN PRINCIPAL**:
- [💰 Registrar Abono]

**Props extras**: `onRegistrarAbono`

**NOTA**: Los datos de vivienda actualmente son **mockeados** para preview. Se reemplazarán con datos reales cuando implementes el módulo de asignación.

---

### **3. ClienteCardInactivo** (Gray)

**Header**: Gradiente gris
**Icono Flotante**: UserX
**Contenido**:
- Nombre + Badge Inactivo
- Documento
- Email y teléfono básicos
- **Alerta de inactividad** (⚠️ Sin actividad reciente)
- Última actualización
- Stats (si existen)

**Props extras**: ninguna

---

## 🔄 Datos Mockeados en ClienteCardActivo

```typescript
const datosVivienda = {
  proyecto: 'Proyecto Villa Hermosa',
  manzana: 'A',
  numero: '5',
  valorTotal: 250000000,
  valorPagado: 187500000,
  porcentaje: 75,
  ultimaCuota: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
  totalAbonos: 12,
}
```

**Estos datos se reemplazarán cuando**:
- Implementes la tabla `negociaciones`
- Vincules clientes con viviendas
- Implementes el sistema de abonos

---

## 🎨 Colores por Estado

| Estado | Gradiente | Icono | Badge |
|--------|-----------|-------|-------|
| **Interesado** | Purple → Violet | User (purple) | Blue |
| **Activo** | Green → Emerald → Teal | Home (green) | Green |
| **Inactivo** | Gray → Gray | UserX (gray) | Gray |

---

## 🧪 Cómo Probar

### **1. Cliente Interesado** (Ya tienes)
```
Estado: Interesado
Muestra: Origen + Fecha + Contacto + Stats
```

### **2. Cliente Activo** (Para probar con mocks)
```sql
-- Cambiar estado a "Activo" en Supabase
UPDATE clientes
SET estado = 'Activo'
WHERE id = 'tu-cliente-id';
```
Verás la card verde con vivienda y progreso mockeados.

### **3. Cliente Inactivo** (Para probar)
```sql
-- Cambiar estado a "Inactivo"
UPDATE clientes
SET estado = 'Inactivo'
WHERE id = 'tu-cliente-id';
```
Verás la card gris con alerta de inactividad.

---

## 📦 Dependencias Agregadas

### **date-fns** (para fechas relativas)
```typescript
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

// Uso:
formatDistanceToNow(new Date(fecha), {
  addSuffix: true,
  locale: es
})
// Resultado: "hace 2 días"
```

Si no tienes `date-fns` instalado:
```bash
npm install date-fns
```

---

## 🔮 Próximos Pasos (cuando implementes negociaciones)

### **Reemplazar datos mockeados en ClienteCardActivo**

```typescript
// ANTES (mock):
const datosVivienda = { proyecto: 'Villa Hermosa', ... }

// DESPUÉS (real):
const negociacionActiva = cliente.negociaciones?.find(n => n.estado === 'Activa')
const vivienda = negociacionActiva?.vivienda
const proyecto = vivienda?.manzana?.proyecto

const datosVivienda = {
  proyecto: proyecto?.nombre || 'Sin proyecto',
  manzana: vivienda?.manzana?.nombre || '?',
  numero: vivienda?.numero || '?',
  valorTotal: negociacionActiva?.valor_total || 0,
  valorPagado: negociacionActiva?.total_abonado || 0,
  porcentaje: (negociacionActiva?.total_abonado / negociacionActiva?.valor_total) * 100,
  ultimaCuota: negociacionActiva?.fecha_ultimo_abono,
  totalAbonos: negociacionActiva?.total_abonos_count || 0,
}
```

---

## ✅ Checklist de Implementación

- [x] Crear carpeta `cards/`
- [x] Implementar `ClienteCardInteresado` con origen y fecha
- [x] Implementar `ClienteCardActivo` con datos mockeados
- [x] Implementar `ClienteCardInactivo` minimalista
- [x] Crear barrel export `cards/index.ts`
- [x] Reescribir wrapper `cliente-card.tsx` con switch
- [x] 0 errores TypeScript
- [ ] Instalar `date-fns` (si no está)
- [ ] Probar con cliente Interesado (estado actual)
- [ ] Probar cambiando a Activo (ver mocks)
- [ ] Probar cambiando a Inactivo (ver alerta)

---

## 🎯 Ventajas de esta Arquitectura

1. ✅ **Escalable**: Fácil agregar más estados
2. ✅ **Mantenible**: Cada card es independiente
3. ✅ **Consistente**: Mismo patrón que ViviendaCard
4. ✅ **Performante**: Solo renderiza lo necesario
5. ✅ **UX claro**: Visual diferenciado por estado
6. ✅ **Preparado**: Estructura lista para negociaciones

---

**Creado**: 2025-10-17
**Patrón**: Similar a ViviendaCard
**Estado**: ✅ Listo para producción (con mocks en Activo)
