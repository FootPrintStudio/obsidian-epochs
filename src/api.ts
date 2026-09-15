import type { CalendarIndex } from "./index";
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

/** Public surface consumed by Grimoire (and other plugins). */
export class EpochsApi {
	constructor(private index: CalendarIndex) {}

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
		// Token path: reuse dateformat-style year/day components from duration length
		const dayMs = cal.dayLengthHours * 3600 * 1000;
		const yLen =
			cal.months.length > 0
				? cal.months.reduce((s, m) => s + m.days, 0)
				: cal.year.lengthDays;
		const years = Math.floor(Math.abs(ms) / (yLen * dayMs));
		const days = Math.floor((Math.abs(ms) % (yLen * dayMs)) / dayMs);
		return format
			.replace(/yyyy/g, String(years).padStart(4, "0"))
			.replace(/y/g, String(years))
			.replace(/dd/g, String(days).padStart(2, "0"))
			.replace(/d/g, String(days));
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
