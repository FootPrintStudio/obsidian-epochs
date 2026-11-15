# P3 calendar fixtures (Epochs)

Copy these notes into a vault under `Epoch Calendars/` (or your configured folder) for Reading-view smoke. Automated coverage: `test/api-e2e.test.ts`, `test/calendar.test.ts`.

## Fixture A — months calendar (`aether`)

```yaml
---
epochs: calendar
id: aether
name: Aether
epoch: 1970-01-01T00:00:00Z
dayLengthHours: 24
year:
  lengthDays: 90
months:
  - { name: Frostmere, days: 30 }
  - { name: Greentide, days: 30 }
  - { name: Highsun, days: 30 }
weeks:
  lengthDays: 6
  weekdays: [Moonday, Twoday, Thirdday, Fourthday, Fifthday, Sixthday]
eras:
  - { id: flame, name: Age of Flame, startYear: 1 }
lunar: null
defaultFormat: "MMMM d, y G"
---
```

## Fixture B — monthless year-day (`spiral`)

```yaml
---
epochs: calendar
id: spiral
name: Spiral
epoch: 1970-01-01T00:00:00Z
dayLengthHours: 24
year:
  lengthDays: 400
months: []
weeks: null
eras:
  - { id: spiral, name: Spiral Age, startYear: 1 }
lunar: null
defaultFormat: "d, y G"
---
```

## Consumer note frontmatter (Grimoire)

```yaml
---
birthDate:
  calendar: aether
  year: 312
  month: Greentide
  day: 4
spiralMark:
  calendar: spiral
  year: 50
  day: 120
gregorianBirth: 2003-10-03
---
```

```markdown
`q= dateformat(gregorianBirth, "MMMM ddO, yyyy")`
`q= dateformat(birthDate, "MMMM d, y G")`
`q= dateformat(spiralMark, "d, y G")`
`q= durationformat(date("aether:314-Greentide-4") - birthDate, "y' years'")`
```
