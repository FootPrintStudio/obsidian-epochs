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

Reading-view smoke for **Epochs 0.1.2** + **Grimoire 0.9.2** (GitHub Releases).

## Install (required before Case 2b)

BRAT installs the **latest GitHub Release**, not an open PR branch.

| Plugin | Must show in Community plugins | Release |
|--------|--------------------------------|---------|
| **Grimoire** | **0.9.2** | https://github.com/FootPrintStudio/obsidian-grimoire/releases/tag/v0.9.2 |
| **Epochs** | **0.1.2** | https://github.com/FootPrintStudio/obsidian-epochs/releases/tag/v0.1.2 |

1. BRAT → **Check for updates** on both plugins (or re-add `FootPrintStudio/obsidian-grimoire` / `FootPrintStudio/obsidian-epochs`).
2. Confirm versions **0.9.2** / **0.1.2** under Settings → Community plugins.
3. **Reload** Obsidian.
4. Rebuild Epochs index if calendars were just added.

**If Case 2b shows `0` and `180 days`:** you are still on Grimoire **0.9.0** (release). That build never tags `calendarId` on `date − date`, so `durationformat` stays Gregorian. Update to **0.9.2**.

---

**Setup:** Enable Epochs + Grimoire. Ensure `Epoch Calendars/Aether.md` and `Epoch Calendars/Spiral.md` are present. Open this note in **Reading** view.

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

`q= dateformat(date(birthDate) + dur(2, "years"), "y")`

`q= durationformat(date("aether:314-Greentide-4") - date(birthDate), "y")`

`q= durationformat(date("aether:314-Greentide-4") - date(birthDate))`

| Actual | Meaning |
|--------|---------|
| `314` · `2` · `2 years` | Pass (Grimoire ≥ 0.9.2 + Epochs ≥ 0.1.2) |
| `314` · `0` · `180 days` | Fail — Grimoire still **0.9.0**; Gregorian duration path |

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
| Plugin versions 0.9.2 / 0.1.2 | ☐ | |
| 1 Gregorian | ☐ | |
| 2 Months format | ☐ | |
| 2b (`314` · `2` · `2 years`) | ☐ | |
| 3 Monthless | ☐ | |
| 4 Missing Epochs | ☐ | |
