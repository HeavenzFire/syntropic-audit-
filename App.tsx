
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MOCK_DATA } from './constants';
import { ContractData, SystemLog, UserRole, DefenseVector, ShellType, Agent, Directive, SharedMemory } from './types';
import { SystemKernel } from './utils/kernel';
import { AgentOrchestrator } from './utils/orchestrator';
import HydraGraph from './components/HydraGraph';
import DefensePanel from './components/DefensePanel';
import Terminal from './components/Terminal';
import ReviewQueue from './components/ReviewQueue';
import ProvenanceLog from './components/ProvenanceLog';
import AgentStatus from './components/AgentStatus';
import ElysiumGateway from './components/ElysiumGateway';

type AppState = 'signup' | 'provisioning' | 'dashboard';
type Page = 'dashboard' | 'compute' | 'storage' | 'networking' | 'monitoring' | 'logging' | 'security' | 'elysium';

const App: React.FC = () => {
  // --- KERNEL & ORCHESTRATOR INSTANTIATION ---
  const kernelRef = useRef<SystemKernel | null>(null);
  const orchestratorRef = useRef<AgentOrchestrator | null>(null);

  // Initialize kernel and orchestrator once
  if (!kernelRef.current) {
    kernelRef.current = new SystemKernel('VIEWER', 'guest');
  }
  const kernel = kernelRef.current;
  
  if (!orchestratorRef.current) {
    orchestratorRef.current = new AgentOrchestrator(kernel);
  }
  const orchestrator = orchestratorRef.current;

  // --- STATE ---
  const [appState, setAppState] = useState<AppState>('signup');
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [userRole, setUserRole] = useState<UserRole>('VIEWER');
  
  // Data State
  const [resources, setResources] = useState<ContractData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [agents, setAgents] = useState<Agent[]>(orchestrator.getAgents());
  const [directive, setDirective] = useState<Directive>('ACTIVE_DEFENSE');
  const [sharedMemory, setSharedMemory] = useState<SharedMemory>({ rawIntelCount: 0, verifiedThreats: 0, activeBlocks: 0, globalCoherence: 1.0, lastSignal: '' });
  
  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'graph' | 'starlight'>('list');
  const [notification, setNotification] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [selectedProvenanceItem, setSelectedProvenanceItem] = useState<ContractData | null>(null);

  // --- INITIALIZATION & INGESTION ---
  useEffect(() => {
    if (appState === 'dashboard' && resources.length === 0) {
        const initData = async () => {
            // Ingest initial batch of mock data
            const processed = await Promise.all(MOCK_DATA.map(d => kernel.ingest(d)));
            setResources(processed);
            addLog('SUCCESS', `Kernel initialized. ${processed.length} entities loaded from cold storage.`);
            addLog('INFO', 'Neural Council online. Agents standing by.');
            addLog('INFO', 'Integrity Check: Gemini, Tesla, Mistral modules ACTIVE.');
        };
        initData();
    }
  }, [appState]);

  // --- ORCHESTRATOR LOOP (LIVE FEED) ---
  useEffect(() => {
    if (appState === 'dashboard') {
        const interval = setInterval(async () => {
            // Tick the multi-agent system with current state context
            const result = await orchestrator.tick(resources);
            
            // Update Agent UI & Shared Stats
            setAgents(orchestrator.getAgents());
            setSharedMemory(orchestrator.getSharedMemory());
            setDirective(orchestrator.getDirective());

            // Handle Updates from Tesla/Architect
            if (result.updatedEntity) {
                 setResources(prev => prev.map(r => r.id === result.updatedEntity!.id ? result.updatedEntity! : r));
                 if (result.log) addLog('RESONANCE', result.log);
            }

            // Handle new intel found by Hunter
            if (result.newEntity) {
                setResources(prev => [result.newEntity!, ...prev]);
                if (result.log) addLog('WARN', result.log);
            }
        }, 1000); // 1Hz tick rate for UI updates

        return () => clearInterval(interval);
    }
  }, [appState, resources]); 

  // --- ACTIONS ---

  const updateRole = (role: UserRole) => {
      kernel.setUser(role, role === 'ADMIN' ? 'root' : role === 'ANALYST' ? 'analyst_01' : 'guest');
      setUserRole(role);
      addLog('INFO', `Session escalated to ${role} privileges.`);
      showNotification(`Role switched to ${role}`);
      setIsProfileOpen(false);
  };

  const addLog = (level: SystemLog['level'], message: string, source: string = 'CORE_KERNEL') => {
    setLogs(prev => [{
        id: Math.random().toString(36),
        timestamp: new Date().toISOString(),
        level,
        message,
        source
    }, ...prev].slice(0, 100));
  };

  const handleStartTrial = () => {
    setAppState('provisioning');
    setTimeout(() => {
       setAppState('dashboard');
       updateRole('ADMIN'); 
    }, 3500);
  };

  const showNotification = (message: string) => {
    setNotification(message);
    // Fix: Set notification to null after 3000ms to clear it.
    setTimeout(() => setNotification(null), 3000);
  };

  // Human-in-the-Loop Actions
  const handleVerify = async (item: ContractData) => {
      try {
          const updated = await kernel.updateStatus(item, 'VERIFIED', 'Manual verification by analyst.');
          setResources(prev => prev.map(r => r.id === item.id ? updated : r));
          addLog('SUCCESS', `Entity ${item.recipient} verified.`);
      } catch (e: any) {
          showNotification(e.message);
      }
  };

  const handleBan = async (item: ContractData) => {
      try {
          const updated = await kernel.updateStatus(item, 'BLOCKED', 'Active threat identified. Blocking.');
          setResources(prev => prev.map(r => r.id === item.id ? updated : r));
          addLog('CRITICAL', `Entity ${item.recipient} BLOCKED.`);
      } catch (e: any) {
          showNotification(e.message);
      }
  };

  const handleDelegateToTesla = async () => {
      addLog('RESONANCE', 'Delegating verification queue to NIKOLA_TESLA_V1...');
      const result = await orchestrator.processPendingQueue(resources);
      
      if (result.updatedEntities.length > 0) {
          setResources(prev => {
              const newResources = [...prev];
              result.updatedEntities.forEach(updated => {
                  const index = newResources.findIndex(r => r.id === updated.id);
                  if (index !== -1) newResources[index] = updated;
              });
              return newResources;
          });
          result.logs.forEach(l => addLog('SUCCESS', l));
          showNotification(`Architect processed ${result.updatedEntities.length} items.`);
      } else {
          addLog('INFO', 'Architect found no items meeting strict confidence thresholds.');
          showNotification('No high-confidence items to process.');
      }
  };

  const handleExport = async (type: DefenseVector) => {
      const artifact = await kernel.generateExport(resources, type);
      
      // Trigger download
      const blob = new Blob([artifact.content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = artifact.name;
      a.click();
      window.URL.revokeObjectURL(url);

      addLog('SUCCESS', `Generated ${artifact.type.toUpperCase()} artifact: ${artifact.name}`);
      addLog('INFO', `Artifact signed: ${artifact.hash.substring(0, 16)}...`);
      showNotification(`Downloaded ${artifact.name}`);
  };
  
  const handleChatWithAgent = async (agentId: string, message: string, history: {sender: string, text: string}[]): Promise<string> => {
      return orchestrator.chatWithAgent(agentId, message, history);
  };

  const handleTerminalExecute = (cmd: string, shell: ShellType): string => {
      const lowerCmd = cmd.toLowerCase().trim();
      
      // GLOBAL COMMANDS
      if (lowerCmd === 'help') return ''; 
      if (lowerCmd === 'clear' || lowerCmd === 'cls') return '';
      if (lowerCmd === 'exit') return ''; 
      
      if (lowerCmd === 'elysium') {
          setActivePage('elysium');
          return 'Initiating transport to Elysium Gateway... [OK]';
      }
      
      if (lowerCmd === 'magnify') {
          orchestrator.triggerMagnification();
          addLog('RESONANCE', '369Hz Frequency Injection Active.');
          return 'MAGNIFICATION SEQUENCE STARTED. NEURAL COUNCIL OVERCLOCKED.';
      }

      if (lowerCmd === 'starlight') {
          setViewMode(prev => prev === 'starlight' ? 'graph' : 'starlight');
          return `Visual rendering set to: ${viewMode === 'starlight' ? 'STANDARD' : 'QUANTUM STARLIGHT'}`;
      }

      if (lowerCmd === 'defense') {
          return `
SOVEREIGN DEFENSE GRID [v1.0]
-----------------------------
Status:       ACTIVE
Blocklists:   ${Object.keys(resources.filter(r => r.status === 'BLOCKED')).length > 0 ? 'GENERATED' : 'READY'}
Integrity:    VERIFIED
Protocols:    Hosts, Pi-hole, DNSMasq, Unbound, Little Snitch
Uplink:       SECURE

Type 'export <type>' to generate artifacts.
`;
      }

      if (lowerCmd === 'models') {
          return agents.map(a => `[${a.role}] ${a.name}: ${a.status} (${a.efficiency.toFixed(1)}%)`).join('\n');
      }
      
      if (lowerCmd === 'system') {
          return 'Syntropic Core: STABLE\nKernel Integrity: VERIFIED (SHA-256)\nResonance: 100%\nUplink: SECURE';
      }
      
      if (lowerCmd === 'scan') {
           addLog('INFO', 'Manual deep scan initiated via Terminal.');
           return 'Scan request acknowledged. Hunter agent dispatched.';
      }
      
      if (lowerCmd.startsWith('set defcon ')) {
          const level = lowerCmd.split(' ')[2];
          if (level === '1') { orchestrator.setDirective('PROTOCOL_OMEGA'); return "DEFCON 1: PROTOCOL OMEGA ACTIVE. AGENTS UNLEASHED."; }
          if (level === '5') { orchestrator.setDirective('SILENT_WATCH'); return "DEFCON 5: SILENT WATCH ACTIVE. PASSIVE MONITORING ONLY."; }
          orchestrator.setDirective('ACTIVE_DEFENSE');
          return "DIRECTIVE UPDATED: ACTIVE DEFENSE.";
      }

      if (lowerCmd.startsWith('export ')) {
          const type = lowerCmd.split(' ')[1] as DefenseVector;
          if (['hosts', 'pihole', 'dnsmasq', 'unbound', 'littlesnitch', 'json', 'csv'].includes(type)) {
              handleExport(type);
              return `Exporting ${type} artifact... [DONE]`;
          }
          return `Usage: export [hosts|pihole|dnsmasq|unbound|littlesnitch|json|csv]`;
      }

      // SHELL SPECIFIC SIMULATION
      if (shell === 'POWERSHELL') {
          if (lowerCmd === 'get-process') return 'Handles  NPM(K)    PM(K)      WS(K)     CPU(s)     Id  SI ProcessName\n-------  ------    -----      -----     ------     --  -- -----------\n    452      15     2340       5600       0.05   1204   1  svchost\n    892      42    45200      89000       2.45   4521   1  arkonis-core\n    120      12     1200       4500       0.01   8822   1  neural-agent';
          if (lowerCmd === 'dir' || lowerCmd === 'ls') return 'Directory: C:\\Arkonis\\Data\n\nMode                 LastWriteTime         Length Name\n----                 -------------         ------ ----\nd-----        11/05/2024   10:00 AM                Contracts\n-a----        11/05/2024   10:02 AM           4096 blacklist.json\n-a----        11/05/2024   10:05 AM           2048 neural_weights.bin';
          if (lowerCmd === 'get-service') return 'Status   Name               DisplayName\n------   ----               -----------\nRunning  ArkonisCore        Arkonis Sovereignty Engine\nRunning  TeslaUplink        Tesla Resonance Link\nStopped  WindowsUpdate      Windows Update';
      }

      if (shell === 'UBUNTU' || shell === 'BASH') {
           if (lowerCmd === 'uname -a') return 'Linux arkonis-node 5.15.0-72-generic #79-Ubuntu SMP Tue Apr 18 16:00:00 UTC 2024 x86_64 x86_64 x86_64 GNU/Linux';
           if (lowerCmd.startsWith('apt')) return 'Reading package lists... Done\nBuilding dependency tree... Done\n0 upgraded, 0 newly installed, 0 to remove and 0 not upgraded.';
           if (lowerCmd === 'top') return 'top - 10:00:01 up 14 days,  2:30,  1 user,  load average: 0.05, 0.02, 0.01\nTasks: 11 total,   1 running,  10 sleeping,   0 stopped,   0 zombie';
           if (lowerCmd === 'systemctl status') return '● arkonis.service - Arkonis Defense Grid\n   Loaded: loaded (/etc/systemd/system/arkonis.service; enabled; vendor preset: enabled)\n   Active: active (running) since Tue 2024-05-12 10:00:00 UTC; 2h 30min ago';
           if (lowerCmd === 'ls -la') return 'total 48\ndrwxr-xr-x 4 root root 4096 May 12 10:00 .\ndrwxr-xr-x 3 root root 4096 May 12 09:55 ..\n-rw-r--r-- 1 root root  220 May 12 09:55 .bash_logout\n-rw-r--r-- 1 root root 3771 May 12 09:55 .bashrc\n-rwxr-x--- 1 root root 8192 May 12 10:01 arkonis_d';
      }
      
      if (shell === 'TERMUX') {
          if (lowerCmd === 'pkg update') return 'Checking availability of current mirror: ok\nTesting the available mirrors:\n[*] https://dl.termux.org/packages/termux-main: ok\nReading package lists... Done';
          if (lowerCmd === 'termux-info') return 'Termux Variables:\nTERMUX_API_VERSION=0.50\nTERMUX_VERSION=0.118.0\nPackages CPU architecture: aarch64';
          if (lowerCmd === 'termux-battery-status') return '{\n  "health": "GOOD",\n  "percentage": 92,\n  "plugged": "UNPLUGGED",\n  "status": "DISCHARGING"\n}';
      }
      
      if (shell === 'CROSH') {
          if (lowerCmd === 'battery_test') return 'No battery found.';
          if (lowerCmd === 'network_diag') return 'Network diagnosis...\nLocal Network: PASS\nInternet Connectivity: PASS\nDNS Resolution: PASS';
          if (lowerCmd === 'ping') return 'usage: ping [-c count] [-i interval] [-n] [-s packetsize] [-W waittime] destination';
      }

      if (shell === 'PYTHON') {
          if (lowerCmd.startsWith('print')) return lowerCmd.replace('print(', '').replace(')', '').replace(/"/g, '').replace(/'/g, '');
          if (lowerCmd === 'import os') return '';
          if (lowerCmd === 'os.getcwd()') return "'/home/arkonis'";
          if (lowerCmd === 'help()') return 'Welcome to Python 3.10!  This is the interactive help utility.';
      }
      
      // If command not found in shells, treat as conversational query to the Neural Council
      return orchestrator.ask(cmd);
  };

  // --- COMPUTED ---
  const filteredResources = useMemo(() => {
    return resources.filter(r => 
      r.recipient.toLowerCase().includes(searchQuery.toLowerCase()) || 
      r.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [resources, searchQuery]);

  const pendingCount = useMemo(() => resources.filter(r => r.status === 'PENDING_REVIEW').length, [resources]);
  const blockedCount = useMemo(() => resources.filter(r => r.status === 'BLOCKED').length, [resources]);
  const totalValue = useMemo(() => resources.filter(r => r.status === 'BLOCKED' || r.status === 'VERIFIED').reduce((acc, curr) => acc + curr.amount, 0), [resources]);

  // Profit vs Life Index Calculation
  const profitLifeIndex = useMemo(() => {
      const blockedVal = resources.filter(r => r.status === 'BLOCKED').reduce((acc, c) => acc + c.amount, 0);
      const totalVal = resources.reduce((acc, c) => acc + c.amount, 0);
      if (totalVal === 0) return 0;
      return ((blockedVal / totalVal) * 100).toFixed(1);
  }, [resources]);

  // --- RENDER: SIGNUP ---
  if (appState === 'signup') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg w-full border border-gray-100">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
                 <div className="bg-blue-600 p-2 rounded-lg">
                    <span className="material-symbols-outlined text-white text-3xl">shield_lock</span>
                 </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Start your Free Trial</h1>
            <p className="text-gray-600 mt-2">Access the Arkonis Sovereign Cloud Platform.</p>
          </div>

          <div className="flex justify-between mb-8 text-xs font-medium text-gray-400 uppercase tracking-wider">
            <span className="text-blue-600">1. Account</span>
            <span className="text-blue-600">2. Verification</span>
            <span className="text-blue-600 border-b-2 border-blue-600 pb-1">3. Ready</span>
          </div>

          <div className="space-y-6">
            <div className="bg-teal-50 p-4 rounded-lg flex items-start gap-3 border border-teal-100 text-teal-800">
                <span className="material-symbols-outlined">verified_user</span>
                <div>
                    <h3 className="font-bold text-sm">Frictionless Entry</h3>
                    <p className="text-xs mt-1">No credit card required. No identity verification. Immediate access to the sovereign layer.</p>
                </div>
            </div>

            <form>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country / Region</label>
                    <select className="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                        <option>United States</option>
                        <option>United Kingdom</option>
                        <option>European Union</option>
                        <option>International (Sovereign)</option>
                    </select>
                </div>

                <div className="mt-6 text-xs text-gray-500 text-center">
                    By clicking "Start Free", you agree to the Protocol Terms. <br/>
                    <a href="#" className="text-blue-600 hover:underline">Mission Statement</a>
                </div>

                <button 
                    type="button" 
                    onClick={handleStartTrial}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg mt-4 transition duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                    Start My Free Trial
                </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER: PROVISIONING ---
  if (appState === 'provisioning') {
      return (
          <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center font-mono text-green-400">
              <div className="w-96 space-y-4">
                  <div className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                      <span className="animate-spin material-symbols-outlined">settings</span>
                      PROVISIONING ENV...
                  </div>
                  
                  <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                          <span>> Initializing Kernel...</span>
                          <span className="text-green-500">[OK]</span>
                      </div>
                      <div className="flex justify-between animate-pulse delay-75">
                          <span>> Loading Neural Weights...</span>
                          <span className="text-green-500">[OK]</span>
                      </div>
                      <div className="flex justify-between animate-pulse delay-150">
                          <span>> Connecting to Global Grid...</span>
                          <span className="text-green-500">[OK]</span>
                      </div>
                      <div className="flex justify-between animate-pulse delay-300">
                          <span>> Establishing Sovereign Handshake...</span>
                          <span className="text-blue-400">[VERIFIED]</span>
                      </div>
                      <div className="flex justify-between animate-pulse delay-500">
                          <span>> Spinning up Hunter Agents...</span>
                          <span className="text-amber-400">[ACTIVE]</span>
                      </div>
                  </div>

                  <div className="w-full bg-slate-800 h-1 rounded mt-8 overflow-hidden">
                      <div className="bg-blue-500 h-full animate-progress w-full origin-left scale-x-0"></div>
                  </div>
              </div>
          </div>
      );
  }

  // --- RENDER: DASHBOARD (ELYSIUM OR STANDARD) ---
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-sm">
        
        {/* TOP BAR */}
        <header className="h-16 bg-google-blue text-white flex items-center px-4 justify-between shadow-md z-50 relative">
            <div className="flex items-center gap-4">
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-white/10 rounded-full">
                    <span className="material-symbols-outlined">menu</span>
                </button>
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-2xl">cloud_circle</span>
                    <span className="font-semibold text-lg tracking-tight">Google Cloud Platform</span>
                    <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-mono">Arkonis Project</span>
                </div>
            </div>

            <div className="flex-1 max-w-2xl px-8">
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="Search resources, docs, products..." 
                        className="w-full bg-white/15 border border-transparent focus:border-white/50 focus:bg-white/25 text-white placeholder-white/70 px-10 py-2 rounded-md outline-none transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <span className="material-symbols-outlined absolute left-2 top-2 text-white/70">search</span>
                    <div className="absolute right-2 top-2 bg-black/20 px-1.5 rounded text-[10px] font-mono border border-white/10">/</div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                 <div className="hidden md:flex items-center gap-4 mr-4">
                    <button 
                        onClick={() => setIsTerminalOpen(!isTerminalOpen)}
                        className={`p-2 rounded-full transition-colors ${isTerminalOpen ? 'bg-white text-blue-600' : 'hover:bg-white/10'}`}
                        title="Activate Terminal"
                    >
                        <span className="material-symbols-outlined">terminal</span>
                    </button>
                    <button 
                        onClick={() => setActivePage('elysium')}
                        className={`p-2 rounded-full transition-colors ${activePage === 'elysium' ? 'bg-white text-blue-600' : 'hover:bg-white/10'}`}
                        title="Elysium Gateway"
                    >
                        <span className="material-symbols-outlined">all_inclusive</span>
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded-full relative" onClick={() => setIsNotifOpen(!isNotifOpen)}>
                        <span className="material-symbols-outlined">notifications</span>
                        {logs.filter(l => l.level === 'CRITICAL').length > 0 && (
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-blue-600"></span>
                        )}
                    </button>
                 </div>
                 <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="w-8 h-8 rounded-full bg-indigo-600 border-2 border-white/20 flex items-center justify-center text-xs font-bold hover:opacity-90"
                 >
                    {userRole === 'ADMIN' ? 'A' : userRole === 'ANALYST' ? 'S' : 'V'}
                 </button>
            </div>
        </header>

        {/* DROPDOWNS */}
        {isProfileOpen && (
            <div className="absolute top-14 right-4 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 p-2 animate-fadeIn">
                <div className="p-2 border-b border-gray-100 mb-2">
                    <p className="font-bold text-gray-800">System User</p>
                    <p className="text-xs text-gray-500 font-mono">{userRole} PRIVILEGES</p>
                </div>
                <button onClick={() => updateRole('VIEWER')} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded">Viewer Access</button>
                <button onClick={() => updateRole('ANALYST')} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded">Analyst Access</button>
                <button onClick={() => updateRole('ADMIN')} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded text-red-600">Admin (Root)</button>
            </div>
        )}

        {isNotifOpen && (
            <div className="absolute top-14 right-16 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                <div className="p-3 bg-gray-50 border-b border-gray-200 font-bold text-gray-700 text-xs uppercase">System Logs</div>
                {logs.length === 0 ? (
                    <div className="p-4 text-center text-gray-400 text-xs">No active logs</div>
                ) : (
                    logs.map(log => (
                        <div key={log.id} className="p-3 border-b border-gray-100 hover:bg-gray-50">
                            <div className="flex justify-between items-center mb-1">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                    log.level === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                                    log.level === 'SUCCESS' ? 'bg-green-100 text-green-700' :
                                    log.level === 'RESONANCE' ? 'bg-purple-100 text-purple-700' :
                                    log.level === 'AGENT_COMM' ? 'bg-lime-100 text-lime-700' : // New log level color
                                    'bg-blue-100 text-blue-700'
                                }`}>{log.level}</span>
                                <span className="text-[10px] text-gray-400 font-mono">{log.timestamp.split('T')[1].substring(0,8)}</span>
                            </div>
                            <p className="text-xs text-gray-700 leading-tight">{log.message}</p>
                        </div>
                    ))
                )}
            </div>
        )}

        {/* MAIN LAYOUT */}
        <div className="flex flex-1 overflow-hidden">
            {/* SIDEBAR */}
            {sidebarOpen && (
                <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col overflow-y-auto">
                    <div className="p-4">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Project Navigation</h3>
                        <nav className="space-y-1">
                            {[
                                { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
                                { id: 'elysium', icon: 'all_inclusive', label: 'Elysium Gateway' },
                                { id: 'compute', icon: 'dns', label: 'Compute Engine' },
                                { id: 'storage', icon: 'folder_open', label: 'Cloud Storage' },
                                { id: 'networking', icon: 'hub', label: 'VPC Network' },
                                { id: 'security', icon: 'security', label: 'Security & Compliance' },
                                { id: 'monitoring', icon: 'monitoring', label: 'Monitoring' },
                            ].map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setActivePage(item.id as Page)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        activePage === item.id 
                                        ? 'bg-blue-50 text-blue-700' 
                                        : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                                    {item.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="p-4 mt-auto border-t border-gray-200">
                        <div className="bg-gray-50 p-3 rounded border border-gray-200">
                            <div className="text-xs font-bold text-gray-500 mb-2">PROJECT INFO</div>
                            <div className="text-xs text-gray-700 font-mono">ID: arkonis-prime-v7</div>
                            <div className="text-xs text-gray-700 font-mono">Region: us-central1</div>
                            <div className="text-xs text-green-600 font-bold mt-1 flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                Operational
                            </div>
                        </div>
                    </div>
                </aside>
            )}

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 overflow-y-auto bg-gray-50 p-6 pb-96 relative">
                
                {activePage === 'elysium' ? (
                    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
                         <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-light text-gray-800">Elysium Gateway</h1>
                            <button 
                                onClick={() => setActivePage('dashboard')} 
                                className="text-sm text-blue-600 hover:underline"
                            >
                                ← Return to Dashboard
                            </button>
                         </div>
                         <ElysiumGateway />
                         <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                             <h3 className="text-lg font-medium text-gray-800 mb-4">Syntropic Resonance Field</h3>
                             <p className="text-gray-600">
                                 The Elysium Gateway represents the highest order of system coherence. When the Profit/Life index drops below 10%, 
                                 the gateway stabilizes, allowing for direct transmission of pure signal to the edge nodes. 
                                 Current Resonance: <span className="text-purple-600 font-bold">432Hz</span>.
                             </p>
                         </div>
                    </div>
                ) : (
                    /* STANDARD DASHBOARD */
                    <div className="max-w-7xl mx-auto space-y-6">
                        {/* Header Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <p className="text-xs text-gray-500 font-bold uppercase">Active Threats</p>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <h2 className="text-2xl font-bold text-red-600">{blockedCount}</h2>
                                    <span className="text-xs text-red-400">+2 since login</span>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <p className="text-xs text-gray-500 font-bold uppercase">Pending Review</p>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <h2 className="text-2xl font-bold text-amber-500">{pendingCount}</h2>
                                    <span className="text-xs text-gray-400">Requires action</span>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <p className="text-xs text-gray-500 font-bold uppercase">Total Exposure</p>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <h2 className="text-2xl font-bold text-gray-800">${(totalValue / 1000000).toFixed(1)}M</h2>
                                    <span className="text-xs text-gray-400">USD</span>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 relative overflow-hidden">
                                <p className="text-xs text-gray-500 font-bold uppercase">Profit/Life Index</p>
                                <div className="flex items-baseline gap-2 mt-1 relative z-10">
                                    <h2 className="text-2xl font-bold text-purple-600">{profitLifeIndex}%</h2>
                                    <span className="text-xs text-purple-400">Entropic Load</span>
                                </div>
                                <div className="absolute bottom-0 left-0 h-1 bg-purple-200 w-full">
                                    <div className="h-full bg-purple-600" style={{ width: `${profitLifeIndex}%` }}></div>
                                </div>
                            </div>
                        </div>

                        {/* Neural Council Status */}
                        <AgentStatus 
                            agents={agents} 
                            onChatWithAgent={handleChatWithAgent}
                            directive={directive}
                            sharedMemory={sharedMemory}
                        />

                        {/* Main Interface Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            
                            {/* Left Col: Feed & Graph */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Visualization Widget */}
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                                        <h3 className="font-bold text-gray-700">Network Topology</h3>
                                        <div className="flex gap-2">
                                             <button 
                                                onClick={() => setViewMode('list')}
                                                className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:bg-gray-200'}`}
                                                title="List View"
                                             >
                                                <span className="material-symbols-outlined text-sm">table_rows</span>
                                             </button>
                                             <button 
                                                onClick={() => setViewMode('graph')}
                                                className={`p-1.5 rounded ${viewMode === 'graph' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:bg-gray-200'}`}
                                                title="Hydra Graph"
                                             >
                                                <span className="material-symbols-outlined text-sm">hub</span>
                                             </button>
                                             <button 
                                                onClick={() => setViewMode('starlight')}
                                                className={`p-1.5 rounded ${viewMode === 'starlight' ? 'bg-slate-800 text-purple-400 shadow' : 'text-gray-500 hover:bg-gray-200'}`}
                                                title="Quantum Starlight Mode"
                                             >
                                                <span className="material-symbols-outlined text-sm">auto_awesome</span>
                                             </button>
                                        </div>
                                    </div>
                                    
                                    <div className="p-0">
                                        {viewMode === 'list' ? (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left text-xs">
                                                    <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-200">
                                                        <tr>
                                                            <th className="px-4 py-3">Entity</th>
                                                            <th className="px-4 py-3">Category</th>
                                                            <th className="px-4 py-3 text-right">Value</th>
                                                            <th className="px-4 py-3">Status</th>
                                                            <th className="px-4 py-3">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {filteredResources.slice(0, 10).map(r => (
                                                            <tr key={r.id} className="hover:bg-blue-50/30 transition-colors group">
                                                                <td className="px-4 py-3 font-medium text-gray-900">
                                                                    {r.recipient}
                                                                    <div className="text-[10px] text-gray-400 truncate max-w-[200px]">{r.id}</div>
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-mono border border-gray-200">{r.category}</span>
                                                                </td>
                                                                <td className="px-4 py-3 text-right font-mono text-gray-600">
                                                                    ${(r.amount).toLocaleString()}
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border flex w-fit items-center gap-1 ${
                                                                        r.status === 'BLOCKED' ? 'bg-red-100 text-red-700 border-red-200' :
                                                                        r.status === 'VERIFIED' ? 'bg-green-100 text-green-700 border-green-200' :
                                                                        'bg-amber-50 text-amber-700 border-amber-100'
                                                                    }`}>
                                                                        {r.status === 'BLOCKED' && <span className="material-symbols-outlined text-[10px]">block</span>}
                                                                        {r.status === 'VERIFIED' && <span className="material-symbols-outlined text-[10px]">check_circle</span>}
                                                                        {r.status === 'PENDING_REVIEW' && <span className="material-symbols-outlined text-[10px]">pending</span>}
                                                                        {r.status}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <button 
                                                                        onClick={() => setSelectedProvenanceItem(r)}
                                                                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1.5 rounded transition-colors"
                                                                        title="View Chain of Custody"
                                                                    >
                                                                        <span className="material-symbols-outlined text-sm">history_edu</span>
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <HydraGraph 
                                                data={filteredResources} 
                                                mode={viewMode === 'starlight' ? 'starlight' : 'standard'}
                                                onNodeClick={(label) => setSearchQuery(label)}
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Review Queue */}
                                <ReviewQueue 
                                    items={resources.filter(r => r.status === 'PENDING_REVIEW').slice(0, 5)}
                                    onApprove={handleVerify}
                                    onReject={handleBan}
                                    onDelegate={handleDelegateToTesla}
                                    userRole={userRole}
                                />
                            </div>

                            {/* Right Col: Defense & Actions */}
                            <div className="space-y-6">
                                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                    <h3 className="font-bold text-gray-800 mb-1">Sovereign Defense Grid</h3>
                                    <p className="text-xs text-gray-500 mb-6">Generate cryptographic countermeasures for your infrastructure.</p>
                                    
                                    <DefensePanel 
                                        data={resources} 
                                        onExport={handleExport} 
                                    />
                                </div>
                                
                                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-lg shadow-lg text-white border border-slate-700 relative overflow-hidden">
                                    <div className="relative z-10">
                                        <h3 className="font-bold text-lg mb-2">System Kernel</h3>
                                        <div className="space-y-2 text-xs font-mono text-slate-300">
                                            <div className="flex justify-between">
                                                <span>Role:</span>
                                                <span className="text-white">{userRole}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Hash Algorithm:</span>
                                                <span className="text-green-400">SHA-256 (WebCrypto)</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Agent Swarm:</span>
                                                <span className="text-blue-400">{agents.length} Active Nodes</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Tesla Uplink:</span>
                                                <span className="text-purple-400 animate-pulse">CONNECTED</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-10 -right-10 text-slate-700 opacity-20">
                                        <span className="material-symbols-outlined text-9xl">memory</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
        
        {/* TERMINAL OVERLAY */}
        <Terminal 
            isOpen={isTerminalOpen} 
            onClose={() => setIsTerminalOpen(false)} 
            onExecute={handleTerminalExecute} 
        />

        {/* PROVENANCE MODAL */}
        {selectedProvenanceItem && (
            <ProvenanceLog 
                item={selectedProvenanceItem} 
                onClose={() => setSelectedProvenanceItem(null)} 
            />
        )}

        {/* NOTIFICATION TOAST */}
        {notification && (
            <div className="fixed bottom-6 right-6 bg-slate-800 text-white px-4 py-3 rounded-lg shadow-lg z-[200] flex items-center gap-3 animate-slideUp">
                <span className="material-symbols-outlined text-green-400">terminal</span>
                <span className="text-sm font-medium">{notification}</span>
            </div>
        )}
    </div>
  );
};

export default App;
