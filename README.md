# Epochs

FootPrintStudio plugin for [Obsidian](https://obsidian.md): define **fictional calendars** as notes, then render them through **Grimoire** `date` / `dateformat` / `dur` / `durationformat`.

## Install (BRAT)

1. Enable **BRAT** → Add Beta plugin → `FootPrintStudio/obsidian-epochs` (uses **GitHub Releases**)
2. Enable **Epochs** and **Grimoire** (**0.1.2** / **0.9.2** for Case 2b calendar-aware `durationformat`)
3. Confirm Community plugins shows those versions, then reload Obsidian

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
