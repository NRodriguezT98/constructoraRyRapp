# 🎯 REFACTORIZACIÓN: Intereses vs Negociaciones

## 🤔 Problema Identificado

**Pregunta del usuario**:
> "¿Por qué esto está contando como una negociación? Si solo es un interés que comunica el cliente. Además, ¿debería listarse junto con los demás intereses del cliente, no? Como en el historial de intereses que ha tenido, siendo el primero siempre el más reciente."

---

## ❌ DISEÑO ACTUAL (Incorrecto)

### Flujo Actual
```
Cliente expresa interés
    ↓
Se crea NEGOCIACIÓN directamente
    ↓
Estado: "En Proceso"
    ↓
❌ Problema: Mezcla conceptos diferentes
```

### Consecuencias
- ❌ **Confuso**: Un "interés" NO es una "negociación formal"
- ❌ **Sin historial**: No hay registro de intereses descartados
- ❌ **Sin seguimiento**: No se puede hacer seguimiento de prospectos
- ❌ **Métricas incorrectas**: Las estadísticas están infladas

---

## ✅ NUEVO DISEÑO (Correcto)

### Arquitectura Propuesta

```
┌─────────────────────────────────────────────────────┐
│                  INTERESES                          │
│  (Tabla: intereses_clientes)                        │
│                                                     │
│  • Cliente pregunta por vivienda                   │
│  • Se registra como "Pendiente"                    │
│  • Estados: Pendiente → Contactado →              │
│    En Seguimiento → Negociación/Descartado        │
│                                                     │
│  Campos importantes:                               │
│  - origen (WhatsApp, Llamada, etc.)               │
│  - prioridad (Alta, Media, Baja)                  │
│  - proximo_seguimiento (fecha)                    │
│  - notas (observaciones del vendedor)             │
└─────────────────────────────────────────────────────┘
                        ↓
              (Cuando se FORMALIZA)
                        ↓
┌─────────────────────────────────────────────────────┐
│                 NEGOCIACIONES                       │
│  (Tabla: negociaciones)                             │
│                                                     │
│  • Negociación formal                              │
│  • Con valores acordados                           │
│  • Estados: En Proceso → Cierre Financiero →      │
│    Activa → Completada                             │
│                                                     │
│  Campos importantes:                               │
│  - valor_negociado (monto acordado)               │
│  - descuento_aplicado                              │
│  - abonos y pagos                                  │
│  - documentos legales                              │
└─────────────────────────────────────────────────────┘
```

---

## 📊 Comparación de Conceptos

| Aspecto | **INTERÉS** | **NEGOCIACIÓN** |
|---------|-------------|-----------------|
| **Definición** | Cliente pregunta/consulta | Acuerdo formal |
| **Compromiso** | Bajo | Alto |
| **Documentación** | Notas simples | Contratos, escrituras |
| **Seguimiento** | Llamadas, recordatorios | Proceso legal formal |
| **Resultado** | Puede descartarse fácilmente | Rara vez se cancela |
| **Estados** | Pendiente, Contactado, En Seguimiento, Descartado | En Proceso, Cierre Financiero, Activa, Completada |
| **Valor** | Estimado (pregunta) | Negociado (acordado) |

---

## 🗂️ Nueva Tabla: `intereses_clientes`

### Campos Principales

```sql
CREATE TABLE intereses_clientes (
  id UUID PRIMARY KEY,
  cliente_id UUID REFERENCES clientes(id),
  vivienda_id UUID REFERENCES viviendas(id),
  proyecto_id UUID REFERENCES proyectos(id),

  -- Estado del interés
  estado VARCHAR(30) CHECK (estado IN (
    'Pendiente',        -- Recién expresado
    'Contactado',       -- Ya se habló con el cliente
    'En Seguimiento',   -- Proceso de seguimiento activo
    'Negociación',      -- SE CONVIRTIÓ en negociación formal
    'Descartado',       -- Cliente ya no interesado
    'Perdido'           -- No se logró contactar
  )),

  -- Información
  valor_estimado DECIMAL(15,2),  -- Lo que el cliente preguntó
  notas TEXT,
  origen VARCHAR(50),             -- ¿Cómo llegó? (WhatsApp, Llamada, etc.)
  prioridad VARCHAR(20),          -- Alta, Media, Baja

  -- Seguimiento
  fecha_ultimo_contacto TIMESTAMP,
  proximo_seguimiento TIMESTAMP,

  -- Conversión
  negociacion_id UUID,            -- Si se convirtió
  fecha_conversion TIMESTAMP,

  -- Auditoría
  fecha_creacion TIMESTAMP,
  fecha_actualizacion TIMESTAMP
);
```

---

## 🔄 Flujo de Trabajo Nuevo

### 1️⃣ Registro de Interés
```
Cliente: "Me interesa la casa 5 de la Manzana B"
    ↓
Vendedor: Registra en intereses_clientes
    - Cliente: Juan Pérez
    - Vivienda: Casa 5, Manzana B
    - Valor estimado: $120,000,000
    - Origen: WhatsApp
    - Prioridad: Alta
    - Estado: Pendiente
```

### 2️⃣ Seguimiento
```
Vendedor: Llama al cliente
    ↓
Actualiza: estado = "Contactado"
    ↓
Agenda: proximo_seguimiento = mañana 10am
```

### 3️⃣ Conversión a Negociación (si se formaliza)
```
Cliente decide comprar
    ↓
Función: convertir_interes_a_negociacion()
    ↓
Crea registro en negociaciones
    ↓
Actualiza interés: estado = "Negociación"
```

