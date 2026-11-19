import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

type RecResult = { isFinal: boolean; 0: { transcript: string } }
type RecEvent = { resultIndex: number; results: ArrayLike<RecResult> }
interface Rec {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((e: RecEvent) => void) | null
  onerror: ((e: { error: string }) => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
  abort(): void
}
type RecCtor = new () => Rec

function getRecCtor(): RecCtor | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as { SpeechRecognition?: RecCtor; webkitSpeechRecognition?: RecCtor }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

const ERRORS: Record<string, string> = {
  'not-allowed': 'Microphone access is blocked. Allow it in your browser settings, or type your answer.',
  'service-not-allowed': 'Speech recognition is not allowed in this browser. Type your answer instead.',
  'audio-capture': 'No microphone was found. Connect one, or type your answer.',
  network: 'Speech recognition needs an internet connection. Try again or type your answer.',
  'language-not-supported': 'This browser cannot recognise the selected language. Type your answer instead.',
}

export function useSpeech(locale: string, onFinalText: (chunk: string) => void) {
  const Ctor = useMemo(() => getRecCtor(), [])
  const sttSupported = Ctor !== null
  const ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

  const [listening, setListening] = useState(false)
  const [interim, setInterim] = useState('')
  const [sttError, setSttError] = useState<string | null>(null)
  const [speaking, setSpeaking] = useState(false)
  const [voiceMissing, setVoiceMissing] = useState(false)

  const recRef = useRef<Rec | null>(null)
  const wantRef = useRef(false)
  const callbackRef = useRef(onFinalText)

  useEffect(() => {
    callbackRef.current = onFinalText
  })

  const stopListening = useCallback(() => {
    wantRef.current = false
    recRef.current?.stop()
    setInterim('')
    setListening(false)
  }, [])

  const startListening = useCallback(() => {
    if (!Ctor) return
    setSttError(null)
    wantRef.current = true

    const rec = new Ctor()
    rec.lang = locale
    rec.continuous = true
    rec.interimResults = true

    rec.onresult = (e) => {
      let pending = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i]
        if (!r) continue
        const t = r[0].transcript
        if (r.isFinal) callbackRef.current(t.trim())
        else pending += t
      }
      setInterim(pending)
    }
    rec.onerror = (e) => {
      if (e.error === 'no-speech' || e.error === 'aborted') return
      wantRef.current = false
      setSttError(ERRORS[e.error] ?? `Speech recognition stopped (${e.error}).`)
    }
    rec.onend = () => {
      setInterim('')
      // Browsers stop after a pause; keep going until the user presses stop.
      if (wantRef.current) {
        try {
          rec.start()
          return
        } catch {
          wantRef.current = false
        }
      }
      setListening(false)
    }

    recRef.current = rec
    try {
      rec.start()
      setListening(true)
    } catch {
      wantRef.current = false
      setSttError('Could not start the microphone. Try again.')
    }
  }, [Ctor, locale])

  const stopSpeaking = useCallback(() => {
    if (ttsSupported) window.speechSynthesis.cancel()
    setSpeaking(false)
  }, [ttsSupported])

  const speak = useCallback(
    (text: string) => {
      if (!ttsSupported || !text) return
      const synth = window.speechSynthesis
      synth.cancel()
      const want = locale.toLowerCase()
      const voices = synth.getVoices()
      const voice =
        voices.find((v) => v.lang.toLowerCase().replace('_', '-') === want) ??
        voices.find((v) => v.lang.toLowerCase().startsWith(want.slice(0, 2)))
      // Without a matching voice the browser would read the text with the wrong accent.
      if (!voice && voices.length > 0 && !want.startsWith('en')) {
        setVoiceMissing(true)
        return
      }
      setVoiceMissing(false)
      const u = new SpeechSynthesisUtterance(text)
      u.lang = locale
      if (voice) u.voice = voice
      u.onstart = () => setSpeaking(true)
      u.onend = () => setSpeaking(false)
      u.onerror = () => setSpeaking(false)
      synth.speak(u)
    },
    [locale, ttsSupported],
  )

  // Always release the microphone and the speaker when leaving the page.
  useEffect(
    () => () => {
      wantRef.current = false
      recRef.current?.abort()
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel()
    },
    [],
  )

  return {
    sttSupported,
    ttsSupported,
    listening,
    interim,
    sttError,
    speaking,
    voiceMissing,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  }
}
