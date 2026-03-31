# 🧠 CODEBASE MEMORY — RyR Constructora

> **Propósito**: Documento de contexto completo para que cualquier IA o desarrollador entienda cómo funciona esta aplicación sin necesidad de leer todo el código.
> **Última actualización**: Marzo 2026
> **Mantener actualizado**: Cada vez que se agregue un módulo o cambie un flujo de negocio.

---

## 📌 ¿Qué es esta aplicación?

Sistema de gestión administrativa para la **Constructora RyR**, una empresa constructora colombiana que desarrolla proyectos de vivienda. La app maneja todo el ciclo de vida de un proyecto de construcción: desde la creación del proyecto, pasando por la venta de viviendas, negociación con clientes, recaudo de pagos, hasta la escrituración y entrega final.

**Moneda**: Pesos colombianos (COP)
**Usuarios**: Personal administrativo de la constructora (no clientes finales)
**Ambiente**: Web, acceso interno de la empresa

---

## 🏗️ Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Framework | Next.js (App Router) | 15.5 |
| UI | React | 19.2 |
| Lenguaje | TypeScript (strict) | 5.9 |
| Estilos | Tailwind CSS | 3.4 |
| Animaciones | Framer Motion | 12 |
| Estado servidor | React Query (TanStack) | 5 |
| Estado global | Zustand | 5 |
| Formularios | React Hook Form + Zod | 7 + 4 |
| Base de datos | Supabase (PostgreSQL) | - |
| Autenticación | Supabase Auth (SSR cookies) | - |
| Almacenamiento | Supabase Storage | - |
| PDFs | @react-pdf/renderer | 4.3 |
| Iconos | Lucide React | - |
| Notificaciones | Sonner (toasts) | - |

---

## 🔗 Flujo General del Negocio

```
PROYECTO (obra de construcción)
  └── tiene MANZANAS (agrupaciones)
        └── tienen VIVIENDAS (lotes/casas individuales)
              └── se ASIGNAN a CLIENTES mediante NEGOCIACIONES
                    └── financiadas por FUENTES DE PAGO (cuota inicial, crédito, subsidio, etc.)
                          └── que reciben ABONOS (pagos parciales o totales)
                                └── hasta completar el 100% → ESCRITURACIÓN y ENTREGA
```

---

## 📦 Módulos del Sistema

### 1. PROYECTOS

**Qué es**: Un proyecto es una obra de construcción (ej: "Urbanización Los Álamos"). Contiene manzanas, y cada manzana contiene viviendas.

**Cómo funciona**:
- Se crea un proyecto con nombre, ubicación, descripción, fechas de inicio/fin previstas y presupuesto.
- Dentro del proyecto se crean MANZANAS (bloques de viviendas agrupados, ej: "Manzana A", "Manzana B").
- Cada manzana contiene múltiples VIVIENDAS.
- El proyecto tiene estados: `en_proceso`, `completado`, `pausado`.
- No se eliminan permanentemente, se archivan (soft-delete).

**Tabla**: `proyectos`
**Campos clave**: id, nombre, descripcion, ubicacion, fecha_inicio, fecha_fin_prevista, presupuesto, estado

**Tabla**: `manzanas`
**Campos clave**: id, proyecto_id, nombre
**Restricción**: nombre único por proyecto (no dos "Manzana A" en el mismo proyecto)

---

### 2. VIVIENDAS

**Qué es**: Cada vivienda es un lote o casa individual dentro de un proyecto que se pone a la venta.

**Cómo funciona**:
- Se crean dentro de una manzana de un proyecto.
- Cada vivienda tiene datos legales (matrícula inmobiliaria), físicos (área lote, área construida, nomenclatura) y financieros.
- El **valor total** de la vivienda se calcula así:

  ```
  valor_total = valor_base + recargo_esquinera + gastos_notariales
  ```

  - `valor_base`: Precio base de la vivienda
  - `recargo_esquinera`: Recargo si es vivienda esquinera (configurable desde admin, NO hardcodeado)
  - `gastos_notariales`: Gastos de escrituración (configurables desde admin)

