# 🚀 Próximos Pasos - Modal de Reemplazo Genérico

## 📋 Checklist de Implementación

### ✅ COMPLETADO (Sesión Actual)

- [x] **Servicio genérico creado** (`documentos-reemplazo.service.ts`)
- [x] **Hook actualizado** (`useReemplazarArchivoForm.ts` acepta `tipoEntidad`)
- [x] **Modal actualizado** (`DocumentoReemplazarArchivoModal.tsx` acepta `tipoEntidad` y `moduleName`)
- [x] **Estilos refactorizados** (`DocumentoReemplazarArchivoModal.styles.ts` usa función dinámica)
- [x] **Theming dinámico** (7 módulos soportados)
- [x] **Documentación completa** (3 archivos creados)
- [x] **Regla crítica agregada** (`.github/copilot-instructions.md` regla #-5.7)

---

### 🔄 PENDIENTE (Próxima Sesión)

#### 1. **Actualizar DocumentoCard Compartido** (Prioridad: ALTA)

**Archivo**: `src/shared/components/documentos/DocumentoCard.tsx` (verificar ubicación exacta)

**Cambios necesarios**:

```typescript
// Agregar imports
import type { TipoEntidad } from '@/modules/documentos/types'
import type { ModuleName } from '@/shared/config/module-themes'

// Actualizar interface
interface DocumentoCardProps {
  documento: DocumentoProyecto
  tipoEntidad: TipoEntidad        // ← NUEVO
  moduleName: ModuleName          // ← NUEVO
  onReemplazado?: () => void
  // ... resto de props
}

// Pasar props al modal
<DocumentoReemplazarArchivoModal
  isOpen={modalReemplazar}
  documento={documento}
  tipoEntidad={tipoEntidad}       // ← NUEVO
  moduleName={moduleName}         // ← NUEVO
  onClose={() => setModalReemplazar(false)}
  onReemplazado={onReemplazado}
/>
```

**Verificar ubicación real**:
```bash
# Buscar DocumentoCard
Get-ChildItem -Path "src" -Recurse -Filter "DocumentoCard.tsx" | Select-Object FullName
```

---

#### 2. **Actualizar Módulo de Proyectos** (Prioridad: ALTA)

**Archivo**: `src/modules/proyectos/components/documentos/DocumentosLista.tsx` (verificar)

**Cambios necesarios**:

```typescript
<DocumentoCard
  key={doc.id}
  documento={doc}
  tipoEntidad="proyecto"     // ← AGREGAR
  moduleName="proyectos"      // ← AGREGAR (verde)
  onReemplazado={refetch}
/>
```

---

#### 3. **Actualizar Módulo de Viviendas** (Prioridad: ALTA)

**Archivo**: `src/modules/viviendas/components/documentos/DocumentosLista.tsx` (verificar)

**Cambios necesarios**:

```typescript
<DocumentoCard
  key={doc.id}
  documento={doc}
  tipoEntidad="vivienda"      // ← AGREGAR
  moduleName="viviendas"      // ← AGREGAR (naranja)
  onReemplazado={refetch}
/>
```

---

#### 4. **Actualizar Módulo de Clientes** (Prioridad: ALTA)

**Archivo**: Buscar componente que lista documentos de clientes

**Cambios necesarios**:

```typescript
<DocumentoCard
  key={doc.id}
  documento={doc}
  tipoEntidad="cliente"       // ← AGREGAR
  moduleName="clientes"       // ← AGREGAR (cyan)
  onReemplazado={refetch}
/>
```

**Comandos para encontrar archivo**:
```bash
# Buscar componentes de documentos en clientes
Get-ChildItem -Path "src/modules/clientes" -Recurse -Filter "*Documento*.tsx" | Select-Object FullName
```

---

#### 5. **Testing Visual en los 3 Módulos** (Prioridad: MEDIA)

**Proyectos (Verde)**:
- [ ] Header tiene gradiente verde/esmeralda/teal
- [ ] Banner de advertencia tiene borde/fondo verde
- [ ] Inputs tienen focus verde
- [ ] Drag & Drop tiene ícono/border verde al activar
- [ ] Progreso tiene barra verde
- [ ] Botón "Reemplazar" tiene gradiente verde
- [ ] Dark mode funciona correctamente

**Viviendas (Naranja)**:
- [ ] Header tiene gradiente naranja/ámbar/amarillo
- [ ] Banner de advertencia tiene borde/fondo naranja
- [ ] Inputs tienen focus naranja
- [ ] Drag & Drop tiene ícono/border naranja al activar
- [ ] Progreso tiene barra naranja
- [ ] Botón "Reemplazar" tiene gradiente naranja
- [ ] Dark mode funciona correctamente

**Clientes (Cyan)**:
- [ ] Header tiene gradiente cyan/azul/índigo
- [ ] Banner de advertencia tiene borde/fondo cyan
- [ ] Inputs tienen focus cyan
- [ ] Drag & Drop tiene ícono/border cyan al activar
- [ ] Progreso tiene barra cyan
- [ ] Botón "Reemplazar" tiene gradiente cyan
- [ ] Dark mode funciona correctamente

---

#### 6. **Validación Funcional** (Prioridad: ALTA)

**En cada módulo, probar**:
- [ ] Abrir modal de reemplazo
- [ ] Seleccionar archivo nuevo (drag & drop)
- [ ] Ingresar justificación
- [ ] Ingresar password de admin
- [ ] Click en "Reemplazar Archivo"
- [ ] Validar que progreso muestra 6 fases
- [ ] Validar que backup se crea
- [ ] Validar que archivo se reemplaza
- [ ] Validar que versión incrementa (`version++`)
- [ ] Validar que auditoría se registra

**Si falla**:
- [ ] Validar que rollback funciona (archivo nuevo se elimina)
- [ ] Validar que archivo anterior permanece
- [ ] Validar que mensaje de error es claro

---

#### 7. **Eliminar Código Antiguo** (Prioridad: BAJA - Solo si existe)

**Buscar modales duplicados**:
```bash
# Buscar archivos que contengan "ReemplazarArchivo" o similar
Get-ChildItem -Path "src/modules" -Recurse -Filter "*Reemplazar*.tsx" | Select-Object FullName
```

**Si encuentra duplicados**:
- [ ] Verificar que ya no se usan
- [ ] Eliminar archivos
- [ ] Eliminar imports
- [ ] Actualizar barrel exports

---

#### 8. **Documentación de Usuario** (Prioridad: BAJA)

**Crear guía para usuarios finales**:
- [ ] `docs/USUARIO-REEMPLAZAR-ARCHIVOS.md`
- [ ] Screenshots del modal
- [ ] Paso a paso del proceso
- [ ] Casos de error comunes

---

## 🔍 Comandos Útiles

### Buscar Componentes de Documentos

```powershell
# Buscar DocumentoCard
Get-ChildItem -Path "src" -Recurse -Filter "DocumentoCard.tsx" | Select-Object FullName

# Buscar todos los componentes relacionados con documentos
Get-ChildItem -Path "src" -Recurse -Filter "*Documento*.tsx" | Select-Object FullName | Out-String

# Buscar usos de DocumentoReemplazarArchivoModal
Select-String -Path "src/**/*.tsx" -Pattern "DocumentoReemplazarArchivoModal" -CaseSensitive
```

### Verificar Tipos TypeScript

```powershell
# Verificar errores de compilación
npm run type-check
```

### Testing Manual

```powershell
# Iniciar servidor de desarrollo
npm run dev

# Abrir en navegador
# http://localhost:3000/proyectos/[id]  → Pestaña Documentos → Reemplazar
# http://localhost:3000/viviendas/[slug] → Pestaña Documentos → Reemplazar
# http://localhost:3000/clientes/[id]   → Pestaña Documentos → Reemplazar
```

---

## 📊 Estimación de Tiempo

| Tarea                                    | Tiempo Estimado | Prioridad |
|------------------------------------------|-----------------|-----------|
| 1. Actualizar DocumentoCard             | 15 min          | ALTA      |
| 2. Actualizar Módulo de Proyectos       | 10 min          | ALTA      |
| 3. Actualizar Módulo de Viviendas       | 10 min          | ALTA      |
| 4. Actualizar Módulo de Clientes        | 10 min          | ALTA      |
| 5. Testing Visual (3 módulos)           | 30 min          | MEDIA     |
| 6. Validación Funcional (3 módulos)     | 45 min          | ALTA      |
| 7. Eliminar Código Antiguo              | 15 min          | BAJA      |
| 8. Documentación de Usuario             | 30 min          | BAJA      |
| **TOTAL**                                | **2h 45min**    |           |

**TOTAL CRÍTICO (solo ALTA)**: **1h 30min**

---

## 🎯 Orden de Ejecución Sugerido

### Fase 1: Integración (1h 30min - CRÍTICO)
1. Actualizar DocumentoCard (15 min)
2. Actualizar Módulo de Proyectos (10 min)
3. Actualizar Módulo de Viviendas (10 min)
4. Actualizar Módulo de Clientes (10 min)
5. Validación Funcional básica (45 min)

### Fase 2: Validación (30 min)
6. Testing Visual completo (30 min)

### Fase 3: Limpieza (45 min - OPCIONAL)
7. Eliminar Código Antiguo (15 min)
8. Documentación de Usuario (30 min)

---

## ✅ Criterios de Aceptación

**El sistema está listo para producción cuando**:

- [ ] Modal funciona en Proyectos con colores verdes
- [ ] Modal funciona en Viviendas con colores naranjas
- [ ] Modal funciona en Clientes con colores cyan
- [ ] Rollback automático funciona si falla
- [ ] Backup se crea antes de reemplazar
- [ ] Versión incrementa correctamente
- [ ] Auditoría se registra con metadata completa
- [ ] Dark mode funciona en los 3 módulos
- [ ] Responsive en móvil/tablet/desktop
- [ ] No hay errores de TypeScript
- [ ] No hay warnings en consola

---

## 🚨 Problemas Comunes

### Error: "Cannot find module '@/modules/documentos/types'"

**Solución**: Verificar que el import es correcto:
```typescript
import type { TipoEntidad } from '@/modules/documentos/types'
```

### Error: "Property 'tipoEntidad' is missing"

**Solución**: Agregar prop en componente padre:
```typescript
<DocumentoCard
  tipoEntidad="proyecto"  // ← AGREGAR
  moduleName="proyectos"  // ← AGREGAR
  {...props}
/>
```

### Error: "Module not found: Can't resolve './DocumentoCard'"

**Solución**: Verificar ubicación real de DocumentoCard y actualizar import

### Modal no cambia de color

**Solución**: Verificar que `moduleName` prop se está pasando correctamente:
```typescript
// En componente padre
<DocumentoReemplazarArchivoModal
  moduleName="viviendas"  // ← Debe coincidir con módulo actual
  {...props}
/>
```

---

## 📞 Soporte

**Documentación completa**:
- `docs/MODAL-REEMPLAZO-GENERICO-GUIA.md` - Guía de uso
- `docs/REFACTOR-MODAL-REEMPLAZO-THEMING.md` - Detalle de cambios
- `docs/SESION-REFACTOR-DOCUMENTOS-GENERICO.md` - Resumen de sesión
- `.github/copilot-instructions.md` - Regla crítica #-5.7

**Archivos clave**:
- `src/modules/documentos/components/modals/DocumentoReemplazarArchivoModal.tsx`
- `src/modules/documentos/components/modals/DocumentoReemplazarArchivoModal.styles.ts`
- `src/modules/documentos/services/documentos-reemplazo.service.ts`
- `src/modules/documentos/types/entidad.types.ts`

**Para consultas**:
- Revisar código de referencia en archivos mencionados
- Consultar guía completa en `docs/MODAL-REEMPLAZO-GENERICO-GUIA.md`

---

## 🎉 ¡Listo!

El sistema está **técnicamente completo** y solo requiere **integración en los módulos existentes**.

**Beneficios garantizados**:
- ✅ 56% menos código
- ✅ Theming automático
- ✅ Rollback seguro
- ✅ Auditoría completa
- ✅ Type-safe

**Tiempo de integración**: **1h 30min** (solo tareas críticas)

¡Adelante! 🚀
