'use client'

/**
 * ReciboAbonoPDF
 *
 * Documento PDF oficial de recibo de pago — Constructora RyR Ltda.
 * Generado con @react-pdf/renderer (client-side, sin API route).
 *
 * Diseño institucional:
 *  - Header: fondo verde oscuro con logo + número de recibo
 *  - Banda de monto: fondo esmeralda suave con valor destacado
 *  - Secciones: Cliente, Detalles del pago, Propiedad, Resumen financiero
 *  - Footer: texto legal + fecha de generación
 */

import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer'

import type { AbonoParaDetalle } from '../abono-detalle-modal/useAbonoDetalle'

// ─── Paleta corporativa (institucional: negro / blanco) ─────────────────────
const C = {
  verde: '#111111', // negro institucional principal
  verdeOscuro: '#0a0a0a', // negro oscuro — header
  verdeMedio: '#1a1a1a', // negro suave — section headers
  verdeClaro: '#e5e7eb', // gris borde (gray-200)
  verdeMuyClaro: '#f3f4f6', // gris claro fondo (gray-100)
  teal: '#374151', // gris oscuro
  blanco: '#ffffff',
  dark: '#111827', // gray-900
  gris: '#374151', // gray-700
  grisMedio: '#6b7280', // gray-500
  grisClaro: '#f9fafb', // gray-50
  grisBorde: '#e5e7eb', // gray-200
  rojo: '#dc2626', // red-600
}

// ─── Estilos PDF ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    backgroundColor: C.blanco,
    fontFamily: 'Helvetica',
    fontSize: 10,
  },

  /* ── HEADER ── */
  header: {
    backgroundColor: C.blanco,
    borderBottomWidth: 2,
    borderBottomColor: C.grisBorde,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '28 36',
  },
  headerLeft: {
    flexDirection: 'column',
    gap: 6,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoContainer: {
    borderRadius: 4,
    paddingTop: 3,
    paddingBottom: 3,
    paddingLeft: 0,
    paddingRight: 6,
  },
  logo: {
    width: 110,
    height: 25,
    objectFit: 'contain',
  },
  empresa: {
    flexDirection: 'column',
    gap: 2,
  },
  empresaNombre: {
    fontSize: 15,
    fontFamily: 'Helvetica-Bold',
    color: C.dark,
  },
  empresaTagline: {
    fontSize: 8,
    color: C.grisMedio,
    letterSpacing: 0.3,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  reciboEtiqueta: {
    fontSize: 8,
    color: C.grisMedio,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  reciboNumero: {
    fontSize: 26,
    fontFamily: 'Helvetica-Bold',
    color: C.dark,
    letterSpacing: 0.5,
  },
  reciboFecha: {
    fontSize: 8,
    color: C.grisMedio,
  },

  /* ── BANDA DE MONTO ── */
  montoBanda: {
    backgroundColor: C.verdeMuyClaro,
    borderTopWidth: 0,
    borderBottomWidth: 3,
    borderBottomColor: C.verdeMedio,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16 36',
  },
  montoIzquierda: {
    gap: 4,
  },
  montoEtiqueta: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: C.grisMedio,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  montoValor: {
    fontSize: 30,
    fontFamily: 'Helvetica-Bold',
    color: C.verde,
  },
  estadoBadge: {
    backgroundColor: C.verde,
    borderRadius: 20,
    padding: '5 14',
  },
  estadoTexto: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: C.blanco,
  },

  /* ── CONTENIDO ── */
  content: {
    padding: '20 36',
    gap: 16,
  },

  /* ── SECCIONES ── */
  seccion: {
    borderWidth: 1,
    borderColor: C.verdeClaro,
    borderRadius: 6,
    overflow: 'hidden',
  },
  seccionHeader: {
    backgroundColor: C.verdeMedio,
    padding: '7 14',
  },
  seccionHeaderText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: C.blanco,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  seccionBody: {
    padding: '10 14',
    gap: 7,
  },

  /* ── FILAS DE DATOS ── */
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: C.verdeClaro,
    paddingBottom: 6,
  },
  filaUltima: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  filaEtiqueta: {
    fontSize: 8,
    color: C.grisMedio,
    maxWidth: '40%',
  },
  filaValor: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: C.dark,
    textAlign: 'right',
    maxWidth: '55%',
  },
  filaValorMono: {
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: C.dark,
    textAlign: 'right',
  },

  /* ── DOS COLUMNAS ── */
  dosColumnas: {
    flexDirection: 'row',
    gap: 12,
  },
  columna: {
    flex: 1,
  },

  /* ── RESUMEN FINANCIERO ── */
  financiero: {
    borderWidth: 1,
    borderColor: C.verdeClaro,
    borderRadius: 6,
    overflow: 'hidden',
  },
  financieroFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: '8 14',
    borderBottomWidth: 1,
    borderBottomColor: C.verdeClaro,
  },
  financieroTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: '10 14',
    backgroundColor: C.verdeMuyClaro,
  },
  financieroEtiqueta: {
    fontSize: 9,
    color: C.gris,
  },
  financieroValor: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: C.dark,
  },
  financieroTotalEtiqueta: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: C.verdeOscuro,
  },
  financieroTotalValor: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: C.verdeOscuro,
  },

  /* ── NOTA AL PIE ── */
  notaNotas: {
    borderWidth: 1,
    borderColor: C.grisBorde,
    borderRadius: 6,
    padding: '8 14',
    backgroundColor: C.grisClaro,
  },
  notaEtiqueta: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: C.grisMedio,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  notaTexto: {
    fontSize: 8,
    color: C.gris,
    fontStyle: 'italic',
  },

  /* ── FOOTER ── */
  footer: {
    marginTop: 'auto',
    padding: '14 36',
    borderTopWidth: 2,
    borderTopColor: C.verdeClaro,
    backgroundColor: C.verdeMuyClaro,
    gap: 4,
  },
  footerLinea: {
    fontSize: 7,
    color: C.grisMedio,
    textAlign: 'center',
  },
  footerBold: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: C.gris,
    textAlign: 'center',
  },
})

