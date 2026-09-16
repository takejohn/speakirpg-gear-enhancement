// @ts-check

/** @import { Probabilities } from '../types/simulation.js'; */

const probabilities = [
	{ success: .88, keep: .12, drop: .00 },
	{ success: .80, keep: .11, drop: .09 },
	{ success: .73, keep: .15, drop: .12 },
	{ success: .66, keep: .19, drop: .15 },
	{ success: .60, keep: .22, drop: .18 },
	{ success: .55, keep: .25, drop: .20 },
	{ success: .50, keep: .28, drop: .22 },
	{ success: .45, keep: .30, drop: .25 },
	{ success: .41, keep: .32, drop: .27 },
	{ success: .38, keep: .34, drop: .28 },
	{ success: .34, keep: .36, drop: .30 },
	{ success: .31, keep: .38, drop: .31 },
	{ success: .28, keep: .40, drop: .32 },
	{ success: .26, keep: .41, drop: .33 },
	{ success: .23, keep: .42, drop: .35 },
	{ success: .21, keep: .43, drop: .36 },
	{ success: .19, keep: .45, drop: .36 },
	{ success: .18, keep: .45, drop: .37 },
	{ success: .16, keep: .46, drop: .38 },
	{ success: .15, keep: .47, drop: .38 },
]

/**
 * @param {number} level
 * @returns {Probabilities}
 */
export function getProbabilities(level) {
	if (level < 1 || level > 20) {
		throw new RangeError(`Invalid level: ${level}`);
	}

	return probabilities[level - 1];
}
