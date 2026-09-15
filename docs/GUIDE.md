# Epochs guide

Custom calendars live as markdown notes. **Epochs** indexes them; **Grimoire** formats them in `q=` expressions.

## Create a calendar

1. Command palette → **Epochs: Create calendar** (or Settings → Create…)
2. Enter a display name
3. Epochs creates `Epoch Calendars/<Name>.md` (folder is customizable) with **all** fields prefilled

Frontmatter must include `epochs: calendar`.

### Disable optional systems

| Feature | How to disable |
|---------|----------------|
| Months | Set `months: []` — dates use `id:year-day` (day of year) |
| Weeks | Set `weeks: null` or delete `weeks` |
| Lunar | Set `lunar: null` or delete `lunar` |
| Eras | Set `eras: []` |

### Fields

| Field | Meaning |
|-------|---------|
| `id` | Short id used in dates (`aether:…`) |
| `name` | Display name |
| `epoch` | Real-world ISO instant for fantasy day 0 (year 1, day 1) |
| `dayLengthHours` | Earth hours per fantasy day (default 24) |
| `year.lengthDays` | Days per year when months are empty |
| `months` | `{ name, days }` list; year length becomes the sum |
| `weeks` | `lengthDays` + `weekdays` names |
| `eras` | Named year ranges (`startYear`, optional `endYear`) |
| `lunar` | `synodicDays` + `phases` names (mean cycle, not astronomy) |
| `defaultFormat` | Used when `dateformat` omits a pattern |

## Writing dates

**String (canonical):**

```text
aether:312-Greentide-4
aether:312-4
```

(`calendar:year-month-day` or `calendar:year-day` when months are empty)

**Structured YAML:**

```yaml
birthDate:
  calendar: aether
  year: 312
  month: Greentide
  day: 4
```

## Grimoire

Requires **Grimoire 0.9.0+** and **Epochs** enabled.

```markdown
`q= date("aether:312-Greentide-4")`
`q= dateformat(date("aether:312-Greentide-4"), "EEEE, MMMM d, y G")`
`q= dateformat(birthDate, "MMMM d, y")`
`q= durationformat(dur(2, "year"), "y 'years'")`   <!-- with calendar context from a fantasy date ± dur -->
```

### Format tokens

| Token | Meaning |
|-------|---------|
| `y` / `yyyy` / `yO` | Year |
| `MMMM` / `MMM` / `M` | Month name / short / number |
| `d` / `dd` / `dO` | Day |
| `EEEE` / `EEE` | Weekday |
| `G` | Era name |
| `L` / `LL` | Lunar phase name |

If Epochs is disabled, fantasy dates do not format; ordinary ISO Gregorian dates still work in Grimoire.

## Index

Epochs rebuilds when metadata changes. Command **Epochs: Rebuild calendar index** forces a rescan.
