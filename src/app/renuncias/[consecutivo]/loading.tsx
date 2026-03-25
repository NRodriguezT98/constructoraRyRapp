import { expedienteStyles as styles } from '@/modules/renuncias/components/expediente/ExpedienteRenunciaPage.styles'

export default function ExpedienteLoading() {
  return (
    <div className={styles.page.container}>
      <div className={styles.page.content}>
        <div className={styles.loading.container}>
          <div className={styles.loading.heroSkeleton} />
          <div className={styles.loading.timelineSkeleton} />
          <div className={styles.loading.tabsSkeleton} />
          <div className={styles.loading.contentSkeleton} />
        </div>
      </div>
    </div>
  )
}
