import { describe, expect, it } from "vitest";
import { parseCalendarFrontmatter, slugFromName } from "../src/schema";
import { parseFantasyDateString } from "../src/parse";
import { formatDate } from "../src/format";
import {
	addCalendarDuration,
	fantasyInputToMs,
	msToParts,
	partsToDayIndex,
	yearLengthDays,
} from "../src/time";
import type { CalendarDef } from "../src/types";

function sampleCal(over: Partial<CalendarDef> = {}): CalendarDef {
	return {
		id: "aether",
		name: "Aether",
		epochMs: 0,
		dayLengthHours: 24,
		year: { lengthDays: 360 },
		months: [
			{ name: "Frostmere", days: 30 },
			{ name: "Greentide", days: 30 },
			{ name: "Highsun", days: 30 },
		],
		weeks: {
			lengthDays: 6,
			weekdays: ["Moonday", "Twoday", "Thirdday", "Fourthday", "Fifthday", "Sixthday"],
		},
		eras: [
			{ id: "before", name: "Before Flame", startYear: -1000, endYear: 0 },
			{ id: "flame", name: "Age of Flame", startYear: 1 },
		],
		lunar: { synodicDays: 28, phases: ["New", "Waxing", "Full", "Waning"] },
		defaultFormat: "MMMM d, y G",
		path: "Epoch Calendars/Aether.md",
		...over,
	};
}

describe("slugFromName", () => {
	it("slugifies display names", () => {
		expect(slugFromName("Aether Reckoning")).toBe("aether-reckoning");
	});
});

describe("parseCalendarFrontmatter", () => {
	it("parses a valid calendar", () => {
		const { calendar, errors } = parseCalendarFrontmatter(
			{
				epochs: "calendar",
				id: "aether",
				name: "Aether",
				epoch: "1970-01-01T00:00:00Z",
				year: { lengthDays: 90 },
				months: [
					{ name: "Frostmere", days: 30 },
					{ name: "Greentide", days: 30 },
					{ name: "Highsun", days: 30 },
				],
			},
			"Epoch Calendars/Aether.md",
		);
		expect(errors).toEqual([]);
		expect(calendar?.id).toBe("aether");
		expect(yearLengthDays(calendar!)).toBe(90);
	});

	it("ignores non-calendar notes", () => {
		const { calendar } = parseCalendarFrontmatter({ title: "x" }, "x.md");
		expect(calendar).toBeNull();
	});
});

describe("parseFantasyDateString", () => {
	it("parses month name form", () => {
		expect(parseFantasyDateString("aether:312-Greentide-4")).toEqual({
			calendar: "aether",
			year: 312,
			month: "Greentide",
			day: 4,
		});
	});

	it("parses day-of-year form", () => {
		expect(parseFantasyDateString("aether:312-4")).toEqual({
			calendar: "aether",
			year: 312,
			day: 4,
		});
	});
});

describe("time math", () => {
	const cal = sampleCal();

	it("maps year 1 day 1 to dayIndex 0", () => {
		expect(
			partsToDayIndex(cal, { calendar: "aether", year: 1, month: "Frostmere", day: 1 }),
		).toBe(0);
	});

	it("round-trips Greentide 4 year 2", () => {
		const input = { calendar: "aether", year: 2, month: "Greentide", day: 4 };
		const ms = fantasyInputToMs(cal, input)!;
		const parts = msToParts(cal, ms);
		expect(parts.year).toBe(2);
		expect(parts.monthName).toBe("Greentide");
		expect(parts.day).toBe(4);
		expect(parts.eraName).toBe("Age of Flame");
	});

	it("resolves lunar phase", () => {
		const parts = msToParts(cal, fantasyInputToMs(cal, {
			calendar: "aether",
			year: 1,
			month: "Frostmere",
			day: 1,
		})!);
		expect(parts.lunarPhaseName).toBeTruthy();
	});

	it("adds fantasy years", () => {
		const start = fantasyInputToMs(cal, {
			calendar: "aether",
			year: 10,
			month: "Frostmere",
			day: 1,
		})!;
		const next = addCalendarDuration(cal, start, [{ amount: 2, unit: "year" }], 1);
		expect(msToParts(cal, next).year).toBe(12);
	});
});

describe("formatDate", () => {
	it("formats with era and month", () => {
		const cal = sampleCal();
		const ms = fantasyInputToMs(cal, {
			calendar: "aether",
			year: 312,
			month: "Greentide",
			day: 4,
		})!;
		expect(formatDate(cal, ms, "MMMM d, y G")).toBe("Greentide 4, 312 Age of Flame");
	});
});
