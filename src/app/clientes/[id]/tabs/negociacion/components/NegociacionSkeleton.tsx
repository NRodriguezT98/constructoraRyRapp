'use client'

export function NegociacionSkeleton() {
  return (
    <div className='animate-pulse space-y-3'>
      <div className='h-32 rounded-xl bg-gray-100 dark:bg-gray-700/40' />
      <div className='h-48 rounded-xl bg-gray-100 dark:bg-gray-700/40' />
      <div className='h-20 rounded-xl bg-gray-100 dark:bg-gray-700/40' />
    </div>
  )
}
