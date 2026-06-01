export interface LineRange {
  startLine: number;
  endLine: number;
}

export function getBufferedBodyLineRange(
  documentLineCount: number,
  visibleStartLine: number,
  visibleEndLine: number,
  bufferLinesAbove: number,
  bufferLinesBelow: number,
): LineRange | undefined {
  const lastDocumentLine = documentLineCount - 1;
  if (lastDocumentLine < 1) {
    return undefined;
  }

  const startLine = Math.max(1, visibleStartLine - bufferLinesAbove);
  const endLine = Math.min(lastDocumentLine, visibleEndLine + bufferLinesBelow);

  if (startLine > endLine) {
    return undefined;
  }

  return { startLine, endLine };
}

export function getDocumentLineFromCombinedRowIndex(
  combinedRowIndex: number,
  bodyStartLine: number,
): number {
  if (combinedRowIndex === 0) {
    return 0;
  }

  return bodyStartLine + combinedRowIndex - 1;
}
