import Papa from 'papaparse';

/**
 * The output type of the ParseCSVWithPapa function.
 * @description It has the string length of all the data in the csv, and it
 * has the delimiter of the csv
 * @property {number[][]} data - the string length of all the data in the csv.
 * I believe it's matrix notation, so the first index is the row number, and the second
 * index is the column number
 * @property {string} delimiter - the delimiter of the csv.
*/
export interface CsvData {
    data: number[][];
    delimiter: string;
}


export  function parseCSVWithPapa(csv: string): CsvData {
    let delimiter = ',';
    const result = Papa.parse<string[]>(csv, {
        delimiter: "", // Leave as empty string for auto-detect
        complete: function(results) {
            delimiter = results.meta.delimiter;
        }
    });

    // Step 2: Reconstruct raw text and capture value lengths
    let valueLengths: number[][] = [];
    let rows = csv.split(/\r?\n/); // Split raw content by newlines

    rows.forEach((row) => {
        let inQuotes = false;
        let currentValue = '';
        let valueStart = 0;
        let rowLengths = [];

        for (let i = 0; i < row.length; i++) {
            let char = row[i];

            // Toggle inQuotes when encountering double quotes
            if (char === '"') {
                inQuotes = !inQuotes;
            }

            // If we're not in quotes and hit a delimiter, calculate the value length
            if (char === delimiter && !inQuotes) {
                rowLengths.push(i - valueStart); // Length from start to current delimiter
                valueStart = i + 1; // Start of next value
            }
        }

        // After the last delimiter, push the final value's length
        rowLengths.push(row.length - valueStart);

        // Collect the row's value lengths
        valueLengths.push(rowLengths);
    });

    console.log("Delimiter:", delimiter);
    console.log("Value lengths per row:", valueLengths);

    // `result.data` contains the parsed array of arrays
    return {data: valueLengths, delimiter: delimiter};
}

