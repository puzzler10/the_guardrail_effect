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
      { id: 'salesforce', x: 400, y: 500 },
      { id: 'gmail', x: 800, y: 300 },
      { id: 'nexus-pii-scrub', x: 1200, y: 400 },
      { id: 'docusign', x: 1600, y: 300 },
      { id: 'slack', x: 2000, y: 600 },
      { id: 'stripe', x: 2400, y: 400 },
      { id: 'quickbooks', x: 2700, y: 500 },
      { id: 'hubspot', x: 800, y: 700 },
      { id: 'airtable', x: 1200, y: 800 },
      { id: 'google-sheets', x: 2700, y: 900 },
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
      { id: 'sentry', x: 400, y: 500 },
      { id: 'jira', x: 800, y: 400 },
      { id: 'github', x: 1200, y: 300 },
      { id: 'nexus-auth', x: 1600, y: 400 },
      { id: 'aws-iam', x: 2000, y: 300 },
      { id: 'vercel', x: 2400, y: 400 },
      { id: 'aws-s3', x: 2700, y: 600 },
      { id: 'pagerduty', x: 800, y: 800 },
      { id: 'slack', x: 2000, y: 900 },
      { id: 'linear', x: 1200, y: 700 },
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
      { id: 'greenhouse', x: 400, y: 600 },
      { id: 'workday', x: 800, y: 500 },
      { id: 'nexus-pii-scrub', x: 1200, y: 600 },
      { id: 'adp', x: 1600, y: 500 },
      { id: 'sharepoint', x: 2000, y: 400 },
      { id: 'outlook', x: 2400, y: 500 },
      { id: 'onepassword', x: 2700, y: 600 },
      { id: 'okta', x: 1600, y: 900 },
      { id: 'zoom', x: 2400, y: 900 },
      { id: 'slack', x: 2850, y: 700 },
      { id: 'notion', x: 2000, y: 1000 },
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
