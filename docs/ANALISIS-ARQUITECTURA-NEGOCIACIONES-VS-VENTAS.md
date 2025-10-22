# 🤔 ANÁLISIS: ¿Negociaciones o Ventas? - Decisión Arquitectónica

> **Contexto**: Estamos evaluando si el módulo actual de "Negociaciones" debe:
> 1. Renombrarse a "Ventas"
> 2. Mantenerse como "Negociaciones"
> 3. Considerarse un módulo independiente o submódulo
> 4. Optimizar su flujo de creación

---

## 📊 ESTADO ACTUAL (AS-IS)

### Estructura de Carpetas

```
src/
├── modules/
│   ├── clientes/           ✅ Módulo principal
│   │   ├── services/
│   │   │   └── negociaciones.service.ts  ⚠️ Servicio aquí
│   │   ├── hooks/
│   │   │   └── useCrearNegociacion.ts   ⚠️ Hook aquí
│   │   ├── components/
│   │   │   └── modals/
│   │   │       └── modal-crear-negociacion/  ⚠️ Modal aquí
│   │   └── pages/
│   │       └── crear-negociacion/            ⚠️ Página aquí
│   │
│   └── negociaciones/      ✅ Módulo secundario
│       ├── components/     → Dashboard, Lista, Filtros
│       ├── hooks/          → useNegociaciones (solo lectura)
│       ├── services/       → VACÍO (usa el de clientes/)
│       ├── styles/         → Estilos del dashboard
│       └── types/          → Tipos compartidos
│
├── app/
│   ├── clientes/[id]/negociaciones/
│   │   ├── crear/page.tsx          ⚠️ Ruta desde cliente
│   │   └── [negociacionId]/page.tsx ⚠️ Detalle desde cliente
│   │
│   └── negociaciones/
│       └── page.tsx                 ✅ Vista global independiente
```

### Flujo de Creación Actual

```
Usuario en /clientes/[id]
    ↓
Click "Crear Negociación"
    ↓
Navega a: /clientes/[id]/negociaciones/crear
    ↓
Componente: CrearNegociacionPage
    ↓
Hook: useCrearNegociacionPage
    ↓
Hook: useCrearNegociacion (de módulo clientes)
    ↓
Service: negociacionesService.crearNegociacion (de módulo clientes)
    ↓
Crea: Negociación + Actualiza Vivienda + Actualiza Cliente
    ↓
Redirecciona a: /clientes/[id] (tab negociaciones)
```

---

## 🎯 ANÁLISIS: ¿Es un Módulo?

### ✅ ARGUMENTOS PARA "SÍ ES UN MÓDULO"

1. **Tiene Vista Global Independiente**
   - `/negociaciones` existe y funciona
   - Dashboard con métricas propias
   - Lista completa de todas las negociaciones del sistema
   - Filtros y búsqueda independientes

2. **Tiene Entidad de Base de Datos Propia**
   - Tabla `negociaciones` con 27 campos
   - Relaciones con: clientes, viviendas, fuentes_pago, abonos_historial
   - Estados propios: Activa, Suspendida, Cerrada por Renuncia, Completada

3. **Tiene Lógica de Negocio Compleja**
   - Cálculos automáticos (valor_total, saldo_pendiente, porcentaje_pagado)
   - Triggers en DB
   - Validaciones de estado
   - Workflow de estados

4. **Puede Consultarse Sin Cliente**
   - Reporte de todas las negociaciones activas
   - Métricas globales del negocio
   - Análisis de cierre de ventas

### ❌ ARGUMENTOS PARA "NO ES UN MÓDULO INDEPENDIENTE"

1. **No Existe Sin Cliente y Vivienda**
   - Siempre es una relación Cliente ← Negociación → Vivienda
   - No puedes crear negociación sin cliente preseleccionado

2. **El Service Está en módulo `clientes/`**
   - Actualmente `negociacionesService` vive en `src/modules/clientes/services/`
   - Indica dependencia conceptual

