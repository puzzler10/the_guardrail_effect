import p5 from 'p5'
import type { FailureEvent, GuardrailEvent, FailureTier } from '../types'
import { UI, COLORS_DARK } from '../config'

export interface FloatingText {
  text: string
  x: number
  y: number
  tier: FailureTier | 'guardrail'
  startMs: number
}

export function createFloatingText(event: FailureEvent | GuardrailEvent, nowMs: number): FloatingText {
  const isFailure = 'tier' in event
  return {
    text: event.text,
    x: event.x,
    y: event.y,
    tier: isFailure ? (event as FailureEvent).tier : 'guardrail',
    startMs: nowMs,
  }
}

export function drawFloatingTexts(p: p5, texts: FloatingText[], nowMs: number, colors: typeof COLORS_DARK): void {
  p.push()
  p.textAlign(p.CENTER, p.BOTTOM)

  for (const text of texts) {
    const duration = text.tier === 'guardrail' ? 1500 : UI.floatingTextDurationMs[text.tier]
    const elapsed = nowMs - text.startMs
    const progress = Math.min(elapsed / duration, 1)
    const alpha = (1 - progress) * 255
    const yOffset = progress * 40 // Rise upwards

    let textColor: string | p5.Color
    let textSize = 14
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let textStyle: any = p.NORMAL
    let displayText = text.text

    if (text.tier === 'guardrail') {
      textColor = colors.guardrailText
      textSize = 12
    } else {
      switch (text.tier) {
        case 1:
          textColor = colors.tier1
          textSize = 14
          break
        case 2:
          textColor = colors.tier2
          textSize = 16
          break
        case 3:
          textColor = colors.tier3
          textSize = 18
          textStyle = p.BOLD
          break
        case 4: {
          // Interpolate between tier4start and tier4end
          const c1 = p.color(colors.tier4start)
          const c2 = p.color(colors.tier4end)
          textColor = p.lerpColor(c1, c2, progress)
          textSize = 24
          textStyle = p.BOLD
          displayText = text.text.toUpperCase()
          break
        }
        default:
          textColor = '#ffffff'
      }
    }

    const c = typeof textColor === 'string' ? p.color(textColor) : textColor
    c.setAlpha(alpha)
    
    // Draw dark halo/shadow for readability
    p.noStroke()
    const haloColor = p.color(0, alpha * 0.8)
    p.fill(haloColor)
    p.textSize(textSize)
    p.textStyle(textStyle)
    
    // Subtle shiver for tier 4
    let xOffset = 0
    let yJitter = 0
    if (text.tier === 4) {
      xOffset = (Math.random() - 0.5) * 4
      yJitter = (Math.random() - 0.5) * 4
    }

    // Offset shadow
    p.text(displayText, text.x + 1 + xOffset, text.y - 19 - yOffset + yJitter)
    p.text(displayText, text.x - 1 + xOffset, text.y - 21 - yOffset + yJitter)
    
    p.fill(c)
    p.text(displayText, text.x + xOffset, text.y - 20 - yOffset + yJitter)
  }
  p.pop()
}

export function pruneFloatingTexts(texts: FloatingText[], nowMs: number): FloatingText[] {
  return texts.filter(text => {
    const duration = text.tier === 'guardrail' ? 1500 : UI.floatingTextDurationMs[text.tier]
    return nowMs - text.startMs < duration
  })
}
