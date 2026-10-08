# APPLANO Issue Naming Convention

> Decided 2026-10-08 by Willzada. Applies to all issues created in APPLANO (and any agent creating them).

## Title format

```
[M: ModuleName] Action description
```

- Always in **English** (prefixes, types, labels).
- Module only in the title. No area prefix (too noisy).
- Description starts with a verb when possible.

## Modules

`TableView`, `KanbanView`, `Sidebar`, `Core`, `Dashboard`, `CalendarView`, `TimelineView`, `Settings`, `Auth`, `API`

Use `Core` for cross-cutting changes. Pick the primary module when several are affected.

## Type (native field, required)

`Feature`, `Bug`, `Task`, `Tech debt`, `Research`

## Labels (context only, not substitutes for Type/Status/Priority)

- `area: ux`, `area: ui`, `area: api`, `area: performance`, `area: web` — technical area
- `fork-only` — never send upstream
- `enhancement`, `bug`, `gambiarra` — as needed

## Rules

1. Never delete issues or lose data when renaming.
2. Keep IDs and relationships intact.
3. Don't mark issues done just because of renaming.
4. Every new issue follows this format from creation.
