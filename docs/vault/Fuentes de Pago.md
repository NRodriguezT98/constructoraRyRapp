# 💳 Fuentes de Pago

> Configuración de financiamiento por negociación
> **Carga dinámica** desde BD (nunca hardcodeado)

---

## Relaciones

- Pertenece a → [[RyR Constructora]]
- Vinculada a → [[Negociaciones]]
- Recibe → [[Abonos]]
- Requiere → [[Requisitos de Fuentes]]
- Configurada desde → [[Configuración]]
- Genera → [[Documentos]] pendientes
- Registrado en → [[Auditorías]]

---

## Tipos de Fuentes (dinámicas)

Cargadas desde `tipos_fuentes_pago` (tabla BD):
- 💳 Cuota Inicial
- 🏦 Crédito Hipotecario  
- 🏗️ Crédito Constructora
- 📋 Subsidio
- ➕ Extensible sin código

---

## Estructura del Módulo

```
src/modules/fuentes-pago/
├── components/
├── hooks/
├── services/
│   ├── requisitos.service.ts
│   ├── validacion-desembolso.service.ts
│   ├── cuotas-credito.service.ts
│   └── creditos-constructora.service.ts
├── types/
├── config/
└── utils/
```

---

## Servicios (5)

| Servicio | Función |
|----------|---------|
| `requisitos.service.ts` | Requisitos por tipo de fuente |
| `validacion-desembolso.service.ts` | Validar condiciones de desembolso |
| `cuotas-credito.service.ts` | Cálculo de cuotas |
| `creditos-constructora.service.ts` | Créditos directos |

---

## Datos Clave

- **Tabla BD**: `fuentes_pago`
- **Campos**: id, negociacion_id, tipo_fuente, estado, monto
- **Estados**: `Activa` | `Inactiva`
- Tipos cargados desde `tipos_fuentes_pago` con `activo = true`
- Entidades desde [[Configuración]] (`entidades_financieras`)

---

## Regla Crítica

> ⚠️ NUNCA hardcodear array de fuentes. Siempre cargar con `cargarTiposFuentesPagoActivas()` desde [[Base de Datos]]

#módulo #financiero #fuentes-pago
