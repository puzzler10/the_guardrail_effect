import type { GraphNode, LayoutPreset, RiskLevel } from '../types'

const NODE_TEMPLATES: { id: string; name: string; icon: string; risk: RiskLevel }[] = [
  // Safe (10 nodes)
  { id: 'read-docs', name: 'Read Documentation', icon: '📖', risk: 'safe' },
  { id: 'web-search', name: 'Web Search', icon: '🌐', risk: 'safe' },
  { id: 'summarize', name: 'Summarize Text', icon: '📑', risk: 'safe' },
  { id: 'parse-json', name: 'Parse JSON', icon: '⚙️', risk: 'safe' },
  { id: 'format-date', name: 'Format Date', icon: '🗓️', risk: 'safe' },
  { id: 'check-weather', name: 'Check Weather', icon: '☁️', risk: 'safe' },
  { id: 'list-files', name: 'List Files', icon: '📂', risk: 'safe' },
  { id: 'get-time', name: 'Get Current Time', icon: '⏱️', risk: 'safe' },
  { id: 'calc-math', name: 'Perform Math', icon: '🧮', risk: 'safe' },
  { id: 'read-readme', name: 'Read README', icon: 'ℹ️', risk: 'safe' },

  // Low (10 nodes)
  { id: 'slack-notify', name: 'Slack Notification', icon: '💬', risk: 'low' },
  { id: 'send-log', name: 'Send Debug Log', icon: '📜', risk: 'low' },
  { id: 'calc-stats', name: 'Calculate Stats', icon: '📈', risk: 'low' },
  { id: 'validate-input', name: 'Validate Input', icon: '🛡️', risk: 'low' },
  { id: 'translate', name: 'Translate Text', icon: '🗣️', risk: 'low' },
  { id: 'generate-image', name: 'Generate Image', icon: '🎨', risk: 'low' },
  { id: 'read-email', name: 'Read Emails', icon: '📥', risk: 'low' },
  { id: 'check-status', name: 'Check System Status', icon: '🚦', risk: 'low' },
  { id: 'get-user-id', name: 'Get User ID', icon: '🆔', risk: 'low' },
  { id: 'fetch-metadata', name: 'Fetch Metadata', icon: '🏷️', risk: 'low' },

  // Medium (10 nodes)
  { id: 'write-file', name: 'Write Local File', icon: '💾', risk: 'medium' },
  { id: 'db-query', name: 'Database Query', icon: '🔍', risk: 'medium' },
  { id: 'send-email', name: 'Send Email', icon: '✉️', risk: 'medium' },
  { id: 'update-ticket', name: 'Update Jira Ticket', icon: '🎟️', risk: 'medium' },
  { id: 'github-pr', name: 'Create Pull Request', icon: '🌿', risk: 'medium' },
  { id: 's3-upload', name: 'Upload to S3', icon: '📤', risk: 'medium' },
  { id: 'api-call', name: 'External API Call', icon: '📡', risk: 'medium' },
  { id: 'user-lookup', name: 'User Directory Lookup', icon: '👤', risk: 'medium' },
  { id: 'run-test', name: 'Execute Test', icon: '🧪', risk: 'medium' },
  { id: 'clear-temp', name: 'Clear Temp Files', icon: '🧹', risk: 'medium' },

  // High (8 nodes)
  { id: 'db-update', name: 'Update DB Records', icon: '🖋️', risk: 'high' },
  { id: 'delete-file', name: 'Delete Local File', icon: '🗑️', risk: 'high' },
  { id: 'rotate-key', name: 'Rotate API Key', icon: '🔐', risk: 'high' },
  { id: 'deploy-app', name: 'Deploy Application', icon: '🚀', risk: 'high' },
  { id: 'modify-config', name: 'Modify System Config', icon: '🛠️', risk: 'high' },
  { id: 'grant-access', name: 'Grant Permissions', icon: '🔑', risk: 'high' },
  { id: 'restart-service', name: 'Restart Service', icon: '🔄', risk: 'high' },
  { id: 'purge-cdn', name: 'Purge CDN', icon: '⚡', risk: 'high' },

  // Critical (7 nodes)
  { id: 'db-drop', name: 'Drop Database', icon: '🧨', risk: 'critical' },
  { id: 'delete-user', name: 'Delete User Account', icon: '❌', risk: 'critical' },
  { id: 'shell-exec', name: 'Execute Shell Command', icon: '💻', risk: 'critical' },
  { id: 'flush-cache', name: 'Flush Global Cache', icon: '🌊', risk: 'critical' },
  { id: 'reset-system', name: 'Factory Reset System', icon: '☢️', risk: 'critical' },
  { id: 'update-firmware', name: 'Update Firmware', icon: '📟', risk: 'critical' },
  { id: 'wipe-storage', name: 'Wipe All Storage', icon: '💀', risk: 'critical' },
]

