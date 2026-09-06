// @ts-check

/// <reference path="../../global.d.ts" />

import { getUnitGold } from './cost.js';
/** @import { GearType, FormParams, SimulationParams, ResultPoint } from '../types/simulation.js'; */
/** @import { Chart } from 'chart.js' */

const buttonCalculate = /** @type {HTMLButtonElement} */ (document.getElementById('button-calculate'));
const formParams = /** @type {HTMLFormElement} */ (document.getElementById('form-params'));
const cdfChart = /** @type {HTMLCanvasElement} */ (document.getElementById('cdf-chart'));

/** @type {Worker | null} */
let worker = null;

/** @type {Chart | null} */
let chart = null;

function updateChart() {
	const params = processParams(new FormData(formParams));
	if (params == null) {
		return;
	}
	const unitGold = getUnitGold(params.gearType)
	const maxCost = Math.floor(params.maxGold / unitGold);

	if (worker != null) {
		worker.terminate();
	}
	worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });

	if (chart != null) {
		chart.destroy();
	}
	chart = new window.Chart(
		cdfChart,
		{
			type: 'line',
			data: {
				labels: [],
				datasets: [{
					pointRadius: 0,
					data: [],
				}],
			},
			options: {
				animation: false,
				plugins: {
					legend: {
						display: false,
					},
				},
				scales: {
					x: {
						type: 'linear',
						min: 0,
						max: params.maxGold
					},
					y: { min: 0, max: 100 },
				}
			},
		},
	);

	/** @type {SimulationParams} */
	const simulationParams = {
		levelFrom: params.levelFrom,
		levelTo: params.levelTo,
		maxCost,
	};
	worker.postMessage(simulationParams);

	let done = false;
	worker.addEventListener('message', (ev) => {
		if (chart == null) {
			return;
		}
		/** @type {ResultPoint} */
		const data = ev.data;
		done = data.done;
		if (data.done) {
			return;
		}
		const { cost, probability } = data.data;
		/** @type {number[]} */ (chart.data.labels).push(cost * unitGold);
		chart.data.datasets[0].data.push(probability * 100); // 百分率に変換
	});

	worker.addEventListener('error', (ev) => {
		console.error('Worker error:', ev.message, ev.filename, ev.lineno);
	});

	function animationTick() {
		if (chart == null) {
			return;
		}
		chart.update();
		if (!done) {
			window.requestAnimationFrame(animationTick);
		}
	}
	animationTick();
}

/**
 * @param {FormData} formData
 * @returns {FormParams | undefined}
 */
function processParams(formData) {
	const params = {
		levelFrom: Number(formData.get('level-from')),
		levelTo: Number(formData.get('level-to')),
		gearType: /** @type {GearType} */ (formData.get('gear-type')),
		maxGold: Number(formData.get('max-gold')),
	}

	if (params.levelTo <= params.levelFrom) {
		window.alert('目標の強化段階は開始時の強化段階より大きい必要があります');
		return;
	}

	return params;
}

buttonCalculate.addEventListener('click', () => {
	updateChart();
});