3. **La Creación Siempre Parte del Cliente**
   - El flujo natural es: Cliente → Crear Negociación
   - No hay botón "Crear Negociación" en navbar global

---

## 💭 ANÁLISIS: ¿Negociaciones o Ventas?

### 🏗️ CONCEPTO DE NEGOCIACIÓN (actual)

**Definición**: Proceso de vincular cliente + vivienda + definir forma de pago

**Fases**:
1. Creación (cliente interesado → activo)
2. Configuración de fuentes de pago
3. Recepción de abonos
4. Completada (cliente → propietario, vivienda → entregada)

**Estados**:
- Activa
- Suspendida
- Cerrada por Renuncia
- Completada

### 🏬 CONCEPTO DE VENTA (alternativa)

**Definición**: Proceso comercial completo de venta de vivienda

**Fases**:
1. Prospección (cliente interesado)
2. **Negociación** (valores, descuentos, forma de pago)
3. Cierre (firma de documentos)
4. Entrega

**Estados**:
- En Negociación
- Cerrada/Ganada
- Perdida/Cancelada
- Entregada

---

## 🎨 OPCIÓN 1: Mantener "NEGOCIACIONES" (Recomendado ⭐)

### ✅ VENTAJAS

1. **Refleja la Realidad del Negocio**
   - En constructoras se usa el término "negociación"
   - Es el proceso de acordar valores, plazos, formas de pago
   - No es solo "venta" (es más complejo)

2. **Nomenclatura Consistente con la Base de Datos**
   - Tabla: `negociaciones`
   - Service: `negociacionesService`
   - Types: `Negociacion`, `EstadoNegociacion`
   - Cambiar a "Ventas" requeriría renombrar TODO

3. **Diferencia con "Venta" es Clara**
   - **Negociación** = Proceso completo (acuerdos + pagos + entrega)
   - **Venta** = Evento puntual de cierre comercial

4. **Estados Actuales Son Correctos**
   - "Activa" → En proceso de pago
   - "Suspendida" → Pausada
   - "Cerrada por Renuncia" → Cliente renunció
   - "Completada" → Entregada y pagada

### ❌ DESVENTAJAS

1. **Puede Confundirse con "Proceso de Negociación"**
   - Algunos usuarios podrían pensar que es solo la fase de acuerdos
   - Pero el módulo incluye TODO el ciclo hasta la entrega

2. **Término Técnico vs Usuario Final**
   - "Negociaciones" es más técnico
   - Usuarios finales podrían entender mejor "Ventas"

### 🔄 CAMBIOS NECESARIOS

```
✅ Ninguno - Mantener estructura actual
✅ Solo actualizar UI de badges (ya planeado)
```

---

## 🎨 OPCIÓN 2: Cambiar a "VENTAS"

### ✅ VENTAJAS

1. **Más Intuitivo Para Usuarios No Técnicos**
   - "Ventas" es término universal
   - Cualquier persona entiende qué es una venta

2. **Alineación con Terminología de Negocio**
   - Departamento comercial habla de "ventas"
   - Reportes financieros usan "ventas"

3. **Simplificación Conceptual**
   - Módulo de "Ventas" es más claro que "Negociaciones"

### ❌ DESVENTAJAS

1. **Refactorización Masiva**
   ```
   ❌ Renombrar tabla en DB: negociaciones → ventas
   ❌ Renombrar 50+ archivos
   ❌ Actualizar imports en 100+ ubicaciones
   ❌ Cambiar tipos TypeScript
   ❌ Actualizar documentación completa
   ❌ Migración de datos en producción
   ```

2. **Pérdida de Precisión Semántica**
   - "Venta" no refleja el proceso completo
   - Estados como "Activa", "Suspendida" suenan extraños en "Ventas"
   - "Venta Activa" vs "Negociación Activa" (segunda es más clara)

