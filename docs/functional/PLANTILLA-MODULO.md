# 📋 PLANTILLA - Documentación de Módulo

> **Instrucciones**: Copia esta plantilla para cada módulo nuevo y completa las secciones mientras desarrollas.

---

## 📌 Información General

**Módulo**: [Nombre del módulo]
**Versión**: 1.0
**Última actualización**: [Fecha]
**Responsable**: [Tu nombre]

---

## 🎯 Propósito

### ¿Qué hace este módulo?
[Descripción breve en 2-3 líneas del objetivo principal]

**Ejemplo**:
> El módulo de Clientes permite gestionar toda la información de los clientes potenciales y activos, desde su registro inicial hasta el seguimiento de sus intereses en viviendas.

### ¿Quién lo usa?
- [ ] Administrador
- [ ] Vendedor
- [ ] Gerente
- [ ] Cliente (portal)
- [ ] Otro: _______

---

## 🔑 Funcionalidades Principales

### 1. [Funcionalidad 1]
**Descripción**: [Qué hace]
**Acceso**: [Menú → Submenu → Acción]
**Permisos requeridos**: [Rol necesario]

**Pasos**:
1. [Paso 1]
2. [Paso 2]
3. [Paso 3]

**Resultado esperado**: [Qué sucede al completar]

---

### 2. [Funcionalidad 2]
**Descripción**: [Qué hace]
**Acceso**: [Ruta de navegación]
**Permisos requeridos**: [Rol necesario]

**Pasos**:
1. [Paso 1]
2. [Paso 2]

---

## 📊 Campos y Validaciones

### Formulario: [Nombre del formulario]

| Campo | Tipo | Obligatorio | Validaciones | Ejemplo |
|-------|------|-------------|--------------|---------|
| Nombre completo | Texto | ✅ Sí | Min 3 caracteres, solo letras | "Juan Pérez" |
| Email | Email | ✅ Sí | Formato email válido | "juan@example.com" |
| Teléfono | Número | ❌ No | 10 dígitos | "3001234567" |
| Tipo de cliente | Select | ✅ Sí | Natural/Jurídico | "Natural" |

### Reglas de Negocio

1. **Validación de duplicados**
   - **Regla**: No se permite crear clientes con el mismo número de documento
   - **Mensaje de error**: "Ya existe un cliente registrado con este documento"
   - **Acción correctiva**: Buscar cliente existente antes de crear uno nuevo

2. **[Otra regla]**
   - **Regla**: [Descripción]
   - **Mensaje de error**: [Texto del error]
   - **Acción correctiva**: [Qué hacer]

---

## 🔄 Flujos de Trabajo

### Flujo 1: [Nombre del flujo completo]

```
┌─────────────────┐
│  Inicio         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ [Paso 1]        │ → [Descripción breve]
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ [Paso 2]        │ → [Descripción breve]
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Fin            │
└─────────────────┘
```

**Descripción detallada**:
1. **[Paso 1]**: [Explicación de qué sucede, qué validaciones se ejecutan]
2. **[Paso 2]**: [Explicación]
3. **[Paso 3]**: [Explicación]

---

## 🎨 Capturas de Pantalla

### Vista Principal
![Vista principal](../../screenshots/[modulo]/vista-principal.png)
> **Descripción**: [Qué muestra esta pantalla]

### Formulario de Creación
![Formulario](../../screenshots/[modulo]/formulario-crear.png)
> **Descripción**: [Campos que se muestran]

### Modal de Confirmación
![Modal](../../screenshots/[modulo]/modal-confirmacion.png)
> **Descripción**: [Cuándo aparece y qué opciones tiene]

---

## ⚠️ Validaciones y Errores Comunes

### Error 1: [Nombre del error]
**Cuándo ocurre**: [Situación que causa el error]
**Mensaje**: "Texto exacto del error"
**Solución**:
1. [Paso para resolver]
2. [Otro paso]

