# Expediente de Renuncia — Página Dedicada con Consecutivo

**Fecha:** 2026-03-25
**Estado:** Revisado
**Módulo:** `src/modules/renuncias/`

---

## 1. Resumen Ejecutivo

Reemplazar el modal de detalle de renuncia por una página dedicada de expediente completo accesible mediante un consecutivo único (`REN-2026-001`). La página presenta toda la historia de la negociación desde su inicio hasta el cierre de la renuncia, con datos humanizados y organizados visualmente en secciones.

---

## 2. Decisiones de Diseño (validadas con usuario)

| Decisión | Resultado |
|---|---|
| Formato consecutivo | `REN-YYYY-NNN` (ej: `REN-2026-001`) |
| Layout | Hero + Timeline (siempre visibles) + Tabs (secciones detalladas) |
| Timeline | Un solo hito "Inicio de negociación" (no redundar con asignación de vivienda) |
| Sección Vivienda | Sin estado actual de la vivienda (expediente es histórico) |
| Documentos | Solo enlaces a docs de la negociación (promesa, cartas, comprobante) |
| Archivado automático de docs | Fuera de alcance — scope separado |
| Modal actual | Se elimina — la card redirige a la página |

---

## 3. Migración de Base de Datos

### 3.1 Nueva columna `consecutivo` en `renuncias`

```sql
ALTER TABLE renuncias ADD COLUMN consecutivo VARCHAR(20) UNIQUE;
```

### 3.2 Función para generar consecutivo (race-safe)

Usa `pg_advisory_xact_lock` para evitar duplicados en inserts concurrentes:

```sql
CREATE OR REPLACE FUNCTION generar_consecutivo_renuncia()
RETURNS TRIGGER AS $$
DECLARE
  v_year TEXT;
  v_seq INT;
  v_consecutivo TEXT;
BEGIN
  v_year := EXTRACT(YEAR FROM NOW())::TEXT;

  -- Lock exclusivo por año para evitar race condition
  PERFORM pg_advisory_xact_lock(hashtext('renuncia_consecutivo_' || v_year));

  SELECT COALESCE(MAX(
    CAST(SUBSTRING(consecutivo FROM 'REN-\d{4}-(\d+)') AS INT)
  ), 0) + 1
  INTO v_seq
  FROM renuncias
  WHERE consecutivo LIKE 'REN-' || v_year || '-%';

  v_consecutivo := 'REN-' || v_year || '-' || LPAD(v_seq::TEXT, 3, '0');
  NEW.consecutivo := v_consecutivo;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 3.3 Trigger BEFORE INSERT

```sql
CREATE TRIGGER trg_generar_consecutivo_renuncia
BEFORE INSERT ON renuncias
FOR EACH ROW
EXECUTE FUNCTION generar_consecutivo_renuncia();
```

### 3.4 Backfill existentes

```sql
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY fecha_creacion ASC, id ASC) AS seq,
         EXTRACT(YEAR FROM fecha_creacion)::TEXT AS yr
  FROM renuncias
  WHERE consecutivo IS NULL
)
UPDATE renuncias r
SET consecutivo = 'REN-' || n.yr || '-' || LPAD(n.seq::TEXT, 3, '0')
FROM numbered n
WHERE r.id = n.id;

-- Hacer NOT NULL después del backfill
ALTER TABLE renuncias ALTER COLUMN consecutivo SET NOT NULL;
```

### 3.5 Actualizar vista `v_renuncias_completas`

Agregar `r.consecutivo` al SELECT de la vista existente.

### 3.6 Nota sobre RPC `registrar_renuncia_completa`

El RPC hace `INSERT INTO renuncias(...)` sin especificar `consecutivo`, por lo que el trigger BEFORE INSERT se ejecutará normalmente y asignará el consecutivo automáticamente. No requiere cambios en el RPC.

---

## 4. Arquitectura de Página

### 4.1 Ruta

```
src/app/renuncias/[consecutivo]/page.tsx    → Server component
src/app/renuncias/[consecutivo]/loading.tsx  → Skeleton loader
```

Se busca por consecutivo (campo UNIQUE), NO por UUID.

### 4.2 Estructura de Módulo

```
src/modules/renuncias/
├── components/
│   ├── expediente/
│   │   ├── ExpedienteRenunciaPage.tsx        # Orquestador (< 100 líneas)
│   │   ├── ExpedienteRenunciaPage.styles.ts  # Estilos centralizados
│   │   ├── ExpedienteHero.tsx                # Sección 1: Hero header
│   │   ├── ExpedienteTimeline.tsx            # Sección 2: Timeline visual
│   │   ├── ExpedienteVivienda.tsx            # Tab: Datos de vivienda
│   │   ├── ExpedienteFinanciero.tsx          # Tab: Resumen financiero
│   │   ├── ExpedienteFuentes.tsx             # Tab: Fuentes de pago al cierre
│   │   ├── ExpedienteAbonos.tsx              # Tab: Historial de abonos
│   │   ├── ExpedienteAuditoria.tsx           # Tab: Registro y auditoría
│   │   └── index.ts                          # Barrel export
│   └── ...
├── hooks/
│   ├── useExpedienteRenuncia.ts              # Hook principal de datos
│   └── ...
├── services/
│   └── renuncias.service.ts                  # Agregar query de expediente
└── types/
    └── index.ts                              # Agregar tipo ExpedienteData
