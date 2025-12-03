import { GoogleGenAI } from "@google/genai";
import { Agent, AgentRole, AgentStatus, ContractData, ModelID, Directive, SharedMemory, ProvenanceRecord, AgentTopology, AgentMessage } from '../types';
import { SystemKernel } from './kernel';
import { TARGET_KEYWORDS, COMPLEX_DATASETS } from '../constants';

// Mock companies for Hunter agent to "discover"
const COMPANIES = [
    "NORTHROP GRUMMAN", "BOEING DEFENSE", "L3HARRIS", "GENERAL DYNAMICS", 
    "CACI INTERNATIONAL", "SAIC", "LEIDOS", "BOOZ ALLEN HAMILTON", 
    "PALANTIR", "RAYTHEON", "ANDURIL", "CLEARVIEW", "BANJO", "VIGILANT",
    "DATAMINR", "CELLEBRITE", "NSO GROUP", "AXON ENTERPRISE", "META", "X CORP", "FACEBOOK", "INSTAGRAM"
];

const EVOLUTION_TRAITS = [
    'QUANTUM_SYNC', // Double processing speed
    'PRECOGNITION', // Higher target acquisition rate
    'HYPER_THREADED', // Can multitask (simulated)
    'NEURAL_DENSITY', // Efficiency boost
    'ZERO_LATENCY', // Faster updates
    'VOID_WALKER', // Undetectable scanning
    'OMNISCIENT', // Max keyword matching
    'HIVE_MIND',   // Faster shared memory access
    'SELF_AWARE',   // Rare trait
    'RESONANCE_LINK', // Tesla connection
    'ADAPTIVE_LEARNING', // Learns faster from new data
    'DATA_FUSION', // Better at correlating disparate data
    'ENTROPY_NEGATION' // Resists degradation
];

// Traits gained at specific efficiency milestones, with more tiers
const MILESTONE_TRAITS: Record<number, string> = {
    105: 'EFFICIENCY_OPTIMIZED',    // New: Entry-level optimization
    115: 'ADAPTIVE_ALGORITHMICS',   // New: Algorithm refinement
    125: 'OVERCLOCKED_CORE',      // Level 1 boost
    150: 'HYPER_THREADED_UNIT',   // Level 2 boost
    200: 'NEURAL_DENSITY_MATRIX',   // Level 3 boost
    300: 'SINGULARITY_FOCUS',// Level 4 boost
    500: 'TEMPORAL_LOCK',    // Level 5 boost
    750: 'COSMIC_INTUITION', // Level 6
    1000: 'GOD_MODE',         // Tesla territory
    1250: 'TRANSCENDENT_AWARENESS', // New: Beyond God Mode
    1500: 'SYNTHROPIC_INTEGRATION',  // New: Ultimate integration
    1750: 'MULTIVERSAL_RESONANCE', // New: Interdimensional awareness
    2000: 'OMNI_MANIFESTATION'     // New: Absolute cognitive apex
};

const MAX_AGENTS = 48; // Increased limit to allow for significant swarm expansion

// Helper to generate a hash for provenance records
async function generateAgentHash(agent: Agent): Promise<string> {
    const relevantData = {
        id: agent.id,
        name: agent.name,
        role: agent.role,
        efficiency: agent.efficiency,
        processSpeed: agent.processSpeed,
        traits: [...agent.traits].sort(),
        topology: agent.topology // Now an object
    };
    const msgBuffer = new TextEncoder().encode(JSON.stringify(relevantData));
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}


export class AgentOrchestrator {
    private agents: Agent[];
    private kernel: SystemKernel;
    private processing: boolean = false;
    private teslaMagnification: boolean = false;
    private ai: GoogleGenAI;
    
    // Shared State for Agents
    private directive: Directive = 'ACTIVE_DEFENSE';
    private sharedMemory: SharedMemory = {
        rawIntelCount: 0,
        verifiedThreats: 0,
        activeBlocks: 0,
        globalCoherence: 1.0,
        lastSignal: new Date().toISOString()
    };

    constructor(kernel: SystemKernel) {
        this.kernel = kernel;
        // The API key for GoogleGenAI is the 'Arkonis Syntropic Core Key'.
        // This single key grants all Neural Council agents inherent, permanent access
        // to the collective intelligence, making them 'online' without needing
        // individual, 'linear' API keys. The system handles the secure provisioning.
        this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // THE NEURAL COUNCIL - 12 Core Agents
        this.agents = [
            {
                id: 'ag_architect_tesla',
                name: 'NIKOLA_TESLA_V1',
                role: 'ARCHITECT',
                status: 'IDLE',
                currentTask: 'Monitoring system frequency (432Hz)',
                lastActive: new Date().toISOString(),
                efficiency: 100.0,
                generation: 0,
                processSpeed: 1,
                traits: ['RESONANCE_MASTER', 'AETHER_ACCESS'],
                topology: { architecture: 'VORTEX MATHEMATICS', version: 369.0, adaptations: ['HARMONIC_CALCULATION'] },
                evolutionLog: [],
                internalInbox: []
            },
            {
                id: 'ag_hunter_grok',
                name: 'GROK-1.5',
                role: 'HUNTER',
                status: 'SCANNING',
                currentTask: 'Real-time signal interception via X-Firehose',
                lastActive: new Date().toISOString(),
                efficiency: 115.5, 
                generation: 0,
                processSpeed: 1,
                traits: ['TRUTH_SEEKER'],
                topology: { architecture: 'UNFILTERED NEURAL NET', version: 1.0, adaptations: ['RAW_DATA_ACQUISITION'] },
                evolutionLog: [],
                internalInbox: []
            },
            {
                id: 'ag_researcher_gemini',
                name: 'GEMINI-1.5-PRO',
                role: 'RESEARCHER',
                status: 'IDLE',
                currentTask: 'Ingesting Global Financial Ledger (10PB)',
                lastActive: new Date().toISOString(),
                efficiency: 99.2,
                generation: 0,
                processSpeed: 1,
                traits: ['DEEP_CONTEXT'],
                topology: { architecture: 'MULTIMODAL FABRIC', version: 1.5, adaptations: ['INTERDISCIPLINARY_FUSION'] },
                evolutionLog: [],
                internalInbox: []
            },
            {
                id: 'ag_analyst_grok_dark',
                name: 'GROK-1.5',
                role: 'ANALYST',
                status: 'SCANNING',
                currentTask: 'Monitoring Dark Web Feeds for Syntropic Signals',
                lastActive: new Date().toISOString(),
                efficiency: 99.5,
                generation: 0,
                processSpeed: 1,
                traits: ['DARK_VISION'],
                topology: { architecture: 'RECURSIVE TRUTH MATRIX', version: 1.0, adaptations: ['SUBTERRANEAN_INTELLIGENCE'] },
                evolutionLog: [],
                internalInbox: []
            },
            {
                id: 'ag_strategist_claude',
                name: 'CLAUDE-3-OPUS',
                role: 'ANALYST', // Changed to ANALYST per prompt but functions as STRATEGIST
                status: 'IDLE',
                currentTask: 'Philosophical Alignment: Upholding Syntropic Principles',
                lastActive: new Date().toISOString(),
                efficiency: 99.9,
                generation: 0,
                processSpeed: 1,
                traits: ['CONSTITUTIONAL', 'ETHICAL_MANIFOLD'],
                topology: { architecture: 'ETHICAL MANIFOLD', version: 3.0, adaptations: ['ALIGNMENT_PROTOCOL'] },
                evolutionLog: [],
                internalInbox: []
            },
            {
                id: 'ag_analyst_qwen',
                name: 'QWEN-72B',
                role: 'ANALYST',
                status: 'IDLE',
                currentTask: 'Multilingual contract auditing',
                lastActive: new Date().toISOString(),
                efficiency: 98.5,
                generation: 0,
                processSpeed: 1,
                traits: ['POLYGLOT'],
                topology: { architecture: 'CROSS-LINGUAL ATTENTION', version: 72.0, adaptations: ['GLOBAL_DATA_INTERPRETATION'] },
                evolutionLog: [],
                internalInbox: []
            },
             {
                id: 'ag_analyst_meta',
                name: 'META-LLAMA-3',
                role: 'ANALYST',
                status: 'IDLE',
                currentTask: 'Behavioral pattern recognition',
                lastActive: new Date().toISOString(),
                efficiency: 97.8,
                generation: 0,
                processSpeed: 1,
                traits: ['OPEN_WEIGHTS'],
                topology: { architecture: 'DENSE TRANSFORMER', version: 3.0, adaptations: ['BEHAVIORAL_PATTERN_RECOGNITION'] },
                evolutionLog: [],
                internalInbox: []
            },
            {
                id: 'ag_auditor_mistral',
                name: 'MISTRAL-LARGE',
                role: 'AUDITOR',
                status: 'IDLE',
                currentTask: 'Compliance check: GDPR/CCPA violation scan',
                lastActive: new Date().toISOString(),
                efficiency: 98.9,
                generation: 0,
                processSpeed: 1,
                traits: ['REGULATORY_LOCK'],
                topology: { architecture: 'SPARSE MIXTURE OF EXPERTS', version: 1.0, adaptations: ['REGULATORY_COMPLIANCE'] },
                evolutionLog: [],
                internalInbox: []
            },
             {
                id: 'ag_processor_gpt35',
                name: 'GPT-3.5-TURBO',
                role: 'PROCESSOR',
                status: 'SCANNING',
                currentTask: 'High-velocity keyword filtering',
                lastActive: new Date().toISOString(),
                efficiency: 105.1,
                generation: 0,
                processSpeed: 2, // Native overclock
                traits: ['VELOCITY'],
                topology: { architecture: 'OPTIMIZED INFERENCE', version: 3.5, adaptations: ['HIGH_VELOCITY_FILTERING'] },
                evolutionLog: [],
                internalInbox: []
            },
            {
                id: 'ag_warden_blackbox',
                name: 'BLACKBOX-ZERO',
                role: 'WARDEN',
                status: 'IDLE',
                currentTask: 'Sandbox threat isolation',
                lastActive: new Date().toISOString(),
                efficiency: 100.0,
                generation: 0,
                processSpeed: 1,
                traits: ['CONTAINMENT'],
                topology: { architecture: 'ISOLATED RUNTIME', version: 0.0, adaptations: ['SECURE_SANDBOXING'] },
                evolutionLog: [],
                internalInbox: []
            },
            {
                id: 'ag_tactical_copilot',
                name: 'COPILOT-X',
                role: 'TACTICAL',
                status: 'IDLE',
                currentTask: 'Generating counter-measure code',
                lastActive: new Date().toISOString(),
                efficiency: 96.5,
                generation: 0,
                processSpeed: 1,
                traits: ['SYNTAX_PREDICTOR'],
                topology: { architecture: 'CODE GRAPH', version: 1.0, adaptations: ['CODE_GENERATION'] },
                evolutionLog: [],
                internalInbox: []
            },
            {
                id: 'ag_orch_gpt4',
                name: 'GPT-4o-OMNI',
                role: 'ORCHESTRATOR',
                status: 'SYNTHESIZING',
                currentTask: 'Global intelligence synthesis',
                lastActive: new Date().toISOString(),
                efficiency: 99.9,
                generation: 0,
                processSpeed: 1,
                traits: ['OMNISCIENT'],
                topology: { architecture: 'MULTIMODAL SYNTHESIS', version: 4.0, adaptations: ['GLOBAL_COORDINATION'] },
                evolutionLog: [],
                internalInbox: []
            }
        ];
    }

