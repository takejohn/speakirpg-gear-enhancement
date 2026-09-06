// @ts-check

/// <reference path="../../global.d.ts" />

import { getUnitGold } from './cost.js';
import { translate, validateLanguage } from './translations.js';
/** @import { GearType, FormParams, SimulationParams, ResultPoint } from '../types/simulation.js'; */
/** @import { Chart } from 'chart.js' */
/** @import { Language } from '../types/translations.js' */

const buttonCalculate = /** @type {HTMLButtonElement} */ (document.getElementById('button-calculate'));
const formParams = /** @type {HTMLFormElement} */ (document.getElementById('form-params'));
const cdfChart = /** @type {HTMLCanvasElement} */ (document.getElementById('cdf-chart'));
const tbodyPercentiles = /** @type {HTMLTableSectionElement} */ (document.getElementById('tbody-percentiles'));
const pStatus = /** @type {HTMLParagraphElement} */ (document.getElementById('p-status'));
const selectLang = /** @type {HTMLSelectElement} */ (document.getElementById('select-lang'));

/** @type {Worker | null} */
let worker = null;

/** @type {Chart | null} */
let chart = null;

/** @type {Language} */
let lang = validateLanguage(selectLang.value);

const percentiles = [50, 75, 90, 95, 99];

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
						max: params.maxGold,
						title: { display: true, text: autoTranslate('spent_gold') },
					},
					y: {
						min: 0,
						max: 100,
						title: { display: true, text: autoTranslate('reaching_probability') },
					},
				}
			},
		},
	);

	clearPercentileTable();
	let reachedPercentile = Number.NEGATIVE_INFINITY;

	/** @type {SimulationParams} */
	const simulationParams = {
		levelFrom: params.levelFrom,
		levelTo: params.levelTo,
		maxCost,
	};
	worker.postMessage(simulationParams);
	pStatus.textContent = autoTranslate('calculating');

	let done = false;
	worker.addEventListener('message', (ev) => {
		if (chart == null) {
			return;
		}
		/** @type {ResultPoint} */
		const data = ev.data;
		done = data.done;
		if (data.done) {
			pStatus.textContent = autoTranslate('calculated');
			return;
		}
		const { cost, probability } = data.data;
		const gold = cost * unitGold;
		const probabilityPercent = probability * 100;

		/** @type {number[]} */ (chart.data.labels).push(gold);
		chart.data.datasets[0].data.push(probabilityPercent);

		for (const [i, percentile] of percentiles.entries()) {
			if (reachedPercentile >= percentile || probabilityPercent < percentile) {
				continue;
			}
			reachedPercentile = percentile;
			appendPercentileTableRow(percentile, gold);
		}
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

	if (params.levelFrom < 0 || params.levelTo < 0 || !Number.isSafeInteger(params.levelFrom) || !Number.isSafeInteger(params.levelTo)) {
		window.alert(autoTranslate('error_level_negative_or_not_integer'));
		return;
	}

	if (params.maxGold < 0 || !Number.isSafeInteger(params.maxGold)) {
		window.alert(autoTranslate('error_gold_negative_or_not_integer'));
		return;
	}

	if (params.levelTo <= params.levelFrom) {
		window.alert(autoTranslate('error_level_to_not_more_than_level_from'));
		return;
	}

	return params;
}

function clearPercentileTable() {
	tbodyPercentiles.innerHTML = '';
}

/**
 * @param {number} percentile
 * @param {number} gold
 */
function appendPercentileTableRow(percentile, gold) {
	const row = document.createElement('tr');

	const percentileCell = document.createElement('td');
	percentileCell.textContent = `${percentile}%`;
	row.appendChild(percentileCell);

	const goldCell = document.createElement('td');
	goldCell.textContent = `${gold.toLocaleString()}\xA0G`;
	row.appendChild(goldCell);

	tbodyPercentiles.appendChild(row);
}

function updateLanguage() {
	lang = validateLanguage(selectLang.value);
	document.documentElement.lang = lang;
	const elements = document.querySelectorAll('[data-i18n]')
	elements.forEach((el) => {
		const key = el.getAttribute('data-i18n');
		if (key != null) {
			el.textContent = translate(key, lang);
		}
	});
}

/**
 * @param {string} key
 * @returns {string}
 * @throws key が存在しないキーである場合は TypeError。 
 */
function autoTranslate(key) {
	return translate(key, lang);
}

buttonCalculate.addEventListener('click', () => {
	updateChart();
});

selectLang.addEventListener('change', () => {
	updateLanguage();
});

updateLanguage();
