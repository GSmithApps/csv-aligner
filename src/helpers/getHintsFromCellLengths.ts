import { getHintAndCurrentPosfromCol, VsCodeInlayHintAdapter } from './getHintAndCurrentPosfromCol';

/**
 * Helper function to generate inlay hints from the cell lengths
 * of a CSV.
 *
 * @param {string[][]} cellLengths - The lengths of the cells in the CSV
 * @param {number[]} columnMaxWidths - The maximum width of each column
 * @param {number} delimiterLength - The length of the delimiter
 * @param {string} hintCharacter - The character to use for the hint
 * @returns {VsCodeInlayHintAdapter[]} - The inlay hints
 */
export function getHintsFromCellLengths(
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



