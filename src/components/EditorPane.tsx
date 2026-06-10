import React, { useEffect, useRef, useState } from 'react';
import { EditorState, Compartment, StateEffect } from '@codemirror/state';
import { 
  EditorView, 
  lineNumbers, 
  highlightActiveLineGutter, 
  highlightSpecialChars, 
  drawSelection, 
  dropCursor, 
  rectangularSelection, 
  crosshairCursor, 
  highlightActiveLine, 
  keymap 
} from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { oneDark } from '@codemirror/theme-one-dark';
import { syntaxHighlighting, defaultHighlightStyle, bracketMatching } from '@codemirror/language';
import { autocompletion, CompletionContext } from '@codemirror/autocomplete';
import type { ViewMode } from '../App';
import { Columns, Maximize, Eye, Focus, Type, PencilRuler, FlaskConical } from 'lucide-react';
import { PeriodicTableModal } from './PeriodicTableModal';
import { MolecularDrawerModal } from './MolecularDrawerModal';
import { PubChemModal } from './PubChemModal';

// Compartments for dynamic reconfiguration
const themeCompartment = new Compartment();
const typewriterCompartment = new Compartment();
const OPEN_PT_EFFECT = StateEffect.define<boolean>();
const OPEN_DRAW_EFFECT = StateEffect.define<boolean>();
const OPEN_PUBCHEM_EFFECT = StateEffect.define<boolean>();

interface EditorPaneProps {
  value: string;
  onChange: (val: string) => void;
  isDark: boolean;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  scrollToLine?: number | null;
}

// Slash Command Menu definitions
const slashCommandCompletions = (context: CompletionContext) => {
  const word = context.matchBefore(/\/.*/);
  if (!word) return null;
  if (word.from === word.to && !context.explicit) return null;
  return {
    from: word.from,
    options: [
      { label: "/chem", type: "keyword", info: "Insert SMILES 2D Block", apply: "```chem\n\n```" },
      { label: "/mermaid", type: "keyword", info: "Insert Mermaid Diagram", apply: "```mermaid\ngraph TD\n    A[Start] --> B{Decision}\n    B -->|Yes| C[Process]\n    B -->|No| D[End]\n```" },
      { label: "/ce", type: "keyword", info: "Insert Inline Equation", apply: "$\\ce{}$" },
      { label: "/ceblock", type: "keyword", info: "Insert Block Equation", apply: "$$\n\\ce{}\n$$" },
      { label: "/h1", type: "keyword", info: "Heading 1", apply: "# " },
      { label: "/h2", type: "keyword", info: "Heading 2", apply: "## " },
      { label: "/h3", type: "keyword", info: "Heading 3", apply: "### " },
      { label: "/bold", type: "keyword", info: "Bold Text", apply: "**text**" },
      { label: "/italic", type: "keyword", info: "Italic Text", apply: "*text*" },
      { 
        label: "/pt", 
        type: "keyword", 
        info: "Interactive Periodic Table", 
        apply: (view: EditorView, completion: any, from: number, to: number) => {
          view.dispatch({
            changes: { from, to, insert: "" },
            effects: OPEN_PT_EFFECT.of(true)
          });
        }
      },
      { 
        label: "/draw", 
        type: "keyword", 
        info: "Draw Molecule to SMILES", 
        apply: (view: EditorView, completion: any, from: number, to: number) => {
          view.dispatch({
            changes: { from, to, insert: "" },
            effects: OPEN_DRAW_EFFECT.of(true)
          });
        }
      },
      { 
        label: "/pubchem", 
        type: "keyword", 
        info: "Search PubChem Database", 
        apply: (view: EditorView, completion: any, from: number, to: number) => {
          view.dispatch({
            changes: { from, to, insert: "" },
            effects: OPEN_PUBCHEM_EFFECT.of(true)
          });
        }
      }
    ]
  };
};

