// @ts-check

/** @import { GearType } from '../types/simulation.js'; */

/**
 * @param {GearType} gearType
 * @returns {number}
 */
export function getUnitGold(gearType) {
	switch (gearType) {
		case 'weapon': {
			return 3000;
		}
		case 'armor': {
			return 1500;
		}
	}
}
