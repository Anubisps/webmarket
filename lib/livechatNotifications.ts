let baseTitle = ''
let titleFlashTimer: ReturnType<typeof setInterval> | null = null
let audioContext: AudioContext | null = null

export function initLiveChatTabTitle(fallbackTitle?: string) {
  if (typeof document === 'undefined') return
  if (!baseTitle) {
    baseTitle = fallbackTitle || document.title
  }
}

export function unlockLiveChatAudio() {
  if (typeof window === 'undefined') return

  try {
    const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return
    if (!audioContext) {
      audioContext = new AudioCtx()
    }
    if (audioContext.state === 'suspended') {
      void audioContext.resume()
    }
  } catch {
    // Ignore
  }
}

export function playLiveChatNotificationSound() {
  if (typeof window === 'undefined') return

  try {
    unlockLiveChatAudio()
    if (!audioContext) return

    const ctx = audioContext

    const playBeep = (frequency: number, startTime: number, duration = 0.18) => {
      const oscillator = ctx.createOscillator()
      const gain = ctx.createGain()
      oscillator.type = 'sine'
      oscillator.frequency.value = frequency
      oscillator.connect(gain)
      gain.connect(ctx.destination)
      gain.gain.setValueAtTime(0.0001, startTime)
      gain.gain.exponentialRampToValueAtTime(0.12, startTime + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)
      oscillator.start(startTime)
      oscillator.stop(startTime + duration)
    }

    const now = ctx.currentTime
    playBeep(880, now)
    playBeep(1174, now + 0.2)
  } catch {
    // Ignore audio errors (autoplay restrictions, etc.)
  }
}

function stopTitleFlash() {
  if (titleFlashTimer) {
    clearInterval(titleFlashTimer)
    titleFlashTimer = null
  }
}

export function resetLiveChatTabTitle() {
  stopTitleFlash()
  if (typeof document !== 'undefined' && baseTitle) {
    document.title = baseTitle
  }
}

export function alertLiveChatReply(label = 'New message') {
  initLiveChatTabTitle()
  playLiveChatNotificationSound()

  if (typeof document === 'undefined') return

  const alertTitle = `💬 ${label}`

  if (document.hidden) {
    stopTitleFlash()
    let showAlert = true
    titleFlashTimer = setInterval(() => {
      document.title = showAlert ? alertTitle : baseTitle
      showAlert = !showAlert
    }, 1000)
  } else {
    document.title = `${alertTitle} — ${baseTitle}`
    window.setTimeout(() => {
      if (document.title.startsWith('💬')) {
        resetLiveChatTabTitle()
      }
    }, 4000)
  }
}

export function setupLiveChatTabReset() {
  if (typeof document === 'undefined') return () => {}

  initLiveChatTabTitle()

  const onVisibilityChange = () => {
    if (!document.hidden) {
      resetLiveChatTabTitle()
    }
  }

  document.addEventListener('visibilitychange', onVisibilityChange)

  return () => {
    document.removeEventListener('visibilitychange', onVisibilityChange)
    resetLiveChatTabTitle()
  }
}
