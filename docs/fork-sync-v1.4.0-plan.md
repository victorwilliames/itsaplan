# Fork Sync Plan — v1.4.0

Analysis only. No update executed. Date: 2026-10-08.

## 1. Our changes inventory (1ce0a058..HEAD, 25 commits)

### Fork-only (18) — never upstream

| Commit | Change | Files |
|---|---|---|
| 5ae19dbe | PT-BR default workflow states (hack) | apps/api/.../projects/service.ts, projects.test.ts |
| b55599ff | Seed Kanban + Lista views on project creation (hack) | apps/api/.../projects/service.ts |
| ad495b0e | Aguardando Aprovação in default PT-BR states (hack) | apps/api/.../projects/service.ts |
| d183bcd6 | Kanban card avatar layout (assignee 50% + agent) | .../kanban/IssueCardBody.tsx |
| 83bd3ae7 | Hide issue ID on kanban cards by default | apps/web/src/utils/viewSettings.ts |
| 0376faa2 | Default table columns = owner's set | apps/web/src/utils/viewSettings.ts |
| 9abe73d8 → 4d372dea | Sidebar reorganization (10 commits: Ver mais, categories, icons, footer, Tarefas label, Ver menos) | SidebarWorkNav.tsx, SidebarNavSubmenu*.tsx, SidebarMainNav.tsx, AppSidebar.tsx, SidebarBrandFooter.tsx |
| adcdaed7 | Header buttons → profile menu, centered search | AppHeader.tsx, UserMenu.tsx, SidebarBrandFooter.tsx |
| 801e8df7 | Sidebar auto-collapse with pin, starts closed | useSidebarAutoCollapse.ts, SidebarPinControl.tsx, AppSidebar.tsx, (shell)/layout.tsx |

### Potentially upstreamable (7) — no fork-only tag

