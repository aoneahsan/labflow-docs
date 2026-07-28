---
sidebar_position: 3
slug: /deployment/github-publish
title: GitHub Publishing
description: Publishing the LabFlow documentation as a public GitHub repository — repo creation, branch protection, GitHub Actions deploy workflow, contributor flow, secrets management, and the discoverability boost that a public docs repo brings.
keywords:
  - LabFlow docs GitHub
  - public docs repo
  - GitHub Actions Docusaurus
  - docs contributor flow
  - GitHub branch protection
  - docs repo SEO
---

# GitHub Publishing

**Publishing the LabFlow documentation as a public GitHub repository is the move that turns the docs into a discoverable, crawlable, and contributor-friendly surface.** The main LabFlow application repo is private — it carries the multi-tenant data model, security rules, and operational glue that customers don't need to read — but the documentation is the product's public face. A separate `labflow-docs` repo lets the docs be crawled by GitHub-aware AI search citations (a meaningful share of ChatGPT citations link to GitHub READMEs and docs files), accept external PRs for typo fixes, and surface on GitHub's docs-trending lists. This page is the runbook: how the repo is created, the branch-protection settings, the GitHub Actions workflow that builds and deploys, the secrets the workflow needs, the contributor flow for an external PR, and the metadata files that make the repo a first-class GitHub citizen.

The repo's scope is narrow on purpose. It contains the Docusaurus source, the deploy workflow, the README, the LICENSE, the CONTRIBUTING and CODE_OF_CONDUCT files, and the `llms.txt` / `pricing.md` machine-readable files. It does not contain the application source, secrets, or any private-tenant data. The split is enforced at the file-tree level — there is no path inside the docs repo that ever needs to import from the application repo.

---

## At-a-glance

| Property | Value |
|---|---|
| Repository | `https://github.com/aoneahsan/labflow-docs` (planned; submission pending) |
| Visibility | Public |
| Default branch | `main` |
| Branch protection on `main` | Required PR review (1 approver), required status checks (typecheck + build + broken-link check), no direct push, no force push |
| License | Apache License 2.0 (permits forks, requires attribution) |
| GitHub Actions workflow | `.github/workflows/deploy-pages.yml` builds on every push + PR and publishes to **GitHub Pages** on merge to `main` |
| Secrets in repo settings | **None.** Publishing uses a short-lived OIDC token GitHub issues to the workflow run |
| Author | Ahsan Mahmood — credits surfaced on the [Author page](/docs/author) and in the per-page `Article` JSON-LD |

---

## Repository creation

The repo is created in the `aoneahsan` GitHub organisation account, not in a personal namespace, so future ownership transfers are clean and the repo URL is stable. The `gh` CLI handles the creation:

```bash
gh repo create aoneahsan/labflow-docs \
  --public \
  --description "Official documentation for LabFlow — multi-tenant Laboratory Information Management System." \
  --homepage "https://labflow-docs.aoneahsan.com" \
  --clone

cd labflow-docs
# Populate from the existing docs-site/ tree
rsync -a --exclude='node_modules' --exclude='build' \
  /home/ahsan/Documents/01-code/projects/labflow/docs-site/ .
git add .
git commit -m "Initial public docs"
git push origin main
```

The push lands the initial content. The next steps configure the repo's GitHub settings.

---

## Branch protection on `main`

The protection rules:

| Rule | Setting |
|---|---|
| Require pull request before merging | ✓ |
| Required approving reviews | 1 |
| Dismiss stale approvals when new commits push | ✓ |
| Require review from Code Owners | ✓ (the CODEOWNERS file lists `@aoneahsan` for `/docs/**`) |
| Require status checks to pass | ✓ — `typecheck`, `build`, `broken-link-check` |
| Require branches to be up to date before merging | ✓ |
| Require conversation resolution before merging | ✓ |
| Require signed commits | ✓ |
| Require linear history | ✓ (no merge commits; rebase-and-merge or squash-and-merge only) |
| Restrict pushes to matching branches | ✓ (only the GitHub Actions service account and the maintainer can push) |
| Allow force pushes | ✗ |
| Allow deletions | ✗ |

These rules apply only to `main`. Feature branches and PR branches are unrestricted; the GitHub Actions workflow runs against PR branches and reports its result on the PR.

---

## The GitHub Actions deploy workflow

The workflow lives at `.github/workflows/deploy-pages.yml` and is the **only** thing that publishes this site. It is also the single sanctioned exception to the house rule that GitHub Actions stay inert in every other repository.

Its shape, in the order it runs:

