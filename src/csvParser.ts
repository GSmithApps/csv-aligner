/**
 * This parses the portion of the CSV that's in the user's view
 * (plus the header, plus some buffer).
 * 
 * It's called by extension.ts.
 *
 * @packageDocumentation
 */

import Papa from 'papaparse';

/**
 * How many lines to hand to Papa when auto-detecting the delimiter.
 *
 * Papa only needs a taste of the file to guess the delimiter, but if
 * you give it the whole thing, it parses the whole thing -- and we throw
 * all of those parsed rows away, because we only want `meta.delimiter`.
 * On a 23 MB file that's about 100ms of pure waste, so we slice off a
 * sample first.
 */
const DELIMITER_SAMPLE_LINES = 50;

/**
 * Grab the first {@link DELIMITER_SAMPLE_LINES} lines of the csv, so we
 * can guess the delimiter without parsing the whole file.
 *
 * We split on newlines (rather than just taking the first N characters)
 * so the sample never ends in the middle of a line, which could hide or
 * invent a delimiter.
 * @param csv the csv data as a string
 * @returns the first several lines of the csv
 */
function getDelimiterSample(csv: string): string {
    return csv.split(/\r?\n/, DELIMITER_SAMPLE_LINES).join('\n');
}

/**
 * The output type of the ParseCSVWithPapa function.
 * It has the string length of all the data in the csv, and it
 * has the delimiter of the csv
 * @property {number[][]} data - the string length of all the data in the csv.
 * I believe it's matrix notation, so the first index is the row number, and the second
 * index is the column number
 * @property {string} delimiter - the delimiter of the csv.
*/
export interface CsvData {
    data: number[][];
    delimiterLength: number;
}

/**
 * Ask Papa to guess the delimiter, using only a sample of the csv.
 *
 * This is split out so callers who want the delimiter but not the cell
 * lengths -- like the whole-file column width scan -- don't have to run a
 * parse they'll throw away. It also means everything can agree on one
 * delimiter for a document instead of re-guessing per chunk of text.
 * @param csv takes in the csv data as a string
 * @returns the delimiter
 */
export async function detectDelimiter(csv: string): Promise<string> {
    const { meta: { delimiter } } = await new Promise<Papa.ParseResult<string[]>>((resolve) => {
    Papa.parse<string[]>(getDelimiterSample(csv), {
        delimiter: "", // Let Papa auto-detect
        complete: resolve
    });
});

    return delimiter;
}

/**
 * Takes the csv as a string, then parses it to get
 * the strength length in each cell, and it also returns the length
 * of the delimiter.
 * @param csv takes in the csv data as a string
 * @returns the length of all the cells in the data, and the delimiter length
 */
export async function parseCSVWithPapa(csv: string): Promise<CsvData> {
    // We only need Papa for the delimiter -- the cell lengths come from
    // the scan below, over the full input.
    const delimiter = await detectDelimiter(csv);

    // Step 2: Reconstruct raw text and capture value lengths
    const valueLengths: number[][] = [];
    const rows = csv.split(/\r?\n/); // Split raw content by newlines

    rows.forEach((row) => {
        let inQuotes = false;
        let valueStart = 0;
        let rowLengths: number[] = [];

        for (let i = 0; i < row.length; i++) {
            const char = row[i];

            if (char === '"') {
                inQuotes = !inQuotes;
            }

            if (char === delimiter && !inQuotes) {
                rowLengths.push(i - valueStart);
                valueStart = i + 1;
            }
        }

        rowLengths.push(row.length - valueStart);
        valueLengths.push(rowLengths);
    });

    return {
        data: valueLengths,
        delimiterLength: delimiter.length
    };
}
