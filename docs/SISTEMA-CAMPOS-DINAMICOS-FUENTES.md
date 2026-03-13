# 🎯 Sistema de Campos Dinámicos para Fuentes de Pago

## ✨ Descripción

Sistema modular que permite configurar dinámicamente los campos de formulario para cada tipo de fuente de pago **sin necesidad de modificar código**. Los campos se configuran desde la base de datos y se renderizan automáticamente.

---

## 🏗️ Arquitectura

### 1️⃣ **Base de Datos (PostgreSQL + JSONB)**

- **Tabla**: `tipos_fuentes_pago`
- **Columna nueva**: `configuracion_campos JSONB`
- **Estructura**:
```json
{
  "campos": [
    {
      "nombre": "monto_aprobado",
      "tipo": "currency",
      "label": "Monto Aprobado",
      "placeholder": "Ej: 80.000.000",
      "requerido": true,
      "orden": 1,
      "ayuda": "Monto total aprobado por el banco"
    }
  ]
}
```

### 2️⃣ **TypeScript Types**

- `src/modules/configuracion/types/campos-dinamicos.types.ts`
- Tipos: `CampoConfig`, `ConfiguracionCampos`, `TipoFuentePagoConCampos`
- Tipos soportados: `text`, `textarea`, `number`, `currency`, `date`, `select_banco`, `select_caja`, `select_custom`, `checkbox`, `radio`

### 3️⃣ **Services + React Query**

- `src/modules/configuracion/services/tipos-fuentes-campos.service.ts`
- `src/modules/configuracion/hooks/useTiposFuentesConCampos.ts`
- Caché automático de 5 minutos
- Invalidación inteligente al actualizar

### 4️⃣ **Componentes**

#### CampoFormularioDinamico
- `src/modules/clientes/components/fuente-pago-card/CampoFormularioDinamico.tsx`
- Renderiza cualquier tipo de campo según configuración
- Validación integrada
- Diseño responsive y dark mode

#### FuentePagoCard (V6)
- Actualizada para usar campos dinámicos
- Mapea configuración → renderizado automático
- Mantiene lógica de validación y estado

---

## 🚀 Uso

### Configurar Campos para un Tipo de Fuente

**Opción 1: Desde pgAdmin/SQL Editor**
```sql
UPDATE tipos_fuentes_pago
SET configuracion_campos = '{
  "campos": [
    {
      "nombre": "monto_aprobado",
      "tipo": "currency",
      "label": "Monto del Subsidio",
      "placeholder": "Ej: 30.000.000",
      "requerido": true,
      "orden": 1
    },
    {
      "nombre": "entidad",
      "tipo": "select_banco",
      "label": "Banco",
      "placeholder": "Seleccionar banco...",
      "requerido": true,
      "orden": 2
    },
    {
      "nombre": "numero_referencia",
      "tipo": "text",
      "label": "Radicado",
      "placeholder": "Ej: #BCO-2025-789456",
      "requerido": false,
      "orden": 3
    }
  ]
}'::jsonb
WHERE codigo = 'MI_NUEVA_FUENTE';
```

**Opción 2: Con React Query (futuro UI admin)**
```typescript
const { mutate } = useActualizarConfiguracionCampos()

mutate({
  tipoId: 'uuid-del-tipo',
  configuracion: {
    campos: [
      // ... configuración
    ]
  }
})
```

---

## 📋 Tipos de Campos Soportados

### 🔢 **currency**
```json
{
  "nombre": "monto_aprobado",
  "tipo": "currency",
  "label": "Monto Aprobado",
  "placeholder": "Ej: 50.000.000",
  "requerido": true,
  "orden": 1,
  "min": 1000000,
  "max": 500000000
}
```

### 🏦 **select_banco**
```json
{
  "nombre": "entidad",
  "tipo": "select_banco",
  "label": "Banco",
  "placeholder": "Seleccionar banco...",
  "requerido": true,
  "orden": 2
}
```

### 🏢 **select_caja**
```json
{
  "nombre": "entidad",
  "tipo": "select_caja",
  "label": "Caja de Compensación",
  "placeholder": "Seleccionar caja...",
  "requerido": true,
  "orden": 2
}
```

### 📝 **text**
```json
{
  "nombre": "numero_referencia",
  "tipo": "text",
  "label": "Número de Referencia",
  "placeholder": "Ej: #REF-2025-123",
  "requerido": false,
  "orden": 3,
  "pattern": "^#?[A-Z0-9-]+$",
  "mensajeError": "Formato inválido (use solo letras, números y guiones)"
}
```

### 📅 **date**
```json
{
  "nombre": "fecha_aprobacion",
  "tipo": "date",
  "label": "Fecha de Aprobación",
  "requerido": false,
  "orden": 4
}
```

### 🔢 **number**
```json
{
  "nombre": "plazo_meses",
  "tipo": "number",
  "label": "Plazo en Meses",
  "placeholder": "Ej: 120",
  "requerido": false,
  "orden": 5,
  "min": 1,
  "max": 360
}
```

### 📝 **textarea**
```json
{
  "nombre": "observaciones",
  "tipo": "textarea",
  "label": "Observaciones",
  "placeholder": "Notas adicionales...",
  "requerido": false,
  "orden": 6
}
```

