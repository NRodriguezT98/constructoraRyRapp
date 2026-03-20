# 💵 Abonos

> Registro de pagos, cuotas e instalamentos
> **Color tema**: 🔵 Azul / Índigo / Púrpura
> **Ruta**: `/abonos`

---

## Relaciones

- Pertenece a → [[RyR Constructora]]
- Aplica a → [[Fuentes de Pago]]
- Vinculado a → [[Negociaciones]]
- Asociado a → [[Clientes]]
- Genera → [[Documentos]] (comprobantes)
- Registrado en → [[Auditorías]]

---

## Estructura del Módulo

```
src/modules/abonos/
├── components/
├── hooks/
├── services/
│   ├── abonos.service.ts
│   └── abonos-storage.service.ts
├── styles/
├── types/
└── utils/
```

---

## Servicios (2)

| Servicio | Función |
|----------|---------|
| `abonos.service.ts` | CRUD de abonos en [[Supabase]] |
| `abonos-storage.service.ts` | Comprobantes en [[Storage]] |

---

## Datos Clave

- **Tabla BD**: `abonos`
- **Campos**: id, fuente_pago_id, monto, fecha_abono, estado
- Comprobantes almacenados en [[Storage]]

---

## Referencia

- Usa [[Sistema de Theming]] con `moduleName="abonos"`
- Parte del [[Flujo de Negociación]] (paso de pagos)

#módulo #financiero #abonos
