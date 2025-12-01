# 🎯 Ubicaciones Estratégicas del Botón "Asignar Vivienda"

## 📅 Fecha: 2025-01-26

## 🎯 Objetivo

Definir las ubicaciones óptimas del botón/acción "Asignar Vivienda" en la interfaz, asegurando:
1. ✅ **Intuitivo**: Usuario lo encuentra fácilmente en flujos naturales
2. ✅ **Validación correcta**: Solo activo si cliente tiene documento de identidad
3. ✅ **Feedback claro**: Tooltip explica por qué está deshabilitado
4. ✅ **Contexto apropiado**: Aparece donde tiene sentido asignar vivienda

---

## 🎨 Propuesta de Ubicaciones (4 lugares estratégicos)

### 📍 **1. HEADER DEL DETALLE DEL CLIENTE** (⭐ PRINCIPAL - MÁS PROMINENTE)

**Ubicación**: `src/app/clientes/[id]/cliente-detalle-client.tsx` - Header con gradiente cyan/blue (línea 450-490)

**Estado actual**: ❌ Botón de "Crear Negociación" (con validación legacy incorrecta)

**Propuesta**: ✅ **Reemplazar con botón "Asignar Vivienda"** + validación correcta

#### 🎨 Diseño Visual

```tsx
{/* Botón Principal: Asignar Vivienda (Header) */}
<Tooltip
  content={
    !tieneCedula ? (
      <div className="flex flex-col gap-1 max-w-xs">
        <span className="font-semibold">📋 Documento requerido</span>
        <span className="text-xs opacity-90">
          Para asignar viviendas, primero sube la cédula o documento de identidad del cliente en la pestaña "Documentos"
        </span>
      </div>
    ) : (
      'Iniciar proceso de asignación de vivienda'
    )
  }
  side="bottom"
>
  <motion.button
    onClick={handleIniciarAsignacion}
    disabled={!tieneCedula}
    className={`
      inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition-all shadow-lg
      ${tieneCedula
        ? 'bg-white/20 backdrop-blur-md border-2 border-white/40 text-white hover:bg-white/30 hover:scale-105'
        : 'bg-gray-400/20 border-2 border-gray-400/30 text-gray-300 cursor-not-allowed opacity-60'
      }
    `}
    whileHover={tieneCedula ? { scale: 1.05 } : {}}
    whileTap={tieneCedula ? { scale: 0.98 } : {}}
  >
    {tieneCedula ? (
      <>
        <Home className="w-5 h-5" />
        Asignar Vivienda
      </>
    ) : (
      <>
        <Lock className="w-5 h-5" />
        Asignar Vivienda
      </>
    )}
  </motion.button>
</Tooltip>
```

#### ✅ Ventajas

- ✅ **Máxima visibilidad**: Primera acción que ve el usuario al entrar al detalle
- ✅ **Contexto claro**: En el header junto a Editar/Eliminar
- ✅ **Validación visual**: Icono Lock cuando está deshabilitado
- ✅ **Tooltip informativo**: Explica qué falta para activarlo
- ✅ **Animación sutil**: Scale en hover si está habilitado

#### 📊 Prioridad: **🔴 CRÍTICA** (implementar primero)

---

### 📍 **2. BANNER EN TAB "INFORMACIÓN GENERAL"** (⭐ SECUNDARIA - CONTEXTO DE FLUJO)

**Ubicación**: `src/app/clientes/[id]/tabs/general-tab.tsx` (líneas 74-145)

**Estado actual**: ✅ **YA IMPLEMENTADO** con validación correcta

**Mejora propuesta**: ✅ Mantener como está, pero cambiar texto del botón

#### 🎨 Diseño Actual (Correcto)

