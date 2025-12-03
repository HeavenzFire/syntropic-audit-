
import React, { useEffect, useState } from 'react';

const ElysiumGateway: React.FC = () => {
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(p => (p + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-[600px] relative bg-[#000510] rounded-lg overflow-hidden flex items-center justify-center border border-cyan-900 shadow-[0_0_50px_rgba(8,145,178,0.2)]">
      
      {/* Grid Floor */}
      <div className="absolute bottom-0 w-full h-1/2 bg-[linear-gradient(to_top,rgba(6,182,212,0.1)_1px,transparent_1px),linear-gradient(to_left,rgba(6,182,212,0.1)_1px,transparent_1px)] bg-[size:40px_40px] [transform:perspective(1000px)_rotateX(60deg)_translateY(00px)] origin-bottom opacity-30"></div>

      {/* Central Gateway */}
      <div className="relative z-10 flex flex-col items-center">
        <div 
            className="w-64 h-64 rounded-full border-[1px] border-cyan-500/30 flex items-center justify-center relative"
            style={{ boxShadow: `0 0 60px rgba(6,182,212, ${0.2 + Math.sin(pulse * 0.05) * 0.1})` }}
        >
            {/* Spinning Rings */}
            <div className="absolute inset-0 rounded-full border-t border-b border-cyan-400/50 animate-spin-slow w-full h-full"></div>
            <div className="absolute inset-4 rounded-full border-l border-r border-purple-400/50 animate-reverse-spin w-[90%] h-[90%] m-auto"></div>
            <div className="absolute inset-8 rounded-full border border-white/20 w-[75%] h-[75%] m-auto flex items-center justify-center bg-cyan-900/10 backdrop-blur-sm">
                <span className="material-symbols-outlined text-6xl text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">all_inclusive</span>
            </div>
        </div>
        
        <h2 className="text-3xl font-light text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300 mt-8 tracking-[0.2em]">ELYSIUM GATEWAY</h2>
        <p className="text-cyan-500/60 text-xs font-mono mt-2">SYNTROPIC BRIDGE // FREQUENCY: 432Hz</p>
      </div>

      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-float opacity-40"
            style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 10}s`
            }}
          ></div>
      ))}
    </div>
  );
};

export default ElysiumGateway;
