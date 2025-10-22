/**
 * Componente: NegociacionDetalleTabs
 *
 * Sistema de navegación por tabs
 */

import { motion } from 'framer-motion'
import * as styles from '../../styles/detalle.styles'

interface Tab {
  id: string
  label: string
  icon: any
  count: number | null
}

interface NegociacionDetalleTabsProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
}

export function NegociacionDetalleTabs({
  tabs,
  activeTab,
  onTabChange,
}: NegociacionDetalleTabsProps) {
  return (
    <div className={styles.tabsClasses.container}>
      <nav className={styles.tabsClasses.nav}>
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`${styles.tabsClasses.tab} ${
                isActive ? styles.tabsClasses.tabActive : styles.tabsClasses.tabInactive
              }`}
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
            >
              <div className={styles.tabsClasses.tabContent}>
                <Icon className={styles.tabsClasses.tabIcon} />
                <span>{tab.label}</span>
                {tab.count !== null && tab.count > 0 && (
                  <span className={styles.tabsClasses.tabBadge}>{tab.count}</span>
                )}
              </div>
              {isActive && (
                <motion.div
                  layoutId="negociacionTabIndicator"
                  className={styles.tabsClasses.tabUnderline}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          )
        })}
      </nav>
    </div>
  )
}
