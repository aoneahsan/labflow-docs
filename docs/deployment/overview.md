---
sidebar_position: 1
slug: /deployment/overview
title: Deployment Overview
description: How the LabFlow documentation site ships — GitHub Pages target, public source repo, search-engine submission cadence, local Pagefind search, and the deploy gate that holds the build clean.
keywords:
  - LabFlow docs deployment
  - Docusaurus GitHub Pages
  - docs site GitHub
  - LabFlow docs deploy
  - documentation site deploy
---

# Deployment Overview

**The LabFlow documentation site is a static Docusaurus build published from a GitHub repository, with search-engine submission, IndexNow pings, and a built-in local [Pagefind](/docs/deployment/algolia-docsearch) search index as the steps that turn a deploy into a discoverable, indexable, and searchable surface.** The deployment story is intentionally short: build, upload, ping, done. There is no server-side render, no per-request execution, no privileged backend — every page is a static HTML file the CDN serves directly, and the search index is generated from that same static HTML at build time (no third-party search service). The complexity that exists is in the moving parts around the deploy: the GitHub workflow that builds on every push, the search-engine submission cadence that keeps the indexed-page count climbing, and the Pagefind index that powers in-site search.

This page is the entry point. It explains the deploy pipeline at a glance, points to the per-step detail pages, and documents the cadence rules that keep the site discoverable without burning out the search engines' submission rate-limits.

---

## At-a-glance

| Property | Value |
|---|---|
| Build target | Static HTML / CSS / JS (Docusaurus 3 production build) |
| Host | **GitHub Pages** (the only host — this site has no Firebase target) |
| Source repo | Public GitHub — `https://github.com/aoneahsan/labflow-docs` |
| Primary URL | `https://labflow-docs.aoneahsan.com` |
| Build command | `yarn build` |
| Deploy command | None run by hand — `.github/workflows/deploy-pages.yml` builds and publishes on every push to `main` |
| CI / build gate | Typecheck + build + broken-link / broken-anchor checks |
| Indexing rules | `robots.txt` allows GPTBot, ChatGPT-User, ClaudeBot, anthropic-ai, PerplexityBot, Google-Extended, CCBot, Applebot, Bingbot, Googlebot |
| Search-engine submission cadence | Once per major release + IndexNow ping on every deploy |
| In-site search | Algolia DocSearch (free for OSS docs sites) |

---

## The deploy pipeline

```
local: yarn build (writes docs-site/build/)
   ↓
git push (PR or merge to main)
   ↓
GitHub Actions: typecheck + build + broken-link check
   ↓ (on merge to main only)
firebase deploy --only hosting:docs
   ↓
CDN propagation (~1 min)
   ↓
IndexNow ping → Bing + Yandex + Naver instantly notified
   ↓
(monthly) GSC + Bing Webmaster + Yandex Webmaster sitemap re-submission
```

Every PR runs the build and broken-link / broken-anchor check; a failing check blocks merge. Merging to `main` triggers the production deploy. The post-deploy IndexNow ping fires inside the same workflow step so the search-engine notification is part of the deploy, not an out-of-band operation.

---

## What lives in this category

| Page | What it covers |
|---|---|
| [GitHub Publishing](/docs/deployment/github-publish) | The public docs repo, the Pages deploy workflow, the custom domain via `static/CNAME`, branch protection, contributor on-boarding |
| [Search-Engine Submission](/docs/deployment/search-engines) | Google Search Console, Bing Webmaster Tools, Yandex Webmaster, IndexNow, robots.txt, sitemap submission cadence |
| [Algolia DocSearch](/docs/deployment/algolia-docsearch) | The DocSearch application, the crawl configuration, the in-site search box wiring, the per-page metadata that drives result quality |

The [Author + Credits](/docs/author) page also belongs in spirit to this category — it sets the author attribution that surfaces in Algolia results and on every JSON-LD `Article` schema — but it lives at the top level because it is also surfaced from the navbar.

---

## Cadence rules

The submission and refresh cadence balances two pressures: search engines want fresh signals to keep the indexed-page count climbing, but submitting a sitemap too often produces no benefit and risks rate-limit pushback.

### Per-deploy

Every successful production deploy automatically:

1. Regenerates `sitemap.xml` with a fresh `lastmod` per changed page.
2. Pings the IndexNow API with the list of changed URLs.
3. Pushes the updated build to the CDN.

The IndexNow ping is the only search-engine notification that runs per-deploy — it is rate-limit-friendly (the API explicitly supports per-URL pings) and reaches Bing, Yandex, and Naver immediately.

### Per major release (or monthly, whichever comes first)

The release-time cadence:

1. Re-submit `sitemap.xml` to Google Search Console (Search Console → Sitemaps → Resubmit).
2. Re-submit to Bing Webmaster Tools.
3. Re-submit to Yandex Webmaster.
4. Optionally URL-Inspect the top 10 pages in GSC and request indexing for each.

Re-submission is idempotent — search engines de-duplicate against the sitemap's `lastmod` per URL — but it surfaces in the Webmaster Tools dashboards as a "submitted" event that drives the next crawl cycle.

### Per quarter

A content-freshness pass:

