// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// import helper function from helpers.ts
import { getHintsFromString } from './helpers';
import { VsCodeInlayHintAdapter } from './getHintAndCurrentPosfromCol';


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

    // Read the entire document and split it into rows
    const stringFromDoc = document.getText(range);

    // Return the inlay hints
    const hints: VsCodeInlayHintAdapter[] = getHintsFromString(stringFromDoc);

    return hints.map(hint => new vscode.InlayHint(new vscode.Position(hint.position.rowIndex, hint.position.startPos), hint.label));

  }
}

// This method is called when your extension is deactivated
export function deactivate() {}
