export function TabSpinner() {
  return (
    <div className='flex flex-col items-center justify-center py-20'>
      <div className='relative inline-flex items-center justify-center'>
        <div className='absolute h-20 w-20 animate-ping rounded-full bg-cyan-500/15 dark:bg-cyan-400/10' />
        <div className='absolute h-16 w-16 rounded-full border-2 border-cyan-200/40 dark:border-cyan-800/40' />
        <div className='relative h-14 w-14 animate-spin rounded-full border-4 border-transparent border-r-cyan-400 border-t-cyan-500 dark:border-r-cyan-400 dark:border-t-cyan-300' />
      </div>
    </div>
  )
}