// ─── Helpers de formato ───────────────────────────────────────────────────────
function formatCurrencyPDF(valor: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valor)
}

function formatFechaPDF(fechaISO: string): string {
  try {
    // Parsear como fecha local para evitar timezone shift
    const [y, m, d] = fechaISO.split('T')[0].split('-').map(Number)
    const fecha = new Date(y, m - 1, d)
    return fecha.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return fechaISO
  }
}

function formatNumeroRecibo(n: number): string {
  return `RYR-${String(n).padStart(4, '0')}`
}

// ─── Componente PDF ───────────────────────────────────────────────────────────
interface ReciboAbonoPDFProps {
  abono: AbonoParaDetalle
  /** URL absoluta del logo (requerido por @react-pdf/renderer en browser, ej: window.location.origin + '/images/logo1.png') */
  logoUrl?: string
  /** Valores financieros opcionales del contexto de la negociación */
  valorTotal?: number
  totalAbonado?: number
  saldoPendiente?: number
}

export function ReciboAbonoPDF({
  abono,
  logoUrl,
  valorTotal,
  totalAbonado,
  saldoPendiente,
}: ReciboAbonoPDFProps) {
  const nombreCompleto =
    `${abono.cliente.nombres} ${abono.cliente.apellidos}`.trim()

  const viviendaLabel = abono.vivienda.manzana.identificador
    ? `Mz.${abono.vivienda.manzana.identificador} Casa No. ${abono.vivienda.numero}`
    : `Casa No. ${abono.vivienda.numero}`

  const hoy = new Date()
  const fechaGeneracion = hoy.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <Document
      title={`Recibo ${formatNumeroRecibo(abono.numero_recibo)} - ${nombreCompleto}`}
      author='Constructora RyR Ltda.'
      subject='Recibo de Pago'
      creator='Sistema RyR'
    >
      <Page size='A4' style={styles.page}>
        {/* ── HEADER ──────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoRow}>
              {/* Logo — contenedor blanco para visibilidad en header oscuro */}
              {logoUrl ? (
                <View style={styles.logoContainer}>
                  {/* eslint-disable-next-line jsx-a11y/alt-text */}
                  <Image src={logoUrl} style={styles.logo} />
                </View>
              ) : null}
              <View style={styles.empresa}></View>
            </View>
          </View>

          <View style={styles.headerRight}>
            <Text style={styles.reciboEtiqueta}>Recibo de Pago</Text>
            <Text style={styles.reciboNumero}>
              {formatNumeroRecibo(abono.numero_recibo)}
            </Text>
            <Text style={styles.reciboFecha}>
              {formatFechaPDF(abono.fecha_abono)}
            </Text>
          </View>
        </View>

        {/* ── MONTO DESTACADO ─────────────────────────────────────────── */}
        <View style={styles.montoBanda}>
          <View style={styles.montoIzquierda}>
            <Text style={styles.montoEtiqueta}>Valor recibido</Text>
            <Text style={styles.montoValor}>
              {formatCurrencyPDF(abono.monto)}
            </Text>
          </View>
          <View style={styles.estadoBadge}>
            <Text style={styles.estadoTexto}>✓ PAGO RECIBIDO</Text>
          </View>
        </View>

        {/* ── CONTENIDO ───────────────────────────────────────────────── */}
        <View style={styles.content}>
          {/* Dos columnas: cliente + detalles */}
          <View style={styles.dosColumnas}>
            {/* Columna izquierda: cliente */}
            <View style={styles.columna}>
              <View style={styles.seccion}>
                <View style={styles.seccionHeader}>
                  <Text style={styles.seccionHeaderText}>
                    Datos del Cliente
                  </Text>
                </View>
                <View style={styles.seccionBody}>
                  <View style={styles.fila}>
                    <Text style={styles.filaEtiqueta}>Nombre completo:</Text>
                    <Text style={styles.filaValor}>{nombreCompleto}</Text>
                  </View>
                  <View style={styles.filaUltima}>
                    <Text style={styles.filaEtiqueta}>Cédula / NIT:</Text>
                    <Text style={styles.filaValor}>
                      {abono.cliente.numero_documento}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Columna derecha: detalles pago */}
            <View style={styles.columna}>
              <View style={styles.seccion}>
                <View style={styles.seccionHeader}>
                  <Text style={styles.seccionHeaderText}>
                    Detalles del Pago
                  </Text>
                </View>
                <View style={styles.seccionBody}>
                  <View style={styles.fila}>
                    <Text style={styles.filaEtiqueta}>Método:</Text>
                    <Text style={styles.filaValor}>{abono.metodo_pago}</Text>
                  </View>
                  <View style={styles.fila}>
                    <Text style={styles.filaEtiqueta}>Fuente:</Text>
                    <Text style={styles.filaValor}>
                      {abono.fuente_pago.tipo}
                    </Text>
                  </View>
                  {abono.numero_referencia ? (
                    <View style={styles.filaUltima}>
                      <Text style={styles.filaEtiqueta}>Referencia:</Text>
                      <Text style={styles.filaValorMono}>
                        {abono.numero_referencia}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.filaUltima}>
                      <Text style={styles.filaEtiqueta}>Referencia:</Text>
                      <Text style={styles.filaValor}>—</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* Propiedad */}
          <View style={styles.seccion}>
            <View style={styles.seccionHeader}>
              <Text style={styles.seccionHeaderText}>Propiedad</Text>
            </View>
            <View style={styles.seccionBody}>
              <View style={styles.fila}>
                <Text style={styles.filaEtiqueta}>Proyecto:</Text>
                <Text style={styles.filaValor}>{abono.proyecto.nombre}</Text>
              </View>
              <View style={styles.filaUltima}>
                <Text style={styles.filaEtiqueta}>Vivienda:</Text>
                <Text style={styles.filaValor}>{viviendaLabel}</Text>
              </View>
            </View>
          </View>

          {/* Resumen financiero (si hay datos disponibles) */}
          {valorTotal !== undefined ? (
            <View style={styles.financiero}>
              <View style={styles.seccionHeader}>
                <Text style={styles.seccionHeaderText}>Resumen Financiero</Text>
              </View>
              <View style={styles.financieroFila}>
                <Text style={styles.financieroEtiqueta}>
                  Valor total de la vivienda:
                </Text>
                <Text style={styles.financieroValor}>
                  {formatCurrencyPDF(valorTotal ?? 0)}
                </Text>
              </View>
              <View style={styles.financieroFila}>
                <Text style={styles.financieroEtiqueta}>
                  Total abonado (incluye este pago):
                </Text>
                <Text style={styles.financieroValor}>
                  {formatCurrencyPDF(totalAbonado ?? 0)}
                </Text>
              </View>
              <View style={styles.financieroTotal}>
                <Text style={styles.financieroTotalEtiqueta}>
                  Saldo pendiente:
                </Text>
                <Text style={styles.financieroTotalValor}>
                  {formatCurrencyPDF(saldoPendiente ?? 0)}
                </Text>
              </View>
            </View>
          ) : null}

          {/* Observaciones (si existen) */}
          {abono.notas ? (
            <View style={styles.notaNotas}>
              <Text style={styles.notaEtiqueta}>Observaciones:</Text>
              <Text style={styles.notaTexto}>
                {'“'}
                {abono.notas}
                {'”'}
              </Text>
            </View>
          ) : null}
        </View>

        {/* ── FOOTER ──────────────────────────────────────────────────── */}
        <View style={styles.footer}>
          <Text style={styles.footerBold}>Constructora RyR Ltda.</Text>
          <Text style={styles.footerLinea}>
            Este documento es un comprobante oficial de pago emitido por
            Constructora RyR Ltda.
          </Text>
          <Text style={styles.footerLinea}>
            Conserve este recibo como respaldo de su transacción.
          </Text>
          <Text style={styles.footerLinea}>
            Generado el {fechaGeneracion} · Sistema de Gestión RyR
          </Text>
        </View>
      </Page>
    </Document>
  )
}