```tsx
{/* Banner CTA: Asignar Vivienda */}
{!tieneNegociacionActiva && (
  <motion.div className={`
    p-4 rounded-2xl shadow-2xl
    ${tieneDocumento
      ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
      : 'bg-gradient-to-r from-orange-500 to-amber-500'
    } text-white
  `}>
    {/* ... contenido ... */}

    {tieneDocumento ? (
      <button
        onClick={handleIniciarAsignacion}
        className="px-6 py-3 rounded-xl bg-white text-emerald-600 font-bold hover:scale-105 transition-all shadow-lg flex items-center gap-2"
      >
        <Home className="w-5 h-5" /> {/* ⭐ Cambiar Handshake por Home */}
        Asignar Vivienda
      </button>
    ) : (
      <button
        onClick={() => window.dispatchEvent(new CustomEvent('cambiar-tab', { detail: 'documentos' }))}
        className="px-6 py-3 rounded-xl bg-white text-orange-600 font-bold hover:scale-105 transition-all shadow-lg flex items-center gap-2"
      >
        <Upload className="w-5 h-5" />
        Subir Documento
      </button>
    )}
  </motion.div>
)}
```

#### ✅ Ventajas

- ✅ **Ya implementado** con validación correcta (`useDocumentoIdentidad`)
- ✅ **Checklist visual**: Usuario ve qué falta (Cliente registrado ✓, Documento ?)
- ✅ **Banner dinámico**: Verde si listo, naranja si falta documento
- ✅ **CTA contextual**: "Subir Documento" si falta, "Asignar Vivienda" si listo
- ✅ **Solo visible si NO tiene negociación activa** (evita confusión)

#### 📊 Prioridad: **🟡 MEDIA** (mantener y mejorar icono)

---

### 📍 **3. MENÚ DE ACCIONES RÁPIDAS (Dropdown en Header)** (💡 OPCIONAL - UX AVANZADA)

**Ubicación**: `src/app/clientes/[id]/cliente-detalle-client.tsx` - Nuevo dropdown en header

**Propuesta**: ✅ Agregar menú desplegable con acciones principales

#### 🎨 Diseño Propuesto

```tsx
{/* Dropdown de Acciones Rápidas */}
<Dropdown>
  <DropdownTrigger>
    <button className="inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-white/20 backdrop-blur-md border-2 border-white/30 text-white hover:bg-white/30 transition-all">
      <MoreVertical className="w-5 h-5" />
      <span className="text-sm font-medium">Acciones</span>
    </button>
  </DropdownTrigger>

  <DropdownContent align="end" className="w-64">
    {/* Asignar Vivienda */}
    <DropdownItem
      disabled={!tieneCedula}
      onClick={handleIniciarAsignacion}
      icon={tieneCedula ? Home : Lock}
      className={!tieneCedula ? 'opacity-60 cursor-not-allowed' : ''}
    >
      <div className="flex flex-col">
        <span className="font-medium">Asignar Vivienda</span>
        {!tieneCedula && (
          <span className="text-xs text-orange-600 dark:text-orange-400">
            Requiere documento de identidad
          </span>
        )}
      </div>
    </DropdownItem>

    {/* Registrar Interés */}
    <DropdownItem onClick={handleRegistrarInteres} icon={Heart}>
      <span>Registrar Interés</span>
    </DropdownItem>

    {/* Ver Negociaciones */}
    <DropdownItem onClick={() => setActiveTab('negociaciones')} icon={Wallet}>
      <span>Ver Negociaciones</span>
    </DropdownItem>

    {/* Subir Documento */}
    <DropdownItem onClick={() => setActiveTab('documentos')} icon={Upload}>
      <span>Gestionar Documentos</span>
    </DropdownItem>
  </DropdownContent>
</Dropdown>
```

#### ✅ Ventajas

- ✅ **Acciones organizadas**: Todas las acciones principales en un solo lugar
- ✅ **Texto explicativo**: Sub-texto muestra por qué está deshabilitado
- ✅ **Escalable**: Fácil agregar más acciones en el futuro
- ✅ **No sobrecarga el header**: Mantiene diseño limpio

#### ❌ Desventajas

- ❌ **Menos visible**: Usuario debe hacer click para ver opciones
- ❌ **Requiere componente adicional**: Implementar dropdown custom

#### 📊 Prioridad: **🟢 BAJA** (opcional, para UX avanzada)

---

### 📍 **4. TABLA/GRID DE CLIENTES (Botón en Card)** (❌ NO RECOMENDADO)

