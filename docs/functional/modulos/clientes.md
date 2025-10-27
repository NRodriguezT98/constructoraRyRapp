# 👥 Módulo: Gestión de Clientes

> Documentación funcional del módulo de gestión de clientes potenciales y activos

---

## 📌 Información General

**Módulo**: Clientes
**Versión**: 1.0
**Última actualización**: 27 de Octubre, 2025
**Responsable**: Equipo RyR Constructora

---

## 🎯 Propósito

### ¿Qué hace este módulo?
El módulo de Clientes permite gestionar toda la información de los clientes potenciales y activos de la constructora, desde su registro inicial hasta el seguimiento de sus intereses en viviendas, negociaciones y documentación requerida.

### ¿Quién lo usa?
- [x] Administrador
- [x] Vendedor
- [x] Gerente
- [ ] Cliente (portal)

---

## 🔑 Funcionalidades Principales

### 1. Registrar Nuevo Cliente
**Descripción**: Permite crear un nuevo registro de cliente con su información personal y de contacto.
**Acceso**: Menú → Clientes → Botón "Nuevo Cliente"
**Permisos requeridos**: Vendedor, Administrador

**Pasos**:
1. Hacer clic en el botón "Nuevo Cliente" en la esquina superior derecha
2. Seleccionar tipo de cliente (Natural o Jurídico)
3. Completar formulario con datos personales:
   - Nombres y apellidos
   - Tipo y número de documento
   - Email y teléfono
   - Dirección (opcional)
4. Subir cédula de ciudadanía (PDF o imagen)
5. Hacer clic en "Guardar Cliente"

**Resultado esperado**:
- Cliente creado exitosamente
- Redirección a la vista de detalle del cliente
- Mensaje de confirmación: "Cliente registrado exitosamente"

---

### 2. Registrar Interés en Vivienda
**Descripción**: Permite asociar un cliente con una vivienda de interés, creando una negociación activa.
**Acceso**: Detalle del Cliente → Pestaña "Negociaciones" → Botón "Registrar Interés"
**Permisos requeridos**: Vendedor, Administrador

**Pasos**:
1. Abrir detalle del cliente
2. Navegar a pestaña "Negociaciones"
3. Clic en "Registrar Interés"
4. Seleccionar proyecto
5. Seleccionar vivienda disponible
6. Indicar prioridad (Alta, Media, Baja)
7. Agregar notas opcionales
8. Confirmar registro

**Resultado esperado**:
- Negociación creada con estado "Activa"
- Vivienda marcada como "En Negociación"
- Cliente visible en la lista de interesados del proyecto

---

### 3. Gestionar Documentos del Cliente
**Descripción**: Permite subir, organizar y categorizar documentos del cliente.
**Acceso**: Detalle del Cliente → Pestaña "Documentos"
**Permisos requeridos**: Vendedor, Administrador

**Pasos**:
1. Abrir detalle del cliente
2. Navegar a pestaña "Documentos"
3. Clic en "Subir Documento"
4. Arrastrar archivo o hacer clic para seleccionar
5. Completar información:
   - Título del documento
   - Categoría (opcional)
   - Descripción (opcional)
   - Fecha de vencimiento (si aplica)
6. Marcar como "Importante" si es requerido
7. Guardar documento

**Resultado esperado**:
- Documento almacenado en sistema
- Visible en lista de documentos del cliente
- Disponible para descarga y previsualización

---

### 4. Configurar Fuentes de Pago
**Descripción**: Define cómo el cliente planea pagar la vivienda (cuota inicial, crédito, subsidios).
**Acceso**: Detalle del Cliente → Negociación → "Configurar Fuentes de Pago"
**Permisos requeridos**: Vendedor, Administrador

**Pasos**:
1. Abrir detalle de la negociación
2. Clic en "Configurar Fuentes de Pago"
3. Para cada fuente disponible:
   - **Cuota Inicial**: Ingresar valor en pesos
   - **Crédito Hipotecario**: Ingresar valor y subir carta de aprobación
   - **Subsidios**: Agregar subsidio, ingresar valor y subir carta
   - **Recursos Propios**: Ingresar valor
4. Verificar que la suma cubra el valor de la vivienda
5. Guardar configuración

