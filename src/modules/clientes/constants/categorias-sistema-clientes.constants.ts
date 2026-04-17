/**
 * @file categorias-sistema-clientes.constants.ts
 * @description Categorías del sistema para módulo CLIENTES
 * ⚠️ UUIDs FIJOS: NO modificar, usados en triggers y validaciones
 *
 * Estas categorías se crean automáticamente si no existen.
 * Se recrean con los mismos UUIDs si se eliminan para garantizar
 * compatibilidad con triggers, documentos pendientes y otros módulos.
 *
 * @updated 2026-04-17 - Refactor: categorías específicas en singular
 */

export const CATEGORIAS_SISTEMA_CLIENTES = [
  // ── Identidad ──────────────────────────────────────────────────────────
  {
    id: 'b795b842-f035-42ce-9ab9-7fef2e1c5f24',
    nombre: 'Documento de Identidad',
    descripcion:
      'Cédula de ciudadanía del cliente, cédula del cónyuge o copropietario, pasaporte, tarjeta de identidad. Incluye cédulas ampliadas o escaneadas por ambas caras.',
    color: 'green',
    icono: 'IdCard',
    orden: 1,
    es_sistema: true,
    modulos_permitidos: ['clientes'],
  },
  // ── Tradición y propiedad ───────────────────────────────────────────────
  {
    id: 'bd49740e-d46d-43c8-973f-196f1418765c',
    nombre: 'Certificado de Tradición',
    descripcion:
      'Certificado de tradición y libertad (CTL) vigente, matrícula inmobiliaria, estudio de títulos del inmueble, avalúo comercial. Documentos que acreditan el historial jurídico y la propiedad del inmueble.',
    color: 'yellow',
    icono: 'BookMarked',
    orden: 2,
    es_sistema: true,
    modulos_permitidos: ['clientes'],
  },
  // ── Documentos del proceso de compra ───────────────────────────────────
  {
    id: 'c7a1e2f3-4b5c-4d6e-8f7a-1b2c3d4e5f6a',
    nombre: 'Promesa de Compraventa',
    descripcion:
      'Promesa de compraventa en borrador y versión firmada, minuta borrador, contrato de separación o reserva del inmueble. Cualquier documento contractual previo a la escritura pública.',
    color: 'indigo',
    icono: 'FilePen',
    orden: 3,
    es_sistema: true,
    modulos_permitidos: ['clientes'],
  },
  {
    id: '4898e798-c188-4f02-bfcf-b2b15be48e34',
    nombre: 'Carta de Aprobación',
    descripcion:
      'Carta de aprobación del crédito hipotecario emitida por el banco, carta de asignación de subsidio (Mi Casa Ya, Semillero de Propietarios, Caja de Compensación), carta de ratificación o confirmación de condiciones del crédito.',
    color: 'cyan',
    icono: 'BadgeCheck',
    orden: 4,
    es_sistema: true,
    modulos_permitidos: ['clientes'],
  },
  {
    id: 'd8b2f3a4-5c6d-4e7f-9a8b-2c3d4e5f6a7b',
    nombre: 'Acta de Entrega',
    descripcion:
      'Acta de entrega física del inmueble al cliente (borrador y versión firmada). Documento que certifica que el comprador recibió el inmueble a satisfacción con el inventario de acabados.',
    color: 'teal',
    icono: 'ClipboardCheck',
    orden: 5,
    es_sistema: true,
    modulos_permitidos: ['clientes'],
  },
  // ── Escrituras ─────────────────────────────────────────────────────────
  {
    id: 'a82ca714-b191-4976-a089-66c031ff1496',
    nombre: 'Escritura Pública',
    descripcion:
      'Escritura pública de compraventa protocolizada ante notaría, hojas de escritura, minuta final firmada. Incluye la escritura con sello de registro de la ORIP (Oficina de Registro de Instrumentos Públicos).',
    color: 'pink',
    icono: 'ScrollText',
    orden: 6,
    es_sistema: true,
    modulos_permitidos: ['clientes'],
  },
  // ── Desembolso ─────────────────────────────────────────────────────────
  {
    id: 'e9c3a4b5-6d7e-4f8a-ab9c-3d4e5f6a7b8c',
    nombre: 'Documento de Desembolso',
    descripcion:
      'Autorización de desembolso del banco o entidad financiadora, cuenta de cobro a la constructora, carta remisoria, certificación bancaria de cuenta, formato de existencia y representación legal. Documentos para gestionar el pago al vendedor.',
    color: 'sky',
    icono: 'Landmark',
    orden: 7,
    es_sistema: true,
    modulos_permitidos: ['clientes'],
  },
  // ── Pagos ──────────────────────────────────────────────────────────────
  {
    id: 'f84ec757-2f11-4245-a487-5091176feec5',
    nombre: 'Comprobante de Pago',
    descripcion:
      'Recibo de pago de derechos de registro e impuesto de registro ante la ORIP, factura notarial por servicios de escrituración, recibos de pago de boleta fiscal, comprobante de pago del estudio de títulos, paz y salvos de administración o servicios públicos.',
    color: 'emerald',
    icono: 'Receipt',
    orden: 8,
    es_sistema: true,
    modulos_permitidos: ['clientes'],
  },
  // ── General ────────────────────────────────────────────────────────────
  {
    id: 'f50f53d6-c1d8-4c42-9993-fddc2f8f5ade',
    nombre: 'Otro Documento',
    descripcion:
      'Fotografías del inmueble, correspondencia con el cliente o entidades, poderes notariales, declaraciones juramentadas, documentos de estado civil (registro civil, matrimonio, divorcio) y cualquier documento que no encaje en las categorías anteriores.',
    color: '#6B7280',
    icono: 'FolderOpen',
    orden: 9,
    es_sistema: true,
    modulos_permitidos: ['clientes'],
  },
] as const

