# 🧪 GUÍA DE TESTING - DETALLE DE CLIENTE CON INTERESES

## 🎯 Objetivo

Verificar que las 3 nuevas secciones del detalle de cliente funcionen correctamente:
1. ✅ Intereses Registrados
2. ✅ Estadísticas Comerciales
3. ✅ Documento de Identidad

---

## 📋 Pre-requisitos

### 1. Verificar que la vista `intereses_completos` existe en Supabase

**Opción A: Desde Supabase Dashboard**
```
1. Ir a: https://supabase.com/dashboard/project/swyjhwgvkfcfdtemkyad
2. Table Editor → Views (arriba a la derecha)
3. Buscar "intereses_completos"
```

**Opción B: Ejecutar query de verificación**
```sql
-- En SQL Editor de Supabase
SELECT * FROM intereses_completos LIMIT 1;
```

**Si NO existe la vista**, ejecutar el script completo:
```
1. Ir a SQL Editor
2. New Query
3. Copiar TODO el contenido de:
   d:\constructoraRyRapp\supabase\cliente-intereses-schema.sql
4. Run
5. Verificar: SELECT * FROM intereses_completos LIMIT 1;
```

### 2. Iniciar la aplicación

```powershell
# En terminal
npm run dev
```

---

## 🧪 CASO DE PRUEBA 1: Cliente NUEVO (sin datos)

### Objetivo
Verificar que las secciones NO aparezcan cuando no hay datos.

### Pasos
1. Ir a `/clientes`
2. Crear nuevo cliente (botón "Nuevo Cliente")
3. Llenar solo campos obligatorios:
   - Nombres: "Juan"
   - Apellidos: "Pérez"
   - Tipo Doc: CC
   - Número: "123456789"
   - Teléfono: "300123456"
4. NO seleccionar proyecto (dejar sin interés)
5. Guardar
6. Abrir detalle del cliente recién creado

### Resultado Esperado
- ✅ Sección "Información Personal" aparece
- ✅ Sección "Información de Contacto" aparece
- ❌ Sección "Intereses Registrados" NO aparece (no hay intereses)
- ✅ Sección "Estadísticas Comerciales" aparece con 0s
- ❌ Botón "Documento de Identidad" NO aparece (no hay URL)
- ✅ Sección "Metadatos" aparece

### Screenshot Esperado
```
┌─────────────────────────────────────┐
│  👤 Juan Pérez                      │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ 👤 Información Personal             │
│  Nombres: Juan                      │
│  ...                                │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ 📞 Información de Contacto          │
│  Teléfono: 300123456                │
│  ...                                │
└─────────────────────────────────────┘
[NO APARECE SECCIÓN DE INTERESES]
┌─────────────────────────────────────┐
│ 📊 Estadísticas Comerciales         │
│  ┌───┐  ┌───┐  ┌───┐               │
│  │ 0 │  │ 0 │  │ 0 │               │
│  └───┘  └───┘  └───┘               │
└─────────────────────────────────────┘
[NO APARECE BOTÓN DOCUMENTO]
```

---

## 🧪 CASO DE PRUEBA 2: Cliente CON INTERÉS (desde formulario)

### Objetivo
Verificar que el interés se registre automáticamente al crear cliente con proyecto seleccionado.

### Pasos
1. Ir a `/clientes`
2. Click "Nuevo Cliente"
3. Llenar datos:
   - Nombres: "María"
   - Apellidos: "García"
   - Tipo Doc: CC
   - Número: "987654321"
   - Teléfono: "310987654"
4. **Ir a STEP 2** (Proyecto de Interés)
5. **Seleccionar un proyecto** del dropdown
6. (Opcional) Seleccionar manzana y vivienda
7. Agregar notas: "Interesada en casa esquinera"
8. Guardar
9. Abrir detalle del cliente recién creado

### Resultado Esperado
- ✅ Sección "Intereses Registrados" **SÍ aparece**
- ✅ Badge contador muestra "1"
- ✅ Card del interés muestra:
  - 🏢 Nombre del proyecto
  - 📍 Ubicación (si tiene)
  - 🏡 "Manzana X - Casa Y" (si seleccionó vivienda)
  - 💬 Notas: "Interesada en casa esquinera"
  - ✅ Estado: "Interés Vigente" (verde)
  - 🕐 "Registrado hace unos segundos"