1. Bump `lastUpdated` on every page edited in the period (the Docusaurus front-matter field `last_update` if set explicitly; otherwise computed from git `mtime`).
2. Re-emit the sitemap with the new dates.
3. Re-submit per the per-major-release cadence.
4. Spot-check the [LabFlow homepage](https://labflow.aoneahsan.com)'s SEO playbook reference (`~/.claude/rules/seo-aeo-ranking.md`) for any infrastructure that has drifted.

---

## Why static + GitHub Pages (not Next.js + Vercel, not S3 + CloudFront)

Three reasons. First, Docusaurus is a static-site generator; the runtime advantage of an SSR framework like Next.js doesn't apply — every page is pre-rendered HTML, and adding SSR would only add latency. Second, the source of this site is already a public GitHub repository, so Pages needs no second vendor, no separate billing surface, and no deploy credential to store: the workflow authenticates with a short-lived OIDC token GitHub issues to itself. Third, Pages is free at this scale with global edge distribution and automatic TLS on the custom domain.

**The LabFlow application is hosted on Firebase Hosting; this documentation site is not, and deliberately has no Firebase target.** Keeping the two apart means a docs deploy can never touch the app's hosting configuration, and the docs repo needs no access to the Firebase project at all.

The trade-off vs. a generic S3 + CloudFront stack is that the cache knobs are not configurable — Pages sets its own cache headers and offers no invalidation control. For a docs site whose traffic is far from those limits, that is fine.

---

## Why a separate public docs repo (the LabFlow main app repo is private)

The LabFlow application source is private — it carries the multi-tenant data model, the security rules, and the operational glue that a customer's own engineers should not need to read. The documentation, in contrast, is the public face of the product. A separate `labflow-docs` repo lets the documentation be:

| Why | What it enables |
|---|---|
| Crawlable by AI bots and search engines | Wikipedia / Reddit / GitHub-trending traffic and citation in AI-search answers cite the public repo — the private repo is invisible to them |
| Submittable to GitHub trending lists | A docs-only repo qualifies for the GitHub Explore docs category, which surfaces in AI search citations |
| Contributor-friendly | External contributors can file PRs to fix typos and add examples without needing access to the private app source |
| Self-contained at deploy | The Docusaurus build runs against the docs repo's tree only; no leakage from the app repo |

The trade-off is that the two repos must be kept in sync on the rare occasions an architectural truth changes. The cadence rule above covers this: every quarter the docs are re-validated against the application code, and the front-matter `lastUpdated` is bumped where content was refreshed.

The author of the docs (and the credits this category surfaces) is documented at [Author + Credits](/docs/author).

---

## Frequently asked questions

### Where is the docs site live today?

**Not yet — nothing has been published.** The DNS record for `labflow-docs.aoneahsan.com` resolves to GitHub Pages and returns a 404, which is the expected state before a first deploy. It goes live on the first push to `main` after Pages is switched on in the repository settings. There is no interim URL: the docs are not served from the application domain.

### How long does a deploy take?

The build takes 15–30 seconds. The Pages artifact upload and publish add roughly a minute, so end-to-end from `git push` to live is typically two to three minutes including the CI build.

### Can the docs site be rolled back?

There is no host-level rollback — Pages publishes whatever the latest run produced. A rollback is therefore a **git** operation: revert the offending commit on `main` and let the workflow republish. That is slower than a pointer flip but it keeps the published site and the repository in agreement, which a host-level rollback does not.

### What's the contributor flow for an external PR?

A contributor forks the public docs repo, files a PR against `main`, and the PR-build runs (typecheck + build + broken-link / broken-anchor). On approval and merge, the production deploy runs automatically. The full flow is documented at [GitHub Publishing](/docs/deployment/github-publish#contributor-flow).

### How do I deploy a preview of a draft PR before merging?

**You cannot, and this is an honest limitation of the Pages setup.** A GitHub Pages environment publishes one site per repository, so there are no per-PR preview URLs. A PR build proves the site *compiles* and that no link or anchor is broken; to read the rendered content, check out the branch and run `yarn build && yarn serve` locally. If per-PR previews ever become necessary, they would need a second host, which is a deliberate decision not taken.

### Is there a CDN cache warmup step?

No. Pages manages its own edge caching and exposes no warm-up or invalidation control. For a docs site at this traffic level there is nothing to tune.

### How is the deploy gated against broken links and broken anchors?

The Docusaurus build flags both as warnings or errors based on the `onBrokenLinks` and `onBrokenAnchors` config (`throw` in production). The CI pipeline runs the build with the throw setting; a broken link or broken anchor fails the build and blocks the merge. The discipline has caught multiple genuine defects (a renamed module anchor, a removed page link not updated everywhere) before they reached production.

### Who has permission to deploy to production?

Nobody deploys by hand, and there is no deploy credential to hold. Publishing is done by the `deploy-pages.yml` workflow using a short-lived OIDC token GitHub mints for the run itself — so the permission that matters is **who can merge to `main`**, which the branch ruleset governs. Every publish is therefore attributable to a merge commit, and the workflow run log is the audit trail.

---

**Next:** [GitHub Publishing](/docs/deployment/github-publish).
