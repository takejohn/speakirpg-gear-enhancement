import { describe } from 'vitest';
import { calculateCDF } from '../src/scripts/cdf.js';
import { expect, test } from 'vitest';

describe('calculateCDF', () => {
	test('attempt once from 0', () => {
		const result = calculateCDF(0, 1, 1);
		expect(result).toStrictEqual([
			{ cost: 0, probability: 0.0 },
			{ cost: 1, probability: 0.88 },
		]);
	});

	test('attempt twice from 0', () => {
		const result = calculateCDF(0, 1, 2);
		expect(result).toStrictEqual([
			{ cost: 0, probability: 0.0 },
			{ cost: 1, probability: 0.88 },
			{ cost: 2, probability: 0.9856 },
		]);
	});

	test('attempt 3 times from 0', () => {
		const result = calculateCDF(0, 1, 3);
		expect(result).toStrictEqual([
			{ cost: 0, probability: 0.0 },
			{ cost: 1, probability: 0.88 },
			{ cost: 2, probability: 0.9856 },
			{ cost: 3, probability: 0.998272 },
		]);
	});

	test('attempt once from 1', () => {
		const result = calculateCDF(1, 2, 2);
		expect(result).toStrictEqual([
			{ cost: 0, probability: 0.0 },
			{ cost: 1, probability: 0.0 },
			{ cost: 2, probability: 0.80 },
		]);
	});
});
