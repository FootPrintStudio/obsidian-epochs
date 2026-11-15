---
tags:
  - smoke
  - p3
  - epochs
  - grimoire
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

# P3 Calendar E2E (smoke)

Reading-view smoke for Epochs **≥ 0.1.2** + Grimoire **≥ 0.9.2**.

**Setup:** Enable Epochs + Grimoire. Ensure `Epoch Calendars/Aether.md` and `Epoch Calendars/Spiral.md` are present (or run **Epochs: Rebuild calendar index** after copy). Open this note in **Reading** view.

**Case 4 (missing Epochs):** disable Epochs, reload — fantasy rows empty; case 1 still passes.

---

## Case 1 — Gregorian-only

Expected: `October 3rd, 2003`

`q= dateformat(gregorianBirth, "MMMM ddO, yyyy")`

`q= dateformat(date("2003-10-03"), "MMMM ddO, yyyy")`

---

## Case 2 — Calendar with months (`aether`)

Expected: `Greentide 4, 312 Age of Flame`

`q= dateformat(birthDate, "MMMM d, y G")`

`q= dateformat(date("aether:312-Greentide-4"), "MMMM d, y G")`

### Case 2b — `dur` / `durationformat`

Expected: `314` · `2` · `2 years`

(If you see `0` / `0 years` here, Grimoire is treating the span as Gregorian — need **≥ 0.9.2** so `date − date` keeps `calendarId` for Epochs year lengths.)

`q= dateformat(date(birthDate) + dur(2, "years"), "y")`

`q= durationformat(date("aether:314-Greentide-4") - date(birthDate), "y")`

`q= durationformat(date("aether:314-Greentide-4") - date(birthDate))`

---

## Case 3 — Monthless year-day (`spiral`)

Expected: `120, 50 Spiral Age`

`q= dateformat(spiralMark, "d, y G")`

`q= dateformat(date("spiral:50-120"), "d, y G")`

---

## Case 4 checklist — Missing Epochs

With Epochs **disabled**:

| Expression | Expected |
|------------|----------|
| Case 1 rows | still `October 3rd, 2003` |
| Case 2 / 2b / 3 fantasy rows | empty |

Re-enable Epochs afterward and rebuild index if needed.

---

## Pass / fail

| Case | Pass? | Notes |
|------|-------|-------|
| 1 Gregorian | ☐ | |
| 2 Months format | ☐ | |
| 2b dur / durationformat (`314` · `2` · `2 years`) | ☐ | |
| 3 Monthless | ☐ | |
| 4 Missing Epochs | ☐ | |
