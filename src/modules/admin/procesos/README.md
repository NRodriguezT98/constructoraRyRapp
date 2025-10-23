# 🏗️ Módulo de Gestión de Procesos

## 📋 Descripción

Módulo administrativo para gestionar plantillas de procesos de negociación. Permite crear, editar y administrar las etapas que los clientes deben seguir desde la separación hasta la entrega de la vivienda.

## 🎯 Funcionalidades

### Gestión de Plantillas
- ✅ Crear plantillas de proceso personalizadas
- ✅ Editar plantillas existentes
- ✅ Duplicar plantillas
- ✅ Establecer plantilla predeterminada
- ✅ Eliminar plantillas (excepto predeterminada)

### Gestión de Pasos
- ✅ Agregar/editar/eliminar pasos
- ✅ Reordenar pasos con drag & drop
- ✅ Configurar dependencias entre pasos
- ✅ Definir documentos requeridos
- ✅ Establecer condiciones (fuentes de pago)
- ✅ Restricciones temporales

### Aplicación Automática
- ✅ Al crear negociación, se aplica plantilla predeterminada
- ✅ Filtrado automático de pasos según fuentes de pago
- ✅ Validación de dependencias
- ✅ Seguimiento de progreso

## 📁 Estructura

```
src/modules/admin/procesos/
├── components/           # Componentes React
│   ├── lista-plantillas.tsx
│   ├── editor-plantilla.tsx
│   ├── editor-paso.tsx
│   └── preview-timeline.tsx
├── hooks/               # Hooks personalizados
│   ├── useGestionProcesos.ts
│   └── useDragDropPasos.ts
├── services/            # Lógica de negocio
│   └── procesos.service.ts
├── types/               # TypeScript types
│   └── index.ts
├── styles/              # Estilos centralizados
│   └── procesos.styles.ts
└── README.md           # Este archivo
```

## 🗄️ Base de Datos

### Tabla: `plantillas_proceso`
Almacena las plantillas de proceso definidas por el administrador.

**Campos principales:**
- `id`: UUID único
- `nombre`: Nombre de la plantilla
- `descripcion`: Descripción opcional
- `pasos`: JSON con array de pasos (estructura definida en types)
- `activo`: Si la plantilla está activa
- `es_predeterminado`: Si es la plantilla por defecto

### Tabla: `procesos_negociacion`
Instancias de pasos para cada negociación específica.

**Campos principales:**
- `negociacion_id`: FK a negociaciones
- `nombre`: Nombre del paso
- `orden`: Orden de ejecución
- `estado`: 'Pendiente' | 'En Proceso' | 'Completado' | 'Omitido'
- `documentos_urls`: JSON con URLs de documentos subidos
- `fecha_completado`: Timestamp de completado

## 🔧 Uso

### Crear Plantilla

```typescript
import { crearPlantilla } from '@/modules/admin/procesos/services/procesos.service'
import { TipoFuentePago } from '@/modules/admin/procesos/types'

const nuevaPlantilla = await crearPlantilla({
  nombre: 'Proceso Estándar 2025',
  descripcion: 'Proceso completo con todas las etapas',
  pasos: [
    {
      orden: 1,
      nombre: 'Envío de promesa de compraventa',
      descripcion: 'Enviar promesa para firma del cliente',
      obligatorio: true,
      permiteOmitir: false,
      condiciones: {
        fuentesPagoRequeridas: [], // Aplica a todos
        dependeDe: [],
        diasMinimoDespuesDe: undefined
      },
      documentos: [
        {
          id: crypto.randomUUID(),
          nombre: 'Promesa de compraventa',
          obligatorio: true,
          tiposArchivo: ['application/pdf']
        }
      ]
    },
    // ... más pasos
  ],
  esPredeterminado: true
})
```

### Aplicar Plantilla a Negociación

```typescript
import { crearProcesoDesdePlantilla } from '@/modules/admin/procesos/services/procesos.service'
import { TipoFuentePago } from '@/modules/admin/procesos/types'

const procesos = await crearProcesoDesdePlantilla({
  negociacionId: 'uuid-negociacion',
  plantillaId: 'uuid-plantilla',
  fuentesPago: [
    TipoFuentePago.CREDITO_HIPOTECARIO,
    TipoFuentePago.RECURSOS_PROPIOS
  ]
})
```

