# P3 vault smoke pack — install into Test Vault

**Target vault:** `/home/carl-heinz/Desktop/Test Vault`  
**Cloud note:** Agents cannot write that path; copy these files locally (or with a local agent).

## Copy

From this folder (`docs/vault-smoke/p3/`) into the vault root:

| Source | Destination in Test Vault |
|--------|---------------------------|
| `Epoch Calendars/Aether.md` | `Epoch Calendars/Aether.md` |
| `Epoch Calendars/Spiral.md` | `Epoch Calendars/Spiral.md` |
| `Smoke/P3 Calendar E2E.md` | `Smoke/P3 Calendar E2E.md` |

Create folders if missing. If Epochs uses a non-default calendars folder, put the two calendar notes there instead and keep ids `aether` / `spiral`.

## Run

1. **BRAT-update to GitHub Releases** Epochs **0.1.2** + Grimoire **0.9.2** (not `main` / not v0.9.0). Confirm versions in Community plugins.
2. Enable both plugins; rebuild Epochs index if calendars were just added.
3. Open `Smoke/P3 Calendar E2E.md` in **Reading** view.
4. Case 2b must be `314` · `2` · `2 years`. If you see `0` · `180 days`, Grimoire is still **0.9.0**.
5. Optional case 4: disable Epochs, reload, confirm fantasy empty / Gregorian still works.

Same pack ships in both plugin repos under `vault-smoke/p3/`.
Contract: [`../epochs-grimoire-p3.md`](../epochs-grimoire-p3.md).
