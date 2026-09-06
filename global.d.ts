import * as ChartJS from 'chart.js';

declare global {
	interface Window {
		Chart: typeof ChartJS.Chart;
	}
}
