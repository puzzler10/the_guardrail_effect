// Node risk levels
export type RiskLevel = 'safe' | 'low' | 'medium' | 'high' | 'critical'

// Failure severity tiers
export type FailureTier = 1 | 2 | 3 | 4

// Particle states
export type ParticleState = 'spawning' | 'active' | 'recovering' | 'failed' | 'exploded' | 'completed'

// Layout presets
export type LayoutPreset = 'spiral' | 'flow' | 'ring'

// Graph node
export interface GraphNode {
  id: string
  name: string
  icon: string
  risk: RiskLevel
  description?: string
  x: number
  y: number
  neighbors: string[]  // adjacency list (supports cycles)
}

// Particle path types for varied movement
export type PathType = 'straight' | 'arc' | 'wobble' | 'loop' | 'zigzag'

// Particle
export interface Particle {
  id: number
  state: ParticleState
  currentNodeId: string
  targetNodeId: string
  progress: number  // 0-1 interpolation between nodes
  stepsCompleted: number
  maxSteps: number
  trail: { x: number; y: number }[]
  speedMultiplier: number // 0.8 - 1.2 variation
  pathType: PathType
  failureTier?: FailureTier
  failureText?: string
}

// Simulation stats
export interface SimulationStats {
  active: number
  completed: number
  selfCorrected: number
  failed: number        // tier 2-3
  catastrophic: number  // tier 4
}

// Model preset
export interface ModelPreset {
  name: string
  rates: Record<RiskLevel, number>  // base failure rate per risk level (0-1)
}

// Failure event (for event log and floating text)
export interface FailureEvent {
  text: string
  tier: FailureTier
  nodeId: string
  x: number
  y: number
  timestamp: number
}

// Guardrail intercept event
export interface GuardrailEvent {
  text: string
  nodeId: string
  x: number
  y: number
  timestamp: number
}

// Config (runtime-modifiable via UI)
export interface SimulationConfig {
  modelPreset: string
  scenario: string
  failureMultiplier: number  // 0.1 – 10
  agentSpeed: number         // 0.25 – 4
  particleCount: number      // 50 – 1000
  guardrailsEnabled: boolean
  autoZoomEnabled: boolean
  darkMode: boolean
  soundEnabled: boolean
  soundVolume: number        // 0 – 1
  layout: LayoutPreset
}

// Global simulation state
export interface SimulationState {
  nodes: GraphNode[]
  particles: Particle[]
  stats: SimulationStats
  config: SimulationConfig
  recentFailures: FailureEvent[]
  recentGuardrails: GuardrailEvent[]
  usedFailureTexts: string[] // Non-repetition engine (Phase 8)
  nextParticleId: number
  lastSpawnMs: number
}