3. **Inconsistencia con Código Existente**
   - Tabla en DB se llamaría `ventas` pero el proceso sigue siendo "negociación"
   - Confusión entre desarrolladores

### 🔄 CAMBIOS NECESARIOS

```
❌ 1. Migración SQL: Renombrar tabla negociaciones → ventas
❌ 2. Renombrar carpeta: modules/negociaciones → modules/ventas
❌ 3. Renombrar service: negociacionesService → ventasService
❌ 4. Actualizar 50+ archivos TypeScript
❌ 5. Actualizar 20+ archivos de documentación
❌ 6. Testing completo de regresión
```

**Estimación**: 8-10 horas de trabajo + riesgo de bugs

---

## 🎨 OPCIÓN 3: Híbrido "VENTAS" (UI) + "NEGOCIACIONES" (Backend)

### Concepto

- **Frontend** (UI): Usar término "Ventas"
- **Backend** (DB, Services): Mantener "Negociaciones"

### ✅ VENTAJAS

1. Mejor UX para usuarios no técnicos
2. No requiere migración de DB
3. Cambios solo en componentes UI

### ❌ DESVENTAJAS

1. **Confusión para Desarrolladores**
   ```typescript
   // En UI
   <h1>Crear Venta</h1>

   // En código
   const negociacion = await negociacionesService.crearNegociacion()

   // ⚠️ Mismatch conceptual
   ```

2. **Documentación Inconsistente**
   - Manual de usuario habla de "Ventas"
   - Documentación técnica habla de "Negociaciones"

---

## 🏆 RECOMENDACIÓN FINAL

### ⭐ MANTENER "NEGOCIACIONES"

**Razones**:

1. ✅ **Cero refactorización** → Continuar desarrollo sin interrupciones
2. ✅ **Término preciso** → Refleja mejor el proceso completo
3. ✅ **Consistencia total** → DB, código, docs alineados
4. ✅ **Estados coherentes** → "Negociación Activa" suena natural
5. ✅ **Ya está implementado** → Sistema funcionando correctamente

**Alternativa de Mejora**:
Si quieres hacer el término más accesible para usuarios:
- En **UI**: Agregar tooltips explicativos
  ```tsx
  <Tooltip>
    <span>Negociaciones</span>
    <TooltipContent>
      Gestión completa del proceso de venta: acuerdos, pagos y entrega
    </TooltipContent>
  </Tooltip>
  ```

---

## 🏗️ ARQUITECTURA: ¿Módulo o Submódulo?

### 📊 SITUACIÓN ACTUAL

**Problema**: Código dividido entre dos módulos

```
clientes/
└── services/negociaciones.service.ts  ← CRUD de negociaciones
└── hooks/useCrearNegociacion.ts       ← Lógica de creación
└── pages/crear-negociacion/           ← Vista de creación

negociaciones/
└── components/                        ← Dashboard global
└── hooks/useNegociaciones.ts          ← Solo lectura
└── services/                          ← VACÍO
```

**Análisis**:
- ⚠️ **Service está mal ubicado** → Debería estar en `negociaciones/`
- ⚠️ **Hook de creación está mal ubicado** → Debería estar en `negociaciones/`
- ✅ Vista global está bien ubicada

### 🎯 OPCIÓN A: MÓDULO INDEPENDIENTE (Recomendado ⭐)

**Concepto**: Negociaciones como módulo de primer nivel

```
modules/
├── negociaciones/              ← Módulo principal
│   ├── services/
│   │   └── negociaciones.service.ts   ← Mover aquí
│   ├── hooks/
│   │   ├── useCrearNegociacion.ts     ← Mover aquí
│   │   └── useNegociaciones.ts
│   ├── components/
│   │   ├── dashboard/
│   │   ├── lista/
│   │   └── crear/                     ← Mover aquí
│   ├── pages/
│   │   └── crear-negociacion/         ← Mover aquí
│   └── types/
│
├── clientes/
│   └── [mantener solo lógica de clientes]
│
└── viviendas/
    └── [mantener solo lógica de viviendas]
```

