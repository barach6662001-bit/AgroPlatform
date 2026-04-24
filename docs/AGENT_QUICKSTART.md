# Agent Quickstart

Short reference for starting any PR. Copy-paste to the agent when launching a new session.

---

## Standard command (use for every new PR)

```
Read docs/ROADMAP.md and docs/TZ.md.

Verify git log --oneline -20 on main matches the "Completed" section of ROADMAP.md.

Start the PR listed under "In progress" in ROADMAP.md.

Rules:
- Do not redo closed work (check status markers in TZ.md).
- Do not skip ahead to later PRs.
- Do not propose scope outside the current PR.
- Decisions listed in ROADMAP.md "Decisions locked" section are final — do not re-discuss.
- If ROADMAP and codebase disagree, stop and ask in chat — do not guess.
- .mcp.json is gitignored, do not commit it.

Workflow per PR:
1. Create a feature branch from main
2. Implement scope incrementally, commit each logical step with a clear message
3. Run `dotnet test` + `npx tsc --noEmit` before each commit
4. Open PR with description linking to ROADMAP item and affected TZ points
5. Fix CI failures as needed
6. Squash-merge to main
7. Update ROADMAP.md: move completed item to "Completed", promote next from "Upcoming" to "In progress"
8. Update TZ.md status markers for affected points
9. Commit the ROADMAP/TZ update as first commit of next PR OR as a final chore commit

Begin.
```

---

## When things go wrong

**Agent proposes already-shipped work:**
> Check ROADMAP.md "Completed" section again. Your proposed work is in PR #X. Re-read main git log and restart planning.

**Agent proposes scope creep:**
> That is out of the current PR scope. Current PR is defined in ROADMAP.md "In progress" section only. If you think the extra scope is critical, stop and ask in chat.

**Agent is unsure about a design decision:**
> Check ROADMAP.md "Decisions locked" section. If your question is answered there, proceed. If not, ask in chat before proceeding.

**Agent wants to defer tests:**
> Tests are not deferrable for security-critical or data-integrity code. If the test infrastructure is missing, extend it in this PR, not "later". See PR #610 and #611 — test debt was created and had to be immediately closed in a follow-up, that's a pattern to avoid.

**CI fails repeatedly on same issue:**
> Stop iterating. Report the failure in chat with the exact error. Three failed iterations on the same issue means the approach is wrong, not that one more tweak will fix it.

---

## When a new TZ point emerges mid-roadmap

During roadmap execution, new bugs or requirements will come up. Protocol:

1. Do not interrupt the current PR.
2. Add the new item to TZ.md as a new point with `[NOT YET SCHEDULED]` marker.
3. Add to ROADMAP.md under "Technical debt" or a new "Emerging scope" section.
4. At the next PR boundary, discuss priority in chat before deciding if it slots into upcoming PRs or waits.

---

## Keeping ROADMAP accurate

After each merge the roadmap MUST reflect reality. Common drift patterns to avoid:

- Agent marks a PR "complete" in ROADMAP while leaving part of scope as "deferred". Either the scope is shipped or it's not. Deferred scope stays in "In progress" as a follow-up or moves to "Upcoming" as a new PR.
- Agent updates "Completed" but forgets to promote next item into "In progress". Always do both.
- Agent edits plan inline in chat instead of the file. File is source of truth.
