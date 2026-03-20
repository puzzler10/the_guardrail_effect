import * as Tone from 'tone'

export interface SoundEngine {
  setEnabled(enabled: boolean): void
  setVolume(volume: number): void
  isEnabled(): boolean
  isReady(): boolean
}

export function createSoundEngine(): SoundEngine {
  let enabled = false
  let ready = false

  return {
    setEnabled(value: boolean) {
      enabled = value
      if (value && !ready) {
        Tone.start().then(() => {
          ready = true
        })
      }
    },

    setVolume(volume: number) {
      const clamped = Math.max(0, Math.min(1, volume))
      // Convert 0-1 to dB: 0 → -Infinity, 1 → 0dB
      const db = clamped === 0 ? -Infinity : Tone.gainToDb(clamped)
      Tone.getDestination().volume.value = db
    },

    isEnabled() {
      return enabled
    },

    isReady() {
      return ready
    },
  }
}

export const soundEngine = createSoundEngine()
