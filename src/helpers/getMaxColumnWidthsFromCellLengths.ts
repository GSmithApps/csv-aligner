
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