**Ubicación**: `src/modules/clientes/components/cards/cliente-card-compacta.tsx`

**Estado actual**: ✅ **YA ELIMINADO** correctamente (era invasivo)

**Recomendación**: ❌ **NO IMPLEMENTAR** de nuevo

#### ❌ Por qué NO ubicar aquí

1. **Validación incorrecta**: Card usa datos resumidos, no tiene acceso a `useDocumentoIdentidad`
2. **Diseño invasivo**: Rompe compacto de la card (~80px de altura adicional)
3. **Información redundante**: Banner ya está en detalle del cliente
4. **Inconsistencia**: Otras cards (proyectos, viviendas) no tienen CTAs
5. **Scroll innecesario**: Aumenta altura de grid de cards

#### ✅ Alternativa: Botón de Vista Rápida

Si se desea acción rápida desde la lista:

```tsx
{/* Botón Eye con tooltip mejorado */}
<Tooltip
  content={
    !tieneCedula ? (
      <div className="flex flex-col gap-1">
        <span className="font-semibold">Ver detalle</span>
        <span className="text-xs opacity-90">
          ⚠️ Falta subir documento de identidad
        </span>
      </div>
    ) : (
      <div className="flex flex-col gap-1">
        <span className="font-semibold">Ver detalle</span>
        <span className="text-xs opacity-90">
          ✓ Cliente listo para asignar vivienda
        </span>
      </div>
    )
  }
>
  <button onClick={handleVer}>
    <Eye className="w-3.5 h-3.5" />
  </button>
</Tooltip>
```

**Ventaja**: Tooltip informa estado sin ocupar espacio visual

#### 📊 Prioridad: **❌ NO IMPLEMENTAR** (mantener eliminado)

---

## 🎯 Resumen de Ubicaciones Recomendadas

### ✅ IMPLEMENTAR (Orden de Prioridad)

| # | Ubicación | Estado | Prioridad | Effort | Impacto |
|---|-----------|--------|-----------|--------|---------|
| 1 | **Header del Detalle** | ❌ Pendiente | 🔴 CRÍTICA | 2h | 🔥 ALTO |
| 2 | **Banner en Tab General** | ✅ Implementado | 🟡 MEDIA | 0.5h (mejorar icono) | 🔥 ALTO |
| 3 | **Dropdown Acciones** | ❌ Opcional | 🟢 BAJA | 4h | 💡 MEDIO |

### ❌ NO IMPLEMENTAR

| Ubicación | Razón |
|-----------|-------|
| **Card de Lista** | Invasivo, validación incorrecta, inconsistente |

---

## 🔧 Implementación Técnica

### ✅ Hook Compartido: `useAsignacionVivienda`

Crear hook reutilizable para validación y acción:

```typescript
// src/modules/clientes/hooks/useAsignacionVivienda.ts

import { useRouter } from 'next/navigation'
import { useDocumentoIdentidad } from '../documentos/hooks/useDocumentoIdentidad'

interface UseAsignacionViviendaProps {
  clienteId: string
  clienteNombre?: string
  onBeforeNavigate?: () => void
}

export function useAsignacionVivienda({
  clienteId,
  clienteNombre,
  onBeforeNavigate
}: UseAsignacionViviendaProps) {
  const router = useRouter()
  const { tieneCedula, cargando } = useDocumentoIdentidad({ clienteId })

  const handleIniciarAsignacion = () => {
    // Validación adicional
    if (!tieneCedula) {
      console.warn('No se puede asignar vivienda: documento de identidad faltante')
      return
    }

    // Callback antes de navegar (analytics, logs, etc.)
    onBeforeNavigate?.()

    // Navegar a crear negociación
    router.push(
      `/clientes/${clienteId}/negociaciones/crear?nombre=${encodeURIComponent(clienteNombre || '')}`
    )
  }

  return {
    tieneCedula,
    cargando,
    puedeAsignar: tieneCedula && !cargando,
    handleIniciarAsignacion,
  }
}
```

### ✅ Uso en Componentes