```

### 4.3 Separación de Responsabilidades

| Capa | Responsabilidad | Límite |
|---|---|---|
| `page.tsx` | Server component, fetch params, metadata | < 30 líneas |
| `ExpedienteRenunciaPage.tsx` | Orquestador: hero + timeline + tabs | < 100 líneas |
| `useExpedienteRenuncia.ts` | Fetch de datos, estados de carga, transformaciones | < 200 líneas |
| `renuncias.service.ts` | Queries a Supabase (renuncia + abonos + audit) | Agregar funciones |
| `*.styles.ts` | Todas las clases de Tailwind > 80 chars | Sin límite |
| Cada tab component | Presentación pura de una sección | < 150 líneas c/u |

---

## 5. Diseño Visual — Secciones

### 5.1 Hero Header (siempre visible)

**Fondo**: Gradiente rojo/rosa del módulo renuncias (`from-red-600 via-rose-600 to-pink-600`)
**Contenido**:

```
┌──────────────────────────────────────────────────────────────┐
│  🔙 Volver a Renuncias                                      │
│                                                              │
│  [Badge: REN-2026-001]          [Badge: Pendiente Devolución]│
│                                                              │
│  Cliente: Laura Martínez García                              │
│  CC 1.234.567.890 · 📱 310-555-1234 · ✉ laura@email.com    │
│                                                              │
│  🏠 Vivienda 12 · Manzana B · Proyecto Las Palmas           │
│                                                              │
│  Motivo: "El cliente decidió no continuar por razones        │
│           personales y cambio de ciudad"                     │
│                                                              │
│  ⏱️ Duración total: 87 días (15-ene → 12-abr)              │
└──────────────────────────────────────────────────────────────┘
```

**Datos y sus fuentes**:
- Consecutivo: `renuncias.consecutivo`
- Estado: `renuncias.estado`
- Cliente: `cliente_datos_snapshot` (nombre, documento, teléfono, email)
- Vivienda: `vivienda_datos_snapshot` (numero, manzana, proyecto)
- Motivo: `renuncias.motivo`
- Duración: calculado `negociaciones.fecha_negociacion` → `renuncias.fecha_renuncia`

### 5.2 Timeline (siempre visible, debajo del hero)

Línea horizontal con puntos conectados. Cada hito muestra fecha formateada con `formatDateCompact()`.

```
●─────────────●─────────────●─────────────●─────────────●
Inicio        Primer        Último        Solicitud     Cierre
negociación   abono         abono         de renuncia   (si aplica)
15-ene-2026   22-ene-2026   10-mar-2026   12-abr-2026   15-abr-2026
```

**Hitos**:

| # | Hito | Fuente | Condicional |
|---|------|--------|-------------|
| 1 | Inicio de negociación | `negociaciones.fecha_negociacion` | Siempre |
| 2 | Primer abono | `MIN(abonos_historial.fecha_abono)` | Si hay abonos |
| 3 | Último abono | `MAX(abonos_historial.fecha_abono)` | Si hay > 1 abono |
| 4 | Solicitud de renuncia | `renuncias.fecha_renuncia` | Siempre |
| 5 | Cierre de renuncia | `renuncias.fecha_cierre` | Si estado = Cerrada |
| 6 | sada | `renuncias.fecha_devolucion` | Si requiere_devolucion |

**Diseño**: glassmorphism card, iconos por hito, animación de entrada secuencial con Framer Motion.

### 5.3 Tabs

5 tabs debajo del hero + timeline:

```
[ 🏠 Vivienda ] [ 💰 Financiero ] [ 🏦 Fuentes de Pago ] [ 📋 Abonos ] [ 🔒 Auditoría ]
```

---

#### Tab 1: Vivienda

Datos del snapshot `vivienda_datos_snapshot` + datos adicionales de la vivienda al momento del registro.

| Campo | Label humanizado | Fuente |
|---|---|---|
| numero | Número de vivienda | `vivienda_datos_snapshot.numero` |
| manzana | Manzana | `vivienda_datos_snapshot.manzana` |
| proyecto | Proyecto | `vivienda_datos_snapshot.proyecto` |
| tipo_vivienda | Tipo | Snapshot o join |
| area_construida | Área construida | Snapshot |
| area_lote | Área del lote | Snapshot |
| valor_total | Valor de la vivienda | `vivienda_datos_snapshot.valor_total` |
| es_esquinera | Esquinera | Snapshot |
| matricula_inmobiliaria | Matrícula inmobiliaria | Snapshot |
| linderos | Linderos (N, S, E, O) | Snapshot (si disponible) |

**Diseño**: Grid de 2 columnas, cada campo con label arriba en gris y valor en negrita. Card con glassmorphism.

---

#### Tab 2: Financiero

**Sección A — Resumen principal** (4 cards métricas):

| Métrica | Fuente |
|---|---|
| Valor negociado | `negociacion_datos_snapshot.valor_total` |
| Total abonado | Suma de abonos activos |
| Saldo pendiente | `negociacion_datos_snapshot.saldo_pendiente` |
| Porcentaje pagado | Calculado |

**Sección B — Descuento** (si aplica):
- Tipo descuento: `negociaciones.tipo_descuento`
- Porcentaje: `negociaciones.porcentaje_descuento`
- Motivo: `negociaciones.motivo_descuento`
- Monto: `negociaciones.descuento_aplicado`

**Sección C — Retención y devolución**:
- Total cuota inicial recibida
- Monto retenido + motivo (si aplica)
- **Monto a devolver** (destacado, grande)
- Estado de la devolución

**Sección D — Documentos vinculados** (enlaces):
- Promesa de compraventa (`negociaciones.promesa_compraventa_url`)
- Promesa firmada (`negociaciones.promesa_firmada_url`)
- Comprobante de devolución (`renuncias.comprobante_devolucion_url`)

---

#### Tab 3: Fuentes de Pago

Lista de todas las fuentes que estaban configuradas, con estado al momento del cierre.

Por cada fuente (del `abonos_snapshot`):

| Campo | Label | Formato |
|---|---|---|
| tipo | Tipo de fuente | Badge con color por tipo |
| entidad | Entidad financiera | Texto |
| monto_aprobado | Monto aprobado | Moneda formateada |
| monto_recibido | Monto recibido | Moneda formateada |
| progreso | Progreso | Barra visual porcentual |
| estado | Estado al cierre | Badge "Inactivada" |
| fecha_resolucion | Fecha resolución | `formatDateCompact()` |

**Diseño**: Cards individuales por fuente, barra de progreso visual, badge rojo "Inactivada por renuncia".

---

#### Tab 4: Abonos

**Consulta en vivo** a `abonos_historial` (no snapshot — los abonos reales son la fuente de verdad).

**Tabla/lista** con todos los abonos de la negociación:

| Columna | Campo |
|---|---|
| # Recibo | `numero_recibo` |
| Fecha | `fecha_abono` con `formatDateCompact()` |
| Fuente | Nombre de la fuente de pago |
| Monto | `monto` formateado como moneda |
| Método de pago | `metodo_pago` |
| Referencia | `numero_referencia` |
| Estado | Badge: Activo (verde) / Anulado (rojo) |
| Comprobante | Link al archivo si `comprobante_url` existe |

**Resumen al final**:
- Total de abonos: N
- Abonos activos: X / Anulados: Y
- Período de actividad: fecha primer abono → fecha último abono (N días)
- Monto total activo: $XX.XXX.XXX

**Diseño**: Tabla responsive, filas con hover, badges de color por estado. En móvil se transforma a cards.

---

#### Tab 5: Auditoría

**Sección A — Registro**:
- Registrada por: nombre + rol (de `usuario_registro`)
- Fecha de registro: `fecha_renuncia`
- IP/timestamp del sistema

**Sección B — Cierre** (si aplica):
- Cerrada por: nombre + rol (de `usuario_cierre`)
- Fecha de cierre: `fecha_cierre`
- Método de devolución: `metodo_devolucion`
- Número de comprobante: `numero_comprobante`
- Notas de cierre: `notas_cierre`

**Sección C — Acciones automáticas del sistema**:
Lista de las acciones cascada que ejecutó el RPC:
1. Negociación cerrada → estado "Cerrada por Renuncia"
2. Vivienda liberada → estado "Disponible"
3. Fuentes de pago inactivadas
4. Cliente actualizado → estado "Renunció"

**Diseño**: Timeline vertical con iconos, colores verde/gris según completado.

---

## 6. Flujo de Datos

### 6.1 Service: `obtenerExpedienteRenuncia(consecutivo: string)`

```typescript
async function obtenerExpedienteRenuncia(consecutivo: string) {
  // 1. Renuncia completa (vista con joins)
  const renuncia = await supabase
    .from('v_renuncias_completas')
    .select('*')
    .eq('consecutivo', consecutivo)
    .single()

  // 2. Abonos de la negociación
  const abonos = await supabase
    .from('abonos_historial')
    .select('*, fuente_pago:fuente_pago_id(tipo, entidad)')
    .eq('negociacion_id', renuncia.negociacion_id)
    .order('fecha_abono', { ascending: true })

  // 3. Negociación completa (fechas, descuentos, documentos)
  const negociacion = await supabase
    .from('negociaciones')
    .select('*')
    .eq('id', renuncia.negociacion_id)
    .single()

  return { renuncia, abonos, negociacion }
}
```

### 6.2 Hook: `useExpedienteRenuncia(consecutivo)`

- Llama al service
- Calcula datos derivados (duración, hitos del timeline, totales)
- Maneja estados: `cargando`, `error`, `datos`
- Transforma snapshots JSONB a objetos tipados

### 6.3 Tipos

```typescript
interface ExpedienteData {
  renuncia: RenunciaCompleta      // Vista v_renuncias_completas + consecutivo
  abonos: AbonoHistorial[]        // Todos los abonos de la negociación
  negociacion: NegociacionDetalle // Datos completos de la negociación
  timeline: TimelineHito[]        // Hitos calculados
  resumenFinanciero: ResumenFinanciero // Métricas calculadas
  duracionDias: number            // Días desde inicio hasta renuncia
}

