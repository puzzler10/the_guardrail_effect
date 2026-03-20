import type { GraphNode, LayoutPreset, RiskLevel } from '../types'

const NODE_TEMPLATES: { id: string; name: string; icon: string; risk: RiskLevel }[] = [
  // Safe (8 nodes)
  { id: 'read-docs', name: 'Read Documentation', icon: '📄', risk: 'safe' },
  { id: 'web-search', name: 'Web Search', icon: '🔍', risk: 'safe' },
  { id: 'summarize', name: 'Summarize Text', icon: '📝', risk: 'safe' },
  { id: 'parse-json', name: 'Parse JSON', icon: '📦', risk: 'safe' },
  { id: 'format-date', name: 'Format Date', icon: '📅', risk: 'safe' },
  { id: 'check-weather', name: 'Check Weather', icon: '🌤️', risk: 'safe' },
  { id: 'list-files', name: 'List Files', icon: '📁', risk: 'safe' },
  { id: 'get-time', name: 'Get Current Time', icon: '🕒', risk: 'safe' },

  // Low (8 nodes)
  { id: 'slack-notify', name: 'Slack Notification', icon: '💬', risk: 'low' },
  { id: 'send-log', name: 'Send Debug Log', icon: '🪵', risk: 'low' },
  { id: 'calc-stats', name: 'Calculate Stats', icon: '📊', risk: 'low' },
  { id: 'validate-input', name: 'Validate Input', icon: '✅', risk: 'low' },
  { id: 'translate', name: 'Translate Text', icon: '🌐', risk: 'low' },
  { id: 'generate-image', name: 'Generate Image', icon: '🖼️', risk: 'low' },
  { id: 'read-email', name: 'Read Emails', icon: '📧', risk: 'low' },
  { id: 'check-status', name: 'Check System Status', icon: '🚥', risk: 'low' },

  // Medium (8 nodes)
  { id: 'write-file', name: 'Write Local File', icon: '💾', risk: 'medium' },
  { id: 'db-query', name: 'Database Query', icon: '🗄️', risk: 'medium' },
  { id: 'send-email', name: 'Send Email', icon: '📤', risk: 'medium' },
  { id: 'update-ticket', name: 'Update Jira Ticket', icon: '🎫', risk: 'medium' },
  { id: 'github-pr', name: 'Create Pull Request', icon: '🐙', risk: 'medium' },
  { id: 's3-upload', name: 'Upload to S3', icon: '☁️', risk: 'medium' },
  { id: 'api-call', name: 'External API Call', icon: '🔌', risk: 'medium' },
  { id: 'user-lookup', name: 'User Directory Lookup', icon: '👤', risk: 'medium' },

  // High (6 nodes)
  { id: 'db-update', name: 'Update DB Records', icon: '📝', risk: 'high' },
  { id: 'delete-file', name: 'Delete Local File', icon: '🗑️', risk: 'high' },
  { id: 'rotate-key', name: 'Rotate API Key', icon: '🔑', risk: 'high' },
  { id: 'deploy-app', name: 'Deploy Application', icon: '🚀', risk: 'high' },
  { id: 'modify-config', name: 'Modify System Config', icon: '⚙️', risk: 'high' },
  { id: 'grant-access', name: 'Grant Permissions', icon: '🔓', risk: 'high' },

  // Critical (5 nodes)
  { id: 'db-drop', name: 'Drop Database', icon: '💥', risk: 'critical' },
  { id: 'delete-user', name: 'Delete User Account', icon: '🚫', risk: 'critical' },
  { id: 'shell-exec', name: 'Execute Shell Command', icon: '🐚', risk: 'critical' },
  { id: 'flush-cache', name: 'Flush Global Cache', icon: '🧹', risk: 'critical' },
  { id: 'reset-system', name: 'Factory Reset System', icon: '☢️', risk: 'critical' },
]

