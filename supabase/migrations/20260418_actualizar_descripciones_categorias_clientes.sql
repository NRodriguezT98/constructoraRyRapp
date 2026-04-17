-- ============================================================
-- MIGRACIÓN: Actualizar descripciones de categorías de clientes
-- Fecha: 2026-04-18
-- Descripción: Descripciones detalladas que indican exactamente
--              qué documento va en cada categoría
-- ============================================================

UPDATE categorias_documento SET descripcion =
  'Cédula de ciudadanía del cliente, cédula del cónyuge o copropietario, pasaporte, tarjeta de identidad. Incluye cédulas ampliadas o escaneadas por ambas caras.'
WHERE id = 'b795b842-f035-42ce-9ab9-7fef2e1c5f24';

UPDATE categorias_documento SET descripcion =
  'Certificado de tradición y libertad (CTL) vigente, matrícula inmobiliaria, estudio de títulos del inmueble, avalúo comercial. Documentos que acreditan el historial jurídico y la propiedad del inmueble.'
WHERE id = 'bd49740e-d46d-43c8-973f-196f1418765c';

UPDATE categorias_documento SET descripcion =
  'Promesa de compraventa en borrador y versión firmada, minuta borrador, contrato de separación o reserva del inmueble. Cualquier documento contractual previo a la escritura pública.'
WHERE id = 'c7a1e2f3-4b5c-4d6e-8f7a-1b2c3d4e5f6a';

UPDATE categorias_documento SET descripcion =
  'Carta de aprobación del crédito hipotecario emitida por el banco, carta de asignación de subsidio (Mi Casa Ya, Semillero de Propietarios, Caja de Compensación), carta de ratificación o confirmación de condiciones del crédito.'
WHERE id = '4898e798-c188-4f02-bfcf-b2b15be48e34';

UPDATE categorias_documento SET descripcion =
  'Acta de entrega física del inmueble al cliente (borrador y versión firmada). Documento que certifica que el comprador recibió el inmueble a satisfacción con el inventario de acabados.'
WHERE id = 'd8b2f3a4-5c6d-4e7f-9a8b-2c3d4e5f6a7b';

UPDATE categorias_documento SET descripcion =
  'Escritura pública de compraventa protocolizada ante notaría, hojas de escritura, minuta final firmada. Incluye la escritura con sello de registro de la ORIP (Oficina de Registro de Instrumentos Públicos).'
WHERE id = 'a82ca714-b191-4976-a089-66c031ff1496';

UPDATE categorias_documento SET descripcion =
  'Autorización de desembolso del banco o entidad financiadora, cuenta de cobro a la constructora, carta remisoria, certificación bancaria de cuenta, formato de existencia y representación legal. Documentos para gestionar el pago al vendedor.'
WHERE id = 'e9c3a4b5-6d7e-4f8a-ab9c-3d4e5f6a7b8c';

UPDATE categorias_documento SET descripcion =
  'Recibo de pago de derechos de registro e impuesto de registro ante la ORIP, factura notarial por servicios de escrituración, recibos de pago de boleta fiscal, comprobante de pago del estudio de títulos, paz y salvos de administración o servicios públicos.'
WHERE id = 'f84ec757-2f11-4245-a487-5091176feec5';

UPDATE categorias_documento SET descripcion =
  'Fotografías del inmueble, correspondencia con el cliente o entidades, poderes notariales, declaraciones juramentadas, documentos de estado civil (registro civil, matrimonio, divorcio) y cualquier documento que no encaje en las categorías anteriores.'
WHERE id = 'f50f53d6-c1d8-4c42-9993-fddc2f8f5ade';

-- Verificación
SELECT nombre, descripcion
FROM categorias_documento
WHERE 'clientes' = ANY(modulos_permitidos) AND es_sistema = true
ORDER BY orden;
