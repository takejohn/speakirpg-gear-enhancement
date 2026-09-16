export type TranslationKey =
	| 'simulation_settings'
	| 'level_from'
	| 'level_to'
	| 'gear_type'
	| 'weapon'
	| 'armor'
	| 'max_gold'
	| 'calculate'
	| 'level_reaching_probability'
	| 'level_reaching_percentile'
	| 'reaching_probability'
	| 'required_gold'
	| 'about_spent_gold_heading'
	| 'about_spent_gold_1'
	| 'source'
	| 'speakirpg'
	| 'spent_gold'
	| 'calculating'
	| 'calculated'
	| 'error_invalid_level'
	| 'error_gold_negative_or_not_integer'
	| 'error_level_to_not_more_than_level_from';

type Translation = {
	[K in TranslationKey]: string;
};

export type Language = 'en' | 'kr' | 'ja';

export type Translations = {
	[K in Language]: Translation;
};
