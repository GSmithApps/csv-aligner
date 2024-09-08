
import * as vscode from 'vscode';

export function getHintAndCurrentPosfromCol(col: string, colWidth: number, currentPos: number, rowIndex: number): [vscode.InlayHint, number] {
    const startPos = currentPos + col.length;
    const spacesNeeded = colWidth - col.length;
    const position = new vscode.Position(rowIndex, startPos);

    // Add spaces as an inlay hint
    const hint = new vscode.InlayHint(
      position,
      ' '.repeat(spacesNeeded),
      //vscode.InlayHintKind.Other
    );
    currentPos = startPos + 1; // Move past the comma

    return [hint, currentPos];
}
