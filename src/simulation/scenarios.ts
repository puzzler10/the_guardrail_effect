import { CONNECTOR_LIBRARY } from '../config'
import type { GraphNode } from '../types'
import type { LayoutPreset } from '../types'

export interface ScenarioDefinition {
  id: string
  name: string
  nodes: { id: string; x: number; y: number }[]
  connections: Record<string, string[]>
}

export const SCENARIO_DEFINITIONS: Record<string, ScenarioDefinition> = {
  revops: {
    id: 'revops',
    name: 'RevOps & Financial Settlement',
    nodes: [
      { id: 'salesforce', x: 200, y: 300 },
      { id: 'gmail', x: 450, y: 200 },
      { id: 'nexus-pii-scrub', x: 700, y: 250 },
      { id: 'docusign', x: 950, y: 200 },
      { id: 'slack', x: 1200, y: 350 },
      { id: 'stripe', x: 1450, y: 250 },
      { id: 'quickbooks', x: 1700, y: 300 },
      { id: 'hubspot', x: 450, y: 400 },
      { id: 'airtable', x: 700, y: 450 },
      { id: 'google-sheets', x: 1700, y: 500 },
    ],
    connections: {
      'salesforce': ['gmail', 'hubspot'],
      'hubspot': ['gmail', 'airtable'],
      'gmail': ['nexus-pii-scrub'],
      'airtable': ['nexus-pii-scrub'],
      'nexus-pii-scrub': ['docusign'],
      'docusign': ['slack', 'stripe'],
      'stripe': ['quickbooks', 'google-sheets'],
      'quickbooks': ['slack'],
      'google-sheets': ['slack'],
    }
  },
  devops: {
    id: 'devops',
    name: 'Engineering & SecOps',
    nodes: [
      { id: 'sentry', x: 200, y: 300 },
      { id: 'jira', x: 450, y: 250 },
      { id: 'github', x: 700, y: 200 },
      { id: 'nexus-auth', x: 950, y: 250 },
      { id: 'aws-iam', x: 1200, y: 200 },
      { id: 'vercel', x: 1450, y: 250 },
      { id: 'aws-s3', x: 1700, y: 350 },
      { id: 'pagerduty', x: 450, y: 450 },
      { id: 'slack', x: 1200, y: 500 },
      { id: 'linear', x: 700, y: 400 },
    ],
    connections: {
      'sentry': ['jira', 'pagerduty'],
      'pagerduty': ['slack', 'jira'],
      'jira': ['linear', 'github'],
      'linear': ['github'],
      'github': ['nexus-auth', 'vercel'],
      'nexus-auth': ['aws-iam'],
      'aws-iam': ['vercel', 'aws-s3'],
      'vercel': ['slack'],
      'aws-s3': ['slack'],
    }
  },
  hr: {
    id: 'hr',
    name: 'Global HR Onboarding',
    nodes: [
      { id: 'greenhouse', x: 200, y: 350 },
      { id: 'workday', x: 450, y: 300 },
      { id: 'nexus-pii-scrub', x: 700, y: 350 },
      { id: 'adp', x: 950, y: 300 },
      { id: 'sharepoint', x: 1200, y: 250 },
      { id: 'outlook', x: 1450, y: 300 },
      { id: 'onepassword', x: 1700, y: 350 },
      { id: 'okta', x: 950, y: 500 },
      { id: 'zoom', x: 1450, y: 500 },
      { id: 'slack', x: 1850, y: 400 },
      { id: 'notion', x: 1200, y: 550 },
    ],
    connections: {
      'greenhouse': ['workday'],
      'workday': ['nexus-pii-scrub'],
      'nexus-pii-scrub': ['adp', 'sharepoint'],
      'adp': ['okta', 'outlook'],
      'sharepoint': ['notion', 'outlook'],
      'outlook': ['zoom', 'onepassword'],
      'zoom': ['slack'],
      'onepassword': ['slack'],
      'okta': ['onepassword'],
      'notion': ['slack'],
    }
  }
}

export function buildScenarioGraph(scenarioId: string, layout: LayoutPreset = 'flow'): GraphNode[] {
  const def = SCENARIO_DEFINITIONS[scenarioId]
  if (!def) return []

  // Build initial nodes with template data
  const rawNodes = def.nodes.map(n => {
    const template = CONNECTOR_LIBRARY.find(t => t.id === n.id)
    return {
      id: n.id,
      name: template?.name || n.id,
      icon: template?.icon || '❓',
      risk: template?.risk || ('medium' as const),
      flowX: n.x,
      flowY: n.y,
      neighbors: def.connections[n.id] || []
    }
  })

  if (layout === 'flow') {
    // Use hardcoded positions — they're already designed as flow layouts
    return rawNodes.map(n => ({ ...n, x: n.flowX, y: n.flowY }))
  }

  // For clustered/ring: reposition by risk level
  const CANVAS_WIDTH = 2000
  const CANVAS_HEIGHT = 1400
  const CENTER_X = CANVAS_WIDTH / 2
  const CENTER_Y = CANVAS_HEIGHT / 2
  const riskOrder = ['safe', 'low', 'medium', 'high', 'critical'] as const

  // Group by risk
  const byRisk: Record<string, typeof rawNodes> = {}
  for (const r of riskOrder) byRisk[r] = []
  for (const n of rawNodes) byRisk[n.risk].push(n)

  return rawNodes.map(n => {
    const riskIndex = riskOrder.indexOf(n.risk)
    const group = byRisk[n.risk]
    const index = group.indexOf(n)
    const count = group.length

    const seed = n.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
    const jitter = (amount: number) => Math.sin(seed) * amount

    let x: number, y: number
    if (layout === 'clustered') {
      const angles = [0, Math.PI * 0.4, Math.PI * 0.8, Math.PI * 1.2, Math.PI * 1.6]
      const dist = 450
      const cx = CENTER_X + Math.cos(angles[riskIndex]) * dist
      const cy = CENTER_Y + Math.sin(angles[riskIndex]) * dist
      const localAngle = (index / Math.max(count, 1)) * Math.PI * 2
      const localDist = 60 + index * 15
      x = cx + Math.cos(localAngle) * localDist + jitter(20)
      y = cy + Math.sin(localAngle) * localDist + jitter(20)
    } else { // ring
      const radius = 200 + riskIndex * 150
      const angleOffset = riskIndex * 0.5
      const angle = angleOffset + (index / Math.max(count, 1)) * Math.PI * 2
      x = CENTER_X + Math.cos(angle) * radius + jitter(10)
      y = CENTER_Y + Math.sin(angle) * radius + jitter(10)
    }

    return { ...n, x, y }
  })
}
