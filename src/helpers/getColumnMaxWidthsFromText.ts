/**
 * Finds the widest cell in each column by scanning the csv text directly,
 * without building the matrix of every cell length first.
 *
 * The point is memory. {@link getMaxColumnWidthsFromCellLengths} needs a
 * `number[][]` of every cell in the file, which is fine for the handful of
 * visible rows but falls over on a whole file -- a 100k x 40 csv is 4 million
 * boxed array entries, which was enough to get the process OOM-killed on a
 * dev container. Folding straight into the running maxima instead is O(columns)
 * memory, so it stays flat no matter how big the file is.
 *
 * @packageDocumentation
 */

/**
 * Scan the csv text and return the maximum cell width for each column.
 *
 * This deliberately mirrors the cell-splitting rules in
 * `parseCSVWithPapa`, quirks included, so that the widths it reports
 * always agree with the cell positions the hints are drawn at. In particular
 * quote state is reset at every newline, so a quoted cell containing a
 * newline is misread here exactly as it is there. Fixing that is a separate
 * job, and it has to happen in both places at once or the padding and the
 * cell boundaries drift apart.
 *
 * Like the parser, this assumes a single-character delimiter.
 *
 * @param text the csv data as a string
 * @param delimiter the single-character delimiter, as detected by `detectDelimiter`
 * @returns an array of the column widths
 */
export function getColumnMaxWidthsFromText(
  text: string,
  delimiter: string,
): number[] {
  const columnWidths: number[] = [];

  let columnIndex = 0;
  let valueStart = 0;
  let inQuotes = false;

  const recordCell = (cellLength: number) => {
    columnWidths[columnIndex] = Math.max(columnWidths[columnIndex] || 0, cellLength);
  };

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (char === '\n') {
      // End of a row. Drop a trailing '\r' so CRLF files come out the same
      // as they do under the parser's /\r?\n/ split.
      const rowEnd = text[i - 1] === '\r' ? i - 1 : i;
      recordCell(rowEnd - valueStart);

      columnIndex = 0;
      valueStart = i + 1;
      inQuotes = false;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === delimiter && !inQuotes) {
      recordCell(i - valueStart);
      columnIndex++;
      valueStart = i + 1;
    }
  }

  // The final row, which has no newline after it.
  recordCell(text.length - valueStart);

  return columnWidths;
}