| Commit | Change | Files | Upstream status |
|---|---|---|---|
| b0cec57e | Issue detail as centered modal | IssueDetail.tsx | not proposed |
| 7777ab1b | Quick-add row in table view | TableQuickAdd.tsx, TableView.tsx | PR #506 open |
| ef645ad9 | Apply issue-type preset to existing project | issue-types/*, IssueTypesPresetDialog.tsx, ... | not proposed |
| ea2e74ce | Fix: count created types locally | IssueTypesPresetDialog.tsx | goes with ef645ad9 |
| f720b00a | Fix: hide default-type note in preset dialog | NewProjectPreset.tsx, IssueTypesPresetDialog.tsx | goes with ef645ad9 |
| a7d18b6e | Auto-collapse empty kanban columns | FlatBoard.tsx | not proposed |
| b4255263 | Bulk selection + batch actions in table | TableView.tsx, TableRow.tsx, ... | not proposed |

## 2. What v1.4.0 brings (new since our base)

Only 3 commits between our base (1ce0a058) and v1.4.0 (9e71646e).
Everything else in the v1.4.0 changelog (#478 workspaces, #483 owner access,
#486 delete team, #493 move issue, #495 Linear import, #496 MCP, #476 import
dates) is already an ancestor of our branch.

| Commit | Change | Value for us |
|---|---|---|
| 92dfb989 (#501) | Per-agent reasoning effort (low/medium/high) for internal agents | Low now (we use external agent Paulo Muse); harmless |
| 6d081944 (#503) | Refactor: extending builds can add agent schedule types | Internal; keeps us compatible, no user change |
| 9e71646e (#473) | Release metadata (CHANGELOG, version 1.4.0) | Version string only |

Net: v1.4.0 is a small, safe update for us. No must-have feature, but staying
current avoids drift.

## 3. Conflict analysis

Simulated with a real merge on throwaway branch `test-merge-v140`
(`git merge --no-commit --no-ff upstream/main`).

**Result: ZERO conflicts. Automatic merge went well.**

Two files changed on both sides but auto-merged cleanly (disjoint keys):

- `apps/web/messages/en/settings.json` — upstream restructured schedule keys
  (`typeCron` → `types.cron`, etc.); we added issue-type preset keys. Both kept.
- `apps/web/messages/pt-BR/settings.json` — same, both kept.

Verified: both JSONs valid, our preset keys present (10 matches), upstream
schedule keys present (`issueTaskPlaceholder`, `nextRunOnTrigger`).

Typecheck on merged tree: `tsc --noEmit` clean for both `apps/web` and
`apps/api`. Test branch deleted after verification.

## 4. Recommended strategy: MERGE (not rebase, not cherry-pick)

**Merge `upstream/main` into `custom/evoluwill42`.**

Reasons, strongest first:

1. **Production branch must never be rewritten.** Rebase changes commit hashes;
   the VPS deploys by `git pull`. A rewritten history forces `git reset --hard`
   on production and breaks anyone/anything tracking the old hashes. Merge is
   append-only and `git pull` handles it.

2. **Zero conflicts make rebase's only advantage (clean history) worthless
   here.** Rebase shines when untangling conflicts commit-by-commit; with a
   clean merge there is nothing to untangle.

3. **Cherry-pick loses the merge-base.** Picking the 3 commits individually
   duplicates them; the next upstream sync would see them as "new" again and
   conflict. Merge records the true ancestry, so future syncs stay trivial.

4. **Webhook-safe.** The Git integration moves APPLANO issues only for
   branches/PRs named `APPLANO-x` and for merges into the repo's *default*
   branch. We merge into `custom/evoluwill42` (not default), and the merge
   commit references no issue key, so no issue will move spuriously. Verified
   in `apps/api/src/modules/git/handler.ts`.

## 5. Risk assessment

### R1 (HIGH): Production API is NOT our fork's code
`docker inspect itsaplan-api-1` → image `ghcr.io/croffasia/itsaplan-api:latest`;
`grep Aguardando` inside the container → 0 matches. Our fork-only API hacks
(PT-BR states, seeded views) never went live; the "Aguardando Aprovação"
states in APPLANO/D were added via API calls, not the hack.

Implication: `docker compose build api && up -d` after the merge would
SUDDENLY ACTIVATE the hacks (new projects get PT-BR states + Kanban/Lista
views). Decide before deploying:
- Option A: keep API on upstream image (status quo; our API hacks stay dormant
  in git only). Simplest, zero behavior change.
- Option B: build API from fork (activates hacks; new projects get PT-BR
  defaults — probably what the owner wants long-term, but it is a behavior
  change to announce).

The `migrate` service uses the same image; migrations 0145/0146 run either
way (they are upstream SQL, additive — see R2).

### R2 (LOW): Database migrations 0145 + 0146
- `0145`: `ALTER TABLE ai_agent ADD COLUMN reasoning_effort text` + CHECK
  constraint. Nullable, no data loss. Our Paulo Muse row gets NULL — fine.
- `0146`: drops/re-adds CHECK constraints on `agent_run`/`agent_schedule`,
  adds `options jsonb DEFAULT '{}'`. Additive, compatible.
- The compose `migrate` service runs `migrate.ts` before api/worker/bot start
  and takes a Postgres advisory lock. Standard path, no manual step.

### R3 (LOW): Webhook misfire on push
Pushing the merge to `origin/custom/evoluwill42` fires the GitHub webhook
(ID 694248817). Handler only acts on `APPLANO-x` branch names and default-
branch merges. Neither applies. No issue will move.

### R4 (LOW): Web UI drift
Upstream touched `TeamAiAgentFields.tsx`, `agentForm.ts`, `agents.ts`
endpoint (reasoning effort UI). We did not touch those files. Our heavily
customized sidebar files were untouched by upstream. No overlap.

## 6. Update plan (to execute when approved)

### 6.1 Backup (VPS)
```bash
ssh -i /home/hatch/.ssh/oracle-hermes.key \
  -o ProxyCommand="nc -X connect -x 198.19.0.1:3128 %h %p" \
  ubuntu@168.138.251.79 << 'EOF'
cd ~/itsaplan
# DB dump (migrate.ts also dumps to db-backups volume, this is belt-and-braces)
docker compose exec -T postgres pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" \
  > /tmp/pre-v140-backup.sql
# Record exact code state for rollback
git rev-parse HEAD > /tmp/pre-v140-commit.txt && cat /tmp/pre-v140-commit.txt
# Record running image digests
docker compose images | tee /tmp/pre-v140-images.txt
EOF
```

### 6.2 Merge (sandbox ~/workspace/itsaplan-fork)
```bash
cd ~/workspace/itsaplan-fork
git fetch upstream
git checkout custom/evoluwill42
git merge --no-ff upstream/main -m "merge(upstream): sync v1.4.0 into fork"
# Expected: clean merge, no conflicts (verified 2026-10-08)
```

### 6.3 Validate
```bash
cd ~/workspace/itsaplan-fork/apps/web && bun x tsc --noEmit   # expect clean
cd ../api && bun x tsc --noEmit                                # expect clean
bun x prettier --check on changed files
python3 -c "import json; json.load(open('apps/web/messages/en/settings.json')); json.load(open('apps/web/messages/pt-BR/settings.json'))"
git push origin custom/evoluwill42
```

### 6.4 Deploy (VPS) — order matters
```bash
cd ~/itsaplan && git pull
# DECISION POINT R1: API image source
#  Option A (status quo): docker compose pull api worker bot web  # upstream images
#  Option B (fork API):   docker compose build api worker bot web # our source
docker compose build web          # web is always our fork (verified live)
docker compose up -d              # migrate service runs 0145/0146 first, then apps
sleep 25 && docker compose ps --format '{{.Name}}: {{.Status}}'
```

### 6.5 Click-test checklist (production)
- [ ] Login loads, sidebar renders (collapsed by default, Ver mais at bottom)
- [ ] Kanban: cards show avatars correctly, ID hidden by default
- [ ] Table: default columns = owner's set; quick-add row works
- [ ] New project creation still works (states/views defaults)
- [ ] Agents page: reasoning effort dropdown appears (new v1.4.0 UI)
- [ ] `docker compose logs api --tail 20` shows migrations 0145/0146 applied, no errors

### 6.6 Rollback
Code rollback (fast, <2 min):
```bash
cd ~/itsaplan
git reset --hard $(cat /tmp/pre-v140-commit.txt)
docker compose build web && docker compose up -d
```
DB rollback (only if migrations caused damage — 0145/0146 are additive, so
normally unnecessary):
```bash
# Down-migrations do not exist; restore from dump = full reset to pre-v1.4.0
docker compose stop api worker bot
docker compose exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  < /tmp/pre-v140-backup.sql
docker compose up -d
```
Note: DB restore loses any data written between backup and rollback.

## 7. Future process (repeatable, lightweight)

### 7.1 Sync check script — `scripts/fork-sync-check.sh`
```bash
#!/bin/bash
# Usage: ./scripts/fork-sync-check.sh [upstream-ref]
# Reports: upstream delta size, overlapping files, conflict forecast.
set -e
UPSTREAM_REF="${1:-upstream/main}"
BASE="$(git merge-base HEAD "$UPSTREAM_REF")"
echo "== Upstream commits since base ($BASE) =="
git log --oneline "$BASE..$UPSTREAM_REF" | head -20
echo "== Files changed by upstream =="
git diff --name-only "$BASE..$UPSTREAM_REF" | grep -v "drizzle/meta" | head -30
echo "== OVERLAP with our changed files (conflict candidates) =="
comm -12 \
  <(git diff --name-only "$BASE..$UPSTREAM_REF" | sort) \
  <(git diff --name-only "$BASE..HEAD" | sort) \
  || echo "(none)"
echo "== Dry-run merge =="
git merge-tree "$BASE" HEAD "$UPSTREAM_REF" > /tmp/sync-check.txt 2>&1 \
  && echo "clean" || echo "HAS CONFLICTS - see /tmp/sync-check.txt"
```
Run on every upstream release. If "clean" + overlap is only translation JSONs,
the merge is safe to do immediately. If real conflicts appear, resolve them in
a `sync/vX.Y.Z` branch first and click-test before merging to
`custom/evoluwill42`.

### 7.2 Standing rules that make future syncs cheap
1. **Keep fork-only commits small and tagged.** Every `(fork-only)` commit is
   a unit we never have to reconcile with upstream. Never mix fork-only and
   upstreamable changes in one commit.
2. **Prefer additive changes over edits to upstream files.** New files
   (`SidebarPinControl.tsx`, `useSidebarAutoCollapse.ts`) never conflict.
   Edits to upstream files (`SidebarWorkNav.tsx`) are where conflicts breed.
3. **Translation keys: use our own namespace.** Our preset keys collided in
   file but not in key name — that is why the merge was clean. Keep it that
   way: prefix fork-only keys (e.g. `fork*`) so upstream restructures never
   touch our lines.
4. **API hacks stay behind a decision.** The R1 finding (prod API = upstream
   image) must be resolved once, then recorded here: either we always build
   API from fork, or we delete the dormant hacks. Dormant divergent code is
   the most expensive kind — it looks merged but is not live.
5. **One sync branch per release, merged with --no-ff.** History stays
   readable: `merge(upstream): sync vX.Y.Z into fork` marks every sync point.
