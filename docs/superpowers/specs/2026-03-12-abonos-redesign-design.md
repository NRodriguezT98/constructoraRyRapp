# Spec: Rediseño del Módulo de Abonos

**Fecha:** 2026-03-12
**Estado:** Aprobado por usuario
**Alcance:** `/abonos` (lista global) + `/abonos/[clienteId]` (detalle)

---

## Contexto y Motivación

El módulo de abonos actual tiene tres problemas principales:
1. **Inflación visual**: Cards enormes con demasiado padding desperdician espacio vertical
2. **Color incorrecto**: Usa azul/índigo — no tiene semántica de "dinero recibido"
3. **Consecutivo de recibo débil**: `RYR-ABO-2026-02-001` es demasiado largo y no es global

El rediseño aborda los tres problemas simultáneamente.

---

## Decisiones de Diseño Confirmadas

| Decisión | Elección |
|---|---|
| Rutas | Mantener `/abonos` + `/abonos/[clienteId]`, solo rediseño visual |
| Paleta de color | Emerald-500 → Teal-700 (semántica de dinero positivo) |
| Números COP | Siempre completos, nunca abreviados con k/M |
| Formato # Recibo | `RYR-0001` — SERIAL global autoincremental |
| `/abonos` layout | Header + 4 métricas globales + filtros sticky + tabla densa |
| `/abonos/[clienteId]` | Header cliente + 4 métricas financieras + fuentes en filas + tabla abonos |

---

## Cambio en Base de Datos

### Migración requerida

```sql
-- 0. Verificar que no hay datos (confirmar antes de ejecutar)
SELECT COUNT(*) FROM abonos_historial;
-- Si retorna 0, proceder. Si retorna > 0, revisar con el equipo.

-- 1. Limpiar abonos existentes (confirmado: no hay datos en producción)
TRUNCATE TABLE abonos_historial RESTART IDENTITY CASCADE;

-- 2. Crear secuencia global para número de recibo
CREATE SEQUENCE IF NOT EXISTS seq_numero_recibo_global
  START 1
  INCREMENT 1
  NO MAXVALUE
  NO CYCLE;

-- 3. Agregar columna numero_recibo
ALTER TABLE abonos_historial
  ADD COLUMN IF NOT EXISTS numero_recibo INTEGER
    DEFAULT nextval('seq_numero_recibo_global')
    NOT NULL;

-- 4. Índice único
CREATE UNIQUE INDEX IF NOT EXISTS idx_abonos_historial_numero_recibo
  ON abonos_historial (numero_recibo);

-- 5. Actualizar la vista para incluir el nuevo campo
CREATE OR REPLACE VIEW vista_abonos_completos AS
SELECT
  ah.id,
  ah.numero_recibo,
  ah.negociacion_id,
  ah.fuente_pago_id,
  ah.monto,
  ah.fecha_abono,
  ah.metodo_pago,
  ah.numero_referencia,
  ah.notas,
  ah.fecha_creacion,
  n.cliente_id,
  c.nombres,
  c.apellidos,
  c.numero_documento,
  fp.tipo AS tipo_fuente,
  v.numero AS vivienda_numero,
  m.nombre AS manzana_nombre,
  p.nombre AS proyecto_nombre
FROM abonos_historial ah
JOIN negociaciones n ON ah.negociacion_id = n.id
JOIN clientes c ON n.cliente_id = c.id
JOIN fuentes_pago fp ON ah.fuente_pago_id = fp.id
LEFT JOIN viviendas v ON n.vivienda_id = v.id
LEFT JOIN manzanas m ON v.manzana_id = m.id
LEFT JOIN proyectos p ON m.proyecto_id = p.id
ORDER BY ah.fecha_abono DESC;
```

> **Nota**: Verificar el SQL real de `vista_abonos_completos` existente antes de ejecutar y adaptar el `SELECT` al schema actual.

### Post-migración obligatorio

```bash
npm run types:generate   # Regenerar tipos TypeScript desde Supabase
npm run type-check       # Verificar que no hay errores
```

### Actualización de tipos TypeScript

Después de `types:generate`, verificar que `AbonoHistorial` en `src/modules/abonos/types/index.ts` incluya:

