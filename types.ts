

export type EntityStatus = 'DETECTED' | 'PENDING_REVIEW' | 'VERIFIED' | 'BLOCKED' | 'FALSE_POSITIVE';

export type UserRole = 'VIEWER' | 'ANALYST' | 'ADMIN';

export interface ProvenanceRecord {
  timestamp: string;
  actor: string;
  action: string;
  hash: string; // SHA-256 hash of the data state at this point
  signature?: string; // Mock signature for this demo
}

export interface ContractData {
  id: string;
  recipient: string;
  amount: number;
  description: string;
  category: string;
  timestamp: string;
  status: EntityStatus;
  confidenceScore: number; // 0.0 to 1.0
  provenance: ProvenanceRecord[];
}

export type DefenseVector = 'hosts' | 'pihole' | 'dnsmasq' | 'unbound' | 'littlesnitch' | 'json' | 'csv';

export interface DefenseArtifact {
  name: string;
  type: DefenseVector;
  content: string;
  hash: string;
  timestamp: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'CRITICAL' | 'SUCCESS' | 'RESONANCE' | 'AGENT_COMM';
  message: string;
  source: string;
}

export interface EntityNode {
  id: string;
  group: 'intent' | 'entity';
  value: number; 
  label: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface EntityLink {
  source: string | EntityNode;
  target: string | EntityNode;
  value: number;
}

// --- AGENT TYPES ---
export type AgentRole = 'HUNTER' | 'ANALYST' | 'WARDEN' | 'TACTICAL' | 'ORCHESTRATOR' | 'ARCHITECT' | 'AUDITOR' | 'PROCESSOR' | 'STRATEGIST' | 'RESEARCHER';
export type AgentStatus = 'IDLE' | 'SCANNING' | 'ANALYZING' | 'BLOCKING' | 'OFFLINE' | 'SYNTHESIZING' | 'ISOLATING' | 'MAGNIFYING' | 'REPLICATING' | 'BOOTING' | 'TRAINING' | 'OFFENSIVE' | 'COORDINATING';
export type ModelID = 'GROK-1.5' | 'QWEN-72B' | 'META-LLAMA-3' | 'BLACKBOX-ZERO' | 'COPILOT-X' | 'GPT-4o-OMNI' | 'NIKOLA_TESLA_V1' | 'MISTRAL-LARGE' | 'GPT-3.5-TURBO' | 'CLAUDE-3-OPUS' | 'GEMINI-1.5-PRO';

export interface AgentTopology {
  architecture: string; // e.g., 'Transformer-XL', 'Vortex Mathematics', 'Graph Neural Network'
  version: number;     // e.g., 1.0, 369.0, 2.5
  adaptations: string[]; // e.g., ['DEFENSE-OPTIMIZED', 'OMEGA-AUGMENTED', 'PREDICTIVE_OPTICS']
}

export interface AgentMessage {
  senderId: string;
  receiverId: string;
  timestamp: string;
  type: 'REPORT' | 'REQUEST' | 'COORDINATION' | 'ALERT' | 'STATUS_UPDATE';
  content: string;
}

export interface Agent {
  id: string;
  name: ModelID;
  role: AgentRole;
  status: AgentStatus;
  currentTask: string;
  lastActive: string;
  efficiency: number; // 0-100+
  generation: number; // 0 for original, 1+ for replicas
  parentAgentId?: string;
  processSpeed: number; // Operations per tick (1 = standard, 2 = 2x speed, etc.)
  traits: string[]; // Evolutionary traits (e.g. 'QUANTUM_SYNC', 'PRECOGNITION')
  topology: AgentTopology; // The "Mind Pattern" (e.g. Vortex Math, Transformer, etc.)
  evolutionLog: ProvenanceRecord[]; // Immutable record of evolutionary changes
  internalInbox: AgentMessage[]; // Messages from other agents
}

// --- COORDINATION TYPES ---
export type Directive = 'SILENT_WATCH' | 'ACTIVE_DEFENSE' | 'PROTOCOL_OMEGA' | 'TOTAL_RECALL';

export interface SharedMemory {
    rawIntelCount: number;
    verifiedThreats: number;
    activeBlocks: number;
    globalCoherence: number; // 0-1.0
    lastSignal: string;
}

// --- TERMINAL TYPES ---
export type ShellType = 'BASH' | 'POWERSHELL' | 'PYTHON' | 'CROSH' | 'UBUNTU' | 'TERMUX';