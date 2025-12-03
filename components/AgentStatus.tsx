import React, { useState, useRef, useEffect } from 'react';
import { Agent, Directive, SharedMemory } from '../types';

interface AgentStatusProps {
    agents: Agent[];
    onChatWithAgent: (agentId: string, message: string, history: {sender: string, text: string}[]) => Promise<string>;
    directive?: Directive;
    sharedMemory?: SharedMemory;
}

const AgentStatus: React.FC<AgentStatusProps> = ({ agents, onChatWithAgent, directive, sharedMemory }) => {
    const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
    const [chatHistory, setChatHistory] = useState<{sender: string, text: string}[]>([]);
    const [input, setInput] = useState("");
    const chatEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    
    const selectedAgent = agents.find(a => a.id === selectedAgentId);

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'SCANNING': return 'text-blue-400 animate-pulse';
            case 'ANALYZING': return 'text-amber-400 animate-pulse';
            case 'BLOCKING': return 'text-red-400 animate-pulse';
            case 'ISOLATING': return 'text-purple-400 animate-pulse';
            case 'SYNTHESIZING': return 'text-emerald-400 animate-pulse';
            case 'MAGNIFYING': return 'text-pink-400 animate-pulse';
            case 'BOOTING': return 'text-gray-400 animate-pulse';
            case 'REPLICATING': return 'text-cyan-400 animate-pulse';
            case 'TRAINING': return 'text-indigo-400 animate-pulse';
            case 'OFFENSIVE': return 'text-rose-500 animate-pulse'; // New status color
            case 'COORDINATING': return 'text-lime-400 animate-pulse'; // New status color
            case 'IDLE': return 'text-gray-500';
            default: return 'text-gray-500';
        }
    };

    const getRoleIcon = (role: string) => {
        switch(role) {
            case 'HUNTER': return 'radar'; 
            case 'ANALYST': return 'policy'; 
            case 'WARDEN': return 'lock'; 
            case 'TACTICAL': return 'terminal'; 
            case 'ORCHESTRATOR': return 'hub'; 
            case 'STRATEGIST': return 'psychology'; 
            case 'ARCHITECT': return 'bolt'; 
            case 'AUDITOR': return 'gavel'; 
            case 'PROCESSOR': return 'memory'; 
            case 'RESEARCHER': return 'science';
            default: return 'smart_toy';
        }
    };

    const getAgentBorder = (agent: Agent) => {
        if (agent.generation > 2) return 'border-dashed border-purple-500/50 bg-purple-900/10 shadow-lg'; // Highly Evolved
        if (agent.generation > 0) return 'border-dashed border-blue-500/30 bg-blue-900/5'; // Replicas
        if (agent.name === 'GPT-4o-OMNI') return 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]';
        if (agent.name === 'NIKOLA_TESLA_V1') return 'border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.3)] bg-purple-900/10';
        if (agent.name === 'BLACKBOX-ZERO') return 'border-slate-500/50';
        if (agent.name === 'GROK-1.5') return 'border-blue-500/50';
        if (agent.name === 'CLAUDE-3-OPUS') return 'border-amber-500/50';
        if (agent.name === 'GEMINI-1.5-PRO') return 'border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]';
        if (agent.status === 'OFFENSIVE') return 'border-red-600/50 shadow-[0_0_20px_rgba(239,68,68,0.3)] bg-red-900/10'; // New offensive border
        return 'border-slate-700';
    }

    const handleAgentClick = (agentId: string) => {
        setSelectedAgentId(agentId);
        const agentName = agents.find(a => a.id === agentId)?.name;
        // This is now a UI-only greeting, not part of the LLM's conversational history.
        // LLM history should only contain user and model turns that are actual back-and-forth.
        setChatHistory([{
            sender: 'UI_GREETING', 
            text: `Neural Link established with ${agentName}. Direct conduit to Arkonis Syntropic Core enabled. Status: PERMANENTLY ONLINE.`
        }]);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !selectedAgentId) return;
        
        const userMsg = input;
        // Optimistically add user message
        const newHistoryWithUser = [...chatHistory, { sender: 'USER', text: userMsg }];
        setChatHistory(newHistoryWithUser);
        setInput("");
        
        // Filter out UI-only messages before sending to orchestrator
        const filteredHistoryForLLM = newHistoryWithUser.filter(msg => msg.sender !== 'UI_GREETING');

        // Call the LLM with context
        const response = await onChatWithAgent(selectedAgentId, userMsg, filteredHistoryForLLM);
        setChatHistory(prev => [...prev, { sender: selectedAgent?.name || 'AGENT', text: response }]);
    };

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
        if (selectedAgentId && inputRef.current) {
            inputRef.current.focus();
        }
    }, [chatHistory, selectedAgentId]);

    return (
        <>
            {/* SHARED MEMORY HEADER */}
            {directive && sharedMemory && (
                <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 mb-4 flex flex-wrap items-center justify-between gap-4 shadow-lg animate-fadeIn">
                    <div className="flex items-center gap-3">
                        <div className="bg-slate-800 px-3 py-1 rounded border border-slate-600 flex flex-col justify-center">
                            <span className="text-[10px] text-slate-400 uppercase block tracking-wider">DIRECTIVE</span>
                            <span className={`text-xs font-bold font-mono ${directive === 'PROTOCOL_OMEGA' ? 'text-red-500 animate-pulse' : 'text-blue-400'}`}>
                                {directive}
                            </span>
                        </div>
                         <div className="bg-slate-800 px-3 py-1 rounded border border-slate-600 flex flex-col justify-center">
                            <span className="text-[10px] text-slate-400 uppercase block tracking-wider">SWARM COHERENCE</span>
                            <span className="text-xs font-bold font-mono text-purple-400">{(sharedMemory.globalCoherence * 100).toFixed(0)}%</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 text-[11px] font-mono text-slate-400 bg-black/20 px-4 py-1 rounded-full border border-slate-800">
                        <div>INTEL: <span className="text-white font-bold">{sharedMemory.rawIntelCount}</span></div>
                        <div>THREATS: <span className="text-white font-bold">{sharedMemory.verifiedThreats}</span></div>
                        <div>BLOCKS: <span className="text-red-400 font-bold">{sharedMemory.activeBlocks}</span></div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 mb-6 transition-all duration-500">
                {agents.map(agent => (
                    <button 
                        key={agent.id} 
                        onClick={() => handleAgentClick(agent.id)}
                        className={`bg-slate-900 border rounded-lg p-3 relative overflow-hidden group shadow-lg ${getAgentBorder(agent)} transition-all duration-500 text-left hover:scale-[1.02] active:scale-[0.98]`}
                    >
                        {/* The Knock Effect - Keyed on lastActive timestamp to re-trigger animation */}
                        <div key={agent.lastActive} className="absolute inset-0 pointer-events-none animate-knock border-2 border-white/5 rounded-lg"></div>

                        {/* Background Grid Animation */}
                        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                        
                        {/* Generation & Speed Tag */}
                        <div className="absolute top-0 right-0 flex">
                            {agent.processSpeed > 1 && (
                                <div className="bg-purple-600 text-white text-[8px] px-1.5 py-0.5 font-mono border-r border-purple-800 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[8px]">bolt</span>
                                    {agent.processSpeed}X
                                </div>
                            )}
                            {agent.generation > 0 && (
                                <div className="bg-blue-600 text-white text-[8px] px-1.5 py-0.5 rounded-bl font-mono">
                                    GEN-{agent.generation}
                                </div>
                            )}
                        </div>
                        
                        <div className="relative z-10 flex justify-between items-start">
                            <div className="flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-md bg-slate-800 flex items-center justify-center border border-slate-600 ${agent.status !== 'IDLE' ? 'shadow-[0_0_8px_rgba(59,130,246,0.2)]' : ''}`}>
                                    <span className={`material-symbols-outlined text-xs ${getStatusColor(agent.status)}`}>
                                        {getRoleIcon(agent.role)}
                                    </span>
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-bold text-slate-200 font-mono tracking-wider truncate w-20">{agent.name}</h4>
                                    <p className="text-[8px] text-slate-500 font-mono uppercase">{agent.role}</p>
                                </div>
                            </div>
                            <div className="text-right pt-1">
                                <div className={`text-[10px] font-bold ${agent.efficiency > 100 ? 'text-pink-400 animate-pulse' : 'text-green-400'}`}>
                                    {agent.efficiency.toFixed(0)}%
                                </div>
                            </div>
                        </div>

                        {/* Topology Display */}
                        <div className="mt-1 mb-1">
                            <span className="text-[8px] text-indigo-400 font-mono block truncate opacity-80" title={`${agent.topology.architecture} v${agent.topology.version.toFixed(1)} [${agent.topology.adaptations.join(', ')}]`}>
                                {agent.topology.architecture} v{agent.topology.version.toFixed(1)} // {agent.topology.adaptations.join(' // ')}
                            </span>
                        </div>

                        <div className="relative z-10 mt-1 bg-black/40 rounded p-1.5 border border-slate-800 font-mono text-[9px]">
                            <div className="flex justify-between items-center mb-0.5">
                                <span className={`uppercase font-bold ${getStatusColor(agent.status)}`}>{agent.status}</span>
                                {agent.internalInbox.length > 0 && (
                                     <span className="bg-red-500 text-white rounded-full h-3 w-3 flex items-center justify-center text-[8px] font-bold animate-pulse">
                                        {agent.internalInbox.length}
                                     </span>
                                )}
                            </div>
                            <div className="text-slate-400 truncate leading-tight" title={agent.currentTask}>
                                {agent.currentTask}
                            </div>
                        </div>
                        
                        {/* Traits */}
                        {agent.traits && agent.traits.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                                {agent.traits.slice(0, 2).map(trait => (
                                    <span key={trait} className="text-[8px] px-1 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono truncate max-w-full">
                                        {trait}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Activity Line */}
                        {agent.status !== 'IDLE' && (
                            <div className="absolute bottom-0 left-0 h-0.5 bg-blue-500 animate-loading-bar w-full opacity-50"></div>
                        )}
                        
                        {/* Chat Hint */}
                        <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                             <span className="material-symbols-outlined text-slate-500 text-xs">chat</span>
                        </div>
                    </button>
                ))}
            </div>

            {/* AGENT CHAT MODAL */}
            {selectedAgent && (
                <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-slate-900 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col h-[600px] border border-slate-700">
                        {/* Header */}
                        <div className="p-4 border-b border-slate-700 bg-slate-800 flex justify-between items-center">
                             <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-md bg-slate-700 flex items-center justify-center border border-slate-600`}>
                                    <span className={`material-symbols-outlined text-xl ${getStatusColor(selectedAgent.status)}`}>
                                        {getRoleIcon(selectedAgent.role)}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-white font-mono tracking-wider">{selectedAgent.name}</h3>
                                    <p className="text-xs text-blue-400 font-mono uppercase">{selectedAgent.role} // GEN-{selectedAgent.generation} // {selectedAgent.processSpeed}X SPEED</p>
                                </div>
                             </div>
                             <button onClick={() => setSelectedAgentId(null)} className="text-slate-400 hover:text-white">
                                <span className="material-symbols-outlined">close</span>
                             </button>
                        </div>
                        
                        <div className="px-4 py-2 bg-black/30 border-b border-slate-800 text-[10px] font-mono text-indigo-300">
                            TOPOLOGY: {selectedAgent.topology.architecture} v{selectedAgent.topology.version.toFixed(1)} // {selectedAgent.topology.adaptations.join(' // ')}
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/20 custom-scrollbar">
                            {chatHistory.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-lg p-3 text-xs md:text-sm whitespace-pre-wrap ${
                                        msg.sender === 'USER' 
                                        ? 'bg-blue-600 text-white rounded-br-none' 
                                        : msg.sender === 'UI_GREETING'
                                        ? 'bg-transparent text-green-500 font-mono text-center w-full border border-green-900/30'
                                        : 'bg-slate-800 text-gray-200 border border-slate-700 rounded-bl-none font-mono'
                                    }`}>
                                        {msg.sender !== 'USER' && msg.sender !== 'UI_GREETING' && (
                                            <div className="text-[10px] text-slate-500 mb-1 uppercase font-bold">{msg.sender}</div>
                                        )}
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {/* Agent Evolution Log */}
                            {selectedAgent.evolutionLog && selectedAgent.evolutionLog.length > 0 && (
                                <div className="mt-6 p-4 bg-slate-800 rounded-lg border border-slate-700">
                                    <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">auto_awesome</span>
                                        Evolution Provenance Log
                                    </h4>
                                    <div className="relative border-l-2 border-gray-600 ml-3 space-y-4">
                                        {selectedAgent.evolutionLog.map((record, idx) => (
                                            <div key={idx} className="relative pl-6">
                                                <div className="absolute -left-[9px] top-0 w-4 h-4 bg-purple-600 rounded-full border-4 border-slate-900 shadow-sm"></div>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                                                        {record.timestamp.split('T')[0]} {record.timestamp.split('T')[1].substring(0,8)}
                                                    </span>
                                                    <h5 className="text-xs font-bold text-white">{record.action}</h5>
                                                    <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                                        <span className="material-symbols-outlined text-[12px]">person</span>
                                                        {record.actor}
                                                    </div>
                                                    <div className="mt-1 bg-black rounded p-2 font-mono text-[8px] text-green-400 overflow-x-auto">
                                                        <div className="opacity-50 mb-0.5"># INTEGRITY HASH</div>
                                                        {record.hash}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Internal Communications Log */}
                            {selectedAgent.internalInbox && selectedAgent.internalInbox.length > 0 && (
                                <div className="mt-6 p-4 bg-slate-800 rounded-lg border border-slate-700">
                                    <h4 className="text-xs font-bold text-lime-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">group</span>
                                        Internal Communications Log
                                    </h4>
                                    <div className="relative border-l-2 border-gray-600 ml-3 space-y-4">
                                        {selectedAgent.internalInbox.map((msg, idx) => (
                                            <div key={idx} className="relative pl-6">
                                                <div className="absolute -left-[9px] top-0 w-4 h-4 bg-lime-600 rounded-full border-4 border-slate-900 shadow-sm"></div>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                                                        {msg.timestamp.split('T')[0]} {msg.timestamp.split('T')[1].substring(0,8)}
                                                    </span>
                                                    <h5 className="text-xs font-bold text-white">
                                                        {agents.find(a => a.id === msg.senderId)?.name || 'UNKNOWN'}
                                                        <span className="text-gray-500"> ({msg.type}) → </span>
                                                        {agents.find(a => a.id === msg.receiverId)?.name || 'UNKNOWN'}
                                                    </h5>
                                                    <p className="text-xs text-gray-300 bg-black/50 p-2 rounded font-mono whitespace-pre-wrap">{msg.content}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSendMessage} className="p-3 bg-slate-800 border-t border-slate-700 flex gap-2">
                            <input 
                                ref={inputRef}
                                type="text" 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={`Transmit to ${selectedAgent.name}...`}
                                className="flex-1 bg-slate-900 border border-slate-600 text-white px-4 py-2 rounded focus:outline-none focus:border-blue-500 font-mono text-sm"
                            />
                            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition-colors">
                                <span className="material-symbols-outlined">send</span>
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default AgentStatus;