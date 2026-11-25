import { useId } from 'react'
import type { InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string | undefined
  hint?: string
}

export function Input({ label, error, hint, className = '', id, ...rest }: InputProps) {
  const auto = useId()
  const inputId = id ?? auto
  return (
    <div className={className}>
      <label htmlFor={inputId} className="block text-[11px] font-semibold text-slate-300">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        className={`mt-1 h-9 w-full rounded-md border bg-slate-900 px-3 text-xs text-slate-100 outline-none placeholder:text-slate-500 focus:border-blue-400 disabled:opacity-60 ${
          error ? 'border-red-500/70' : 'border-slate-700'
        }`}
        {...rest}
      />
      {error ? (
        <p id={`${inputId}-error`} className="mt-1 text-[11px] text-red-300">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="mt-1 text-[11px] text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