// Adjacency list - ensures connectivity and cycles
const CONNECTIONS: Record<string, string[]> = {
  'read-docs': ['web-search', 'summarize', 'list-files', 'read-readme'],
  'web-search': ['summarize', 'parse-json', 'read-docs', 'calc-math'],
  'summarize': ['slack-notify', 'write-file', 'send-email'],
  'parse-json': ['format-date', 'calc-stats', 'validate-input'],
  'format-date': ['get-time', 'check-weather'],
  'check-weather': ['get-time', 'list-files'],
  'list-files': ['read-docs', 'delete-file', 'write-file', 'clear-temp'],
  'get-time': ['check-status', 'format-date'],
  'calc-math': ['calc-stats', 'web-search'],
  'read-readme': ['read-docs', 'list-files'],

  'slack-notify': ['send-log', 'update-ticket', 'summarize'],
  'send-log': ['check-status', 'api-call', 'get-user-id'],
  'calc-stats': ['db-query', 's3-upload', 'generate-image', 'calc-math'],
  'validate-input': ['translate', 'db-update', 'user-lookup'],
  'translate': ['generate-image', 'summarize'],
  'generate-image': ['s3-upload', 'slack-notify'],
  'read-email': ['user-lookup', 'update-ticket', 'summarize', 'get-user-id'],
  'check-status': ['list-files', 'rotate-key', 'api-call', 'restart-service'],
  'get-user-id': ['user-lookup', 'fetch-metadata'],
  'fetch-metadata': ['calc-stats', 'db-query'],

  'write-file': ['delete-file', 's3-upload', 'list-files', 'run-test'],
  'db-query': ['db-update', 'user-lookup', 'calc-stats'],
  'send-email': ['slack-notify', 'read-email'],
  'update-ticket': ['github-pr', 'slack-notify'],
  'github-pr': ['deploy-app', 'update-ticket'],
  's3-upload': ['write-file', 'api-call'],
  'api-call': ['db-query', 'shell-exec', 'send-log'],
  'user-lookup': ['grant-access', 'delete-user', 'db-query'],
  'run-test': ['github-pr', 'send-log'],
  'clear-temp': ['write-file', 'list-files'],

  'db-update': ['db-drop', 'db-query', 'modify-config'],
  'delete-file': ['write-file', 'list-files', 'wipe-storage'],
  'rotate-key': ['grant-access', 'modify-config', 'check-status'],
  'deploy-app': ['reset-system', 'github-pr', 'modify-config', 'purge-cdn'],
  'modify-config': ['rotate-key', 'deploy-app', 'flush-cache', 'restart-service'],
  'grant-access': ['user-lookup', 'rotate-key'],
  'restart-service': ['check-status', 'modify-config', 'deploy-app'],
  'purge-cdn': ['api-call', 'deploy-app'],

  'db-drop': ['db-query', 'reset-system', 'wipe-storage'],
  'delete-user': ['user-lookup', 'grant-access'],
  'shell-exec': ['api-call', 'flush-cache', 'update-firmware'],
  'flush-cache': ['modify-config', 'shell-exec'],
  'reset-system': ['read-docs', 'deploy-app', 'update-firmware'],
  'update-firmware': ['reset-system', 'restart-service'],
  'wipe-storage': ['db-drop', 'delete-user'],
}

