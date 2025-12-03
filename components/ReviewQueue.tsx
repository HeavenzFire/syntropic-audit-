
import React from 'react';
import { ContractData } from '../types';

interface ReviewQueueProps {
  items: ContractData[];
  onApprove: (item: ContractData) => void;
  onReject: (item: ContractData) => void;
  onDelegate?: () => void;
  userRole: string;
}

const ReviewQueue: React.FC<ReviewQueueProps> = ({ items, onApprove, onReject, onDelegate, userRole }) => {
  if (items.length === 0) {
    return (
      <div className="p-8 text-center border border-gray-200 rounded-lg bg-gray-50">
        <span className="material-symbols-outlined text-gray-400 text-4xl mb-2">check_circle</span>
        <h3 className="text-gray-600 font-medium">Queue Empty</h3>
        <p className="text-gray-400 text-sm">All intercepted intelligence has been processed.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
         <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Pending Human Verification ({items.length})</h3>
         {userRole === 'VIEWER' && <span className="text-xs text-red-500">Read-only Mode</span>}
      </div>
      
      {/* Architect Delegate Button */}
      {onDelegate && userRole !== 'VIEWER' && (
         <button 
            onClick={onDelegate}
            className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 py-2 rounded text-xs font-bold flex items-center justify-center gap-2 transition-colors mb-2"
         >
            <span className="material-symbols-outlined text-sm">smart_toy</span>
            DELEGATE QUEUE TO ARCHITECT (TESLA)
         </button>
      )}

      {items.map(item => (
        <div key={item.id} className="bg-white border border-l-4 border-l-amber-500 border-gray-200 p-4 rounded shadow-sm flex flex-col gap-3 animate-fadeIn">
          <div className="flex justify-between items-start">
            <div>
                <h4 className="font-bold text-gray-900">{item.recipient}</h4>
                <p className="text-xs text-amber-600 font-mono mt-0.5">{item.category} // ${(item.amount / 1000000).toFixed(2)}M</p>
            </div>
            <div className="text-right">
                <div className="text-xs text-gray-400 font-mono">Confidence</div>
                <div className={`text-sm font-bold ${item.confidenceScore > 0.7 ? 'text-green-600' : 'text-gray-600'}`}>
                    {(item.confidenceScore * 100).toFixed(0)}%
                </div>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded border border-gray-100 font-mono text-xs">
            {item.description}
          </p>

          {userRole !== 'VIEWER' && (
            <div className="flex gap-3 mt-1">
                <button 
                    onClick={() => onApprove(item)}
                    className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 py-1.5 rounded text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                >
                    <span className="material-symbols-outlined text-sm">verified</span>
                    Verify & Monitor
                </button>
                <button 
                    onClick={() => onReject(item)}
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 py-1.5 rounded text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                >
                    <span className="material-symbols-outlined text-sm">block</span>
                    Block / Ban
                </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ReviewQueue;
