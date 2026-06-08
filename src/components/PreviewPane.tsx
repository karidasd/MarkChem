import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import katex from 'katex';
import 'katex/dist/contrib/mhchem.mjs'; // Pure ESM version natively binds to the imported katex!
import SmilesDrawer from 'smiles-drawer';
import 'katex/dist/katex.min.css';
import type { ViewMode } from '../App';
import { Columns, Maximize, Eye } from 'lucide-react';
import { MermaidRenderer } from './MermaidRenderer';

interface SmilesCanvasProps {
  smiles: string;
  isDark: boolean;
}

// Local version of SmilesDrawerRenderer to match existing imports
const SmilesCanvas = ({ smiles, isDark }: SmilesCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && smiles) {
      const options = {
        width: 400,
        height: 300,
        theme: isDark ? 'dark' : 'light',
      };
      
      const Drawer = SmilesDrawer.Drawer || (SmilesDrawer as any).default?.Drawer || SmilesDrawer;
      const parse = SmilesDrawer.parse || (SmilesDrawer as any).default?.parse;

      try {
        if (parse) {
          parse(smiles, (tree: any) => {
            if (typeof Drawer === 'function') {
               const drawer = new Drawer(options);
               drawer.draw(tree, canvasRef.current, isDark ? 'dark' : 'light', false);
            }
          }, (err: any) => {
            console.error('Smiles parser error:', err);
          });
        } else {
           const drawer = new (SmilesDrawer as any)(options);
           drawer.draw(smiles, canvasRef.current, isDark ? 'dark' : 'light', false);
        }
      } catch (err) {
        console.error('Smiles exception:', err);
      }
    }
  }, [smiles, isDark]);

  return <canvas ref={canvasRef} />;
};

interface PreviewPaneProps {
  content: string;
  isDark: boolean;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

export function PreviewPane({ content, isDark, viewMode, setViewMode }: PreviewPaneProps) {
  
  // Custom renderer for code blocks (for smiles-drawer and standard code formatting)
  const renderComponents = {
    code({ node, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      const isBlock = node?.position?.start.line !== node?.position?.end.line || className;

      if (isBlock && match && match[1] === 'chem') {
        return (
          <div className="flex justify-center p-4 bg-white dark:bg-slate-panels rounded-md border border-slate-borderDark my-4 shadow-sm">
            <SmilesCanvas smiles={String(children).replace(/\n$/, '')} isDark={isDark} />
          </div>
        );
      }
      
      if (isBlock && match && match[1] === 'mermaid') {
        return <MermaidRenderer chart={String(children).replace(/\n$/, '')} isDark={isDark} />;
      }
      
      if (isBlock) {
        return (
          <pre className="bg-slate-200 dark:bg-slate-panels p-4 rounded-md overflow-x-auto my-4 text-sm font-mono border border-slate-borderDark">
            <code className={className} {...props}>
              {children}
            </code>
          </pre>
        );
      }

      return (
        <code className="bg-slate-200 dark:bg-slate-panels px-1 py-0.5 rounded font-mono text-sm" {...props}>
          {children}
        </code>
      );
    },
    h1: ({node, ...props}: any) => <h1 className="text-3xl font-bold mb-4 mt-6 text-cyan-accent" {...props} />,
    h2: ({node, ...props}: any) => <h2 className="text-2xl font-semibold mb-3 mt-5 border-b border-slate-borderDark pb-2" {...props} />,
    h3: ({node, ...props}: any) => <h3 className="text-xl font-semibold mb-3 mt-4 text-cyan-accent" {...props} />,
    p: ({node, ...props}: any) => <p className="mb-4 leading-relaxed" {...props} />,
    ul: ({node, ...props}: any) => <ul className="list-disc list-inside mb-4 space-y-1" {...props} />,
    ol: ({node, ...props}: any) => <ol className="list-decimal list-inside mb-4 space-y-1" {...props} />,
    blockquote: ({node, ...props}: any) => <blockquote className="border-l-4 border-cyan-accent pl-4 italic opacity-80 my-4" {...props} />,
    a: ({node, ...props}: any) => <a className="text-cyan-accent hover:underline" {...props} />,
  };

  // Safe Math & Chemistry Pre-processor
  // This function intercepts $$...$$ and $...$ blocks and uses the native katex compiler directly
  const renderChemAndMath = (text: string) => {
    if (!text) return '';

    // 1. Process Block Math: $$\ce{...}$$ or $$...$$
    let processed = text.replace(/\$\$\s*([\s\S]*?)\s*\$\$/g, (match, formula) => {
      try {
        const rendered = katex.renderToString(formula, { displayMode: true, trust: true, strict: false });
        return `<div class="katex-block-wrapper my-4 text-center overflow-x-auto">${rendered}</div>`;
      } catch (err: any) {
        return `<div class="text-red-500 font-mono my-4">${err.message}</div>`;
      }
    });

    // 2. Process Inline Math: $\ce{...}$ or $...$
    processed = processed.replace(/\$\s*([^\$\n]+?)\s*\$/g, (match, formula) => {
      try {
        const rendered = katex.renderToString(formula, { displayMode: false, trust: true, strict: false });
        return `<span>${rendered}</span>`;
      } catch (err: any) {
        return `<span class="text-red-500 font-mono">${err.message}</span>`;
      }
    });

    return processed;
  };

  const htmlContent = renderChemAndMath(content);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-light dark:bg-obsidian text-slate-dark dark:text-slate-light">
      <div className="flex items-center justify-between p-2 bg-slate-200 dark:bg-slate-panels border-b border-slate-borderDark shrink-0">
        <span className="text-xs font-semibold px-2 uppercase tracking-widest text-slate-500">Live Preview</span>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setViewMode('editor')}
            className={`p-1.5 rounded transition-colors ${viewMode === 'editor' ? 'bg-obsidian text-cyan-accent' : 'hover:bg-obsidian text-slate-dark dark:text-slate-light'}`}
            title="Editor Only"
          >
            <Maximize size={16} />
          </button>
          <button 
            onClick={() => setViewMode('split')}
            className={`p-1.5 rounded transition-colors ${viewMode === 'split' ? 'bg-obsidian text-cyan-accent' : 'hover:bg-obsidian text-slate-dark dark:text-slate-light'}`}
            title="Split View"
          >
            <Columns size={16} />
          </button>
          <button 
            onClick={() => setViewMode('preview')}
            className={`p-1.5 rounded transition-colors ${viewMode === 'preview' ? 'bg-obsidian text-cyan-accent' : 'hover:bg-obsidian text-slate-dark dark:text-slate-light'}`}
            title="Preview Only"
          >
            <Eye size={16} />
          </button>
        </div>
      </div>
      <div className="flex-1 h-full overflow-y-auto p-8 font-sans markdown-preview preview-pane-container prose prose-invert max-w-none">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]} 
          rehypePlugins={[rehypeRaw]}
          components={renderComponents}
        >
          {htmlContent}
        </ReactMarkdown>
      </div>
    </div>
  );
}