**Rutas**:
```
/negociaciones                → Vista global (dashboard)
/negociaciones/crear          → Crear desde vista global
/negociaciones/[id]           → Detalle de negociación
/clientes/[id]?tab=negociaciones  → Ver negociaciones del cliente
```

**✅ VENTAJAS**:
1. **Organización Clara** → Todo lo de negociaciones en un solo lugar
2. **Reusabilidad** → Service compartido por todos
3. **Escalabilidad** → Fácil agregar nuevas funcionalidades
4. **Independencia** → No depende conceptualmente de clientes

**❌ DESVENTAJAS**:
1. Requiere refactorización de imports (2-3 horas)
2. Cambiar rutas de creación

---

### 🎯 OPCIÓN B: SUBMÓDULO DE CLIENTES

**Concepto**: Negociaciones como parte de Clientes

```
modules/
└── clientes/
    ├── components/
    ├── services/
    │   └── negociaciones.service.ts   ← Mantener aquí
    ├── hooks/
    └── pages/
        └── negociaciones/
            ├── crear/
            └── [id]/
```

**✅ VENTAJAS**:
1. Mantiene estructura actual
2. Cero refactorización

**❌ DESVENTAJAS**:
1. **Lógicamente incorrecto** → Negociación NO es submódulo de cliente
2. **Dificulta escalabilidad** → ¿Dónde poner workflow? ¿Reportes?
3. **Duplicación futura** → Si crecen las funciones, habrá que moverlo igual

---

## 🔄 FLUJO DE CREACIÓN: Análisis y Mejoras

### 📍 FLUJO ACTUAL

```
1. Usuario en /clientes/[id]
2. Click "Crear Negociación" (header)
3. Navega a /clientes/[id]/negociaciones/crear?nombre=...&vivienda=...
4. Wizard de 3 pasos:
   - Paso 1: Vivienda + Valores
   - Paso 2: Fuentes de Pago
   - Paso 3: Confirmación
5. Crea negociación
6. Redirect a /clientes/[id]?tab=negociaciones
```

**✅ VENTAJAS**:
- Cliente ya está seleccionado
- Contexto claro (estás creando negociación para este cliente)
- Wizard completo y funcional

**❌ PROBLEMAS**:
- Solo se puede crear desde detalle del cliente
- Vivienda se selecciona en el wizard (requiere dos pasos)

---

### 🚀 OPCIÓN A: Mantener Flujo Actual + Optimizaciones

**Mejoras Sugeridas**:

1. **Agregar Botón en Navbar Global**
   ```tsx
   <NavbarButton href="/negociaciones/crear">
     + Crear Negociación
   </NavbarButton>
   ```
   - Abre wizard donde PRIMERO seleccionas cliente
   - Luego continúa igual que ahora

2. **Optimizar Wizard Si Cliente + Vivienda Vienen de URL**
   ```typescript
   // Si URL tiene clienteId + viviendaId
   /negociaciones/crear?cliente=xxx&vivienda=yyy

   → Saltar directo a Paso 2 (Fuentes de Pago)
   → Paso 1 pre-llenado y readonly
   ```

3. **Crear Desde Vista de Viviendas**
   ```
   /proyectos/[id]/viviendas
   → Card de vivienda "Disponible"
   → Botón "Asignar Cliente"
   → Modal: Seleccionar cliente + Wizard
   ```

**Resultado**: 3 puntos de entrada
- ✅ Desde cliente (actual)
- ✅ Desde navbar global (nuevo)
- ✅ Desde vivienda (nuevo)

---

### 🚀 OPCIÓN B: Wizard Inteligente con Auto-Skip

**Concepto**: Wizard detecta qué info ya tiene y salta pasos