- La matrícula inmobiliaria es ÚNICA en todo el sistema (no pueden existir dos viviendas con la misma matrícula).

**Estados de la vivienda**:
| Estado | Significado |
|--------|-------------|
| `Disponible` | Lista para la venta, sin cliente asignado |
| `Asignada` | Tiene una negociación activa con un cliente |
| `Entregada` | Pagada al 100% y entregada al propietario |

**Transiciones**:
```
Disponible →[se crea negociación]→ Asignada
Asignada →[pago 100% + entrega]→ Entregada
Asignada →[cliente renuncia]→ Disponible (vuelve al mercado)
```

**Tabla**: `viviendas`
**Campos clave**: id, proyecto_id, manzana_id, matricula_inmobiliaria, nomenclatura, area_lote, area_construida, valor_base, recargo_esquinera, gastos_notariales, valor_total, estado, cliente_id, negociacion_id, fecha_entrega

---

### 3. CLIENTES

**Qué es**: Personas naturales que compran viviendas. El sistema maneja su información personal y su ciclo de vida como comprador.

**Cómo funciona**:
- Se registra un cliente con datos personales: nombres, apellidos, cédula (número de documento), teléfono, email, estado civil, fecha de nacimiento.
- Un cliente puede expresar **interés** en proyectos y viviendas ANTES de comprar (módulo de intereses).
- Cuando se crea una negociación, el cliente pasa a estado "Activo".
- La página de detalle del cliente tiene pestañas: información personal, negociación activa, documentos, historial.

**Estados del cliente**:
| Estado | Significado |
|--------|-------------|
| `Interesado` | Registrado, explorando opciones |
| `Activo` | Tiene una negociación activa (está comprando) |
| `En Proceso de Renuncia` | Solicitó retirarse de la compra |
| `Propietario` | Completó el pago, es dueño de la vivienda |
| `Renunció` | Se retiró completamente de la compra |
| `Inactivo` | Desactivado del sistema |

**Transiciones**:
```
Interesado →[se crea negociación]→ Activo
Activo →[se crea renuncia]→ En Proceso de Renuncia →[se cierra renuncia]→ Renunció
Activo →[negociación completada]→ Propietario
```

**Tabla**: `clientes`
**Campos clave**: id, nombres, apellidos, numero_documento, telefono, email, estado_civil, fecha_nacimiento, estado
**Restricción**: número de documento ÚNICO

**Tabla**: `cliente_intereses` — Registra en qué proyectos/viviendas ha mostrado interés

---

### 4. NEGOCIACIONES

**Qué es**: El acuerdo de compra-venta entre un cliente y una vivienda. Es la entidad central que conecta todo: cliente + vivienda + fuentes de pago + abonos.

**Cómo funciona**:
- Se crea vinculando un cliente con una vivienda disponible.
- Al crearse, la vivienda pasa a estado "Asignada" y el cliente a "Activo".
- Se define el valor negociado (puede incluir descuento sobre el valor_total de la vivienda).
- Se configuran las fuentes de pago (cómo va a pagar el cliente).
- Los totales financieros se calculan AUTOMÁTICAMENTE por triggers en la base de datos:

  ```
  valor_total = valor de la vivienda - descuento_aplicado
  total_fuentes_pago = Σ(montos de todas las fuentes)
  total_abonado = Σ(todos los abonos realizados)
  saldo_pendiente = total_fuentes_pago - total_abonado
  porcentaje_pagado = (total_abonado / total_fuentes_pago) × 100
  ```

- Solo puede haber UNA negociación activa por combinación cliente+vivienda.
- La creación es **transaccional**: se crea la negociación + fuentes de pago + créditos todo en un solo paso, si algo falla, todo se revierte.

**Estados de la negociación**:
| Estado | Significado |
|--------|-------------|
| `Activa` | En curso, recibiendo pagos |
| `Suspendida` | Pausada temporalmente |
| `Completada` | Pagada al 100%, requiere `fecha_completada` |
| `Cerrada por Renuncia` | Cliente se retiró |

