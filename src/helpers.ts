


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
export function getHintsFromLines(
  cellLengths: number[][],
  columnMaxWidths: number[],
  delimiterLength: number,
  hintCharacter: string
): VsCodeInlayHintAdapter[] {
    
    const hints: VsCodeInlayHintAdapter[] = [];
  
    // Create inlay hints for each line
    cellLengths.forEach((rowOfCellLengths, rowIndex) => {
      let currentPos = 0;
  
      rowOfCellLengths.forEach((cellLength, colIndex) => {
          const returns: [VsCodeInlayHintAdapter, number] = getHintAndCurrentPosfromCol(
            cellLength,
            columnMaxWidths[colIndex],
            currentPos,
            rowIndex,
            delimiterLength,
            hintCharacter,
          );
          hints.push(returns[0]);
          currentPos = returns[1];
  
      });
    });
  
    return hints;
  }



