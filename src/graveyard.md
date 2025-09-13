This was the original function that parsed the CSV before we started
using papaparse.

```ts
export function CSVParse(
    stringFromDoc: string,
    delimiter: string
): string[][] {

    const lines = stringFromDoc.split('\n');

    const cells = lines.map(line => line.split(delimiter))

    return cells;

  }
```