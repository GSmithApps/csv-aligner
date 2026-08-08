/// <reference types="mocha" />

import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';

import { detectDelimiter, parseCSVWithPapa } from '../csvParser';
import {
	getBufferedBodyLineRange,
	getDocumentLineFromCombinedRowIndex,
} from '../helpers/getBufferedBodyLineRange';
import { ColumnWidthCache } from '../helpers/columnWidthCache';
import { getColumnMaxWidthsFromText } from '../helpers/getColumnMaxWidthsFromText';
import { getHintAndCurrentPosfromCol } from '../helpers/getHintAndCurrentPosfromCol';
import { getHintsFromCellLengths } from '../helpers/getHintsFromCellLengths';
import { getMaxColumnWidthsFromCellLengths } from '../helpers/getMaxColumnWidthsFromCellLengths';

// This file compiles to out/test, and the csvs stay put in src/test.
const TEST_CSV_DIR = path.resolve(__dirname, '../../src/test/test-csvs');

suite('Core helpers', () => {
	test('gets max width for each column', () => {
		const widths = getMaxColumnWidthsFromCellLengths([
			[5, 6],
			[7, 2, 4],
			[1, 8, 3],
		]);

		assert.deepStrictEqual(widths, [7, 8, 4]);
	});

	test('creates an inlay hint at the end of the current cell', () => {
		const [hint, nextPos] = getHintAndCurrentPosfromCol(
			5,
			7,
			0,
			2,
			1,
			'.',
		);

		assert.deepStrictEqual(hint, {
			position: { rowIndex: 2, startPos: 5 },
			label: '..',
		});
		assert.strictEqual(nextPos, 6);
	});

	test('creates hints for every cell length', () => {
		const hints = getHintsFromCellLengths(
			[
				[5, 6, 7],
				[7, 2, 6],
			],
			[7, 6, 7],
			1,
			'.',
		);

		assert.deepStrictEqual(hints, [
			{ position: { rowIndex: 0, startPos: 5 }, label: '..' },
			{ position: { rowIndex: 0, startPos: 12 }, label: '' },
			{ position: { rowIndex: 0, startPos: 20 }, label: '' },
			{ position: { rowIndex: 1, startPos: 7 }, label: '' },
			{ position: { rowIndex: 1, startPos: 10 }, label: '....' },
			{ position: { rowIndex: 1, startPos: 17 }, label: '.' },
		]);
	});
});

suite('Whole-text column widths', () => {
	test('gets the widest cell in each column', () => {
		const widths = getColumnMaxWidthsFromText(
			'name,count\nmochi,12\nd-train,1',
			',',
		);

		assert.deepStrictEqual(widths, [7, 5]);
	});

	test('does not split on delimiters inside quoted cells', () => {
		const widths = getColumnMaxWidthsFromText(
			'"hello, friend",x\nshorter,y',
			',',
		);

		assert.deepStrictEqual(widths, [15, 1]);
	});

	test('handles rows with different column counts', () => {
		const widths = getColumnMaxWidthsFromText('a,b,c\nlonger,row', ',');

		assert.deepStrictEqual(widths, [6, 3, 1]);
	});

	test('ignores the carriage return in crlf files', () => {
		const widths = getColumnMaxWidthsFromText('name,count\r\nmochi,12\r\n', ',');

		assert.deepStrictEqual(widths, [5, 5]);
	});

	test('works with a tab delimiter', () => {
		const widths = getColumnMaxWidthsFromText('name\tcount\nmochi\t12', '\t');

		assert.deepStrictEqual(widths, [5, 5]);
	});

	// The whole point of this helper is to replace the parse-then-reduce
	// pipeline for the full document, so the two had better agree. If one of
	// these ever fails, the widths and the hint positions have drifted apart
	// and the alignment will be visibly wrong.
	suite('agrees with the existing parse-then-reduce pipeline', () => {
		for (const fileName of fs.readdirSync(TEST_CSV_DIR)) {
			test(fileName, async () => {
				const text = fs.readFileSync(path.join(TEST_CSV_DIR, fileName), 'utf8');
				const delimiter = await detectDelimiter(text);

				const viaMatrix = getMaxColumnWidthsFromCellLengths(
					(await parseCSVWithPapa(text)).data,
				);

				assert.deepStrictEqual(
					getColumnMaxWidthsFromText(text, delimiter),
					viaMatrix,
				);
			});
		}
	});
});

