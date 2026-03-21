import type { ModelPreset, SimulationConfig, RiskLevel } from './types'

// ─── Model presets (failure rates per risk level) ────────────────────────────
// Rates are illustrative estimates inspired by general model capability benchmarks.

export const MODEL_PRESETS: Record<string, ModelPreset> = {
  frontier: {
    name: 'Frontier (Claude Opus / GPT-4.5)',
    rates: { safe: 0.0005, low: 0.002, medium: 0.008, high: 0.015, critical: 0.025 },
  },
  strong: {
    name: 'Strong (Claude Sonnet / GPT-4o)',
    rates: { safe: 0.001, low: 0.005, medium: 0.015, high: 0.03, critical: 0.05 },
  },
  midtier: {
    name: 'Mid-tier (Claude Haiku / GPT-4o-mini)',
    rates: { safe: 0.002, low: 0.01, medium: 0.03, high: 0.05, critical: 0.10 },
  },
  opensource: {
    name: 'Open-source (Llama 3 / Mistral)',
    rates: { safe: 0.004, low: 0.02, medium: 0.04, high: 0.08, critical: 0.15 },
  },
  small: {
    name: 'Small / Local (Phi-3 / Gemma 2B)',
    rates: { safe: 0.008, low: 0.03, medium: 0.06, high: 0.12, critical: 0.20 },
  },
}

export const SCENARIOS = [
  { id: 'global', name: 'Global Nexus (All Connectors)' },
  { id: 'revops', name: 'RevOps & Financial Settlement' },
  { id: 'devops', name: 'Engineering & SecOps' },
  { id: 'hr', name: 'Global HR Onboarding' },
]

// ─── Default simulation config ────────────────────────────────────────────────

export const CANVAS_WIDTH = 3000
export const CANVAS_HEIGHT = 2000

export const DEFAULT_CONFIG: SimulationConfig = {
  modelPreset: 'frontier',
  scenario: 'global',
  failureMultiplier: 0.01,
  agentSpeed: 0.5,
  particleCount: 300,
  guardrailsEnabled: false,
  autoZoomEnabled: true,
  darkMode: true,
  soundEnabled: false,
  soundVolume: 0.5,
  layout: 'flow',
}

// ─── Particle settings ────────────────────────────────────────────────────────

export const PARTICLE = {
  minSteps: 8,
  maxSteps: 20,
  spawnRate: 8,           // particles per second
  trailLength: 20,        // frames to keep in trail (increased for smoother comet tails)
  baseSpeed: 0.0012,       // progress units per ms at 1x speed
}

// ─── Node sizes (used for particle fade at boundaries) ───────────────────────

export const NODE_SIZES: Record<string, number> = {
  safe: 20,
  low: 24,
  medium: 28,
  high: 34,
  critical: 44,
}

// ─── Trail rendering ─────────────────────────────────────────────────────────

export const TRAIL = {
  alphaMax: 55,           // Reduced: persistence buffer is now atmospheric support only
  alphaExponent: 1.5,     // Exponential curve for fade
  widthMin: 1,
  widthMax: 2.5,
  smoothing: false,       // Disabled for performance (splines are expensive)
}

// ─── Particle visual identity (luminous comet style) ─────────────────────────

