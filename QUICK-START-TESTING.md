# ⚡ QUICK START - Detalle de Cliente con Intereses

## 🚀 Iniciar Testing AHORA

### Paso 1: Iniciar App
```powershell
npm run dev
```

### Paso 2: Verificar Vista en Supabase

**Dashboard**: https://supabase.com/dashboard/project/swyjhwgvkfcfdtemkyad

**SQL Editor**:
```sql
-- Verificar que existe la vista
SELECT * FROM intereses_completos LIMIT 1;
```

**Si NO existe** (error: relation does not exist):
1. SQL Editor → New Query
2. Copiar TODO: `d:\constructoraRyRapp\supabase\cliente-intereses-schema.sql`
3. Run
4. Verificar: `SELECT * FROM intereses_completos LIMIT 1;`

### Paso 3: Probar en Navegador

```
1. http://localhost:3000/clientes
2. Click "Nuevo Cliente"
3. Llenar:
   - Nombres: "Juan"
   - Apellidos: "Pérez"
   - Tipo Doc: CC
   - Número: "123456789"
   - Teléfono: "300123456"
4. STEP 2 → Seleccionar proyecto
5. Guardar
6. Abrir detalle
```

**Verificar**:
- ✅ Sección "💜 Intereses Registrados" aparece
- ✅ Card muestra proyecto seleccionado
- ✅ Estado: "Interés Vigente" (verde)
- ✅ Fecha: "Registrado hace unos segundos"

---

## 📋 Casos de Prueba Rápidos

### Caso 1: Cliente SIN Interés
```
1. Crear cliente
2. NO seleccionar proyecto
3. Guardar
4. Abrir detalle
```
**Esperado**: Sección de intereses NO aparece ✅

### Caso 2: Cliente CON Vivienda Específica
```
1. Crear cliente
2. Seleccionar proyecto
3. Seleccionar manzana
4. Seleccionar vivienda
5. Notas: "Interesado en esta casa"
6. Guardar
7. Abrir detalle
```
**Esperado**:
- ✅ Badge "🏡 Manzana X - Casa Y" aparece
- ✅ Notas se muestran

### Caso 3: Múltiples Intereses (Manual)

**En Supabase SQL Editor**:
```sql
-- 1. Obtener IDs
SELECT id, nombre FROM proyectos LIMIT 3;
SELECT id FROM clientes WHERE numero_documento = '123456789';

-- 2. Insertar más intereses
INSERT INTO cliente_intereses (cliente_id, proyecto_id, notas, estado)
VALUES
  ('uuid-cliente', 'uuid-proyecto-2', 'Segundo proyecto', 'Activo'),
  ('uuid-cliente', 'uuid-proyecto-3', 'Ya no interesa', 'Descartado');
```

**En navegador**:
```
1. Refrescar detalle del cliente
2. Verificar: Badge muestra "3"
3. Verificar: 3 cards aparecen
4. Verificar: Estados con colores (verde, gris)
```

### Caso 4: Estadísticas

**En Supabase** (crear negociación):
```sql
-- Obtener vivienda ID
SELECT id FROM viviendas LIMIT 1;

-- Crear negociación
INSERT INTO negociaciones (
  cliente_id,
  vivienda_id,
  estado,
  valor_negociado,
  descuento_aplicado,
  fecha_negociacion
) VALUES (
  'uuid-cliente',
  'uuid-vivienda',
  'Activa',
  150000000,
  5000000,
  NOW()
);
```

**En navegador**:
```
1. Refrescar detalle
2. Verificar sección "📊 Estadísticas Comerciales"
3. Números esperados:
   - Total: 1
   - Activas: 1
   - Completadas: 0
```

### Caso 5: Documento de Identidad

**En Supabase**:
```sql
UPDATE clientes
SET documento_identidad_url = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
WHERE numero_documento = '123456789';
```

**En navegador**:
```
1. Refrescar detalle
2. Buscar en "Información Personal"
3. Debe aparecer botón azul "📄 Documento de Identidad"
4. Click → Abre en nueva pestaña
```

---

## 🐛 Troubleshooting Rápido

### "No aparece la sección de intereses"

**Check 1: Consola del navegador**
```javascript
// F12 → Console
const cliente = ... // objeto del detalle
console.log('Intereses:', cliente.intereses)
console.log('Cantidad:', cliente.intereses?.length)
```

**Check 2: Network tab**
```
F12 → Network → Fetch/XHR
Refrescar detalle
Ver request a Supabase
Ver response JSON
Buscar campo "intereses"
```

**Check 3: BD**
```sql
SELECT * FROM intereses_completos
WHERE cliente_id = 'uuid-del-cliente';
```

### "Error: relation 'intereses_completos' does not exist"

**Solución**:
```sql
-- Ejecutar TODO el archivo:
-- d:\constructoraRyRapp\supabase\cliente-intereses-schema.sql
-- en Supabase SQL Editor
```

