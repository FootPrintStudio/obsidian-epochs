import { describe, expect, it } from "vitest";
import { EpochsApi } from "../src/api";
import type { CalendarDef } from "../src/types";

/** In-memory calendar lookup for API contract tests (no Obsidian App). */
class MemoryIndex {
	private byId = new Map<string, CalendarDef>();

	set(cal: CalendarDef): void {
		this.byId.set(cal.id, cal);
	}

	get(id: string): CalendarDef | null {
		return this.byId.get(id) ?? null;
	}

	list(): CalendarDef[] {
		return [...this.byId.values()];
	}
}

function monthsCalendar(): CalendarDef {
	return {
		id: "aether",
		name: "Aether",
		epochMs: 0,
		dayLengthHours: 24,
		year: { lengthDays: 90 },
		months: [
			{ name: "Frostmere", days: 30 },
			{ name: "Greentide", days: 30 },
			{ name: "Highsun", days: 30 },
		],
		weeks: {
			lengthDays: 6,
			weekdays: ["Moonday", "Twoday", "Thirdday", "Fourthday", "Fifthday", "Sixthday"],
		},
		eras: [{ id: "flame", name: "Age of Flame", startYear: 1 }],
		lunar: null,
		defaultFormat: "MMMM d, y G",
		path: "Epoch Calendars/Aether.md",
	};
}

function monthlessCalendar(): CalendarDef {
	return {
		id: "spiral",
		name: "Spiral",
		epochMs: 0,
		dayLengthHours: 24,
		year: { lengthDays: 400 },
		months: [],
		weeks: null,
		eras: [{ id: "spiral", name: "Spiral Age", startYear: 1 }],
		lunar: null,
		defaultFormat: "d, y G",
		path: "Epoch Calendars/Spiral.md",
	};
}

describe("EpochsApi E2E contract (P3)", () => {
	it("calendar with months: parse frontmatter object + string, format, addDuration", () => {
		const index = new MemoryIndex();
		index.set(monthsCalendar());
		const api = new EpochsApi(index);

		const fromObj = api.parseDate({
			calendar: "aether",
			year: 312,
			month: "Greentide",
			day: 4,
		});
		expect(fromObj?.calendarId).toBe("aether");
		expect(fromObj?.ms).toBeTypeOf("number");

		const fromStr = api.parseDate("aether:312-Greentide-4");
		expect(fromStr?.ms).toBe(fromObj!.ms);

		expect(api.formatDate(fromObj!.ms, "aether", "MMMM d, y G")).toBe(
			"Greentide 4, 312 Age of Flame",
		);

		const plusTwoYears = api.addDuration(fromObj!.ms, "aether", [{ amount: 2, unit: "year" }], 1);
		expect(api.formatDate(plusTwoYears, "aether", "y")).toBe("314");

		const span = plusTwoYears - fromObj!.ms;
		expect(api.formatDuration(span, "aether", "y' years'")).toBe("2 years");
		expect(api.formatDuration(span, "aether", "y 'years'")).toBe("2 years");
		expect(api.formatDuration(span, "aether")).toContain("2 year");
	});

	it("monthless year-day: parse cal:year-day and format without month tokens", () => {
		const index = new MemoryIndex();
		index.set(monthlessCalendar());
		const api = new EpochsApi(index);

		const fromObj = api.parseDate({ calendar: "spiral", year: 50, day: 120 });
		expect(fromObj?.calendarId).toBe("spiral");

		const fromStr = api.parseDate("spiral:50-120");
		expect(fromStr?.ms).toBe(fromObj!.ms);

		expect(api.formatDate(fromObj!.ms, "spiral", "d, y G")).toBe("120, 50 Spiral Age");
		expect(api.formatDate(fromObj!.ms, "spiral", "MMMM")).toBe("");
		expect(api.formatDate(fromObj!.ms, "spiral", "M")).toBe("");

		const parts = api.parts(fromObj!.ms, "spiral");
		expect(parts?.month).toBe(0);
		expect(parts?.day).toBe(120);
		expect(parts?.year).toBe(50);
	});

	it("unknown calendar id returns null / empty (missing calendar note)", () => {
		const api = new EpochsApi(new MemoryIndex());
		expect(api.parseDate("aether:1-Frostmere-1")).toBeNull();
		expect(api.parseDate({ calendar: "aether", year: 1, month: 1, day: 1 })).toBeNull();
		expect(api.formatDate(0, "aether", "y")).toBe("");
		expect(api.formatDuration(0, "aether")).toBe("");
	});

	it("rejects day-of-year beyond year length on monthless calendars", () => {
		const index = new MemoryIndex();
		index.set(monthlessCalendar());
		const api = new EpochsApi(index);
		expect(api.parseDate("spiral:1-401")).toBeNull();
		expect(api.parseDate({ calendar: "spiral", year: 1, day: 400 })?.calendarId).toBe("spiral");
	});
});
