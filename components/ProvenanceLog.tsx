
import React from 'react';
import { ContractData } from '../types';

interface ProvenanceLogProps {
  item: ContractData;
  onClose: () => void;
}

const ProvenanceLog: React.FC<ProvenanceLogProps> = ({ item, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="font-bold text-gray-900">Data Provenance Ledger</h3>
            <p className="text-xs text-gray-500 font-mono">Entity ID: {item.id}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
            <span className="material-symbols-outlined text-gray-500">close</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
            <div className="relative border-l-2 border-gray-200 ml-3 space-y-8">
                {item.provenance.map((record, idx) => (
                    <div key={idx} className="relative pl-8">
                        <div className="absolute -left-[9px] top-0 w-4 h-4 bg-google-blue rounded-full border-4 border-white shadow-sm"></div>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                {record.timestamp.split('T')[0]} {record.timestamp.split('T')[1].substring(0,8)}
                            </span>
                            <h4 className="text-sm font-bold text-gray-900">{record.action}</h4>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                <span className="material-symbols-outlined text-[14px]">person</span>
                                {record.actor}
                            </div>
                            
                            <div className="mt-2 bg-slate-900 rounded p-3 font-mono text-[10px] text-green-400 overflow-x-auto">
                                <div className="opacity-50 mb-1"># SHA-256 INTEGRITY HASH</div>
                                {record.hash}
                                {record.signature && (
                                    <>
                                        <div className="opacity-50 mt-2 mb-1"># DIGITAL SIGNATURE</div>
                                        <div className="text-blue-400">{record.signature}</div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        
        <div className="p-4 bg-gray-50 border-t border-gray-200 text-center text-xs text-gray-400">
            Immutable Ledger v1.0 // Cryptographically Verified
        </div>
      </div>
    </div>
  );
};

export default ProvenanceLog;
