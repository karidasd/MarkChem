import React, { useState } from 'react';
import { X, Search, Beaker, AlertCircle } from 'lucide-react';

interface PubChemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (data: any) => void;
}

export function PubChemModal({ isOpen, onClose, onInsert }: PubChemModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(query)}/property/IsomericSMILES,MolecularFormula,MolecularWeight,IUPACName/JSON`);
      
      if (!response.ok) {
        throw new Error('Compound not found or network error');
      }

      const data = await response.json();
      if (data.PropertyTable?.Properties?.length > 0) {
        setResults(data.PropertyTable.Properties[0]);
      } else {
        throw new Error('No data available for this compound');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInsert = () => {
    if (results) {
      onInsert({...results, name: query});
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-panels border border-slate-borderDark rounded-xl shadow-2xl w-[500px] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-borderDark bg-slate-800">
          <div className="flex items-center gap-2 text-cyan-accent">
            <Beaker size={20} />
            <h2 className="font-bold">PubChem Database Search</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-4 text-slate-textDark">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="text"
                placeholder="Search compound name (e.g. Aspirin, Caffeine)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-obsidian border border-slate-borderDark rounded-lg text-slate-light placeholder-slate-500 focus:outline-none focus:border-cyan-accent focus:ring-1 focus:ring-cyan-accent transition-all"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-cyan-accent text-obsidian font-semibold rounded-lg hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>

          {error && (
            <div className="flex items-center gap-2 p-3 text-red-400 bg-red-400/10 rounded border border-red-400/20">
              <AlertCircle size={16} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {results && (
            <div className="flex flex-col gap-3 p-4 bg-obsidian rounded-lg border border-slate-borderDark">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-white capitalize">{query}</h3>
                <span className="text-xs font-mono bg-slate-800 px-2 py-1 rounded text-cyan-accent border border-slate-700">CID: {results.CID}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div className="text-slate-500">Formula</div>
                <div className="font-mono text-slate-300">{results.MolecularFormula}</div>
                
                <div className="text-slate-500">Mass</div>
                <div className="text-slate-300">{results.MolecularWeight} g/mol</div>
                
                <div className="text-slate-500">IUPAC</div>
                <div className="text-slate-300 truncate" title={results.IUPACName}>{results.IUPACName}</div>
              </div>
              
              <div className="mt-2 text-xs text-slate-500 uppercase tracking-wider">SMILES</div>
              <div className="p-2 bg-slate-900 rounded font-mono text-xs text-slate-300 break-all border border-slate-800">
                {results.IsomericSMILES}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleInsert}
                  className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-500 transition-colors flex items-center gap-2 shadow-lg shadow-green-900/20"
                >
                  <Beaker size={16} />
                  Insert to Document
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
