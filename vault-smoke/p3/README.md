# P3 vault smoke pack — install into Test Vault

**Target vault:** `/home/carl-heinz/Desktop/Test Vault`

## Copy

From this folder (`vault-smoke/p3/`) into the vault root:

| Source | Destination in Test Vault |
|--------|---------------------------|
| `Epoch Calendars/Aether.md` | `Epoch Calendars/Aether.md` |
| `Epoch Calendars/Spiral.md` | `Epoch Calendars/Spiral.md` |
| `Smoke/P3 Calendar E2E.md` | `Smoke/P3 Calendar E2E.md` |

Create folders if missing. If Epochs uses a non-default calendars folder, put the two calendar notes there instead and keep ids `aether` / `spiral`.

## Run

1. Obsidian: enable **Epochs** + **Grimoire** (peer mins **0.1.2** / **0.9.2**).
2. Command palette → **Epochs: Rebuild calendar index** (if calendars were just added).
3. Open `Smoke/P3 Calendar E2E.md` in **Reading** view.
4. Check expected strings in the note; tick the pass table.
5. Optional case 4: disable Epochs, reload, confirm fantasy empty / Gregorian still works.