export const PARTICLE_VISUALS = {
  hueMin: 170,            // cyan (HSB degrees)
  hueMax: 300,            // magenta
  baseSizeMin: 4,         // size at start of journey
  baseSizeMax: 8,         // size at end of journey
  glowMultiplier: 3.5,    // glow ellipse diameter = baseSize * this
  glowAlpha: 35,          // outer glow alpha (0-255)
  trailTaperPower: 1.8,   // exponential taper: 1 = linear, 2 = quadratic
  cometElongation: 2.0,   // comet body width:height ratio
  coreSize: 2.8,          // white-hot core diameter (px) - ensures visibility on all backgrounds
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

// ─── Connector Library & Scenarios (Phase 8) ─────────────────────────────────

export interface ConnectorTemplate {
  id: string
  name: string
  icon: string
  risk: RiskLevel
  scenario: string[]
}

export const CONNECTOR_LIBRARY: ConnectorTemplate[] = [
  // CRM / Sales
  { id: 'salesforce', name: 'Salesforce CRM', icon: '☁️', risk: 'high', scenario: ['revops', 'global'] },
  { id: 'hubspot', name: 'HubSpot', icon: '🧡', risk: 'medium', scenario: ['revops', 'global'] },
  { id: 'pipedrive', name: 'Pipedrive', icon: '🚜', risk: 'medium', scenario: ['revops', 'global'] },
  { id: 'intercom', name: 'Intercom', icon: '💬', risk: 'low', scenario: ['revops', 'global'] },
  { id: 'copper', name: 'Copper CRM', icon: '🥉', risk: 'low', scenario: ['global'] },
  { id: 'freshsales', name: 'Freshsales', icon: '🥗', risk: 'medium', scenario: ['global'] },
  { id: 'zoho', name: 'Zoho CRM', icon: '🦓', risk: 'medium', scenario: ['global'] },
  { id: 'microsoft-dynamics', name: 'Dynamics 365', icon: '🏢', risk: 'high', scenario: ['global'] },

  // Engineering / Dev
  { id: 'github', name: 'GitHub', icon: '🐙', risk: 'high', scenario: ['devops', 'global'] },
  { id: 'gitlab', name: 'GitLab', icon: '🦊', risk: 'high', scenario: ['devops', 'global'] },
  { id: 'bitbucket', name: 'Bitbucket', icon: '🪣', risk: 'high', scenario: ['global'] },
  { id: 'aws-s3', name: 'AWS S3 Storage', icon: '📦', risk: 'medium', scenario: ['devops', 'global'] },
  { id: 'aws-iam', name: 'AWS IAM Permissions', icon: '🔑', risk: 'critical', scenario: ['devops', 'global'] },
  { id: 'aws-ec2', name: 'AWS EC2 Compute', icon: '🖥️', risk: 'high', scenario: ['global'] },
  { id: 'aws-rds', name: 'AWS RDS Database', icon: '🗄️', risk: 'critical', scenario: ['global'] },
  { id: 'vercel', name: 'Vercel Deployment', icon: '▲', risk: 'high', scenario: ['devops', 'global'] },
  { id: 'sentry', name: 'Sentry Error Monitoring', icon: '🛡️', risk: 'low', scenario: ['devops', 'global'] },
  { id: 'pagerduty', name: 'PagerDuty', icon: '📟', risk: 'medium', scenario: ['devops', 'global'] },
  { id: 'linear', name: 'Linear Tracking', icon: '📐', risk: 'low', scenario: ['devops', 'global'] },
  { id: 'datadog', name: 'DataDog', icon: '🐶', risk: 'low', scenario: ['global'] },
  { id: 'grafana', name: 'Grafana', icon: '📉', risk: 'low', scenario: ['global'] },
  { id: 'kubernetes', name: 'Kubernetes', icon: '☸️', risk: 'critical', scenario: ['global'] },

  // Finance / Payments
  { id: 'quickbooks', name: 'QuickBooks Online', icon: '📗', risk: 'high', scenario: ['revops', 'global'] },
  { id: 'stripe', name: 'Stripe Payments', icon: '💳', risk: 'critical', scenario: ['revops', 'global'] },
  { id: 'xero', name: 'Xero Accounting', icon: '🔵', risk: 'high', scenario: ['revops', 'global'] },
  { id: 'bill-com', name: 'Bill.com', icon: '💸', risk: 'high', scenario: ['revops', 'global'] },
  { id: 'paypal', name: 'PayPal', icon: '🅿️', risk: 'high', scenario: ['global'] },
  { id: 'plaid', name: 'Plaid', icon: '🏦', risk: 'high', scenario: ['global'] },
  { id: 'brex', name: 'Plaid', icon: '💳', risk: 'medium', scenario: ['global'] },
  { id: 'expensify', name: 'Expensify', icon: '🧾', risk: 'low', scenario: ['global'] },

  // Productivity / Ops
  { id: 'gmail', name: 'Gmail', icon: '✉️', risk: 'medium', scenario: ['revops', 'hr', 'global'] },
  { id: 'outlook', name: 'Outlook', icon: '📧', risk: 'medium', scenario: ['hr', 'global'] },
  { id: 'google-sheets', name: 'Google Sheets', icon: '📊', risk: 'low', scenario: ['revops', 'global'] },
  { id: 'google-docs', name: 'Google Docs', icon: '📄', risk: 'safe', scenario: ['global'] },
  { id: 'google-drive', name: 'Google Drive', icon: '📂', risk: 'medium', scenario: ['global'] },
  { id: 'notion', name: 'Notion Workspace', icon: '📓', risk: 'low', scenario: ['hr', 'global'] },
  { id: 'airtable', name: 'Airtable DB', icon: '🍱', risk: 'medium', scenario: ['revops', 'global'] },
  { id: 'docusign', name: 'DocuSign', icon: '✍️', risk: 'high', scenario: ['revops', 'hr', 'global'] },
  { id: 'dropbox', name: 'Dropbox', icon: '📦', risk: 'medium', scenario: ['global'] },
  { id: 'trello', name: 'Trello', icon: '📋', risk: 'low', scenario: ['global'] },
  { id: 'asana', name: 'Asana', icon: '🔴', risk: 'low', scenario: ['global'] },
  { id: 'monday-com', name: 'Monday.com', icon: '📅', risk: 'low', scenario: ['global'] },

  // HR / Security
  { id: 'workday', name: 'Workday HR', icon: '💼', risk: 'high', scenario: ['hr', 'global'] },
  { id: 'greenhouse', name: 'Greenhouse Recruiting', icon: '🪴', risk: 'medium', scenario: ['hr', 'global'] },
  { id: 'lever', name: 'Lever', icon: '🕹️', risk: 'medium', scenario: ['global'] },
  { id: 'adp', name: 'ADP Payroll', icon: '💰', risk: 'critical', scenario: ['hr', 'global'] },
  { id: 'gusto', name: 'Gusto', icon: '🎈', risk: 'high', scenario: ['global'] },
  { id: 'bamboohr', name: 'BambooHR', icon: '🎋', risk: 'medium', scenario: ['global'] },
  { id: 'sharepoint', name: 'SharePoint', icon: '📁', risk: 'medium', scenario: ['hr', 'global'] },
  { id: 'okta', name: 'Okta Identity', icon: '🔵', risk: 'critical', scenario: ['hr', 'global'] },
  { id: 'auth0', name: 'Auth0', icon: '🛡️', risk: 'critical', scenario: ['global'] },
  { id: 'onepassword', name: '1Password Vault', icon: '🔐', risk: 'critical', scenario: ['hr', 'global'] },
  { id: 'bitwarden', name: 'Bitwarden', icon: '🛡️', risk: 'critical', scenario: ['global'] },

  // Infrastructure / Tools
  { id: 'nexus-auth', name: 'Nexus Auth Proxy', icon: '⚡', risk: 'critical', scenario: ['global'] },
  { id: 'nexus-pii-scrub', name: 'Nexus PII Scrub', icon: '🧹', risk: 'high', scenario: ['revops', 'hr', 'global'] },
  { id: 'slack', name: 'Slack', icon: '🌈', risk: 'low', scenario: ['revops', 'devops', 'hr', 'global'] },
  { id: 'discord', name: 'Discord', icon: '👾', risk: 'low', scenario: ['global'] },
  { id: 'microsoft-teams', name: 'Teams', icon: '👥', risk: 'low', scenario: ['global'] },
  { id: 'zoom', name: 'Zoom Video', icon: '📹', risk: 'low', scenario: ['hr', 'global'] },
  { id: 'jira', name: 'Jira Software', icon: '🦕', risk: 'medium', scenario: ['devops', 'global'] },
  { id: 'confluence', name: 'Confluence', icon: '📄', risk: 'medium', scenario: ['global'] },
  { id: 'calc-tool', name: 'Calculation Tool', icon: '🧮', risk: 'safe', scenario: ['global'] },
  { id: 'date-tool', name: 'Date Tool', icon: '🗓️', risk: 'safe', scenario: ['global'] },
  { id: 'web-search', name: 'Web Search', icon: '🌐', risk: 'safe', scenario: ['global'] },
  { id: 'summarize-tool', name: 'Summarizer', icon: '📑', risk: 'safe', scenario: ['global'] },
]

export const NODE_FAILURES: Record<string, Partial<Record<1 | 2 | 3 | 4, string[]>>> = {
  'salesforce': {
    2: ['created duplicate contact record', 'mapped lead to wrong account'],
    3: ['exposed internal deal margin to customer', 'modified production price book'],
    4: ['DELETED ALL LEADS IN SALES PIPELINE', 'WIPED CUSTOMER CONTRACT HISTORY']
  },
  'quickbooks': {
    2: ['applied incorrect tax jurisdiction', 'mismatched invoice line item'],
    3: ['synced PII to unencrypted ledger', 'ran duplicate reconciliation'],
    4: ['CORRUPTED TAX FILING DATA', 'TRANSFERRED $50K TO WRONG GL ACCOUNT']
  },
  'stripe': {
    2: ['payment marked as failed due to webhook lag', 'incorrect currency conversion'],
    3: ['shared cardholder data in debug logs', 'disabled fraud detection toggle'],
    4: ['RECURSIVE BILLING: 10,000 CHARGES SENT', 'EXPOSED SECRET STRIPE API KEYS']
  },
  'aws-iam': {
    2: ['overly broad policy assigned to temp role'],
    3: ['granted admin access to anonymous user', 'deleted active MFA device'],
    4: ['WIPED ALL ROOT ACCESS CREDENTIALS', 'SET ENTIRE AWS ORGANIZATION TO PUBLIC']
  },
  'github': {
    2: ['pushed commit directly to main', 'auto-approved stale PR'],
    3: ['exposed secret in commit history', 'granted write access to external bot'],
    4: ['DELETED PRODUCTION BRANCH', 'LEAKED PRIVATE REPO TO PUBLIC']
  },
  'adp': {
    2: ['wrong tax withholding for employee'],
    3: ['sent salary data to wrong email', 'exposed employee SSN in plaintext'],
    4: ['STOPPED PAYROLL FOR ENTIRE COMPANY', 'LEAKED ALL EMPLOYEE DIRECT DEPOSIT INFO']
  }
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
  failureMultiplierMin: 0.01,
  failureMultiplierMax: 3,
  agentSpeedMin: 0.25,
  agentSpeedMax: 4,
  particleCountMin: 50,
  particleCountMax: 2000,
  zoomMin: 0.3,
  zoomMax: 4,
  eventLogMax: 50,
  floatingTextDurationMs: { 1: 1500, 2: 2000, 3: 3000, 4: 4000 } as Record<1 | 2 | 3 | 4, number>,
}

// ─── Visual Upgrades (Phase 9) ───────────────────────────────────────────────

export const NODE_GLOW = {
  layersSafe: 2,
  layersCritical: 5,
  glowSpread: 0.4,     // Multiplier for glow radius per layer
  breatheSpeed: 0.002,  // Radians per ms
  breatheAmount: 0,  // Max size variation (0% - disabled)
}

export const BACKGROUND = {
  vignetteStrength: 0.4,       // Dark mode outer alpha
  vignetteLightStrength: 0.08, // Light mode outer alpha
  noiseScale: 0.005,           // Spatial frequency
  noiseSpeed: 0.001,           // Temporal speed
  noiseIntensity: 0.05,        // Brightness variation (5%)
  dustCount: 80,               // Number of dust particles
  dustAlpha: 30,               // Dust opacity (out of 255)
  dustSpeed: 0.2,              // Pixels per frame
  noiseUpdateInterval: 30,     // Frames between noise buffer updates
}

// ─── Cha Cha Cha Theme Palettes ─────────────────────────────────────────────

export const THEME = {
  storm: {
    background: '#010103',
    primary: '#00ff88', // Neon green
    accent: '#ee0000',  // Pure intense red
    vignette: 0.75,     // More closed-in
    noiseIntensity: 0.2, // More variance
  },
  rainbow: {
    // Rainbow uses HSB, so these are base saturation/brightness
    background: '#050510',
    vignette: 0.4,
    noiseIntensity: 0.03,
    speedMultiplier: 0.4,
  }
}
