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

# Aether

P3 smoke calendar (months). Used by `Smoke/P3 Calendar E2E.md`.

String form: `aether:312-Greentide-4`
