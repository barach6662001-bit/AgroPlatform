# Task 00 — Discover repo and create feature branch

## Context
Establish the working directory and isolate Phase 0 work on its own branch.

## Dependencies
None (this is the first task).

## Goal
Locate the React frontend directory, verify the dev environment works, create the feature branch.

## Steps

1. From repo root, locate the frontend:
   ```bash
   find . -name "package.json" -not -path "*/node_modules/*" -exec grep -l '"react"' {} \;
   ```
   Save the result in `/agents/phase-0/_progress.md` under a new line: `FRONTEND=<path>`.

2. `cd` into the frontend directory. Confirm build tool:
   ```bash
   ls vite.config.* next.config.* 2>/dev/null
   ```
   Record which one is present.

3. Ensure current working tree is clean:
   ```bash
   git status
   ```
   If not clean, STOP and report to user.

4. Sync with origin and create the phase branch from `main`:
   ```bash
   git fetch origin
   git checkout main
   git pull origin main
   git checkout -b feat/design-system-foundation
   ```

5. Verify dev server still starts (smoke test, no regressions to check against):
   ```bash
   npm install
   npm run dev &
   sleep 10
   curl -s http://localhost:5173 > /dev/null && echo "OK" || echo "FAIL"
   kill %1 2>/dev/null || true
   ```

6. Create `/agents/phase-0/_progress.md` (if not present) with a header. Append this task's entry.

## Files
- Create: `/agents/phase-0/_progress.md`

## Acceptance Criteria
- [ ] Frontend directory located and recorded in `_progress.md`
- [ ] Build tool identified (vite or next)
- [ ] Branch `feat/design-system-foundation` created from up-to-date `main`
- [ ] Dev server boots without errors
- [ ] `_progress.md` initialised with task-00 entry

## Verification Commands
```bash
git branch --show-current   # should print feat/design-system-foundation
cat agents/phase-0/_progress.md
```

## Git
```bash
git add agents/phase-0/_progress.md
git commit -m "chore(design-system): start phase 0 — discover repo, open branch

Task: phase-0/task-00"
git push -u origin feat/design-system-foundation
```
