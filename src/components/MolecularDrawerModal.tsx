import React, { useState } from 'react';
import { Jsme } from '@loschmidt/jsme-react';
import { X, Check } from 'lucide-react';

interface MolecularDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (smiles: string) => void;
}

export function MolecularDrawerModal({ isOpen, onClose, onInsert }: MolecularDrawerModalProps) {
  const [smiles, setSmiles] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-8">
      <div className="bg-slate-panels border border-slate-borderDark rounded-xl shadow-2xl flex flex-col w-full max-w-3xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-borderDark bg-slate-panels">
          <h2 className="text-xl font-bold text-slate-light tracking-wide">Draw Molecule</h2>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 bg-white flex justify-center border-y border-slate-borderDark">
          {/* JSME must be in a non-strict environment or we just let it render. We wrap in a block. */}
          <div className="w-full h-[400px]">
            <Jsme
              height="400px"
              width="100%"
              options="oldlook,star"
              onChange={(newSmiles: string) => setSmiles(newSmiles)}
            />
          </div>
        </div>
        
        <div className="p-4 flex justify-between items-center bg-slate-panels">
          <div className="font-mono text-xs md:text-sm text-slate-400 truncate mr-4 max-w-[60%]">
            <span className="text-slate-500 font-semibold mr-2">SMILES:</span>
            {smiles ? smiles : 'Draw a structure to generate SMILES...'}
          </div>
          <button
            onClick={() => onInsert(smiles)}
            disabled={!smiles}
            className={`flex items-center gap-2 px-6 py-2 rounded font-bold transition-colors ${
              smiles 
                ? 'bg-cyan-accent text-obsidian hover:brightness-110' 
                : 'bg-slate-600 text-slate-400 cursor-not-allowed opacity-50'
            }`}
          >
            <Check size={18} />
            Insert Block
          </button>
        </div>
      </div>
    </div>
  );
}
