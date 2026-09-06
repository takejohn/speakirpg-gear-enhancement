// @ts-check

import { ProbabilityCalculator } from './probabilities.js';
import { Table } from './table.js';

class State {
	/** @type {number} */
	#maxCost;

	/** @type {number} */
	#levelTo;

	/**
	 * m行n列目の値: 消費済みコスト m、レベル n である確率。
	 * テーブルの要素を全て足すと 1.0 になる。
	 * @type {Table}
	 */
	#table;

	/**
	 * @param {number} maxCost
	 * @param {number} levelTo
	 */
	constructor(maxCost, levelTo) {
		this.#maxCost = maxCost;
		this.#levelTo = levelTo;
		this.#table = new Table(maxCost + 1, levelTo + 1);
	}

	/**
	 * @param {number} cost
	 * @param {number} level
	 * @returns {number}
	 */
	get(cost, level) {
		return this.#table.get(cost, level);
	}

	/**
	 * @param {number} cost
	 * @param {number} level
	 * @param {number} probability
	 * @returns {void}
	 */
	set(cost, level, probability) {
		this.#table.set(cost, level, probability);
	}

	/**
	 * @param {number} cost
	 * @param {number} level
	 * @param {(oldProbability: number) => number} func
	 * @returns {void}
	 */
	update(cost, level, func) {
		this.#table.update(cost, level, func);
	}

	/**
	 * @returns {number}
	 */
	get maxCost() {
		return this.#maxCost;
	}

	/**
	 * @returns {number}
	 */
	get levelTo() {
		return this.#levelTo;
	}

	/**
	 * @param {number} level
	 * @returns {number}
	 */
	levelSum(level) {
		let result = 0.0;
		const maxCost = this.maxCost;
		for (let cost = 0 ; cost <= maxCost ; cost++) {
			result += this.get(cost, level);
		}
		return result;
	}

	sum() {
		let result = 0.0;
		const levelTo = this.levelTo;
		const maxCost = this.maxCost;
		for (let cost = 0 ; cost <= maxCost ; cost++) {
			for (let level = 0 ; level <= levelTo ; level++) {
				result += this.get(cost, level);
			}
		}
		return result;
	}

	toString() {
		return `State { maxCost: ${this.maxCost}, levelTo: ${this.levelTo}, table: ${this.#table} }`
	}
}

/**
 * @param {number} levelFrom
 * @param {number} levelTo
 * @param {number} maxCost
 * @returns {{ cost: number, probability: number }[]}
 */
export function calculateCDF(levelFrom, levelTo, maxCost) {
	const iter = calculateCDFIter(levelFrom, levelTo, maxCost);

	/** @type {{ cost: number, probability: number }[]} */
	const result = [];

	let cost = 0;
	for (const probability of iter) {
		result.push({ cost, probability });
		cost++;
	}

	return result;
}

/**
 * @param {number} levelFrom
 * @param {number} levelTo
 * @param {number} maxCost
 * @returns {Generator<number, void, unknown>}
 */
export function* calculateCDFIter(levelFrom, levelTo, maxCost) {
	const probabilities = new ProbabilityCalculator();

	let state = new State(maxCost, levelTo);

	// 消費コスト0のときは1の確率で開始時のレベル
	state.set(0, levelFrom, 1.0);
	yield state.levelSum(levelTo);

	for (let cost = 1 ; cost <= maxCost ; cost++) {
		transition(state, probabilities, cost);
		console.log(`cost = ${cost}, state.sum() = ${state.sum()}`);
		yield state.levelSum(levelTo);
	}
}

/**
 * 消費可能コストを追加した状態に更新する。
 * ただし、レベルが levelTo に到達した後はこれ以上強化段階が変化しないものとする。
 * @param {State} state
 * @param {ProbabilityCalculator} probabilities
 * @param {number} currentCost
 */
function transition(state, probabilities, currentCost) {
	const levelTo = state.levelTo;

	for (let level = 0 ; level < levelTo ; level++) {
		const nextLevel = level + 1;
		const prevCost = currentCost - nextLevel;
		if (prevCost < 0) {
			continue;
		}
		const upgradeProbabilities = probabilities.forLevel(nextLevel);
		const prevProbability = state.get(prevCost, level);
		state.set(prevCost, level, 0);
		// 成功確率
		state.update(currentCost, nextLevel, (x) => x + prevProbability * upgradeProbabilities.success);
		// 維持確率
		state.update(currentCost, level, (x) => x + prevProbability * upgradeProbabilities.keep);
		if (level > 0) {
			// 下降確率
			state.update(currentCost, level - 1, (x) => x + prevProbability * upgradeProbabilities.drop);
		}
	}
}