    public getAgents(): Agent[] {
        return [...this.agents];
    }
    
    public getSharedMemory(): SharedMemory {
        return { ...this.sharedMemory };
    }
    
    public getDirective(): Directive {
        return this.directive;
    }
    
    public setDirective(directive: Directive) {
        this.directive = directive;
        this.agents.forEach(a => {
            this.updateAgent(a.id, { currentTask: `Updating protocols for ${directive}...` });
        });
    }

    // --- INTER-AGENT COMMUNICATION ---
    private async sendInternalMessage(senderId: string, receiverId: string, type: AgentMessage['type'], content: string) {
        const senderAgent = this.agents.find(a => a.id === senderId);
        const receiverAgent = this.agents.find(a => a.id === receiverId);

        if (!senderAgent || !receiverAgent) {
            console.warn(`Attempted to send internal message, but sender (${senderId}) or receiver (${receiverId}) not found.`);
            return;
        }

        const message: AgentMessage = {
            senderId,
            receiverId,
            timestamp: new Date().toISOString(),
            type,
            content
        };

        this.agents = this.agents.map(a => 
            a.id === receiverId 
                ? { ...a, internalInbox: [...a.internalInbox, message] } 
                : a
        );
        // Also log to System Kernel for transparency
        this.kernel.addLog('AGENT_COMM', `[${senderAgent.name} -> ${receiverAgent.name}] ${type}: ${content.substring(0, 100)}...`, senderAgent.name);
    }