```tsx
// En Header del Detalle
const { tieneCedula, puedeAsignar, handleIniciarAsignacion } = useAsignacionVivienda({
  clienteId: clienteUUID,
  clienteNombre: cliente?.nombre_completo,
  onBeforeNavigate: () => {
    console.log('Usuario inició asignación de vivienda')
  }
})

<Tooltip content={!tieneCedula ? '📋 Documento requerido...' : 'Asignar vivienda'}>
  <button
    onClick={handleIniciarAsignacion}
    disabled={!puedeAsignar}
    className={puedeAsignar ? 'bg-white/20...' : 'bg-gray-400/20...'}
  >
    {tieneCedula ? <Home /> : <Lock />}
    Asignar Vivienda
  </button>
</Tooltip>
```

---

## 📐 Validación y Estados

### ✅ Estados del Botón

| Estado | Icono | Color | Tooltip | Acción |
|--------|-------|-------|---------|--------|
| **Habilitado** | `Home` | Blanco/Verde | "Iniciar asignación" | Navega a crear negociación |
| **Deshabilitado** | `Lock` | Gris | "📋 Documento requerido..." | Sin acción |
| **Cargando** | `Loader` | Gris | "Validando..." | Sin acción |
| **Cliente con Negociación** | - | - | - | ❌ No se muestra |

### ✅ Condiciones de Visibilidad

```typescript
// Mostrar botón solo si:
const mostrarBotonAsignar = (
  !cliente.tieneNegociacionActiva &&  // Sin negociación activa
  cliente.estado === 'Interesado' &&   // Estado Interesado
  !cargandoValidacion                  // No está cargando validación
)

// Habilitar botón solo si:
const habilitarBoton = (
  tieneCedula &&                       // Tiene documento de identidad
  !cargandoValidacion                  // No está cargando
)
```

---

## 🧪 Casos de Prueba

### ✅ Escenarios de Usuario

#### Escenario 1: Cliente Nuevo sin Documento
```
1. Usuario crea cliente
2. Entra al detalle del cliente
3. Ve botón "Asignar Vivienda" DESHABILITADO (icono Lock)
4. Hover muestra tooltip: "📋 Documento requerido..."
5. Banner en tab General muestra: "Acción requerida" (naranja)
6. Click en banner lleva a tab "Documentos"
7. Usuario sube documento
8. Botón se HABILITA automáticamente (icono Home)
9. Click inicia asignación de vivienda
```

#### Escenario 2: Cliente con Documento Subido
```
1. Usuario entra al detalle de cliente con documento
2. Ve botón "Asignar Vivienda" HABILITADO (icono Home)
3. Banner en tab General muestra: "¡Listo para asignar!" (verde)
4. Click en botón navega a crear negociación
5. Sistema pre-carga datos del cliente
```

#### Escenario 3: Cliente con Negociación Activa
```
1. Usuario entra al detalle de cliente con negociación
2. NO ve botón "Asignar Vivienda" (oculto)
3. NO ve banner en tab General (oculto)
4. Tab "Negociaciones" tiene badge con contador
5. Usuario gestiona negociación existente
```

---

## 🎨 Mockups Visuales

### Header del Detalle (Ubicación Principal)

```
┌─────────────────────────────────────────────────────────────┐
│  [←Volver]                                                  │
├─────────────────────────────────────────────────────────────┤
│  GRADIENTE CYAN/BLUE (Header)                               │
│                                                              │
│  [👤] Pedro Perez Gonzalez              [🟢 Interesado]    │
│       C.C. 123.456.789                                       │
│       ⚠️ Perfil Incompleto                                  │
│                                                              │
│                    [🏠 Asignar Vivienda]  [✏️]  [🗑️]       │
│                     ↑                                        │
│                DESHABILITADO (gris + Lock)                   │
│                Tooltip: "📋 Documento requerido..."          │
└─────────────────────────────────────────────────────────────┘
```

### Tab "Información General" (Banner Contextual)

