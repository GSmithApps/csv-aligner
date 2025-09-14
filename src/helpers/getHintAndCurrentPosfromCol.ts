
/**
 * An adapter for a `vscode.Position` object.
 *
 * This interface allows for a `vscode.Position` object to be represented
 * without depending on the `vscode` package.
 *
 * @example
 * ```
 * const newPosition: VsCodePositionAdapter = { rowIndex: 1, startPos: 1 };
 * const position: vscode.Position = new vscode.Position(newPosition.rowIndex, newPosition.startPos);
 * ```
 */
export interface VsCodePositionAdapter {
  /**
   * The line number. (not sure if it's zero-based)
   */
  rowIndex: number;

  /**
   * The haracter offset. (not sure if it's zero-based)
   */
  startPos: number;
}

/**
 * An adapter for the `vscode.InlayHint` object.
 *
 * We are making this interface so you can easily switch back and forth
 * between the two, and use something like a `vscode.InlayHint` object,
 * but without having to depend on the `vscode` package.
 *
 * You can make a vscode.InlayHint object from this by doing
 *
 * ```
 * const newHint: VsCodeInlayHintAdapter = {position: {rowIndex: 1, startPos: 1}, label: 'Hello, World!'};
 * const hint: vscode.InlayHint = new vscode.InlayHint(newHint.position, newHint.label);
 * ```
 */
export interface VsCodeInlayHintAdapter {
  position: VsCodePositionAdapter;
  label: string;
}


export function getHintAndCurrentPosfromCol(
  cellLength: number,
  colMaxWidth: number,
  currentPos: number,
  rowIndex: number,
  delimiterLength: number,
  hintCharacter: string,
): [VsCodeInlayHintAdapter, number] {
    const startPos = currentPos + cellLength;
    const spacesNeeded = colMaxWidth - cellLength;
    const position: VsCodePositionAdapter = {rowIndex: rowIndex, startPos: startPos};

    // Add spaces as an inlay hint
    const hint: VsCodeInlayHintAdapter = {
      position: position,
      label: hintCharacter.repeat(spacesNeeded),
      //vscode.InlayHintKind.Other
    };
    currentPos = startPos + delimiterLength; // Move past the delimiter

    return [hint, currentPos];
}
