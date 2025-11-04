# 💰 Módulo de Abonos - Plan de Desarrollo

## 📊 Arquitectura del Sistema

### **Cómo funciona actualmente:**
```
negociaciones
  └── fuentes_pago
      ├── monto_aprobado (total acordado)
      ├── monto_recibido (suma de abonos)  ← Se actualiza con cada abono
      ├── saldo_pendiente (calculado automáticamente)
      └── porcentaje_completado (calculado automáticamente)
```

**NO existe tabla `abonos` separada** en el nuevo sistema.
Los abonos se registran **actualizando** `monto_recibido` en `fuentes_pago`.

---

## 🎯 Objetivo del Módulo

Crear una interfaz para que el usuario pueda:

1. ✅ Ver negociaciones activas (estado: 'Activa' o 'Cierre Financiero')
2. ✅ Ver fuentes de pago pendientes de cada negociación
3. ✅ Registrar abonos a una fuente específica
4. ✅ Ver historial de abonos (necesitamos tabla auditoria)
5. ✅ Subir comprobantes de pago
6. ✅ Actualizar automáticamente saldos y porcentajes

---

## 🔧 Componentes a Desarrollar

### **1. Base de Datos - Tabla de Historial**

**Problema**: `fuentes_pago.monto_recibido` es un solo campo. No guarda historial.

**Solución**: Crear tabla `abonos_historial`:

```sql
CREATE TABLE abonos_historial (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relaciones
  negociacion_id UUID REFERENCES negociaciones(id) NOT NULL,
  fuente_pago_id UUID REFERENCES fuentes_pago(id) NOT NULL,

  -- Datos del Abono
  monto DECIMAL(15,2) NOT NULL CHECK (monto > 0),
  fecha_abono TIMESTAMP WITH TIME ZONE NOT NULL,
  metodo_pago VARCHAR(50), -- 'Transferencia' | 'Efectivo' | 'Cheque' | 'Consignación'
  numero_referencia VARCHAR(100), -- Número de transacción

  -- Documentos
  comprobante_url TEXT,

  -- Observaciones
  notas TEXT,

  -- Auditoría
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  usuario_registro UUID REFERENCES auth.users(id)
);

-- Índices
CREATE INDEX idx_abonos_historial_negociacion ON abonos_historial(negociacion_id);
CREATE INDEX idx_abonos_historial_fuente ON abonos_historial(fuente_pago_id);
CREATE INDEX idx_abonos_historial_fecha ON abonos_historial(fecha_abono DESC);

-- Trigger: Actualizar monto_recibido en fuentes_pago cuando se registra un abono
CREATE OR REPLACE FUNCTION actualizar_monto_recibido()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE fuentes_pago
  SET monto_recibido = (
    SELECT COALESCE(SUM(monto), 0)
    FROM abonos_historial
    WHERE fuente_pago_id = NEW.fuente_pago_id
  )
  WHERE id = NEW.fuente_pago_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_monto_recibido
AFTER INSERT ON abonos_historial
FOR EACH ROW
EXECUTE FUNCTION actualizar_monto_recibido();
```

---

### **2. Tipos TypeScript**

```typescript
// src/modules/abonos/types/index.ts

export interface AbonoHistorial {
  id: string
  negociacion_id: string
  fuente_pago_id: string
  monto: number
  fecha_abono: string
  metodo_pago: MetodoPago
  numero_referencia?: string
  comprobante_url?: string
  notas?: string
  fecha_creacion: string
  usuario_registro?: string
}

export type MetodoPago =
  | 'Transferencia'
  | 'Efectivo'
  | 'Cheque'
  | 'Consignación'
  | 'PSE'

export interface CrearAbonoDTO {
  negociacion_id: string
  fuente_pago_id: string
  monto: number
  fecha_abono: string
  metodo_pago: MetodoPago
  numero_referencia?: string
  comprobante_url?: string
  notas?: string
}

export interface NegociacionConAbonos {
  negociacion: Negociacion
  cliente: { id: string; nombre_completo: string }
  vivienda: { id: string; numero: string; proyecto: string }
  fuentes: FuentePagoConAbonos[]
  total_abonado: number
  saldo_pendiente: number
  porcentaje_pagado: number
}

export interface FuentePagoConAbonos extends FuentePago {
  abonos: AbonoHistorial[]
  ultimo_abono?: AbonoHistorial
}
```

---

### **3. Servicios**

```typescript
// src/modules/abonos/services/abonos.service.ts

class AbonosService {
  // Obtener negociaciones activas (pendientes de pago)
  async obtenerNegociacionesActivas(): Promise<NegociacionConAbonos[]>

  // Obtener detalles de una negociación con sus fuentes y abonos
  async obtenerNegociacionConAbonos(negociacionId: string): Promise<NegociacionConAbonos>

  // Registrar un nuevo abono
  async registrarAbono(datos: CrearAbonoDTO): Promise<AbonoHistorial>

  // Obtener historial de abonos de una fuente
  async obtenerHistorialAbonos(fuentePagoId: string): Promise<AbonoHistorial[]>

  // Subir comprobante de pago
  async subirComprobante(file: File, abonoId: string): Promise<string>
}
```

