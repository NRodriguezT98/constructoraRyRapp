# 🔒 Sistema de Seed de Tipos de Fuentes de Pago con IDs Fijos

## 🎯 Propósito

Sistema de "1-click" para crear/actualizar las **4 fuentes de pago oficiales** de la constructora con **IDs fijos preservados** para mantener integridad referencial.

---

## ⚠️ ¿Por Qué IDs Fijos?

### Problema
La aplicación tiene múltiples referencias a tipos de fuentes de pago:
- ✅ Requisitos configurados (`requisitos_fuentes_pago_config.tipo_fuente`)
- ✅ Instancias de fuentes de clientes (`fuentes_pago.tipo`)
- ✅ Lógica de negocio hardcodeada (validaciones, iconos, comportamientos)
- ✅ Metadata de documentos pendientes

### Solución
**Usar IDs fijos (UUIDs inmutables)** en el catálogo `tipos_fuentes_pago`:

```
25336a87-035e-47ac-a382-335af02219cf → Cuota Inicial
e635231f-6f71-4180-8e79-e50e1a82ef7d → Crédito Hipotecario
6a58205b-7297-4fd8-a0ae-b899b8a2c2ce → Subsidio Mi Casa Ya
2a21e525-2731-4270-8668-4d64359eeeb6 → Subsidio Caja Compensación
```

**Ventajas:**
- ✅ Reinstalar BD sin romper referencias
- ✅ Migrar entre ambientes (dev → prod)
- ✅ Backups/restores seguros
- ✅ Testing con datos consistentes
- ✅ No depender de auto-increment

---

## 📊 Catálogo Oficial

### 1. Cuota Inicial (`25336a87-035e-47ac-a382-335af02219cf`)
```json
{
  "nombre": "Cuota Inicial",
  "codigo": "cuota_inicial",
  "es_subsidio": false,
  "metadata": {
    "permite_multiples_abonos": true,
    "requiere_entidad": false,
    "requiere_carta_aprobacion": false
  }
}
```

### 2. Crédito Hipotecario (`e635231f-6f71-4180-8e79-e50e1a82ef7d`)
```json
{
  "nombre": "Crédito Hipotecario",
  "codigo": "credito_hipotecario",
  "es_subsidio": false,
  "metadata": {
    "permite_multiples_abonos": false,
    "requiere_entidad": true,
    "requiere_carta_aprobacion": true,
    "requiere_numero_referencia": true
  }
}
```

### 3. Subsidio Mi Casa Ya (`6a58205b-7297-4fd8-a0ae-b899b8a2c2ce`)
```json
{
  "nombre": "Subsidio Mi Casa Ya",
  "codigo": "subsidio_mi_casa_ya",
  "es_subsidio": true,
  "metadata": {
    "permite_multiples_abonos": false,
    "requiere_entidad": false,
    "requiere_carta_aprobacion": true
  }
}
```

### 4. Subsidio Caja Compensación (`2a21e525-2731-4270-8668-4d64359eeeb6`)
```json
{
  "nombre": "Subsidio Caja Compensación",
  "codigo": "subsidio_caja_compensacion",
  "es_subsidio": true,
  "metadata": {
    "permite_multiples_abonos": false,
    "requiere_entidad": true,
    "requiere_carta_aprobacion": true,
    "entidades_validas": ["Comfenalco", "Comfandi"]
  }
}
```

---

## 🚀 Uso

### Interfaz Web (Recomendado)

1. **Ir al panel de admin:**
   ```
   http://localhost:3000/admin/tipos-fuentes-pago
   ```

2. **Verificar estado actual:**
   - Click en botón "Verificar"
   - Muestra cuántas fuentes existen

3. **Ejecutar seed:**
   - Click en botón "Ejecutar Seed"
   - Crea/actualiza las 4 fuentes
   - Preserva IDs existentes (UPSERT)

**Ventajas:**
- ✅ Interfaz visual intuitiva
- ✅ Feedback inmediato con íconos
- ✅ Lista de fuentes creadas/actualizadas
- ✅ Solo para admins (protegido)

---

### SQL Manual (Alternativa)

```bash
node ejecutar-sql.js supabase/seeds/tipos-fuentes-pago-oficiales.sql
```

**Ventajas:**
- ✅ Útil para scripts de migración
- ✅ CI/CD automation
- ✅ Backups programados

---

## 🔍 Verificación

### Consultar fuentes actuales
```sql
SELECT id, nombre, codigo, es_subsidio, orden
FROM tipos_fuentes_pago
ORDER BY orden;
```

### Verificar IDs correctos
```sql
SELECT
  CASE
    WHEN id = '25336a87-035e-47ac-a382-335af02219cf' THEN '✅'
    ELSE '❌'
  END as correcto,
  nombre
FROM tipos_fuentes_pago
WHERE codigo = 'cuota_inicial';
```

---

## 🛡️ Seguridad

