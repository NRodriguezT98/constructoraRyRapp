# 📋 ANÁLISIS: Control de Cédula del Cliente

**Fecha**: 20 de octubre de 2025

---

## 🔍 COMPARACIÓN DETALLADA

### OPCIÓN A: Cédula OBLIGATORIA en formulario de crear cliente

#### ✅ **Ventajas**
1. **Control absoluto**: Imposible crear cliente sin cédula
2. **Cero fricción posterior**: No hay que recordar subirla después
3. **Base de datos limpia**: Todos los clientes tienen `documento_identidad_url`
4. **Menos código**: No necesitas validaciones posteriores
5. **UX clara**: Un solo formulario, un solo paso

#### ❌ **Desventajas**
1. **Menos flexible**: Si no tienen cédula escaneada, deben esperar
2. **Puede ralentizar**: El primer contacto con el cliente puede tardar

#### 🛠️ **Implementación**
```tsx
// En formulario de crear cliente
<div>
  <label>
    Documento de Identidad (Cédula) *
  </label>
  <input
    type="file"
    accept=".pdf,.jpg,.jpeg,.png"
    required
    onChange={handleFileChange}
  />
  {!archivoSeleccionado && (
    <p className="text-red-500 text-xs">
      Debes seleccionar el archivo de la cédula
    </p>
  )}
</div>

// Botón crear deshabilitado hasta tener archivo
<Button
  disabled={!archivoSeleccionado || guardando}
  onClick={crearCliente}
>
  Crear Cliente
</Button>
```

---

### OPCIÓN B: Cédula OPCIONAL al crear + Sistema de Control Post-Creación

#### ✅ **Ventajas**
1. **Más flexible**: Crean cliente rápido sin tener la cédula
2. **Captura inicial rápida**: Registran datos básicos de inmediato
3. **Flujo natural**: Primero datos, luego documentos

#### ❌ **Desventajas**
1. **Base de datos inconsistente**: Algunos clientes SIN cédula
2. **Requiere sistema de control**: Más código, más complejidad
3. **Usuario puede olvidar**: Necesitas recordatorios constantes

#### 🛠️ **Sistema de Control Requerido**

##### **1. Estado Visual del Cliente**
```tsx
// En tarjeta de cliente (lista de clientes)
<ClienteCard>
  <div className="flex items-center gap-2">
    <Avatar />
    <div>
      <h3>{cliente.nombre_completo}</h3>
      <div className="flex gap-2">
        {!cliente.documento_identidad_url && (
          <Badge variant="warning">
            ⚠️ Falta cédula
          </Badge>
        )}
      </div>
    </div>
  </div>
</ClienteCard>
```

##### **2. Banner en Detalle del Cliente**
```tsx
// En página de detalle del cliente
{!cliente.documento_identidad_url && (
  <Alert variant="warning" className="mb-4">
    <AlertCircle className="h-4 w-4" />
    <div className="flex-1">
      <AlertTitle>Documento de identidad pendiente</AlertTitle>
      <AlertDescription>
        Para crear negociaciones, debes subir la cédula del cliente
      </AlertDescription>
    </div>
    <Button onClick={abrirModalSubirCedula}>
      Subir Cédula Ahora
    </Button>
  </Alert>
)}
```

##### **3. Validación al Intentar Crear Negociación**
```tsx
// Al hacer click en "Crear Negociación"
const handleCrearNegociacion = () => {
  if (!cliente.documento_identidad_url) {
    // Mostrar modal explicativo
    setModalCedulaFaltante(true)
    return
  }

  // Abrir wizard de negociación
  setModalWizard(true)
}

// Modal que se muestra
<Modal open={modalCedulaFaltante}>
  <ModalHeader>
    <AlertCircle className="h-12 w-12 text-amber-500" />
    <h2>Documento de Identidad Requerido</h2>
  </ModalHeader>
  <ModalBody>
    <p>
      Para crear una negociación, primero debes subir
      la cédula del cliente.
    </p>
    <div className="mt-4 rounded-lg border-2 border-dashed p-4">
      <input
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={subirCedula}
      />
    </div>
  </ModalBody>
  <ModalFooter>
    <Button variant="outline" onClick={cerrar}>
      Cancelar
    </Button>
    <Button onClick={subirYContinuar}>
      Subir y Continuar
    </Button>
  </ModalFooter>
</Modal>
```

