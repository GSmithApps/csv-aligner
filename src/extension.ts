// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// import helper function from helpers.ts
import { getHintsFromLines as getHintsFromCellLengths } from './helpers';
import { VsCodeInlayHintAdapter } from './getHintAndCurrentPosfromCol';
import { CSVParse } from './csvParser';

// import getColumnWidthsFromLines from './getColumnWidthsFromLines';
import { getColumnWidthsFromLines as getMaxColumnWidthsFromCellLengths } from './getColumnWidthsFromLines';



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

    const delimiter = ','
    const hintCharacter = ' '

    // Read the entire document and split it into rows
    const stringFromDoc = document.getText(range);

    // csv parsing
    const rowsOfCells = CSVParse(stringFromDoc, delimiter)

    // convert cells to just their lengths
    const cellLengths = rowsOfCells.map(
      rowOfCells => (
        rowOfCells.map(cell => cell.length)
      )
    )

    // actual business logic

    const maxColumnWidths: number[] = getMaxColumnWidthsFromCellLengths(cellLengths);

    const hints: VsCodeInlayHintAdapter[] = getHintsFromCellLengths(
      cellLengths,
      maxColumnWidths,
      delimiter.length,
      hintCharacter
    );

    return hints.map(hint => new vscode.InlayHint(
      new vscode.Position(hint.position.rowIndex, hint.position.startPos),
      hint.label)
    );

  }
}

// This method is called when your extension is deactivated
export function deactivate() {}


