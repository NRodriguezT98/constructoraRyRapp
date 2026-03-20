# 📋 Negociaciones

> Acuerdos comerciales entre [[Clientes]] y [[Viviendas]]
> **Color tema**: 🟣 Rosa / Púrpura / Índigo
> **Ruta**: Dentro de `/clientes/[id]` (pestaña)

---

## Relaciones

- Pertenece a → [[RyR Constructora]]
- Vincula → [[Clientes]] ↔ [[Viviendas]]
- Financiada por → [[Fuentes de Pago]]
- Genera → [[Documentos]]
- Requiere → [[Requisitos de Fuentes]]
- Registrado en → [[Auditorías]]
- Parte del → [[Flujo de Negociación]]

---

## Estructura

```
src/modules/negociaciones/
└── components/          ← Componentes UI de negociación

src/modules/clientes/services/
├── negociaciones.service.ts
└── negociaciones-versiones.service.ts
```

> Nota: La lógica de negociaciones vive mayormente en el módulo de [[Clientes]]

---

## Estados de Negociación

| Estado | Descripción |
|--------|-------------|
| `Activa` | Negociación en curso |
| `Inactiva` | Cancelada o suspendida |

---

## Datos Clave

- **Tabla BD**: `negociaciones`
- **Campos**: id, cliente_id, vivienda_id, estado, valor_negociacion
- Cada negociación tiene múltiples [[Fuentes de Pago]]
- Versionado automático de cambios

---

## Flujo

Ver [[Flujo de Negociación]] para el proceso completo.

#módulo #financiero #negociaciones
