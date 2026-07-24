---
sidebar_position: 6
slug: /deployment/launch-checklist
title: Launch Checklist
description: The end-to-end checklist to take the LabFlow docs site from "built and deployable" to "publicly launched and discoverable" — every step from final DNS cutover through search-engine submission, Algolia DocSearch activation, social shares, and the 30-day post-launch monitoring window.
keywords:
  - LabFlow docs launch
  - docs site launch checklist
  - Docusaurus launch
  - documentation go-live
  - post-launch monitoring
---

# Launch Checklist

**This is the runbook for taking the LabFlow documentation site from "built and deployable" to "publicly launched and discoverable".** It is the linear, dated set of steps a launch operator runs through on the chosen launch date and the 30 days that follow. Most steps are one-time; a few (search-engine monitoring, content-freshness checks) recur on a documented cadence. The checklist assumes the per-batch build work is complete (all 12 batches in the [build plan](https://github.com/aoneahsan/labflow-docs/blob/main/docs/audit/2026-05-10-docs-site-build-plan.md) closed) and the infrastructure pieces from the [Deployment Overview](/docs/deployment/overview) are in place. The checklist is a working document — the launch operator ticks items as they complete; the gaps surface what's still in flight.

If a step is blocked or cannot ship on time, the canonical move is to skip it (mark blocked + a one-line reason) and continue. A delayed launch costs more than a launch with one or two known-deferred items.

---

## Pre-launch (T-7 days)

| # | Step | Owner | Verification |
|---|---|---|---|
| 1 | All 12 build batches complete; tracker `lastFullCompletion.date` set | Engineering | `cat docs/tracking/docs-site-build-tracker.json` |
| 2 | `yarn typecheck && yarn build` clean on `main` | Engineering | CI green on latest commit |
| 3 | Manual spot-check of 10 random pages in the preview build | Engineering | Spot-check pass |
| 4 | `robots.txt` carries the AI-bot allowlist + sitemap reference | Engineering | `curl https://docs.labflow.aoneahsan.com/robots.txt` |
| 5 | `sitemap.xml` includes every public page with valid `lastmod` | Engineering | `xmllint --noout sitemap.xml` |
| 6 | `llms.txt` published at the site root | Engineering | `curl https://docs.labflow.aoneahsan.com/llms.txt` |
| 7 | `IndexNow` API key file published at the site root | Engineering | `curl https://docs.labflow.aoneahsan.com/<key>.txt` |
| 8 | Algolia DocSearch application approved; appId + apiKey wired in `docusaurus.config.ts` | Engineering | Search box renders in preview |
| 9 | Firebase Hosting custom-domain DNS verified | Operations | Firebase Console → Hosting → Custom domains → Connected |
| 10 | TLS certificate provisioned (Let's Encrypt via Firebase) | Operations | `https://docs.labflow.aoneahsan.com` shows valid cert |
| 11 | GitHub repo public; README + LICENSE + CONTRIBUTING + CODE_OF_CONDUCT + SECURITY committed | Engineering | Visit `https://github.com/aoneahsan/labflow-docs` |
| 12 | Branch protection on `main` configured per the [GitHub Publishing](/docs/deployment/github-publish#branch-protection-on-main) rules | Engineering | GitHub Settings → Branches |
| 13 | CI service account JSON key in GitHub Actions secrets | Engineering | Repo → Settings → Secrets → Actions |
| 14 | The [LabFlow homepage](https://labflow.aoneahsan.com) carries a "Docs are live" banner draft | Marketing | Pre-launch staging URL |

---

## Launch day (T-0)

| # | Step | Owner | Verification |
|---|---|---|---|
| 15 | Cut DNS over to the docs subdomain (`docs.labflow.aoneahsan.com`) | Operations | DNS propagation check via `dig docs.labflow.aoneahsan.com` |
| 16 | Verify the canonical URL resolves with the right content | Operations | Visit `https://docs.labflow.aoneahsan.com/docs/intro` |
| 17 | Remove the `/docs` rewrite from the main app's `firebase.json` (if still in place) | Engineering | `firebase deploy --only hosting:app` |
| 18 | Update every internal link from `https://labflow.aoneahsan.com/docs/...` to `https://docs.labflow.aoneahsan.com/docs/...` (within the docs and within the LabFlow main app) | Engineering | grep across both repos; no remaining old-URL references |
| 19 | Verify canonical `<link rel="canonical">` on a sample of pages points to the new URL | Engineering | View source on 5 random pages |
| 20 | The [LabFlow homepage](https://labflow.aoneahsan.com) "Docs are live" banner goes live | Marketing | Visit homepage |
| 21 | Re-emit `sitemap.xml` (the URLs in it should now use the new domain) | Engineering | `curl https://docs.labflow.aoneahsan.com/sitemap.xml` and verify host |
| 22 | IndexNow ping with the full URL list (one-time post-launch ping is bigger than usual) | Engineering | Inspect the workflow run; expect a 200 response |

---

## Launch + 1 day

| # | Step | Owner | Verification |
|---|---|---|---|
| 23 | Submit `sitemap.xml` to Google Search Console (Domain property under `aoneahsan.com`) | Engineering | GSC → Sitemaps → status `Success` |
| 24 | Submit `sitemap.xml` to Bing Webmaster Tools | Engineering | Bing Webmaster → Sitemaps |
| 25 | Submit `sitemap.xml` to Yandex Webmaster | Engineering | Yandex Webmaster → Sitemap |
| 26 | URL-Inspect the top 10 priority pages in GSC; press "Request Indexing" on each | Engineering | GSC → URL Inspection × 10 |
| 27 | Algolia: trigger an immediate crawl from the DocSearch dashboard | Engineering | Algolia dashboard → Application → Crawl now |
| 28 | Algolia: verify the index populates within 30 minutes (search for a known term, get hits) | Engineering | Open the docs site, press `Cmd+K`, search for "Westgard" |
| 29 | Verify the search-page route renders results (`https://docs.labflow.aoneahsan.com/search?q=westgard`) | Engineering | Direct URL test |

---

## Launch + 3 days

| # | Step | Owner | Verification |
|---|---|---|---|
| 30 | Post a launch announcement on LinkedIn from the developer's account | Marketing | Post live |
| 31 | Post a launch announcement on X / Twitter from the developer's account | Marketing | Post live |
| 32 | File a Show HN post on Hacker News (if relevant audience aligns) | Marketing | Post live |
| 33 | File a Show /r/healthIT post on Reddit (subreddit rules permitting) | Marketing | Post live |
| 34 | File a Product Hunt post (if alignment) | Marketing | Post live |
| 35 | Update the LabFlow listing on Wikipedia (if a page exists; create a draft if not, but Wikipedia notability rules apply) | Marketing | Wikipedia article live or draft submitted |
| 36 | Add the docs URL to the AlternativeTo, G2, Capterra, SaaSHub listings (if LabFlow is listed) | Marketing | Listings updated |

---

## Launch + 7 days

| # | Step | Owner | Verification |
|---|---|---|---|
| 37 | Check Google Search Console → Pages report — `Indexed` count > 0 | Engineering | GSC dashboard |
| 38 | Check Bing Webmaster → Site Explorer — `Indexed` count > 0 | Engineering | Bing dashboard |
| 39 | Check `site:docs.labflow.aoneahsan.com` in Google — expect at least 10 results | Engineering | Manual Google search |
| 40 | Run 10 priority queries in Google, Bing, ChatGPT (web search), Perplexity, Claude (web search) — note which docs pages appear | Engineering | Search-quality spreadsheet |
| 41 | Check the Algolia DocSearch analytics — any no-result queries are content-gap signals | Engineering | Algolia dashboard → Analytics |
| 42 | Review the Firebase Hosting access logs — any 404s indicate broken inbound links | Engineering | GCP Logs Explorer query |

---

## Launch + 30 days

| # | Step | Owner | Verification |
|---|---|---|---|
| 43 | Re-run the 10 priority-query manual check; note month-over-month progress | Engineering | Search-quality spreadsheet (compare to Launch+7) |
| 44 | Check GSC → Performance — top-queries report shows which docs pages are getting impressions | Engineering | GSC dashboard |
| 45 | Check the inbound traffic source mix in Firebase Hosting analytics (organic vs direct vs referral) | Engineering | Analytics dashboard |
| 46 | Address any GSC errors / warnings (mobile usability, Core Web Vitals, broken canonical) | Engineering | GSC → Experience + Coverage tabs |
| 47 | Schedule the first quarterly content-freshness pass (per the [Deployment Overview](/docs/deployment/overview#per-quarter)) | Engineering | Calendar invite for T+90 |
| 48 | File a retro note: what went well, what to do differently next launch | Engineering | Retro doc |

---

## Recurring cadence (post-launch steady state)

| Cadence | Step |
|---|---|
| Per-deploy | IndexNow ping (automatic via GitHub Actions) |
| Weekly | GSC Pages report; verify `Indexed` count climbing |
| Weekly | Algolia DocSearch analytics; flag no-result queries |
| Monthly | 10-priority-query manual check across Google + Bing + ChatGPT + Perplexity + Claude |
| Monthly | Algolia DocSearch dashboard review (click rates, average position) |
| Per major release | Re-submit sitemap to GSC + Bing + Yandex; URL-Inspect top 10 |
| Per quarter | Content-freshness pass (bump `lastUpdated` on changed pages; verify per-page-uniqueness floor still holds) |
| Per quarter | Verify the global SEO playbook at `~/.claude/rules/seo-aeo-ranking.md` for infrastructure drift |

---

## What to skip (and why)

Some items often appear on a launch checklist but are intentionally out of scope here.

**Paid search ads.** This is a docs site, not a product landing page; organic discovery + AI-search citation are the right channels. Paid ads on a docs site rarely return their cost.

**Influencer outreach.** A docs site benefits more from authentic engagement (Reddit, Hacker News, technical-blog mentions) than from sponsored mentions. The relationship between docs quality and authentic-engagement traction is direct; sponsored coverage of a docs site is uncommon.

**Per-page Open Graph image generation.** Docusaurus 3 generates a default OG image; per-page custom images are nice-to-have but the marginal benefit per page is small. This can land in a later iteration if social-share previews matter.

**Multi-language support.** The docs are English-only at launch; the LabFlow product has multi-language support in [Settings → Locale](/docs/modules/settings#locale-form--every-field) but the docs translation is a separate project. If demand emerges, the Crowdin or Lokalise pattern is the canonical next step.

---

## Frequently asked questions

### How long does GSC take to fully index the site?

The Pages report typically shows "submitted" within hours of sitemap submission. The `Indexed` count climbs over 1-4 weeks for the first batch of pages and continues climbing for 4-12 weeks as domain authority builds. Some long-tail pages may never be indexed (Google decides per-page) — that's normal and the per-page-uniqueness floor minimises the count.

### What's the most common launch-day issue?

The DNS cutover. The Firebase Hosting custom-domain wiring relies on DNS pointing to Firebase's load-balancer IPs. A misconfigured `A` record produces a "this site can't be reached" error until it's fixed. The verification step at launch-day item 16 is the early-warning system; have a runbook ready to roll back the DNS change if the new domain doesn't resolve cleanly.

### How do I know when the Algolia index has caught up after a content push?

The DocSearch dashboard shows the last crawl timestamp. After triggering a manual crawl, the index typically updates within 30 minutes. The most reliable verification is to open the docs site, press `Cmd+K`, and search for a term that's in newly-published content — if the search returns the new page, the index is fresh.

### What if the launch day slips?

The checklist is dated relative to T-0 (launch day), not to a calendar date. A slip just shifts everything; nothing breaks. The pre-launch items (T-7) can be done well in advance; the launch-day items are concentrated in a 4-hour window; the post-launch items run on their own cadence regardless of when T-0 actually was.

### Do I need to ping Google after every deploy?

No. Google deprecated its `/ping?sitemap=...` endpoint in mid-2023. The canonical Google flow is to keep the sitemap fresh (which the Docusaurus build does automatically) and let Google's crawl schedule consume it. For the priority pages, URL Inspection + Request Indexing in GSC is the right channel — but that's rate-limited to about 10 URLs per day, so use it sparingly.

### How do I monitor AI-search citations post-launch?

Manually. Run the 10 priority queries in ChatGPT (with web search), Perplexity, and Claude (with search) once a month. Note which docs pages appear and which competitors appear. The Princeton GEO research (KDD 2024) recommends a monthly cadence; weekly is too noisy, quarterly is too slow.

Tooling-side, [Otterly AI](https://otterly.ai), [Peec AI](https://peec.ai), and [ZipTie](https://ziptie.app) automate the same checks across multiple platforms. The free tiers usually cover the priority query set; paid tiers are useful at higher query volumes.

### Is there a launch announcement template?

Not in this repo — the [LabFlow homepage](https://labflow.aoneahsan.com) carries the canonical announcement copy; LinkedIn / X / Reddit posts are derived from it. The copywriting skill (`@copywriting`) is the right tool for drafting variants.

---

## Status — the canonical pending list

At the time of writing, the launch is **not yet complete**. The status of each major pre-launch item:

| Item | Status |
|---|---|
| Build batches 1-12 | Complete |
| Firebase Hosting `docs` target + custom domain DNS | In flight |
| GitHub repo public + Apache 2.0 license | In flight |
| Algolia DocSearch application | Not yet submitted |
| Google / Bing / Yandex Webmaster verification | Pending domain cutover |
| IndexNow key file + workflow integration | Pending domain cutover |
| LabFlow homepage "Docs are live" banner | Pending docs cutover |

The [LabFlow homepage](https://labflow.aoneahsan.com) carries the live status during the transition. The fallback URL `https://labflow.aoneahsan.com/docs` continues serving the docs content until the subdomain cuts over.

---

**Next:** The deployment-and-publishing series ends here. The next deeper read for a launch operator is the post-launch monitoring playbook in the [Deployment Overview](/docs/deployment/overview#cadence-rules) and the [Search-Engine Submission](/docs/deployment/search-engines#monitoring-cadence) cadence table.
