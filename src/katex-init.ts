import katex from 'katex';

// Bind katex to the global window object.
// This is strictly required BEFORE importing any KaTeX extensions (like mhchem)
// because the extensions rely on the UMD global `window.katex` to register macros.
if (typeof window !== 'undefined') {
  (window as any).katex = katex;
}

export default katex;
