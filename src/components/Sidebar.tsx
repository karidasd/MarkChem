import React, { useState } from 'react';
import { FileText, Save, FolderOpen, Moon, Sun, Printer, Download, FolderGit2, FileType, Bot } from 'lucide-react';
import { open } from '@tauri-apps/plugin-dialog';
import { readTextFile, readDir } from '@tauri-apps/plugin-fs';
import type { DirEntry } from '@tauri-apps/plugin-fs';

interface SidebarProps {
  onFileOpen: (content: string, path: string) => void;
  onFileSave: () => void;
  onExportMd: () => void;
  onExportDocx: () => void;
  onToggleAI: () => void;
  currentFile: string | null;
  isDark: boolean;
  toggleTheme: () => void;
}

export function Sidebar({ onFileOpen, onFileSave, onExportMd, onExportDocx, onToggleAI, currentFile, isDark, toggleTheme }: SidebarProps) {
  const [workspace, setWorkspace] = useState<string | null>(null);
  const [workspaceFiles, setWorkspaceFiles] = useState<DirEntry[]>([]);

  const handleOpen = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }]
      });
      if (selected && typeof selected === 'string') {
        const contents = await readTextFile(selected);
        onFileOpen(contents, selected);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenWorkspace = async () => {
    try {
      const selected = await open({ directory: true });
      if (selected && typeof selected === 'string') {
        setWorkspace(selected);
        const entries = await readDir(selected);
        const mdFiles = entries.filter(e => e.name?.endsWith('.md') || e.name?.endsWith('.markdown'));
        setWorkspaceFiles(mdFiles);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openWorkspaceFile = async (fileName: string) => {
    if (!workspace) return;
    const path = `${workspace}/${fileName}`;
    try {
      const contents = await readTextFile(path);
      onFileOpen(contents, path);
    } catch (e) {
      console.error("Failed to read workspace file", e);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-64 h-full bg-slate-panels border-r border-slate-borderDark flex flex-col p-4 text-sm text-slate-textDark shrink-0 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-cyan-accent font-bold text-lg tracking-wide">MarkChem</h1>
        <button 
          onClick={toggleTheme} 
          className="p-1 hover:bg-obsidian rounded transition-colors"
          title="Toggle Theme"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <div className="uppercase tracking-wider font-semibold mb-4 text-xs">Explorer</div>
      
      <button 
        onClick={handleOpenWorkspace}
        className="flex items-center gap-2 w-full p-2 hover:bg-obsidian hover:text-slate-light rounded transition-colors"
      >
        <FolderGit2 size={16} className="text-cyan-accent" />
        <span>Open Folder...</span>
      </button>

      <button 
        onClick={handleOpen}
        className="flex items-center gap-2 w-full p-2 hover:bg-obsidian hover:text-slate-light rounded transition-colors mt-1"
      >
        <FolderOpen size={16} className="text-cyan-accent" />
        <span>Open File...</span>
      </button>

      <button 
        onClick={onFileSave}
        className="flex items-center gap-2 w-full p-2 hover:bg-obsidian hover:text-slate-light rounded transition-colors mt-1"
      >
        <Save size={16} className="text-cyan-accent" />
        <span>Save Active File</span>
      </button>

      <div className="uppercase tracking-wider font-semibold mb-4 mt-8 text-xs text-cyan-accent">Assistant</div>

      <button 
        onClick={onToggleAI}
        className="flex items-center gap-2 w-full p-2 bg-cyan-accent/10 hover:bg-cyan-accent/20 text-cyan-accent font-bold rounded transition-colors shadow-sm border border-cyan-accent/20"
      >
        <Bot size={16} />
        <span>Chem AI Chat</span>
      </button>

      {/* WORKSPACE TREE */}
      {workspace && (
        <div className="mt-6 flex flex-col gap-1">
          <div className="uppercase tracking-wider font-semibold text-xs mb-2 truncate" title={workspace}>
            {workspace.split(/[\\/]/).pop()}
          </div>
          {workspaceFiles.map(file => {
            const path = `${workspace}/${file.name}`;
            const isActive = currentFile === path;
            return (
              <div 
                key={file.name}
                onClick={() => openWorkspaceFile(file.name!)}
                className={`flex items-center gap-2 p-1.5 rounded cursor-pointer transition-colors text-xs ${
                  isActive ? 'bg-cyan-accent/20 text-cyan-accent' : 'hover:bg-obsidian text-slate-500 hover:text-slate-light'
                }`}
              >
                <FileText size={14} className={isActive ? "text-cyan-accent" : ""} />
                <span className="truncate">{file.name}</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="uppercase tracking-wider font-semibold mb-4 mt-8 text-xs">Export</div>

      <button 
        onClick={onExportMd}
        className="flex items-center gap-2 w-full p-2 hover:bg-obsidian hover:text-slate-light rounded transition-colors"
      >
        <Download size={16} className="text-cyan-accent" />
        <span>Export as .md</span>
      </button>

      <button 
        onClick={onExportDocx}
        className="flex items-center gap-2 w-full p-2 hover:bg-obsidian hover:text-slate-light rounded transition-colors mt-1"
      >
        <FileType size={16} className="text-cyan-accent" />
        <span>Export as Word (.docx)</span>
      </button>

      <button 
        onClick={handlePrint}
        className="flex items-center gap-2 w-full p-2 hover:bg-obsidian hover:text-slate-light rounded transition-colors mt-1"
      >
        <Printer size={16} className="text-cyan-accent" />
        <span>Export to PDF</span>
      </button>
    </div>
  );
}