### "Estadísticas muestran 0 pero hay negociaciones"

**Check**:
```sql
SELECT id, estado, fecha_negociacion
FROM negociaciones
WHERE cliente_id = 'uuid-del-cliente';
```

### "TypeScript errors"

**Solución**:
```powershell
# Regenerar tipos
npx supabase gen types typescript --project-id swyjhwgvkfcfdtemkyad > src/lib/supabase/database.types.ts
```

---

## 🎨 Visual Reference

### Estructura Esperada del Detalle

```
┌─────────────────────────────────────┐
│  👤 Juan Pérez                      │
│  CC - 123456789              [Badge]│
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 👤 Información Personal             │
│  Nombres: Juan                      │
│  Apellidos: Pérez                   │
│  ...                                │
│ ┌─────────────────────────────────┐ │
│ │ 📄 Documento de Identidad    👁 │ │ ← NUEVO (condicional)
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 📞 Información de Contacto          │
│  ...                                │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 💜 Intereses Registrados        [1] │ ← NUEVO (condicional)
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ 🏢 Urbanización Los Robles      │ │
│ │    📍 Carrera 15 #23-45         │ │
│ │ 🏡 Manzana A - Casa 5           │ │
│ │ 💬 "Interesado en casa..."      │ │
│ │ 🕐 hace 5 segundos  [Vigente ✓] │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 📊 Estadísticas Comerciales         │ ← NUEVO
├─────────────────────────────────────┤
│  ┌──────┐  ┌──────┐  ┌──────┐      │
│  │  1   │  │  1   │  │  0   │      │
│  │ Total│  │Activas│  │Comp.│      │
│  └──────┘  └──────┘  └──────┘      │
│  🕐 Última: hace 10 minutos         │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 💬 Información Adicional            │
│  ...                                │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 📅 Metadatos                        │
│  ...                                │
└─────────────────────────────────────┘
```

---

## 📚 Documentos de Referencia

| Documento | Propósito | Ubicación |
|-----------|-----------|-----------|
| **Audit Inicial** | Análisis de campos faltantes | `docs/AUDITORIA-DETALLE-CLIENTE.md` |
| **Implementación UI** | Detalles del componente | `DETALLE-CLIENTE-COMPLETO.md` |
| **Implementación Servicio** | Lógica de backend | `SERVICIO-INTERESES-COMPLETO.md` |
| **Guía de Testing** | Casos de prueba completos | `TESTING-DETALLE-CLIENTE.md` |
| **Resumen Ejecutivo** | Overview de toda la sesión | `RESUMEN-SESION-DETALLE-CLIENTE.md` |
| **Este Quick Start** | Inicio rápido | Este archivo |

---

## ⚡ Comandos Útiles

### Supabase
```sql
-- Ver intereses de todos los clientes
SELECT * FROM intereses_completos ORDER BY fecha_interes DESC;

-- Ver intereses de un cliente
SELECT * FROM intereses_completos WHERE cliente_id = 'uuid';

-- Contar intereses por estado
SELECT estado_interes, COUNT(*)
FROM intereses_completos
GROUP BY estado_interes;

-- Ver clientes con más intereses
SELECT cliente_nombre, COUNT(*) as total_intereses
FROM intereses_completos
GROUP BY cliente_id, cliente_nombre
ORDER BY total_intereses DESC;
```

### Terminal
```powershell
# Iniciar app
npm run dev

# Regenerar tipos TypeScript de Supabase
npx supabase gen types typescript --project-id swyjhwgvkfcfdtemkyad > src/lib/supabase/database.types.ts

# Ver errores TypeScript
npx tsc --noEmit
```

---

## ✅ Checklist Mínimo

Antes de marcar como completo, verificar:

- [ ] App corriendo sin errores (`npm run dev`)
- [ ] Vista `intereses_completos` existe en Supabase
- [ ] Cliente con interés creado
- [ ] Detalle del cliente muestra sección de intereses
- [ ] Card de interés muestra todos los datos
- [ ] Estado con color correcto (Activo = verde)
- [ ] Fecha relativa funciona ("hace X tiempo")
- [ ] Sección de estadísticas aparece (aunque sea con 0s)
- [ ] Dark mode funciona (probar)
- [ ] Responsive funciona (F12 → Toggle device toolbar)

---

## 🎯 Siguientes Pasos

Después de verificar que todo funciona:

1. **Marcar todos los tests** en `TESTING-DETALLE-CLIENTE.md`
2. **Tomar screenshots** de cada sección
3. **Documentar bugs** si los hay
4. **Aplicar patrón similar** a otros módulos (Proyectos, Viviendas)

---

**Fecha**: 2025-10-17
**Status**: ⚡ **READY TO TEST**
**Tiempo estimado**: 15-20 minutos
