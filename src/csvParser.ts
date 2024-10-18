import Papa from 'papaparse';

export function CSVParse(
    stringFromDoc: string,
    delimiter: string
): string[][] {
  
    const lines = stringFromDoc.split('\n');

    const cells = lines.map(line => line.split(delimiter))

    return cells;
  
  }

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

    // convert cells to just their lengths
    const rowsOfCellLengthArrays = result.data.map(
        rowOfCells => (
            rowOfCells.map(cell => cell.length)
        )
    );

    // `result.data` contains the parsed array of arrays
    return {data: rowsOfCellLengthArrays, delimiter: delimiter};
}