interface TimelineHito {
  label: string
  fecha: string
  icono: LucideIcon
  completado: boolean
}

interface ResumenFinanciero {
  valorNegociado: number
  totalAbonado: number
  saldoPendiente: number
  porcentajePagado: number
  descuento: { tipo: string; porcentaje: number; monto: number; motivo: string } | null
  retencion: { monto: number; motivo: string } | null
  montoADevolver: number
}
```

---

## 7. Cambios en Componentes Existentes

### 7.1 RenunciaCard → Link a página

Cambiar "Ver Detalle" de abrir modal a navegar:

```typescript
// Antes: onClick={() => onVerDetalle(renuncia)}
// Después: <Link href={`/renuncias/${renuncia.consecutivo}`}>
```

### 7.2 Eliminar DetalleRenunciaModal

Ya no se necesita. Eliminar:
- `src/modules/renuncias/components/modals/DetalleRenunciaModal.tsx`
- Referencias en `RenunciasPageMain.tsx`

### 7.3 NegociacionCerradaRenuncia → Link específico

Actualizar el CTA en negociación tab para ir al expediente específico:

```typescript
// Antes: href="/renuncias"
// Después: href={`/renuncias/${renuncia.consecutivo}`}
```

Esto requiere que el empty state reciba el consecutivo. Se obtiene del campo `negociacion.renuncia_consecutivo` o haciendo un query ligero.

### 7.4 Lista de renuncias

En `RenunciaCard`, mostrar el consecutivo como identificador principal en lugar del UUID.

---

## 8. Vista Actualizada de BD

Agregar `consecutivo` a la vista `v_renuncias_completas`:

```sql
CREATE OR REPLACE VIEW v_renuncias_completas AS
SELECT
  r.*,
  r.consecutivo,  -- Nuevo campo
  c.nombres || ' ' || c.apellidos AS cliente_nombre,
  -- ... resto igual
FROM renuncias r
INNER JOIN negociaciones n ON ...
-- ... joins existentes
```

---

## 9. Theming

Colores del módulo renuncias (rojo/rosa):
- Gradiente hero: `from-red-600 via-rose-600 to-pink-600`
- Badges de estado, iconos
- Tabs active state
- Dark mode completo

Se reutiliza `moduleThemes['renuncias']` si existe, o se define como extensión del sistema de theming.

---

## 10. Navegación

```
/renuncias                    → Lista de renuncias (existente)
/renuncias/REN-2026-001       → Expediente dedicado (NUEVO)
```

Botón "Volver a Renuncias" en el hero para regresar a la lista.

---

## 11. Fuera de Alcance

- Archivado automático de documentos al renunciar (scope separado)
- Exportar expediente como PDF (mejora futura)
- Comparativa con promedios de renuncias (mejora futura)
- Acciones de procesamiento de devolución desde la página (se mantiene workflow actual)