### Screenshot Esperado
```
┌─────────────────────────────────────┐
│ 💜 Intereses Registrados        [1] │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ 🏢 Urbanización Los Robles      │ │
│ │    📍 Carrera 15 #23-45         │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ 🏡 Manzana A - Casa 5       │ │ │
│ │ └─────────────────────────────┘ │ │
│ │ 💬 Interesada en casa esquinera │ │
│ │ 🕐 Registrado hace 5 segundos   │ │
│ │                  [Interés Vigente]│
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## 🧪 CASO DE PRUEBA 3: Cliente CON MÚLTIPLES INTERESES

### Objetivo
Verificar que se muestren todos los intereses correctamente.

### Pasos (Manual en BD)
```sql
-- En Supabase SQL Editor
-- Obtener IDs necesarios
SELECT id, nombre FROM proyectos LIMIT 3;
SELECT id FROM clientes WHERE numero_documento = '987654321';

-- Insertar 2 intereses más para María García
INSERT INTO cliente_intereses (cliente_id, proyecto_id, notas, estado)
VALUES
  ('uuid-maria-garcia', 'uuid-proyecto-2', 'También le interesa este proyecto', 'Activo'),
  ('uuid-maria-garcia', 'uuid-proyecto-3', 'Opción secundaria', 'Descartado');
```

**Luego:**
1. Refrescar detalle del cliente
2. Verificar sección de intereses

### Resultado Esperado
- ✅ Badge contador muestra "3"
- ✅ 3 cards aparecen en orden cronológico inverso (más reciente primero)
- ✅ Card con estado "Descartado" tiene badge gris
- ✅ Cards con estado "Activo" tienen badge verde

---

## 🧪 CASO DE PRUEBA 4: Cliente CON NEGOCIACIÓN (Estadísticas)

### Objetivo
Verificar que las estadísticas se calculen correctamente.

### Pasos (Manual en BD)
```sql
-- Crear una negociación para el cliente
-- Nota: Necesitas vivienda_id válido
SELECT id FROM viviendas LIMIT 1;

INSERT INTO negociaciones (
  cliente_id,
  vivienda_id,
  estado,
  valor_negociado,
  descuento_aplicado,
  fecha_negociacion
) VALUES (
  'uuid-maria-garcia',
  'uuid-vivienda',
  'Activa',
  150000000,
  5000000,
  NOW()
);
```

**Luego:**
1. Refrescar detalle del cliente
2. Verificar sección de estadísticas

### Resultado Esperado
- ✅ Total Negociaciones: **1** (azul)
- ✅ Activas: **1** (verde)
- ✅ Completadas: **0** (morado)
- ✅ Última negociación: "hace unos segundos"

### Screenshot Esperado
```
┌─────────────────────────────────────┐
│ 📊 Estadísticas Comerciales         │
├─────────────────────────────────────┤
│  ┌──────┐  ┌──────┐  ┌──────┐      │
│  │  1   │  │  1   │  │  0   │      │
│  │ Total│  │Activas│  │Comp.│      │
│  └──────┘  └──────┘  └──────┘      │
│                                     │
│  🕐 Última: hace unos segundos      │
└─────────────────────────────────────┘
```

---

## 🧪 CASO DE PRUEBA 5: Cliente CON DOCUMENTO

### Objetivo
Verificar que el botón de documento funcione.

### Pasos
**Opción A: Con archivo real (ideal)**
```sql
-- Actualizar cliente con URL de Supabase Storage
UPDATE clientes
SET documento_identidad_url = 'https://swyjhwgvkfcfdtemkyad.supabase.co/storage/v1/object/public/documentos-clientes/cedula-123.pdf'
WHERE numero_documento = '987654321';
```

**Opción B: Con URL de prueba**
```sql
UPDATE clientes
SET documento_identidad_url = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
WHERE numero_documento = '987654321';
```

**Luego:**
1. Refrescar detalle del cliente
2. Buscar en sección "Información Personal"
3. Debe aparecer un botón azul al final
4. Click en el botón

### Resultado Esperado
- ✅ Botón aparece con borde azul
- ✅ Texto: "Documento de Identidad"
- ✅ Subtexto: "Haz clic para ver o descargar"
- ✅ Icono FileText a la izquierda
- ✅ Icono Eye a la derecha
- ✅ Al hacer hover, cambia de color
- ✅ Al hacer click, abre en **nueva pestaña**
- ✅ PDF se visualiza/descarga correctamente

### Screenshot Esperado
```
┌─────────────────────────────────────┐
│ 👤 Información Personal             │
│  Nombres: María                     │
│  ...                                │
│ ┌─────────────────────────────────┐ │
│ │ 📄 Documento de Identidad    👁 │ │
│ │    Haz clic para ver o descargar│ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## 🧪 CASO DE PRUEBA 6: Dark Mode

### Objetivo
Verificar que todas las secciones se vean bien en dark mode.

### Pasos
1. Abrir detalle de cliente (con intereses + estadísticas + documento)
2. Activar dark mode (si tu app lo tiene)
3. Verificar colores

