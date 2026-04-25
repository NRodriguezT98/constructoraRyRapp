'use client'

import Link from 'next/link'

interface ProtectedLinkProps {
  href: string
  hasPermission?: boolean
  className?: string
  disabledClassName?: string
  children: React.ReactNode
}

export function ProtectedLink({
  href,
  hasPermission = true,
  className,
  disabledClassName,
  children,
}: ProtectedLinkProps) {
  if (!hasPermission) {
    return (
      <span
        className={disabledClassName ?? className}
        title='Sin permiso de acceso'
        aria-disabled='true'
      >
        {children}
      </span>
    )
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  )
}
