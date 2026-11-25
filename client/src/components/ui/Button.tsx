import type { ButtonHTMLAttributes } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md'
  loading?: boolean
}

const VARIANTS = {
  primary: 'bg-blue-500 text-white hover:bg-blue-400',
  secondary: 'bg-slate-700 text-blue-300 hover:bg-slate-600',
  danger: 'bg-red-500 text-white hover:bg-red-400',
  ghost: 'bg-transparent text-slate-300 hover:bg-slate-800',
}
const SIZES = { sm: 'h-8 px-3 text-xs', md: 'h-9 px-4 text-xs' }

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  type = 'button',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-md font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {loading && <span className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {children}
    </button>
  )
}
