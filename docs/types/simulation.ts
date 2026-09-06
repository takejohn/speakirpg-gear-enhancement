export type GearType = 'weapon' | 'armor';

export type FormParams = {
	levelFrom: number;
	levelTo: number;
	gearType: GearType;
	maxGold: number;
};

export type SimulationParams = {
	levelFrom: number;
	levelTo: number;
	maxCost: number;
};

export type Probabilities = {
	success: number;
	keep: number;
	drop: number;
};

export type ResultPoint = {
	done: false;
	data: {
		cost: number;
		probability: number;
	}
} | {
	done: true;
	data: undefined;
};