### Obtener Progreso

```typescript
import { obtenerProgresoNegociacion } from '@/modules/admin/procesos/services/procesos.service'

const progreso = await obtenerProgresoNegociacion('uuid-negociacion')

console.log(`Progreso: ${progreso.porcentajeCompletado}%`)
console.log(`Completados: ${progreso.pasosCompletados}/${progreso.totalPasos}`)
console.log(`Paso actual: ${progreso.pasoActual?.nombre}`)
```

## 🎨 Componentes Principales

### ListaPlantillas
Vista principal con grid de cards de plantillas.

**Features:**
- Grid responsivo con glassmorphism
- Badge "Predeterminada"
- Acciones: Editar, Duplicar, Eliminar
- FAB para crear nueva plantilla

### EditorPlantilla
Editor visual de plantilla completa.

**Features:**
- Formulario nombre/descripción
- Lista de pasos con drag & drop
- Botón agregar paso
- Preview del timeline
- Validación en tiempo real

### EditorPaso
Modal para configurar paso individual.

**Features:**
- Nombre y descripción
- Checkbox obligatorio
- Select fuentes de pago (condicional)
- Multi-select dependencias
- Lista de documentos requeridos
- Input restricción temporal (días)

## 🔐 Seguridad

- ⚠️ **Solo administradores** pueden acceder a este módulo
- ⚠️ Implementar middleware de autenticación en rutas `/admin/*`
- ⚠️ Validar permisos antes de operaciones CRUD

## 📊 Flujo de Trabajo

```
1. Admin crea/edita plantilla
        ↓
2. Define pasos y configuraciones
        ↓
3. Establece como predeterminada
        ↓
4. Usuario crea negociación
        ↓
5. Sistema aplica plantilla automáticamente
        ↓
6. Filtra pasos según fuentes de pago
        ↓
7. Cliente/Admin completan pasos
        ↓
8. Sistema trackea progreso
```

## 🚀 Roadmap

### Fase 1 (Actual)
- [x] Tipos TypeScript
- [x] Servicio CRUD
- [ ] Hook useGestionProcesos
- [ ] Estilos glassmorphism
- [ ] Vista lista plantillas
- [ ] Editor plantilla
- [ ] Editor paso
- [ ] Drag & drop
- [ ] Script plantilla predeterminada
- [ ] Integración en sidebar

### Fase 2 (Futuro)
- [ ] Notificaciones automáticas por paso
- [ ] Recordatorios de plazos
- [ ] Analytics de tiempos promedio
- [ ] Reportes de cuellos de botella
- [ ] Templates predefinidos
- [ ] Import/Export de plantillas
- [ ] Historial de cambios

## 📝 Ejemplo de Plantilla (17 pasos RyR)

Ver documentación completa en: `docs/PROCESO-NEGOCIACION-17-PASOS.md`

Pasos incluidos:
1. Envío promesa compraventa
2. Recibido promesa firmada
3-6. Pasos crédito hipotecario (condicional)
7. Envío minuta a notaría
8. Firma minuta
9. Envío acta de entrega
10. Recibido acta firmada
11-12. Pagos boletas
13-14. Desembolso crédito (condicional)
15-16. Desembolso subsidio (condicional)
17. Factura final

## 🐛 Debugging

```typescript
// Ver pasos aplicados a negociación
const procesos = await obtenerProcesosNegociacion('uuid-negociacion')
console.table(procesos.map(p => ({
  orden: p.orden,
  nombre: p.nombre,
  estado: p.estado,
  obligatorio: p.esObligatorio
})))

// Validar plantilla antes de guardar
const validacion = validarPlantilla(plantillaData)
if (!validacion.valida) {
  console.error('Errores:', validacion.errores)
  console.warn('Advertencias:', validacion.advertencias)
}
```

## 📚 Referencias

- **DATABASE-SCHEMA-REFERENCE-ACTUALIZADO.md**: Estructura de tablas
- **DESARROLLO-CHECKLIST.md**: Checklist de desarrollo
- **GUIA-ESTILOS.md**: Guía de estilos del proyecto