### Upsert (No destructivo)
```sql
INSERT INTO tipos_fuentes_pago (...) VALUES (...)
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  ...;
```

**Comportamiento:**
- Si ID existe → Actualiza datos (preserva relaciones)
- Si ID NO existe → Crea nuevo
- **NUNCA elimina** registros existentes
- **NUNCA rompe** foreign keys

### Permisos
- ✅ Solo usuarios con `rol = 'admin'`
- ✅ Verificación en API route
- ✅ RLS policies en Supabase

---

## 📁 Archivos Creados

```
# Backend SQL
supabase/seeds/tipos-fuentes-pago-oficiales.sql

# Frontend Admin
src/app/admin/tipos-fuentes-pago/
├── page.tsx                            # Server component con auth
└── tipos-fuentes-pago-content.tsx      # Client component con UI

# Componente Card
src/modules/admin/components/TiposFuentesPagoCard.tsx

# API Route
src/app/api/admin/seed-tipos-fuentes-pago/route.ts

# Admin Panel
src/app/admin/admin-content.tsx         # Agregado link en grid
```

---

## ✅ Checklist de Implementación

- [x] Script SQL con IDs fijos (`tipos-fuentes-pago-oficiales.sql`)
- [x] API route con validación admin (`/api/admin/seed-tipos-fuentes-pago`)
- [x] Componente card con verificar/ejecutar (`TiposFuentesPagoCard`)
- [x] Página admin con layout (`/admin/tipos-fuentes-pago`)
- [x] Link en panel principal (`admin-content.tsx`)
- [x] Metadata y descripciones completas
- [x] Upsert para preservar IDs
- [x] Validación de permisos (solo admin)
- [x] UI con feedback visual (success/error)
- [x] Lista de fuentes creadas/actualizadas
- [x] Documentación completa

---

## 🎨 UI/UX

### Estados del Componente
1. **Idle**: Botones "Verificar" y "Ejecutar Seed"
2. **Loading**: Spinner animado, botones disabled
3. **Success**: Badge verde, lista de fuentes
4. **Error**: Badge rojo, mensaje descriptivo
5. **Info**: Badge amarillo, fuentes faltantes

### Iconos
- 💰 Cuota Inicial
- 🏦 Crédito Hipotecario
- 🎁 Subsidio Mi Casa Ya
- 🎁 Subsidio Caja Compensación

---

## 🔄 Flujo Completo

```mermaid
graph TD
    A[Usuario Admin] -->|Click| B[/admin/tipos-fuentes-pago]
    B --> C{Verificar}
    C -->|Faltan fuentes| D[Mostrar faltantes]
    C -->|Todas existen| E[✅ Todo OK]
    D -->|Click Seed| F[API: POST /seed-tipos-fuentes-pago]
    F --> G[Upsert con IDs fijos]
    G --> H[✅ Fuentes creadas/actualizadas]
    H --> I[Mostrar lista con metadata]
```

---

## 🧪 Testing

### Escenario 1: BD vacía
```sql
DELETE FROM tipos_fuentes_pago; -- ⚠️ Solo en dev
```
**Resultado esperado**: Seed crea 4 fuentes con IDs correctos

### Escenario 2: Algunas fuentes existen
```sql
DELETE FROM tipos_fuentes_pago
WHERE codigo = 'cuota_inicial';
```
**Resultado esperado**: Seed crea solo la faltante

### Escenario 3: Todas existen pero con datos desactualizados
```sql
UPDATE tipos_fuentes_pago
SET descripcion = 'Descripción vieja'
WHERE codigo = 'credito_hipotecario';
```
**Resultado esperado**: Seed actualiza descripción sin cambiar ID

---

## 🚨 Errores Comunes

### Error: "duplicate key value violates unique constraint"
**Causa**: ID ya existe en BD
**Solución**: Seed usa UPSERT, no debería ocurrir

### Error: "No autorizado"
**Causa**: Usuario no es admin
**Solución**: Verificar rol en tabla `usuarios`

### Error: "column does not exist"
**Causa**: Schema desactualizado
**Solución**: Ejecutar migración de `tipos_fuentes_pago`

---

## 📝 Mantenimiento

### Agregar nueva fuente (raro)
1. Generar UUID fijo:
   ```sql
   SELECT gen_random_uuid();
   ```
2. Agregar a `FUENTES_OFICIALES` en API route
3. Agregar a `tipos-fuentes-pago-oficiales.sql`
4. Ejecutar seed
5. Actualizar lógica de negocio que use nombres hardcodeados

### Cambiar nombre de fuente
1. Actualizar solo en seed SQL
2. Ejecutar seed (UPSERT actualiza)
3. **NO cambiar ID** (rompe relaciones)

---

**Documentación**: `docs/SEED-TIPOS-FUENTES-PAGO-IDS-FIJOS.md` ⭐
**Referencia**: Similar a `categorias-sistema` pero con IDs inmutables
