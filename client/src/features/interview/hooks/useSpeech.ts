import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { synthesizeSpeech, transcribeSpeech } from '../interview.service'

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

function hasMediaRecorder(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.mediaDevices?.getUserMedia === 'function' &&
    typeof MediaRecorder !== 'undefined'
  )
}

const ERRORS: Record<string, string> = {
  'not-allowed': 'Microphone access is blocked. Allow it in your browser settings, or type your answer.',
  'service-not-allowed': 'Speech recognition is not allowed in this browser. Type your answer instead.',
  'audio-capture': 'No microphone was found. Connect one, or type your answer.',
  network: 'Speech recognition needs an internet connection. Try again or type your answer.',
  'language-not-supported': 'Live browser preview does not support this language; Sarvam AI will transcribe when you stop.',
}

type SpeechOptions = {
  ttsLocale?: string
  useSarvam?: boolean
  onSarvamTranscript?: (transcript: string, hadBrowserText: boolean) => void
}

export function useSpeech(locale: string, onFinalText: (chunk: string) => void, options?: SpeechOptions) {
  const ttsLocale = options?.ttsLocale ?? locale
  const useSarvam = options?.useSarvam ?? false

  const Ctor = useMemo(() => getRecCtor(), [])
  const mediaSupported = useMemo(() => hasMediaRecorder(), [])
  const sttSupported = Ctor !== null || (useSarvam && mediaSupported)
  const ttsSupported = typeof window !== 'undefined' && ('speechSynthesis' in window || useSarvam)

  const [listening, setListening] = useState(false)
  const [transcribing, setTranscribing] = useState(false)
  const [interim, setInterim] = useState('')
  const [sttError, setSttError] = useState<string | null>(null)
  const [speaking, setSpeaking] = useState(false)
  const [voiceMissing, setVoiceMissing] = useState(false)

  const recRef = useRef<Rec | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const micStreamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const hadBrowserFinalRef = useRef(false)
  const wantRef = useRef(false)
  const speakTokenRef = useRef(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const callbackRef = useRef(onFinalText)
  const sarvamCallbackRef = useRef(options?.onSarvamTranscript)

  useEffect(() => {
    callbackRef.current = onFinalText
    sarvamCallbackRef.current = options?.onSarvamTranscript
  })

  const releaseRecorder = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      try {
        recorderRef.current.stop()
      } catch {
        /* ignore */
      }
    }
    recorderRef.current = null
    micStreamRef.current?.getTracks().forEach((t) => t.stop())
    micStreamRef.current = null
  }, [])

  const stopListening = useCallback(() => {
    wantRef.current = false
    recRef.current?.stop()
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      try {
        recorderRef.current.stop()
      } catch {
        releaseRecorder()
      }
    } else {
      micStreamRef.current?.getTracks().forEach((t) => t.stop())
      micStreamRef.current = null
    }
    setInterim('')
    setListening(false)
  }, [releaseRecorder])

  const startListening = useCallback(() => {
    if (!sttSupported) return
    setSttError(null)
    wantRef.current = true
    hadBrowserFinalRef.current = false

    // Start Sarvam audio capture in parallel if enabled and supported
    if (useSarvam && mediaSupported) {
      chunksRef.current = []
      void navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          if (!wantRef.current) {
            stream.getTracks().forEach((t) => t.stop())
            return
          }
          micStreamRef.current = stream
          const recorder = new MediaRecorder(stream)
          recorderRef.current = recorder

          recorder.ondataavailable = (ev) => {
            if (ev.data.size > 0) chunksRef.current.push(ev.data)
          }

          recorder.onstop = () => {
            const blobs = chunksRef.current
            chunksRef.current = []
            stream.getTracks().forEach((t) => t.stop())
            micStreamRef.current = null
            recorderRef.current = null

            if (blobs.length === 0) return
            const audioBlob = new Blob(blobs, { type: recorder.mimeType || 'audio/webm' })
            if (audioBlob.size < 1000) return

            setTranscribing(true)
            void transcribeSpeech(audioBlob, locale)
              .then((transcript) => {
                const clean = transcript.trim()
                if (!clean) return
                if (sarvamCallbackRef.current) {
                  sarvamCallbackRef.current(clean, hadBrowserFinalRef.current)
                } else if (!hadBrowserFinalRef.current) {
                  callbackRef.current(clean)
                }
              })
              .catch(() => {
                // Keep any browser Web Speech transcript if Sarvam transcription fails
              })
              .finally(() => {
                setTranscribing(false)
              })
          }

          recorder.start()
          setListening(true)
        })
        .catch(() => {
          if (!Ctor) {
            wantRef.current = false
            setSttError('Could not access the microphone. Allow mic permission or type your answer.')
            setListening(false)
          }
        })
    }

    if (Ctor) {
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
          if (r.isFinal) {
            const trimmed = t.trim()
            if (trimmed) {
              hadBrowserFinalRef.current = true
              callbackRef.current(trimmed)
            }
          } else {
            pending += t
          }
        }
        setInterim(pending)
      }
      rec.onerror = (e) => {
        if (e.error === 'no-speech' || e.error === 'aborted') return
        if (e.error === 'language-not-supported' && useSarvam && mediaSupported) {
          setSttError(ERRORS[e.error] ?? null)
          return
        }
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
        if (!useSarvam || !recorderRef.current) {
          setListening(false)
        }
      }

      recRef.current = rec
      try {
        rec.start()
        setListening(true)
      } catch {
        if (!useSarvam || !mediaSupported) {
          wantRef.current = false
          setSttError('Could not start the microphone. Try again.')
        }
      }
    }
  }, [Ctor, locale, mediaSupported, sttSupported, useSarvam])

  const stopSpeaking = useCallback(() => {
    speakTokenRef.current += 1
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
      audioRef.current = null
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setSpeaking(false)
  }, [])

  const speakWithBrowser = useCallback(
    (text: string, token: number) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        setSpeaking(false)
        return
      }
      const synth = window.speechSynthesis
      synth.cancel()
      const want = ttsLocale.toLowerCase()
      const voices = synth.getVoices()
      const voice =
        voices.find((v) => v.lang.toLowerCase().replace('_', '-') === want) ??
        voices.find((v) => v.lang.toLowerCase().startsWith(want.slice(0, 2)))
      // Without a matching voice the browser would read the text with the wrong accent.
      if (!voice && voices.length > 0 && !want.startsWith('en')) {
        setVoiceMissing(true)
        setSpeaking(false)
        return
      }
      setVoiceMissing(false)
      const u = new SpeechSynthesisUtterance(text)
      u.lang = ttsLocale
      if (voice) u.voice = voice
      u.onstart = () => {
        if (token === speakTokenRef.current) setSpeaking(true)
      }
      u.onend = () => {
        if (token === speakTokenRef.current) setSpeaking(false)
      }
      u.onerror = () => {
        if (token === speakTokenRef.current) setSpeaking(false)
      }
      synth.speak(u)
    },
    [ttsLocale],
  )

  const speak = useCallback(
    (text: string) => {
      if (!ttsSupported || !text.trim()) return
      stopSpeaking()
      const token = speakTokenRef.current

      if (useSarvam) {
        setVoiceMissing(false)
        setSpeaking(true)
        void synthesizeSpeech(text)
          .then(({ audioBase64, mimeType }) => {
            if (token !== speakTokenRef.current) return
            const audio = new Audio(`data:${mimeType};base64,${audioBase64}`)
            audioRef.current = audio
            audio.onended = () => {
              if (token === speakTokenRef.current) setSpeaking(false)
            }
            audio.onerror = () => {
              if (token === speakTokenRef.current) speakWithBrowser(text, token)
            }
            void audio.play().catch(() => {
              if (token === speakTokenRef.current) speakWithBrowser(text, token)
            })
          })
          .catch(() => {
            if (token === speakTokenRef.current) speakWithBrowser(text, token)
          })
        return
      }

      speakWithBrowser(text, token)
    },
    [speakWithBrowser, stopSpeaking, ttsSupported, useSarvam],
  )

  // Always release the microphone and the speaker when leaving the page.
  useEffect(
    () => () => {
      wantRef.current = false
      recRef.current?.abort()
      releaseRecorder()
      stopSpeaking()
    },
    [releaseRecorder, stopSpeaking],
  )

  return {
    sttSupported,
    ttsSupported,
    listening,
    transcribing,
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
