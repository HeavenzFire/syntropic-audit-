

import { ContractData, ProvenanceRecord, UserRole, EntityStatus, DefenseArtifact, DefenseVector, SystemLog } from '../types';

// --- CRYPTOGRAPHIC CORE ---
// Uses the browser's native Web Crypto API for real hashing
async function generateHash(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// --- PERMISSION MATRIX ---
const PERMISSIONS: Record<UserRole, string[]> = {
  'VIEWER': ['read', 'export_public'],
  'ANALYST': ['read', 'export_public', 'flag', 'annotate'],
  'ADMIN': ['read', 'export_public', 'export_sensitive', 'flag', 'annotate', 'ban', 'override']
};

// --- SOVEREIGNTY ENGINE ---
export class SystemKernel {
  private userRole: UserRole;
  private username: string;
  private logs: SystemLog[] = []; // Internal log for the kernel

  constructor(role: UserRole = 'VIEWER', username: string = 'guest') {
    this.userRole = role;
    this.username = username;
  }

  public setUser(role: UserRole, username: string) {
    this.userRole = role;
    this.username = username;
  }

  public getUser() {
      return { role: this.userRole, name: this.username };
  }

  public can(action: string): boolean {
    return PERMISSIONS[this.userRole].includes(action);
  }

  // Add a log entry to the kernel's internal log
  public addLog(level: SystemLog['level'], message: string, source: string = 'CORE_KERNEL') {
    this.logs.push({
      id: Math.random().toString(36),
      timestamp: new Date().toISOString(),
      level,
      message,
      source
    });
    // Optionally, expose this via a getter or callback if needed by App.tsx directly
  }

  // INGESTION PIPELINE: Takes raw data, scores it, hashes it, and initializes the record.
  public async ingest(raw: any): Promise<ContractData> {
    const confidence = this.calculateConfidence(raw);
    const status: EntityStatus = confidence > 0.95 ? 'BLOCKED' : confidence > 0.8 ? 'VERIFIED' : 'PENDING_REVIEW';
    const timestamp = new Date().toISOString();
    
    // Create initial provenance record
    const initialHash = await generateHash(JSON.stringify(raw));
    const genesisRecord: ProvenanceRecord = {
      timestamp,
      actor: 'SYSTEM_KERNEL',
      action: 'INGESTION',
      hash: initialHash,
      signature: 'AUTO_GENERATED_SIG'
    };

    return {
      id: raw.id || Math.random().toString(36).substr(2, 9),
      recipient: raw.recipient,
      amount: raw.amount,
      description: raw.description,
      category: raw.category,
      timestamp,
      status,
      confidenceScore: confidence,
      provenance: [genesisRecord]
    };
  }

  // HEURISTIC ANALYSIS
  private calculateConfidence(data: any): number {
    let score = 0.5; // Base confidence

    // 1. Value Heuristic - Follow the money
    if (data.amount > 1000000) score += 0.1;
    if (data.amount > 10000000) score += 0.1;
    if (data.amount > 100000000) score += 0.15;

    // 2. Keyword Heuristic (Simplified for client-side)
    const highRiskKeywords = ['BIOMETRIC', 'SURVEILLANCE', 'AUTONOMOUS', 'WARFARE', 'TRACKING', 'BEHAVIORAL', 'PREDICTIVE', 'RECOGNITION'];
    if (highRiskKeywords.some((kw: string) => data.category.toUpperCase().includes(kw))) {
      score += 0.25;
    }
    if (data.description.toUpperCase().includes("AI") || data.description.toUpperCase().includes("INTELLIGENCE")) {
        score += 0.15;
    }

    return Math.min(score, 0.99);
  }

  // STATE TRANSITION: APPROVE / BAN
  // Added actorOverride to allow Agents (like Tesla) to sign actions
  public async updateStatus(item: ContractData, newStatus: EntityStatus, reason: string, actorOverride?: string): Promise<ContractData> {
    // If an override is provided (e.g. System Agent), bypass RBAC for user
    if (!actorOverride && !this.can('ban') && (newStatus === 'BLOCKED' || newStatus === 'VERIFIED')) {
      throw new Error("ACCESS_DENIED: Insufficient privileges for state transition.");
    }

    const timestamp = new Date().toISOString();
    const changePayload = `${item.id}:${item.status}->${newStatus}:${reason}`;
    const hash = await generateHash(changePayload);

    const actorName = actorOverride || this.username;

    const newRecord: ProvenanceRecord = {
      timestamp,
      actor: actorName,
      action: `STATUS_CHANGE_TO_${newStatus}`,
      hash,
      signature: `${actorName}_SIG_${Date.now()}` // Simulating a digital signature
    };

    return {
      ...item,
      status: newStatus,
      provenance: [newRecord, ...item.provenance] // Append-only log
    };
  }

  // EXPORT GENERATION
  private normalizeDomain(name: string): string {
    let clean = name.toLowerCase();
    // Remove legal entity suffixes
    clean = clean.replace(/,?\s?(inc|llc|corp|corporation|ltd|company|co|technologies|solutions|systems|services|international)\.?$/, '');
    // Remove special chars and spaces
    clean = clean.replace(/[^a-z0-9]/g, '');
    return clean;
  }

  public async generateExport(data: ContractData[], type: DefenseVector): Promise<DefenseArtifact> {
    const activeData = data.filter(d => d.status === 'BLOCKED' || d.status === 'VERIFIED');
    const uniqueEntities = Array.from(new Set(activeData.map(d => d.recipient)));
    
    const header = `# ARKONIS PRIME SOVEREIGN DEFENSE ARTIFACT
# MISSION: DISRUPT SURVEILLANCE CAPITALISM
# GENERATED: ${new Date().toISOString()}
# TARGETS: ${uniqueEntities.length}
# HASH: SIGNED_BY_KERNEL
`;

    let content = '';
    let filename = '';
    
    switch (type) {
        case 'json':
            content = JSON.stringify(activeData.map(d => ({
                entity: d.recipient,
                risk_score: d.confidenceScore,
                status: d.status,
                total_value: d.amount,
                category: d.category,
                last_verified: d.provenance[0].timestamp,
                provenance_hash: d.provenance[0].hash
            })), null, 2);
            filename = 'arkonis_payload.json';
            break;

        case 'csv':
            content = "entity,domain,risk_score,status,value_exposed\n";
            uniqueEntities.forEach(e => {
                const record = activeData.find(d => d.recipient === e);
                const domain = this.normalizeDomain(e);
                content += `"${e}","${domain}.com",${record?.confidenceScore.toFixed(2)},"BLOCKED",${record?.amount}\n`;
            });
            filename = 'arkonis_manifest.csv';
            break;

        case 'hosts':
            content = `${header}\n# DEPLOY TO: /etc/hosts (Linux/Mac) or C:\\Windows\\System32\\drivers\\etc\\hosts\n\n127.0.0.1 localhost\n`;
            uniqueEntities.forEach(e => {
                const domain = this.normalizeDomain(e);
                content += `0.0.0.0 ${domain}.com\n`;
                content += `0.0.0.0 www.${domain}.com\n`;
                content += `0.0.0.0 api.${domain}.com\n`;
                content += `0.0.0.0 telemetry.${domain}.com\n`;
            });
            filename = 'arkonis_hosts.txt';
            break;

        case 'pihole':
            content = `${header}\n# DEPLOY TO: Pi-hole Admin > Adlists\n`;
            uniqueEntities.forEach(e => {
                const domain = this.normalizeDomain(e);
                content += `${domain}.com\n`;
                content += `www.${domain}.com\n`;
                content += `api.${domain}.com\n`;
            });
            filename = 'arkonis_pihole.txt';
            break;

        case 'dnsmasq':
            // Format: address=/domain.com/0.0.0.0
            content = `${header}\n# DEPLOY TO: /etc/dnsmasq.d/arkonis.conf (OpenWRT/DD-WRT)\n`;
            uniqueEntities.forEach(e => {
                const domain = this.normalizeDomain(e);
                content += `address=/${domain}.com/0.0.0.0\n`;
            });
            filename = 'arkonis_dnsmasq.conf';
            break;

        case 'unbound':
            // Format: local-zone: "domain.com" redirect \n local-data: "domain.com A 0.0.0.0"
            content = `${header}\n# DEPLOY TO: OPNsense/PfSense Unbound DNS\n\nserver:\n`;
            uniqueEntities.forEach(e => {
                const domain = this.normalizeDomain(e);
                content += `local-zone: "${domain}.com" redirect\n`;
                content += `local-data: "${domain}.com A 0.0.0.0"\n`;
            });
            filename = 'arkonis_unbound.conf';
            break;

        case 'littlesnitch':
            // Little Snitch JSON Rule Group
            const rules = uniqueEntities.map(e => {
                const domain = this.normalizeDomain(e);
                return {
                    "action": "deny",
                    "process": "any",
                    "remote-hosts": `${domain}.com`,
                    "direction": "outgoing",
                    "notes": `Blocked by Arkonis Prime. Target: ${e}`
                };
            });
            content = JSON.stringify({
                "description": "Arkonis Prime Sovereign Blocklist - Disrupt Surveillance",
                "name": "Arkonis Defense",
                "rules": rules
            }, null, 2);
            filename = 'arkonis_littlesnitch.lsrules';
            break;
    }

    const hash = await generateHash(content);
    
    return {
      name: filename,
      type,
      content,
      hash,
      timestamp: new Date().toISOString()
    };
  }
}