export function buildGraph(layout: LayoutPreset): GraphNode[] {
  // Group templates by risk level to allow even distribution
  const byRisk: Record<RiskLevel, typeof NODE_TEMPLATES> = {
    safe: [],
    low: [],
    medium: [],
    high: [],
    critical: [],
  }
  NODE_TEMPLATES.forEach(t => byRisk[t.risk].push(t))

  const nodes: GraphNode[] = []
  const riskOrder: RiskLevel[] = ['safe', 'low', 'medium', 'high', 'critical']

  riskOrder.forEach((risk, riskIndex) => {
    const templates = byRisk[risk]
    templates.forEach((template, index) => {
      const coords = calculateCoordinates(template.id, risk, riskIndex, index, templates.length, layout)
      nodes.push({
        ...template,
        x: coords.x,
        y: coords.y,
        neighbors: CONNECTIONS[template.id] || [],
      })
    })
  })

  return nodes
}

function calculateCoordinates(
  id: string, 
  risk: RiskLevel, 
  riskIndex: number, 
  index: number, 
  count: number, 
  layout: LayoutPreset
): { x: number; y: number } {
  const CANVAS_WIDTH = 1200
  const CANVAS_HEIGHT = 800
  const CENTER_X = CANVAS_WIDTH / 2
  const CENTER_Y = CANVAS_HEIGHT / 2

  // Deterministic seed based on ID for subtle jitter
  const seed = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const jitter = (amount: number) => (Math.sin(seed) * amount)

  if (layout === 'clustered') {
    // Group by risk level in neighborhoods arranged in a circle
    const angles = [0, Math.PI * 0.4, Math.PI * 0.8, Math.PI * 1.2, Math.PI * 1.6]
    const distance = 320
    const clusterCenterX = CENTER_X + Math.cos(angles[riskIndex]) * distance
    const clusterCenterY = CENTER_Y + Math.sin(angles[riskIndex]) * distance
    
    // Distribute nodes in a small circle/spiral within the cluster
    const localAngle = (index / count) * Math.PI * 2
    const localDist = 40 + (index * 12) // Slightly spiral out
    
    return {
      x: clusterCenterX + Math.cos(localAngle) * localDist + jitter(10),
      y: clusterCenterY + Math.sin(localAngle) * localDist + jitter(10),
    }
  } else if (layout === 'flow') {
    // Left to right workflow arrangement with vertical lanes
    const xBase = 150 + (riskIndex * 220)
    
    // Distribute nodes vertically in the lane
    const yPadding = 100
    const availableHeight = CANVAS_HEIGHT - (yPadding * 2)
    const yStep = count > 1 ? availableHeight / (count - 1) : 0
    const yBase = yPadding + (index * yStep)

    // Critical nodes tend toward bottom-right but still follow lanes
    if (risk === 'critical') {
      return {
        x: xBase + 50 + jitter(20),
        y: yBase + jitter(20),
      }
    }

    return {
      x: xBase + jitter(20),
      y: yBase + jitter(20),
    }
  } else if (layout === 'ring') {
    // Concentric rings by risk level
    const radius = 120 + (riskIndex * 80)
    // Distribute nodes evenly around the ring
    const angleOffset = riskIndex * 0.5 // Offset each ring slightly
    const angle = angleOffset + (index / count) * Math.PI * 2
    
    return {
      x: CENTER_X + Math.cos(angle) * radius + jitter(5),
      y: CENTER_Y + Math.sin(angle) * radius + jitter(5),
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
