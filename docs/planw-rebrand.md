# PLANW — Fork Rebranding

> This fork of It's a Plan is rebranded as **PLANW** (@PLANW).

## Identity

|                   | Value                        |
|-------------------|------------------------------|
| Official name     | @PLANW                       |
| Short name        | PLANW                        |
| Previous name     | PLANOAPP                     |
| Production domain | https://planw.appwill.site   |
| Previous domain   | https://plano.appwill.site (redirects) |
| API domain        | https://api.appwill.site (unchanged) |

## What was rebranded

- `APP_NAME` in `apps/web/src/utils/app.ts` → `PLANW`
- Page titles in all 9 locales (`apps/web/messages/*/meta.json`)
- Logo: new `PlanWMark` component (`apps/web/src/components/brand/PlanWMark.tsx`); upstream `ItsAPlanMark` kept intact
- Favicon: `apps/web/src/app/icon.svg`
- Invite emails, API docs title, health endpoint, Git linkback comments

## What was NOT renamed (deliberately)

- Package names (`@repo/*`, `itsaplan-*` images)
- Database tables and columns
- Internal identifiers, env var names, route paths
- The upstream README and docs

This keeps merges from upstream conflict-free.