**Tabla**: `negociaciones`
**Campos clave**: id, cliente_id, vivienda_id, valor_negociado, descuento_aplicado, valor_total, total_fuentes_pago, total_abonado, saldo_pendiente, porcentaje_pagado, estado, fecha_completada
**Restricción**: UNIQUE(cliente_id, vivienda_id) donde estado esté activo

---

### 5. FUENTES DE PAGO

**Qué es**: Define CÓMO va a pagar el cliente su vivienda. Una negociación puede tener múltiples fuentes (ej: cuota inicial + crédito hipotecario + subsidio).

**Cómo funciona**:
- Los TIPOS de fuentes se cargan **dinámicamente desde la base de datos** (tabla `tipos_fuentes_pago`), NUNCA se hardcodean en el código.
- Al configurar una negociación, se seleccionan las fuentes aplicables y se asigna un monto a cada una.
- Cada fuente puede estar asociada a una entidad financiera (banco, caja de compensación, etc.) que también se carga dinámicamente.

**Tipos de fuentes disponibles** (configurables desde admin):
| Tipo | Descripción | Característica especial |
|------|-------------|----------------------|
| Cuota Inicial | Pago directo del cliente | Permite múltiples abonos parciales |
| Crédito Hipotecario | Préstamo bancario | Entidad financiera obligatoria, pago único del banco |
| Subsidio Mi Casa Ya | Subsidio del gobierno colombiano | Pago único |
| Subsidio Caja de Compensación | Subsidio de caja de compensación | Entidad financiera obligatoria |
| Crédito con la Constructora | Financiamiento directo de RyR | Genera tabla de amortización con intereses |

**Concepto CRÍTICO — `capital_para_cierre` vs `monto_aprobado`**:

Cuando una fuente es un crédito con intereses (ej: Crédito Constructora), el monto total incluye intereses. Pero para el **cierre financiero** (que el plan de pagos cubra el 100% de la vivienda), solo cuenta el CAPITAL:

```
Ejemplo:
- Vivienda vale $200M
- Cuota Inicial: monto_aprobado = $50M, capital_para_cierre = $50M
- Crédito Constructora: monto_aprobado = $180M (capital $150M + intereses $30M)
                         capital_para_cierre = $150M

Cierre financiero: $50M + $150M = $200M ✅ (balanceado)
Total real a pagar: $50M + $180M = $230M (incluye intereses)
```

**Estados de fuente de pago**:
| Estado | Significado |
|--------|-------------|
| `Activa` | Vigente, recibiendo o esperando pagos |
| `Inactiva` | Deshabilitada |

**Tabla**: `fuentes_pago`
**Campos clave**: id, negociacion_id, tipo_fuente, entidad_financiera_id, monto_aprobado, capital_para_cierre, monto_recibido, saldo_pendiente, permite_multiples_abonos, estado

---

### 6. CIERRE FINANCIERO (Regla de Negocio Crítica)

**Qué es**: Es la validación que asegura que la suma de todas las fuentes de pago cubre exactamente el valor de la vivienda. Sin cierre financiero balanceado, la negociación no puede completarse.

**Cómo funciona**:
```
Para cada fuente de pago:
  → Si tiene capital_para_cierre, usar ESE valor
  → Si no, usar monto_aprobado

totalParaCierre = Σ(capital_para_cierre ?? monto_aprobado de cada fuente)
diferencia = valorVivienda - totalParaCierre
estaBalanceado = |diferencia| < $1 COP (tolerancia de 1 peso)
```

**Rebalanceo**: Si las fuentes no cuadran (ej: se cambió una entidad financiera que aprobó un monto diferente), existe una funcionalidad de REBALANCEO que:
1. Ajusta los montos de las fuentes atómicamente (todo o nada)
2. INVALIDA documentos si la entidad financiera cambió o el monto aumentó
3. Crea automáticamente documentos pendientes para los nuevos requisitos
4. Registra toda la operación en auditoría

