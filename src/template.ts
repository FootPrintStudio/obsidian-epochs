/** Full default-filled frontmatter for a new calendar note. */
export function buildCalendarTemplate(opts: { id: string; name: string }): string {
	const { id, name } = opts;
	return `---
epochs: calendar
id: ${id}
name: ${name}
# Anchor: fantasy day 0 (year 1, day 1) ↔ this real-world instant (ISO)
epoch: 1970-01-01T00:00:00Z
# Earth hours per fantasy day (affects duration ↔ ms conversion)
dayLengthHours: 24
year:
  # Used when months is empty; with months, year length = sum of month days
  lengthDays: 360
# Set to [] for no months (day-of-year dating: cal:year-day)
months:
  - { name: Frostmere, days: 30 }
  - { name: Greentide, days: 30 }
  - { name: Highsun, days: 30 }
  - { name: Harvestfall, days: 30 }
  - { name: Emberwane, days: 30 }
  - { name: Deepcold, days: 30 }
  - { name: Thawmere, days: 30 }
  - { name: Bloomrise, days: 30 }
  - { name: Brightsky, days: 30 }
  - { name: Goldleaf, days: 30 }
  - { name: Stormcall, days: 30 }
  - { name: Yearsend, days: 30 }
# Set weeks to null (or delete) for no weeks
weeks:
  lengthDays: 6
  weekdays: [Moonday, Twoday, Thirdday, Fourthday, Fifthday, Sixthday]
eras:
  - { id: before, name: Before Flame, startYear: -1000, endYear: 0 }
  - { id: flame, name: Age of Flame, startYear: 1 }
# Set lunar to null (or delete) for no lunar cycle
lunar:
  synodicDays: 28
  phases: [New, Waxing, Full, Waning]
# Tokens: y/yyyy, MMMM/MMM/M, d/dd/dO, EEEE/EEE, G (era), L/LL (lunar phase)
defaultFormat: "EEEE, MMMM d, y G"
---

# ${name}

Edit the frontmatter above, then reference this calendar from notes:

\`\`\`yaml
birthDate: { calendar: ${id}, year: 312, month: Greentide, day: 4 }
\`\`\`

Or as a string: \`${id}:312-Greentide-4\`

With **Grimoire** enabled:

\`\`\`
\`q= dateformat(date("${id}:312-Greentide-4"), "MMMM d, y G")\`
\`\`\`
`;
}