```
┌─────────────────────────────────────────────────────────────┐
│  [Información General] [Intereses] [Negociaciones]...       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ╔════════════════════════════════════════════════════════╗ │
│  ║  BANNER NARANJA (Acción Requerida)                    ║ │
│  ║                                                         ║ │
│  ║  [⚠️] Acción requerida                                 ║ │
│  ║       Sube el documento de identidad del cliente...    ║ │
│  ║                                                         ║ │
│  ║       Checklist:                                        ║ │
│  ║       ✓ Cliente registrado                             ║ │
│  ║       ○ Documento de identidad                         ║ │
│  ║                                                         ║ │
│  ║       [📤 Subir Documento]                             ║ │
│  ╚════════════════════════════════════════════════════════╝ │
│                                                              │
│  Estadísticas Comerciales...                                │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Checklist de Implementación

### Fase 1: Header del Detalle (Prioridad Alta)

- [ ] Crear hook `useAsignacionVivienda` con validación
- [ ] Reemplazar botón "Crear Negociación" por "Asignar Vivienda"
- [ ] Implementar tooltip con mensaje contextual
- [ ] Agregar iconos Lock (deshabilitado) / Home (habilitado)
- [ ] Validar con `useDocumentoIdentidad` (no campo legacy)
- [ ] Agregar animaciones hover/tap si está habilitado
- [ ] Testing: 3 escenarios (sin doc, con doc, con negociación)

### Fase 2: Banner Tab General (Mejora Menor)

- [ ] Cambiar icono `Handshake` por `Home` en botón
- [ ] Validar que use `useDocumentoIdentidad` correctamente ✅ (ya lo hace)
- [ ] Agregar iconos a checklist visual
- [ ] Testing: Verificar banner no se muestra con negociación activa

### Fase 3: Dropdown Acciones (Opcional)

- [ ] Diseñar componente `ActionsDropdown`
- [ ] Agregar opción "Asignar Vivienda" con sub-texto
- [ ] Implementar estado deshabilitado con explicación
- [ ] Integrar con hook `useAsignacionVivienda`
- [ ] Testing: Verificar accesibilidad con teclado

---

## 📚 Documentación Relacionada

- **Validación de documento**: `docs/fixes/FIX-BANNER-DOCUMENTO-CLIENTE.md`
- **Eliminación card invasiva**: `docs/fixes/FIX-VALIDACION-DOCUMENTO-CARD-INVASIVA.md`
- **Hook useDocumentoIdentidad**: `src/modules/clientes/documentos/hooks/useDocumentoIdentidad.ts`
- **Banner CTA**: `src/app/clientes/[id]/tabs/general-tab.tsx`

---

## 💡 Conclusión

### ✅ Ubicación RECOMENDADA: **Header del Detalle del Cliente**

**Por qué:**
1. ✅ **Máxima visibilidad**: Primera acción principal
2. ✅ **Contexto claro**: Junto a otras acciones del cliente
3. ✅ **Validación robusta**: Hook `useDocumentoIdentidad` centralizado
4. ✅ **Feedback visual**: Tooltip + icono Lock/Home
5. ✅ **Flujo natural**: Usuario entra al detalle → ve estado → actúa

### ✅ Ubicación SECUNDARIA: **Banner en Tab General**

**Por qué:**
- ✅ Ya implementado correctamente
- ✅ Contexto de "próximo paso en el proceso"
- ✅ Checklist visual muestra progreso
- ✅ Solo visible si tiene sentido (sin negociación activa)

### ❌ NO UBICAR en Card de Lista

**Por qué:**
- ❌ Validación incorrecta
- ❌ Diseño invasivo
- ❌ Información redundante

---

## 🚀 Próximos Pasos

1. **Implementar botón en header** (Fase 1 - 2h)
2. **Mejorar icono en banner** (Fase 2 - 0.5h)
3. **Testing con usuarios reales** (validar intuitividad)
4. **Considerar dropdown** si se agregan más acciones (Fase 3 - futuro)

**Resultado esperado**: UX intuitiva donde usuario siempre sabe:
- ✅ **Dónde** asignar vivienda
- ✅ **Por qué** no puede (si falta documento)
- ✅ **Cómo** solucionarlo (ir a Documentos)