**Ubicación**: `src/shared/hooks/useCierreFinanciero.ts` (lógica pura)
**RPC**: `rebalancear_plan_financiero` (función PostgreSQL atómica)

---

### 7. CRÉDITO CON LA CONSTRUCTORA

**Qué es**: Tipo especial de fuente de pago donde la constructora RyR financia directamente al cliente, con intereses.

**Cómo funciona**:
- Al crear esta fuente, se genera automáticamente una **tabla de amortización** (cuotas mensuales con capital + interés).
- La tasa de interés se define al crear el crédito.
- Se calcula el interés mensual sobre saldo de capital.
- El sistema genera N cuotas (plazo definido) con fecha de vencimiento.
- El estado de cada cuota (al día, vencida, pagada parcial) se calcula EN TIEMPO REAL mediante una VISTA SQL (`vista_estado_periodos_credito`), NO se almacena en tabla.

**Tablas involucradas**:
- `creditos_constructora`: Datos del crédito (tasa, plazo, capital)
- `cuotas_credito`: Tabla de amortización generada (N filas, una por cuota mensual)
- `vista_estado_periodos_credito`: Vista SQL que calcula estado actual de cada cuota cruzando con abonos reales

**Importante**: NUNCA calcular el estado de una cuota manualmente en código — siempre consultar la vista.

---

### 8. ABONOS (Pagos)

**Qué es**: Cada pago que el cliente realiza contra una fuente de pago.

**Cómo funciona**:
- Un abono se registra contra una fuente de pago específica (ej: pago de $5M contra "Cuota Inicial").
- Los abonos son **INMUTABLES**: una vez creados, no se pueden editar ni eliminar. Si hubo un error, se corrige con un nuevo registro.
- Al crear un abono, TRIGGERS automáticos actualizan:
  - `fuentes_pago.monto_recibido` (se suma el abono)
  - `fuentes_pago.saldo_pendiente` (se recalcula)
  - `negociacion.total_abonado` (se actualiza)
  - `negociacion.porcentaje_pagado` (se recalcula)
- Cada abono tiene un número de recibo secuencial dentro de la negociación.
- Se puede adjuntar comprobante de pago (imagen/PDF en Storage).

**Métodos de pago**: Transferencia, Cheque, Efectivo, PSE, Tarjeta

**Tabla**: `abonos`
**Campos clave**: id, fuente_pago_id, monto, fecha_abono, metodo_pago, numero_recibo, comprobante_url, observaciones

**Ejemplo de flujo**:
```
1. Negociación tiene Cuota Inicial = $50M
2. Cliente paga $10M → Abono #1 (trigger: monto_recibido = $10M, saldo = $40M)
3. Cliente paga $15M → Abono #2 (trigger: monto_recibido = $25M, saldo = $25M)
4. Cliente paga $25M → Abono #3 (trigger: monto_recibido = $50M, saldo = $0)
   → Fuente "Cuota Inicial" completada
```

---

### 9. DOCUMENTOS

**Qué es**: Sistema completo de gestión documental para proyectos, viviendas y clientes. Cada documento tiene versionado, categorización y seguimiento de pendientes.

**Cómo funciona**:

**Subida y metadata**:
- Se sube un archivo (PDF, imagen, etc.) a Supabase Storage.
- Se registra metadata en base de datos: título, categoría, fecha del documento.
- Las categorías son configurables desde admin (no hardcodeadas).

**Versionado**:
- Al reemplazar un documento, se crea una nueva versión (v2, v3...).
- Las versiones anteriores se conservan en Storage (nunca se borran).
- Motivos de nueva versión: actualización, corrección de error, obsolescencia, restauración.

