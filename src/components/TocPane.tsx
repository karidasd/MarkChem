import React, { useMemo } from 'react';
import { List } from 'lucide-react';

export interface TocItem {
  id: string;
  text: string;
  level: number;
  line: number;
}

interface TocPaneProps {
  content: string;
  onNavigate: (line: number) => void;
}

export function TocPane({ content, onNavigate }: TocPaneProps) {
  const tocItems = useMemo(() => {
    const lines = content.split('\n');
    const items: TocItem[] = [];
    let inCodeBlock = false;

    lines.forEach((lineStr, index) => {
      if (lineStr.trim().startsWith('```')) {
        inCodeBlock = !inCodeBlock;
      }
      if (!inCodeBlock) {
        const match = /^(\#{1,6})\s+(.*)/.exec(lineStr);
        if (match) {
          items.push({
            id: `toc-${index}`,
            level: match[1].length,
            text: match[2].trim(),
            line: index + 1
          });
        }
      }
    });
    return items;
  }, [content]);

  return (
    <div className="w-48 h-full bg-slate-panels border-l border-slate-borderDark flex flex-col shrink-0 overflow-y-auto p-4 hidden lg:flex">
      <div className="flex items-center gap-2 mb-6 text-slate-textDark">
        <List size={16} className="text-cyan-accent" />
        <h2 className="font-semibold tracking-wider text-xs uppercase">Outline</h2>
      </div>
      
      {tocItems.length === 0 ? (
        <div className="text-xs text-slate-500 italic">No headings found.</div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {tocItems.map(item => (
            <div 
              key={item.id}
              onClick={() => onNavigate(item.line)}
              className="text-xs text-slate-400 hover:text-cyan-accent cursor-pointer truncate transition-colors"
              style={{ paddingLeft: `${(item.level - 1) * 10}px` }}
              title={item.text}
            >
              {item.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