**Resultado esperado**:
- Fuentes de pago registradas
- Validación automática de sumas
- Estado de negociación actualizado

---

## 📊 Campos y Validaciones

### Formulario: Crear/Editar Cliente

| Campo | Tipo | Obligatorio | Validaciones | Ejemplo |
|-------|------|-------------|--------------|---------|
| Tipo de Cliente | Select | ✅ Sí | Natural o Jurídico | "Natural" |
| Nombres | Texto | ✅ Sí | Min 2 caracteres, solo letras y espacios | "Juan Carlos" |
| Apellidos | Texto | ✅ Sí (solo Natural) | Min 2 caracteres, solo letras y espacios | "Pérez Gómez" |
| Tipo de Documento | Select | ✅ Sí | CC, CE, NIT, Pasaporte | "CC" |
| Número de Documento | Texto | ✅ Sí | Numérico, único en sistema | "1234567890" |
| Email | Email | ✅ Sí | Formato válido, único | "juan@example.com" |
| Teléfono | Texto | ✅ Sí | 10 dígitos, formato (###) ###-#### | "(300) 123-4567" |
| Dirección | Texto | ❌ No | Máx 200 caracteres | "Calle 123 #45-67" |
| Observaciones | Textarea | ❌ No | Máx 500 caracteres | "Cliente referido por..." |
| Cédula (archivo) | PDF/Imagen | ✅ Sí | Max 5MB, formatos: PDF, JPG, PNG | "cedula.pdf" |

### Reglas de Negocio

1. **Validación de duplicados por documento**
   - **Regla**: No se permite crear clientes con el mismo número de documento
   - **Mensaje de error**: "Ya existe un cliente registrado con el documento [número]"
   - **Acción correctiva**: Buscar cliente existente en el sistema antes de crear

2. **Validación de email único**
   - **Regla**: No se permite usar el mismo email en múltiples clientes
   - **Mensaje de error**: "El email [email] ya está registrado en otro cliente"
   - **Acción correctiva**: Verificar email o actualizar cliente existente

3. **Cédula obligatoria**
   - **Regla**: Todo cliente debe tener su cédula/documento de identidad cargado
   - **Mensaje de error**: "Debes subir la cédula de ciudadanía del cliente"
   - **Acción correctiva**: Subir documento antes de guardar

4. **Negociación única por vivienda**
   - **Regla**: Un cliente no puede tener múltiples negociaciones activas en la misma vivienda
   - **Mensaje de error**: "Ya existe un interés registrado para esta vivienda"
   - **Acción correctiva**: Revisar negociaciones existentes o cerrar la anterior

5. **Suma de fuentes de pago**
   - **Regla**: La suma de todas las fuentes de pago debe ser igual al valor de la vivienda
   - **Mensaje de error**: "La suma de las fuentes de pago ($ [suma]) no coincide con el valor de la vivienda ($ [valor])"
   - **Acción correctiva**: Ajustar valores para que la suma total sea correcta

---

## 🔄 Flujos de Trabajo

### Flujo 1: Registro Completo de Cliente Nuevo

```
┌─────────────────────────┐
│  Vendedor recibe lead   │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ Registrar datos básicos │ → Formulario con validaciones
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ Subir cédula            │ → PDF o imagen, max 5MB
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ Guardar cliente         │ → Validación de duplicados
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ Registrar interés       │ → Seleccionar proyecto + vivienda
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ Configurar pago         │ → Fuentes de pago
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ Negociación activa      │ → Cliente listo para seguimiento
└─────────────────────────┘
```

**Descripción detallada**:
1. **Registrar datos básicos**:
   - Se valida que el número de documento no exista
   - Se valida formato de email y teléfono
   - Se requiere cédula obligatoriamente

2. **Guardar cliente**:
   - Sistema genera ID único
   - Se envía notificación al equipo de ventas
   - Cliente queda en estado "Potencial"

3. **Registrar interés**:
   - Se valida que la vivienda esté disponible
   - Se crea negociación con estado "Activa"
   - Vivienda cambia a estado "En Negociación"

4. **Configurar pago**:
   - Se registran fuentes de pago
   - Sistema valida que la suma sea correcta
   - Se suben cartas de aprobación si aplica

---

### Flujo 2: Seguimiento de Negociación

```
┌─────────────────────────┐
│  Negociación Activa     │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ Vendedor hace          │ → Llamadas, visitas, emails
│ seguimiento            │
└───────────┬─────────────┘
            │
            ├──────────────────┐
            ▼                  ▼
┌─────────────────┐   ┌──────────────────┐
│ Cliente acepta  │   │ Cliente rechaza  │
└────────┬────────┘   └────────┬─────────┘
         │                     │
         ▼                     ▼
┌─────────────────┐   ┌──────────────────┐
│ Crear contrato  │   │ Cerrar como      │
│                 │   │ "No concretada"  │
└─────────────────┘   └──────────────────┘
```

---

## 🎨 Capturas de Pantalla

### Vista Principal - Lista de Clientes
> **Ubicación**: `/clientes`
>
> **Elementos**:
> - Barra de búsqueda con filtros
> - Estadísticas (Total, Activos, Potenciales)
> - Tabla con columnas: Nombre, Documento, Email, Teléfono, Estado, Acciones
> - Botón "Nuevo Cliente" (esquina superior derecha)

### Formulario de Creación
> **Ubicación**: Modal al hacer clic en "Nuevo Cliente"
>
> **Secciones**:
> 1. Header con gradiente morado y título "Registrar Nuevo Cliente"
> 2. Selector de tipo de cliente (Natural/Jurídico)
> 3. Formulario en 2 columnas (nombre, documento, contacto, dirección)
> 4. Zona de drag & drop para cédula
> 5. Footer con botones "Cancelar" y "Guardar Cliente"

### Detalle del Cliente
> **Ubicación**: `/clientes/[id]`
>
> **Tabs disponibles**:
> - **Información General**: Card con datos del cliente
> - **Negociaciones**: Lista de intereses y negociaciones activas
> - **Documentos**: Grid de documentos subidos
> - **Historial**: Timeline de actividades

---

## ⚠️ Validaciones y Errores Comunes

### Error 1: "Ya existe un cliente con este documento"
**Cuándo ocurre**: Al intentar crear un cliente con un número de documento que ya existe en el sistema.

**Mensaje completo**:
```
❌ Ya existe un cliente registrado con el documento 1234567890
```

**Solución**:
1. Hacer clic en "Buscar Cliente Existente"
2. Revisar si es el mismo cliente
3. Si es el mismo: Actualizar datos del cliente existente
4. Si es diferente: Verificar número de documento ingresado

---

### Error 2: "La suma de fuentes de pago no coincide"
**Cuándo ocurre**: Al configurar fuentes de pago y la suma no es igual al valor de la vivienda.

**Mensaje completo**:
```
⚠️ La suma de las fuentes de pago ($250,000,000) no coincide con el valor de la vivienda ($280,000,000)
Diferencia: $30,000,000
```

**Solución**:
1. Revisar valores ingresados en cada fuente
2. Ajustar montos para que la suma sea exacta
3. Considerar agregar "Recursos Propios" para la diferencia
4. Guardar nuevamente

---

### Error 3: "Formato de archivo no válido"
**Cuándo ocurre**: Al subir un archivo que no es PDF, JPG o PNG.

**Mensaje completo**:
```
❌ El archivo seleccionado no es válido
Formatos permitidos: PDF, JPG, PNG
Tamaño máximo: 5MB
```

**Solución**:
1. Convertir archivo a PDF (recomendado)
2. O guardar como JPG/PNG
3. Verificar que el tamaño sea menor a 5MB
4. Subir nuevamente

---

## 🔗 Integraciones con Otros Módulos

### Módulo: Viviendas
**Relación**: Un cliente puede tener interés en múltiples viviendas
**Datos compartidos**:
- ID de vivienda
- Estado de vivienda (disponible → en negociación)
- Valor de la vivienda

**Flujo**:
```
Cliente → Registrar Interés → Seleccionar Vivienda → Negociación
```

---

### Módulo: Proyectos
**Relación**: Los clientes registran interés en viviendas de proyectos específicos
**Datos compartidos**:
- ID de proyecto
- Nombre del proyecto
- Ubicación

**Flujo**:
```
Cliente → Seleccionar Proyecto → Filtrar Viviendas → Crear Interés
```

---

### Módulo: Documentos
**Relación**: Cada cliente tiene documentos asociados (cédula, contratos, etc.)
**Datos compartidos**:
- ID de cliente
- Categoría del documento
- Metadata (fecha, estado, etc.)

**Flujo**:
```
Cliente → Subir Documento → Categorizar → Almacenar en Supabase Storage
```

---

### Módulo: Abonos
**Relación**: Los clientes realizan abonos a sus negociaciones
**Datos compartidos**:
- ID de negociación
- Valor del abono
- Historial de pagos

**Flujo**:
```
Negociación → Registrar Abono → Actualizar Saldo → Generar Recibo
```

---

## 📈 Reportes y Consultas

### Reporte 1: Clientes Activos
**Descripción**: Lista de todos los clientes con negociaciones activas
**Filtros disponibles**:
- [x] Por fecha de registro
- [x] Por estado
- [x] Por proyecto de interés
- [x] Por vendedor asignado

**Formato de exportación**:
- [x] PDF
- [x] Excel
- [ ] CSV

**Columnas incluidas**:
- Nombre completo
- Documento
- Email y teléfono
- Proyecto de interés
- Vivienda
- Valor de negociación
- Estado
- Fecha de último contacto

---

### Reporte 2: Documentos Pendientes
**Descripción**: Clientes que no han completado su documentación requerida
**Filtros disponibles**:
- [x] Por tipo de documento faltante
- [x] Por fecha de registro
- [ ] Por vendedor

**Formato de exportación**:
- [x] PDF
- [x] Excel

---

## 🔐 Permisos y Roles

| Acción | Administrador | Vendedor | Gerente | Cliente |
|--------|--------------|----------|---------|---------|
| Ver lista de clientes | ✅ | ✅ | ✅ | ❌ |
| Ver detalle de cliente | ✅ | ✅ | ✅ | ❌ |
| Crear nuevo cliente | ✅ | ✅ | ❌ | ❌ |
| Editar cliente | ✅ | ✅ | ✅ | ❌ |
| Eliminar cliente | ✅ | ❌ | ❌ | ❌ |
| Registrar interés | ✅ | ✅ | ❌ | ❌ |
| Configurar fuentes de pago | ✅ | ✅ | ✅ | ❌ |
| Subir documentos | ✅ | ✅ | ✅ | ❌ |
| Exportar reportes | ✅ | ✅ | ✅ | ❌ |
| Ver estadísticas globales | ✅ | ❌ | ✅ | ❌ |

---

## 💡 Buenas Prácticas

### Recomendaciones de Uso

1. **Registrar clientes inmediatamente**
   - **Qué hacer**: Crear registro del cliente tan pronto como haga contacto
   - **Por qué**: Evita pérdida de leads y permite seguimiento desde el primer contacto
   - **Ejemplo**: Cliente llama preguntando por proyecto → Crear cliente → Registrar interés

2. **Subir cédula siempre**
   - **Qué hacer**: Solicitar y subir cédula en el primer contacto
   - **Por qué**: Es requisito legal y agiliza procesos posteriores
   - **Ejemplo**: Evita retrasos al momento de firmar contrato

3. **Configurar fuentes de pago temprano**
   - **Qué hacer**: Definir cómo pagará el cliente antes de avanzar en negociación
   - **Por qué**: Identifica viabilidad financiera y evita pérdida de tiempo
   - **Ejemplo**: Cliente sin aprobación de crédito puede buscar subsidios primero

4. **Actualizar estado regularmente**
   - **Qué hacer**: Cambiar estado de negociación según avance real
   - **Por qué**: Mantiene datos confiables para reportes y toma de decisiones
   - **Ejemplo**: Cliente que no responde → Cambiar a "En seguimiento"

### Errores Comunes a Evitar

❌ **No hacer**: Crear cliente sin verificar duplicados primero
✅ **Hacer**: Buscar por documento antes de crear nuevo registro
📝 **Razón**: Evita duplicación de información y confusión en reportes

❌ **No hacer**: Registrar interés sin confirmar disponibilidad de vivienda
✅ **Hacer**: Verificar que la vivienda esté disponible antes de crear negociación
📝 **Razón**: Evita conflictos cuando dos clientes quieren la misma vivienda

❌ **No hacer**: Configurar fuentes de pago con sumas incorrectas
✅ **Hacer**: Validar que la suma total sea exacta al valor de la vivienda
📝 **Razón**: Errores en montos causan problemas legales y financieros

---

## 📝 Notas Técnicas (Para Desarrolladores)

**Componentes principales**:
- `lista-clientes.tsx` - Vista principal con tabla y filtros
- `formulario-cliente-modern.tsx` - Modal de creación/edición
- `detalle-cliente.tsx` - Vista de detalle con tabs
- `cliente-card-activo.tsx` - Card premium de cliente activo
- `modal-registrar-interes.tsx` - Modal para crear negociación
- `configurar-fuentes-pago.tsx` - Componente de fuentes de pago

**Hooks personalizados**:
- `useClientes()` - Gestión de lista y filtros
- `useClienteForm()` - Lógica del formulario
- `useRegistrarInteres()` - Crear negociación
- `useConfigurarFuentesPago()` - Configurar pagos

**Servicios**:
- `clientes.service.ts` - CRUD de clientes
- `negociaciones.service.ts` - Gestión de negociaciones
- `documentos-cliente.service.ts` - Upload de documentos

**Store (Zustand)**:
- `clientes.store.ts` - Estado global de clientes

**Validaciones Zod**:
```typescript
const clienteSchema = z.object({
  tipo_cliente: z.enum(['Natural', 'Jurídico']),
  nombres: z.string().min(2),
  apellidos: z.string().min(2).optional(),
  tipo_documento: z.enum(['CC', 'CE', 'NIT', 'Pasaporte']),
  numero_documento: z.string().min(5),
  email: z.string().email(),
  telefono: z.string().min(10),
})
```

---

## 🔄 Historial de Cambios

| Versión | Fecha | Cambios | Autor |
|---------|-------|---------|-------|
| 1.0 | 27/10/2025 | Documentación inicial | Equipo RyR |
| 1.1 | [Pendiente] | Agregar módulo de contratos | - |

---

## ❓ Preguntas Frecuentes

### ¿Puedo editar un cliente después de crearlo?
**Respuesta**: Sí, puedes editar todos los datos del cliente excepto el número de documento. Para cambiar el documento, debes eliminar el cliente y crear uno nuevo (si no tiene negociaciones activas).

### ¿Qué pasa si subo un documento equivocado?
**Respuesta**: Puedes eliminar el documento desde la pestaña "Documentos" y subir uno nuevo. El documento anterior se eliminará del sistema.

### ¿Puedo registrar interés en múltiples viviendas para un mismo cliente?
**Respuesta**: Sí, un cliente puede tener múltiples negociaciones activas en diferentes viviendas. Sin embargo, no puede tener dos negociaciones en la misma vivienda.

### ¿Cómo sé si un cliente ya existe en el sistema?
**Respuesta**: Al ingresar el número de documento, el sistema valida automáticamente. Si existe, mostrará un mensaje de error con la opción de buscar el cliente existente.

### ¿Qué hacer si el cliente no tiene email?
**Respuesta**: El email es obligatorio. Si el cliente no tiene, puedes crear uno temporal (ej: sin-email-[documento]@temp.com) y actualizarlo después.

---

## 📞 Soporte

**Contacto técnico**: soporte@ryrconstruccion.com
**Documentación técnica**: `/docs/technical/clientes/`
**Videos tutoriales**: [Pendiente]

---

## ✅ Checklist de Completitud

- [x] Propósito del módulo claro
- [x] Todas las funcionalidades documentadas
- [x] Validaciones de campos completas
- [x] Flujos de trabajo con diagramas
- [ ] Capturas de pantalla agregadas (pendiente)
- [x] Errores comunes documentados
- [x] Integraciones explicadas
- [x] Permisos definidos
- [x] Buenas prácticas incluidas
- [x] Preguntas frecuentes respondidas
- [x] Historial de cambios actualizado

---

**Última revisión**: 27 de Octubre, 2025
**Estado**: 🟡 En desarrollo (falta agregar screenshots)