**Documentos pendientes**:
- Cada tipo de fuente de pago tiene REQUISITOS documentales (ej: "Crédito Hipotecario" requiere "Carta de Aprobación").
- Los documentos pendientes se calculan EN TIEMPO REAL mediante la vista SQL `vista_documentos_pendientes_fuentes`.
- Cuando se sube un documento con metadata que coincide con un requisito pendiente, el sistema lo VINCULA AUTOMÁTICAMENTE.
- Hay dos alcances:
  - `ESPECIFICO_FUENTE`: Un documento por cada fuente (ej: Carta de Aprobación de cada banco)
  - `COMPARTIDO_CLIENTE`: Un documento por cliente (ej: Cédula, válida para todas las fuentes)

**Eliminación**: Solo administradores pueden eliminar documentos. Se usa soft-delete (marcar `eliminado = true`), nunca eliminación física.

**Tabla**: `documentos_proyecto` (¡NO `documentos`!)
**Campos clave**: id, titulo, categoria, url_storage, fecha_documento, eliminado
**Tabla versiones**: `versiones_documento`

---

### 10. RENUNCIAS

**Qué es**: Proceso formal cuando un cliente decide retirarse de la compra de una vivienda.

**Cómo funciona**:
- Se crea una renuncia asociada a una negociación activa.
- Al crearse, el sistema automáticamente:
  1. Cambia estado del cliente → `En Proceso de Renuncia`
  2. Cambia estado de la negociación → `Cerrada por Renuncia`
  3. Cambia estado de la vivienda → `Disponible` (vuelve al mercado para venderla a otro)
  4. Toma SNAPSHOTS de todos los datos al momento de la renuncia (vivienda, cliente, negociación, fuentes, abonos) para preservar la información histórica aunque los datos cambien después.
- Se calcula el monto a devolver al cliente (basado en abonos realizados).
- Se registra la devolución: fecha, método, referencia y comprobante.
- Los abonos NO se eliminan (son inmutables) — quedan como historial.

**Estados de renuncia**:
| Estado | Significado |
|--------|-------------|
| `Pendiente Devolución` | Renuncia creada, pendiente devolver dinero |
| `Cerrada` | Dinero devuelto, proceso terminado |
| `Cancelada` | Renuncia anulada (cliente decidió continuar) |

**Tabla**: `renuncias`
**Campos clave**: id, negociacion_id, monto_a_devolver, vivienda_datos_snapshot, cliente_datos_snapshot, negociacion_datos_snapshot, fecha_devolucion, metodo_devolucion

---

### 11. AUDITORÍAS

**Qué es**: Registro inmutable de TODOS los cambios realizados en el sistema.

**Cómo funciona**:
- Cada operación CRUD en tablas principales genera automáticamente un registro de auditoría via triggers de PostgreSQL.
- Se registra: quién hizo el cambio, qué tabla, qué acción (CREATE/UPDATE/DELETE), datos anteriores y datos nuevos (como JSON).
- Los registros son APPEND-ONLY: no se pueden modificar ni eliminar.
- El módulo de auditorías tiene un sistema de **renderers especializados** por módulo (Factory Pattern): cada tipo de auditoría (crear proyecto, actualizar vivienda, etc.) tiene un componente de visualización que muestra la información de manera clara con diff visual (anterior → nuevo).

**Tabla**: `audit_log`
**Campos clave**: id, usuario_id, tabla, accion (CREATE/UPDATE/DELETE), datos_anteriores (JSONB), datos_nuevos (JSONB), metadata (JSONB), created_at

---

### 12. ADMIN PANEL Y CONFIGURACIÓN

**Qué es**: Panel de administración para configurar parámetros del sistema sin necesidad de tocar código.

**Qué se puede configurar**:

| Configuración | Tabla | Impacto |
|--------------|-------|---------|
| Tipos de fuentes de pago | `tipos_fuentes_pago` | Qué fuentes aparecen al crear negociación |
| Entidades financieras | `entidades_financieras` | Bancos/cajas disponibles para asociar |
| Categorías de documentos | `categorias_sistema` | Categorías del módulo de documentos |
| Recargos (esquinera, notariales) | `configuracion_recargos` | Se aplican al calcular valor_total de vivienda |
| Plantillas de requisitos | `plantillas_requisitos` | Documentos requeridos por tipo de fuente |
| Campos dinámicos por tipo | `tipos_fuentes_campos` | Campos extra que pide cada tipo de fuente |

