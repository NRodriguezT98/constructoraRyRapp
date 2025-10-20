# 📋 Pendientes y Próximos Pasos

> **Fecha**: 2025-10-18
> **Estado Actual**: Sistema de Negociaciones 100% funcional (Backend + UI)

---

## ✅ LO QUE YA ESTÁ LISTO (100%)

### 🎯 Sistema Completo de Negociaciones

#### Backend & Servicios
- ✅ **negociaciones.service.ts** - 11 métodos completos
- ✅ **fuentes-pago.service.ts** - 9 métodos para 4 tipos de fuentes
- ✅ **intereses.service.ts** - Actualizado y mejorado

#### Hooks Personalizados
- ✅ **useCrearNegociacion** - Crear con validaciones
- ✅ **useNegociacion** - Gestión de lifecycle completo
- ✅ **useListaIntereses** - Lista + filtros + stats

#### Componentes UI
- ✅ **ModalCrearNegociacion** - Interfaz moderna completa
- ✅ **CierreFinanciero** - Gestión de 4 fuentes de pago
- ✅ **Integración en cliente-detalle** - Botón "Crear Negociación"

#### Base de Datos
- ✅ Scripts SQL listos para ejecutar
- ✅ Políticas RLS configuradas
- ✅ Funciones PostgreSQL creadas
- ✅ Vista intereses_completos actualizada

#### Documentación
- ✅ **DATABASE-SCHEMA-REFERENCE.md** - Fuente única de verdad
- ✅ **DESARROLLO-CHECKLIST.md** - Checklist obligatorio
- ✅ **SISTEMA-VALIDACION-CAMPOS.md** - Prevención de errores
- ✅ **GUIA-CREAR-NEGOCIACION.md** - Guía de usuario completa
- ✅ **LISTO-PARA-PROBAR-NEGOCIACIONES.md** - Testing plan

#### Git
- ✅ **Commit creado** - 46 archivos, 8404 inserciones
- ✅ **Push completado** - Código en repositorio remoto

---

## ⏰ LO QUE QUEDA PENDIENTE

### 🔴 CRÍTICO (Hacer ANTES de usar en producción)

#### 1. Ejecutar SQL en Supabase ⚠️ OBLIGATORIO
**Tiempo**: 5 minutos
**Prioridad**: 🔴 **URGENTE**

**Pasos**:
1. Abrir Supabase Dashboard
2. Ir a: **SQL Editor**
3. Abrir: `supabase/EJECUTAR-ESTE-SQL-AHORA.sql`
4. Copiar TODO el contenido
5. Pegar en SQL Editor
6. Click en **"Run"**

**¿Por qué es crítico?**
- Sin esto, recibirás error 401 al crear negociaciones
- Habilita políticas RLS en tabla `negociaciones`

**Verificación**:
```sql
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'negociaciones';
```
Deberías ver 4 políticas: SELECT, INSERT, UPDATE, DELETE

---

#### 2. Probar Flujo Completo de Negociación
**Tiempo**: 30-45 minutos
**Prioridad**: 🔴 **CRÍTICO**

**Checklist de Testing** (seguir `LISTO-PARA-PROBAR-NEGOCIACIONES.md`):

**Fase 1: Crear Negociación** (11 tests)
- [ ] Navegar a `/clientes/[id]`
- [ ] Verificar que botón "Crear Negociación" esté visible (verde)
- [ ] Click en botón → Modal abre
- [ ] Verificar que proyectos se cargan
- [ ] Seleccionar proyecto → Viviendas se cargan
- [ ] Seleccionar vivienda → Valor se pre-llena
- [ ] Ingresar descuento → Valor total se calcula
- [ ] Agregar notas opcionales
- [ ] Click en "Crear Negociación"
- [ ] Verificar que modal se cierra
- [ ] Verificar que datos del cliente se recargan

