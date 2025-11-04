# PLANTILLA PARA LLENAR MANUALMENTE

Copia esta plantilla y llena los campos que veas en Table Editor.

## TABLA: clientes

### Instrucciones:
1. En Supabase → Table Editor → Selecciona "clientes"
2. Verás columnas en la parte superior
3. Anota cada columna que veas

### Campos identificados:

- [ ] **id** - tipo: `_____` - nullable: `SI/NO`
- [ ] **created_at** - tipo: `_____` - nullable: `SI/NO`
- [ ] **nombres** - tipo: `_____` - nullable: `SI/NO`
- [ ] **apellidos** - tipo: `_____` - nullable: `SI/NO`
- [ ] **numero_documento** - tipo: `_____` - nullable: `SI/NO`
- [ ] **telefono** - tipo: `_____` - nullable: `SI/NO`
- [ ] **email** - tipo: `_____` - nullable: `SI/NO`
- [ ] **ciudad** - tipo: `_____` - nullable: `SI/NO`

### Otros campos que veas (agregar aquí):

- [ ] **_______** - tipo: `_____` - nullable: `SI/NO`
- [ ] **_______** - tipo: `_____` - nullable: `SI/NO`
- [ ] **_______** - tipo: `_____` - nullable: `SI/NO`

---

## TABLA: negociaciones

### Campos identificados:

- [ ] **id** - tipo: `_____` - nullable: `SI/NO`
- [ ] **created_at** - tipo: `_____` - nullable: `SI/NO`
- [ ] **cliente_id** - tipo: `_____` - nullable: `SI/NO`
- [ ] **vivienda_id** - tipo: `_____` - nullable: `SI/NO`
- [ ] **estado** - tipo: `_____` - nullable: `SI/NO`
- [ ] **monto_total** - tipo: `_____` - nullable: `SI/NO`
- [ ] **inicial** - tipo: `_____` - nullable: `SI/NO`
- [ ] **saldo_pendiente** - tipo: `_____` - nullable: `SI/NO`

### Otros campos:

- [ ] **_______** - tipo: `_____` - nullable: `SI/NO`
- [ ] **_______** - tipo: `_____` - nullable: `SI/NO`

---

## TABLA: viviendas

### Campos identificados:

- [ ] **id** - tipo: `_____` - nullable: `SI/NO`
- [ ] **numero** - tipo: `_____` - nullable: `SI/NO`
- [ ] **manzana_id** - tipo: `_____` - nullable: `SI/NO`
- [ ] **tipo** - tipo: `_____` - nullable: `SI/NO`
- [ ] **area** - tipo: `_____` - nullable: `SI/NO`
- [ ] **estado** - tipo: `_____` - nullable: `SI/NO`
- [ ] **vivienda_valor** - tipo: `_____` - nullable: `SI/NO`

### Otros campos:

- [ ] **_______** - tipo: `_____` - nullable: `SI/NO`

---

## TABLA: fuentes_pago

### Campos identificados:

- [ ] **id** - tipo: `_____` - nullable: `SI/NO`
- [ ] **negociacion_id** - tipo: `_____` - nullable: `SI/NO`
- [ ] **tipo** - tipo: `_____` - nullable: `SI/NO`
- [ ] **monto** - tipo: `_____` - nullable: `SI/NO`
- [ ] **descripcion** - tipo: `_____` - nullable: `SI/NO`
- [ ] **estado** - tipo: `_____` - nullable: `SI/NO`

### Otros campos:

- [ ] **_______** - tipo: `_____` - nullable: `SI/NO`

---

## NOTAS IMPORTANTES

### Tipos de datos comunes en PostgreSQL:
- `uuid` → IDs únicos
- `text` → Texto sin límite
- `varchar(n)` → Texto con límite
- `integer` → Números enteros
- `numeric` / `decimal` → Números decimales (para dinero)
- `timestamp` / `timestamptz` → Fechas
- `boolean` → true/false

### Campos que NO existen (confirmados):
- ❌ `profesion` (en tabla clientes)
- ❌ `estado_civil` (en tabla clientes)
- ❌ `direccion` (en tabla clientes)
- ❌ `vivienda_precio` (es `vivienda_valor`)

### Campos confirmados como plurales:
- ✅ `nombres` (NO "nombre")
- ✅ `apellidos` (NO "apellido")

---

## CÓMO USAR ESTA PLANTILLA

1. Abre Supabase → Table Editor
2. Selecciona cada tabla
3. Rellena los checkboxes con los campos que VES
4. Anota el tipo y si permite NULL
5. Copia los datos a `docs/DATABASE-SCHEMA-REFERENCE.md`
