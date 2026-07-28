# Manual / User-Only Tasks — LabFlow docs site

> The ONE place for everything only you (the human) can do in this repo. Fixed path: `docs/MANUAL-TASKS.md`.
> Global spec: `~/.claude/rules/manual-tasks.md`. **Last updated: 2026-07-28**

🔴 **This file is excluded from the published site** (`docusaurus.config.ts` → docs plugin `exclude`).
`docs/` is both the published content directory and this file's fixed home, so without that exclude it
would ship as a live public page — which has already happened on two sibling docs sites. The deploy
workflow asserts it did not reach `build/`, because the failure is silent and public.

---

## ⏳ Pending manual tasks

| # | Task | Why only you | Detail | Status |
|---|---|---|---|---|
| 1 | **GitHub → Settings → Pages → Source: “GitHub Actions”** | Repository settings need an owner | Without this the workflow uploads an artifact that is never published | ☐ Not started |
| 2 | **GitHub → Settings → Pages → Custom domain: `labflow-docs.aoneahsan.com`, then tick Enforce HTTPS** | Repository settings need an owner | `static/CNAME` puts the domain in the build output, which is necessary but **not sufficient** — Pages must also be told, or the site serves at `aoneahsan.github.io/labflow-docs` and the custom domain 404s. This is the most likely launch-day failure | ☐ Not started |
| 3 | **Protect `main` with a ruleset** — PR + ≥1 approval + the CI check, block force-push and deletion, bypass = Repository admin only | Requires repo admin | `~/.claude/rules/public-repo-governance.md` | ☐ Not started |
| 4 | **Search-engine verification + sitemap submission** (Google Search Console, Bing Webmaster, Yandex) | Needs your accounts | `docs/deployment/search-engines.md` | ☐ Blocked on #1–2 |

**DNS is already done.** `labflow-docs.aoneahsan.com` resolves to GitHub Pages and returns 404, which is
the expected state before a first publish (probed 2026-07-28). The old `docs.labflow.aoneahsan.com` never
had a record at all — nothing to remove.

---

## ✅ Completed manual tasks

_(move rows here with the date once done)_

---

## Done by the agent on 2026-07-28 — no action needed

These are recorded so you do not re-do them, and so a later session does not re-derive the reasoning.

- Domain corrected to **`labflow-docs.aoneahsan.com`** per the global docs-site law: the parent project is
  a *subdomain*, so the docs host appends `-docs` to its first label. `docs.labflow.…` was the apex form
  wrongly applied to a subdomain.
- `static/CNAME`, `SITE_URL`, `projectName` (`lab-system` → `labflow-docs`), and `editUrl` all corrected.
- **`.github/workflows/deploy-pages.yml` created** — none existed. It builds, asserts `build/CNAME` exists
  and that no `*MANUAL-TASKS*` file leaked, then publishes.
- Docs-plugin `exclude` added (it was unset), restating the plugin defaults plus `MANUAL-TASKS.md`.
- **102 hardcoded references to the old host replaced** across 14 files.
- **`docs/deployment/firebase-hosting.md` deleted** — it documented deploying *this docs site* to Firebase
  Hosting, which the GitHub-Pages-only decision forbids. `github-publish.md` already covers the real host.
  (The LabFlow *application* stays on Firebase Hosting; that is unchanged and still documented.)
- `.github/DEPLOY-WORKFLOW-TODO.md` deleted — obsolete now the workflow exists.
- The deployment section's Firebase-era claims corrected in `overview.md`, `github-publish.md`,
  `search-engines.md` and `launch-checklist.md`, including two honest new limitations: **Pages has no
  per-PR preview URLs** and **Pages exposes no access logs**, so bot traffic is only observable through
  each search engine's own console.
- Secrets sweep clean; the repo is public, so it must stay that way.
