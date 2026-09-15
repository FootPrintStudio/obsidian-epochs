import type { CalendarDef, FantasyDateInput } from "./types";
import { fantasyInputToMs } from "./time";

/** `aether:312-Greentide-4` or `aether:312-4` (no months). */
const STRING_RE =
	/^([A-Za-z][\w-]*)\s*:\s*(-?\d+)\s*(?:-([A-Za-z][\w\s]*?))?\s*-(\d+)\s*$/;

export function parseFantasyDateString(raw: string): FantasyDateInput | null {
	const text = raw.trim();
	const m = STRING_RE.exec(text);
	if (!m) return null;
	const calendar = m[1]!;
	const year = Number(m[2]);
	const mid = m[3]?.trim();
	const day = Number(m[4]);
	if (!Number.isFinite(year) || !Number.isFinite(day)) return null;
	if (mid && !/^\d+$/.test(mid)) {
		return { calendar, year, month: mid, day };
	}
	if (mid && /^\d+$/.test(mid)) {
		return { calendar, year, month: Number(mid), day };
	}
	return { calendar, year, day };
}

export function parseFantasyDateObject(value: unknown): FantasyDateInput | null {
	if (!value || typeof value !== "object" || Array.isArray(value)) return null;
	const rec = value as Record<string, unknown>;
	const calendar = String(rec.calendar ?? rec.cal ?? "").trim();
	const year = Number(rec.year ?? rec.y);
	const day = Number(rec.day ?? rec.d);
	if (!calendar || !Number.isFinite(year) || !Number.isFinite(day)) return null;
	const month = rec.month ?? rec.m;
	const input: FantasyDateInput = { calendar, year, day };
	if (month !== undefined && month !== null && month !== "") {
		input.month = typeof month === "number" ? month : String(month);
	}
	return input;
}

export function resolveFantasyMs(
	getCalendar: (id: string) => CalendarDef | null,
	input: FantasyDateInput,
): { ms: number; calendarId: string } | null {
	const cal = getCalendar(input.calendar);
	if (!cal) return null;
	const ms = fantasyInputToMs(cal, input);
	if (ms === null) return null;
	return { ms, calendarId: cal.id };
}