**Regla fundamental**: Todo lo configurable se carga dinámicamente desde BD en tiempo de ejecución. NUNCA hardcodear arrays de opciones en el código.

---

### 13. USUARIOS

**Qué es**: Gestión de los usuarios del sistema (personal de la constructora).

**Cómo funciona**:
- Autenticación manejada por Supabase Auth con SSR cookies.
- Hay un sistema de idle timeout que cierra sesión automáticamente por inactividad.
- Los roles y permisos se controlan con Row Level Security (RLS) en PostgreSQL.
- Solo administradores pueden acceder al panel de admin y eliminar documentos.

---

## 🔐 Seguridad y Auditoría

| Mecanismo | Descripción |
|-----------|-------------|
| **RLS** | Row Level Security en todas las tablas — queries filtradas por permisos |
| **Audit Trail** | Toda operación CRUD registrada inmutablemente en `audit_log` |
| **Soft Deletes** | Nada se elimina permanentemente (compliance) |
| **Snapshots** | Renuncias capturan estado al momento (resolución de disputas) |
| **Versionado Docs** | Todas las versiones preservadas en Storage |
| **Abonos Inmutables** | Pagos no modificables (integridad financiera) |
| **Eliminación Admin-Only** | Solo administradores pueden eliminar documentos |
| **Idle Timeout** | Cierre de sesión automático por inactividad |

---

## ⚙️ Reglas Técnicas del Proyecto

### Separación de Responsabilidades (INVIOLABLE)

```
Componente .tsx   → SOLO UI presentacional (< 150 líneas)
Hook use*.ts      → TODA la lógica de negocio (< 200 líneas)
Service .service.ts → SOLO llamadas a Supabase (< 300 líneas)
Estilos .styles.ts  → Clases de Tailwind centralizadas
```

### Theming Modular
Cada módulo tiene su paleta de colores, gestionada desde `src/shared/config/module-themes.ts`:
- Proyectos: Verde/Esmeralda
- Viviendas: Naranja/Ámbar
- Clientes: Cyan/Azul
- Negociaciones: Rosa/Púrpura
- Abonos: Azul/Índigo
- Documentos: Rojo/Rosa
- Auditorías: Azul/Púrpura

### Sanitización de Datos
SIEMPRE usar funciones de sanitización antes de insert/update en BD:
- Strings vacíos → `null`
- Enums validados contra valores permitidos
- Fechas formateadas con `formatDateForDB()` (hora mediodía para evitar timezone shift)

### Fechas
NUNCA usar `new Date()` directo. Siempre importar de `@/lib/utils/date.utils`:
- Mostrar: `formatDateCompact(fecha)` → "16-feb-2023"
- Input: `formatDateForInput(fecha)` → "2023-02-16"
- Guardar: `formatDateForDB(valor)` → "2023-02-16T12:00:00"
- Hoy: `getTodayDateString()` sin timezone shift

### Tipos Auto-generados
Después de cualquier cambio en BD: `npm run types:generate` regenera `database.types.ts` con autocomplete completo de tablas y columnas.

---

## 📁 Estructura de Carpetas

