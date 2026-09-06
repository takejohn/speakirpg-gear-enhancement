// @ts-check

export class Table {
	/**
	 * @type {Float64Array}
	 */
	#data;

	/**
	 * @type {number}
	 */
	#rows;

	/**
	 * @type {number}
	 */
	#columns;

	/**
	 * @param {number} rows
	 * @param {number} columns
	 */
	constructor(rows, columns) {
		validateLength(rows);
		validateLength(columns);
		this.#data = new Float64Array(rows * columns);
		this.#rows = rows;
		this.#columns = columns;
	}

	/**
	 * @returns {number}
	 */
	get rows() {
		return this.#rows;
	}

	/**
	 * @returns {number}
	 */
	get columns() {
		return this.#columns;
	}

	/**
	 * @param {number} row
	 * @param {number} column
	 * @returns {number}
	 */
	get(row, column) {
		return this.#data[this.#toIndex(row, column)];
	}

	/**
	 * @param {number} row
	 * @param {number} column
	 * @param {number} value
	 * @returns {void}
	 */
	set(row, column, value) {
		this.#data[this.#toIndex(row, column)] = value;
	}

	/**
	 * @param {number} row
	 * @param {number} column
	 * @param {(oldValue: number) => number} func
	 * @returns {void}
	 */
	update(row, column, func) {
		const index = this.#toIndex(row, column);
		const oldValue = this.#data[index];
		const newValue = func(oldValue);
		this.#data[index] = newValue;
	}

	/**
	 * @param {number} row
	 * @param {number} column 
	 * @returns {number}
	 */
	#toIndex(row, column) {
		validateIndex(row, this.#rows);
		validateIndex(column, this.#columns);
		return this.#columns * row + column;
	}
}

/**
 * @param {number} length
 * @returns {void}
 */
function validateLength(length) {
	if (length < 0) {
		throw new RangeError(`Invalid length: ${length}`)
	}
}

/**
 * @param {number} value
 * @param {number} length
 */
function validateIndex(value, length) {
	if (value < 0 || value >= length) {
		throw new RangeError(`Index ${value} out of bounds [0, ${length})`);
	}
}
