/**
 * This is basically the stuff that interfaces with VScode.
 * It calls out to the helpers and the parser.
 *
 * @packageDocumentation
 */

import * as vscode from 'vscode';
import { parseCSVWithPapa } from './csvParser';
import {
    getBufferedBodyLineRange,
    getDocumentLineFromCombinedRowIndex,
    type LineRange,
} from './helpers/getBufferedBodyLineRange';
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

    private getBodyLineRange(
        document: vscode.TextDocument,
        visibleRange: vscode.Range
    ): LineRange | undefined {
        return getBufferedBodyLineRange(
            document.lineCount,
            visibleRange.start.line,
            visibleRange.end.line,
            BUFFER_LINES_ABOVE,
            BUFFER_LINES_BELOW
        );
    }

    async provideInlayHints(
        document: vscode.TextDocument,
        range: vscode.Range,
        token: vscode.CancellationToken
    ): Promise<vscode.InlayHint[]> {
        const hintCharacter = ' ';

        // Get the active editor
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document !== document) {
            return [];
        }

        // Get the visible range and calculate the buffered body range.
        const visibleRange = this.getVisibleRange(editor);
        const bodyLineRange = this.getBodyLineRange(document, visibleRange);

        const headerText = document.lineAt(0).text;
        const bodyText = bodyLineRange === undefined
            ? undefined
            : document.getText(new vscode.Range(
                bodyLineRange.startLine,
                0,
                bodyLineRange.endLine,
                document.lineAt(bodyLineRange.endLine).text.length
            ));
        const textToParse = bodyText === undefined
            ? headerText
            : `${headerText}\n${bodyText}`;

        const {data: cellLengths, rawLengths, delimiterLength} = await parseCSVWithPapa(textToParse);

        if (!cellLengths.length) {
            return [];
        }

        // Calculate max column widths and generate hints
        const maxColumnWidths = getMaxColumnWidthsFromCellLengths(cellLengths);
        const hints: VsCodeInlayHintAdapter[] = getHintsFromCellLengths(
            cellLengths,
            rawLengths,
            maxColumnWidths,
            delimiterLength,
            hintCharacter
        );

        // Convert local parsed row indexes back to real document lines.
        return hints
            .map(hint => new vscode.InlayHint(
                new vscode.Position(
                    getDocumentLineFromCombinedRowIndex(
                        hint.position.rowIndex,
                        bodyLineRange?.startLine ?? 1
                    ),
                    hint.position.startPos
                ),
                hint.label
            ));
    }
}

export function deactivate() {
}