export function EditorPane({ value, onChange, isDark, viewMode, setViewMode, scrollToLine }: EditorPaneProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isTypewriterMode, setIsTypewriterMode] = useState(false);
  const [isPtOpen, setIsPtOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPubChemOpen, setIsPubChemOpen] = useState(false);

  useEffect(() => {
    if (!editorRef.current) return;

    const startState = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightSpecialChars(),
        history(),
        drawSelection(),
        dropCursor(),
        EditorState.allowMultipleSelections.of(true),
        rectangularSelection(),
        crosshairCursor(),
        highlightActiveLine(),
        bracketMatching(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        markdown({ base: markdownLanguage, codeLanguages: languages }),
        autocompletion({ override: [slashCommandCompletions] }),
        keymap.of([
          ...defaultKeymap,
          ...historyKeymap,
        ]),
        themeCompartment.of(isDark ? oneDark : []),
        typewriterCompartment.of([]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString());
          }
          if (update.transactions.some(tr => tr.effects.some(e => e.is(OPEN_PT_EFFECT)))) {
            setIsPtOpen(true);
          }
          if (update.transactions.some(tr => tr.effects.some(e => e.is(OPEN_DRAW_EFFECT)))) {
            setIsDrawerOpen(true);
          }
          if (update.transactions.some(tr => tr.effects.some(e => e.is(OPEN_PUBCHEM_EFFECT)))) {
            setIsPubChemOpen(true);
          }
        }),
        EditorView.theme({
          "&": { height: "100%", outline: "none" },
          ".cm-scroller": { overflow: "auto" }
        })
      ]
    });

    const view = new EditorView({
      state: startState,
      parent: editorRef.current
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update editor doc when value changes externally
  useEffect(() => {
    if (viewRef.current && value !== viewRef.current.state.doc.toString()) {
      viewRef.current.dispatch({
        changes: { from: 0, to: viewRef.current.state.doc.length, insert: value }
      });
    }
  }, [value]);

  // Handle dynamic theme toggling
  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.dispatch({
        effects: themeCompartment.reconfigure(isDark ? oneDark : [])
      });
    }
  }, [isDark]);

  // Handle Typewriter Mode
  useEffect(() => {
    if (viewRef.current) {
      const typewriterExtension = EditorView.updateListener.of((update) => {
        if (update.selectionSet && update.view.hasFocus) {
          const pos = update.state.selection.main.head;
          // Defer scroll slightly to let render finish
          requestAnimationFrame(() => {
            update.view.dispatch({
              effects: EditorView.scrollIntoView(pos, { y: "center" })
            });
          });
        }
      });
      const typewriterTheme = EditorView.theme({
        ".cm-content": {
          paddingTop: "40vh",
          paddingBottom: "40vh"
        }
      });

      viewRef.current.dispatch({
        effects: typewriterCompartment.reconfigure(isTypewriterMode ? [typewriterExtension, typewriterTheme] : [])
      });
      
      // Center immediately if enabled
      if (isTypewriterMode && viewRef.current.hasFocus) {
         const pos = viewRef.current.state.selection.main.head;
         viewRef.current.dispatch({ effects: EditorView.scrollIntoView(pos, { y: "center" }) });
      }
    }
  }, [isTypewriterMode]);

  // Scroll to specific line
  useEffect(() => {
    if (scrollToLine !== null && scrollToLine !== undefined && viewRef.current) {
      const view = viewRef.current;
      const doc = view.state.doc;
      if (scrollToLine > 0 && scrollToLine <= doc.lines) {
        const lineInfo = doc.line(scrollToLine);
        view.dispatch({
          selection: { anchor: lineInfo.from },
          effects: EditorView.scrollIntoView(lineInfo.from, { y: 'start', yMargin: 40 })
        });
        view.focus();
      }
    }
  }, [scrollToLine]);

  const insertSnippet = (snippet: string, cursorOffset: number) => {
    if (!viewRef.current) return;
    const view = viewRef.current;
    const { from, to } = view.state.selection.main;
    
    view.dispatch({
      changes: { from, to, insert: snippet },
      selection: { anchor: from + cursorOffset }
    });
    view.focus();
  };

  const handleInsertElement = (el: any) => {
    setIsPtOpen(false);
    const markdownTable = `
| Property | Value |
| --- | --- |
| **Element** | ${el.name} (${el.symbol}) |
| **Atomic Number** | ${el.atomicNumber} |
| **Mass** | ${el.atomicMass} |
| **Category** | <span className="capitalize">${el.groupBlock}</span> |
| **Configuration** | ${el.electronicConfiguration} |
| **Electronegativity** | ${el.electronegativity || '-'} |
| **Boiling Point** | ${el.boilingPoint ? el.boilingPoint + ' K' : '-'} |
`;
    insertSnippet(markdownTable + '\n', markdownTable.length + 1);
  };

  const handleInsertMolecule = (smiles: string) => {
    setIsDrawerOpen(false);
    const block = `\`\`\`chem\n${smiles}\n\`\`\`\n`;
    insertSnippet(block, block.length);
  };

  const handleInsertPubChem = (data: any) => {
    setIsPubChemOpen(false);
    const text = `**${data.name}** (MW: ${data.MolecularWeight} g/mol, Formula: ${data.MolecularFormula})\n\n\`\`\`chem\n${data.IsomericSMILES}\n\`\`\`\n`;
    insertSnippet(text, text.length);
  };

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden border-r border-slate-borderDark ${isFocusMode ? 'focus-mode-active' : ''}`}>
      <PeriodicTableModal 
        isOpen={isPtOpen} 
        onClose={() => setIsPtOpen(false)} 
        onSelectElement={handleInsertElement} 
      />
      <MolecularDrawerModal 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        onInsert={handleInsertMolecule} 
      />
      <PubChemModal
        isOpen={isPubChemOpen}
        onClose={() => setIsPubChemOpen(false)}
        onInsert={handleInsertPubChem}
      />
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between p-2 bg-slate-200 dark:bg-slate-panels border-b border-slate-borderDark shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => insertSnippet('$\\ce{}$', 5)}
            className="px-3 py-1 text-xs font-semibold rounded bg-white dark:bg-obsidian border border-slate-borderDark hover:border-cyan-accent text-slate-dark dark:text-slate-light transition-colors"
            title="Insert Inline Equation"
          >
            Inline $\ce{}$
          </button>
          <button
            onClick={() => insertSnippet('$$\n\\ce{}\n$$', 7)}
            className="px-3 py-1 text-xs font-semibold rounded bg-white dark:bg-obsidian border border-slate-borderDark hover:border-cyan-accent text-slate-dark dark:text-slate-light transition-colors"
            title="Insert Block Equation"
          >
            Block $$\ce{}$$
          </button>
          <button
            onClick={() => insertSnippet('```chem\n\n```', 8)}
            className="px-3 py-1 text-xs font-semibold rounded bg-white dark:bg-obsidian border border-slate-borderDark hover:border-cyan-accent text-slate-dark dark:text-slate-light transition-colors"
            title="Insert 2D Molecule Block"
          >
            SMILES ```chem
          </button>
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded bg-cyan-accent text-obsidian hover:bg-cyan-400 transition-colors"
            title="Draw Molecule Visually"
          >
            <PencilRuler size={14} />
            Draw
          </button>
          <button
            onClick={() => setIsPubChemOpen(true)}
            className="flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded bg-purple-500 text-white hover:bg-purple-400 transition-colors"
            title="Search PubChem Database"
          >
            <FlaskConical size={14} />
            Search
          </button>
        </div>
        
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setIsTypewriterMode(!isTypewriterMode)}
            className={`p-1.5 rounded transition-colors ${isTypewriterMode ? 'bg-cyan-accent text-obsidian' : 'hover:bg-obsidian text-slate-dark dark:text-slate-light'}`}
            title="Toggle Typewriter Mode"
          >
            <Type size={16} />
          </button>
          <button 
            onClick={() => setIsFocusMode(!isFocusMode)}
            className={`p-1.5 rounded transition-colors ${isFocusMode ? 'bg-cyan-accent text-obsidian' : 'hover:bg-obsidian text-slate-dark dark:text-slate-light'}`}
            title="Toggle Focus Mode"
          >
            <Focus size={16} />
          </button>
          <div className="w-px h-4 bg-slate-borderDark mx-1"></div>
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
      
      {/* CodeMirror Container */}
      <div className="flex-1 overflow-hidden font-mono text-[14px] relative z-0">
        <div ref={editorRef} className="h-full w-full outline-none" />
      </div>
    </div>
  );
}
