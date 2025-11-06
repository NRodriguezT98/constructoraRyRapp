# 🔧 REFACTORIZACIÓN: Agregar Cleanup a useEffect

**Objetivo**: Eliminar race conditions y loading infinito en navegación rápida
**Archivos afectados**: 42 hooks con useEffect
**Prioridad**: 🔴 CRÍTICA

---

## 📋 **CHECKLIST DE REFACTORIZACIÓN**

### **HOOKS CON USEEFFECT (42 total)**

### **✅ COMPLETADOS (9/42)**
- [x] `src/modules/auditorias/hooks/useAuditorias.ts` (línea 235) ✅
- [x] `src/modules/proyectos/hooks/useProyectos.ts` (línea 21, 60) ✅
- [x] `src/modules/proyectos/hooks/useProyectoDetalle.ts` (línea 27, 64) ✅
- [x] `src/modules/clientes/hooks/useClientes.ts` (línea 264) ✅
- [x] `src/modules/abonos/hooks/useAbonos.ts` (línea 34, 44) ✅
- [x] `src/modules/usuarios/hooks/useUsuarios.ts` (línea 238) ✅

#### **✅ YA TENÍAN CLEANUP (2/42)**
- [x] `src/modules/viviendas/hooks/useViviendasList.ts` (línea 39) ✅
- [x] `src/modules/documentos/hooks/useDocumentosLista.ts` (línea 73) ✅

#### **🔴 CRÍTICOS - Carga inicial de datos (Prioridad 1)**
- [x] `src/modules/proyectos/hooks/useProyectos.ts` (línea 21, 60) ✅
- [x] `src/modules/viviendas/hooks/useViviendasList.ts` (línea 39) ✅ (ya tenía)
- [x] `src/modules/clientes/hooks/useClientes.ts` (línea 264) ✅
- [x] `src/modules/abonos/hooks/useAbonos.ts` (línea 34, 44) ✅
- [x] `src/modules/documentos/hooks/useDocumentosLista.ts` (línea 73) ✅ (ya tenía)
- [x] `src/modules/usuarios/hooks/useUsuarios.ts` (línea 238) ✅

#### **🟡 IMPORTANTES - Formularios y modales (Prioridad 2)**
- [x] `src/modules/proyectos/hooks/useProyectoDetalle.ts` (línea 27, 64) ✅
- [ ] `src/modules/viviendas/hooks/useNuevaVivienda.ts` (línea 110)
- [ ] `src/modules/clientes/hooks/useFormularioCliente.ts` (línea 50)
- [ ] `src/modules/clientes/hooks/useNegociacion.ts` (línea 80)
- [ ] `src/modules/configuracion/hooks/useConfiguracion.ts` (línea 103)

#### **🟢 SECUNDARIOS - Funcionalidad específica (Prioridad 3)**
- [ ] `src/modules/admin/procesos/hooks/useTimelineProceso.ts` (línea 59)
- [ ] `src/modules/admin/procesos/hooks/useProgresoCliente.ts` (línea 44)
- [ ] `src/modules/admin/procesos/hooks/useProcesoNegociacion.ts` (línea 549)
- [ ] `src/modules/admin/procesos/hooks/useGestionProcesos.ts` (línea 422)
- [ ] `src/modules/viviendas/hooks/useViviendaForm.ts` (línea 65)
- [ ] `src/modules/viviendas/hooks/useDocumentosVivienda.ts` (línea 36)
- [ ] `src/modules/proyectos/hooks/useProyectosForm.ts` (línea 94)
- [ ] `src/modules/procesos/hooks/usePermisosCorreccion.ts` (línea 71)
- [ ] `src/modules/documentos/hooks/useCategoriasManager.ts` (línea 34)
- [ ] `src/modules/documentos/hooks/useDocumentoCard.ts` (línea 27)
- [ ] `src/modules/clientes/components/modals/modal-crear-negociacion/hooks/useModalNegociacion.ts` (línea 89)
- [ ] `src/modules/clientes/components/modals/modal-crear-negociacion/hooks/useProyectosViviendas.ts` (línea 79, 91)
- [ ] `src/modules/clientes/pages/crear-negociacion/hooks/useCrearNegociacionPage.ts` (línea 159)
- [ ] `src/modules/clientes/hooks/useRegistrarInteres.ts` (línea 165, 170)
- [ ] `src/modules/clientes/hooks/useListaIntereses.ts` (línea 120, 140)
- [ ] `src/modules/clientes/documentos/hooks/useDocumentosListaCliente.ts` (línea 66)
- [ ] `src/modules/clientes/hooks/useInteresFormulario.ts` (línea 35, 60)
- [ ] `src/modules/clientes/documentos/hooks/useCategoriasCliente.ts` (línea 25)
- [ ] `src/modules/clientes/hooks/useConfigurarFuentesPago.ts` (línea 67, 74)
- [ ] `src/modules/clientes/hooks/useClienteCardActivo.ts` (línea 47)
- [ ] `src/modules/abonos/hooks/useValidacionBotonDesembolso.ts` (línea 45)

