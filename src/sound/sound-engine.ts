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
  let drone: Tone.Noise | null = null
  let droneFilter: Tone.AutoFilter | null = null

  const initDrone = () => {
    // Create a low-frequency ambient "data center" drone
    drone = new Tone.Noise('brown').start()
    
    // AutoFilter creates a breathing, shifting movement
    droneFilter = new Tone.AutoFilter({
      frequency: 0.1,
      baseFrequency: 50,
      octaves: 2,
      type: 'sine',
      filter: {
        type: 'lowpass',
        Q: 1,
        rolloff: -12
      }
    }).connect(Tone.getDestination()).start()

    drone.connect(droneFilter)
    drone.volume.value = -35 // Very subtle
  }

  return {
    setEnabled(value: boolean) {
      enabled = value
      if (value) {
        if (!ready) {
          Tone.start().then(() => {
            ready = true
            initDrone()
          })
        } else if (drone && droneFilter) {
          drone.mute = false
          droneFilter.start()
        }
      } else {
        if (drone) {
          drone.mute = true
        }
        if (droneFilter) {
          droneFilter.stop()
        }
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