/**
 * IDs de categorías tipados para usar en código
 * Ejemplo: CATEGORIA_IDS.DOCUMENTO_IDENTIDAD
 */
export const CATEGORIA_IDS = {
  /** Cédula del cliente, documentos de identificación */
  DOCUMENTO_IDENTIDAD: 'b795b842-f035-42ce-9ab9-7fef2e1c5f24' as const,

  /** Certificado de tradición, matrícula, análisis de título, avalúo */
  CERTIFICADO_TRADICION: 'bd49740e-d46d-43c8-973f-196f1418765c' as const,

  /** Promesa de compraventa borrador y firmada */
  PROMESA_COMPRAVENTA: 'c7a1e2f3-4b5c-4d6e-8f7a-1b2c3d4e5f6a' as const,

  /** Carta de aprobación crédito, subsidio — CRÍTICA: usada en triggers */
  CARTA_APROBACION: '4898e798-c188-4f02-bfcf-b2b15be48e34' as const,

  /** Acta de entrega del inmueble */
  ACTA_ENTREGA: 'd8b2f3a4-5c6d-4e7f-9a8b-2c3d4e5f6a7b' as const,

  /** Escritura pública protocolizada, hojas de escritura */
  ESCRITURA_PUBLICA: 'a82ca714-b191-4976-a089-66c031ff1496' as const,

  /** Autorización de desembolso, cuenta de cobro, cert. bancaria */
  DOCUMENTO_DESEMBOLSO: 'e9c3a4b5-6d7e-4f8a-ab9c-3d4e5f6a7b8c' as const,

  /** Boleta registro, factura notarial, recibos de pago */
  COMPROBANTE_PAGO: 'f84ec757-2f11-4245-a487-5091176feec5' as const,

  /** Fotos, correspondencia, documentos varios */
  OTRO_DOCUMENTO: 'f50f53d6-c1d8-4c42-9993-fddc2f8f5ade' as const,

  // ── Aliases de compatibilidad (no usar en código nuevo) ──────────────
  /** @deprecated usar DOCUMENTO_IDENTIDAD */
  DOCUMENTOS_IDENTIDAD: 'b795b842-f035-42ce-9ab9-7fef2e1c5f24' as const,
  /** @deprecated usar CERTIFICADO_TRADICION */
  CERTIFICADOS_TRADICION: 'bd49740e-d46d-43c8-973f-196f1418765c' as const,
  /** @deprecated usar ESCRITURA_PUBLICA */
  ESCRITURAS_PUBLICAS: 'a82ca714-b191-4976-a089-66c031ff1496' as const,
  /** @deprecated usar CARTA_APROBACION */
  DOCUMENTOS_PROCESO: '4898e798-c188-4f02-bfcf-b2b15be48e34' as const,
  /** @deprecated usar COMPROBANTE_PAGO */
  GASTOS_NOTARIALES: 'f84ec757-2f11-4245-a487-5091176feec5' as const,
  /** @deprecated usar OTRO_DOCUMENTO */
  OTROS_DOCUMENTOS: 'f50f53d6-c1d8-4c42-9993-fddc2f8f5ade' as const,
} as const

/**
 * Tipo auxiliar para IDs de categorías
 */
export type CategoriaClienteId =
  (typeof CATEGORIA_IDS)[keyof typeof CATEGORIA_IDS]
