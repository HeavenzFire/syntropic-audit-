
import React, { useState, useEffect, useRef } from 'react';
import { ShellType } from '../types';

interface TerminalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecute: (cmd: string, shell: ShellType) => string;
}

const Terminal: React.FC<TerminalProps> = ({ isOpen, onClose, onExecute }) => {
  const [shell, setShell] = useState<ShellType>('BASH');
  const [history, setHistory] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Init welcome message
  useEffect(() => {
    if (history.length === 0) {
        setHistory([
            "ARKONIS OMNI-TERMINAL [v7.5.0-SOVEREIGN-CORE]",
            "Cryptographic Ledger: SYNCED (SHA-256)",
            "Sovereign Defense Grid: ONLINE",
            "---------------------------------------------------",
            "Neural Council: 11 AGENTS STANDING BY",
            "",
            "Active Shell: BASH (Root)",
            "Type 'help' for available commands or 'shell <type>' to switch.",
            ""
        ]);
    }
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (isOpen && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [history, isOpen]);

  // Focus keep-alive
  useEffect(() => {
      const keepFocus = () => {
          if (isOpen && inputRef.current) {
              inputRef.current.focus();
          }
      };
      window.addEventListener('click', keepFocus);
      return () => window.removeEventListener('click', keepFocus);
  }, [isOpen]);

  const getPrompt = () => {
      switch(shell) {
          case 'BASH': return <span className="text-green-500 mr-2 shrink-0">root@arkonis:~$</span>;
          case 'POWERSHELL': return <span className="text-blue-400 mr-2 shrink-0">PS C:\Arkonis&gt;</span>;
          case 'PYTHON': return <span className="text-yellow-400 mr-2 shrink-0">&gt;&gt;&gt;</span>;
          case 'CROSH': return <span className="text-pink-400 mr-2 shrink-0">crosh&gt;</span>;
          case 'UBUNTU': return <span className="text-orange-500 mr-2 shrink-0">admin@ubuntu:~$</span>;
          case 'TERMUX': return <span className="text-emerald-400 mr-2 shrink-0">~ $</span>;
          default: return <span className="text-gray-400 mr-2 shrink-0">$</span>;
      }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const cmd = input.trim();
      if (!cmd) return;

      // Add command to history with prompt look
      let promptText = "";
      switch(shell) {
          case 'BASH': promptText = 'root@arkonis:~$'; break;
          case 'POWERSHELL': promptText = 'PS C:\\Arkonis>'; break;
          case 'PYTHON': promptText = '>>>'; break;
          case 'CROSH': promptText = 'crosh>'; break;
          case 'UBUNTU': promptText = 'admin@ubuntu:~$'; break;
          case 'TERMUX': promptText = '~ $'; break;
      }
                         
      setHistory(prev => [...prev, `${promptText} ${cmd}`]);
      
      // Internal Shell Switching Logic
      if (cmd.toLowerCase().startsWith('shell ')) {
          const target = cmd.split(' ')[1].toUpperCase();
          if (['BASH', 'POWERSHELL', 'PYTHON', 'CROSH', 'UBUNTU', 'TERMUX'].includes(target)) {
              setShell(target as ShellType);
              
              // Simulate Boot Sequence for specific shells
              let bootMsg = "";
              if (target === 'POWERSHELL') bootMsg = "\nWindows PowerShell\nCopyright (C) Microsoft Corporation. All rights reserved.\n\nLoading Arkonis Sovereign Modules...\n[oooooooooooooooo] 100%\n\nPS C:\\Arkonis>";
              if (target === 'PYTHON') bootMsg = "\nPython 3.10.12 (main, Nov 20 2023, 15:14:05) [GCC 11.4.0] on linux\nType \"help\", \"copyright\", \"credits\" or \"license\" for more information.\n>>> import arkonis_core\n>>>";
              if (target === 'UBUNTU') bootMsg = "\nWelcome to Ubuntu 22.04.3 LTS (GNU/Linux 5.15.0-91-generic x86_64)\n\n * Documentation:  https://help.ubuntu.com\n * Management:     https://landscape.canonical.com\n * Support:        https://ubuntu.com/advantage\n\n0 packages can be updated.\n0 updates are security updates.\n\nadmin@ubuntu:~$";
              if (target === 'TERMUX') bootMsg = "\nWelcome to Termux!\n\nWiki:       https://wiki.termux.com\nCommunity:  https://termux.com/community\nIRC:        #termux on libera.chat\n\nWorking with packages:\n * Search:   pkg search <query>\n * Install:  pkg install <package>\n * Upgrade:  pkg upgrade\n\n~ $";
              if (target === 'CROSH') bootMsg = "\nWelcome to crosh, the Chrome OS developer shell.\n\nIf you got here by mistake, don't panic!  Just close this tab and carry on.\nType 'help' for a list of commands.\n\ncrosh>";
              if (target === 'BASH') bootMsg = "\nArkonis Prime Root Shell [Access Level: 0]\nConnection Secure.\nroot@arkonis:~$";

              setHistory(prev => [...prev, bootMsg]);
          } else {
              setHistory(prev => [...prev, `[ERROR] Unknown shell environment: ${target}`]);
          }
      } else if (cmd === 'clear' || cmd === 'cls') {
        setHistory([]);
      } else if (cmd === 'exit') {
        onClose();
      } else if (cmd === 'help') {
        setHistory(prev => [...prev, 
`
ARKONIS PRIME COMMAND REFERENCE
===============================

SHELL ENVIRONMENTS
------------------
shell [type]    Switch active environment.
                Supported: BASH, POWERSHELL, PYTHON, CROSH, UBUNTU, TERMUX

SOVEREIGN DEFENSE
-----------------
defense         Report status of Sovereign Defense Grid (Artifacts & Shielding).
export [type]   Generate defense artifact (hosts, pihole, dnsmasq, unbound, littlesnitch).
scan            Initiate manual threat interception via Hunter agents.
status          System integrity report.

NEURAL COUNCIL
--------------
models          Inspect telemetry of the 11 active neural agents.
magnify         [ARCHITECT] Trigger Tesla Resonance (369Hz).
elysium         [ARCHITECT] Enter the Syntropic Gateway.

NATIVE EMULATION
----------------
PowerShell:     Get-Process, Get-Service, dir
Ubuntu/Bash:    apt-get, systemctl, uname, top
Termux:         pkg, termux-info, termux-battery-status
Crosh:          battery_test, network_diag, ping
Python:         print(), import, os.getcwd()
`
        ]);
      } else {
        const response = onExecute(cmd, shell);
        // Simulate processing time for realism
        if (response) {
            setTimeout(() => {
                setHistory(prev => [...prev, response]);
            }, 50 + Math.random() * 150);
        }
      }
      setInput("");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-96 bg-[#0c0c0c] border-t border-slate-700 z-[100] shadow-2xl flex flex-col font-mono text-xs md:text-sm animate-slideUp">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#1a1a1a] border-b border-[#333]">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-slate-400 text-sm">terminal</span>
          <span className="text-gray-300 font-bold">Arkonis Omni-Terminal</span>
          <span className="px-2 py-0.5 rounded bg-slate-700 text-[10px] text-white border border-slate-600">{shell}</span>
          <span className="px-2 py-0.5 rounded bg-purple-900/50 text-[10px] text-purple-200 border border-purple-500/50 flex items-center gap-1">
             <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></span>
             TESLA ARCHITECT ACTIVE
          </span>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
              <span className="material-symbols-outlined text-sm">close</span>
           </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div className="flex-1 overflow-y-auto p-4 text-gray-300 space-y-1 font-mono custom-scrollbar" onClick={() => inputRef.current?.focus()}>
        {history.map((line, i) => (
          <div key={i} className="break-words whitespace-pre-wrap leading-relaxed">
             {/* Simple heuristic to colorize output vs command echoing */}
             {line.includes('root@') || line.includes('PS C:') || line.startsWith('>>>') || line.startsWith('crosh>') || line.includes('admin@ubuntu') || line.startsWith('~ $')
                ? <div className="text-white font-bold">{line}</div> 
                : <div className="text-gray-400">{line}</div>
             }
          </div>
        ))}
        <div ref={bottomRef}></div>
      </div>

      {/* Input Area */}
      <div className="p-3 bg-[#0f0f0f] flex items-center border-t border-[#222]">
        {getPrompt()}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-700 font-mono"
          autoFocus
          spellCheck={false}
          placeholder="Enter command..."
        />
      </div>
    </div>
  );
};

export default Terminal;
