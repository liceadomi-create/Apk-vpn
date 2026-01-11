import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { ConnectionStatus } from '../types';

interface ConnectionShieldProps {
  status: ConnectionStatus;
  color: string;
}

export const ConnectionShield: React.FC<ConnectionShieldProps> = ({ status, color }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 200;
    const height = 200;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Base Shield Group
    const g = svg.append("g");

    // Static Rings (Background)
    g.append("circle")
      .attr("cx", centerX)
      .attr("cy", centerY)
      .attr("r", 80)
      .attr("fill", "none")
      .attr("stroke", "#334155")
      .attr("stroke-width", 2);

    g.append("circle")
      .attr("cx", centerX)
      .attr("cy", centerY)
      .attr("r", 60)
      .attr("fill", "none")
      .attr("stroke", "#334155")
      .attr("stroke-width", 2)
      .style("opacity", 0.5);

    // Dynamic Elements based on status
    if (status === ConnectionStatus.CONNECTING || status === ConnectionStatus.CONNECTED) {
       // Pulse Ring
       g.append("circle")
       .attr("cx", centerX)
       .attr("cy", centerY)
       .attr("r", 60)
       .attr("fill", "none")
       .attr("stroke", color)
       .attr("stroke-width", 2)
       .style("opacity", 0)
       .transition()
       .duration(1500)
       .ease(d3.easeCubicOut)
       .attr("r", 95)
       .style("opacity", 0)
       .on("start", function repeat(this: SVGElement) { // Explicitly type 'this'
         d3.select(this)
           .attr("r", 60)
           .style("opacity", 0.8)
           .transition()
           .duration(1500)
           .ease(d3.easeCubicOut)
           .attr("r", 95)
           .style("opacity", 0)
           .on("end", repeat);
       });

       // Spinning Arc
       const arc = d3.arc()
        .innerRadius(75)
        .outerRadius(85)
        .startAngle(0)
        .endAngle(Math.PI / 2);

       g.append("path")
        .attr("d", arc as any)
        .attr("fill", color)
        .attr("transform", `translate(${centerX}, ${centerY})`)
        .append("animateTransform")
        .attr("attributeName", "transform")
        .attr("type", "rotate")
        .attr("from", `0 ${centerX} ${centerY}`) // Corrected rotation center
        .attr("to", `360 ${centerX} ${centerY}`) // Corrected rotation center
        .attr("dur", status === ConnectionStatus.CONNECTING ? "1s" : "3s")
        .attr("repeatCount", "indefinite");
    }

    // Center Icon (Lock)
    const iconGroup = g.append("g")
      .attr("transform", `translate(${centerX - 12}, ${centerY - 12})`);
    
    // Simple lock shape
    iconGroup.append("rect")
      .attr("x", 2)
      .attr("y", 9)
      .attr("width", 20)
      .attr("height", 14)
      .attr("rx", 2)
      .attr("fill", status === ConnectionStatus.CONNECTED ? color : "#64748b");
    
    iconGroup.append("path")
      .attr("d", "M7 9V6a5 5 0 0 1 10 0v3")
      .attr("fill", "none")
      .attr("stroke", status === ConnectionStatus.CONNECTED ? color : "#64748b")
      .attr("stroke-width", 3)
      .attr("stroke-linecap", "round");


  }, [status, color]);

  return <svg ref={svgRef} width={200} height={200} className="mx-auto" />;
};