---

### **4. UI Components**

```
src/modules/abonos/
├── components/
│   ├── negociaciones-activas-list.tsx       # Lista de negociaciones activas
│   ├── fuente-pago-card-abonos.tsx          # Card con info de fuente + botón "Registrar abono"
│   ├── modal-registrar-abono.tsx            # Modal para registrar abono
│   ├── historial-abonos-table.tsx           # Tabla con historial de abonos
│   └── comprobante-upload.tsx               # Upload de comprobantes
├── pages/
│   ├── abonos-dashboard.tsx                 # Dashboard principal
│   └── negociacion-abonos-detalle.tsx       # Detalle de una negociación
├── hooks/
│   ├── useAbonos.ts                         # Hook principal
│   ├── useRegistrarAbono.ts                 # Hook para registrar
│   └── useHistorialAbonos.ts                # Hook para historial
├── services/
│   └── abonos.service.ts
└── types/
    └── index.ts
```

---

### **5. Flujo de Usuario**

**Página Principal `/abonos`:**
```
📊 Abonos - Dashboard

[Filtros]
  Estado: [Todas | Solo pendientes | Solo completas]
  Proyecto: [Todos | Las Américas 2]
  Cliente: [Buscar por nombre]

[Lista de Negociaciones]
  📄 Laura Duque - Manzana A Casa 1
      Estado: Cierre Financiero
      Valor Total: $122.000.000
      Abonado: $22.000.000 (18%)
      Pendiente: $100.000.000

      [Ver Detalle] [Registrar Abono]

  📄 Juan Pérez - Manzana B Casa 3
      ...
```

**Página Detalle `/abonos/[negociacionId]`:**
```
📊 Abonos - Laura Duque

[Info General]
  Cliente: Laura Duque (CC 1107548555)
  Vivienda: Manzana A - Casa 1
  Proyecto: Las Américas 2
  Valor Total: $122.000.000

[Fuentes de Pago]

  💰 Cuota Inicial
      Monto Aprobado: $22.000.000
      Abonado: $10.000.000 (45%)
      Pendiente: $12.000.000

      [+ Registrar Abono]

      Historial de Abonos:
      | Fecha       | Monto         | Método        | Referencia  | Comprobante |
      |-------------|---------------|---------------|-------------|-------------|
      | 2025-10-15  | $10.000.000   | Transferencia | TRX-123456  | [Ver]       |

  🏦 Crédito Hipotecario - Bancolombia
      Monto Aprobado: $100.000.000
      Abonado: $0 (0%)
      Pendiente: $100.000.000

      [+ Registrar Abono]

      Sin abonos registrados

[Totales]
  Total Abonado: $10.000.000 (8.2%)
  Saldo Pendiente: $112.000.000
```

**Modal Registrar Abono:**
```
📝 Registrar Abono

Fuente: Cuota Inicial
Saldo Pendiente: $12.000.000

[Formulario]
  Monto: [$________]
  Fecha de Abono: [Selector de fecha]
  Método de Pago: [Transferencia ▾]
  Número de Referencia: [____________]
  Comprobante: [Subir archivo]
  Notas: [________________]

[Cancelar] [Registrar Abono]
```

---

## 📋 Checklist de Desarrollo

### Fase 1: Base de Datos
- [ ] Crear tabla `abonos_historial`
- [ ] Crear trigger para actualizar `monto_recibido`
- [ ] Crear índices
- [ ] Probar trigger con INSERT manual

### Fase 2: Backend
- [ ] Crear tipos TypeScript
- [ ] Crear servicio `abonos.service.ts`
- [ ] Implementar métodos CRUD
- [ ] Implementar upload de comprobantes

### Fase 3: UI
- [ ] Crear dashboard principal
- [ ] Crear lista de negociaciones activas
- [ ] Crear cards de fuentes de pago
- [ ] Crear modal de registro de abono
- [ ] Crear tabla de historial

### Fase 4: Testing
- [ ] Probar registro de abono
- [ ] Verificar actualización automática de montos
- [ ] Probar upload de comprobantes
- [ ] Verificar cálculos de porcentajes

### Fase 5: Permisos
- [ ] Configurar RLS en `abonos_historial`
- [ ] Solo usuarios autenticados pueden registrar
- [ ] Bucket para comprobantes

---

## 🚀 Siguiente Paso

¿Quieres que empiece con:
1. ✅ **Crear la migración SQL** para la tabla `abonos_historial`?
2. ⏭️ **Crear los tipos TypeScript** primero?
3. ⏭️ **Crear el servicio** completo?

Recomiend partir con la migración SQL para tener la base de datos lista.
