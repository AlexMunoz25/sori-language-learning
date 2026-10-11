import { useCallback, useEffect, useRef, useState } from 'react'

export type SpeechSpeed = 'normal' | 'slow'

function selectKoreanVoice(voices: SpeechSynthesisVoice[]) {
  const korean = voices.filter(voice => /^ko(?:[-_]|$)/i.test(voice.lang))
  const local = korean.filter(voice => /^ko[-_]KR$/i.test(voice.lang) && voice.localService)
  // macOS exposes character voices before its neutral Korean voice.
  return local.find(voice => /yuna|유나/i.test(voice.name)) ?? local[0]
    ?? korean.find(voice => /^ko[-_]KR$/i.test(voice.lang)) ?? korean[0]
}

export function useSpeech() {
  const supported = typeof window !== 'undefined' && !!window.speechSynthesis && typeof window.SpeechSynthesisUtterance === 'function'
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [playing, setPlaying] = useState<SpeechSpeed | null>(null)
  const [error, setError] = useState<string | null>(null)
  const active = useRef<SpeechSynthesisUtterance | null>(null)
  const watchdog = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const voice = selectKoreanVoice(voices)

  const cancel = useCallback(() => {
    active.current = null
    clearTimeout(watchdog.current)
    if (supported) window.speechSynthesis.cancel()
    setPlaying(null)
    setError(null)
  }, [supported])

  useEffect(() => {
    if (!supported) return
    const synth = window.speechSynthesis
    const refresh = () => setVoices(synth.getVoices())
    refresh()
    synth.addEventListener('voiceschanged', refresh)
    // Some engines populate voices without emitting the event.
    const retry = window.setTimeout(refresh, 800)
    const onVisibility = () => { if (document.hidden) cancel() }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      clearTimeout(retry)
      synth.removeEventListener('voiceschanged', refresh)
      document.removeEventListener('visibilitychange', onVisibility)
      cancel()
    }
  }, [supported, cancel])

  function speak(text: string, speed: SpeechSpeed = 'normal') {
    if (!supported) return
    cancel()
    const synth = window.speechSynthesis
    const utterance = new SpeechSynthesisUtterance(text)
    // Re-read on the user gesture too: iOS may initialize voices on first tap.
    const selected = selectKoreanVoice(synth.getVoices()) ?? voice
    utterance.lang = 'ko-KR'
    if (selected) utterance.voice = selected
    utterance.rate = speed === 'slow' ? 0.6 : 0.85
    utterance.pitch = 1
    active.current = utterance // Keep a live reference until completion (Safari).
    setPlaying(speed)
    const finish = () => {
      if (active.current !== utterance) return
      clearTimeout(watchdog.current)
      active.current = null
      setPlaying(null)
    }
    utterance.onend = finish
    utterance.onerror = event => {
      if (active.current !== utterance) return
      finish()
      if (!['canceled', 'interrupted'].includes(event.error)) {
        setError('Audio couldn’t play. Try again, or check that a Korean voice is available on your device.')
      }
    }
    try {
      synth.speak(utterance)
      watchdog.current = setTimeout(() => {
        if (active.current !== utterance) return
        cancel()
        setError('The voice didn’t finish. Tap to retry or check your device’s speech settings.')
      }, 25000)
    } catch {
      finish()
      setError('Audio isn’t available right now. You can still reveal and study this word.')
    }
  }
  return { supported, playing, error, speak, cancel, hasKoreanVoice: !!voice }
}
