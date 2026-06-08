import React from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { Minus, Square, X } from 'lucide-react';

export function Titlebar() {
  const minimize = () => getCurrentWindow().minimize();
  const toggleMaximize = () => getCurrentWindow().toggleMaximize();
  const close = () => getCurrentWindow().close();

  return (
    <div 
      data-tauri-drag-region 
      className="h-8 bg-slate-panels border-b border-slate-borderDark flex justify-between items-center shrink-0 select-none z-50 relative"
    >
      <div data-tauri-drag-region className="flex-1 flex items-center px-4 h-full">
        <span data-tauri-drag-region className="text-xs font-semibold text-slate-500 tracking-wider pointer-events-none">MarkChem</span>
      </div>
      <div className="flex h-full">
        <button 
          onClick={minimize}
          className="h-full px-3 text-slate-500 hover:bg-slate-300 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          <Minus size={16} />
        </button>
        <button 
          onClick={toggleMaximize}
          className="h-full px-3 text-slate-500 hover:bg-slate-300 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          <Square size={12} />
        </button>
        <button 
          onClick={close}
          className="h-full px-3 text-slate-500 hover:bg-red-500 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
