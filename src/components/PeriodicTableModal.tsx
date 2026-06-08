import React, { useMemo } from 'react';
import { X } from 'lucide-react';
import { elementsData } from '../elements';

interface PeriodicTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectElement: (element: any) => void;
}

function getGridPosition(atomicNumber: number): { col: number, row: number } {
  if (atomicNumber === 1) return { col: 1, row: 1 };
  if (atomicNumber === 2) return { col: 18, row: 1 };
  if (atomicNumber >= 3 && atomicNumber <= 4) return { col: atomicNumber - 2, row: 2 };
  if (atomicNumber >= 5 && atomicNumber <= 10) return { col: atomicNumber + 8, row: 2 };
  if (atomicNumber >= 11 && atomicNumber <= 12) return { col: atomicNumber - 10, row: 3 };
  if (atomicNumber >= 13 && atomicNumber <= 18) return { col: atomicNumber + 0, row: 3 };
  if (atomicNumber >= 19 && atomicNumber <= 36) return { col: atomicNumber - 18, row: 4 };
  if (atomicNumber >= 37 && atomicNumber <= 54) return { col: atomicNumber - 36, row: 5 };
  
  if (atomicNumber >= 55 && atomicNumber <= 56) return { col: atomicNumber - 54, row: 6 };
  if (atomicNumber >= 57 && atomicNumber <= 71) return { col: atomicNumber - 57 + 4, row: 9 }; 
  if (atomicNumber >= 72 && atomicNumber <= 86) return { col: atomicNumber - 72 + 4, row: 6 };
  
  if (atomicNumber >= 87 && atomicNumber <= 88) return { col: atomicNumber - 86, row: 7 };
  if (atomicNumber >= 89 && atomicNumber <= 103) return { col: atomicNumber - 89 + 4, row: 10 };
  if (atomicNumber >= 104 && atomicNumber <= 118) return { col: atomicNumber - 104 + 4, row: 7 };
  
  return { col: 1, row: 1 };
}

function getCategoryColor(category: string): string {
  switch (category) {
    case 'nonmetal': return 'bg-green-500/20 border-green-500/50 hover:bg-green-500/40 text-green-300';
    case 'noble gas': return 'bg-purple-500/20 border-purple-500/50 hover:bg-purple-500/40 text-purple-300';
    case 'alkali metal': return 'bg-red-500/20 border-red-500/50 hover:bg-red-500/40 text-red-300';
    case 'alkaline earth metal': return 'bg-orange-500/20 border-orange-500/50 hover:bg-orange-500/40 text-orange-300';
    case 'metalloid': return 'bg-teal-500/20 border-teal-500/50 hover:bg-teal-500/40 text-teal-300';
    case 'halogen': return 'bg-yellow-500/20 border-yellow-500/50 hover:bg-yellow-500/40 text-yellow-300';
    case 'transition metal': return 'bg-blue-500/20 border-blue-500/50 hover:bg-blue-500/40 text-blue-300';
    case 'post-transition metal': return 'bg-cyan-500/20 border-cyan-500/50 hover:bg-cyan-500/40 text-cyan-300';
    case 'lanthanoid': return 'bg-pink-500/20 border-pink-500/50 hover:bg-pink-500/40 text-pink-300';
    case 'actinoid': return 'bg-rose-500/20 border-rose-500/50 hover:bg-rose-500/40 text-rose-300';
    default: return 'bg-slate-500/20 border-slate-500/50 hover:bg-slate-500/40 text-slate-300';
  }
}

export function PeriodicTableModal({ isOpen, onClose, onSelectElement }: PeriodicTableModalProps) {
  const elements = useMemo(() => {
    return Array.isArray(elementsData) ? elementsData : Object.values(elementsData);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-8">
      <div className="bg-slate-panels border border-slate-borderDark rounded-xl shadow-2xl flex flex-col max-w-7xl w-full max-h-full">
        <div className="flex items-center justify-between p-4 border-b border-slate-borderDark">
          <h2 className="text-xl font-bold text-slate-light tracking-wide">Periodic Table of Elements</h2>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4 md:p-8 relative">
          <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(18, minmax(40px, 1fr))', gridTemplateRows: 'repeat(10, minmax(50px, 1fr))' }}>
            {/* Empty space for row 8 */}
            <div style={{ gridColumn: '1 / -1', gridRow: 8, height: '20px' }} />
            
            {elements.map((el: any) => {
              const { col, row } = getGridPosition(el.atomicNumber);
              return (
                <div 
                  key={el.atomicNumber}
                  onClick={() => onSelectElement(el)}
                  className={`flex flex-col items-center justify-center p-1 border rounded cursor-pointer transition-all relative group ${getCategoryColor(el.groupBlock)}`}
                  style={{ gridColumn: col, gridRow: row }}
                  title={`${el.name} (${el.atomicMass})`}
                >
                  <span className="text-[10px] opacity-70 absolute top-1 left-1.5">{el.atomicNumber}</span>
                  <span className="font-bold text-lg leading-none mt-2">{el.symbol}</span>
                  <span className="text-[9px] truncate w-full text-center mt-1 opacity-80 px-1">{el.name}</span>
                  
                  {/* Tooltip on hover */}
                  <div className="absolute z-10 hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-obsidian border border-cyan-accent/30 rounded text-xs text-slate-300 shadow-xl pointer-events-none">
                    <div className="font-bold text-cyan-accent mb-1">{el.name} ({el.symbol})</div>
                    <div>Mass: {el.atomicMass}</div>
                    <div>Category: <span className="capitalize">{el.groupBlock}</span></div>
                    <div>Configuration: {el.electronicConfiguration}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
