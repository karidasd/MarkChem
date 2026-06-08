import { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { EditorPane } from "./components/EditorPane";
import { PreviewPane } from "./components/PreviewPane";
import { TocPane } from "./components/TocPane";
import { Titlebar } from "./components/Titlebar";
import { AIAssistantPane } from "./components/AIAssistantPane";
import { writeTextFile, writeFile } from "@tauri-apps/plugin-fs";
import { htmlToDocx } from "wp-html-to-docx";
import { X } from "lucide-react";
import { isTauri } from "@tauri-apps/api/core";

const DEFAULT_CONTENT = `# MarkChem

Welcome to MarkChem, a specialized Markdown editor for chemists and researchers.

## Chemical Equations

Use KaTeX with mhchem to render chemical equations:

$$
\\ce{CO2 + C <=> 2CO}
$$

Inline equations work too: $\\ce{H2O}$ is water.

## Molecular Structures

Use the \`chem\` language block to render 2D molecules from SMILES strings:

\`\`\`chem
CC(=O)OC1=CC=CC=C1C(=O)O
\`\`\`

Above is Aspirin.
`;

export type ViewMode = 'split' | 'editor' | 'preview';

export interface TabInfo {
  path: string;
  name: string;
}

function App() {
  const [openTabs, setOpenTabs] = useState<TabInfo[]>([]);
  const [activeTabPath, setActiveTabPath] = useState<string | null>(null);
  const [filesContent, setFilesContent] = useState<Record<string, string>>({});
  const [savedFilesContent, setSavedFilesContent] = useState<Record<string, string>>({});
  
  // The generic fallback content when no file is opened
  const [defaultContent, setDefaultContent] = useState(DEFAULT_CONTENT);
  const [defaultSavedContent, setDefaultSavedContent] = useState(DEFAULT_CONTENT);

  const [isDark, setIsDark] = useState(true);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [scrollToLine, setScrollToLine] = useState<number | null>(null);

  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      document.body.classList.add('light');
      document.body.classList.remove('dark');
    }
  }, [isDark]);

  const currentContent = activeTabPath ? (filesContent[activeTabPath] || '') : defaultContent;
  const [debouncedContent, setDebouncedContent] = useState(currentContent);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedContent(currentContent);
    }, 300);
    return () => clearTimeout(handler);
  }, [currentContent]);

  const handleContentChange = (newContent: string) => {
    if (activeTabPath) {
      setFilesContent(prev => ({ ...prev, [activeTabPath]: newContent }));
    } else {
      setDefaultContent(newContent);
    }
  };

  const handleNavigate = (line: number) => {
    setScrollToLine(line);
    setTimeout(() => setScrollToLine(null), 100);
  };

  const handleFileOpen = (fileContent: string, path: string) => {
    const name = path.split(/[\\/]/).pop() || 'Untitled';
    setOpenTabs(prev => {
      if (!prev.find(t => t.path === path)) {
        return [...prev, { path, name }];
      }
      return prev;
    });
    setFilesContent(prev => ({ ...prev, [path]: fileContent }));
    setSavedFilesContent(prev => ({ ...prev, [path]: fileContent }));
    setActiveTabPath(path);
  };

  const closeTab = (e: React.MouseEvent, path: string) => {
    e.stopPropagation();
    setOpenTabs(prev => {
      const newTabs = prev.filter(t => t.path !== path);
      if (activeTabPath === path) {
        if (newTabs.length > 0) {
          setActiveTabPath(newTabs[newTabs.length - 1].path);
        } else {
          setActiveTabPath(null);
        }
      }
      return newTabs;
    });
  };

  const handleFileSave = async () => {
    if (activeTabPath) {
      try {
        await writeTextFile(activeTabPath, filesContent[activeTabPath] || '');
        setSavedFilesContent(prev => ({ ...prev, [activeTabPath]: filesContent[activeTabPath] || '' }));
      } catch (err) {
        console.error("Failed to save file", err);
      }
    } else {
      handleExportMd();
    }
  };

  const handleExportMd = async () => {
    try {
      if (isTauri()) {
        const { save } = await import('@tauri-apps/plugin-dialog');
        const selected = await save({
          filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }],
          defaultPath: 'document.md'
        });
        if (selected) {
          await writeTextFile(selected, currentContent);
          if (!activeTabPath) {
            handleFileOpen(currentContent, selected);
          }
        }
      } else {
        // Browser Fallback
        const blob = new Blob([currentContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document.md';
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Failed to export MD", err);
    }
  };

  const handleExportDocx = async () => {
    try {
      const markdownBody = document.querySelector('.preview-pane-container');
      if (!markdownBody) {
        console.error("Preview pane not found");
        return;
      }
      
      const htmlString = markdownBody.innerHTML;
      const fullHtml = `
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8"></head>
          <body>${htmlString}</body>
        </html>
      `;
      
      const docxBuffer = await htmlToDocx(fullHtml, null, {
        title: 'MarkChem Document',
      });
      
      if (isTauri()) {
        const { save } = await import('@tauri-apps/plugin-dialog');
        const savePath = await save({
          filters: [{ name: 'Word Document', extensions: ['docx'] }],
          defaultPath: 'document.docx'
        });
        
        if (savePath) {
          let uint8Array;
          if (docxBuffer instanceof Blob) {
            uint8Array = new Uint8Array(await docxBuffer.arrayBuffer());
          } else {
            uint8Array = new Uint8Array(docxBuffer);
          }
          await writeFile(savePath, uint8Array);
        }
      } else {
        // Browser Fallback
        let blob: Blob;
        if (docxBuffer instanceof Blob) {
          blob = docxBuffer;
        } else {
          blob = new Blob([docxBuffer as ArrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document.docx';
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Failed to export DOCX:', err);
    }
  };

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden text-slate-dark dark:text-slate-light">
      <Titlebar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          onFileOpen={handleFileOpen}
          onFileSave={handleFileSave}
          onExportMd={handleExportMd}
          onExportDocx={handleExportDocx}
          onToggleAI={() => setIsAIOpen(!isAIOpen)}
          currentFile={activeTabPath}
          isDark={isDark}
          toggleTheme={toggleTheme}
        />
        <div className="flex flex-col flex-1 overflow-hidden relative">
        {/* TABS BAR */}
        {openTabs.length > 0 && (
          <div className="flex items-center overflow-x-auto bg-slate-200 dark:bg-slate-panels border-b border-slate-borderDark shrink-0">
            {openTabs.map(tab => {
              const isDirty = (filesContent[tab.path] || '') !== (savedFilesContent[tab.path] || '');
              return (
                <div 
                  key={tab.path}
                  onClick={() => setActiveTabPath(tab.path)}
                  className={`flex items-center gap-2 px-4 py-2 border-r border-slate-borderDark text-sm cursor-pointer transition-colors max-w-[200px] group ${
                    activeTabPath === tab.path 
                      ? 'bg-slate-light dark:bg-obsidian border-t-2 border-t-cyan-accent text-slate-dark dark:text-slate-light' 
                      : 'hover:bg-slate-300 dark:hover:bg-slate-borderDark text-slate-500'
                  }`}
                >
                  <span className="truncate" title={tab.path}>{isDirty ? '* ' : ''}{tab.name}</span>
                  <button 
                    onClick={(e) => closeTab(e, tab.path)}
                    className="p-0.5 rounded-sm hover:bg-slate-400 dark:hover:bg-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex flex-1 overflow-hidden">
          <div className={`flex-1 overflow-hidden flex flex-col ${viewMode === 'preview' ? 'hidden' : 'block'}`}>
            <EditorPane 
              value={currentContent} 
              onChange={handleContentChange} 
              isDark={isDark} 
              viewMode={viewMode}
              setViewMode={setViewMode}
              scrollToLine={scrollToLine}
            />
          </div>
          <div className={`flex-1 overflow-hidden flex flex-col ${viewMode === 'editor' ? 'hidden' : 'block'}`}>
            <PreviewPane 
              content={debouncedContent} 
              isDark={isDark} 
              viewMode={viewMode}
              setViewMode={setViewMode}
            />
          </div>
          <TocPane content={currentContent} onNavigate={handleNavigate} />
          
          {isAIOpen && (
            <AIAssistantPane 
              currentContext={currentContent} 
              onClose={() => setIsAIOpen(false)} 
            />
          )}
        </div>
      </div>
    </div>
    </div>
  );
}

export default App;