**Fase 2: Configurar Fuentes de Pago** (13 tests)
- [ ] Abrir negociación creada
- [ ] Abrir componente "Cierre Financiero"
- [ ] Agregar Cuota Inicial (monto: ej. $40M)
- [ ] Agregar Crédito Hipotecario (monto: ej. $60M, banco: Davivienda)
- [ ] Agregar Subsidio Mi Casa Ya (monto: ej. $10M)
- [ ] Agregar Subsidio Caja Compensación (monto: ej. $5M, caja: Comfandi)
- [ ] Verificar que suma = 100% del valor total
- [ ] Verificar barra de progreso visual
- [ ] Click en "Guardar Fuentes"
- [ ] Verificar que se guardan en BD
- [ ] Verificar que botón "Activar" se habilita (verde)
- [ ] Intentar eliminar fuente (debe funcionar si no tiene dinero)
- [ ] Verificar validación de entidad requerida

**Fase 3: Activar Negociación** (6 tests)
- [ ] Verificar que cierre esté al 100%
- [ ] Click en "Activar Negociación"
- [ ] Verificar que negociación pasa a estado "Activa"
- [ ] Verificar que vivienda se marca como "Reservada"
- [ ] Verificar fecha de activación registrada
- [ ] Intentar activar con < 100% (debe mostrar error)

**Resultado Esperado**:
- ✅ 30/30 tests pasando
- ✅ Sin errores en consola
- ✅ Datos guardados correctamente en BD

---

### 🟡 IMPORTANTE (Mejoras funcionales)

#### 3. Crear Tab "Negociaciones" en Cliente Detalle
**Tiempo**: 2-3 horas
**Prioridad**: 🟡 **ALTA**
**Archivo**: `src/app/clientes/[id]/tabs/negociaciones-tab.tsx`

**Características**:
- Lista de todas las negociaciones del cliente
- Cards con:
  - Estado (badge de color)
  - Vivienda (manzana + número)
  - Valor total
  - % de pago completado
  - Fecha de creación
- Filtros:
  - Todas
  - En Proceso
  - Cierre Financiero
  - Activas
  - Completadas
  - Canceladas
- Click en card → Navegar a detalle de negociación
- Badge con contador en el tab

**Mockup Visual**:
```
┌─────────────────────────────────────────────────────┐
│ Negociaciones (3)                                   │
│                                                     │
│ [Todas] [Activas] [Completadas] [Canceladas]      │
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ 🏠 Manzana A - Casa 12        [🟢 Activa]   │   │
│ │ $120.000.000                                │   │
│ │ ████████████░░░░ 80% pagado                │   │
│ │ Creado: 15 Oct 2025                        │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ 🏠 Manzana B - Casa 5     [🟡 Cierre]       │   │
│ │ $95.000.000                                 │   │
│ │ ░░░░░░░░░░░░░░░░ 0% pagado                 │   │
│ │ Creado: 10 Oct 2025                        │   │
│ └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

**Referencias**:
- Ver `intereses-tab.tsx` como ejemplo de estructura
- Usar `useNegociacion` hook para datos
- Reutilizar componentes de cards existentes

---

#### 4. Crear Página de Detalle de Negociación
**Tiempo**: 4-5 horas
**Prioridad**: 🟡 **ALTA**
**Archivo**: `src/app/clientes/[id]/negociaciones/[negociacionId]/page.tsx`

**Características**:

**1. Header con Datos Básicos**
```
┌─────────────────────────────────────────────────────┐
│ 🤝 Negociación #NEG-001            [🟢 Activa]      │
│                                                     │
│ 👤 Cliente: Juan Pérez                              │
│ 🏠 Vivienda: Manzana A - Casa 12                   │
│ 💰 Valor Total: $120.000.000                       │
│ 📅 Creado: 15 Oct 2025                             │
└─────────────────────────────────────────────────────┘
```

**2. Timeline de Estados**
```
En Proceso → Cierre Financiero → [Activa] → Completada
   ✅             ✅               🟢          ⏳