```typescript
// Escenario 1: Desde cliente (actual)
/clientes/[id]/negociaciones/crear?vivienda=yyy
→ Cliente pre-seleccionado
→ Paso 1: Solo selector de vivienda (otros campos readonly)
→ Paso 2: Fuentes de pago
→ Paso 3: Confirmación

// Escenario 2: Desde vivienda
/viviendas/[id]/asignar-cliente
→ Vivienda pre-seleccionada
→ Paso 1: Solo selector de cliente (vivienda readonly)
→ Paso 2: Fuentes de pago
→ Paso 3: Confirmación

// Escenario 3: Desde global
/negociaciones/crear
→ Nada pre-seleccionado
→ Paso 0: Seleccionar cliente Y vivienda
→ Paso 1: Valores
→ Paso 2: Fuentes de pago
→ Paso 3: Confirmación
```

**Implementación**:
```typescript
function CrearNegociacionWizard({ clienteId, viviendaId }) {
  const steps = useMemo(() => {
    const baseSteps = [
      { id: 'fuentes', label: 'Fuentes de Pago' },
      { id: 'confirmar', label: 'Confirmar' },
    ]

    // Si falta cliente o vivienda, agregar paso inicial
    if (!clienteId || !viviendaId) {
      baseSteps.unshift({
        id: 'seleccion',
        label: 'Seleccionar',
      })
    }

    // Si tiene ambos pero falta valores, agregar paso de valores
    if (clienteId && viviendaId) {
      baseSteps.unshift({
        id: 'valores',
        label: 'Valores',
      })
    }

    return baseSteps
  }, [clienteId, viviendaId])

  // ...resto del wizard
}
```

---

## 🎯 PLAN DE ACCIÓN RECOMENDADO

### FASE 1: Nomenclatura (Inmediato)

✅ **DECISIÓN**: Mantener "NEGOCIACIONES"
- Cero cambios necesarios
- Continuar con desarrollo

---

### FASE 2: Arquitectura (1-2 días)

✅ **DECISIÓN**: Convertir en Módulo Independiente

**Tareas**:
1. Mover `negociaciones.service.ts` de `clientes/` a `negociaciones/`
2. Mover `useCrearNegociacion.ts` de `clientes/` a `negociaciones/`
3. Mover carpeta `crear-negociacion/` de `clientes/pages/` a `negociaciones/pages/`
4. Actualizar imports (usar find & replace)
5. Testing de regresión

**Estimación**: 3-4 horas

---

### FASE 3: Optimización de Flujo (2-3 días)

✅ **DECISIÓN**: Implementar Wizard Inteligente + Múltiples Puntos de Entrada

**Tareas**:
1. Agregar botón "Crear Negociación" en navbar global
2. Crear ruta `/negociaciones/crear` (sin cliente pre-seleccionado)
3. Implementar auto-skip de pasos según parámetros URL
4. Agregar botón "Asignar Cliente" en cards de viviendas
5. Testing E2E de los 3 flujos

**Estimación**: 6-8 horas

---

## 📋 CONCLUSIONES

### ✅ DECISIONES FINALES

| Aspecto | Decisión | Razón |
|---------|----------|-------|
| **Nombre** | 🟢 Mantener "NEGOCIACIONES" | Preciso, consistente, cero refactorización |
| **Arquitectura** | 🟢 Módulo Independiente | Escalable, organizado, reusable |
| **Flujo** | 🟢 Optimizar con Auto-Skip | Mejor UX, 3 puntos de entrada |
| **Service** | 🟢 Mover a negociaciones/ | Ubicación lógicamente correcta |

### 🚀 SIGUIENTE PASO INMEDIATO

**Actualizar UI de Estados** (20 min) - Ya planeado en TODO

¿Continuamos con actualizar badges/colores AHORA, o prefieres primero hacer la refactorización arquitectónica (mover service a módulo negociaciones)?

---

**📅 Fecha**: 2025-10-22
**👤 Decisión**: Pendiente de aprobación
