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
 * Takes the csv as a string, then parses it to get
 * the strength length in each cell, and it also returns the length
 * of the delimiter.
 * @param csv takes in the csv data as a string
 * @returns the length of all the cells in the data, and the delimiter length
 */
export async function parseCSVWithPapa(csv: string): Promise<CsvData> {
    // Parse the CSV and wait for Papa to finish
    const { data, meta } = await new Promise<Papa.ParseResult<string[]>>((resolve) => {
        Papa.parse<string[]>(csv, {
            delimiter: "", // Let Papa auto-detect
            complete: resolve
        });
    });

    const delimiter = meta.delimiter;
    console.log(`delimiter: ${delimiter}`)

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

