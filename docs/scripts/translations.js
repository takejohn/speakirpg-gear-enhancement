// @ts-check

/** @import { Language, Translations } from '../types/translations.js' */

/** @type {Translations} */
export const translations = {
	en: {
		simulation_settings: 'Simulation settings',
		level_from: 'Starting enhancement level',
		level_to: 'Target enhancement level',
		gear_type: 'Gear type',
		weapon: 'Weapon',
		armor: 'Armor',
		max_gold: 'Maximum gold to spend',
		calculate: 'Calculate',
		level_reaching_probability: 'Probability of reaching the target level',
		level_reaching_percentile: 'Target level reaching percentiles',
		reaching_probability: 'Probability of reaching',
		required_gold: 'Required gold',
		about_spent_gold_heading: 'About gold costs',
		about_spent_gold_1: 'The gold cost for each enhancement is calculated as 3000 × (enhancement level) G for weapons and 1500 × (enhancement level) G for armor.',
		source: 'Source',
		speakirpg: 'Speaki RPG',
		spent_gold: 'Gold spent',
		calculating: 'Calculating...',
		calculated: 'Calculation completed',
		error_invalid_level: 'The enhancement level must be an integer between 0 and 20',
		error_gold_negative_or_not_integer: 'The maximum gold to spend must be a non-negative integer',
		error_level_to_not_more_than_level_from: 'The target enhancement level must be higher than the starting enhancement level',
	},

	kr: {
		simulation_settings: '시뮬레이션 설정',
		level_from: '시작 강화 단계',
		level_to: '목표 강화 단계',
		gear_type: '장비 종류',
		weapon: '무기',
		armor: '방어구',
		max_gold: '최대 소비 골드',
		calculate: '계산',
		level_reaching_probability: '목표 단계 도달 확률',
		level_reaching_percentile: '목표 단계 도달 백분위',
		reaching_probability: '도달 확률',
		required_gold: '필요 골드',
		about_spent_gold_heading: '소비 골드에 대하여',
		about_spent_gold_1: '강화 시 소비되는 골드는 무기의 경우 3000 × (강화 레벨) G, 방어구의 경우 1500 × (강화 레벨) G로 계산합니다.',
		source: '소스',
		speakirpg: '스피키 키우기',
		spent_gold: '소비 골드',
		calculating: '계산 중...',
		calculated: '계산 완료',
		error_invalid_level: '강화 단계는 0 이상 20 이하의 정수여야 합니다',
		error_gold_negative_or_not_integer: '최대 소비 골드 0 이상의 정수여야 합니다',
		error_level_to_not_more_than_level_from: '목표 강화 단계는 시작 강화 단계보다 커야 합니다',
	},

	ja: {
		simulation_settings: 'シミュレーション設定',
		level_from: '開始時の強化段階',
		level_to: '目標の強化段階',
		gear_type: '装備の種類',
		weapon: '武器',
		armor: '防具',
		max_gold: '最大消費ゴールド',
		calculate: '計算',
		level_reaching_probability: '目標段階到達確率',
		level_reaching_percentile: '目標段階到達パーセンタイル',
		reaching_probability: '到達確率',
		required_gold: '必要ゴールド',
		about_spent_gold_heading: '消費ゴールドについて',
		about_spent_gold_1: '強化時の消費ゴールドは、武器は 3000 × (強化レベル) G、防具は 1500 × (強化レベル) G として計算します。',
		source: 'ソース',
		speakirpg: 'スピキ育成',
		spent_gold: '消費ゴールド',
		calculating: '計算中…',
		calculated: '計算完了',
		error_invalid_level: '強化段階は0以上20以下の整数である必要があります',
		error_gold_negative_or_not_integer: '最大消費ゴールドは0以上の整数である必要があります',
		error_level_to_not_more_than_level_from: '目標の強化段階は開始時の強化段階より大きい必要があります',
	},
};

/**
 * @param {string} lang
 * @returns {Language}
 */
export function validateLanguage(lang) {
	if (!Object.hasOwn(translations, lang)) {
		throw new TypeError(`Unknown language: ${lang}`);
	}
	return /** @type {Language} */ (lang);
}

/**
 * @param {Language} lang
 * @param {string} key 
 * @returns {string}
 * @throws key が存在しないキーである場合は TypeError。 
 */
export function translate(key, lang) {
	validateLanguage(lang);
	const translation = translations[lang];
	if (Object.hasOwn(translation, key)) {
		return /** @type {Record<string, string>} */ (translation)[key];
	}
	throw new TypeError(`Unknown translation key: ${key}`);
}
