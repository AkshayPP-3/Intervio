type LoaderProps = {
  label?: string
  /** Fills the page, for route-level loading. */
  fullScreen?: boolean
}

export function Loader({ label = 'Loading…', fullScreen = false }: LoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-center justify-center ${fullScreen ? 'min-h-screen bg-[#071020]' : 'py-10'}`}
    >
      <div className="text-center">
        <div className="mx-auto size-7 animate-spin rounded-full border-2 border-slate-600 border-t-blue-400" />
        <p className="mt-3 text-xs text-slate-400">{label}</p>
      </div>
    </div>
  )
}