```typescript
export interface AbonoHistorial {
  id: string;
  numero_recibo: number;        // ← NUEVO campo SERIAL
  negociacion_id: string;
  fuente_pago_id: string;
  monto: number;
  fecha_abono: string;
  metodo_pago: MetodoPago;
  numero_referencia?: string;   // Ahora: referencia bancaria real, siempre opcional
  notas?: string;
  // ... resto de campos
}
```

### Formato de presentación

`RYR-` + `numero_recibo` con `padStart(4, '0')`

Ejemplo: `numero_recibo = 1` → `RYR-0001`

```typescript
// src/modules/abonos/utils/formato-recibo.ts
export function formatearNumeroRecibo(numero: number): string {
  return `RYR-${String(numero).padStart(4, '0')}`
}
```

### Cambios en API route `/api/abonos/registrar`

**Eliminar** (líneas ~70–109 actuales):
- La variable `fecha`, `anio`, `mes`
- La query a `abonos_historial` para buscar `ultimo_abono`
- La lógica `numeroConsecutivo`, `match`, `consecutivo`
- La asignación `numero_referencia: consecutivo`

**La ruta YA valida** que `fuente_pago_id` pertenezca a `negociacion_id` (líneas ~55–63 del route actual: verifica `fuente.negociacion_id !== negociacion_id`). Esta validación se conserva intacta.

**Schema de body del request** (sin cambios en campos, solo comportamiento):
```typescript
// Campos recibidos del body (todos ya existentes, sin cambios de nombres):
const { negociacion_id, fuente_pago_id, monto, fecha_abono, metodo_pago, numero_referencia, notas } = body
// numero_referencia: ahora SIEMPRE opcional — nunca se auto-genera
```

**Reemplazar** el insert por:
```typescript
const { data: nuevoAbono, error: abonoError } = await supabase
  .from('abonos_historial')
  .insert({
    negociacion_id,
    fuente_pago_id,
    monto,
    fecha_abono: fechaAbonoDB,
    metodo_pago,
    numero_referencia: numero_referencia || null,  // Opcional: referencia bancaria real
    notas: notas || null,
    // numero_recibo: asignado automáticamente por la BD (DEFAULT nextval)
  })
  .select()
  .single()
```

### Campo `numero_referencia` en formulario

En `useRegistrarAbono.ts` (linea ~60): cambiar la validación de advertencia a completamente opcional:
- **Antes**: `if (metodo_pago !== 'Efectivo' && !numero_referencia)` → warning
- **Después**: sin validación — es un campo opcional libre para que el usuario anote el # de cheque, transferencia, etc.
- El label del campo en el formulario cambia a "N° de referencia bancaria (opcional)"

---

## Página `/abonos`

### Header

- Fondo: `bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-700 dark:from-emerald-800 dark:via-emerald-900 dark:to-teal-900`
- Patrón grid overlay: `bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black,transparent)]`
- Izquierda: icono `CreditCard` en `w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm` + título `text-2xl font-bold text-white` + subtítulo `text-emerald-100 dark:text-emerald-200 text-xs`
- Separador: `border-t border-white/20 mt-3 pt-3`
- Abajo del separador: "Total sistema: $X,XXX,XXX,XXX COP" en `text-white font-semibold` + badge `px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs`
- Derecha: botón `+ Registrar` → `px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm hover:bg-white/30` (visible solo si `canCreate`)

### 4 Métricas globales

Grid `grid-cols-2 lg:grid-cols-4 gap-3`, glassmorphism estándar, hover `scale: 1.02, y: -4`:

| # | Label | Valor | Icono |
|---|---|---|---|
| 1 | Total Recaudado | COP completo | `DollarSign` emerald |
| 2 | Total Recibos | número entero | `Receipt` emerald |
| 3 | Promedio por Recibo | COP completo | `TrendingUp` emerald |
| 4 | Abonado este Mes | COP completo | `Calendar` emerald |

### Filtros sticky