### 4️⃣ O Descarte (si no prospera)
```
Cliente: "Ya no me interesa"
    ↓
Actualiza: estado = "Descartado"
    ↓
Queda en historial (para estadísticas)
```

---

## 📈 Ventajas del Nuevo Diseño

### ✅ Historial Completo
```sql
-- Ver todos los intereses de un cliente
SELECT * FROM intereses_clientes
WHERE cliente_id = '...'
ORDER BY fecha_creacion DESC;

-- Resultado:
-- 2025-10-18: Casa 5, Manzana B → Negociación ✅
-- 2025-10-10: Casa 3, Manzana A → Descartado ❌
-- 2025-09-25: Casa 7, Manzana C → Perdido ❌
```

### ✅ Métricas Reales
```sql
-- Tasa de conversión
SELECT
  COUNT(*) FILTER (WHERE estado = 'Negociación') as convertidos,
  COUNT(*) as total_intereses,
  ROUND(100.0 * COUNT(*) FILTER (WHERE estado = 'Negociación') / COUNT(*), 2) as tasa_conversion
FROM intereses_clientes;

-- Resultado:
-- convertidos: 5
-- total_intereses: 20
-- tasa_conversion: 25.00%
```

### ✅ Seguimiento Automático
```sql
-- Intereses que requieren seguimiento HOY
SELECT * FROM intereses_clientes
WHERE proximo_seguimiento::date = CURRENT_DATE
  AND estado IN ('Pendiente', 'Contactado', 'En Seguimiento')
ORDER BY prioridad DESC;
```

---

## 🛠️ Implementación

### Paso 1: Ejecutar SQL
```bash
Archivo: supabase/crear-tabla-intereses.sql
Acción: Dashboard → SQL Editor → Run
```

### Paso 2: Crear Servicio
```typescript
// src/modules/clientes/services/intereses.service.ts
export class InteresesService {
  static async registrarInteres(data: CrearInteresDTO) { ... }
  static async obtenerInteresesCliente(clienteId: string) { ... }
  static async actualizarEstado(interesId: string, nuevoEstado) { ... }
  static async convertirANegociacion(interesId: string, valorNegociado) { ... }
}
```

### Paso 3: Actualizar Modal
```typescript
// Modal: "Registrar Nuevo Interés"
// - Guarda en intereses_clientes (NO en negociaciones)
// - Estado inicial: "Pendiente"
// - Permite agregar origen y prioridad
```

### Paso 4: Nueva Vista en Detalle Cliente
```tsx
<Tabs>
  <Tab value="info">Información General</Tab>
  <Tab value="intereses">Historial de Intereses ← NUEVO</Tab>
  <Tab value="negociaciones">Negociaciones Activas</Tab>
  <Tab value="documentos">Documentos</Tab>
</Tabs>
```

---

## 📋 Plan de Migración

### Opción A: Datos Nuevos (Recomendado)
```
✅ Crear tabla intereses_clientes
✅ Nuevos registros van a intereses
❌ Mantener negociaciones existentes sin tocar
```

### Opción B: Migración Completa
```sql
-- Migrar negociaciones con estado "En Proceso" a intereses
INSERT INTO intereses_clientes (
  cliente_id,
  vivienda_id,
  proyecto_id,
  estado,
  valor_estimado,
  notas,
  fecha_creacion
)
SELECT
  cliente_id,
  vivienda_id,
  (SELECT proyecto_id FROM viviendas v
   INNER JOIN manzanas m ON v.manzana_id = m.id
   WHERE v.id = n.vivienda_id),
  'Negociación',  -- Ya son negociaciones formales
  valor_negociado,
  notas,
  fecha_creacion
FROM negociaciones n
WHERE estado = 'En Proceso';
```

---

## 🎯 Resultado Final

### Interface del Cliente

#### Tab "Historial de Intereses"
```
┌─────────────────────────────────────────────────────┐
│ Historial de Intereses                              │
├─────────────────────────────────────────────────────┤
│ [+ Registrar Nuevo Interés]                         │
│                                                     │
│ 📅 18 Oct 2025 - Casa 5, Manzana B                 │
│    Estado: Negociación ✅                           │
│    Valor: $122,000,000                             │
│    Origen: WhatsApp                                │
│    ────────────────────────────────────────        │
│                                                     │
│ 📅 10 Oct 2025 - Casa 3, Manzana A                 │
│    Estado: Descartado ❌                            │
│    Valor: $115,000,000                             │
│    Motivo: "Precio muy alto"                       │
│    ────────────────────────────────────────        │
│                                                     │
│ 📅 25 Sep 2025 - Casa 7, Manzana C                 │
│    Estado: Perdido 💤                               │
│    Valor: $130,000,000                             │
│    Origen: Llamada telefónica                      │
└─────────────────────────────────────────────────────┘
```

---

## ✅ Próximos Pasos

1. **Ejecutar SQL**: `crear-tabla-intereses.sql`
2. **Crear servicio**: `intereses.service.ts`
3. **Actualizar modal**: Guardar en `intereses_clientes`
4. **Nueva tab**: "Historial de Intereses" en detalle de cliente
5. **Dashboard**: Agregar métricas de conversión

---

## 📚 Archivos Creados

- ✅ `supabase/crear-tabla-intereses.sql` - Schema completo
- ✅ `REFACTORIZACION-INTERESES-VS-NEGOCIACIONES.md` - Este documento

---

**¿Procedemos con la implementación?** 🚀
