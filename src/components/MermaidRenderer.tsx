import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidRendererProps {
  chart: string;
  isDark: boolean;
}

let mermaidIdCounter = 0;

export function MermaidRenderer({ chart, isDark }: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: isDark ? 'dark' : 'default',
      securityLevel: 'loose',
    });

    const renderChart = async () => {
      try {
        const id = `mermaid-svg-${mermaidIdCounter++}`;
        // mermaid.render returns { svg, bindFunctions }
        const { svg: generatedSvg } = await mermaid.render(id, chart);
        setSvg(generatedSvg);
        setError(null);
      } catch (err: any) {
        console.error("Mermaid parsing error:", err);
        setError(err.message || 'Syntax error in Mermaid diagram');
      }
    };
    
    if (chart) {
      renderChart();
    }
  }, [chart, isDark]);

  if (error) {
    return (
      <div className="text-red-500 font-mono p-4 border border-red-500 rounded bg-red-500/10 text-sm overflow-x-auto whitespace-pre">
        {error}
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="flex justify-center my-4 overflow-x-auto mermaid-diagram"
      dangerouslySetInnerHTML={{ __html: svg }} 
    />
  );
}
