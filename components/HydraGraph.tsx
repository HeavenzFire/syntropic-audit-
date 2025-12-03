
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { EntityNode, EntityLink, ContractData } from '../types';

interface HydraGraphProps {
  data: ContractData[];
  onNodeClick?: (label: string) => void;
  mode?: 'standard' | 'starlight';
}

const HydraGraph: React.FC<HydraGraphProps> = ({ data, onNodeClick, mode = 'standard' }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || data.length === 0) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Prepare Data
    const nodes: EntityNode[] = [];
    const links: EntityLink[] = [];
    const nodeSet = new Set<string>();
    const nodeMap = new Map<string, EntityNode>();

    // Color Scales
    const intentColor = mode === 'starlight' ? "#fcd34d" : "#f59e0b"; // Gold in starlight
    const entityColor = mode === 'starlight' ? "#38bdf8" : "#ef4444"; // Cyan in starlight, Red in standard
    const linkColor = mode === 'starlight' ? "#94a3b8" : "#64748b";   

    data.forEach(d => {
      if (!nodeSet.has(d.category)) {
        const n: EntityNode = { id: d.category, group: 'intent', value: 20, label: d.category };
        nodes.push(n);
        nodeSet.add(d.category);
        nodeMap.set(d.category, n);
      }
      if (!nodeSet.has(d.recipient)) {
        const n: EntityNode = { id: d.recipient, group: 'entity', value: d.amount, label: d.recipient };
        nodes.push(n);
        nodeSet.add(d.recipient);
        nodeMap.set(d.recipient, n);
      }
      links.push({ source: d.category, target: d.recipient, value: d.amount });
    });

    // 2. Cleanup
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])
      .attr("width", width)
      .attr("height", height)
      .style("background-color", mode === 'starlight' ? "#020617" : "#0f172a"); // Darker in starlight

    // 3. Force Simulation
    const simulation = d3.forceSimulation(nodes as d3.SimulationNodeDatum[])
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(mode === 'starlight' ? 120 : 100))
      .force("charge", d3.forceManyBody().strength(mode === 'starlight' ? -200 : -300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius((d: any) => (d.group === 'intent' ? 40 : 20)).iterations(2));

    // 4. Interactive Layer
    const g = svg.append("g");

    const zoom = d3.zoom()
        .scaleExtent([0.1, 4])
        .on("zoom", (event) => {
            g.attr("transform", event.transform);
        });

    svg.call(zoom as any);

    // 5. Draw Elements
    
    // Links
    const link = g.append("g")
      .attr("stroke", linkColor)
      .attr("stroke-opacity", mode === 'starlight' ? 0.2 : 0.3)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", (d) => Math.min(Math.log10(d.value || 1000) / 2, 3))
      .attr("stroke-dasharray", mode === 'starlight' ? "4,4" : "none"); // Dashed in starlight

    // Node Groups
    const nodeGroup = g.append("g")
      .selectAll(".node")
      .data(nodes)
      .join("g")
      .attr("class", "node")
      .call(drag(simulation) as any)
      .on("click", (e, d) => {
        e.stopPropagation();
        if (onNodeClick) onNodeClick(d.label);
      });

    // Node Circles (Stars in Starlight mode)
    nodeGroup.append("circle")
      .attr("r", (d) => {
          if (mode === 'starlight') return d.group === 'intent' ? 6 : Math.max(2, Math.log10(d.value) * 0.5);
          return d.group === 'intent' ? 12 : Math.max(4, Math.log10(d.value) * 1);
      })
      .attr("fill", (d) => d.group === 'intent' ? intentColor : entityColor)
      .attr("stroke", mode === 'starlight' ? "none" : "#fff")
      .attr("stroke-width", 1.5)
      .attr("class", "transition-all duration-300 cursor-pointer");
      
    if (mode === 'starlight') {
        // Glow effect for stars
        nodeGroup.append("circle")
            .attr("r", (d) => d.group === 'intent' ? 15 : 8)
            .attr("fill", (d) => d.group === 'intent' ? intentColor : entityColor)
            .attr("opacity", 0.2)
            .attr("class", "blur-sm");
    }

    // Pulsing Effect for Intents
    if (mode === 'standard') {
        nodeGroup.filter(d => d.group === 'intent')
        .append("circle")
        .attr("r", 20)
        .attr("fill", "none")
        .attr("stroke", intentColor)
        .attr("stroke-opacity", 0.5)
        .attr("stroke-width", 1)
        .append("animate")
        .attr("attributeName", "r")
        .attr("from", 12)
        .attr("to", 24)
        .attr("dur", "2s")
        .attr("repeatCount", "indefinite");
        
        nodeGroup.filter(d => d.group === 'intent')
        .select("animate")
        .clone(true)
        .attr("attributeName", "opacity")
        .attr("from", 0.6)
        .attr("to", 0);
    }

    // Labels
    if (mode === 'standard') {
        // Background for standard labels
        nodeGroup.append("rect")
            .attr("rx", 4)
            .attr("fill", "#000")
            .attr("fill-opacity", 0.7)
            .attr("height", 16);
    }

    const text = nodeGroup.append("text")
      .text(d => d.label.length > 20 ? d.label.substring(0, 18) + '..' : d.label)
      .attr("dx", mode === 'starlight' ? 10 : 16)
      .attr("dy", 4)
      .attr("font-size", d => d.group === 'intent' ? "10px" : "8px")
      .attr("fill", mode === 'starlight' ? "#94a3b8" : "#e2e8f0")
      .style("font-family", "monospace")
      .style("font-weight", d => d.group === 'intent' ? "bold" : "normal")
      .style("pointer-events", "none")
      .style("text-shadow", "0 1px 2px rgba(0,0,0,0.8)");

    if (mode === 'standard') {
        nodeGroup.each(function(d) {
            const group = d3.select(this);
            const textNode = group.select("text").node() as SVGTextElement;
            if (textNode) {
                const bbox = textNode.getBBox();
                group.select("rect")
                    .attr("x", bbox.x - 4)
                    .attr("y", bbox.y - 2)
                    .attr("width", bbox.width + 8)
                    .attr("height", bbox.height + 4);
            }
        });
    }

    // 6. Ticker
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      nodeGroup.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    // 7. Drag Logic
    function drag(simulation: d3.Simulation<d3.SimulationNodeDatum, undefined>) {
      function dragstarted(event: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }

      function dragged(event: any) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      function dragended(event: any) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }

      return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }

    return () => {
      simulation.stop();
    };
  }, [data, mode]);

  return (
    <div ref={containerRef} className="w-full h-[500px] bg-slate-900 border border-slate-700 relative overflow-hidden rounded-lg shadow-inner group">
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <h3 className="text-blue-400 font-mono text-xs tracking-widest uppercase flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)] ${mode === 'starlight' ? 'bg-purple-400' : 'bg-green-500'}`}></span>
          {mode === 'starlight' ? 'QUANTUM STARLIGHT // ENCRYPTED' : 'HYDRA // LIVE TOPOLOGY'}
        </h3>
        <p className="text-slate-500 text-[10px] font-mono mt-1 opacity-80">Nodes: {data.length}</p>
      </div>
      <div className="absolute bottom-4 right-4 z-10 pointer-events-none text-right opacity-60 group-hover:opacity-100 transition-opacity">
         <div className="flex items-center gap-2 justify-end mb-1">
            <span className={`w-2 h-2 rounded-full ${mode === 'starlight' ? 'bg-yellow-400' : 'bg-amber-500'}`}></span>
            <span className="text-[10px] text-slate-300 font-mono uppercase">Intent Vector</span>
         </div>
         <div className="flex items-center gap-2 justify-end">
            <span className={`w-2 h-2 rounded-full ${mode === 'starlight' ? 'bg-cyan-400' : 'bg-red-500'}`}></span>
            <span className="text-[10px] text-slate-300 font-mono uppercase">Entity</span>
         </div>
      </div>
      <svg ref={svgRef} className="w-full h-full cursor-move"></svg>
    </div>
  );
};

export default HydraGraph;
