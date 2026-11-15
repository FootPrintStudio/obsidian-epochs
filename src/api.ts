import { formatDate, formatDurationHuman } from "./format";
import {
	parseFantasyDateObject,
	parseFantasyDateString,
	resolveFantasyMs,
} from "./parse";
import {
	addCalendarDuration,
	durationPartsToMs,
	msToParts,
} from "./time";
import type { CalendarDef, DurationPart } from "./types";

/** Minimal calendar lookup used by the public API (CalendarIndex or test doubles). */
export interface CalendarLookup {
	get(id: string): CalendarDef | null;
	list(): CalendarDef[];
}

/** Replace y/yyyy/d/dd tokens; single-quoted segments are literals (Luxon-style). */
export function applyDurationTokens(format: string, years: number, days: number): string {
	const replaceTokens = (segment: string): string =>
		segment
			.replace(/yyyy/g, String(years).padStart(4, "0"))
			.replace(/y/g, String(years))
			.replace(/dd/g, String(days).padStart(2, "0"))
			.replace(/d/g, String(days));

	let result = "";
	let i = 0;
	while (i < format.length) {
		if (format[i] === "'") {
			i++;
			while (i < format.length) {
				if (format[i] === "'") {
					if (format[i + 1] === "'") {
						result += "'";
						i += 2;
					} else {
						i++;
						break;
					}
				} else {
					result += format[i++];
				}
			}
		} else {
			const nextQuote = format.indexOf("'", i);
			const segment = nextQuote === -1 ? format.slice(i) : format.slice(i, nextQuote);
			result += replaceTokens(segment);
			i = nextQuote === -1 ? format.length : nextQuote;
		}
	}
	return result;
}

/** Public surface consumed by Grimoire (and other plugins). */
export class EpochsApi {
	constructor(private index: CalendarLookup) {}

	getCalendar(id: string): CalendarDef | null {
		return this.index.get(id);
	}

	listCalendars(): CalendarDef[] {
		return this.index.list();
	}

	/**
	 * Parse a fantasy date string or structured object.
	 * Returns Unix ms + calendarId, or null.
	 */
	parseDate(value: unknown): { ms: number; calendarId: string } | null {
		if (typeof value === "string") {
			const input = parseFantasyDateString(value);
			if (!input) return null;
			return resolveFantasyMs((id) => this.index.get(id), input);
		}
		const input = parseFantasyDateObject(value);
		if (!input) return null;
		return resolveFantasyMs((id) => this.index.get(id), input);
	}

	formatDate(ms: number, calendarId: string, format?: string): string {
		const cal = this.index.get(calendarId);
		if (!cal) return "";
		return formatDate(cal, ms, format);
	}

	formatDuration(ms: number, calendarId: string, format?: string): string {
		const cal = this.index.get(calendarId);
		if (!cal) return "";
		if (!format) return formatDurationHuman(cal, ms);
		// Token path: year/day components from fantasy duration length; quotes = literals
		const dayMs = cal.dayLengthHours * 3600 * 1000;
		const yLen =
			cal.months.length > 0
				? cal.months.reduce((s, m) => s + m.days, 0)
				: cal.year.lengthDays;
		const yearMs = yLen * dayMs;
		// Exact fantasy year spans (e.g. Greentide+2y − Greentide) must not floor to 0.
		const years = yearMs > 0 ? Math.floor((Math.abs(ms) + 1e-6) / yearMs) : 0;
		const days = dayMs > 0 ? Math.floor((Math.abs(ms) % yearMs) / dayMs) : 0;
		return applyDurationTokens(format, years, days);
	}

	addDuration(
		ms: number,
		calendarId: string,
		parts: ReadonlyArray<DurationPart>,
		sign: 1 | -1 = 1,
	): number {
		const cal = this.index.get(calendarId);
		if (!cal) return ms;
		return addCalendarDuration(cal, ms, parts, sign);
	}

	durationToMs(calendarId: string, parts: ReadonlyArray<DurationPart>): number {
		const cal = this.index.get(calendarId);
		if (!cal) return 0;
		return durationPartsToMs(cal, parts);
	}

	parts(ms: number, calendarId: string) {
		const cal = this.index.get(calendarId);
		if (!cal) return null;
		return msToParts(cal, ms);
	}
}
