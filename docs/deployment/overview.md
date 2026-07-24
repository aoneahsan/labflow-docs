---
sidebar_position: 1
slug: /deployment/overview
title: Deployment Overview
description: How the LabFlow documentation site ships — Firebase Hosting target, GitHub-public source repo, search-engine submission cadence, Algolia DocSearch, and the deploy gate that holds the build clean.
keywords:
  - LabFlow docs deployment
  - Docusaurus Firebase Hosting
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
| Host | Firebase Hosting |
| Source repo | Public GitHub — `https://github.com/aoneahsan/labflow-docs` (planned; submission pending) |
| Primary URL | `https://docs.labflow.aoneahsan.com` (planned subdomain) |
| Fallback URL | `https://labflow.aoneahsan.com/docs` (the LabFlow homepage's docs route, if the subdomain is delayed) |
| Build command | `yarn build` (in `docs-site/`) |
| Deploy command | `firebase deploy --only hosting` (filtered to the docs-site target) |
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
| [Firebase Hosting](/docs/deployment/firebase-hosting) | The `firebase.json` config, hosting target, custom domain, cache headers, preview channels, rollback |
| [GitHub Publishing](/docs/deployment/github-publish) | Creating the public docs repo, the GitHub Actions workflow, branch protection, contributor on-boarding |
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

## Why static + Firebase Hosting (not Next.js + Vercel, not S3 + CloudFront)

Three reasons. First, Docusaurus is a static-site generator; the runtime advantage of a SSR framework like Next.js doesn't apply — every page is pre-rendered HTML, and adding SSR would only add latency. Second, Firebase Hosting is integrated with the rest of the LabFlow operational surface (the main web app is hosted on Firebase too, alongside Firestore + Auth). One vendor, one billing surface, one set of credentials. Third, the CDN performance of Firebase Hosting is competitive with the others — global edge presence, automatic HTTP/2 / HTTP/3, free TLS, low-cost per request. The Vercel-style automatic-preview-on-PR feature exists in Firebase Hosting too (preview channels) and is documented in the [Firebase Hosting page](/docs/deployment/firebase-hosting#preview-channels).

The trade-off vs. a generic S3 + CloudFront stack is that some of the cost knobs (cache invalidation strategy, edge-location routing) are less granular in Firebase Hosting. For a docs site whose traffic is far from those limits, the trade-off is fine.

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

The build is currently published from the integrated build folder under the main LabFlow project, and the public subdomain at `https://docs.labflow.aoneahsan.com` is provisioned but pending DNS-cutover. Until the cutover lands, the canonical URL is `https://labflow.aoneahsan.com/docs`, which serves the same content. The [LabFlow homepage](https://labflow.aoneahsan.com) carries the live status banner during the transition.

### How long does a deploy take?

The build takes 15–30 seconds (Docusaurus is fast). The Firebase Hosting upload is bounded by the diff against the previous deploy — a typical small change uploads 1–5 MB and is live within 30 seconds of the upload starting. End-to-end from `git push` to live is typically 2 minutes including the CI build.

### Can the docs site be rolled back?

Yes — Firebase Hosting keeps a release history. A rollback is one click in the Firebase Console (Hosting → Release history → Rollback) or one command (`firebase hosting:clone source-site:source-channel target-site:live --version-id <previous>`). The rollback is a pointer change at the CDN edge and is effective within ~30 seconds.

### What's the contributor flow for an external PR?

A contributor forks the public docs repo, files a PR against `main`, and the PR-build runs (typecheck + build + broken-link / broken-anchor). On approval and merge, the production deploy runs automatically. The full flow is documented at [GitHub Publishing](/docs/deployment/github-publish#contributor-flow).

### How do I deploy a preview of a draft PR before merging?

The PR-build workflow creates a Firebase Hosting preview channel and posts the preview URL as a PR comment. The preview persists for 7 days (configurable) and is a working static deploy at a URL like `https://labflow-docs--pr-42-x1y2z3.web.app`. Reviewers click the link and read the rendered content, which catches a class of MDX-rendering defects that the build-time link checker doesn't see.

### Is there a CDN cache warmup step?

Firebase Hosting's CDN warms automatically on the first request per edge location after a deploy. For a docs site whose traffic is steady, the warm-up is invisible. For a release that's expected to draw an unusual spike (e.g. a public launch), a small script can pre-warm by issuing parallel HEAD requests to the top 30 URLs from a few geographic locations — this is documented in the [Firebase Hosting page](/docs/deployment/firebase-hosting#cdn-warm-up).

### How is the deploy gated against broken links and broken anchors?

The Docusaurus build flags both as warnings or errors based on the `onBrokenLinks` and `onBrokenAnchors` config (`throw` in production). The CI pipeline runs the build with the throw setting; a broken link or broken anchor fails the build and blocks the merge. The discipline has caught multiple genuine defects (a renamed module anchor, a removed page link not updated everywhere) before they reached production.

### Who has permission to deploy to production?

The Firebase project's `Editor` role on the hosting target. The default deployer list is the LabFlow engineering team; merging to `main` runs the deploy as the GitHub Actions service account, which holds a dedicated short-lived token issued from a Google service account and never the personal credentials of the engineer who merged. The audit log on the Firebase project tracks every deploy.

---

**Next:** [Firebase Hosting](/docs/deployment/firebase-hosting).
