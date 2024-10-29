import * as vscode from 'vscode';
import { CSVParse, parseCSVWithPapa, CsvData } from './csvParser';
import { getHintsFromCellLengths } from './helpers/getHintsFromCellLengths';
import { VsCodeInlayHintAdapter } from './helpers/getHintAndCurrentPosfromCol';
import { getMaxColumnWidthsFromCellLengths } from './helpers/getMaxColumnWidthsFromCellLengths';

// Constants for buffer sizes
const BUFFER_LINES_ABOVE = 10;
const BUFFER_LINES_BELOW = 10;

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.languages.registerInlayHintsProvider('csv', new CsvAlignInlayHintsProvider())
    );
}

class CsvAlignInlayHintsProvider implements vscode.InlayHintsProvider {
    private getVisibleRange(editor: vscode.TextEditor): vscode.Range {
        const visibleRanges = editor.visibleRanges;
        if (visibleRanges.length === 0) {
            return new vscode.Range(0, 0, 0, 0);
        }
        return visibleRanges[0];
    }

    private getEffectiveRange(
        document: vscode.TextDocument,
        visibleRange: vscode.Range
    ): vscode.Range {
        // Always include the header (first line)
        const headerLine = 0;
        
        // Calculate the range of lines to process
        const startLine = Math.max(1, visibleRange.start.line - BUFFER_LINES_ABOVE);
        const endLine = Math.min(
            document.lineCount - 1,
            visibleRange.end.line + BUFFER_LINES_BELOW
        );

        return new vscode.Range(
            headerLine, 0,  // Start from the header
            endLine, document.lineAt(endLine).text.length
        );
    }

    async provideInlayHints(
        document: vscode.TextDocument,
        range: vscode.Range,
        token: vscode.CancellationToken
    ): Promise<vscode.InlayHint[]> {
        const hintCharacter = ' ';
        console.log('provideInlayHints called');

        // Get the active editor
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document !== document) {
            return [];
        }

        // Get the visible range and calculate the effective range
        const visibleRange = this.getVisibleRange(editor);
        const effectiveRange = this.getEffectiveRange(document, visibleRange);

        // Get text for the header and visible range separately
        const headerText = document.lineAt(0).text;
        const visibleText = document.getText(effectiveRange);

        // Parse the header and visible text
        const headerData = parseCSVWithPapa(headerText);
        const visibleData = parseCSVWithPapa(visibleText);

        if (!headerData.data.length || !visibleData.data.length) {
            return [];
        }

        // Combine header with visible data, avoiding duplication if header is in visible range
        const combinedRows = (effectiveRange.start.line === 0)
            ? visibleData.data
            : [headerData.data[0], ...visibleData.data];

        // Calculate max column widths and generate hints
        const maxColumnWidths = getMaxColumnWidthsFromCellLengths(combinedRows);
        const hints: VsCodeInlayHintAdapter[] = getHintsFromCellLengths(
            combinedRows,
            maxColumnWidths,
            visibleData.delimiter.length,
            hintCharacter
        );

        // Convert to VSCode InlayHints and filter for visible range
        return hints
            .filter(hint => {
                const lineNum = hint.position.rowIndex;
                return (
                    lineNum === 0 || // Always include header row hints
                    (lineNum >= effectiveRange.start.line && lineNum <= effectiveRange.end.line)
                );
            })
            .map(hint => new vscode.InlayHint(
                new vscode.Position(hint.position.rowIndex, hint.position.startPos),
                hint.label
            ));
    }
}

export function deactivate() {
    console.log('deactivated');
}