'use client'

import {
  Building2,
  DollarSign,
  Home,
  Layers,
  MapPin,
  Maximize,
  Ruler,
  ScrollText,
  TriangleRight,
} from 'lucide-react'

import type { ExpedienteData } from '../../types'
import { formatCOP } from '../../utils/renuncias.utils'

import { expedienteStyles as styles } from './ExpedienteRenunciaPage.styles'

interface ExpedienteViviendaProps {
  datos: ExpedienteData
}

export function ExpedienteVivienda({ datos }: ExpedienteViviendaProps) {
  const { renuncia, viviendaDetalle } = datos
  const snap = renuncia.vivienda_datos_snapshot as Partial<{
    valor_total: number
    matricula_inmobiliaria: string
    tipo_vivienda: string
    area_lote: number
    area_construida: number
    es_esquinera: boolean
  }> | null
  const valorVivienda =
    renuncia.vivienda_valor_snapshot ?? snap?.valor_total ?? 0

  // Fallback: snapshot → viviendaDetalle (consulta en vivo)
  const vd = viviendaDetalle

  const campos = [
    { label: 'Manzana', valor: renuncia.vivienda.manzana, icon: MapPin },
    { label: 'Casa Número', valor: renuncia.vivienda.numero, icon: Home },
    { label: 'Proyecto', valor: renuncia.proyecto.nombre, icon: Building2 },
    {
      label: 'Matrícula inmobiliaria',
      valor:
        snap?.matricula_inmobiliaria ?? vd?.matricula_inmobiliaria ?? 'N/A',
      icon: ScrollText,
    },
    {
      label: 'Tipo de vivienda',
      valor: snap?.tipo_vivienda ?? vd?.tipo_vivienda ?? 'N/A',
      icon: Layers,
    },
    {
      label: 'Área del lote',
      valor: formatArea(snap?.area_lote ?? vd?.area_lote),
      icon: Maximize,
    },
    {
      label: 'Área construida',
      valor: formatArea(snap?.area_construida ?? vd?.area_construida),
      icon: Ruler,
    },
    {
      label: 'Valor total de la vivienda',
      valor: valorVivienda > 0 ? formatCOP(valorVivienda) : 'N/A',
      icon: DollarSign,
    },
    {
      label: 'Esquinera',
      valor: resolverEsquinera(snap?.es_esquinera, vd?.es_esquinera),
      icon: TriangleRight,
    },
  ]

  return (
    <div className={styles.vivienda.grid}>
      {campos.map(({ label, valor, icon: Icon }) => (
        <div key={label} className={styles.vivienda.field}>
          <p className={styles.vivienda.fieldLabel}>
            <Icon className='-mt-0.5 mr-1.5 inline-block h-3.5 w-3.5 text-red-500 dark:text-red-400' />
            {label}
          </p>
          <p
            className={
              valor === 'N/A'
                ? styles.vivienda.fieldValueMuted
                : styles.vivienda.fieldValue
            }
          >
            {valor}
          </p>
        </div>
      ))}
    </div>
  )
}

function formatArea(val: number | null | undefined): string {
  if (val == null || val === 0) return 'N/A'
  return `${val} m²`
}

function resolverEsquinera(
  snapVal: boolean | null | undefined,
  liveVal: boolean | null | undefined
): string {
  const val = snapVal ?? liveVal
  if (val == null) return 'N/A'
  return val ? 'Sí' : 'No'
}
