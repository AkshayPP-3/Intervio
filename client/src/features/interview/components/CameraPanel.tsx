import { useCallback, useEffect, useRef, useState } from 'react'

type CamState = 'starting' | 'on' | 'off' | 'denied' | 'unsupported' | 'error'

type Props = {
  status: 'speaking' | 'listening' | 'idle'
  subtitle?: string | null
  subtitleLabel?: string
}

const MESSAGES: Record<Exclude<CamState, 'on'>, string> = {
  starting: 'Starting camera…',
  off: 'Camera is off',
  denied: 'Camera access is blocked. Allow it in your browser, then press “Turn on camera”.',
  unsupported: 'Camera is not available in this browser or on this connection (HTTPS is required).',
  error: 'Could not start the camera. It may be in use by another app.',
}

const cameraSupported = () =>
  typeof navigator !== 'undefined' && typeof navigator.mediaDevices?.getUserMedia === 'function'

/** Self-view only. Nothing from the camera is recorded or uploaded. */
export function CameraPanel({ status, subtitle, subtitleLabel = 'Subtitles · English' }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const attemptRef = useRef(0)
  const [state, setState] = useState<CamState>(() =>
    cameraSupported() ? 'starting' : 'unsupported',
  )

  const stop = useCallback(() => {
    attemptRef.current += 1
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
  }, [])

  const start = useCallback(async () => {
    if (!cameraSupported()) return
    const attempt = ++attemptRef.current
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
      if (attempt !== attemptRef.current) {
        stream.getTracks().forEach((t) => t.stop()) // superseded or unmounted
        return
      }
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setState('on')
    } catch (e) {
      if (attempt !== attemptRef.current) return
      setState(e instanceof DOMException && e.name === 'NotAllowedError' ? 'denied' : 'error')
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => void start(), 0)
    return () => {
      clearTimeout(t)
      stop()
    }
  }, [start, stop])

  function toggle() {
    if (state === 'on') {
      stop()
      setState('off')
    } else {
      setState('starting')
      void start()
    }
  }

  const label = status === 'speaking' ? 'Speaking' : status === 'listening' ? 'Listening to you' : 'Ready'

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-900">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        aria-label="Your camera preview"
        className={`absolute inset-0 size-full -scale-x-100 object-cover ${state === 'on' ? '' : 'hidden'}`}
      />

      {state !== 'on' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-slate-800 text-slate-400">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M15 10l5-3v10l-5-3z" />
              <rect x="3" y="6" width="12" height="12" rx="2" />
            </svg>
          </div>
          <p className="max-w-xs text-sm text-slate-300">{MESSAGES[state]}</p>
          {state !== 'starting' && state !== 'unsupported' && (
            <button
              onClick={() => {
                setState('starting')
                void start()
              }}
              className="h-8 rounded-md bg-blue-500 px-3 text-xs font-semibold text-white hover:bg-blue-400"
            >
              Turn on camera
            </button>
          )}
        </div>
      )}

      {subtitle && (
        <div
          aria-live="polite"
          className="pointer-events-none absolute inset-x-3 bottom-14 rounded-lg border border-slate-700/80 bg-slate-950/85 px-3 py-2 backdrop-blur-sm"
        >
          <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-300">{subtitleLabel}</p>
          <p className="mt-0.5 line-clamp-3 text-xs leading-5 text-white">{subtitle}</p>
        </div>
      )}

      <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-slate-950/80 py-1.5 pl-1.5 pr-3 text-xs text-white">
        <span
          className={`flex size-6 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold ${
            status === 'speaking' ? 'animate-pulse' : ''
          }`}
        >
          AI
        </span>
        Intervio interviewer · {label}
      </div>

      {state === 'on' && (
        <button
          onClick={toggle}
          className="absolute bottom-3 right-3 rounded-full bg-slate-950/80 px-3 py-1.5 text-xs text-white hover:bg-slate-800"
        >
          Turn off camera
        </button>
      )}
    </div>
  )
}