##### **4. Lista de Clientes Pendientes (Dashboard)**
```tsx
// En vista de /clientes
<DashboardCard>
  <CardHeader>
    <AlertCircle className="text-amber-500" />
    <h3>Clientes con Documentos Pendientes</h3>
    <Badge>{clientesSinCedula.length}</Badge>
  </CardHeader>
  <CardBody>
    {clientesSinCedula.map(cliente => (
      <div key={cliente.id} className="flex justify-between items-center p-2">
        <span>{cliente.nombre_completo}</span>
        <Button
          size="sm"
          onClick={() => irASubirCedula(cliente.id)}
        >
          Subir Cédula
        </Button>
      </div>
    ))}
  </CardBody>
</DashboardCard>
```

##### **5. Botón "Crear Negociación" Condicional**
```tsx
// En header de detalle del cliente
{cliente.documento_identidad_url ? (
  <Button onClick={abrirWizardNegociacion}>
    <Handshake className="h-4 w-4 mr-2" />
    Crear Negociación
  </Button>
) : (
  <Tooltip content="Primero debes subir la cédula del cliente">
    <Button disabled variant="ghost">
      <Handshake className="h-4 w-4 mr-2" />
      Crear Negociación
    </Button>
  </Tooltip>
)}
```

##### **6. Modal Dedicado para Subir Cédula**
```tsx
// Componente reutilizable
<ModalSubirCedula
  clienteId={clienteId}
  onSuccess={() => {
    recargarCliente()
    toast.success('Cédula subida correctamente')
  }}
/>

// Contenido del modal
<Modal>
  <ModalHeader>
    Subir Documento de Identidad
  </ModalHeader>
  <ModalBody>
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Sube una foto clara de la cédula del cliente (ambos lados)
      </p>

      <div className="border-2 border-dashed rounded-lg p-6 text-center">
        {archivo ? (
          <div>
            <FileCheck className="h-12 w-12 mx-auto text-green-500" />
            <p className="mt-2">{archivo.name}</p>
            <Button
              variant="link"
              onClick={() => setArchivo(null)}
            >
              Cambiar archivo
            </Button>
          </div>
        ) : (
          <label className="cursor-pointer">
            <Upload className="h-12 w-12 mx-auto text-gray-400" />
            <p className="mt-2">Click para seleccionar archivo</p>
            <p className="text-xs text-gray-500">
              PDF, JPG o PNG (máx. 5MB)
            </p>
            <input
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileSelect}
            />
          </label>
        )}
      </div>
    </div>
  </ModalBody>
  <ModalFooter>
    <Button variant="outline" onClick={onClose}>
      Cancelar
    </Button>
    <Button
      onClick={subirArchivo}
      disabled={!archivo || subiendo}
    >
      {subiendo ? 'Subiendo...' : 'Subir Cédula'}
    </Button>
  </ModalFooter>
</Modal>
```

---

## 🎯 MI RECOMENDACIÓN DEFINITIVA

### **OPCIÓN B con Sistema de Control Robusto** ⭐

**¿Por qué?**

1. **Flujo más natural del negocio real**:
   - Llega cliente → Toman datos básicos → Lo registran
   - Luego piden documentos, toman foto, suben
   - Es más realista que tener TODO en un solo momento

2. **Flexibilidad sin perder control**:
   - Pueden registrar cliente rápido (nombre, teléfono, email)
   - Sistema les recuerda constantemente subir la cédula
   - BLOQUEA crear negociación hasta tener la cédula

3. **UX superior**:
   - No frustran al usuario si no tienen cédula en ese momento
   - Banner visible les recuerda qué falta
   - Dashboard muestra clientes pendientes
   - Un click para subir desde múltiples lugares

4. **Control estricto donde importa**:
   - **NO pueden crear negociación sin cédula** (validación férrea)
   - Pero sí pueden tener el cliente registrado (datos básicos)

---

## 📊 IMPLEMENTACIÓN PROPUESTA

