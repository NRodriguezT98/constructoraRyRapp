# ✅ Checklist de Desarrollo - Prevención de Errores

> **Usar ANTES de crear/modificar cualquier componente, hook o servicio**

---

## 🎯 ANTES DE EMPEZAR (OBLIGATORIO)

### 1. Identificar Datos que Usarás

- [ ] ¿Qué tabla(s) de la DB necesito consultar?
- [ ] ¿Necesito una vista o tabla directa?
- [ ] **Consulté** `docs/DATABASE-SCHEMA-REFERENCE.md`?
- [ ] **Anoté** los nombres EXACTOS de las columnas que usaré

### 2. Verificar Nombres de Campos

- [ ] Copié los nombres de columnas desde `DATABASE-SCHEMA-REFERENCE.md`
- [ ] NO asumí ningún nombre de campo
- [ ] Verifiqué el formato de estados (snake_case vs PascalCase)
- [ ] Si hay dudas: abrí Supabase Table Editor y confirmé

### 3. Verificar Servicios Existentes

- [ ] ¿Ya existe un servicio para esta tabla?
  - `src/modules/clientes/services/intereses.service.ts`
  - `src/modules/clientes/services/negociaciones.service.ts`
  - `src/shared/services/proyectos.service.ts`
- [ ] Si existe: ¿usa los nombres correctos de columnas?
- [ ] Si NO existe: ¿necesito crear uno nuevo?

---

## 🏗️ AL CREAR COMPONENTE

### Separación de Responsabilidades (OBLIGATORIO)

- [ ] Lógica en hook separado (`use*.ts`)
- [ ] Estilos en archivo `.styles.ts`
- [ ] Componente < 150 líneas (solo UI presentacional)
- [ ] No hay lógica de negocio en el componente

### Imports de Datos

- [ ] Usé el servicio correcto (no creé fetch directo)
- [ ] Los nombres de campos coinciden con `DATABASE-SCHEMA-REFERENCE.md`
- [ ] Manejé estados de carga y error
- [ ] Agregué tipos TypeScript estrictos

---

## 🪝 AL CREAR HOOK

### Naming y Estructura

- [ ] Nombre: `use[NombreDescriptivo].ts`
- [ ] Ubicación: `src/modules/[modulo]/hooks/`
- [ ] Exportado en `index.ts` de la carpeta

### Consultas a DB

- [ ] **Verificado** nombres de columnas en `DATABASE-SCHEMA-REFERENCE.md`
- [ ] Usé servicio existente (no consulté Supabase directamente)
- [ ] Si consulto directamente: usé `client-browser.ts` para SSR
- [ ] Agregué manejo de errores con try/catch
- [ ] Console.log en errores para debugging

### Estados y Filtros

- [ ] Si filtro por estado: **verifiqué** formato exacto
  - ¿Es `'disponible'` o `'Disponible'`?
  - ¿Es `'en_construccion'` o `'En Construcción'`?
- [ ] Usé los valores de `DATABASE-SCHEMA-REFERENCE.md`

---

## 🔧 AL CREAR/MODIFICAR SERVICIO

### Nombres de Métodos

- [ ] Métodos descriptivos en español
- [ ] Siguen convención: `obtener*`, `crear*`, `actualizar*`, `eliminar*`

### Consultas Supabase

```typescript
// ✅ CHECKLIST POR CADA CONSULTA

- [ ] Nombre de tabla correcto
- [ ] Nombres de columnas verificados en DATABASE-SCHEMA-REFERENCE.md
- [ ] .select() especifica campos necesarios (no usar '*' sin necesidad)
- [ ] Filtros usan nombres de columnas correctos
- [ ] Estados/enums usan valores exactos de la DB
```

### Ejemplo de Verificación:

```typescript
// ❌ INCORRECTO (asumir nombres)
const { data } = await supabase
  .from('intereses')
  .select('*')
  .eq('estado_interes', 'activo')  // ❌ Columna no existe

// ✅ CORRECTO (verificado en doc)
const { data } = await supabase
  .from('cliente_intereses')
  .select('*')
  .eq('estado', 'Activo')  // ✅ Nombre y valor correctos
```