### Resultado Esperado (Dark Mode)
- ✅ Sección Intereses:
  - Borde: `dark:border-purple-800`
  - Fondo: `dark:bg-purple-950/30`
  - Cards: `dark:bg-purple-900/20`
  - Texto: `dark:text-purple-100`
- ✅ Sección Estadísticas:
  - Colores ajustados con opacity
  - Legible en fondo oscuro
- ✅ Botón Documento:
  - Borde: `dark:border-blue-800`
  - Hover funciona

---

## 🧪 CASO DE PRUEBA 7: Responsive (Mobile)

### Objetivo
Verificar que el layout se adapte a pantallas pequeñas.

### Pasos
1. Abrir detalle de cliente
2. Abrir DevTools (F12)
3. Activar modo responsive
4. Cambiar a "iPhone 12 Pro" o similar
5. Verificar layout

### Resultado Esperado
- ✅ Grid de estadísticas colapsa a 1 columna (`grid-cols-1 md:grid-cols-3`)
- ✅ Cards de intereses ocupan ancho completo
- ✅ Textos siguen siendo legibles
- ✅ No hay scroll horizontal
- ✅ Botones clickeables fácilmente

---

## 🐛 Debugging

### Si NO aparece la sección de Intereses

**Check 1: Verificar en consola del navegador**
```javascript
// En DevTools Console
const cliente = { /* objeto del detalle */ }
console.log('Intereses:', cliente.intereses)
console.log('Cantidad:', cliente.intereses?.length)
```

**Check 2: Verificar en Network tab**
```
1. Abrir DevTools → Network
2. Filtrar por "fetch/xhr"
3. Refrescar detalle
4. Buscar request a Supabase
5. Ver respuesta JSON
6. Verificar que tenga campo "intereses"
```

**Check 3: Verificar en BD**
```sql
SELECT * FROM intereses_completos
WHERE cliente_id = 'uuid-del-cliente';
```

### Si estadísticas muestran 0 pero hay negociaciones

**Check: Verificar negociaciones**
```sql
SELECT id, estado, fecha_negociacion
FROM negociaciones
WHERE cliente_id = 'uuid-del-cliente';
```

### Si el documento no abre

**Check: URL válida**
```sql
SELECT documento_identidad_url
FROM clientes
WHERE id = 'uuid-del-cliente';
```

---

## ✅ Checklist Final

### Funcionalidad
- [ ] Cliente sin intereses → Sección NO aparece
- [ ] Cliente con 1 interés → Card se muestra correctamente
- [ ] Cliente con múltiples intereses → Todos se muestran
- [ ] Estado "Activo" → Badge verde
- [ ] Estado "Convertido" → Badge azul
- [ ] Estado "Descartado" → Badge gris
- [ ] Interés con vivienda → Muestra manzana + número
- [ ] Interés sin vivienda → No muestra badge de casa
- [ ] Notas del interés → Se muestran en itálica
- [ ] Fecha relativa → "hace X tiempo" correcto
- [ ] Estadísticas con negociaciones → Números correctos
- [ ] Estadísticas sin negociaciones → Muestra 0s
- [ ] Documento con URL → Botón aparece
- [ ] Documento sin URL → Botón NO aparece
- [ ] Click en documento → Abre en nueva pestaña

### Visual
- [ ] Colores purple para intereses
- [ ] Colores diferenciados en estadísticas (azul, verde, morado)
- [ ] Iconos correctos (Heart, Building2, Home, BarChart3, etc.)
- [ ] Dark mode funciona
- [ ] Responsive en mobile (grid colapsa)
- [ ] Hover effects funcionan
- [ ] Bordes y sombras correctos

### Performance
- [ ] Sección carga rápido (< 500ms)
- [ ] No hay errores en consola
- [ ] No hay warnings de TypeScript
- [ ] Vista `intereses_completos` optimizada

---

## 📊 Métricas de Testing

| Test | Resultado | Notas |
|------|-----------|-------|
| Cliente sin intereses | ⏳ Pendiente | |
| Cliente con interés | ⏳ Pendiente | |
| Múltiples intereses | ⏳ Pendiente | |
| Estadísticas | ⏳ Pendiente | |
| Documento | ⏳ Pendiente | |
| Dark mode | ⏳ Pendiente | |
| Responsive | ⏳ Pendiente | |

---

## 🎯 Próximos Pasos Después de Testing

1. **Si todo funciona**: ✅ Marcar módulo como completo
2. **Si hay bugs**: 🐛 Documentar y arreglar
3. **Mejoras sugeridas**:
   - Agregar filtro de estado en intereses
   - Botón para agregar nuevo interés desde detalle
   - Gráfico de estadísticas (Chart.js)
   - Exportar historial de intereses a PDF

---

**Fecha**: 2025-10-17
**Módulo**: Clientes - Detalle
**Status**: ⏳ **READY FOR TESTING**
