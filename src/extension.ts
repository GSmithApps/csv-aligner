// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

  // Register the inlay hint provider for CSV files
  context.subscriptions.push(
    vscode.languages.registerInlayHintsProvider('csv', new CsvAlignInlayHintsProvider())
  );
}

class CsvAlignInlayHintsProvider implements vscode.InlayHintsProvider {
  provideInlayHints(
    document: vscode.TextDocument,
    range: vscode.Range,
    token: vscode.CancellationToken
  ): vscode.InlayHint[] {
    const hints: vscode.InlayHint[] = [];

    // Read the entire document and split it into rows
    const lines = document.getText(range).split('\n');

    // Calculate the maximum width of each column
    const columnWidths: number[] = [];

    for (const line of lines) {
      const columns = line.split(',');
      columns.forEach((col, i) => {
        const length = col.trim().length;
        columnWidths[i] = Math.max(columnWidths[i] || 0, length);
      });
    }

    // Create inlay hints for each line
    lines.forEach((line, rowIndex) => {
      const columns = line.split(',');
      let currentPos = 0;

      columns.forEach((col, colIndex) => {
        const startPos = currentPos + col.length;
        const spacesNeeded = columnWidths[colIndex] - col.trim().length;

        if (spacesNeeded > 0 && colIndex < columns.length - 1) {
          const position = new vscode.Position(rowIndex, startPos);

          // Add spaces as an inlay hint
          const hint = new vscode.InlayHint(
            position,
            ' '.repeat(spacesNeeded),
            // vscode.InlayHintKind.Other
          );
          hints.push(hint);
        }

        currentPos = startPos + 1; // Move past the comma
      });
    });

    return hints;
  }
}

// This method is called when your extension is deactivated
export function deactivate() {}