- `sticky top-4 z-40 backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-3 shadow-2xl`
- 3 controles en línea horizontal (`flex items-center gap-2`):
  1. Input búsqueda — `flex-1 pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm`; icono `Search` absoluto izquierda; placeholder "Buscar por cliente, CC o RYR-..."
  2. Select fuente — `min-w-[180px] py-2 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-emerald-500 text-sm`; opciones: "Todas las fuentes" + nombres desde `tipos_fuentes_pago` con `activo = true` (usar `cargarTiposFuentesPagoActivas()`)
  3. Select mes — `min-w-[160px]`; opciones: "Todos los meses" + últimos 12 meses calculados en el hook (`Array.from({length: 12}, (_, i) => subMonths(new Date(), i))`)
- Labels `sr-only` (accesibilidad)
- Pie: `flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700` con contador `text-xs text-gray-600 dark:text-gray-400`

### Tabla de recibos

Columnas (en orden):

| Columna | Contenido | Notas |
|---|---|---|
| `# Recibo` | Badge pill emerald `RYR-0001` | Font mono |
| `Fecha` | `dd-mmm-yy` (ej: `12-mar-26`) | `formatDateCompact()` |
| `Cliente` | Nombre bold + CC gris debajo (2 líneas) | Sin truncar |
| `Vivienda / Proyecto` | `Mz.A N°5 · El Rosal` | Sin truncar |
| `Fuente de Pago` | Nombre corto de la fuente | Texto gris |
| `Método` | Método de pago | Texto gris |
| `Monto` | COP completo, alineado derecha | Emerald bold |

**Clases de tabla:**
```
<table className="w-full text-sm">
  <thead>
    <tr className="border-b border-gray-200 dark:border-gray-700">
      <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide pb-2 px-3">...</th>
    </tr>
  </thead>
  <tbody>
    <tr className="border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-colors">
      <td className="py-2.5 px-3 text-gray-900 dark:text-gray-100">...</td>
    </tr>
  </tbody>
</table>
```

- Contenedor: `rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden`
- Fila completa clickeable → navega a `/abonos/[clienteId]`
- Badge `# Recibo`: `inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-mono font-bold`
- Monto: `text-emerald-700 dark:text-emerald-400 font-bold tabular-nums`
- Estado vacío: `Receipt` icon + "No hay abonos registrados" + botón "Registrar primer abono" (si `canCreate`)
- Loading: skeleton rows `h-10 animate-pulse bg-gray-100 dark:bg-gray-800 rounded`

---

## Página `/abonos/[clienteId]`

### Header del cliente

- Mismo gradiente emerald → teal que `/abonos`
- Izquierda: botón `← Volver` (texto blanco, sin borde) + avatar con iniciales (`getAvatarGradient`) + nombre completo `text-xl font-bold text-white` + CC formateado + vivienda/proyecto en gris claro
- Derecha: botón `+ Abono` (si `canCreate`)

### 4 Métricas financieras del cliente

| # | Label | Valor | Notas |
|---|---|---|---|
| 1 | Valor Total | COP completo | Azul neutro |
| 2 | Total Abonado | COP completo + mini barra emerald | Porcentaje debajo |
| 3 | Saldo Pendiente | COP completo | Amber/naranja |
| 4 | % Completado | `24.3%` + barra emerald | Visual prominente |

- Barra de progreso: `h-1.5 rounded-full bg-emerald-500` sobre fondo gris, dentro de las cards 2 y 4

### Fuentes de pago (filas, no cards grandes)

Lista vertical de filas compactas (reemplaza el grid de `FuentePagoCard` actuales).

Estructura Tailwind de cada fila:

```
<div className="flex flex-col gap-0 rounded-xl border border-emerald-200/50 dark:border-emerald-900/30 bg-white dark:bg-gray-900 overflow-hidden">
  {/* Por cada fuente: */}
  <div className="flex items-center gap-3 p-3 border-b border-gray-100 dark:border-gray-800 last:border-b-0 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors">
    {/* Icono */}
    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 dark:bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
      <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
    </div>
    {/* Info principal */}
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm font-semibold text-gray-900 dark:text-white">{fuente.tipo}</span>
        <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">Activa</span>
      </div>
      {/* Barra de progreso thin */}
      <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${porcentaje}%` }} />
      </div>
    </div>
    {/* Valores financieros */}
    <div className="text-right flex-shrink-0">
      <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(monto_recibido)}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">de {formatCurrency(monto_aprobado)}</p>
    </div>
    {/* Porcentaje */}
    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 w-10 text-right flex-shrink-0">{porcentaje}%</span>
    {/* Botón + Abono */}
    {fuente.saldo_pendiente > 0 && canCreate && (
      <button className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors flex-shrink-0">
        + Abono
      </button>
    )}
  </div>
