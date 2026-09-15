import type { CalendarDef, CalendarParts, DurationPart, FantasyDateInput } from "./types";

export function dayLengthMs(cal: CalendarDef): number {
	return cal.dayLengthHours * 60 * 60 * 1000;
}

export function yearLengthDays(cal: CalendarDef): number {
	if (cal.months.length > 0) {
		return cal.months.reduce((s, m) => s + m.days, 0);
	}
	return cal.year.lengthDays;
}

function findMonthIndex(cal: CalendarDef, month: string | number | undefined): number {
	if (cal.months.length === 0) return 0;
	if (month === undefined || month === null || month === "") return 1;
	if (typeof month === "number") {
		const n = Math.trunc(month);
		if (n >= 1 && n <= cal.months.length) return n;
		return -1;
	}
	const lower = String(month).trim().toLowerCase();
	const idx = cal.months.findIndex((m) => m.name.toLowerCase() === lower);
	return idx >= 0 ? idx + 1 : -1;
}

/** Day index (0-based) from epoch for year/month/day (1-based year & day). */
export function partsToDayIndex(cal: CalendarDef, input: FantasyDateInput): number | null {
	const year = Math.trunc(input.year);
	const day = Math.trunc(input.day);
	if (!Number.isFinite(year) || !Number.isFinite(day) || day < 1) return null;

	const yLen = yearLengthDays(cal);
	let dayOfYear = day;

	if (cal.months.length > 0) {
		const mi = findMonthIndex(cal, input.month);
		if (mi < 1) return null;
		const month = cal.months[mi - 1]!;
		if (day > month.days) return null;
		dayOfYear = day;
		for (let i = 0; i < mi - 1; i++) dayOfYear += cal.months[i]!.days;
	} else if (day > yLen) {
		return null;
	}

	// Year 1, day 1 → dayIndex 0
	return (year - 1) * yLen + (dayOfYear - 1);
}

export function dayIndexToMs(cal: CalendarDef, dayIndex: number): number {
	return cal.epochMs + dayIndex * dayLengthMs(cal);
}

export function msToDayIndex(cal: CalendarDef, ms: number): number {
	const dMs = dayLengthMs(cal);
	return Math.floor((ms - cal.epochMs) / dMs);
}

export function resolveEra(cal: CalendarDef, year: number): { id: string; name: string } {
	for (const era of cal.eras) {
		const end = era.endYear ?? Number.POSITIVE_INFINITY;
		if (year >= era.startYear && year <= end) {
			return { id: era.id, name: era.name };
		}
	}
	return { id: "", name: "" };
}

export function resolveWeekday(cal: CalendarDef, dayIndex: number): { index: number; name: string } {
	if (!cal.weeks) return { index: 0, name: "" };
	const len = cal.weeks.lengthDays;
	const index = ((dayIndex % len) + len) % len;
	return { index, name: cal.weeks.weekdays[index] ?? "" };
}

export function resolveLunar(cal: CalendarDef, dayIndex: number): { index: number; name: string } {
	if (!cal.lunar) return { index: 0, name: "" };
	const syn = cal.lunar.synodicDays;
	const phases = cal.lunar.phases;
	const dayInCycle = ((dayIndex % syn) + syn) % syn;
	const index = Math.min(
		phases.length - 1,
		Math.floor((dayInCycle / syn) * phases.length),
	);
	return { index, name: phases[index] ?? "" };
}

export function dayIndexToParts(cal: CalendarDef, dayIndex: number): CalendarParts {
	const yLen = yearLengthDays(cal);
	const year = Math.floor(dayIndex / yLen) + 1;
	let dayOfYear = (dayIndex % yLen) + 1;
	if (dayOfYear <= 0) dayOfYear += yLen;

	let month = 0;
	let monthName = "";
	let day = dayOfYear;

	if (cal.months.length > 0) {
		let remaining = dayOfYear;
		for (let i = 0; i < cal.months.length; i++) {
			const m = cal.months[i]!;
			if (remaining <= m.days) {
				month = i + 1;
				monthName = m.name;
				day = remaining;
				break;
			}
			remaining -= m.days;
		}
	}

	const era = resolveEra(cal, year);
	const weekday = resolveWeekday(cal, dayIndex);
	const lunar = resolveLunar(cal, dayIndex);

	return {
		year,
		month,
		monthName,
		day,
		dayIndex,
		weekdayIndex: weekday.index,
		weekdayName: weekday.name,
		eraId: era.id,
		eraName: era.name,
		lunarPhaseIndex: lunar.index,
		lunarPhaseName: lunar.name,
	};
}

