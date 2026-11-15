import type { CalendarDef, CalendarParts } from "./types";
import { msToParts } from "./time";

function pad(n: number, width: number): string {
	return String(Math.trunc(n)).padStart(width, "0");
}

function ordinalSuffix(n: number): string {
	const v = Math.abs(Math.trunc(n)) % 100;
	if (v >= 11 && v <= 13) return "th";
	switch (v % 10) {
		case 1:
			return "st";
		case 2:
			return "nd";
		case 3:
			return "rd";
		default:
			return "th";
	}
}

/** Format calendar parts with tokens similar to Luxon/Grimoire dateformat. */
export function formatParts(parts: CalendarParts, format: string): string {
	const tokenRe =
		/EEEE|EEE|MMMM|MMM|yyyy|yy|GGGG|GGG|LL|L|yO|dO|y|M|d|G|E/g;

	const replaceTokens = (segment: string): string =>
		segment.replace(tokenRe, (token) => {
			switch (token) {
				case "yyyy":
					return pad(parts.year, 4);
				case "yy":
					return pad(parts.year % 100, 2);
				case "yO":
					return `${parts.year}${ordinalSuffix(parts.year)}`;
				case "y":
					return String(parts.year);
				case "MMMM":
					return parts.monthName;
				case "MMM":
					return parts.monthName ? parts.monthName.slice(0, 3) : "";
				case "M":
					return parts.month > 0 ? String(parts.month) : "";
				case "dd":
					return pad(parts.day, 2);
				case "dO":
					return `${parts.day}${ordinalSuffix(parts.day)}`;
				case "d":
					return String(parts.day);
				case "EEEE":
					return parts.weekdayName;
				case "EEE":
					return parts.weekdayName ? parts.weekdayName.slice(0, 3) : "";
				case "E":
					return parts.weekdayName;
				case "GGGG":
				case "GGG":
				case "G":
					return parts.eraName;
				case "LL":
					return parts.lunarPhaseName;
				case "L":
					return parts.lunarPhaseName;
				default:
					return token;
			}
		});

	// Support dd via a second pass — keep tokenRe ordered longest-first where needed
	const withDd = format.replace(/dd/g, "\0DD\0");
	let result = "";
	let i = 0;
	while (i < withDd.length) {
		if (withDd[i] === "'") {
			i++;
			while (i < withDd.length) {
				if (withDd[i] === "'") {
					if (withDd[i + 1] === "'") {
						result += "'";
						i += 2;
					} else {
						i++;
						break;
					}
				} else {
					result += withDd[i++];
				}
			}
		} else {
			const nextQuote = withDd.indexOf("'", i);
			const segment = nextQuote === -1 ? withDd.slice(i) : withDd.slice(i, nextQuote);
			result += replaceTokens(segment).replace(/\0DD\0/g, pad(parts.day, 2));
			i = nextQuote === -1 ? withDd.length : nextQuote;
		}
	}
	return result;
}

export function formatDate(cal: CalendarDef, ms: number, format?: string): string {
	const parts = msToParts(cal, ms);
	const fmt = (format && format.trim()) || cal.defaultFormat;
	return formatParts(parts, fmt);
}

/** Human duration using fantasy calendar units. */
export function formatDurationHuman(
	cal: CalendarDef,
	ms: number,
): string {
	const dayMs = cal.dayLengthHours * 3600 * 1000;
	const yLen =
		cal.months.length > 0
			? cal.months.reduce((s, m) => s + m.days, 0)
			: cal.year.lengthDays;
	let remaining = Math.abs(ms);
	const years = Math.floor(remaining / (yLen * dayMs));
	remaining -= years * yLen * dayMs;
	const days = Math.floor(remaining / dayMs);
	remaining -= days * dayMs;
	const hours = Math.floor(remaining / (3600 * 1000));
	const parts: string[] = [];
	if (years) parts.push(`${years} year${years === 1 ? "" : "s"}`);
	if (days) parts.push(`${days} day${days === 1 ? "" : "s"}`);
	if (hours) parts.push(`${hours} hour${hours === 1 ? "" : "s"}`);
	if (parts.length === 0) return "0 days";
	return parts.join(", ");
}
