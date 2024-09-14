
// import getColumnWidthsFromLines from './getColumnWidthsFromLines';
import { getColumnWidthsFromLines } from './getColumnWidthsFromLines';
import { getHintAndCurrentPosfromCol, VsCodeInlayHintAdapter } from './getHintAndCurrentPosfromCol';

/**
 * Helper function to generate inlay hints from a CSV string.
 *
 * @param {string} stringFromDoc - The CSV string from the document.
 * @returns {VsCodeInlayHintAdapter[]} An array of inlay hints.
 * 
 * todo:
 * - make general enough for any delimiter
 * - make general enough to handle commas in quoted strings
 * 
 * implementation:
 * - get into grid of strings
 * - get the grid into string lengths instead of strings
 * - find the max length of each column
 * - for each item in the grid, get the hint
 */
export function getHintsFromString(stringFromDoc: string): VsCodeInlayHintAdapter[] {
  
    const lines = stringFromDoc.split('\n');
    
    // Calculate the maximum width of each column
    const columnWidths: number[] = getColumnWidthsFromLines(lines, ',');

    const hints: VsCodeInlayHintAdapter[] = [];
  
    // Create inlay hints for each line
    lines.forEach((line, rowIndex) => {
      const columns = line.split(',');
      let currentPos = 0;
  
      columns.forEach((col, colIndex) => {
          const returns: [VsCodeInlayHintAdapter, number] = getHintAndCurrentPosfromCol(col, columnWidths[colIndex], currentPos, rowIndex);
          hints.push(returns[0]);
          currentPos = returns[1];
  
      });
    });
  
    return hints;
  }



