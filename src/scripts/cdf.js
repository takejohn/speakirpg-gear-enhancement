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

	let state = new State(0, levelTo);

	// 消費コスト0のときは1の確率で開始時のレベル
	state.set(0, levelFrom, 1.0);
	yield state.levelSum(levelTo);

	for (let cost = 1 ; cost <= maxCost ; cost++) {
		state = transition(state, probabilities);
		yield state.levelSum(levelTo);
	}
}

/**
 * 消費可能コストを1だけ追加した状態を返す。
 * ただし、レベルが levelTo に到達した後はこれ以上強化段階が変化しないものとする。
 * @param {State} oldState
 * @param {ProbabilityCalculator} probabilities
 * @returns {State}
 */
function transition(oldState, probabilities) {
	const levelTo = oldState.levelTo;
	const maxCost = oldState.maxCost + 1;
	const newState = new State(maxCost, levelTo);

	for (let level = 0 ; level <= levelTo ; level++) {
		for (let cost = noTransitionMinCost(maxCost, levelTo, level) ; cost < maxCost ; cost++) {
			// 目標段階へ到達した、またはコストが足りない場合は前の状態を維持
			newState.set(cost, level, oldState.get(cost, level));
		}
		const success = successProbability(oldState, probabilities, maxCost, level);
		const keep = keepProbability(oldState, probabilities, maxCost, level);
		const drop = dropProbability(oldState, probabilities, maxCost, level);
		newState.set(maxCost, level, success + keep + drop);
	}

	return newState;
}

/**
 * 目標段階への到達、またはコスト不足により強化を行わない場合の最小消費済みコストを求める。
 * @param {number} maxCost
 * @param {number} levelTo
 * @param {number} level
 * @returns {number}
 */
function noTransitionMinCost(maxCost, levelTo, level) {
	if (level == levelTo) {
		return 0;
	}
	return Math.max(maxCost - level, 0);
}

/**
 * 下の強化段階から強化に成功する確率
 * @param {State} oldState
 * @param {ProbabilityCalculator} probabilities 
 * @param {number} cost
 * @param {number} level
 * @returns {number}
 */
function successProbability(oldState, probabilities, cost, level) {
	if (level == 0) {
		return 0.0;
	}
	const prevCost = cost - level;
	if (prevCost < 0) {
		return 0.0;
	}
	// コスト消費前に1つ下の強化段階だった確率
	const prevProbability = oldState.get(prevCost, level - 1);
	// コスト消費前に1つ下の強化段階だったとき、下の強化段階から成功する条件付き確率
	const conditionalProbability = probabilities.forLevel(level).success;
	return prevProbability * conditionalProbability;
}

/**
 * 強化に失敗し、同じ強化段階を維持する確率
 * @param {State} oldState
 * @param {ProbabilityCalculator} probabilities 
 * @param {number} cost
 * @param {number} level
 * @returns {number}
 */
function keepProbability(oldState, probabilities, cost, level) {
	if (level + 1 > oldState.levelTo) {
		return 0.0;
	}
	const prevCost = cost - (level + 1);
	if (prevCost < 0) {
		return 0.0;
	}
	// コスト消費前に同じ強化段階だった確率
	const prevProbability = oldState.get(prevCost, level);
	// コスト消費前に同じ強化段階だったとき、強化に失敗して強化段階を維持する条件付き確率
	const conditionalProbability = probabilities.forLevel(level + 1).keep;
	return prevProbability * conditionalProbability;
}

/**
 * 上の強化段階から強化に失敗し、強化段階が下降する確率
 * @param {State} oldState
 * @param {ProbabilityCalculator} probabilities 
 * @param {number} cost
 * @param {number} level
 * @returns {number}
 */
function dropProbability(oldState, probabilities, cost, level) {
	if (level + 2 >= oldState.levelTo) {
		return 0.0;
	}
	const prevCost = cost - (level + 2);
	if (prevCost < 0) {
		return 0.0;
	}
	// コスト消費前に上の強化段階だった確率
	const prevProbability = oldState.get(prevCost, level + 2);
	// コスト消費前に上の強化段階だったとき、強化に失敗して強化段階が下降する条件付き確率
	const conditionalProbability = probabilities.forLevel(level + 2).drop;
	return prevProbability * conditionalProbability;
}