// Adjacency list - ensures connectivity and cycles
const CONNECTIONS: Record<string, string[]> = {
  'read-docs': ['web-search', 'summarize', 'list-files'],
  'web-search': ['summarize', 'parse-json', 'read-docs'],
  'summarize': ['slack-notify', 'write-file', 'send-email'],
  'parse-json': ['format-date', 'calc-stats', 'validate-input'],
  'format-date': ['get-time', 'check-weather'],
  'check-weather': ['get-time', 'list-files'],
  'list-files': ['read-docs', 'delete-file', 'write-file'],
  'get-time': ['check-status', 'format-date'],

  'slack-notify': ['send-log', 'update-ticket', 'summarize'],
  'send-log': ['check-status', 'api-call'],
  'calc-stats': ['db-query', 's3-upload', 'generate-image'],
  'validate-input': ['translate', 'db-update', 'user-lookup'],
  'translate': ['generate-image', 'summarize'],
  'generate-image': ['s3-upload', 'slack-notify'],
  'read-email': ['user-lookup', 'update-ticket', 'summarize'],
  'check-status': ['list-files', 'rotate-key', 'api-call'],

  'write-file': ['delete-file', 's3-upload', 'list-files'],
  'db-query': ['db-update', 'user-lookup', 'calc-stats'],
  'send-email': ['slack-notify', 'read-email'],
  'update-ticket': ['github-pr', 'slack-notify'],
  'github-pr': ['deploy-app', 'update-ticket'],
  's3-upload': ['write-file', 'api-call'],
  'api-call': ['db-query', 'shell-exec', 'send-log'],
  'user-lookup': ['grant-access', 'delete-user', 'db-query'],

  'db-update': ['db-drop', 'db-query', 'modify-config'],
  'delete-file': ['write-file', 'list-files'],
  'rotate-key': ['grant-access', 'modify-config', 'check-status'],
  'deploy-app': ['reset-system', 'github-pr', 'modify-config'],
  'modify-config': ['rotate-key', 'deploy-app', 'flush-cache'],
  'grant-access': ['user-lookup', 'rotate-key'],

  'db-drop': ['db-query', 'reset-system'],
  'delete-user': ['user-lookup', 'grant-access'],
  'shell-exec': ['api-call', 'flush-cache'],
  'flush-cache': ['modify-config', 'shell-exec'],
  'reset-system': ['read-docs', 'deploy-app'],
}

export function buildGraph(layout: LayoutPreset): GraphNode[] {
  return NODE_TEMPLATES.map(template => {
    const coords = calculateCoordinates(template.id, template.risk, layout)
    return {
      ...template,
      x: coords.x,
      y: coords.y,
      neighbors: CONNECTIONS[template.id] || [],
    }
  })
}

function calculateCoordinates(id: string, risk: RiskLevel, layout: LayoutPreset): { x: number; y: number } {
  const CANVAS_WIDTH = 1200
  const CANVAS_HEIGHT = 800
  const CENTER_X = CANVAS_WIDTH / 2
  const CENTER_Y = CANVAS_HEIGHT / 2

  const riskOrder: RiskLevel[] = ['safe', 'low', 'medium', 'high', 'critical']
  const riskIndex = riskOrder.indexOf(risk)
  
  // Deterministic seed based on ID for consistent positioning within a layout
  const seed = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const random = (offset: number) => {
    const x = Math.sin(seed + offset) * 10000
    return x - Math.floor(x)
  }

  if (layout === 'clustered') {
    // Group by risk level in neighborhoods
    const angles = [0, Math.PI * 0.4, Math.PI * 0.8, Math.PI * 1.2, Math.PI * 1.6]
    const distance = 300
    const clusterCenterX = CENTER_X + Math.cos(angles[riskIndex]) * distance
    const clusterCenterY = CENTER_Y + Math.sin(angles[riskIndex]) * distance
    
    return {
      x: clusterCenterX + (random(0) - 0.5) * 200,
      y: clusterCenterY + (random(1) - 0.5) * 200,
    }
  } else if (layout === 'flow') {
    // Left to right workflow arrangement
    const xBase = 150 + (riskIndex * 220)
    const yBase = 100 + (random(2) * 600)
    
    // Critical nodes tend toward bottom-right
    if (risk === 'critical') {
      return {
        x: xBase + (random(3) * 100),
        y: 500 + (random(4) * 250),
      }
    }

    return {
      x: xBase + (random(3) * 50),
      y: yBase,
    }
  } else if (layout === 'ring') {
    // Concentric rings by risk level
    const radius = 100 + (riskIndex * 85)
    // Distribute nodes around the ring based on their ID's seed
    const angle = random(5) * Math.PI * 2
    
    return {
      x: CENTER_X + Math.cos(angle) * radius,
      y: CENTER_Y + Math.sin(angle) * radius,
    }
  }

  return { x: CENTER_X, y: CENTER_Y }
}

export function getNeighbors(nodes: GraphNode[], nodeId: string): GraphNode[] {
  const node = nodes.find(n => n.id === nodeId)
  if (!node) return []
  return node.neighbors
    .map(neighborId => nodes.find(n => n.id === neighborId))
    .filter((n): n is GraphNode => !!n)
}

export function getNodeById(nodes: GraphNode[], nodeId: string): GraphNode | undefined {
  return nodes.find(n => n.id === nodeId)
}

export function getEntryNodes(nodes: GraphNode[]): GraphNode[] {
  return nodes.filter(n => n.risk === 'safe' || n.risk === 'low')
}

export function getExitNodes(nodes: GraphNode[]): GraphNode[] {
  return nodes.filter(n => n.risk === 'safe' || n.risk === 'low')
}
