-- ===================================
-- PLANTILLA PREDETERMINADA DE PROCESO
-- ===================================
-- Inserta la plantilla con los 17 pasos del proceso de RyR Constructora
-- Desde separación hasta entrega final de vivienda
--
-- Uso: Ejecutar en Supabase SQL Editor
-- ===================================

INSERT INTO plantillas_proceso (
  nombre,
  descripcion,
  pasos,
  activo,
  es_predeterminado
) VALUES (
  'Proceso Estándar RyR 2025',
  'Proceso completo desde separación hasta entrega de vivienda, con todos los pasos obligatorios y condicionales según fuentes de pago del cliente.',
  '[
    {
      "id": "paso_01",
      "orden": 1,
      "nombre": "Envío de promesa de compraventa a firmar por cliente",
      "descripcion": "Enviar al cliente la promesa de compraventa pendiente de firma",
      "obligatorio": true,
      "permiteOmitir": false,
      "condiciones": {
        "fuentesPagoRequeridas": [],
        "dependeDe": [],
        "diasMinimoDespuesDe": null
      },
      "documentos": [
        {
          "id": "doc_01_01",
          "nombre": "Promesa de compraventa pendiente por firmar",
          "descripcion": "Documento de promesa sin firmar",
          "obligatorio": true,
          "tiposArchivo": ["application/pdf"]
        },
        {
          "id": "doc_01_02",
          "nombre": "Captura de pantalla del correo de envío",
          "descripcion": "Evidencia del envío del correo al cliente",
          "obligatorio": false,
          "tiposArchivo": ["image/png", "image/jpeg"]
        }
      ],
      "diasEstimados": 1,
      "instrucciones": "Enviar correo al cliente con la promesa adjunta. Guardar evidencia del envío."
    },
    {
      "id": "paso_02",
      "orden": 2,
      "nombre": "Recibido de promesa de compraventa firmada por cliente",
      "descripcion": "Recibir y verificar promesa de compraventa firmada por el cliente",
      "obligatorio": true,
      "permiteOmitir": false,
      "condiciones": {
        "fuentesPagoRequeridas": [],
        "dependeDe": ["paso_01"],
        "diasMinimoDespuesDe": null
      },
      "documentos": [
        {
          "id": "doc_02_01",
          "nombre": "Promesa de compraventa firmada por cliente",
          "descripcion": "Documento firmado escaneado",
          "obligatorio": true,
          "tiposArchivo": ["application/pdf"]
        }
      ],
      "diasEstimados": 3,
      "instrucciones": "Verificar que todas las páginas estén firmadas y legibles."
    },
    {
      "id": "paso_03",
      "orden": 3,
      "nombre": "Envío de documentación para Avalúo",
      "descripcion": "Enviar documentación requerida para el avalúo de la vivienda",
      "obligatorio": true,
      "permiteOmitir": false,
      "condiciones": {
        "fuentesPagoRequeridas": ["Crédito Hipotecario"],
        "dependeDe": ["paso_02"],
        "diasMinimoDespuesDe": null
      },
      "documentos": [
        {
          "id": "doc_03_01",
          "nombre": "Captura del correo de envío de documentación",
          "descripcion": "Evidencia del envío de documentos para avalúo",
          "obligatorio": true,
          "tiposArchivo": ["image/png", "image/jpeg", "application/pdf"]
        }
      ],
      "diasEstimados": 2,
      "instrucciones": "Solo aplica para clientes con crédito hipotecario. Enviar copia de escritura, planos, etc."
    },
    {
      "id": "paso_04",
      "orden": 4,
      "nombre": "Pago Estudio de Títulos",
      "descripcion": "Gestionar y comprobar pago del estudio de títulos",
      "obligatorio": true,
      "permiteOmitir": false,
      "condiciones": {
        "fuentesPagoRequeridas": ["Crédito Hipotecario"],
        "dependeDe": ["paso_03"],
        "diasMinimoDespuesDe": null
      },
      "documentos": [
        {
          "id": "doc_04_01",
          "nombre": "Comprobante de pago de estudio de títulos",
          "descripcion": "Recibo o transferencia del pago",
          "obligatorio": true,
          "tiposArchivo": ["application/pdf", "image/png", "image/jpeg"]
        }
      ],
      "diasEstimados": 5,
      "instrucciones": "Solo aplica para crédito hipotecario. Verificar monto y concepto del pago."
    },
    {
      "id": "paso_05",
      "orden": 5,
      "nombre": "Minuta enviada para Aprobación de el/la Abogado/a",
      "descripcion": "Enviar minuta al abogado para revisión y aprobación",
      "obligatorio": true,
      "permiteOmitir": false,
      "condiciones": {
        "fuentesPagoRequeridas": ["Crédito Hipotecario"],
        "dependeDe": ["paso_04"],
        "diasMinimoDespuesDe": null
      },
      "documentos": [
        {
          "id": "doc_05_01",
          "nombre": "Captura de correo de envío a abogada",
          "descripcion": "Evidencia del envío de la minuta",
          "obligatorio": false,
          "tiposArchivo": ["image/png", "image/jpeg"]
        }
      ],
      "diasEstimados": 1,
      "instrucciones": "Solo aplica para crédito hipotecario. Enviar minuta completa para revisión legal."
    },
    {
      "id": "paso_06",
      "orden": 6,
      "nombre": "Minuta Aprobada recibida por la Abogado/a",
      "descripcion": "Recibir minuta aprobada y revisada por el abogado",
      "obligatorio": true,
      "permiteOmitir": false,
      "condiciones": {
        "fuentesPagoRequeridas": ["Crédito Hipotecario"],
        "dependeDe": ["paso_05"],
        "diasMinimoDespuesDe": null
      },
      "documentos": [
        {
          "id": "doc_06_01",
          "nombre": "Captura de correo con minuta aprobada",
          "descripcion": "Evidencia de recepción de la minuta",
          "obligatorio": false,
          "tiposArchivo": ["image/png", "image/jpeg"]
        },
        {
          "id": "doc_06_02",
          "nombre": "Minuta de compraventa aprobada en formato Word",
          "descripcion": "Documento editable aprobado por abogada",
          "obligatorio": true,
          "tiposArchivo": ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword"]
        }
      ],
      "diasEstimados": 5,
      "instrucciones": "Solo aplica para crédito hipotecario. Verificar que tenga todas las correcciones."
    },
    {
      "id": "paso_07",
      "orden": 7,
      "nombre": "Envío Minuta a Notaría",
      "descripcion": "Enviar minuta aprobada a la notaría para proceso de escrituración",
      "obligatorio": true,
      "permiteOmitir": false,
      "condiciones": {
        "fuentesPagoRequeridas": [],
        "dependeDe": ["paso_02"],
        "diasMinimoDespuesDe": null
      },
      "documentos": [
        {
          "id": "doc_07_01",
          "nombre": "Captura de correo de envío a notaría",
          "descripcion": "Evidencia del envío de minuta a notaría",
          "obligatorio": false,
          "tiposArchivo": ["image/png", "image/jpeg"]
        }
      ],
      "diasEstimados": 1,
      "instrucciones": "Coordinar fecha de firma con la notaría."
    },
    {
      "id": "paso_08",
      "orden": 8,
      "nombre": "Firma de Minuta de Compraventa en Notaría",
      "descripcion": "Realizar la firma de minuta ante notario",
      "obligatorio": true,
      "permiteOmitir": false,
      "condiciones": {
        "fuentesPagoRequeridas": [],
        "dependeDe": ["paso_07"],
        "diasMinimoDespuesDe": null
      },
      "documentos": [
        {
          "id": "doc_08_01",
          "nombre": "Factura emitida por la notaría",
          "descripcion": "Comprobante de pago de servicios notariales",
          "obligatorio": true,
          "tiposArchivo": ["application/pdf", "image/png", "image/jpeg"]
        }
      ],
      "diasEstimados": 7,
      "instrucciones": "Coordinar presencia de todas las partes. Verificar identidad de firmantes."
    },
    {
      "id": "paso_09",
      "orden": 9,
      "nombre": "Envío de Acta de entrega a firmar por el cliente",
      "descripcion": "Enviar acta de entrega pendiente de firma al cliente",
      "obligatorio": true,
      "permiteOmitir": false,
      "condiciones": {
        "fuentesPagoRequeridas": [],
        "dependeDe": ["paso_08"],
        "diasMinimoDespuesDe": null
      },
      "documentos": [
        {
          "id": "doc_09_01",
          "nombre": "Acta de entrega pendiente por firmar",
          "descripcion": "Documento de acta sin firmar",
          "obligatorio": true,
          "tiposArchivo": ["application/pdf"]
        },
        {
          "id": "doc_09_02",
          "nombre": "Captura de correo de envío de acta",
          "descripcion": "Evidencia del envío",
          "obligatorio": false,
          "tiposArchivo": ["image/png", "image/jpeg"]
        }
      ],
      "diasEstimados": 1,
      "instrucciones": "Incluir inventario completo de la vivienda en el acta."
    },
    {
      "id": "paso_10",
      "orden": 10,
      "nombre": "Recibido de Acta de entrega firmada por cliente",
      "descripcion": "Recibir y verificar acta de entrega firmada",
      "obligatorio": true,
      "permiteOmitir": false,
      "condiciones": {
        "fuentesPagoRequeridas": [],
        "dependeDe": ["paso_09"],
        "diasMinimoDespuesDe": null
      },
      "documentos": [
        {
          "id": "doc_10_01",
          "nombre": "Acta de entrega firmada por cliente",
          "descripcion": "Documento firmado escaneado",
          "obligatorio": true,
          "tiposArchivo": ["application/pdf"]
        },
        {
          "id": "doc_10_02",
          "nombre": "Captura de correo de recepción",
          "descripcion": "Evidencia de recepción del acta firmada",
          "obligatorio": false,
          "tiposArchivo": ["image/png", "image/jpeg"]
        }
      ],
      "diasEstimados": 3,
      "instrucciones": "Verificar firma en todas las páginas y conformidad del cliente."
    },
    {
      "id": "paso_11",
      "orden": 11,
      "nombre": "Pago de Boleta Fiscal",
      "descripcion": "Gestionar y comprobar pago de boleta fiscal",
      "obligatorio": true,
      "permiteOmitir": false,
      "condiciones": {
        "fuentesPagoRequeridas": [],
        "dependeDe": ["paso_08"],
        "diasMinimoDespuesDe": null
      },
      "documentos": [
        {
          "id": "doc_11_01",
          "nombre": "Boleta fiscal",
          "descripcion": "Documento de boleta fiscal emitida",
          "obligatorio": true,
          "tiposArchivo": ["application/pdf"]
        },
        {
          "id": "doc_11_02",
          "nombre": "Recibo de pago de boleta fiscal",
          "descripcion": "Comprobante del pago realizado",
          "obligatorio": false,
          "tiposArchivo": ["application/pdf", "image/png", "image/jpeg"]
        }
      ],
      "diasEstimados": 2,
      "instrucciones": "Verificar monto correcto según avalúo catastral."
    },
    {
      "id": "paso_12",
      "orden": 12,
      "nombre": "Pago de Boleta de registro",
      "descripcion": "Gestionar y comprobar pago de boleta de registro",
      "obligatorio": true,
      "permiteOmitir": false,
      "condiciones": {
        "fuentesPagoRequeridas": [],
        "dependeDe": ["paso_11"],
        "diasMinimoDespuesDe": null
      },
      "documentos": [
        {
          "id": "doc_12_01",
          "nombre": "Boleta de Registro",
          "descripcion": "Documento de boleta de registro emitida",
          "obligatorio": true,
          "tiposArchivo": ["application/pdf"]
        },
        {
          "id": "doc_12_02",
          "nombre": "Recibo de pago de boleta de registro",
          "descripcion": "Comprobante del pago realizado",
          "obligatorio": false,
          "tiposArchivo": ["application/pdf", "image/png", "image/jpeg"]
        }
      ],
      "diasEstimados": 2,
      "instrucciones": "Necesario para inscripción en oficina de registro."
    },
    {
      "id": "paso_13",
      "orden": 13,
      "nombre": "Solicitud desembolso crédito hipotecario",
      "descripcion": "Enviar solicitud de desembolso al banco",
      "obligatorio": true,
      "permiteOmitir": false,
      "condiciones": {
        "fuentesPagoRequeridas": ["Crédito Hipotecario"],
        "dependeDe": ["paso_12"],
        "diasMinimoDespuesDe": null
      },
      "documentos": [
        {
          "id": "doc_13_01",
          "nombre": "Captura de correo de solicitud de desembolso",
          "descripcion": "Evidencia de envío de solicitud al banco",
          "obligatorio": false,
          "tiposArchivo": ["image/png", "image/jpeg", "application/pdf"]
        }
      ],
      "diasEstimados": 1,
      "instrucciones": "Solo aplica para crédito hipotecario. Incluir todos los documentos requeridos por el banco."
    },
    {
      "id": "paso_14",
      "orden": 14,
      "nombre": "Desembolso de crédito hipotecario",
      "descripcion": "Confirmar recepción del desembolso del banco",
      "obligatorio": true,
      "permiteOmitir": false,
      "condiciones": {
        "fuentesPagoRequeridas": ["Crédito Hipotecario"],
        "dependeDe": ["paso_13"],
        "diasMinimoDespuesDe": 1
      },
      "documentos": [
        {
          "id": "doc_14_01",
          "nombre": "Captura de notificación de desembolso",
          "descripcion": "Evidencia de desembolso recibido del banco",
          "obligatorio": false,
          "tiposArchivo": ["image/png", "image/jpeg", "application/pdf"]
        }
      ],
      "diasEstimados": 15,
      "instrucciones": "Solo aplica para crédito hipotecario. No se puede completar el mismo día de la solicitud."
    },
    {
      "id": "paso_15",
      "orden": 15,
      "nombre": "Solicitud desembolso subsidio caja de compensación Familiar",
      "descripcion": "Enviar solicitud de desembolso del subsidio",
      "obligatorio": true,
      "permiteOmitir": false,
      "condiciones": {
        "fuentesPagoRequeridas": ["Subsidio Caja de Compensación"],
        "dependeDe": ["paso_12"],
        "diasMinimoDespuesDe": null
      },
      "documentos": [
        {
          "id": "doc_15_01",
          "nombre": "Captura de envío de solicitud de subsidio",
          "descripcion": "Evidencia de solicitud a caja de compensación",
          "obligatorio": false,
          "tiposArchivo": ["image/png", "image/jpeg", "application/pdf"]
        }
      ],
      "diasEstimados": 1,
      "instrucciones": "Solo aplica para subsidio de caja. Verificar requisitos específicos de la caja."
    },
    {
      "id": "paso_16",
      "orden": 16,
      "nombre": "Desembolso subsidio de caja de compensación",
      "descripcion": "Confirmar recepción del desembolso del subsidio",
      "obligatorio": true,
      "permiteOmitir": false,
      "condiciones": {
        "fuentesPagoRequeridas": ["Subsidio Caja de Compensación"],
        "dependeDe": ["paso_15"],
        "diasMinimoDespuesDe": 1
      },
      "documentos": [
        {
          "id": "doc_16_01",
          "nombre": "Captura de notificación de desembolso de subsidio",
          "descripcion": "Evidencia de desembolso recibido",
          "obligatorio": false,
          "tiposArchivo": ["image/png", "image/jpeg", "application/pdf"]
        }
      ],
      "diasEstimados": 20,
      "instrucciones": "Solo aplica para subsidio de caja. No se puede completar el mismo día de la solicitud."
    },
    {
      "id": "paso_17",
      "orden": 17,
      "nombre": "Factura emitida por constructora RyR",
      "descripcion": "Emitir y entregar factura final de venta",
      "obligatorio": true,
      "permiteOmitir": false,
      "condiciones": {
        "fuentesPagoRequeridas": [],
        "dependeDe": ["paso_10", "paso_12"],
        "diasMinimoDespuesDe": null
      },
      "documentos": [
        {
          "id": "doc_17_01",
          "nombre": "Factura de venta emitida por constructora RyR",
          "descripcion": "Documento fiscal final de la transacción",
          "obligatorio": true,
          "tiposArchivo": ["application/pdf"]
        }
      ],
      "diasEstimados": 1,
      "instrucciones": "Factura final que cierra el proceso. Incluir todos los conceptos y descuentos aplicados."
    }
  ]'::jsonb,
  true,
  true
);
