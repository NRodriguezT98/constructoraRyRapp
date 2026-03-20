# 👥 Clientes

> Gestión integral de clientes, datos personales e historial
> **Color tema**: 🔵 Cyan / Azul / Índigo
> **Ruta**: `/clientes` → `/clientes/[id]`

---

## Relaciones

- Pertenece a → [[RyR Constructora]]
- Participa en → [[Negociaciones]]
- Tiene → [[Documentos]]
- Configura → [[Fuentes de Pago]]
- Recibe → [[Abonos]]
- Registrado en → [[Auditorías]]

---

## Estructura del Módulo

```
src/modules/clientes/
├── components/
├── containers/
├── documentos/
│   └── store/documentos-cliente.store.ts  ← Zustand Store
├── hooks/
├── pages/
├── services/  (13 servicios)
│   ├── clientes.service.ts
│   ├── negociaciones.service.ts
│   ├── fuentes-pago.service.ts
│   ├── intereses.service.ts
│   ├── documentos-pendientes.service.ts
│   ├── pdf-negociacion.service.tsx
│   ├── negociaciones-versiones.service.ts
│   └── ... (+6 más)
├── store/
├── styles/
├── types/
├── utils/
└── constants/
```

---

## Servicios (13)

El módulo más grande del sistema con **13 servicios** que cubren:
- CRUD de clientes
- [[Negociaciones]] y versiones
- [[Fuentes de Pago]] y configuración
- [[Documentos]] pendientes
- Generación de PDFs
- Cálculo de intereses

---

## Datos Clave

- **Tabla BD**: `clientes`
- **Campos**: id, nombres, apellidos, cedula, telefono, email
- **Store [[Zustand Stores]]**: `documentos-cliente.store.ts`
- Sanitización obligatoria antes de guardar (ver [[Separación de Responsabilidades]])

---

## Referencia

- Usa [[Sistema de Theming]] con `moduleName="clientes"`
- Datos sanitizados con `sanitizeCrearClienteDTO()`
- Fechas con funciones de `date.utils.ts`

#módulo #core #clientes
