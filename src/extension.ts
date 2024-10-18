// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { CSVParse, parseCSVWithPapa, CsvData } from './csvParser';

// import helper functions
import { getHintsFromCellLengths } from './helpers/getHintsFromCellLengths';
import { VsCodeInlayHintAdapter } from './helpers/getHintAndCurrentPosfromCol';
import { getMaxColumnWidthsFromCellLengths } from './helpers/getMaxColumnWidthsFromCellLengths';

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

    const hintCharacter = ' ';

    console.log('provideInlayHints called');
    
    // Read the entire document and split it into rows
    const stringFromDoc = document.getText(range);
    
    console.log('text received');
    const {
      data: rowsOfCellLengthArrays,
      delimiter: delimiter,
    }: CsvData = parseCSVWithPapa(stringFromDoc);

    // actual business logic

    const maxColumnWidths: number[] = getMaxColumnWidthsFromCellLengths(rowsOfCellLengthArrays);

    const hints: VsCodeInlayHintAdapter[] = getHintsFromCellLengths(
      rowsOfCellLengthArrays,
      maxColumnWidths,
      delimiter.length,
      hintCharacter
    );

    const vsCodeHints = hints.map(hint => new vscode.InlayHint(
      new vscode.Position(hint.position.rowIndex, hint.position.startPos),
      hint.label)
    );

    return vsCodeHints;

  }
}

// This method is called when your extension is deactivated
export function deactivate() { 
  console.log('deactivated');
}


