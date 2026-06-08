import { visit } from 'unist-util-visit';
import * as mhchemParser from 'mhchemparser';

export default function remarkMhchem() {
  return (tree: any) => {
    visit(tree, ['inlineMath', 'math'], (node: any) => {
      if (typeof node.value === 'string') {
        // Regex to find \ce{...} or \pu{...} inside math nodes
        // This handles cases like \ce{CO2} or \ce{H2O + CO2}
        node.value = node.value.replace(/\\(ce|pu)\{([^}]+)\}/g, (match: string, type: string, formula: string) => {
          try {
            // Use mhchemparser to safely compile the chemical AST into pure KaTeX syntax
            return mhchemParser.mhchemParser.toTex(formula, type);
          } catch (e) {
            console.error('Failed to parse mhchem:', e);
            return match;
          }
        });
      }
    });
  };
}
