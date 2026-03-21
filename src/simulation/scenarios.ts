import { CONNECTOR_LIBRARY } from '../config'
import type { GraphNode } from '../types'

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

export function buildScenarioGraph(scenarioId: string): GraphNode[] {
  const def = SCENARIO_DEFINITIONS[scenarioId]
  if (!def) return []

  const nodes: GraphNode[] = def.nodes.map(n => {
    const template = CONNECTOR_LIBRARY.find(t => t.id === n.id)
    return {
      id: n.id,
      name: template?.name || n.id,
      icon: template?.icon || '❓',
      risk: template?.risk || 'medium',
      x: n.x,
      y: n.y,
      neighbors: def.connections[n.id] || []
    }
  })

  return nodes
}
