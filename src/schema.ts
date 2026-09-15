import type {
	CalendarDef,
	EraDef,
	LunarDef,
	MonthDef,
	WeekDef,
	YearDef,
} from "./types";

export interface ParseCalendarResult {
	calendar: CalendarDef | null;
	errors: string[];
}

function asRecord(value: unknown): Record<string, unknown> | null {
	if (value && typeof value === "object" && !Array.isArray(value)) {
		return value as Record<string, unknown>;
	}
	return null;
}

function slugify(name: string): string {
	return name
		.trim()
		.toLowerCase()
		.replace(/[^\p{L}\p{N}]+/gu, "-")
		.replace(/^-+|-+$/g, "");
}

export function slugFromName(name: string): string {
	return slugify(name) || "calendar";
}

function parseEpochMs(raw: unknown): number | null {
	if (typeof raw === "number" && Number.isFinite(raw)) return raw;
	if (typeof raw === "string" && raw.trim()) {
		const t = Date.parse(raw.trim());
		if (!Number.isNaN(t)) return t;
	}
	return null;
}

function parseMonths(raw: unknown, errors: string[]): MonthDef[] {
	if (raw === null || raw === undefined) return [];
	if (!Array.isArray(raw)) {
		errors.push("months must be a list");
		return [];
	}
	if (raw.length === 0) return [];
	const out: MonthDef[] = [];
	for (const item of raw) {
		const rec = asRecord(item);
		if (!rec) {
			errors.push("each month must be an object");
			continue;
		}
		const name = String(rec.name ?? "").trim();
		const days = Number(rec.days);
		if (!name || !Number.isFinite(days) || days < 1) {
			errors.push(`invalid month ${JSON.stringify(item)}`);
			continue;
		}
		out.push({ name, days: Math.trunc(days) });
	}
	return out;
}

function parseWeeks(raw: unknown, errors: string[]): WeekDef | null {
	if (raw === null || raw === undefined) return null;
	const rec = asRecord(raw);
	if (!rec) {
		errors.push("weeks must be an object or omitted");
		return null;
	}
	const lengthDays = Math.trunc(Number(rec.lengthDays));
	const weekdays = Array.isArray(rec.weekdays)
		? rec.weekdays.map((w) => String(w).trim()).filter(Boolean)
		: [];
	if (!Number.isFinite(lengthDays) || lengthDays < 1) {
		errors.push("weeks.lengthDays must be a positive integer");
		return null;
	}
	if (weekdays.length > 0 && weekdays.length !== lengthDays) {
		errors.push("weeks.weekdays length must match weeks.lengthDays (or leave weekdays empty)");
	}
	while (weekdays.length < lengthDays) {
		weekdays.push(`Day ${weekdays.length + 1}`);
	}
	return { lengthDays, weekdays: weekdays.slice(0, lengthDays) };
}

function parseEras(raw: unknown, errors: string[]): EraDef[] {
	if (raw === null || raw === undefined) return [];
	if (!Array.isArray(raw)) {
		errors.push("eras must be a list");
		return [];
	}
	const out: EraDef[] = [];
	for (const item of raw) {
		const rec = asRecord(item);
		if (!rec) continue;
		const id = String(rec.id ?? "").trim() || slugify(String(rec.name ?? "era"));
		const name = String(rec.name ?? id).trim();
		const startYear = Number(rec.startYear);
		if (!name || !Number.isFinite(startYear)) {
			errors.push(`invalid era ${JSON.stringify(item)}`);
			continue;
		}
		const era: EraDef = { id, name, startYear: Math.trunc(startYear) };
		if (rec.endYear !== undefined && rec.endYear !== null && rec.endYear !== "") {
			const endYear = Number(rec.endYear);
			if (!Number.isFinite(endYear)) errors.push(`invalid era endYear on ${id}`);
			else era.endYear = Math.trunc(endYear);
		}
		out.push(era);
	}
	return out;
}

function parseLunar(raw: unknown, errors: string[]): LunarDef | null {
	if (raw === null || raw === undefined) return null;
	const rec = asRecord(raw);
	if (!rec) {
		errors.push("lunar must be an object or omitted");
		return null;
	}
	const synodicDays = Number(rec.synodicDays);
	const phases = Array.isArray(rec.phases)
		? rec.phases.map((p) => String(p).trim()).filter(Boolean)
		: [];
	if (!Number.isFinite(synodicDays) || synodicDays < 1) {
		errors.push("lunar.synodicDays must be >= 1");
		return null;
	}
	if (phases.length === 0) {
		errors.push("lunar.phases must list at least one phase name");
		return null;
	}
	return { synodicDays: Math.trunc(synodicDays), phases };
}

function parseYear(raw: unknown, months: MonthDef[], errors: string[]): YearDef {
	const rec = asRecord(raw) ?? {};
	const monthSum = months.reduce((s, m) => s + m.days, 0);
	let lengthDays = Number(rec.lengthDays);
	if (!Number.isFinite(lengthDays) || lengthDays < 1) {
		lengthDays = monthSum > 0 ? monthSum : 360;
	} else {
		lengthDays = Math.trunc(lengthDays);
	}
	if (months.length > 0 && monthSum !== lengthDays) {
		// Prefer month sum as authoritative year length when months are defined.
		lengthDays = monthSum;
	}
	if (lengthDays < 1) errors.push("year.lengthDays must be >= 1");
	return { lengthDays };
}

/**
 * Build a CalendarDef from note frontmatter (or a plain object).
 * Requires `epochs: calendar` (or epochs === true) and an id/name.
 */
export function parseCalendarFrontmatter(
	fm: Record<string, unknown>,
	path: string,
): ParseCalendarResult {
	const errors: string[] = [];
	const marker = fm.epochs;
	if (marker !== "calendar" && marker !== true) {
		return { calendar: null, errors: [] };
	}

	const name = String(fm.name ?? "").trim();
	const idRaw = String(fm.id ?? "").trim();
	const id = idRaw || (name ? slugify(name) : "");
	if (!id) errors.push("calendar needs id or name");
	if (!name && id) {
		// allow id-only; name defaults to id
	}

	const epochMs = parseEpochMs(fm.epoch) ?? 0;
	const dayLengthHours = Number(fm.dayLengthHours ?? 24);
	if (!Number.isFinite(dayLengthHours) || dayLengthHours <= 0) {
		errors.push("dayLengthHours must be a positive number");
	}

	const months = parseMonths(fm.months, errors);
	const year = parseYear(fm.year, months, errors);
	const weeks = parseWeeks(fm.weeks, errors);
	const eras = parseEras(fm.eras, errors);
	const lunar = parseLunar(fm.lunar, errors);
	const defaultFormat = String(fm.defaultFormat ?? "MMMM d, y G").trim() || "MMMM d, y G";

	if (errors.length > 0 || !id) {
		return { calendar: null, errors };
	}

	return {
		calendar: {
			id,
			name: name || id,
			epochMs,
			dayLengthHours: dayLengthHours > 0 ? dayLengthHours : 24,
			year,
			months,
			weeks,
			eras,
			lunar,
			defaultFormat,
			path,
		},
		errors: [],
	};
}