### ☑️ **checkbox**
```json
{
  "nombre": "aprobacion_inmediata",
  "tipo": "checkbox",
  "label": "¿Aprobación inmediata?",
  "requerido": false,
  "orden": 7
}
```

### 📋 **select_custom** (opciones personalizadas)
```json
{
  "nombre": "estado_credito",
  "tipo": "select_custom",
  "label": "Estado del Crédito",
  "placeholder": "Seleccionar estado...",
  "requerido": false,
  "orden": 8,
  "opciones": [
    { "value": "aprobado", "label": "Aprobado" },
    { "value": "en_estudio", "label": "En Estudio" },
    { "value": "rechazado", "label": "Rechazado" }
  ]
}
```

---

## 🎨 Ejemplo Completo: Nueva Fuente "Crédito Constructor"

### Paso 1: Crear tipo de fuente en BD

```sql
INSERT INTO tipos_fuentes_pago (
  nombre, codigo, descripcion, color, icono,
  activo, orden, requiere_entidad, es_subsidio,
  configuracion_campos
) VALUES (
  'Crédito Constructor',
  'CREDITO_CONSTRUCTOR',
  'Financiamiento directo de la constructora',
  '#F59E0B',
  'Building',
  true,
  5,
  false,
  false,
  '{
    "campos": [
      {
        "nombre": "monto_aprobado",
        "tipo": "currency",
        "label": "Monto del Crédito",
        "placeholder": "Ej: 40.000.000",
        "requerido": true,
        "orden": 1,
        "ayuda": "Monto total financiado por la constructora"
      },
      {
        "nombre": "plazo_meses",
        "tipo": "number",
        "label": "Plazo en Meses",
        "placeholder": "Ej: 24",
        "requerido": true,
        "orden": 2,
        "min": 1,
        "max": 48
      },
      {
        "nombre": "tasa_interes",
        "tipo": "number",
        "label": "Tasa de Interés (%)",
        "placeholder": "Ej: 1.5",
        "requerido": true,
        "orden": 3,
        "min": 0,
        "max": 10
      },
      {
        "nombre": "numero_referencia",
        "tipo": "text",
        "label": "Número de Contrato",
        "placeholder": "Ej: #CONST-2025-456",
        "requerido": false,
        "orden": 4
      },
      {
        "nombre": "observaciones",
        "tipo": "textarea",
        "label": "Observaciones",
        "placeholder": "Condiciones especiales...",
        "requerido": false,
        "orden": 5
      }
    ]
  }'::jsonb
);
```

### Paso 2: Regenerar tipos TypeScript

```bash
npm run types:generate
```

### Paso 3: ¡Listo! 🎉

El nuevo tipo aparecerá automáticamente en el formulario con todos sus campos configurados.

---

## ✅ Ventajas del Sistema

### 1️⃣ **Sin Código**
- ✅ Agregar/modificar campos sin deploy
- ✅ Cambios en tiempo real
- ✅ No duplicar componentes

### 2️⃣ **Escalable**
- ✅ Soporta fuentes ilimitadas
- ✅ Campos personalizados por fuente
- ✅ Validaciones configurables

### 3️⃣ **Mantenible**
- ✅ Configuración centralizada
- ✅ Type-safe con TypeScript
- ✅ React Query caché automático

### 4️⃣ **UX Profesional**
- ✅ Labels claros
- ✅ Validación en tiempo real
- ✅ Ayuda contextual
- ✅ Responsive y dark mode

---

## 🔧 Troubleshooting

### Error: "Campo no se muestra"
**Causa**: Orden duplicado o campo sin nombre
**Solución**: Verificar `orden` único y `nombre` válido

### Error: "Select vacío"
**Causa**: `tipo: "select_custom"` sin opciones
**Solución**: Agregar array `opciones`

### Error: "Tipos TypeScript no coinciden"
**Causa**: Tipos desactualizados
**Solución**: Ejecutar `npm run types:generate`

---

## 📚 Referencias

- **Migración SQL**: `supabase/migrations/20251224_agregar_configuracion_campos_fuentes.sql`
- **Types**: `src/modules/configuracion/types/campos-dinamicos.types.ts`
- **Service**: `src/modules/configuracion/services/tipos-fuentes-campos.service.ts`
- **Hook React Query**: `src/modules/configuracion/hooks/useTiposFuentesConCampos.ts`
- **Componente**: `src/modules/clientes/components/fuente-pago-card/CampoFormularioDinamico.tsx`

---

## 🚀 Roadmap Futuro (Fase 2)

### UI Admin para Configurar Campos
- Modal con drag & drop (@dnd-kit)
- Editor visual de campos
- Preview en tiempo real
- Guardar/publicar configuraciones

**Tiempo estimado**: 5-6 horas
**Prioridad**: Baja (sistema funcional sin UI)

---

## ✨ Créditos

Sistema diseñado con:
- ✅ Separación de responsabilidades
- ✅ Buenas prácticas React
- ✅ React Query para estado
- ✅ Diseño responsive premium
- ✅ TypeScript estricto
