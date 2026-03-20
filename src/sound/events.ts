import * as Tone from 'tone'
import type { FailureTier } from '../types'
import type { SoundEngine } from './sound-engine'

/** Play a failure sound matching the severity tier. */
export function playFailure(tier: FailureTier, engine: SoundEngine): void {
  if (!engine.isEnabled() || !engine.isReady()) return

  const now = Tone.now()

  switch (tier) {
    case 1:
      playTier1(now)
      break
    case 2:
      playTier2(now)
      break
    case 3:
      playTier3(now)
      break
    case 4:
      playTier4(now)
      break
  }
}

/** Play a guardrail intercept sound (bright ascending chime). */
export function playGuardrailIntercept(engine: SoundEngine): void {
  if (!engine.isEnabled() || !engine.isReady()) return

  const now = Tone.now()
  const synth = new Tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.01, decay: 0.15, sustain: 0.1, release: 0.15 },
    volume: -12,
  })
  synth.toDestination()
  synth.triggerAttackRelease('C5', '16n', now)
  synth.triggerAttackRelease('E5', '16n', now + 0.1)
  synth.triggerAttackRelease('G5', '16n', now + 0.2)
  setTimeout(() => synth.dispose(), 800)
}

// ─── Tier implementations ─────────────────────────────────────────────────────

function playTier1(now: number): void {
  const synth = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.005, decay: 0.06, sustain: 0, release: 0.03 },
    volume: -20,
  })
  synth.toDestination()
  synth.triggerAttackRelease('A5', '32n', now)
  setTimeout(() => synth.dispose(), 300)
}

function playTier2(now: number): void {
  const synth = new Tone.Synth({
    oscillator: { type: 'square' },
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.05, release: 0.15 },
    volume: -14,
  })
  synth.toDestination()
  synth.triggerAttackRelease('E4', '16n', now)
  synth.triggerAttackRelease('B3', '16n', now + 0.15)
  setTimeout(() => synth.dispose(), 600)
}

function playTier3(now: number): void {
  const membrane = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 4,
    envelope: { attack: 0.01, decay: 0.3, sustain: 0, release: 0.2 },
    volume: -10,
  })
  membrane.toDestination()
  membrane.triggerAttackRelease('C2', '8n', now)

  const noise = new Tone.NoiseSynth({
    noise: { type: 'brown' },
    envelope: { attack: 0.01, decay: 0.15, sustain: 0, release: 0.1 },
    volume: -18,
  })
  noise.toDestination()
  noise.triggerAttackRelease('16n', now + 0.05)

  setTimeout(() => {
    membrane.dispose()
    noise.dispose()
  }, 800)
}

function playTier4(now: number): void {
  const boom = new Tone.MembraneSynth({
    pitchDecay: 0.08,
    octaves: 6,
    envelope: { attack: 0.01, decay: 0.8, sustain: 0.1, release: 0.6 },
    volume: -6,
  })
  boom.toDestination()
  boom.triggerAttackRelease('E1', '4n', now)

  const distortion = new Tone.Distortion(0.8)
  const buzz = new Tone.Synth({
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.05, decay: 0.4, sustain: 0.2, release: 0.8 },
    volume: -12,
  })
  buzz.chain(distortion, Tone.getDestination())
  buzz.triggerAttackRelease('A1', '8n', now + 0.1)

  const noise = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.1, decay: 0.5, sustain: 0.1, release: 0.3 },
    volume: -16,
  })
  noise.toDestination()
  noise.triggerAttackRelease('4n', now + 0.2)

  setTimeout(() => {
    boom.dispose()
    buzz.dispose()
    distortion.dispose()
    noise.dispose()
  }, 2500)
}
