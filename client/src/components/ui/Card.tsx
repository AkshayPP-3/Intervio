import type { ReactNode } from 'react'

type CardProps = {
  title?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}

export function Card({ title, action, children, className = '' }: CardProps) {
  return (
    <section className={`rounded-lg border border-slate-800/90 bg-slate-800/95 p-3 ${className}`}>
      {(title || action) && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          {title && <h2 className="text-xs font-bold text-white">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  )
}
