// @ts-check

/** @import { Probabilities } from '../types/simulation.js'; */

/**
 * @param {number} level
 * @returns {Probabilities}
 */
export function calculateProbabilities(level) {
	if (level < 1) {
		throw new RangeError(`Invalid level: ${level}`);
	}

	const successPercentage = Math.round(88 * Math.pow(0.91, level - 1));
	const failurePercentage = 100 - successPercentage;
	if (level == 1) {
		return {
			success: successPercentage / 100,
			keep: failurePercentage / 100,
			drop: 0,
		};
	} else {
		const keepPercentage = Math.round(failurePercentage * 0.55);
		const dropPercentage = failurePercentage - keepPercentage;
		return {
			success: successPercentage / 100,
			keep: keepPercentage / 100,
			drop: dropPercentage / 100,
		};
	}
}

export class ProbabilityCalculator {
	/**
	 * @type {Map<number, Probabilities>}
	 */
	#cache;

	constructor() {
		this.#cache = new Map();
	}

	/**
	 * @param {number} level
	 * @returns {Probabilities}
	 */
	forLevel(level) {
		const cachedValue = this.#cache.get(level);
		if (cachedValue != null) {
			return cachedValue;
		}
		const result = calculateProbabilities(level);
		this.#cache.set(level, result);
		return result;
	}
}
