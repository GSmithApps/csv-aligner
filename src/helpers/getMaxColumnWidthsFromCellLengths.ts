
/**
 * some stuff at the top
 */

/**
 * This function is pretty self-explanatory. When a matrix
 * of cell lengths is passed in, it will look through each of
 * those and for each column, it will return the maximum length
 * inside that column. 
 * 
 * One potential area of improvement would be to allow a second
 * argument, which is a historic max length, and then that could
 * be taken into account and the max of that and the new one
 * would be taken. Sort of like a cache.
 */

/**
 * Get the list of column widths from the matrix of cell lengths
 * @param cellLengths the matrix of cell lengths
 * @returns an array of the column widths
 */
export function getMaxColumnWidthsFromCellLengths(
  cellLengths: number[][]
): number[] {
    const columnWidths: number[] = [];

    for (const rowOfCellLengths of cellLengths) {

      rowOfCellLengths.forEach((cellLength, i) => {
        columnWidths[i] = Math.max(columnWidths[i] || 0, cellLength);
      });
    }

    return columnWidths;
  }