| Step | What it does |
|---|---|
| `actions/checkout@v4` with `fetch-depth: 0` | Full history — `showLastUpdateTime` / `showLastUpdateAuthor` read git, so a shallow clone makes every page claim it was updated today |
| `actions/setup-node@v4`, Node 24, `cache: yarn` | |
| `yarn install --immutable` | Fails if `yarn.lock` is out of date rather than silently resolving something new |
| `yarn build` | The build **is** the link checker — `onBrokenLinks` fails it |
| Ops-file guard | Fails if anything matching `*MANUAL-TASKS*` reached `build/`. The failure mode it catches is silent and public, so it is asserted rather than trusted |
| CNAME guard | Fails if `build/CNAME` is missing, which would silently drop the custom domain |
| `actions/upload-pages-artifact@v3` | Uploads `build/` |
| `actions/deploy-pages@v4` | Publishes, in a separate job gated on the build |

The permissions block is `contents: read`, `pages: write`, `id-token: write`, and `concurrency` is `group: pages` with `cancel-in-progress: false` — a half-published site is worse than a slightly stale one.

---

## Secrets management

🔴 **There are none, and that is the point.** Publishing uses a short-lived OIDC token that GitHub mints for the workflow run itself (`id-token: write`), so there is no deploy credential to store, leak, or rotate.

**This repository is public.** No secret may ever enter it — only `.env.example` with placeholder values. Anything genuinely secret lives in the owner's secret store, and any build-time value a future step needs goes in repository **Actions secrets**, read by the workflow and never committed.

A docs build must never *require* a secret to succeed: an absent key means the feature that needed it is skipped, not that the site fails to publish.

Sweep before every commit — this must return nothing:

```bash
git ls-files | grep -iE '(^|/)\.env$|\.env\.(local|production)|secret|credential|serviceaccount|\.pem$|\.jks$|\.keystore$|\.p8$|\.npmrc'
```

**IndexNow is not wired into this workflow.** Submitting changed URLs is a manual step, documented in [Search-Engine Submission](/docs/deployment/search-engines). If it is ever automated, the key file must reach the published site *before* the key is used, or IndexNow rejects the request because the served key does not match the one presented.

---

## Contributor flow

The contributor flow for an external PR:

1. Fork the repo via the GitHub UI.
2. Clone the fork locally and create a feature branch.
3. Make changes; commit; push to the fork.
4. Open a PR against `aoneahsan/labflow-docs:main`.
5. The PR build runs (typecheck + build + broken-link). The preview channel is created and posted as a PR comment.
6. A maintainer reviews the rendered preview at the preview URL.
7. On approval, the PR is squash-merged. The `main`-branch workflow deploys to production within 2 minutes.

The CONTRIBUTING.md file in the repo carries the canonical contributor reference: code-style conventions, the per-page-uniqueness floor (definition-first, FAQ, etc. from the [SEO playbook](/docs/deployment/search-engines)), and the link to file an issue if the contributor would rather flag a problem than fix it themselves. The CODE_OF_CONDUCT.md file is the standard Contributor Covenant v2.1.

External PRs do not get write access to secrets — GitHub Actions' security model gates secret access to PRs from the same repo or PRs whose authors are members of the repo. An external PR's CI run skips the deploy step (no access to `FIREBASE_SERVICE_ACCOUNT_LABFLOW_PROD`) and only runs the typecheck + build + broken-link gate. A maintainer who wants to publish the external PR's preview re-runs the workflow under the maintainer's identity after pulling the PR locally.

---

## Repo metadata files

Files at the root of the repo that GitHub renders specially:

| File | Purpose |
|---|---|
| `README.md` | Repo landing — what LabFlow is, links to live docs and the main app site, contributor badge, build badge |
| `LICENSE` | Apache License 2.0 |
| `CONTRIBUTING.md` | Contributor flow (above) and content conventions |
| `CODE_OF_CONDUCT.md` | Contributor Covenant v2.1 |
| `SECURITY.md` | How to report a security issue privately (email + GitHub Security Advisories) |
| `.github/CODEOWNERS` | `/docs/** @aoneahsan` so docs reviews route to the maintainer |
| `.github/ISSUE_TEMPLATE/` | Templates for "Report a docs issue", "Suggest a topic", "Request an example" |
| `.github/PULL_REQUEST_TEMPLATE.md` | PR description scaffold with the per-page-uniqueness checklist |
| `.editorconfig` | Editor settings for consistency across contributors |
| `.gitattributes` | LF line endings on all text files |

The README's badges:

