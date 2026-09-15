export interface EpochsSettings {
	/** Vault folder for calendar notes. */
	calendarsFolder: string;
	/** Optional default calendar id for ambiguous parses. */
	defaultCalendarId: string;
}

export const DEFAULT_SETTINGS: EpochsSettings = {
	calendarsFolder: "Epoch Calendars",
	defaultCalendarId: "",
};

export interface MonthDef {
	name: string;
	days: number;
}

export interface WeekDef {
	lengthDays: number;
	weekdays: string[];
}

export interface EraDef {
	id: string;
	name: string;
	startYear: number;
	/** Inclusive end year; omit for open-ended. */
	endYear?: number;
}

export interface LunarDef {
	synodicDays: number;
	phases: string[];
}

export interface YearDef {
	/** Days in a year when months are empty / unused. */
	lengthDays: number;
}

export interface CalendarDef {
	id: string;
	name: string;
	/** Unix ms for fantasy day index 0 (start of year 1, day 1). */
	epochMs: number;
	dayLengthHours: number;
	year: YearDef;
	/** Empty = no months (day-of-year only). */
	months: MonthDef[];
	/** Null = no weeks. */
	weeks: WeekDef | null;
	eras: EraDef[];
	/** Null = no lunar cycle. */
	lunar: LunarDef | null;
	defaultFormat: string;
	/** Source note path. */
	path: string;
}

/** Civil parts in a fantasy calendar. */
export interface CalendarParts {
	year: number;
	/** 1-based month index, or 0 when months disabled. */
	month: number;
	monthName: string;
	/** Day of month (or day of year when no months). */
	day: number;
	/** Absolute day index from calendar epoch (0-based). */
	dayIndex: number;
	weekdayIndex: number;
	weekdayName: string;
	eraId: string;
	eraName: string;
	lunarPhaseIndex: number;
	lunarPhaseName: string;
}

export interface FantasyDateInput {
	calendar: string;
	year: number;
	month?: string | number;
	day: number;
}

export interface DurationPart {
	amount: number;
	unit: string;
}
