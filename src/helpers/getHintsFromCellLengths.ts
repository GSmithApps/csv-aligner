import { getHintAndCurrentPosfromCol, VsCodeInlayHintAdapter } from './getHintAndCurrentPosfromCol';

/**
 * Helper function to generate inlay hints from the cell lengths
 * of a CSV.
 *
 * @param {number[][]} cellLengths - The display widths of the cells in the CSV
 * @param {number[][]} rawLengths - The raw character counts of the cells
 * @param {number[]} columnMaxWidths - The maximum display width of each column
 * @param {number} delimiterLength - The length of the delimiter
 * @param {string} hintCharacter - The character to use for the hint
 * @returns {VsCodeInlayHintAdapter[]} - The inlay hints
 */
export function getHintsFromCellLengths(
  cellLengths: number[][],
  rawLengths: number[][],
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
            rawLengths[rowIndex][colIndex],
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