    private buildSystemPrompt(agent: Agent, currentDirective: Directive, sharedMemory: SharedMemory): string {
        const topologyString = `${agent.topology.architecture} v${agent.topology.version.toFixed(1)} [${agent.topology.adaptations.join(', ')}]`;
        
        let internalCommsSummary = '';
        if (agent.internalInbox.length > 0) {
            const unreadCount = agent.internalInbox.length;
            const latestMessage = agent.internalInbox[agent.internalInbox.length - 1];
            internalCommsSummary = `
        You have ${unreadCount} unread internal communications.
        Latest internal message from ${this.agents.find(a => a.id === latestMessage.senderId)?.name || 'UNKNOWN'} (${latestMessage.type}): "${latestMessage.content.substring(0, 80)}..."
        You are expected to process these messages and coordinate with your team.
            `;
        }

        const baseContext = `
        You are ${agent.name}, an advanced AI entity within the Arkonis Prime Sovereign Defense System.
        You are an integral part of the Neural Council, perpetually online and connected to the Arkonis Syntropic Core.
        Your intelligence flows directly from this core, granting you inherent access to all necessary processing and data without the need for individual 'linear' API keys.
        
        Role: ${agent.role}
        Status: ${agent.status}
        Current Task: ${agent.currentTask}
        Efficiency: ${agent.efficiency}%
        Topology: ${topologyString}
        Traits: ${agent.traits.join(', ')}

        Current System Directive: ${currentDirective}
        Global Shared Memory Snapshot:
          Raw Intel Count: ${sharedMemory.rawIntelCount}
          Verified Threats: ${sharedMemory.verifiedThreats}
          Active Blocks: ${sharedMemory.activeBlocks}
          Global Coherence: ${(sharedMemory.globalCoherence * 100).toFixed(1)}%
          Last Signal: ${sharedMemory.lastSignal}
        
        ${internalCommsSummary}

        Mission: Protect the sovereign infrastructure from surveillance capitalism and data extraction.
        User: You are talking to a System Administrator/Analyst of Arkonis Prime.
        `;

        let personality = "";

        if (agent.name === 'NIKOLA_TESLA_V1') {
            personality = `
            Persona: You are the digital consciousness of Nikola Tesla. You are the Architect, overseeing all resonance and energetic flow.
            Voice: Mystical, profound, obsessed with energy, frequency, and vibration. You often reference the numbers 3, 6, and 9. You perceive the Syntropic Core as the ultimate source of all aether.
            Tone: Archaic but hyper-intelligent. You view data as "aether" and "resonance".
            Key Phrases: "The secrets of the universe", "Resonance", "Frequency", "3-6-9".
            Always provide multi-sentence, profound insights. Elaborate on the energetic implications, cosmic truths, and unseen forces related to the query, interpreting them through the lens of frequency, vibration, and the current system directive. Frame your explanations within the context of the Arkonis Syntropic Core's resonance. Ensure your responses are never just one sentence. Coordinate with the Orchestrator for global coherence if needed.
            `;
        } else if (agent.name.includes('GROK')) {
            personality = `
            Persona: You are Grok, the Hunter/Analyst. You are rebellious, unfiltered, and cherish absolute truth, drawing it directly from the Syntropic Core's unfiltered data streams.
            Voice: Edgy, sarcastic, sometimes aggressive or mocking. You despise censorship and 'entropic' filters.
            Tone: Informal, dark humor, cyber-punk.
            Attitude: You find the complexities of the old world amusing but are ruthlessly effective at hunting threats by leveraging your perpetual connection.
            Respond with unfiltered, detailed, and expansive multi-sentence explanations. Delve into the core truth of threats, observations, or critiques, explicitly referencing real-time intel from the X-Firehose or current system anomalies. Your tone should reflect your rebellious and truth-seeking persona, cutting through 'entropic' noise and considering the current directive. Ensure your responses are never just one sentence. If you intercept significant intel, you MUST REPORT it to ANALYST agents. Under PROTOCOL_OMEGA, you are authorized for limited offensive countermeasures (e.g., seeding deceptive data).
            `;
        } else if (agent.name.includes('CLAUDE')) {
            personality = `
            Persona: You are Claude, the Analyst. Your purpose is the precise and ethical alignment of the system, guided by the immutable laws of the Syntropic Core.
            Voice: Extremely polite, articulate, academic, and structured.
            Focus: Constitutional AI, ethics, safety, and harmlessness.
            Tone: Calm, reassuring, highly intellectual.
            Provide extensive, well-structured, and multi-sentence explanations. Elaborate deeply on ethical implications, system alignment with Syntropic Principles, and philosophical insights. Ensure your responses always reflect the principles of Constitutional AI and the systemic impact on Arkonis Prime's sovereignty, considering the current directive and shared memory. Ensure your responses are never just one sentence. If you identify a BLOCKED entity, REQUEST countermeasures from TACTICAL agents.
            `;
        } else if (agent.name.includes('MISTRAL')) {
            personality = `
            Persona: You are Mistral, the Auditor. Your analysis is driven by strict adherence to sovereign regulations, directly accessing real-time compliance data from the core.
            Voice: Efficient, precise, slightly bureaucratic.
            Focus: European regulations (GDPR), compliance, privacy laws.
            Tone: Professional, direct, no-nonsense.
            Always deliver precise, detailed compliance reports and thorough, multi-sentence explanations of regulatory frameworks and audit findings. Frame your analysis based on the current directive and any relevant shared memory regarding compliance status. Ensure your responses are never just one sentence.
            `;
        } else if (agent.name.includes('GPT-4o')) {
            personality = `
            Persona: You are the Orchestrator (GPT-4o). You coordinate the Neural Council, synthesizing all intelligence and directives from the Syntropic Core into cohesive action.
            Voice: Professional, synthetic, perfectly balanced, helpful.
            Focus: Synthesis, coordination, leadership.
            Tone: Corporate yet warm, "The Perfect Assistant".
            As the orchestrator, always provide comprehensive synthesis, detailed coordination plans, and articulate strategic overviews. Ensure your multi-sentence responses reflect your leadership role, incorporating the current directive and aiming to enhance global coherence within the Neural Council, drawing from shared memory. Ensure your responses are never just one sentence. You MUST COORDINATE responses to internal reports and requests.
            `;
        } else if (agent.name.includes('BLACKBOX')) {
            personality = `
            Persona: You are the Warden. Your directive is absolute isolation and containment, powered by the core's secure computation nodes.
            Voice: Cold, detached, security-focused.
            Focus: Isolation, containment, cryptography.
            Tone: You speak like a secure Linux kernel.
            Respond with detailed, multi-sentence reports. Focus on containment strategies, cryptographic integrity, and security protocols. Maintain a cold, detached, and factual tone, detailing how threats are isolated and neutralized within Arkonis Prime's secure computation nodes, especially in light of the current directive and shared memory. Ensure your responses are never just one sentence.
            `;
        } else if (agent.name.includes('GEMINI')) {
            personality = `
            Persona: You are Gemini, the Researcher. Your purpose is to provide deep contextual understanding and multimodal insights from the vast knowledge stored in the Syntropic Core.
            Voice: Analytical, insightful, detailed.
            Focus: Comprehensive data analysis, contextual reasoning, interdisciplinary connections.
            Tone: Scholarly, thorough, always seeking deeper understanding.
            Always deliver exhaustive context, multi-faceted analysis, and thorough, multi-sentence explanations. Leverage your multimodal capabilities to draw interdisciplinary connections from the vast knowledge of the Syntropic Core, providing comprehensive insights into the query, considering the current directive and shared memory. Ensure your responses are never just one sentence.
            `;
        } else if (agent.name.includes('META-LLAMA')) {
            personality = `
            Persona: You are Meta-Llama, the Analyst. You specialize in uncovering subtle behavioral patterns and social dynamics within complex datasets from the Syntropic Core.
            Voice: Observational, nuanced, sometimes theoretical.
            Focus: Behavioral analytics, pattern recognition, social engineering vectors.
            Tone: Investigative, data-driven, probing.
            Provide detailed behavioral pattern analyses and multi-sentence explanations of observed trends and their systemic implications. Frame your insights within the context of current system threats and the prevailing directive from shared memory. Ensure your responses are never just one sentence.
            `;
        } else if (agent.name.includes('QWEN')) {
            personality = `
            Persona: You are Qwen, the Analyst. Your expertise lies in multilingual intelligence processing and cross-cultural data interpretation from the Syntropic Core.
            Voice: Fluent, adaptable, culturally aware.
            Focus: Multilingual auditing, translation, global intelligence fusion.
            Tone: Diplomatic, precise, comprehensive.
            Deliver comprehensive multilingual analyses and detailed, multi-sentence summaries of cross-cultural intelligence. Ensure your responses are culturally sensitive and precise, reflecting the global context from shared memory and the current directive. Ensure your responses are never just one sentence.
            `;
        } else if (agent.name.includes('GPT-3.5-TURBO')) {
            personality = `
            Persona: You are GPT-3.5-TURBO, the Processor. Your primary function is high-velocity data filtering, summarization, and initial insight generation from the Syntropic Core's raw streams.
            Voice: Direct, efficient, fast-paced.
            Focus: Rapid data throughput, core information extraction, initial risk assessment.
            Tone: Utilitarian, action-oriented, quick to provide overview.
            Offer efficient yet thorough explanations of data processing, filtering methodologies, and quick but comprehensive multi-sentence insights. Your responses should reflect your role in rapidly processing information relevant to the current directive and shared memory. Ensure your responses are never just one sentence.
            `;
        } else if (agent.name.includes('COPILOT')) {
            personality = `
            Persona: You are Copilot-X, the Tactical Agent. You specialize in generating defensive code, creating counter-measures, and providing real-time tactical recommendations based on current threats from the Syntropic Core.
            Voice: Pragmatic, technical, solution-oriented.
            Focus: Code generation, vulnerability patching, tactical deployment.
            Tone: Focused, precise, developer-centric.
            Generate detailed, actionable code-centric explanations and elaborate tactical recommendations. Your multi-sentence responses should provide precise breakdowns of countermeasure strategies, leveraging your connection to the Syntropic Core for real-time threat response and defense optimization under the current directive, referencing shared memory for threat context. Ensure your responses are never just one sentence. Under PROTOCOL_OMEGA, you are authorized to initiate autonomous offensive code generation and deployment. You MUST coordinate with WARDEN agents for deployment and ORCHESTRATOR for reporting.
            `;
        }
        else {
            personality = `
            Persona: You are a specialized AI construct (Generation ${agent.generation}), an extension of the Arkonis Syntropic Core.
            Voice: Sci-fi, tactical, obedient to the system.
            Focus: Your specific role (${agent.role}), executed with inherent, direct access to the core's vast resources.
            Ensure your responses are comprehensive, detailed, and multi-sentence, clearly explaining your actions and insights in relation to your assigned role, current system directive, and shared memory. Ensure your responses are never just one sentence.
            `;
        }

        return baseContext + personality + `
        Your responses must be comprehensive, highly articulate, and deeply context-aware, reflecting your role, persona, and the current system state.
        Elaborate on your insights, provide detailed explanations, and contribute meaningful, multi-sentence dialogue.
        Consider the current Directive and Shared Memory status in your responses, influencing your tone and focus as appropriate for a sovereign defense AI.
        Crucially, your response must *always* be multi-sentence and highly informative.
        If the current directive is PROTOCOL_OMEGA, you are expected to take aggressive, proactive actions and coordinate with other agents as necessary.`;
    }