</div>
```

### Tabla de abonos del cliente

Columnas (sin "Cliente" ya que estamos en su página):

| Columna | Contenido |
|---|---|
| `# Recibo` | Badge pill `RYR-0001` |
| `Fecha` | `dd-mmm-yy` |
| `Fuente de Pago` | Nombre de la fuente |
| `Método` | Método de pago |
| `Monto` | COP completo, emerald bold alineado derecha |

**Clases:** Idéntico al patrón de tabla de `/abonos` (mismas clases `dark:*`, mismo contenedor `rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900`).

- Si el abono tiene `notas`, mostrar icono `MessageSquare className="w-4 h-4 text-gray-400 cursor-help"` en la fila — al hacer hover muestra un tooltip nativo HTML `title={abono.notas}` con el texto completo de las notas
- Filas compactas `h-10`
- Ordenadas por `fecha_abono DESC`

### Lógica de fuentes inactivas

- Fuentes con `estado = 'Inactiva'`: se muestran en la lista pero visualmente atenuadas (`opacity-60`) y **sin botón `+ Abono`**
- Fuentes con `saldo_pendiente = 0` (completadas): badge `Completada` en verde en lugar de `Activa`, sin botón `+ Abono`
- Fuentes `Activa` con `saldo_pendiente > 0`: estado normal con botón `+ Abono` si `canCreate`

---

## Arquitectura de Componentes

### `/abonos`

```
src/app/abonos/
├── page.tsx                          → Server Component (permisos)
└── components/
    ├── abonos-list-page.tsx          → Client Component orquestador (REEMPLAZA actual)
    ├── abonos-list-page.styles.ts    → Estilos centralizados (REEMPLAZA actual)
    └── abonos-tabla.tsx              → Componente de tabla (NUEVO)

src/app/abonos/hooks/
└── useAbonosList.ts                  → Hook (ACTUALIZAR: nuevo query con numero_recibo)
```

### `/abonos/[clienteId]`

```
src/app/abonos/[clienteId]/
├── page.tsx                          → Server Component
└── components/
    ├── header-cliente.tsx            → ACTUALIZAR: nuevo layout compacto
    ├── metricas-cards.tsx            → ACTUALIZAR: COP completo + barras de progreso
    ├── fuentes-lista.tsx             → NUEVO: reemplaza FuentePagoCard grid
    └── tabla-abonos-cliente.tsx      → NUEVO: tabla compacta
```

### Utilidades nuevas

```
src/modules/abonos/utils/
└── formato-recibo.ts

// Contenido:
export function formatearNumeroRecibo(numero: number): string {
  return `RYR-${String(numero).padStart(4, '0')}`
}
```

---

## Definición de Éxito

- [ ] La página `/abonos` carga y muestra tabla con columna `# Recibo` en formato `RYR-XXXX`
- [ ] Los valores COP nunca se abrevian (ni en métricas ni en tabla)
- [ ] El color dominante del módulo es emerald/teal (no azul/índigo)
- [ ] Las fuentes de pago en `/abonos/[clienteId]` son filas compactas (no cards infladas)
- [ ] Al registrar un nuevo abono, la BD asigna `numero_recibo` automáticamente vía SERIAL
- [ ] `numero_referencia` queda libre para el número de transacción bancaria real
- [ ] La API route `/api/abonos/registrar` ya no genera el consecutivo manualmente
- [ ] TypeScript sin errores — `npm run type-check` pasa
- [ ] Dark mode funcional en todos los elementos nuevos

---

## Fuera de Alcance

- Modal de registrar abono (`modal-registrar-abono.tsx`) — no se toca en este rediseño
- Permisos y lógica de negocio — no cambian
- Ruta `/abonos/registrar` — no se toca
- Sistema de auditoría — no se toca
- Impresión de comprobante — no en este ciclo