```markdown
![Build](https://github.com/aoneahsan/labflow-docs/actions/workflows/deploy.yml/badge.svg)
![License](https://img.shields.io/github/license/aoneahsan/labflow-docs)
![Last commit](https://img.shields.io/github/last-commit/aoneahsan/labflow-docs)
![Open issues](https://img.shields.io/github/issues/aoneahsan/labflow-docs)
[![Live docs](https://img.shields.io/badge/docs-live-blue)](https://labflow-docs.aoneahsan.com)
[![LabFlow app](https://img.shields.io/badge/app-labflow.aoneahsan.com-purple)](https://labflow.aoneahsan.com)
```

---

## Why this drives discoverability

A public GitHub repo is more than a contributor surface — it is one of the highest-leverage AI search signals available. The Princeton GEO study (KDD 2024) documented that AI engines cite Wikipedia (~7.8% of ChatGPT citations), Reddit (~1.8%), and GitHub heavily; a docs-only repo with a strong README and a clean contributor flow lands on GitHub Explore's docs category, which feeds into AI-search citation pools.

The repo also gives Google's crawler an additional path into the documentation. The repo's README contains canonical-URL links to the live docs, the GitHub stars and recency signals carry weight in domain-authority computation, and the absence of secrets / private artefacts means the crawler indexes the repo without flagging it as low-signal.

The trade-off is the maintenance cost of keeping the public repo in sync with the live docs. The CI workflow handles this — every change to the public repo's `main` branch triggers a build and a deploy of the live docs site, so the two are guaranteed to track.

---

## Frequently asked questions

### Is the repo public today?

The submission to create the public repo is pending. The plan above is the canonical setup; the live URLs (`https://github.com/aoneahsan/labflow-docs`) will be live once the submission lands. The [Deployment Overview](/docs/deployment/overview#frequently-asked-questions) tracks the status.

### Why Apache 2.0 instead of MIT or GPL?

Apache 2.0 is the canonical permissive license for documentation in the enterprise-software space. It allows forks (the freedom that GitHub contributors expect) and requires attribution (the recognition the maintainer expects), while explicitly granting a patent license to contributors — which matters in the healthcare-software space where patent claims can be a real concern. MIT does the first two but is silent on patents; GPL is more restrictive than docs typically need.

### Can the public docs repo accept contributions from anonymous accounts?

GitHub accounts are identity-bound (an email, optionally a verified identity badge). The PR flow gates on the CI build's broken-link check and on at least one maintainer approval. There is no contributor agreement (CLA) — the Apache 2.0 license inbound-equals-outbound model means a contributor's PR is licensed under Apache 2.0 by virtue of being a PR; no separate signature is required. This matches the OpenJS Foundation pattern.

### How do you handle a contributor who reports a security issue?

The SECURITY.md file points contributors at the GitHub Security Advisories private channel (Settings → Security → Security advisories → Create draft) and a fallback email. A private advisory lets the maintainer fix the issue and coordinate disclosure before publishing the patch. The Apache 2.0 license does not affect this — security disclosure is an out-of-band channel separate from the normal PR flow.

### What's the cadence for major content updates?

The release cadence is per-batch (per the [build plan](/docs/intro#how-this-documentation-is-organised)) until the docs catch up to the latest application code. After the initial fill, the cadence drops to per-major-app-release (with content audits per quarter as documented in the [overview](/docs/deployment/overview#per-quarter)). Each release ships a tagged commit on the docs repo with the matching app version in the tag (`v1.2.1-docs`), so a customer reading old docs can find the matching docs version.

### Are PRs auto-merged after CI passes?

No. The protection rule requires at least one approving review and conversation-resolution before merge. Auto-merge is enabled (the maintainer can press the Auto-merge button on a PR to merge once gates pass), which is the canonical workflow for trusted contributors' PRs. External PRs from new contributors require an explicit merge action by the maintainer.

### How does the docs repo handle the LabFlow private repo's release tags?

The two repos are versioned independently. The docs repo's tags match the app repo's tags by convention (`v1.2.1` in both), but the docs repo's source code lives behind its own version control — there is no sync script that mirrors commits across repos. The independence is deliberate: a typo fix on the docs repo does not need to wait for the next app release; a feature update in the app repo does not force a docs-repo commit until the documentation is ready.

### How do AI search engines find the public repo?

GitHub publishes a sitemap of public repos (`https://github.com/sitemap.xml`) that the crawlers consume. The repo's README is the canonical entry — its content is rendered as the repo's landing page and is indexed verbatim. AI crawlers (GPTBot, ClaudeBot, PerplexityBot) follow the same path; GitHub does not block AI crawlers from public repos. The robots.txt at the docs subdomain explicitly allows the same crawlers; the two paths (GitHub README + live docs site) reinforce each other in search citations.

---

**Next:** [Search-Engine Submission](/docs/deployment/search-engines).
