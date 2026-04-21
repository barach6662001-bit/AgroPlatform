All coding-agent tasks in this repository must end with:
- creating a new branch
- committing the changes
- pushing the branch
- opening a pull request to main

A task is not complete without an opened pull request.

After opening the pull request:
- wait for CI checks to complete
- if all required checks pass
- merge the pull request automatically using squash merge

Do not stop after only editing files in the session.

If automatic PR creation is not possible, clearly return:
- branch name
- commit SHA
- exact reason PR was not opened

## Frontend lockfile sync (MANDATORY)

Whenever `frontend/package.json` is modified (dependencies added, removed, or updated):
1. Run `npm install` inside the `frontend/` directory.
2. Commit the updated `frontend/package-lock.json` in the same commit/PR.
3. Never open a PR where `frontend/package.json` changed but `frontend/package-lock.json` did not.
4. Do NOT replace `npm ci` with `npm install` in CI workflows — CI must always use `npm ci`.

Failure to keep the lockfile in sync will cause the `check-lockfile-sync` CI check to fail and block merging.
