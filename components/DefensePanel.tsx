
import React from 'react';
import { ContractData, DefenseVector } from '../types';

interface DefensePanelProps {
  data: ContractData[];
  onExport: (type: DefenseVector) => void;
}

const DefensePanel: React.FC<DefensePanelProps> = ({ data, onExport }) => {
  return (
    <div className="space-y-8">
      
      {/* SUBSTRATE: NETWORK INFRASTRUCTURE */}
      <div>
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">router</span>
            Network Substrate // Gateway Level
        </h4>
        <div className="grid grid-cols-1 gap-4">
            {/* Pi-hole */}
            <button 
                onClick={() => onExport('pihole')}
                className="group relative bg-white p-4 rounded border border-gray-200 hover:border-amber-500 transition-all text-left shadow-sm hover:shadow-md flex items-center justify-between"
            >
                <div>
                    <span className="font-mono font-bold text-gray-900 block">Pi-hole Gravity</span>
                    <span className="text-xs text-gray-500">DNS Sinkhole Format</span>
                </div>
                <span className="material-symbols-outlined text-gray-300 group-hover:text-amber-500 transition-colors">download</span>
            </button>

            {/* DNSMasq */}
            <button 
                onClick={() => onExport('dnsmasq')}
                className="group relative bg-white p-4 rounded border border-gray-200 hover:border-amber-500 transition-all text-left shadow-sm hover:shadow-md flex items-center justify-between"
            >
                <div>
                    <span className="font-mono font-bold text-gray-900 block">OpenWRT / DD-WRT</span>
                    <span className="text-xs text-gray-500">DNSMasq Config</span>
                </div>
                <span className="material-symbols-outlined text-gray-300 group-hover:text-amber-500 transition-colors">download</span>
            </button>

            {/* Unbound */}
            <button 
                onClick={() => onExport('unbound')}
                className="group relative bg-white p-4 rounded border border-gray-200 hover:border-amber-500 transition-all text-left shadow-sm hover:shadow-md flex items-center justify-between"
            >
                <div>
                    <span className="font-mono font-bold text-gray-900 block">OPNsense / PfSense</span>
                    <span className="text-xs text-gray-500">Unbound DNS Overrides</span>
                </div>
                <span className="material-symbols-outlined text-gray-300 group-hover:text-amber-500 transition-colors">download</span>
            </button>
        </div>
      </div>

      {/* SUBSTRATE: ENDPOINT SECURITY */}
      <div>
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">laptop_mac</span>
            Endpoint Substrate // Device Level
        </h4>
        <div className="grid grid-cols-1 gap-4">
            {/* Universal Hosts */}
            <button 
                onClick={() => onExport('hosts')}
                className="group relative bg-white p-4 rounded border border-gray-200 hover:border-google-blue transition-all text-left shadow-sm hover:shadow-md flex items-center justify-between"
            >
                <div>
                    <span className="font-mono font-bold text-gray-900 block">Universal Hosts</span>
                    <span className="text-xs text-gray-500">Windows/Mac/Linux/Android</span>
                </div>
                <span className="material-symbols-outlined text-gray-300 group-hover:text-google-blue transition-colors">download</span>
            </button>

            {/* Little Snitch */}
            <button 
                onClick={() => onExport('littlesnitch')}
                className="group relative bg-white p-4 rounded border border-gray-200 hover:border-google-blue transition-all text-left shadow-sm hover:shadow-md flex items-center justify-between"
            >
                <div>
                    <span className="font-mono font-bold text-gray-900 block">Little Snitch</span>
                    <span className="text-xs text-gray-500">macOS Firewall Rules</span>
                </div>
                <span className="material-symbols-outlined text-gray-300 group-hover:text-google-blue transition-colors">download</span>
            </button>
        </div>
      </div>

      {/* SUBSTRATE: ANALYTICAL DATA */}
      <div>
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">data_object</span>
            Raw Intelligence // Data Layer
        </h4>
        <div className="grid grid-cols-2 gap-4">
             <button 
                onClick={() => onExport('json')}
                className="group relative bg-gray-50 p-4 rounded border border-gray-200 hover:border-gray-500 transition-all text-left shadow-sm hover:shadow-md flex flex-col items-center justify-center text-center"
            >
                <span className="material-symbols-outlined text-gray-400 group-hover:text-gray-700 transition-colors mb-2">api</span>
                <span className="font-mono font-bold text-gray-700 text-sm">JSON</span>
            </button>
             <button 
                onClick={() => onExport('csv')}
                className="group relative bg-gray-50 p-4 rounded border border-gray-200 hover:border-gray-500 transition-all text-left shadow-sm hover:shadow-md flex flex-col items-center justify-center text-center"
            >
                <span className="material-symbols-outlined text-gray-400 group-hover:text-gray-700 transition-colors mb-2">table_view</span>
                <span className="font-mono font-bold text-gray-700 text-sm">CSV</span>
            </button>
        </div>
      </div>

    </div>
  );
};

export default DefensePanel;