---

## 📝 AL CREAR FORMULARIO

### Campos del Formulario

- [ ] Nombre de campos coincide con columnas de DB
- [ ] Valores de dropdowns/select coinciden con CHECK constraints
- [ ] Validaciones Zod reflejan reglas de DB

### Ejemplo:

```typescript
// Si el campo en DB es 'numero_documento'
// El form field debe ser:
<ModernInput
  {...register('numero_documento')}  // ✅ Mismo nombre
  label="Número de Documento"
/>

// Si el estado en DB es 'Activo' (PascalCase)
<option value="Activo">Activo</option>  // ✅ Valor exacto
```

---

## 🧪 AL PROBAR (Testing)

### Verificación Visual

- [ ] Abrí DevTools Console
- [ ] Revisé que no haya errores 400/404/422
- [ ] Datos se cargan correctamente
- [ ] Formularios guardan sin errores

### Verificación en DB

- [ ] Abrí Supabase Table Editor
- [ ] Verifiqué que el registro se guardó
- [ ] Todos los campos tienen los valores esperados
- [ ] Formato de estados es correcto

---

## 🐛 SI HAY ERRORES

### Error 400 "column does not exist"

1. [ ] Abrí `DATABASE-SCHEMA-REFERENCE.md`
2. [ ] Busqué la tabla mencionada
3. [ ] Comparé nombre usado vs nombre real
4. [ ] Corregí en servicio/hook
5. [ ] Actualicé interface TypeScript si es necesario

### Error 422 "new row violates check constraint"

1. [ ] Verifiqué valores permitidos en `DATABASE-SCHEMA-REFERENCE.md`
2. [ ] Comparé valor enviado vs valores permitidos
3. [ ] Corregí formato (mayúsculas, espacios, snake_case)
4. [ ] Actualicé dropdown/select en formulario

---

## 📚 DOCUMENTACIÓN POST-DESARROLLO

Después de terminar:

- [ ] ¿Agregué campos nuevos a la DB?
  - → Actualizar `DATABASE-SCHEMA-REFERENCE.md`
- [ ] ¿Creé un nuevo servicio?
  - → Agregar JSDoc con ejemplos
- [ ] ¿Creé un nuevo hook complejo?
  - → Agregar comentarios explicativos
- [ ] ¿Modifiqué un flujo importante?
  - → Actualizar `ARCHITECTURE.md`

---

## 🎯 RESUMEN DE ERRORES COMUNES (NO REPETIR)

### ❌ Errores que ya tuvimos:

1. **`estado_interes` no existe** → Es solo `estado`
2. **`vivienda_precio`** → Es `vivienda_valor`
3. **`proyecto_ubicacion`** → Es `proyecto_estado`
4. **`cliente.nombre`** → Es `cliente.nombres` (plural)
5. **Estado `'disponible'`** → Lowercase con underscore
6. **Estado `'Activo'`** → PascalCase para intereses

### ✅ Solución:

**SIEMPRE consultar** `docs/DATABASE-SCHEMA-REFERENCE.md` **ANTES** de escribir código.

---

## 🚦 SEMÁFORO DE CALIDAD

### 🔴 NO iniciar desarrollo si:

- No consultaste `DATABASE-SCHEMA-REFERENCE.md`
- No sabes los nombres exactos de las columnas
- Vas a "probar" nombres de campos

### 🟡 Precaución si:

- El servicio existe pero parece tener errores
- La documentación no tiene la tabla que necesitas
- Hay dudas sobre formato de estados

### 🟢 OK para desarrollar si:

- Consultaste la documentación
- Verificaste nombres de campos
- Tienes los valores exactos de enums/estados
- Sabes qué servicio usar

---

> **Tiempo de consulta**: 2 minutos
> **Tiempo ahorrado en debugging**: 30+ minutos por error
>
> 🎯 **Ratio**: 15x retorno de inversión
