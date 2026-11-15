# Epochs

FootPrintStudio plugin for [Obsidian](https://obsidian.md): define **fictional calendars** as notes, then render them through **Grimoire** `date` / `dateformat` / `dur` / `durationformat`.

## Install (BRAT)

1. Enable **BRAT** → Add Beta plugin → `FootPrintStudio/obsidian-epochs`
2. Enable **Epochs** and **Grimoire** (0.9.1+ for calendar-aware dates + `durationformat`)
3. Reload Obsidian

## Quick start

1. Command palette → **Epochs: Create calendar**
2. A note appears under **Epoch Calendars/** with every field prefilled
3. Edit `id`, months, eras, etc.
4. In another note:

```markdown
`q= dateformat(date("aether:312-Greentide-4"), "MMMM d, y G")`
```

## Settings

| Setting | Default |
|---------|---------|
| Calendars folder | `Epoch Calendars` |
| Default calendar id | *(empty)* |

Changing the folder path does **not** move existing notes.

Full grammar: **Settings → Guide**.
