/**
 * This parses the portion of the CSV that's in the user's view
 * (plus the header, plus some buffer).
 * 
 * It's called by extension.ts.
 *
 * @packageDocumentation
 */

import Papa from 'papaparse';
import * as eaw from 'eastasianwidth';

/**
 * The output type of the ParseCSVWithPapa function.
 * It has the string length of all the data in the csv, and it
 * has the delimiter of the csv
 * @property {number[][]} data - the display width of all the cells in the csv.
 * @property {number[][]} rawLengths - the raw character count of all cells, for position tracking.
 * @property {number} delimiterLength - the length of the delimiter.
*/
export interface CsvData {
    data: number[][];
    rawLengths: number[][];
    delimiterLength: number;
}

/**
 * Takes the csv as a string, then parses it to get
 * the strength length in each cell, and it also returns the length
 * of the delimiter.
 * @param csv takes in the csv data as a string
 * @returns the length of all the cells in the data, and the delimiter length
 */
export async function parseCSVWithPapa(csv: string): Promise<CsvData> {
    // Parse the CSV and wait for Papa to finish
    const { meta: { delimiter } } = await new Promise<Papa.ParseResult<string[]>>((resolve) => {
    Papa.parse<string[]>(csv, {
        delimiter: "", // Let Papa auto-detect
        complete: resolve
    });
});

    // Step 2: Reconstruct raw text and capture value lengths
    const valueLengths: number[][] = [];
    const rawLengths: number[][] = [];
    const rows = csv.split(/\r?\n/); // Split raw content by newlines

    rows.forEach((row) => {
        let inQuotes = false;
        let valueStart = 0;
        let displayWidth = 0;
        let rowLengths: number[] = [];
        let rowRawLengths: number[] = [];

        for (let i = 0; i < row.length; i++) {
            const char = row[i];

            if (char === '"') {
                inQuotes = !inQuotes;
            }

            if (char === delimiter && !inQuotes) {
                const rawLen = i - valueStart;
                rowRawLengths.push(rawLen);
                rowLengths.push(displayWidth);
                displayWidth = 0;
                valueStart = i + 1;
            } else {
                displayWidth += eaw.characterLength(char);
            }
        }

        const rawLen = row.length - valueStart;
        rowRawLengths.push(rawLen);
        rowLengths.push(displayWidth);
        rawLengths.push(rowRawLengths);
        valueLengths.push(rowLengths);
    });

    return {
        data: valueLengths,
        rawLengths: rawLengths,
        delimiterLength: delimiter.length
    };
}