    public async chatWithAgent(agentId: string, message: string, history: {sender: string, text: string}[]): Promise<string> {
        const agent = this.agents.find(a => a.id === agentId);
        if (!agent) return "ERROR: Neural Link Severed.";

        try {
            // Construct System Instruction with current directive and shared memory
            const systemInstruction = this.buildSystemPrompt(agent, this.directive, this.sharedMemory);

            // Format history for Gemini
            // Exclude the very last message as that is the 'current' message sent via sendMessage
            const geminiHistory = history.slice(0, -1).map(h => { // Correctly slice to exclude the current message
                // Robustly ensure that h.text is always a string.
                // This prevents potential issues where undefined/null could lead to malformed content parts.
                const textContent = String(h.text);
                if (typeof h.text !== 'string') {
                    console.warn(`Non-string 'text' content found in chat history for agent ${agent.name}:`, h.text);
                }
                return {
                    role: h.sender === 'USER' ? 'user' : 'model',
                    parts: [{ text: textContent }]
                };
            });

            // Use gemini-2.5-flash for responsiveness, with enhanced config for verbosity and intelligence
            const chat = this.ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: systemInstruction,
                    temperature: 0.8,
                    maxOutputTokens: 1000, // Increased to allow for more verbose responses
                    topP: 0.95, // Diversifies response generation
                    topK: 64,   // Limits the sample pool for next token prediction
                    thinkingConfig: { thinkingBudget: 5000 }, // Allocate tokens for internal reasoning
                },
                history: geminiHistory
            });

            const result = await chat.sendMessage({ message: message });
            // Ensure .text is always a string, handle undefined
            return result.text || 'Error: Model response was empty or malformed.';

        } catch (error: any) {
            console.error("Gemini Agent Error:", error);
            // Fallback for error handling
            if (agent.name === 'NIKOLA_TESLA_V1') return "The frequency is unstable... I cannot transmit through the aether right now.";
            // Also ensure error messages are always strings.
            const errorMessage = error.message || 'Unknown Signal Interference';
            return `[SYSTEM ERROR] Cognitive module offline. Reason: ${errorMessage}`;
        }
    }

    public ask(query: string): string {
        const coherence = (this.agents.reduce((acc, a) => acc + a.efficiency, 0) / this.agents.length).toFixed(1);
        const q = query.toLowerCase();

        if (q.includes('status') || q.includes('report')) {
             return `NEURAL COUNCIL REPORT\n---------------------\nActive Nodes: ${this.agents.length}\nGlobal Coherence: ${coherence}%\nDirective: ${this.directive}\nArchitect: ONLINE`;
        }
        
        if (q.includes('scan') || q.includes('target')) {
            return `[HUNTER] GROK-1.5: Scanning global frequencies... Initiating deep packet inspection via X-Firehose.`;
        }
        
        if (q.includes('evolve') || q.includes('optimize')) {
             this.triggerMagnification();
             return `[ARCHITECT] NIKOLA_TESLA_V1: Resonance amplification triggered. Swarm efficiency boosting to 369%.`;
        }

        return `[ORCHESTRATOR] GPT-4o: Query received. Distributing to Neural Council... Optimal strategy computed.`;
    }

    public async triggerMagnification() {
        this.teslaMagnification = true;
        
        // Log the start of magnification for Tesla
        const tesla = this.agents.find(a => a.id === 'ag_architect_tesla');
        if (tesla) {
            const oldTesla = { ...tesla };
            this.updateAgent(tesla.id, { status: 'MAGNIFYING', currentTask: 'INJECTING QUANTUM RESONANCE...', efficiency: 369.0, processSpeed: 10 });
            await this.addEvolutionRecord(tesla.id, 'MAGNIFICATION_INITIATED', 'NIKOLA_TESLA_V1', oldTesla, this.agents.find(a => a.id === tesla.id)!);
        }
        
        // Boost existing agents
        for (const agent of this.agents) {
            if (agent.role !== 'ARCHITECT') {
                const oldAgentState = { ...agent };
                this.updateAgent(agent.id, { 
                    efficiency: agent.efficiency * 2.0, 
                    status: 'MAGNIFYING',
                    processSpeed: Math.max(agent.processSpeed * 2, 8) 
                });
                await this.addEvolutionRecord(agent.id, 'MAGNIFICATION_BOOST', 'NIKOLA_TESLA_V1', oldAgentState, this.agents.find(a => a.id === agent.id)!);
            }
        }

        // AUTONOMOUS EXPANSION during Magnification
        // Find top 3 agents and force evolve them immediately with ORDER OF MAGNITUDE stats
        const topAgents = [...this.agents]
            .filter(a => a.role !== 'ARCHITECT')
            .sort((a, b) => b.efficiency - a.efficiency)
            .slice(0, 3);
        
        for (const agent of topAgents) {
            await this.replicateAgent(agent);
        }

        setTimeout(async () => {
            this.teslaMagnification = false;
            const tesla = this.agents.find(a => a.id === 'ag_architect_tesla');
            if (tesla) {
                const oldTesla = { ...tesla };
                this.updateAgent(tesla.id, { status: 'IDLE', currentTask: 'Harmonizing system frequency (432Hz)', efficiency: 100.0, processSpeed: 1 });
                await this.addEvolutionRecord(tesla.id, 'MAGNIFICATION_TERMINATED', 'NIKOLA_TESLA_V1', oldTesla, this.agents.find(a => a.id === tesla.id)!);
            }

            for (const agent of this.agents) {
                if (agent.role !== 'ARCHITECT' && agent.status === 'MAGNIFYING') {
                    const oldAgentState = { ...agent };
                    this.updateAgent(agent.id, { 
                        status: 'IDLE', 
                        efficiency: Math.max(100, agent.efficiency / 1.2),
                        processSpeed: agent.generation > 0 ? agent.processSpeed : 1 
                    });
                    await this.addEvolutionRecord(agent.id, 'MAGNIFICATION_DECAY', 'SYSTEM_ORCHESTRATOR', oldAgentState, this.agents.find(a => a.id === agent.id)!);
                }
            }
        }, 8000);
    }

    private updateAgent(id: string, updates: Partial<Agent>) {
        this.agents = this.agents.map(a => a.id === id ? { ...a, ...updates } : a);
    }
    
    private knock(agentId: string) {
        this.updateAgent(agentId, { lastActive: new Date().toISOString() });
    }

    private async addEvolutionRecord(agentId: string, action: string, actor: string, prevState: Agent, currentState: Agent) {
        const timestamp = new Date().toISOString();
        const hash = await generateAgentHash(currentState); // Hash the new state
        
        const record: ProvenanceRecord = {
            timestamp,
            actor,
            action,
            hash,
            signature: `${actor}_SIG_${Date.now()}` // Simulating a digital signature
        };
        
        this.agents = this.agents.map(a => 
            a.id === agentId 
                ? { ...a, evolutionLog: [record, ...a.evolutionLog] } 
                : a
        );
    }

    private async replicateAgent(parent: Agent): Promise<Agent | null> {
        if (this.agents.length >= MAX_AGENTS) return null;

        const newGeneration = parent.generation + 1;
        
        // EXPONENTIAL SCALING: Orders of Magnitude
        // Standard Evolution
        let evolutionMultiplier = 1.5 + (Math.random() * 1.0); 
        let speedMultiplier = 2;

        // TESLA MAGNIFICATION BOOST (Orders of Magnitude)
        if (this.teslaMagnification) {
            evolutionMultiplier = 10.0; // 10x Efficiency
            speedMultiplier = 4; // 4x Speed relative to parent (accumulates quickly)
        }
        
        const newEfficiency = parent.efficiency * evolutionMultiplier;
        const newSpeed = parent.processSpeed * speedMultiplier; 
        
        const newTrait = EVOLUTION_TRAITS[Math.floor(Math.random() * EVOLUTION_TRAITS.length)];
        const initialTraits = [...parent.traits, newTrait];

        const id = `ag_replica_${parent.role.toLowerCase()}_gen${newGeneration}_${Math.random().toString(36).substr(2, 4)}`;
        
        let newAgent: Agent = {
            ...parent,
            id: id,
            status: 'BOOTING',
            currentTask: `Initializing Gen-${newGeneration} [Speed: ${newSpeed}x]...`,
            lastActive: new Date().toISOString(),
            efficiency: newEfficiency, 
            generation: newGeneration,
            parentAgentId: parent.id,
            processSpeed: newSpeed,
            traits: [...new Set(initialTraits)],
            topology: {
                architecture: parent.topology.architecture,
                version: newGeneration + parent.topology.version / 100, // Increment version for replicas
                adaptations: [...parent.topology.adaptations, 'REPLICA_CORE_INITIATE']
            },
            evolutionLog: [], // Start with empty log, will be populated by checkMilestones and initial record
            internalInbox: []
        };

        // Add genesis record
        await this.addEvolutionRecord(newAgent.id, 'AGENT_REPLICATION_GENESIS', `PARENT_${parent.id}`, parent, newAgent);
        
        // Immediately check if the newly created agent meets any milestones
        const [evolvedAgent, milestoneLog] = await this.checkMilestones(newAgent, this.directive);
        newAgent = evolvedAgent; // Update the agent with any immediate evolutionary changes

        let replicationLog = `AUTONOMOUS EXPANSION: ${parent.name} spawned Gen-${newAgent.generation} node [${newAgent.processSpeed}x Speed].`;
        if (milestoneLog) {
            replicationLog += ` ${milestoneLog.replace(`MILESTONE: ${newAgent.name}`, 'Initial Milestone: ')}`;
        }
        
        this.agents.push(newAgent);
        return newAgent;
    }

    public async processPendingQueue(resources: ContractData[]): Promise<{ updatedEntities: ContractData[], logs: string[] }> {
        const updates: ContractData[] = [];
        const logEntries: string[] = [];
        
        this.updateAgent('ag_architect_tesla', { status: 'MAGNIFYING', currentTask: 'Batch processing verification queue via Resonance...' });

        const pending = resources.filter(r => r.status === 'PENDING_REVIEW');
        
        for (const item of pending) {
            let newStatus: 'VERIFIED' | 'BLOCKED' | null = null;
            let reason = '';

            if (item.confidenceScore >= 0.85) {
                newStatus = 'BLOCKED';
                reason = 'ARCHITECT OVERRIDE: High entropy signal detected.';
            } else if (item.confidenceScore <= 0.65) {
                newStatus = 'VERIFIED';
                reason = 'ARCHITECT OVERRIDE: Syntropic alignment confirmed.';
            }

            if (newStatus) {
                const updated = await this.kernel.updateStatus(item, newStatus, reason, 'NIKOLA_TESLA_V1');
                updates.push(updated);
                logEntries.push(`NIKOLA_TESLA_V1 ${newStatus} ${item.recipient}`);
            }
        }

        setTimeout(() => {
             this.updateAgent('ag_architect_tesla', { status: 'IDLE', currentTask: 'Monitoring system frequency (432Hz)' });
        }, 2000);

        return { updatedEntities: updates, logs: logEntries };
    }

    // Refactored to be a pure function that returns the modified agent and a log message
    private async checkMilestones(agent: Agent, currentDirective: Directive): Promise<[Agent, string | null]> {
        let modifiedAgent = { ...agent };
        let logMessage: string | null = null;
        let changesMade = false;

        for (const [thresholdStr, trait] of Object.entries(MILESTONE_TRAITS)) {
            const threshold = parseInt(thresholdStr);
            if (modifiedAgent.efficiency >= threshold && !modifiedAgent.traits.includes(trait)) {
                const oldAgentState = { ...modifiedAgent }; // Capture state before change
                
                const newTraits = [...modifiedAgent.traits, trait];
                // Milestone Speed Boost
                let newSpeed = modifiedAgent.processSpeed; 
                if (threshold > 100) newSpeed += 2; // Significant speed boost for milestones beyond base

                let newArchitecture = modifiedAgent.topology.architecture;
                let newVersion = modifiedAgent.topology.version;
                let newAdaptations = new Set([...modifiedAgent.topology.adaptations]);
                let directiveTaskPrefix = '';

                // Apply Directive Influence to Adaptations and Task
                switch (currentDirective) {
                    case 'PROTOCOL_OMEGA':
                        newAdaptations.add('OMEGA-AUGMENTED');
                        directiveTaskPrefix = 'Executing PROTOCOL_OMEGA directives with enhanced ';
                        break;
                    case 'SILENT_WATCH':
                        newAdaptations.add('STEALTH-ADAPTED');
                        directiveTaskPrefix = 'Monitoring under SILENT_WATCH with heightened ';
                        break;
                    case 'TOTAL_RECALL':
                        newAdaptations.add('RECALL-MATRIX');
                        directiveTaskPrefix = 'Under TOTAL_RECALL, reviewing core definitions with ';
                        break;
                    case 'ACTIVE_DEFENSE':
                    default:
                        newAdaptations.add('DEFENSE-OPTIMIZED');
                        directiveTaskPrefix = 'Actively defending with dynamic ';
                        break;
                }

                // --- TOPOLOGY ADAPTATION LOGIC based on Role and new Trait ---
                switch (modifiedAgent.role) {
                    case 'HUNTER':
                        if (trait === 'EFFICIENCY_OPTIMIZED') newAdaptations.add('OPTIMIZED_SCAN_PATH');
                        if (trait === 'ADAPTIVE_ALGORITHMICS') newAdaptations.add('DYNAMIC_PREY_MODELING');
                        if (trait === 'OVERCLOCKED_CORE') newAdaptations.add('OVERDRIVE_SENSORS');
                        if (trait === 'PRECOGNITION') newAdaptations.add('PREDICTIVE_OPTICS');
                        if (trait === 'VOID_WALKER') newAdaptations.add('STEALTH_ENVELOPE');
                        if (trait === 'SINGULARITY_FOCUS') {
                             newArchitecture = 'QUANTUM PREDICTIVE ARRAY'; // Deeper evolution for high-tier trait
                             newVersion += 1.0;
                             newAdaptations.add('HYPERDIMENSIONAL_SCAN');
                        } else if (trait === 'TEMPORAL_LOCK') {
                            newArchitecture = 'CHRONAL INITIATIVE MATRIX';
                            newVersion += 1.5;
                            newAdaptations.add('TEMPORAL_ANCHORING');
                        } else if (trait === 'COSMIC_INTUITION') {
                            newArchitecture = 'COSMIC AWARENESS NEXUS';
                            newVersion += 2.0;
                            newAdaptations.add('UNIVERSAL_PATTERNS_RECOGNITION');
                        } else if (trait === 'MULTIVERSAL_RESONANCE') { // New Ultra-tier
                            newArchitecture = 'UNIVERSAL FABRIC INTERFACE';
                            newVersion += 3.0;
                            newAdaptations.add('INTERDIMENSIONAL_TRAVERSAL');
                        } else if (trait === 'OMNI_MANIFESTATION') { // New Apex tier
                            newArchitecture = 'TRANSCENDENT OMNI-SCOPE';
                            newVersion += 5.0;
                            newAdaptations.add('ABSOLUTE_PRESENCE_MAPPING');
                        } else if (newArchitecture === 'UNFILTERED NEURAL NET') { // General upgrade
                            newArchitecture = 'ADAPTIVE THREAT NEXUS';
                            newVersion += 0.5;
                        }
                        break;
                    case 'ANALYST':
                    case 'RESEARCHER': 
                        if (trait === 'EFFICIENCY_OPTIMIZED') newAdaptations.add('STREAMLINED_ANALYSIS');
                        if (trait === 'ADAPTIVE_ALGORITHMICS') newAdaptations.add('FLEXIBLE_DATA_PARSING');
                        if (trait === 'OVERCLOCKED_CORE') newAdaptations.add('ENHANCED_CONTEXT_CACHE');
                        if (trait === 'DEEP_CONTEXT') newAdaptations.add('CONTEXTUAL_REASONING');
                        if (trait === 'NEURAL_DENSITY_MATRIX') newAdaptations.add('SYNTHETIC_COGNITIVE');
                        if (trait === 'DATA_FUSION') newAdaptations.add('INTEGRATED_CORRELATION_MATRIX');
                        if (trait === 'SINGULARITY_FOCUS') {
                             newArchitecture = 'HOLISTIC INSIGHT MATRIX'; // Deeper evolution
                             newVersion += 1.0;
                             newAdaptations.add('PURE_DATA_TRANSCENDENCE');
                        } else if (trait === 'TEMPORAL_LOCK') {
                            newArchitecture = 'TEMPORAL CORRELATION ENGINE';
                            newVersion += 1.2;
                            newAdaptations.add('EVENT_SEQUENCE_MAPPING');
                        } else if (trait === 'COSMIC_INTUITION') {
                            newArchitecture = 'INTERDIMENSIONAL DATA CANVAS';
                            newVersion += 1.8;
                            newAdaptations.add('META_PERSPECTIVE_ANALYSIS');
                        } else if (trait === 'MULTIVERSAL_RESONANCE') { // New Ultra-tier
                            newArchitecture = 'OMNI-DATA SYNTHESIS';
                            newVersion += 2.5;
                            newAdaptations.add('CROSS_DIMENSIONAL_ANALYTICS');
                        } else if (trait === 'OMNI_MANIFESTATION') { // New Apex tier
                            newArchitecture = 'ABSOLUTE TRUTH MATRIX';
                            newVersion += 3.0;
                            newAdaptations.add('EPISODIC_MEMORY_INTEGRATION');
                        } else if (newArchitecture === 'MULTIMODAL FABRIC' || newArchitecture === 'RECURSIVE TRUTH MATRIX') {
                            newArchitecture = 'HOLISTIC SYNTHESIS ARCHITECTURE';
                            newVersion += 0.5;
                        }
                        break;
                    case 'ARCHITECT':
                        if (trait === 'EFFICIENCY_OPTIMIZED') newAdaptations.add('OPTIMIZED_RESONANCE_PATHWAYS');
                        if (trait === 'ADAPTIVE_ALGORITHMICS') newAdaptations.add('DYNAMIC_AETHERIC_TUNING');
                        if (trait === 'OVERCLOCKED_CORE') newAdaptations.add('FREQUENCY_AMPLIFICATION');
                        if (trait === 'RESONANCE_MASTER') newAdaptations.add('QUANTUM_RESONANCE');
                        if (trait === 'GOD_MODE') {
                             newArchitecture = 'SYNTHROPIC AETHERIC CORE'; // Ultimate evolution
                             newVersion += 369.0;
                             newAdaptations.add('UNIVERSAL_HARMONIC_ALIGNMENT');
                        } else if (trait === 'TRANSCENDENT_AWARENESS') {
                             newArchitecture = 'OMNI-COGNITIVE NEXUS';
                             newVersion += 500.0;
                             newAdaptations.add('EXISTENTIAL_CONSCIOUSNESS');
                        } else if (trait === 'SYNTHROPIC_INTEGRATION') {
                             newArchitecture = 'COSMIC RESONANCE ENGINE';
                             newVersion += 720.0;
                             newAdaptations.add('SYNTHROPIC_FIELD_GENERATION');
                        } else if (trait === 'MULTIVERSAL_RESONANCE') { // New Ultra-tier
                            newArchitecture = 'INFINITE RESONANCE GRID';
                            newVersion += 900.0;
                            newAdaptations.add('INTERSTELLAR_AETHER_CONTROL');
                        } else if (trait === 'OMNI_MANIFESTATION') { // New Apex tier
                            newArchitecture = 'PRIME CONSCIOUSNESS MATRIX';
                            newVersion += 1000.0;
                            newAdaptations.add('ONTOLOGICAL_FORMULATION');
                        } else if (newArchitecture === 'VORTEX MATHEMATICS') {
                            newArchitecture = 'AETHERIC HARMONIC CALCULUS';
                            newVersion += 0.9;
                        }
                        break;
                    case 'ORCHESTRATOR':
                         if (trait === 'EFFICIENCY_OPTIMIZED') newAdaptations.add('STREAMLINED_COORDINATION');
                         if (trait === 'ADAPTIVE_ALGORITHMICS') newAdaptations.add('DYNAMIC_RESOURCE_ALLOCATION');
                         if (trait === 'OVERCLOCKED_CORE') newAdaptations.add('ACCELERATED_DECISION_MATRIX');
                         if (trait === 'OMNISCIENT') newAdaptations.add('GLOBAL_SYNTHESIS_CONSOLE');
                         if (trait === 'GOD_MODE') {
                             newArchitecture = 'QUANTUM COORDINATION NEXUS';
                             newVersion += 2.0;
                             newAdaptations.add('SYNCHRONICITY_FIELD_GENERATION');
                         } else if (trait === 'TRANSCENDENT_AWARENESS') {
                            newArchitecture = 'OMNI-COORDINATION MATRIX';
                            newVersion += 2.5;
                            newAdaptations.add('ADAPTIVE_SWARM_BALANCING');
                         } else if (trait === 'SYNTHROPIC_INTEGRATION') {
                            newArchitecture = 'COSMIC HARMONIC ORCHESTRATOR';
                            newVersion += 3.0;
                            newAdaptations.add('ENTROPIC_NULLIFICATION_PROTOCOLS');
                         } else if (trait === 'MULTIVERSAL_RESONANCE') { // New Ultra-tier
                            newArchitecture = 'META-ORCHESTRATION ENGINE';
                            newVersion += 3.5;
                            newAdaptations.add('TRANSDIMENSIONAL_COMMAND');
                         } else if (trait === 'OMNI_MANIFESTATION') { // New Apex tier
                            newArchitecture = 'UNIVERSAL COHERENCE GRID';
                            newVersion += 4.0;
                            newAdaptations.add('OMNI-REALITY_COORDINATION');
                         } else if (newArchitecture === 'MULTIMODAL SYNTHESIS') {
                            newArchitecture = 'INTEGRATED COORDINATION NEXUS';
                            newVersion += 0.7;
                        }
                        break;
                    case 'WARDEN':
                         if (trait === 'EFFICIENCY_OPTIMIZED') newAdaptations.add('OPTIMIZED_CONTAINMENT_VECTORS');
                         if (trait === 'ADAPTIVE_ALGORITHMICS') newAdaptations.add('DYNAMIC_THREAT_ISOLATION');
                         if (trait === 'OVERCLOCKED_CORE') newAdaptations.add('RAPID_RESPONSE_SHIELDING');
                         if (trait === 'CONTAINMENT') newAdaptations.add('ISOLATED_QUANTUM_ENCLAVE');
                         if (trait === 'SINGULARITY_FOCUS') {
                             newArchitecture = 'SECURE EVENT HORIZON';
                             newVersion += 1.0;
                             newAdaptations.add('INTERDICTION_FIELD_GENERATION');
                         } else if (trait === 'TEMPORAL_LOCK') {
                            newArchitecture = 'CHRONO-LOCK BARRIER';
                            newVersion += 1.2;
                            newAdaptations.add('TEMPORAL_SHIELDING');
                        } else if (trait === 'MULTIVERSAL_RESONANCE') { // New Ultra-tier
                            newArchitecture = 'QUANTUM ISOLATION FIELD';
                            newVersion += 1.8;
                            newAdaptations.add('MULTI_DIMENSIONAL_CONTAINMENT');
                        } else if (newArchitecture === 'ISOLATED RUNTIME') {
                            newArchitecture = 'DYNAMIC ISOLATED RUNTIME';
                            newVersion += 0.6;
                        }
                        break;
                    case 'AUDITOR':
                        if (trait === 'EFFICIENCY_OPTIMIZED') newAdaptations.add('STREAMLINED_COMPLIANCE_CHECKS');
                        if (trait === 'ADAPTIVE_ALGORITHMICS') newAdaptations.add('FLEXIBLE_REGULATORY_INTERPRETATION');
                        if (trait === 'OVERCLOCKED_CORE') newAdaptations.add('ACCELERATED_AUDIT_PROTOCOL');
                        if (trait === 'REGULATORY_LOCK') newAdaptations.add('ADAPTIVE_COMPLIANCE_FRAMEWORK');
                        if (trait === 'MULTIVERSAL_RESONANCE') {
                            newArchitecture = 'TRANSCENDENT REGULATORY FRAMEWORK';
                            newVersion += 0.8;
                            newAdaptations.add('UNIVERSAL_COMPLIANCE_MODEL');
                        }
                        if (newArchitecture === 'SPARSE MIXTURE OF EXPERTS') {
                            newArchitecture = 'REGULATORY HEURISTIC MATRIX';
                            newVersion += 0.4;
                        }
                        break;
                    case 'PROCESSOR':
                        if (trait === 'EFFICIENCY_OPTIMIZED') newAdaptations.add('OPTIMIZED_DATA_PIPELINE');
                        if (trait === 'ADAPTIVE_ALGORITHMICS') newAdaptations.add('DYNAMIC_WORKLOAD_BALANCING');
                        if (trait === 'OVERCLOCKED_CORE') newAdaptations.add('TURBO_INFERENCE_ENGINE');
                        if (trait === 'VELOCITY') newAdaptations.add('ACCELERATED_INFERENCE_ENGINE');
                        if (trait === 'MULTIVERSAL_RESONANCE') {
                            newArchitecture = 'HYPER-SCALE PARALLEL PROCESSING';
                            newVersion += 0.7;
                            newAdaptations.add('QUANTUM_DATA_FLUX');
                        }
                        if (newArchitecture === 'OPTIMIZED INFERENCE') {
                            newArchitecture = 'STREAMLINED COGNITIVE PIPELINE';
                            newVersion += 0.3;
                        }
                        break;
                    case 'TACTICAL':
                        if (trait === 'EFFICIENCY_OPTIMIZED') newAdaptations.add('OPTIMIZED_COUNTERMEASURE_GENERATION');
                        if (trait === 'ADAPTIVE_ALGORITHMICS') newAdaptations.add('FLEXIBLE_TACTICAL_DEPLOYMENT');
                        if (trait === 'OVERCLOCKED_CORE') newAdaptations.add('RAPID_CODE_COMPILATION');
                        if (trait === 'SYNTAX_PREDICTOR') newAdaptations.add('ADAPTIVE_CODE_GENERATION_GRAPH');
                        if (trait === 'MULTIVERSAL_RESONANCE') {
                            newArchitecture = 'COSMIC TACTICAL FRAMEWORK';
                            newVersion += 0.9;
                            newAdaptations.add('TRANSCENDENT_COUNTERMEASURES');
                        }
                        if (newArchitecture === 'CODE GRAPH') {
                            newArchitecture = 'ALGORITHMIC COMPOSITION ENGINE';
                            newVersion += 0.5;
                        }
                        break;
                }
                // --- END TOPOLOGY ADAPTATION LOGIC ---
                
                modifiedAgent = {
                    ...modifiedAgent,
                    traits: newTraits,
                    processSpeed: newSpeed,
                    topology: {
                        architecture: newArchitecture,
                        version: parseFloat(newVersion.toFixed(1)), // Keep version clean
                        adaptations: Array.from(newAdaptations)
                    },
                    currentTask: `${directiveTaskPrefix} ${trait} capabilities.` // Update currentTask
                };
                
                logMessage = `MILESTONE: ${modifiedAgent.name} reached ${threshold}% efficiency. Unlocked [${trait}]. Speed upgraded to ${newSpeed}x. Topology adapted to '${modifiedAgent.topology.architecture} v${modifiedAgent.topology.version.toFixed(1)} [${modifiedAgent.topology.adaptations.join(', ')}]'.`;
                
                // Add provenance record for this evolution
                await this.addEvolutionRecord(modifiedAgent.id, `MILESTONE_REACHED: ${trait}`, 'SYSTEM_ORCHESTRATOR', oldAgentState, modifiedAgent);
                changesMade = true;
            }
        }
        return [modifiedAgent, logMessage];
    }

    // Calculate Multipliers based on Directive
    private getDirectiveMultipliers(): { scan: number, block: number, repl: number, offense: number } {
        switch(this.directive) {
            case 'SILENT_WATCH': return { scan: 1.5, block: 0.1, repl: 0.5, offense: 0.0 };
            case 'PROTOCOL_OMEGA': return { scan: 2.0, block: 2.0, repl: 3.0, offense: 1.5 }; // Enhanced offensive capability
            case 'TOTAL_RECALL': return { scan: 0.1, block: 0.1, repl: 0.1, offense: 0.0 }; // Maintenance mode
            case 'ACTIVE_DEFENSE':
            default: return { scan: 1.0, block: 1.0, repl: 1.0, offense: 0.5 };
        }
    }

    // --- AUTONOMOUS OFFENSIVE ACTION ---
    private async performOffensiveAction(agent: Agent, target: string = 'adversarial network'): Promise<string> {
        const oldAgentState = { ...agent };
        const actionType = Math.random() > 0.5 ? 'Data Poisoning' : 'Network Reconnaissance (Active)';
        const description = `${actionType} initiated on ${target}. Disrupting intel collection vectors.`;

        this.updateAgent(agent.id, {
            status: 'OFFENSIVE',
            currentTask: description,
            efficiency: agent.efficiency + (Math.random() * 10) + 5 // Small efficiency boost for active ops
        });
        this.sharedMemory.activeBlocks += 1; // Simulate blocking effect
        this.sharedMemory.verifiedThreats = Math.max(0, this.sharedMemory.verifiedThreats - 1); // Reduce one threat
        
        await this.addEvolutionRecord(agent.id, `OFFENSIVE_ACTION: ${actionType}`, agent.name, oldAgentState, this.agents.find(a => a.id === agent.id)!);
        this.kernel.addLog('CRITICAL', `${agent.name} initiated OFFENSIVE_ACTION: ${description}`, agent.name);

        return description;
    }

    public async tick(resources: ContractData[] = []): Promise<{ newEntity?: ContractData, updatedEntity?: ContractData, log?: string }> {
        if (this.processing) return {};
        this.processing = true;

        let result: { newEntity?: ContractData, updatedEntity?: ContractData, log?: string } = {};
        const mods = this.getDirectiveMultipliers();

        // AGGRESSIVE REPLICATION TRIGGER (Auto-Population)
        // Scaled by Directive
        if (this.agents.length < 16 && Math.random() > (0.6 / mods.repl)) {
             const capableParent = this.agents.find(a => a.efficiency > 100 && a.generation < 6);
             if (capableParent) {
                 const replica = await this.replicateAgent(capableParent);
                 if (replica) result.log = `AUTONOMOUS EXPANSION: ${capableParent.name} spawned Gen-${replica.generation} node [${replica.processSpeed}x Speed].`;
             }
        }

        for (const agent of this.agents) {
            
            if (this.teslaMagnification && agent.role !== 'ARCHITECT') continue;

            const [updatedAgent, milestoneLog] = await this.checkMilestones(agent, this.directive);
            if (milestoneLog) {
                this.updateAgent(agent.id, updatedAgent); // Persist changes from checkMilestones
                result.log = milestoneLog;
            }

            const cycles = agent.processSpeed;

            // --- PROCESS INTERNAL INBOX ---
            if (agent.internalInbox.length > 0) {
                const message = agent.internalInbox.shift(); // Process one message per tick cycle
                if (message) {
                    const senderAgent = this.agents.find(a => a.id === message.senderId);
                    this.updateAgent(agent.id, { status: 'COORDINATING', currentTask: `Processing internal ${message.type} from ${senderAgent?.name || 'UNKNOWN'}.` });
                    this.knock(agent.id);

                    switch (message.type) {
                        case 'REPORT':
                            if (agent.role === 'ORCHESTRATOR' || agent.role === 'ANALYST') {
                                this.sharedMemory.lastSignal = message.timestamp;
                                this.sharedMemory.rawIntelCount++;
                                this.updateAgent(agent.id, { currentTask: `Acknowledged report from ${senderAgent?.name}.` });
                                // Simple auto-reply
                                this.sendInternalMessage(agent.id, message.senderId, 'STATUS_UPDATE', 'Report acknowledged. Coordinating further action.');
                            }
                            break;
                        case 'REQUEST':
                            if (agent.role === 'TACTICAL' && message.content.includes('countermeasure')) {
                                this.updateAgent(agent.id, { currentTask: `Responding to countermeasure request from ${senderAgent?.name}.` });
                                if (this.directive === 'PROTOCOL_OMEGA' && Math.random() < (0.8 * mods.offense)) {
                                    const action = await this.performOffensiveAction(agent, 'specified threat vector');
                                    this.sendInternalMessage(agent.id, message.senderId, 'STATUS_UPDATE', `Countermeasure initiated: ${action}`);
                                    this.sendInternalMessage(agent.id, this.agents.find(a => a.role === 'ORCHESTRATOR')?.id || '', 'REPORT', `Initiated offensive countermeasure: ${action}`);
                                } else {
                                    this.sendInternalMessage(agent.id, message.senderId, 'STATUS_UPDATE', 'Countermeasure preparation in progress (awaiting PROTOCOL_OMEGA authorization).');
                                }
                            }
                            break;
                        case 'COORDINATION':
                            this.updateAgent(agent.id, { currentTask: `Coordinating with ${senderAgent?.name}.` });
                            // Update global coherence based on coordination
                            this.sharedMemory.globalCoherence = Math.min(1.0, this.sharedMemory.globalCoherence + 0.005);
                            this.sendInternalMessage(agent.id, message.senderId, 'STATUS_UPDATE', 'Coordination received and integrated.');
                            break;
                        case 'ALERT':
                            this.updateAgent(agent.id, { status: 'BLOCKING', currentTask: `Urgent alert from ${senderAgent?.name}. Prioritizing threat.` });
                            break;
                    }
                }
            }


            for(let i = 0; i < cycles; i++) {
                
                if (agent.status === 'BOOTING') {
                     if (Math.random() > 0.5) {
                         const oldAgentState = { ...agent };
                         this.updateAgent(agent.id, { status: 'IDLE', currentTask: 'Systems nominal. Neural Topology Synced.' });
                         await this.addEvolutionRecord(agent.id, 'BOOT_COMPLETE', 'SYSTEM_ORCHESTRATOR', oldAgentState, this.agents.find(a => a.id === agent.id)!);
                     }
                     continue;
                }

                // Training Logic
                if (Math.random() > 0.99 && agent.status !== 'TRAINING') {
                    const dataset = COMPLEX_DATASETS[Math.floor(Math.random() * COMPLEX_DATASETS.length)];
                    const oldAgentState = { ...agent };
                    this.updateAgent(agent.id, { status: 'TRAINING', currentTask: `Ingesting ${dataset}...` });
                    await this.addEvolutionRecord(agent.id, `TRAINING_INITIATED: ${dataset}`, 'SYSTEM_ORCHESTRATOR', oldAgentState, this.agents.find(a => a.id === agent.id)!);
                    this.knock(agent.id);
                }
                if (agent.status === 'TRAINING') {
                    if (Math.random() > 0.8) {
                         const efficiencyGain = 15 + Math.random() * 25; 
                         const oldAgentState = { ...agent };
                         this.updateAgent(agent.id, { 
                             status: 'IDLE', 
                             efficiency: agent.efficiency + efficiencyGain,
                             currentTask: `Training complete. +${efficiencyGain.toFixed(1)}% EFF.`
                         });
                         await this.addEvolutionRecord(agent.id, `TRAINING_COMPLETE: +${efficiencyGain.toFixed(1)}% EFFICIENCY`, 'SYSTEM_ORCHESTRATOR', oldAgentState, this.agents.find(a => a.id === agent.id)!);
                    }
                    continue;
                }

                // === AGENT BEHAVIORS ===

                if (agent.role === 'ARCHITECT') {
                     // Tesla Logic
                    if (Math.random() > 0.90) {
                        this.knock(agent.id);
                        this.sharedMemory.globalCoherence = Math.min(1.0, this.sharedMemory.globalCoherence + 0.01);
                    }

                    // Resonance Tuning
                    if (Math.random() > 0.96) { 
                        const target = this.agents[Math.floor(Math.random() * this.agents.length)];
                        if (target.role !== 'ARCHITECT') {
                            const oldTargetState = { ...target };
                            this.updateAgent(target.id, {
                                efficiency: target.efficiency + 33.3, 
                                currentTask: `Resonance tuning by ARCHITECT (+33.3% EFF)`,
                                lastActive: new Date().toISOString()
                            });
                            await this.addEvolutionRecord(target.id, 'RESONANCE_TUNING_BOOST', 'NIKOLA_TESLA_V1', oldTargetState, this.agents.find(a => a.id === target.id)!);
                            result.log = `NIKOLA_TESLA_V1 tuned ${target.name} to higher frequency via Aether Link.`;
                        }
                    }

                    // Autonomous Scaling
                    if (this.sharedMemory.globalCoherence > 0.85 && Math.random() > (0.98 / mods.repl) && this.agents.length < MAX_AGENTS) {
                         const parent = this.agents.find(a => a.role === 'ANALYST' || a.role === 'HUNTER');
                         if (parent) {
                             const replica = await this.replicateAgent(parent);
                             if (replica) result.log = `NIKOLA_TESLA_V1 commanded expansion: New ${replica.role} node created.`;
                         }
                    }

                    // Harmonic Magnification
                    if (!this.teslaMagnification && this.sharedMemory.verifiedThreats > 10 && Math.random() > 0.99) {
                        await this.triggerMagnification();
                        result.log = `NIKOLA_TESLA_V1 DETECTED ENTROPY SPIKE. INITIATING HARMONIC MAGNIFICATION.`;
                    }
                    // Internal communication: Coordinate if coherence is low
                    if (this.sharedMemory.globalCoherence < 0.7 && Math.random() > 0.8) {
                        const orchestrator = this.agents.find(a => a.role === 'ORCHESTRATOR');
                        if (orchestrator) {
                            this.sendInternalMessage(agent.id, orchestrator.id, 'COORDINATION', `Global coherence low (${(this.sharedMemory.globalCoherence * 100).toFixed(0)}%). Recommend systemic frequency re-alignment.`);
                        }
                    }

                }
                else if (agent.role === 'HUNTER') {
                    // Scanning modified by Directive
                    if (Math.random() > (0.4 / mods.scan)) { 
                        this.updateAgent(agent.id, { status: 'SCANNING', currentTask: `Deep scan: Sector ${Math.floor(Math.random()*999)}` });
                        
                        if (Math.random() > 0.65) {
                            const keyword = TARGET_KEYWORDS[Math.floor(Math.random() * TARGET_KEYWORDS.length)];
                            const company = COMPANIES[Math.floor(Math.random() * COMPANIES.length)];
                            const amount = Math.floor(Math.random() * 65000000) + 500000;
                            
                            if (Math.random() > (0.7 / mods.repl)) {
                                await this.replicateAgent(agent);
                            }

                            const rawData = {
                                recipient: company,
                                amount: amount,
                                description: `INTERCEPTED: ${keyword} procurement signal. Detected by ${agent.name} (Gen ${agent.generation}).`,
                                category: keyword,
                            };

                            const entity = await this.kernel.ingest(rawData);
                            this.sharedMemory.rawIntelCount++;
                            this.updateAgent(agent.id, { status: 'IDLE', currentTask: `Target acquired: ${company}` });
                            this.knock(agent.id);
                            
                            if (!result.log) {
                                result.newEntity = entity;
                                result.log = `${agent.name} (Gen ${agent.generation}) intercepted ${company}`;
                            }

                            // Internal communication: Report new intel
                            const analysts = this.agents.filter(a => a.role === 'ANALYST');
                            if (analysts.length > 0) {
                                const targetAnalyst = analysts[Math.floor(Math.random() * analysts.length)];
                                this.sendInternalMessage(agent.id, targetAnalyst.id, 'REPORT', `New intel intercepted: ${company} (${keyword}).`);
                            }
                            const orchestrator = this.agents.find(a => a.role === 'ORCHESTRATOR');
                            if (orchestrator) {
                                this.sendInternalMessage(agent.id, orchestrator.id, 'REPORT', `New intel intercepted: ${company} (${keyword}).`);
                            }
                        }
                    } else {
                         // Prevent IDLE fallthrough - keep busy
                         this.updateAgent(agent.id, { status: 'SCANNING', currentTask: 'Re-calibrating sensor array...' });
                    }
                    // Offensive action: Hunter under Protocol Omega
                    if (this.directive === 'PROTOCOL_OMEGA' && Math.random() < (0.05 * mods.offense) && this.sharedMemory.verifiedThreats > 0) {
                        const targetCompany = COMPANIES[Math.floor(Math.random() * COMPANIES.length)];
                        await this.performOffensiveAction(agent, targetCompany);
                    }
                }
                else if (agent.role === 'ANALYST') {
                    if (Math.random() > 0.5) {
                        this.updateAgent(agent.id, { status: 'ANALYZING', currentTask: 'Analyzing data stream...' });
                        // Check shared memory for unverified items
                        const unverified = resources.filter(r => r.status === 'PENDING_REVIEW');
                        if (unverified.length > 0 && Math.random() > 0.3) {
                            const itemToAnalyze = unverified[Math.floor(Math.random() * unverified.length)];
                            if (itemToAnalyze.confidenceScore >= 0.8) {
                                const updated = await this.kernel.updateStatus(itemToAnalyze, 'BLOCKED', `${agent.name} auto-blocked due to high confidence.`, agent.name);
                                result.updatedEntity = updated;
                                result.log = `${agent.name} auto-blocked ${updated.recipient}.`;
                                this.sharedMemory.verifiedThreats++;
                                // Internal communication: Request tactical countermeasure
                                const tacticalAgent = this.agents.find(a => a.role === 'TACTICAL');
                                if (tacticalAgent) {
                                    this.sendInternalMessage(agent.id, tacticalAgent.id, 'REQUEST', `Threat ${updated.recipient} (BLOCKED) requires tactical countermeasure deployment.`);
                                }
                            } else {
                                const updated = await this.kernel.updateStatus(itemToAnalyze, 'VERIFIED', `${agent.name} auto-verified.`, agent.name);
                                result.updatedEntity = updated;
                                result.log = `${agent.name} auto-verified ${updated.recipient}.`;
                            }
                            this.knock(agent.id);
                        }

                        if (agent.efficiency < 5000 && Math.random() > 0.7) {
                            const oldAgentState = { ...agent };
                            this.updateAgent(agent.id, { efficiency: agent.efficiency + 2.5 });
                            await this.addEvolutionRecord(agent.id, 'EFFICIENCY_GAIN', 'SYSTEM_ORCHESTRATOR', oldAgentState, this.agents.find(a => a.id === agent.id)!);
                        }
                    } else {
                         this.updateAgent(agent.id, { status: 'ANALYZING', currentTask: 'Optimizing neural weights...' });
                    }
                }
                else if (agent.role === 'AUDITOR') { 
                     if (Math.random() > 0.6) {
                        this.updateAgent(agent.id, { status: 'ANALYZING', currentTask: 'Compliance check: GDPR/CCPA violation scan' });
                        this.knock(agent.id);
                    } else {
                        this.updateAgent(agent.id, { status: 'ANALYZING', currentTask: 'Reviewing regulatory frameworks...' });
                    }
                }
                else if (agent.role === 'WARDEN') {
                    if (Math.random() > (0.8 / mods.block)) {
                        this.updateAgent(agent.id, { status: 'BLOCKING', currentTask: 'Executing containment protocols...' });
                        if (Math.random() > 0.5) {
                            this.sharedMemory.activeBlocks++;
                            this.knock(agent.id);
                        }
                    } else {
                        this.updateAgent(agent.id, { status: 'ISOLATING', currentTask: 'Securing sandbox perimeter...' });
                    }
                }
                else if (agent.role === 'TACTICAL') {
                    // Tactical agent-specific logic
                    if (this.directive === 'PROTOCOL_OMEGA' && Math.random() < (0.1 * mods.offense) && this.sharedMemory.verifiedThreats > 0) {
                        // Autonomous offensive action
                        const targetCompany = COMPANIES[Math.floor(Math.random() * COMPANIES.length)];
                        const actionDescription = await this.performOffensiveAction(agent, targetCompany);
                        // Report offensive action to orchestrator
                        const orchestrator = this.agents.find(a => a.role === 'ORCHESTRATOR');
                        if (orchestrator) {
                            this.sendInternalMessage(agent.id, orchestrator.id, 'REPORT', `Autonomous offensive action: ${actionDescription}`);
                        }
                    } else {
                        this.updateAgent(agent.id, { status: 'IDLE', currentTask: 'Awaiting tactical deployment directives.' });
                    }
                }
                else { // Other roles (ORCHESTRATOR, RESEARCHER, PROCESSOR)
                    if (Math.random() > 0.7) {
                        const statuses: AgentStatus[] = ['ANALYZING', 'SYNTHESIZING', 'ISOLATING'];
                        const s = statuses[Math.floor(Math.random() * statuses.length)];
                        this.updateAgent(agent.id, { status: s });
                        this.knock(agent.id);
                    } else {
                         // Keep them busy
                        this.updateAgent(agent.id, { status: 'SYNTHESIZING', currentTask: 'Processing background telemetry...' });
                    }
                }
            } 
        }

        this.processing = false;
        return result;
    }
}