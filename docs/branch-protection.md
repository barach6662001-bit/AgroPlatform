# Branch Protection Configuration for `main`

This document explains why branch protection is required and provides step-by-step instructions for applying the recommended settings to the `main` branch.

---

## Why Branch Protection Is Needed

The `main` branch is the production branch. Every push to `main` automatically triggers the CD workflow (`.github/workflows/cd.yml`), which builds Docker images and pushes them to GHCR. Without branch protection:

| Risk | Impact |
|------|--------|
| Any contributor can push directly to `main` without a review | Unreviewed code ships to production |
| No required CI checks before merging | Broken builds or failing tests reach the production image |
| No status checks on the CD pipeline | Docker build failures have been triggered by direct pushes at least **6 times** recently |
| The `main` branch can be deleted or force-pushed | Permanent history loss |

Branch protection enforces a pull-request–based workflow so that every change is reviewed and all CI checks pass before code can merge.

---

## Required Settings

Apply the following settings to the `main` branch pattern:

| Setting | Value |
|---------|-------|
| Branch name pattern | `main` |
| Require a pull request before merging | ✅ Enabled |
| Required approving reviews | 1 (minimum) |
| Dismiss stale pull request approvals when new commits are pushed | ✅ Enabled |
| Require status checks to pass before merging | ✅ Enabled |
| Status checks that are required | `frontend-build-and-test`, `build-and-test` |
| Require branches to be up to date before merging | ✅ Enabled |
| Do not allow bypassing the above settings | ✅ Recommended |
| Restrict deletions | ✅ Enabled |
| Require linear history | Optional (recommended) |

---

## CI Jobs That Must Pass

Both of the following GitHub Actions jobs (defined in `.github/workflows/ci.yml`) must pass before a PR can be merged:

| Job name | Runtime | What it runs |
|----------|---------|--------------|
| `frontend-build-and-test` | Node.js 20 | `npm ci` → ESLint lint → `tsc -b` type-check → Vite build → Vitest tests |
| `build-and-test` | .NET 8.0 | `dotnet restore` → `dotnet build` (Release) → warn-as-error check (Domain + Application projects) → unit tests → integration tests (Testcontainers + PostgreSQL) → vulnerability scan → publish API artifact |

---

## Relationship with the CD Pipeline

The CD workflow (`.github/workflows/cd.yml`) is triggered on every push to `main` (and on version tags). It builds and pushes two Docker images to the GitHub Container Registry (GHCR):

- `ghcr.io/barach6662001-bit/agroplatform/api` — the .NET API image
- `ghcr.io/barach6662001-bit/agroplatform/frontend` — the Nginx + React frontend image

Without branch protection, broken code can be pushed directly to `main`, causing the CD pipeline to fail or ship a broken image. Requiring both CI jobs to pass before merging guarantees that only verified, working code triggers the CD pipeline.

---

## Step-by-Step Configuration via GitHub UI

1. Navigate to the repository on GitHub: **https://github.com/barach6662001-bit/AgroPlatform**
2. Click **Settings** → **Branches** (in the left sidebar under *Code and automation*).
3. Under **Branch protection rules**, click **Add branch protection rule**.
4. In **Branch name pattern**, enter: `main`
5. Enable the following checkboxes:

   - ✅ **Require a pull request before merging**
     - Set **Required number of approvals** to `1`
     - ✅ **Dismiss stale pull request approvals when new commits are pushed**
   - ✅ **Require status checks to pass before merging**
     - ✅ **Require branches to be up to date before merging**
     - In the search box, find and add: `frontend-build-and-test`
     - In the search box, find and add: `build-and-test`
   - ✅ **Do not allow bypassing the above settings**
   - ✅ **Restrict deletions**
   - *(Optional)* ✅ **Require linear history**

6. Click **Create** (or **Save changes**).

---

## GitHub CLI — Apply All Settings at Once

A repository admin can apply the full protection configuration with a single CLI command:

```bash
gh api repos/barach6662001-bit/AgroPlatform/branches/main/protection \
  --method PUT \
  --input - <<'EOF'
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["frontend-build-and-test", "build-and-test"]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "required_approving_review_count": 1
  },
  "restrictions": null
}
EOF
```

> **Note:** You must be authenticated as a repository admin (`gh auth login`) for this command to succeed.

---

## Verification

After applying the settings, verify the current protection status:

```bash
gh api repos/barach6662001-bit/AgroPlatform/branches/main/protection
```

The response should include `"required_pull_request_reviews"`, `"required_status_checks"`, and `"enforce_admins": { "enabled": true }`.

To check only whether the branch is protected:

```bash
gh api repos/barach6662001-bit/AgroPlatform/branches/main --jq '.protected'
# Expected output: true
```
