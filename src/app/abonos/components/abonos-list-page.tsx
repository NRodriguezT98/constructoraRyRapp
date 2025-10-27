'use client'

import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import {
    Calendar,
    CreditCard,
    DollarSign,
    Loader2,
    Plus,
    Receipt,
    Sparkles,
    TrendingUp
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAbonosList } from '../hooks/useAbonosList'
import { AbonoCard } from './abono-card'
import { abonosListStyles, metricasIconColors } from './abonos-list.styles'
import { FiltrosAbonos } from './filtros-abonos'

const s = abonosListStyles

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * 🎨 COMPONENTE: AbonosListPage
 *
 * Vista principal moderna del módulo de abonos
 * Lista TODOS los abonos del sistema con filtros y diseño premium
 */
export function AbonosListPage() {
  const router = useRouter()
  const {
    abonos,
    abonosCompletos,
    estadisticas,
    proyectosUnicos,
    filtros,
    actualizarFiltros,
    limpiarFiltros,
    isLoading,
    error
  } = useAbonosList()

  const handleAnularAbono = (abonoId: string) => {
    // TODO: Implementar anulación de abonos
    console.log('Anular abono:', abonoId)
  }

  const handleRegistrarAbono = () => {
    router.push('/abonos/registrar')
  }

  // 🔄 LOADING STATE
  if (isLoading) {
    return (
      <div className={s.container}>
        <div className={s.page}>
          <div className={s.loading.container}>
            {/* Header skeleton */}
            <div className={s.loading.header} />

            {/* Métricas skeleton */}
            <div className={s.loading.metricas}>
              {[...Array(4)].map((_, i) => (
                <div key={i} className={s.loading.metricaSkeleton} />
              ))}
            </div>

            {/* Filtros skeleton */}
            <div className={s.loading.filtros} />

            {/* Cards skeleton */}
            <div className={s.loading.cards}>
              {[...Array(3)].map((_, i) => (
                <div key={i} className={s.loading.cardSkeleton} />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ❌ ERROR STATE
  if (error) {
    return (
      <div className={s.container}>
        <div className={s.page}>
          <div className={s.empty.container}>
            <div className={s.empty.iconWrapper}>
              <CreditCard className={s.empty.icon} />
              <div className={`${s.empty.iconGlow} bg-red-500`} />
            </div>
            <h3 className={s.empty.title}>Error al cargar abonos</h3>
            <p className={s.empty.description}>{error}</p>
            <Button onClick={() => window.location.reload()} className={s.empty.button}>
              <Loader2 className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={s.container}>
      {/* Animación simplificada para navegación instantánea */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className={s.page}
      >
        {/* ✨ HEADER HERO */}
        <div className={s.header.container}>
          <div className={s.header.pattern} />
          <div className={s.header.content}>
            <div className={s.header.titleGroup}>
              <h1 className={s.header.title}>
                <Receipt className={s.header.titleIcon} />
                Gestión de Abonos
              </h1>
              <p className={s.header.subtitle}>
                Sistema centralizado de pagos y abonos • Seguimiento en tiempo real
              </p>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className={s.header.badge}>
                <Sparkles className={s.header.badgeIcon} />
                {abonosCompletos.length} Registros
              </span>
            </div>
          </div>
        </div>

        {/* 📊 MÉTRICAS GLASSMORPHISM */}
        <div className={s.metricas.container}>
          {/* Total Abonos */}
          <div className={s.metricas.card}>
            <div className={`${s.metricas.cardGlow} ${s.gradients.primary}`} />
            <div className={s.metricas.content}>
              <div className={s.metricas.info}>
                <p className={`${s.metricas.value} ${metricasIconColors.total.text}`}>
                  {estadisticas.totalAbonos}
                </p>
                <p className={s.metricas.label}>Total Abonos</p>
              </div>
              <div className={s.metricas.iconContainer}>
                <div className={`${s.metricas.iconCircle} bg-gradient-to-br ${metricasIconColors.total.gradient}`}>
                  <CreditCard className={s.metricas.icon} />
                </div>
                <div className={`${s.metricas.iconGlow} ${metricasIconColors.total.glow}`} />
              </div>
            </div>
          </div>

          {/* Monto Total */}
          <div className={s.metricas.card}>
            <div className={`${s.metricas.cardGlow} ${s.gradients.success}`} />
            <div className={s.metricas.content}>
              <div className={s.metricas.info}>
                <p className={`${s.metricas.value} ${metricasIconColors.monto.text}`}>
                  {formatCurrency(estadisticas.montoTotal)}
                </p>
                <p className={s.metricas.label}>Monto Total</p>
              </div>
              <div className={s.metricas.iconContainer}>
                <div className={`${s.metricas.iconCircle} bg-gradient-to-br ${metricasIconColors.monto.gradient}`}>
                  <DollarSign className={s.metricas.icon} />
                </div>
                <div className={`${s.metricas.iconGlow} ${metricasIconColors.monto.glow}`} />
              </div>
            </div>
          </div>

          {/* Abonos Este Mes */}
          <div className={s.metricas.card}>
            <div className={`${s.metricas.cardGlow} ${s.gradients.primary}`} />
            <div className={s.metricas.content}>
              <div className={s.metricas.info}>
                <p className={`${s.metricas.value} ${metricasIconColors.mes.text}`}>
                  {estadisticas.abonosEsteMes}
                </p>
                <p className={s.metricas.label}>Abonos Este Mes</p>
              </div>
              <div className={s.metricas.iconContainer}>
                <div className={`${s.metricas.iconCircle} bg-gradient-to-br ${metricasIconColors.mes.gradient}`}>
                  <Calendar className={s.metricas.icon} />
                </div>
                <div className={`${s.metricas.iconGlow} ${metricasIconColors.mes.glow}`} />
              </div>
            </div>
          </div>

          {/* Recaudado Este Mes */}
          <div className={s.metricas.card}>
            <div className={`${s.metricas.cardGlow} ${s.gradients.warning}`} />
            <div className={s.metricas.content}>
              <div className={s.metricas.info}>
                <p className={`${s.metricas.value} ${metricasIconColors.recaudado.text}`}>
                  {formatCurrency(estadisticas.montoEsteMes)}
                </p>
                <p className={s.metricas.label}>Recaudado Este Mes</p>
              </div>
              <div className={s.metricas.iconContainer}>
                <div className={`${s.metricas.iconCircle} bg-gradient-to-br ${metricasIconColors.recaudado.gradient}`}>
                  <TrendingUp className={s.metricas.icon} />
                </div>
                <div className={`${s.metricas.iconGlow} ${metricasIconColors.recaudado.glow}`} />
              </div>
            </div>
          </div>
        </div>

        {/* 🔍 FILTROS */}
        <div>
          <FiltrosAbonos
            filtros={filtros}
            proyectos={proyectosUnicos}
            onFiltrosChange={actualizarFiltros}
            onLimpiar={limpiarFiltros}
            totalResultados={abonos.length}
            totalAbonos={abonosCompletos.length}
          />
        </div>

        {/* 🃏 LISTA DE ABONOS */}
        <div className="space-y-3">
          {abonos.length > 0 ? (
            abonos.map((abono) => (
              <div key={abono.id}>
                <AbonoCard
                  abono={abono}
                  onAnular={handleAnularAbono}
                />
              </div>
            ))
          ) : (
            <div className={s.empty.container}>
                <div className={s.empty.iconWrapper}>
                  <CreditCard className={s.empty.icon} />
                  <div className={`${s.empty.iconGlow} bg-blue-500`} />
                </div>
                <h3 className={s.empty.title}>No hay abonos para mostrar</h3>
                <p className={s.empty.description}>
                  {filtros.busqueda || filtros.estado !== 'activos'
                    ? 'Intenta ajustar los filtros de búsqueda'
                    : 'Comienza registrando tu primer abono'}
                </p>
                <Button onClick={handleRegistrarAbono} className={s.empty.button}>
                  <Plus className="w-4 h-4 mr-2" />
                  Registrar Primer Abono
                </Button>
            </div>
          )}
        </div>
      </motion.div>

      {/* 🎈 FAB - Floating Action Button */}
      <div className={s.fab.container}>
        <Button onClick={handleRegistrarAbono} className={s.fab.button}>
          <div className={s.fab.buttonGlow} />
          <div className={s.fab.buttonContent}>
            <Plus className={s.fab.icon} />
            <span className={s.fab.text}>Registrar Abono</span>
          </div>
        </Button>
      </div>
    </div>
  )
}
