
export function getColumnWidthsFromLines(lines: string[], delimiter: string): number[] {
    const columnWidths: number[] = [];
  
    for (const line of lines) {
      const columns = line.split(delimiter);
      columns.forEach((col, i) => {
        const length = col.trim().length;
        columnWidths[i] = Math.max(columnWidths[i] || 0, length);
      });
    }
  
    return columnWidths;
  }