```
src/
├── app/                          # Rutas Next.js (App Router)
│   ├── (dashboard)/              # Layout principal protegido
│   ├── login/                    # Autenticación
│   ├── proyectos/                # /proyectos, /proyectos/[id]
│   ├── viviendas/                # /viviendas, /viviendas/nueva, /viviendas/[slug]
│   ├── clientes/                 # /clientes, /clientes/[id] (con tabs)
│   ├── abonos/                   # /abonos
│   ├── documentos/               # /documentos
│   ├── auditorias/               # /auditorias
│   ├── renuncias/                # /renuncias
│   ├── reportes/                 # /reportes
│   └── admin/                    # Panel admin con sub-rutas
│
├── modules/                      # Módulos por dominio (12 módulos)
│   ├── proyectos/
│   ├── viviendas/
│   ├── clientes/                 # El más grande: 13 services
│   ├── negociaciones/
│   ├── fuentes-pago/
│   ├── abonos/
│   ├── documentos/               # 8 services, versionado completo
│   ├── auditorias/               # Factory pattern de renderers
│   ├── admin/
│   ├── usuarios/
│   ├── configuracion/
│   └── requisitos-fuentes/
│
├── shared/                       # Recursos compartidos
│   ├── components/layout/        # ModuleContainer, Card, Button, Badge, States
│   ├── components/modals/        # Sistema de modales
│   ├── components/forms/         # Inputs reutilizables
│   ├── config/module-themes.ts   # Colores por módulo
│   ├── hooks/                    # useDebounce, usePagination, useCierreFinanciero...
│   └── utils/                    # Sanitización, fechas
│
├── components/                   # Componentes globales (sidebar, auth, theme)
├── contexts/                     # AuthContext, UnsavedChangesContext
├── services/                     # AuditService global (singleton)
└── lib/
    ├── supabase/                 # Clientes Supabase (browser, server, admin)
    ├── utils/                    # date.utils.ts, sanitize.utils.ts
    └── validations/              # Schemas Zod
```

---

## 🔄 Triggers y Automatismos en BD

| Trigger | Tabla | Acción |
|---------|-------|--------|
| Auto-calcular totales | `abonos` INSERT | Actualiza `fuentes_pago.monto_recibido` y `negociacion.total_abonado` |
| Auto-calcular saldo | `fuentes_pago` UPDATE | Recalcula `saldo_pendiente` |
| Auto-calcular porcentaje | `negociaciones` UPDATE | Recalcula `porcentaje_pagado` |
| Auto-calcular valor_total | `negociaciones` INSERT/UPDATE | Calcula valor con descuento |
| Snapshots de renuncia | `renuncias` INSERT | Captura datos actuales de vivienda, cliente, negociación |
| Monto a devolver | `renuncias` INSERT | Calcula total a devolver basado en abonos |
| Audit log | Todas las tablas principales | Registra cambios en `audit_log` |
| Docs pendientes | `fuentes_pago` INSERT | Crea entradas de documentos pendientes según requisitos |
| Auto-vinculación docs | `documentos_proyecto` INSERT | Vincula con pendientes si metadata coincide |

---

## 📋 Comandos Útiles

```bash
npm run dev                       # Servidor de desarrollo (Turbopack, puerto 3000)
npm run types:generate            # Regenerar tipos TypeScript desde Supabase
npm run type-check                # Verificar errores de compilación
npm run db:sync                   # Tipos + type-check
npm run db:exec <archivo.sql>     # Ejecutar SQL en Supabase (NO copiar/pegar manual)
```

---

## ⚠️ Errores Conocidos y Anti-patrones

| Error | Corrección |
|-------|-----------|
| Hardcodear fuentes de pago | SIEMPRE cargar de `tipos_fuentes_pago` con `activo = true` |
| Usar `monto_aprobado` para cierre financiero | Usar `capital_para_cierre ?? monto_aprobado` |
| Calcular estado de cuota en código | SIEMPRE consultar vista `vista_estado_periodos_credito` |
| `new Date("2025-10-26")` sin hora | Causa timezone shift → usar `formatDateForDB()` |
| Tabla `documentos` | NO EXISTE → Es `documentos_proyecto` |
| Campo `url` en documentos | NO EXISTE → Es `url_storage` |
| Campo `nombre` en clientes | NO EXISTE → Es `nombres` |
| Strings vacíos en BD | PostgreSQL no los acepta en ciertos enums → sanitizar a `null` |
| Editar `database.types.ts` manual | NUNCA → Siempre regenerar con `npm run types:generate` |

---

## 📊 Métricas del Proyecto

- **12 módulos** domain-driven
- **43+ services** para operaciones de BD
- **34 notas Obsidian** de documentación
- **5 capas** de arquitectura estricta
- **7 temas de colores** modulares
- **10+ triggers** automáticos en PostgreSQL