---

## 🎯 **PATRÓN DE REFACTORIZACIÓN**

### **ANTES (Problemático):**
```typescript
useEffect(() => {
  cargarDatos()           // ❌ Sin await, sin cleanup
  cargarEstadisticas()    // ❌ Puede ejecutarse después del unmount
}, [])
```

### **DESPUÉS (Correcto):**
```typescript
useEffect(() => {
  let cancelado = false  // ← Flag de cancelación

  const inicializar = async () => {
    try {
      await Promise.all([  // ← Esperar todas las promises
        cargarDatos(),
        cargarEstadisticas(),
      ])
    } catch (error) {
      if (!cancelado) {  // ← Solo loggear si NO cancelado
        console.error('[MODULO] Error:', error)
      }
    }
  }

  inicializar()

  return () => {
    cancelado = true  // ← Cleanup obligatorio
  }
}, [])
```

---

## 📝 **SCRIPTS DE REFACTORIZACIÓN POR PRIORIDAD**

### **🔴 Prioridad 1: Módulos principales**

#### **1. useProyectos.ts**
```powershell
code src/modules/proyectos/hooks/useProyectos.ts
```

Buscar línea 21 y 60, aplicar patrón de cleanup.

#### **2. useViviendasList.ts**
```powershell
code src/modules/viviendas/hooks/useViviendasList.ts
```

Buscar línea 39, aplicar patrón de cleanup.

#### **3. useClientes.ts**
```powershell
code src/modules/clientes/hooks/useClientes.ts
```

Buscar línea 264, aplicar patrón de cleanup.

#### **4. useAbonos.ts**
```powershell
code src/modules/abonos/hooks/useAbonos.ts
```

Buscar líneas 34 y 44, aplicar patrón de cleanup.

---

## 🧪 **VALIDACIÓN POST-REFACTORIZACIÓN**

Después de cada cambio, ejecutar:

```powershell
# 1. Verificar compilación
npm run build

# 2. Verificar tipos
npm run type-check

# 3. Test manual de navegación rápida
npm run dev
# Navegar: Dashboard → Proyectos → Viviendas → Clientes → Abonos (x10)
```

---

## 📊 **PROGRESO**

| Prioridad | Completados | Pendientes | %     |
|-----------|-------------|----------|-------|
| P1 (Crítico) | 8 | 0 | 100%   |
| P2 (Importante) | 1 | 4 | 20%    |
| P3 (Secundario) | 0 | 29 | 0%    |
| **TOTAL** | **9** | **33** | **21%** |

---

## 🎖️ **BENEFICIOS ESPERADOS**

✅ **Eliminación de loading infinito** (100% → 0%)
✅ **Reducción de errores setState** (15/sesión → 0)
✅ **Mejor experiencia en desarrollo** (fluida)
✅ **Prevención de memory leaks**
✅ **Código más robusto y mantenible**

---

## 📚 **REFERENCIAS**

- **Solución completa**: `docs/SOLUCION-LOADING-INFINITO-DEV.md`
- **React Docs**: [Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects)
- **Next.js Docs**: [Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)

---

**Última actualización**: 6 de Noviembre 2025
**Próxima revisión**: Después de completar P1 (Prioridad 1)