export function fantasyInputToMs(cal: CalendarDef, input: FantasyDateInput): number | null {
	const dayIndex = partsToDayIndex(cal, input);
	if (dayIndex === null) return null;
	return dayIndexToMs(cal, dayIndex);
}

export function msToParts(cal: CalendarDef, ms: number): CalendarParts {
	return dayIndexToParts(cal, msToDayIndex(cal, ms));
}

/**
 * Add calendar-unit duration in fantasy space, preserving day-of-month when possible.
 */
export function addCalendarDuration(
	cal: CalendarDef,
	ms: number,
	parts: ReadonlyArray<DurationPart>,
	sign: 1 | -1,
): number {
	let dayIndex = msToDayIndex(cal, ms);
	const yLen = yearLengthDays(cal);

	for (const part of parts) {
		const amount = part.amount * sign;
		const unit = part.unit.toLowerCase().replace(/s$/, "");
		if (unit === "year" || unit === "y") {
			dayIndex += amount * yLen;
		} else if (unit === "month" || unit === "m") {
			if (cal.months.length === 0) {
				dayIndex += amount * Math.max(1, Math.floor(yLen / 12));
			} else {
				const p = dayIndexToParts(cal, dayIndex);
				let monthAbs = (p.year - 1) * cal.months.length + (p.month - 1) + amount;
				let year = Math.floor(monthAbs / cal.months.length) + 1;
				let month = (monthAbs % cal.months.length) + 1;
				if (month < 1) {
					month += cal.months.length;
					year -= 1;
				}
				const maxDay = cal.months[month - 1]!.days;
				const day = Math.min(p.day, maxDay);
				const next = partsToDayIndex(cal, {
					calendar: cal.id,
					year,
					month,
					day,
				});
				if (next !== null) dayIndex = next;
			}
		} else if (unit === "week" || unit === "w") {
			const len = cal.weeks?.lengthDays ?? 7;
			dayIndex += amount * len;
		} else if (unit === "day" || unit === "d") {
			dayIndex += amount;
		} else {
			// fall back: treat as Earth-like via ms on remaining units handled by caller
			const hours =
				unit === "hour" || unit === "h"
					? amount
					: unit === "minute"
						? amount / 60
						: unit === "second"
							? amount / 3600
							: 0;
			dayIndex += (hours * 3600 * 1000) / dayLengthMs(cal);
		}
	}

	return dayIndexToMs(cal, Math.trunc(dayIndex));
}

/** Approximate duration length in ms using this calendar's day/year lengths. */
export function durationPartsToMs(cal: CalendarDef, parts: ReadonlyArray<DurationPart>): number {
	const dMs = dayLengthMs(cal);
	const yLen = yearLengthDays(cal);
	let ms = 0;
	for (const part of parts) {
		const amount = part.amount;
		const unit = part.unit.toLowerCase().replace(/s$/, "");
		if (unit === "year" || unit === "y") ms += amount * yLen * dMs;
		else if (unit === "month" || unit === "m") {
			const monthDays =
				cal.months.length > 0
					? yLen / cal.months.length
					: Math.max(1, Math.floor(yLen / 12));
			ms += amount * monthDays * dMs;
		} else if (unit === "week" || unit === "w") {
			ms += amount * (cal.weeks?.lengthDays ?? 7) * dMs;
		} else if (unit === "day" || unit === "d") ms += amount * dMs;
		else if (unit === "hour" || unit === "h") ms += amount * 3600 * 1000;
		else if (unit === "minute") ms += amount * 60 * 1000;
		else if (unit === "second") ms += amount * 1000;
	}
	return ms;
}
