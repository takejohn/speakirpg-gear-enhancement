// @ts-check

/** @import { ResultPoint, SimulationParams } from '../types/simulation.js' */

import { calculateCDFIter } from './cdf.js';

self.addEventListener('message', (ev) => {
	/** @type {SimulationParams} */
	const params = ev.data;

	let cost = 0;
	for (const probability of calculateCDFIter(params.levelFrom, params.levelTo, params.maxCost)) {
		/** @type {ResultPoint} */
		const message = {
			done: false,
			data: { cost, probability },
		};
		self.postMessage(message);
		cost++;
	}

	/** @type {ResultPoint} */
	const message = {
		done: true,
		data: undefined,
	}
	self.postMessage(message);
});