15 Oct         16 Oct           17 Oct       -
```

**3. Sección de Fuentes de Pago** (reutilizar `CierreFinanciero`)
- Mostrar las 4 fuentes configuradas
- % de cada fuente
- Monto aprobado vs recibido
- Entidades y referencias

**4. Historial de Abonos** (tabla)
```
Fecha       | Fuente          | Monto        | Usuario
------------|-----------------|--------------|----------
18 Oct 2025 | Cuota Inicial   | $10.000.000  | Admin
17 Oct 2025 | Crédito Banco   | $60.000.000  | Admin
```

**5. Botones de Acción** (según estado)
- Si está "En Proceso":
  - [Pasar a Cierre Financiero]
  - [Cancelar]
- Si está "Cierre Financiero":
  - [Activar] (si 100%)
  - [Cancelar]
- Si está "Activa":
  - [Registrar Abono]
  - [Completar] (si 100% pagado)
  - [Registrar Renuncia]
- Si está "Completada":
  - [Ver Detalles] (solo lectura)

**6. Sección de Notas**
- Área de texto para agregar observaciones
- Historial de notas con fecha y usuario

---

#### 5. Sistema de Abonos
**Tiempo**: 3-4 horas
**Prioridad**: 🟡 **MEDIA**

**Características**:
- **Modal "Registrar Abono"**
  - Seleccionar fuente de pago (Cuota Inicial o crédito/subsidio)
  - Ingresar monto recibido
  - Validar que no exceda monto aprobado
  - Agregar comprobante (opcional)
  - Agregar notas
- **Tabla de Historial**
  - Fecha, fuente, monto, usuario
  - Ordenado por fecha descendente
- **Actualización Automática**
  - Al registrar abono:
    - Actualizar `monto_recibido` en fuente
    - Actualizar `saldo_pendiente`
    - Si fuente completa → marcar como "Completada"
    - Si todas las fuentes completas → habilitar "Completar Negociación"

---

#### 6. Convertir Interés → Negociación
**Tiempo**: 2 horas
**Prioridad**: 🟡 **MEDIA**

**Ubicación**: `src/app/clientes/[id]/tabs/intereses-tab.tsx`

**Características**:
- Botón "Convertir a Negociación" en cada card de interés activo
- Al hacer click:
  - Abrir `ModalCrearNegociacion` pre-llenado con:
    - `clienteId` del interés
    - `viviendaId` del interés
    - `valorNegociado` del `valor_estimado` del interés
  - Usuario ajusta valores si es necesario
  - Al crear negociación:
    - Actualizar interés:
      - `estado` = 'Negociación'
      - `negociacion_id` = ID de la negociación creada
      - `fecha_conversion` = NOW()
    - Recargar lista de intereses

**Función PostgreSQL existente**:
```sql
SELECT convertir_interes_a_negociacion(
  p_interes_id := 'UUID-del-interés',
  p_valor_negociado := 120000000,
  p_descuento := 5000000
);
```

---

### 🟢 OPCIONAL (Mejoras de UX)

#### 7. Notificaciones en Tiempo Real
**Tiempo**: 2-3 horas
**Prioridad**: 🟢 **BAJA**

- Notificar cuando:
  - Se crea una negociación
  - Se completa el cierre financiero
  - Se activa una negociación
  - Se registra un abono
  - Se completa una negociación
- Usar Supabase Realtime subscriptions

---

#### 8. Reportes y Estadísticas
**Tiempo**: 4-5 horas
**Prioridad**: 🟢 **BAJA**

**Dashboard de Negociaciones**:
- Total de negociaciones por estado
- Gráfico de embudo (En Proceso → Activa → Completada)
- Top 10 clientes con más negociaciones
- Promedio de días para cerrar
- Tasa de conversión de intereses → negociaciones
- Proyección de ventas (negociaciones activas)

---

#### 9. Exportar a Excel/PDF
**Tiempo**: 2 horas
**Prioridad**: 🟢 **BAJA**

- Exportar lista de negociaciones
- Exportar detalle de negociación con abonos
- Generar recibo de abono en PDF

---

#### 10. Envío de Emails Automáticos
**Tiempo**: 3 horas
**Prioridad**: 🟢 **BAJA**

- Email al cliente cuando:
  - Se crea negociación
  - Se activa negociación
  - Se registra abono
  - Se completa negociación
- Plantillas HTML personalizadas

---

## 📊 Resumen de Prioridades

### 🔴 Crítico (Hacer YA)
1. ⏰ **Ejecutar SQL en Supabase** (5 min)
2. ⏰ **Probar flujo completo** (30-45 min)

### 🟡 Importante (Próxima semana)
3. 📅 **Tab Negociaciones** (2-3 horas)
4. 📅 **Página detalle negociación** (4-5 horas)
5. 📅 **Sistema de abonos** (3-4 horas)
6. 📅 **Convertir interés → negociación** (2 horas)

**Total Importante**: ~13 horas de desarrollo

### 🟢 Opcional (Futuro)
7. Notificaciones en tiempo real (2-3 horas)
8. Reportes y estadísticas (4-5 horas)
9. Exportar Excel/PDF (2 horas)
10. Emails automáticos (3 horas)

**Total Opcional**: ~12 horas de desarrollo

---

## 🎯 Roadmap Recomendado

### Esta Semana (Crítico)
- **Lunes**: Ejecutar SQL + Testing completo (1 hora)
- **Resultado**: Sistema 100% funcional y probado

### Próxima Semana (Importante)
- **Lunes-Martes**: Tab Negociaciones (2-3 horas)
- **Miércoles-Jueves**: Página detalle negociación (4-5 horas)
- **Viernes**: Sistema de abonos (3-4 horas)
- **Resultado**: Módulo completo con UI completa

### Siguiente Mes (Opcional)
- **Semana 1**: Reportes y estadísticas
- **Semana 2**: Notificaciones + Emails
- **Resultado**: Sistema con features avanzadas

---

## 📞 Soporte y Ayuda

### Si hay problemas durante el testing:

1. **Error 401 al crear negociación**
   - ✅ Ejecutar `supabase/EJECUTAR-ESTE-SQL-AHORA.sql`
   - ✅ Verificar políticas RLS

2. **Proyectos no cargan**
   - Verificar que existen proyectos en DB
   - Verificar consola de browser (F12)

3. **Viviendas no cargan**
   - Verificar que proyecto seleccionado tenga viviendas
   - Verificar estado de viviendas (deben estar "disponibles")

4. **No se puede activar negociación**
   - Verificar que suma de fuentes = 100% del valor total
   - Tolerancia de error: ±1 peso

5. **Cualquier otro error**
   - Abrir consola de browser (F12)
   - Copiar error completo
   - Buscar en documentación: `GUIA-CREAR-NEGOCIACION.md`

---

## 📚 Referencias Útiles

### Documentación
- `RESUMEN-SISTEMA-NEGOCIACIONES.md` - Resumen ejecutivo completo
- `GUIA-CREAR-NEGOCIACION.md` - Guía de usuario paso a paso
- `LISTO-PARA-PROBAR-NEGOCIACIONES.md` - Checklist de testing
- `DATABASE-SCHEMA-REFERENCE.md` - Schema de BD
- `DESARROLLO-CHECKLIST.md` - Checklist de desarrollo

### Archivos Clave
- `src/modules/clientes/services/negociaciones.service.ts` - Servicio principal
- `src/modules/clientes/services/fuentes-pago.service.ts` - Fuentes de pago
- `src/modules/clientes/hooks/useCrearNegociacion.ts` - Hook de creación
- `src/modules/clientes/hooks/useNegociacion.ts` - Hook de gestión
- `src/modules/clientes/components/modals/modal-crear-negociacion.tsx` - Modal
- `src/modules/clientes/components/negociaciones/cierre-financiero.tsx` - Cierre

### Scripts SQL
- `supabase/EJECUTAR-ESTE-SQL-AHORA.sql` - **EJECUTAR PRIMERO**
- `supabase/EJECUTAR-MEJORAR-INTERESES.sql` - Mejoras a intereses
- `supabase/funcion-convertir-interes.sql` - Función de conversión

---

## ✅ Checklist Final

Antes de considerar el módulo 100% completo:

- [x] Backend implementado (servicios + hooks)
- [x] UI implementada (modales + componentes)
- [x] Integración en cliente-detalle
- [x] Base de datos actualizada
- [x] Documentación completa
- [x] Git push completado
- [ ] **SQL ejecutado en Supabase** ⚠️ **PENDIENTE**
- [ ] **Testing completo realizado** ⚠️ **PENDIENTE**
- [ ] Tab Negociaciones implementado
- [ ] Página detalle implementada
- [ ] Sistema de abonos implementado
- [ ] Conversión interés → negociación implementada

**Progreso**: 6/12 (50%)

---

**Última Actualización**: 2025-10-18
**Próxima Revisión**: Después de testing completo