**Captura**:
![Error](../../screenshots/[modulo]/error-ejemplo.png)

---

### Error 2: [Otro error]
**Cuándo ocurre**: [Descripción]
**Mensaje**: "Texto del error"
**Solución**: [Pasos]

---

## 🔗 Integraciones con Otros Módulos

### Módulo: [Nombre del módulo relacionado]
**Relación**: [Cómo se conectan]
**Datos compartidos**: [Qué información se comparte]

**Ejemplo**:
- Un **Cliente** puede tener múltiples **Negociaciones** (módulo Negociaciones)
- Una **Negociación** está asociada a una **Vivienda** (módulo Viviendas)

---

## 📈 Reportes y Consultas

### Reporte 1: [Nombre del reporte]
**Descripción**: [Qué información muestra]
**Filtros disponibles**:
- [ ] Por fecha
- [ ] Por estado
- [ ] Por proyecto
- [ ] Otro: _______

**Formato de exportación**:
- [ ] PDF
- [ ] Excel
- [ ] CSV

---

## 🔐 Permisos y Roles

| Acción | Administrador | Vendedor | Gerente | Cliente |
|--------|--------------|----------|---------|---------|
| Ver lista | ✅ | ✅ | ✅ | ❌ |
| Crear nuevo | ✅ | ✅ | ❌ | ❌ |
| Editar | ✅ | ✅ | ✅ | ❌ |
| Eliminar | ✅ | ❌ | ❌ | ❌ |
| Exportar | ✅ | ✅ | ✅ | ❌ |

---

## 💡 Buenas Prácticas

### Recomendaciones de Uso

1. **[Práctica 1]**
   - **Qué hacer**: [Descripción]
   - **Por qué**: [Razón]
   - **Ejemplo**: [Caso práctico]

2. **[Práctica 2]**
   - **Qué hacer**: [Descripción]
   - **Por qué**: [Razón]

### Errores Comunes a Evitar

❌ **No hacer**: [Acción incorrecta]
✅ **Hacer**: [Acción correcta]
📝 **Razón**: [Por qué]

---

## 📝 Notas Técnicas (Para Desarrolladores)

**Componentes principales**:
- `[NombreComponente.tsx]` - [Descripción]
- `[OtroComponente.tsx]` - [Descripción]

**Hooks personalizados**:
- `use[Nombre]` - [Qué hace]

**Servicios**:
- `[nombre].service.ts` - [Endpoints que consume]

**Validaciones Zod**:
```typescript
// Ejemplo de schema de validación
const schema = z.object({
  campo: z.string().min(3)
})
```

---

## 🔄 Historial de Cambios

| Versión | Fecha | Cambios | Autor |
|---------|-------|---------|-------|
| 1.0 | [Fecha] | Versión inicial | [Nombre] |
| 1.1 | [Fecha] | Agregado [funcionalidad] | [Nombre] |

---

## ❓ Preguntas Frecuentes

### ¿[Pregunta 1]?
**Respuesta**: [Explicación clara y concisa]

### ¿[Pregunta 2]?
**Respuesta**: [Explicación]

---

## 📞 Soporte

**Contacto técnico**: [Email o canal]
**Documentación adicional**: [Enlaces]
**Videos tutoriales**: [Enlaces]

---

## ✅ Checklist de Completitud

Usa este checklist para verificar que la documentación está completa:

- [ ] Propósito del módulo claro
- [ ] Todas las funcionalidades documentadas
- [ ] Validaciones de campos completas
- [ ] Flujos de trabajo con diagramas
- [ ] Capturas de pantalla agregadas
- [ ] Errores comunes documentados
- [ ] Integraciones explicadas
- [ ] Permisos definidos
- [ ] Buenas prácticas incluidas
- [ ] Preguntas frecuentes respondidas
- [ ] Historial de cambios actualizado

---

**Última revisión**: [Fecha]
**Estado**: 🟡 En desarrollo / 🟢 Completo / 🔴 Desactualizado
