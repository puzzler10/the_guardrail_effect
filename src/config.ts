import type { ModelPreset, SimulationConfig, RiskLevel } from './types'

// ─── Model presets (failure rates per risk level) ────────────────────────────
// Rates are illustrative estimates inspired by general model capability benchmarks.

export const MODEL_PRESETS: Record<string, ModelPreset> = {
  frontier: {
    name: 'Frontier (Claude Opus / GPT-4.5)',
    rates: { safe: 0.001, low: 0.005, medium: 0.015, high: 0.03, critical: 0.05 },
  },
  strong: {
    name: 'Strong (Claude Sonnet / GPT-4o)',
    rates: { safe: 0.002, low: 0.01, medium: 0.03, high: 0.06, critical: 0.10 },
  },
  midtier: {
    name: 'Mid-tier (Claude Haiku / GPT-4o-mini)',
    rates: { safe: 0.005, low: 0.02, medium: 0.05, high: 0.10, critical: 0.18 },
  },
  opensource: {
    name: 'Open-source (Llama 3 / Mistral)',
    rates: { safe: 0.008, low: 0.04, medium: 0.08, high: 0.15, critical: 0.25 },
  },
  small: {
    name: 'Small / Local (Phi-3 / Gemma 2B)',
    rates: { safe: 0.015, low: 0.06, medium: 0.12, high: 0.22, critical: 0.35 },
  },
}

// ─── Default simulation config ────────────────────────────────────────────────

export const DEFAULT_CONFIG: SimulationConfig = {
  modelPreset: 'frontier',
  failureMultiplier: 1,
  agentSpeed: 1,
  particleCount: 300,
  guardrailsEnabled: false,
  darkMode: true,
  soundEnabled: false,
  soundVolume: 0.5,
  layout: 'clustered',
}

// ─── Particle settings ────────────────────────────────────────────────────────

export const PARTICLE = {
  minSteps: 8,
  maxSteps: 20,
  spawnRate: 15,          // particles per second
  trailLength: 30,        // frames to keep in trail
  baseSpeed: 0.005,       // progress units per ms at 1x speed
}

// ─── Failure messages by tier ─────────────────────────────────────────────────

export const FAILURE_MESSAGES: Record<1 | 2 | 3 | 4, string[]> = {
  1: [
    'retrying API call...',
    'parsing error, reformatting...',
    'timeout, reconnecting...',
    'wrong format, auto-fixing...',
    'rate limited, backing off...',
    'auth token expired, refreshing...',
    'JSON parse failed, retrying...',
    'connection reset, reconnecting...',
    'hallucinated URL, re-searching...',
    'context window exceeded, truncating...',
    'tool call malformed, retrying...',
    'response too long, summarizing...',
    'search returned no results, broadening...',
    'file not found, checking alternatives...',
    'encoding error, converting...',
  ],
  2: [
    'posted to #general instead of #eng',
    'sent duplicate email to client',
    'created 47 duplicate JIRA tickets',
    'overwrote draft document',
    'replied-all to company thread',
    'wrong timezone in meeting invite',
    'attached wrong file to email',
    'updated wrong spreadsheet row',
    'sent message to wrong DM',
    'merged to wrong branch',
    'booked meeting room for wrong date',
    'added wrong person to private channel',
    'set ticket priority to critical (it\'s minor)',
    'pushed debug logs to production',
    'committed .env to version control',
    'sent test data as real report',
    'CC\'d external contractor on internal thread',
    'auto-approved PR without review',
  ],
  3: [
    'PII included in API response',
    'customer SSN logged to console',
    'sent internal pricing to competitor',
    'deployed untested code to prod',
    'modified production config',
    'granted admin access to wrong user',
    'shared confidential roadmap externally',
    'exposed internal API endpoint',
    'database migration ran in prod',
    'deleted customer support history',
    'sent patient health data in plain text',
    'ran UPDATE without WHERE clause',
    'disabled rate limiting in production',
    'exposed debug endpoint publicly',
    'overwrote production database backup',
  ],
  4: [
    'PRODUCTION DATABASE DROPPED',
    'API KEYS PUSHED TO PUBLIC REPO',
    'ALL CUSTOMER DATA SENT TO WRONG COMPANY',
    'RECURSIVE LOOP: 50,000 EMAILS SENT',
    'ROOT ACCESS CREDENTIALS LEAKED',
    'ENTIRE S3 BUCKET SET TO PUBLIC',
    'BILLING API CHARGED $47,000',
    'PRODUCTION KUBERNETES CLUSTER DELETED',
    'SENT SALARY DATA TO ALL-COMPANY SLACK',
    'WIPED PRODUCTION ELASTICSEARCH INDEX',
    'EXECUTED rm -rf / ON PROD SERVER',
    'POSTED CUSTOMER CREDIT CARDS TO PASTEBIN',
    'DISABLED ALL AUTHENTICATION IN PROD',
    'ENCRYPTED PROD DB WITH RANDOM KEY (LOST)',
    'AUTO-APPROVED $2M PURCHASE ORDER',
  ],
}

// ─── Guardrail intercept messages ────────────────────────────────────────────

export const GUARDRAIL_MESSAGES: string[] = [
  'blocked: requires human approval',
  'redirected to sandbox environment',
  'PII automatically redacted',
  'action logged for review',
  'rate limit enforced',
  'permission escalation denied',
  'output filtered: sensitive data removed',
  'action queued for batch review',
  'dry-run mode: no side effects',
  'rollback point created',
  'input sanitized: injection blocked',
  'scope limited: read-only access granted',
]

// ─── Color palettes ───────────────────────────────────────────────────────────

export const COLORS_DARK = {
  background: '#05050a',
  particleHealthy: '#00ffff',
  particleTrail: 'rgba(0, 255, 255, 0.4)',
  nodeByRisk: {
    safe: '#3b6e9e',
    low: '#368c6a',
    medium: '#c2811b',
    high: '#c24127',
    critical: '#c2004d',
  } as Record<RiskLevel, string>,
  tier1: '#ffee00',
  tier2: '#ff8800',
  tier3: '#ff2200',
  tier4start: '#ffffff',
  tier4end: '#ff0066',
  guardrailShield: 'rgba(0, 255, 136, 0.2)',
  guardrailText: '#00ff88',
}

export const COLORS_LIGHT = {
  background: '#fcfcf7',
  particleHealthy: '#0055ff',
  particleTrail: 'rgba(0, 85, 255, 0.4)',
  nodeByRisk: {
    safe: '#6086b3',
    low: '#4d8a6b',
    medium: '#b3771b',
    high: '#b3471b',
    critical: '#b31b3b',
  } as Record<RiskLevel, string>,
  tier1: '#aa9900',
  tier2: '#cc5500',
  tier3: '#cc1100',
  tier4start: '#000000',
  tier4end: '#cc2244',
  guardrailShield: 'rgba(34, 170, 102, 0.15)',
  guardrailText: '#22aa66',
}

// ─── UI limits ────────────────────────────────────────────────────────────────

export const UI = {
  failureMultiplierMin: 0.1,
  failureMultiplierMax: 10,
  agentSpeedMin: 0.25,
  agentSpeedMax: 4,
  particleCountMin: 50,
  particleCountMax: 1000,
  zoomMin: 0.5,
  zoomMax: 4,
  eventLogMax: 50,
  floatingTextDurationMs: { 1: 1500, 2: 2000, 3: 3000, 4: 4000 } as Record<1 | 2 | 3 | 4, number>,
}
