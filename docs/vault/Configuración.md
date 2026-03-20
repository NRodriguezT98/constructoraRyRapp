# ⚙️ Configuración

> Entidades financieras, tipos de fuentes y plantillas
> **Ruta**: `/admin/configuracion`

---

## Relaciones

- Pertenece a → [[RyR Constructora]]
- Gestionado por → [[Admin Panel]]
- Alimenta → [[Fuentes de Pago]]
- Define plantillas para → [[Requisitos de Fuentes]]

---

## Estructura

```
src/modules/configuracion/
├── components/
├── hooks/
├── services/
│   ├── tipos-fuentes-pago.service.ts
│   ├── entidades-financieras.service.ts
│   ├── plantillas-requisitos.service.ts
│   └── tipos-fuentes-campos.service.ts
└── types/
```

---

## Servicios (4)

| Servicio | Función |
|----------|---------|
| `tipos-fuentes-pago.service.ts` | Tipos de [[Fuentes de Pago]] |
| `entidades-financieras.service.ts` | Bancos/entidades |
| `plantillas-requisitos.service.ts` | Plantillas de [[Requisitos de Fuentes]] |
| `tipos-fuentes-campos.service.ts` | Campos dinámicos por tipo |

#módulo #admin #configuración