suite('Column width cache', () => {
	const entry = { version: 4, delimiter: ',', widths: [3, 7] };

	test('gives back the widths for the version it stored', () => {
		const cache = new ColumnWidthCache();
		cache.set('file:///a.csv', entry);

		assert.deepStrictEqual(cache.get('file:///a.csv', 4), entry);
	});

	test('treats a newer document version as a miss', () => {
		const cache = new ColumnWidthCache();
		cache.set('file:///a.csv', entry);

		assert.strictEqual(cache.get('file:///a.csv', 5), undefined);
	});

	test('misses for a document it has never seen', () => {
		const cache = new ColumnWidthCache();

		assert.strictEqual(cache.get('file:///nope.csv', 1), undefined);
	});

	test('keeps documents apart', () => {
		const cache = new ColumnWidthCache();
		cache.set('file:///a.csv', entry);
		cache.set('file:///b.csv', { version: 4, delimiter: '\t', widths: [1] });

		assert.deepStrictEqual(cache.get('file:///a.csv', 4)?.widths, [3, 7]);
		assert.deepStrictEqual(cache.get('file:///b.csv', 4)?.widths, [1]);
		assert.strictEqual(cache.size, 2);
	});

	test('replaces the entry for a document rather than piling up', () => {
		const cache = new ColumnWidthCache();
		cache.set('file:///a.csv', entry);
		cache.set('file:///a.csv', { version: 5, delimiter: ',', widths: [9] });

		assert.strictEqual(cache.size, 1);
		assert.strictEqual(cache.get('file:///a.csv', 4), undefined);
		assert.deepStrictEqual(cache.get('file:///a.csv', 5)?.widths, [9]);
	});

	test('forgets a document, so closing a file does not leak', () => {
		const cache = new ColumnWidthCache();
		cache.set('file:///a.csv', entry);
		cache.forget('file:///a.csv');

		assert.strictEqual(cache.size, 0);
		assert.strictEqual(cache.get('file:///a.csv', 4), undefined);
	});

	test('forgetting a document it does not have is harmless', () => {
		const cache = new ColumnWidthCache();

		cache.forget('file:///never-opened.csv');

		assert.strictEqual(cache.size, 0);
	});
});

suite('Visible range helpers', () => {
	test('gets a buffered body range without including the header line', () => {
		const range = getBufferedBodyLineRange(200, 100, 120, 10, 10);

		assert.deepStrictEqual(range, {
			startLine: 90,
			endLine: 130,
		});
	});

	test('clamps buffered body ranges to document bounds', () => {
		const range = getBufferedBodyLineRange(12, 0, 2, 10, 10);

		assert.deepStrictEqual(range, {
			startLine: 1,
			endLine: 11,
		});
	});

	test('returns no body range for a header-only document', () => {
		const range = getBufferedBodyLineRange(1, 0, 0, 10, 10);

		assert.strictEqual(range, undefined);
	});

	test('maps combined parsed row indexes back to document lines', () => {
		assert.strictEqual(getDocumentLineFromCombinedRowIndex(0, 90), 0);
		assert.strictEqual(getDocumentLineFromCombinedRowIndex(1, 90), 90);
		assert.strictEqual(getDocumentLineFromCombinedRowIndex(3, 90), 92);
	});
});

suite('CSV parser', () => {
	test('gets cell lengths from comma-separated values', async () => {
		const parsed = await parseCSVWithPapa('grant,murphy,1234\nd-train,mochi,1');

		assert.deepStrictEqual(parsed, {
			data: [
				[5, 6, 4],
				[7, 5, 1],
			],
			delimiterLength: 1,
		});
	});

	test('does not split on commas inside quoted cells', async () => {
		const parsed = await parseCSVWithPapa('"hello, friend",x\nshorter,y');

		assert.deepStrictEqual(parsed, {
			data: [
				[15, 1],
				[7, 1],
			],
			delimiterLength: 1,
		});
	});

	test('gets cell lengths from tab-separated values', async () => {
		const parsed = await parseCSVWithPapa('name\tcount\nmochi\t12');

		assert.deepStrictEqual(parsed, {
			data: [
				[4, 5],
				[5, 2],
			],
			delimiterLength: 1,
		});
	});

	test('detects the delimiter on inputs longer than the sample', async () => {
		// The delimiter is guessed from a sample of the first lines, so make
		// sure a file with many more rows than that still lines up, and that
		// every row past the sample still gets its cell lengths.
		const rows = ['name\tcount'];
		for (let i = 0; i < 200; i++) {
			rows.push(`mochi\t${i}`);
		}

		const parsed = await parseCSVWithPapa(rows.join('\n'));

		assert.strictEqual(parsed.delimiterLength, 1);
		assert.strictEqual(parsed.data.length, 201);
		assert.deepStrictEqual(parsed.data[0], [4, 5]);
		// row 199 is "mochi\t198", well past the sampled lines
		assert.deepStrictEqual(parsed.data[199], [5, 3]);
	});

	test('handles rows with different column counts', async () => {
		const parsed = await parseCSVWithPapa('a,b,c\nlonger,row');

		assert.deepStrictEqual(parsed, {
			data: [
				[1, 1, 1],
				[6, 3],
			],
			delimiterLength: 1,
		});
	});
});
