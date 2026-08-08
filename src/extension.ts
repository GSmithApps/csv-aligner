/**
 * This is basically the stuff that interfaces with VScode.
 * It calls out to the helpers and the parser.
 *
 * @packageDocumentation
 */

import * as vscode from 'vscode';
import { detectDelimiter, parseCSVWithPapa } from './csvParser';
import {
    getBufferedBodyLineRange,
    getDocumentLineFromCombinedRowIndex,
    type LineRange,
} from './helpers/getBufferedBodyLineRange';
import { ColumnWidthCache } from './helpers/columnWidthCache';
import { getColumnMaxWidthsFromText } from './helpers/getColumnMaxWidthsFromText';
import { getHintsFromCellLengths } from './helpers/getHintsFromCellLengths';
import { VsCodeInlayHintAdapter } from './helpers/getHintAndCurrentPosfromCol';

// Constants for buffer sizes
const BUFFER_LINES_ABOVE = 10;
const BUFFER_LINES_BELOW = 10;

export function activate(context: vscode.ExtensionContext) {
    const provider = new CsvAlignInlayHintsProvider();

    context.subscriptions.push(
        vscode.languages.registerInlayHintsProvider('csv', provider),
        // Once a document is closed we'll never be asked about it again, so
        // stop holding its widths.
        vscode.workspace.onDidCloseTextDocument(document => provider.forgetDocument(document)),
    );
}

class CsvAlignInlayHintsProvider implements vscode.InlayHintsProvider {
    private readonly widthCache = new ColumnWidthCache();

    forgetDocument(document: vscode.TextDocument): void {
        this.widthCache.forget(document.uri.toString());
    }

    /**
     * The delimiter and the whole-document column widths, recomputed only
     * when the document has actually changed since we last looked.
     */
    private async getWidthsAndDelimiter(
        document: vscode.TextDocument
    ): Promise<{ delimiter: string; widths: number[] }> {
        const key = document.uri.toString();
        const version = document.version;

        const cached = this.widthCache.get(key, version);
        if (cached !== undefined) {
            return cached;
        }

        // The delimiter is settled once, for the whole document, so that the
        // width scan and the visible-range parse can't disagree about it.
        const documentText = document.getText();
        const delimiter = await detectDelimiter(documentText);

        // Column widths come from the entire document, not just what's on
        // screen, so a column doesn't change width as you scroll past a wide
        // row. This is a single streaming pass -- see the notes in
        // getColumnMaxWidthsFromText for why it doesn't build the cell matrix.
        const widths = getColumnMaxWidthsFromText(documentText, delimiter);

        this.widthCache.set(key, { version, delimiter, widths });

        return { delimiter, widths };
    }

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

        const { delimiter, widths: maxColumnWidths } = await this.getWidthsAndDelimiter(document);

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

        // Only the visible rows need per-cell lengths, since those are the only
        // rows we draw hints on.
        const {data: cellLengths, delimiterLength} = await parseCSVWithPapa(textToParse, delimiter);

        if (!cellLengths.length) {
            return [];
        }

        // Generate hints, padding each visible cell out to its column's
        // whole-document width.
        const hints: VsCodeInlayHintAdapter[] = getHintsFromCellLengths(
            cellLengths,
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
