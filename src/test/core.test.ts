/// <reference types="mocha" />

import * as assert from 'assert';

import { parseCSVWithPapa } from '../csvParser';
import {
	getBufferedBodyLineRange,
	getDocumentLineFromCombinedRowIndex,
} from '../helpers/getBufferedBodyLineRange';
import { getHintAndCurrentPosfromCol } from '../helpers/getHintAndCurrentPosfromCol';
import { getHintsFromCellLengths } from '../helpers/getHintsFromCellLengths';
import { getMaxColumnWidthsFromCellLengths } from '../helpers/getMaxColumnWidthsFromCellLengths';

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