### **Fase 1: Formulario de Cliente (SIN cédula obligatoria)**
```tsx
// Campo de cédula OPCIONAL
<div>
  <label>
    Documento de Identidad (Cédula)
    <span className="text-gray-500 text-xs ml-2">(Opcional - puedes subirlo después)</span>
  </label>
  <input
    type="file"
    accept=".pdf,.jpg,.jpeg,.png"
    onChange={handleFileChange}
  />
  <p className="text-xs text-gray-500 mt-1">
    Si no tienes la cédula ahora, podrás subirla después antes de crear una negociación
  </p>
</div>
```

### **Fase 2: Sistema de Alertas y Control**

#### A. Banner en Detalle del Cliente
```tsx
{!cliente.documento_identidad_url && (
  <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-4 mb-6">
    <div className="flex items-start gap-3">
      <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
      <div className="flex-1">
        <h3 className="font-semibold text-amber-900">
          Documento de Identidad Pendiente
        </h3>
        <p className="text-sm text-amber-700 mt-1">
          Necesitas subir la cédula del cliente antes de poder crear una negociación
        </p>
      </div>
      <Button
        onClick={() => setModalSubirCedula(true)}
        className="bg-amber-600 hover:bg-amber-700"
      >
        Subir Ahora
      </Button>
    </div>
  </div>
)}
```

#### B. Badge en Lista de Clientes
```tsx
<div className="flex items-center gap-2">
  <span>{cliente.nombre_completo}</span>
  {!cliente.documento_identidad_url && (
    <Badge variant="warning" className="text-xs">
      ⚠️ Sin cédula
    </Badge>
  )}
</div>
```

#### C. Validación Férrea al Crear Negociación
```tsx
const handleClickCrearNegociacion = async () => {
  // BLOQUEO ABSOLUTO
  if (!cliente.documento_identidad_url) {
    setShowModalCedulaRequerida(true)
    return
  }

  // Si tiene cédula, continúa al wizard
  setShowWizardNegociacion(true)
}
```

#### D. Dashboard de Pendientes
```tsx
// En /clientes
<Card>
  <CardHeader>
    <div className="flex items-center justify-between">
      <h3>Documentos Pendientes</h3>
      <Badge>{clientesSinCedula.length}</Badge>
    </div>
  </CardHeader>
  <CardBody>
    {clientesSinCedula.length === 0 ? (
      <div className="text-center py-4 text-gray-500">
        <CheckCircle className="h-12 w-12 mx-auto mb-2" />
        <p>¡Todos los clientes tienen su cédula!</p>
      </div>
    ) : (
      <div className="space-y-2">
        {clientesSinCedula.map(cliente => (
          <div
            key={cliente.id}
            className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50"
          >
            <div>
              <p className="font-medium">{cliente.nombre_completo}</p>
              <p className="text-xs text-gray-500">{cliente.telefono}</p>
            </div>
            <Button
              size="sm"
              onClick={() => router.push(`/clientes/${cliente.id}`)}
            >
              Subir Cédula
            </Button>
          </div>
        ))}
      </div>
    )}
  </CardBody>
</Card>
```

---

## ✅ RESUMEN DE CONTROLES

Con OPCIÓN B implementas:

1. ✅ **Banner destacado** en detalle del cliente (no se puede ignorar)
2. ✅ **Badge visual** en lista de clientes (identificación rápida)
3. ✅ **Bloqueo absoluto** al intentar crear negociación
4. ✅ **Modal dedicado** para subir cédula desde múltiples lugares
5. ✅ **Dashboard de pendientes** (vista de todos los clientes sin cédula)
6. ✅ **Botón deshabilitado** (si no tiene cédula, botón de negociación está gris)

**Resultado**: Sistema flexible PERO con control férreo donde importa (negociaciones)

---

## 🚀 PLAN DE IMPLEMENTACIÓN

Si eliges OPCIÓN B, implemento en este orden:

1. **HOY** (2 horas):
   - Modal `ModalSubirCedula` reutilizable
   - Banner en detalle del cliente
   - Validación en botón "Crear Negociación"

2. **MAÑANA** (1 hora):
   - Badge en lista de clientes
   - Dashboard de pendientes
   - Botón condicional (habilitado/deshabilitado)

---

## ❓ DECISIÓN FINAL

**¿Vamos con OPCIÓN B (flexible + control robusto)?**

Si dices que sí, empiezo ahora mismo con el Modal y el Banner 🚀
