---
sidebar_position: 4
slug: /deployment/search-engines
title: Search-Engine Submission
description: Submitting the LabFlow docs site to Google Search Console, Bing Webmaster Tools, Yandex Webmaster, and IndexNow — verification flow, sitemap submission, robots.txt with AI-bot allowlist, llms.txt, and the monitoring cadence that keeps the indexed-page count climbing.
keywords:
  - Google Search Console submission
  - Bing Webmaster Tools sitemap
  - Yandex Webmaster
  - IndexNow
  - robots.txt AI bots
  - llms.txt
  - GPTBot ClaudeBot PerplexityBot
---

# Search-Engine Submission

**Submitting the docs site to search engines is the difference between "deployed" and "discoverable".** A Firebase Hosting deploy makes the site reachable; submitting the sitemap to Google Search Console, Bing Webmaster Tools, Yandex Webmaster, and (for instant push) IndexNow makes it indexed, ranked, and citable by both traditional and AI search engines. This page is the runbook for each submission target: the verification flow, the sitemap formats each engine expects, the robots.txt that explicitly allows the AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Bingbot, Applebot, CCBot), the `llms.txt` and `pricing.md` machine-readable files that AI search engines consume directly, and the monitoring cadence that keeps the indexed-page count climbing week-over-week.

The work is mostly one-time per search engine (verify the domain, submit the sitemap, configure the canonical URL). The recurring work is per-deploy (IndexNow pings) and per-quarter (a content-freshness pass + a GSC URL-Inspection on the top 20 pages). The full SEO playbook in the project's global rules at `~/.claude/rules/seo-aeo-ranking.md` is the canonical reference for the lessons-learned across LabFlow's other projects; this page applies that playbook to the docs site specifically.

---

## At-a-glance

| Target | Verification method | Sitemap URL | Frequency |
|---|---|---|---|
| Google Search Console | Domain (DNS TXT) or URL prefix (HTML file) | `https://docs.labflow.aoneahsan.com/sitemap.xml` | Submit once; re-submit per major release |
| Bing Webmaster Tools | XML file or meta tag | Same | Submit once; re-submit per major release |
| Yandex Webmaster | HTML file | Same | Submit once; re-submit per major release |
| IndexNow | Key file at `/<key>.txt` | URL list per ping | Per-deploy via GitHub Actions |
| Naver Webmaster | HTML file | Same | Submit once if KR audience is in scope; skip otherwise |
| Baidu Webmaster | HTML file | Same | Submit once if CN audience is in scope; skip otherwise |

---

## robots.txt — the explicit AI-bot allowlist

The `robots.txt` at `https://docs.labflow.aoneahsan.com/robots.txt` is the canonical declaration of which crawlers are welcome. The file ships in `docs-site/static/robots.txt` and is served by Firebase Hosting at the root:

```text
# LabFlow Documentation — robots.txt
# Allow all major search and AI crawlers.

User-agent: Googlebot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Applebot
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: CCBot
Allow: /

User-agent: YandexBot
Allow: /

# Block scraper bots that don't drive traffic.

User-agent: AhrefsBot
Disallow: /

User-agent: SemrushBot
Disallow: /

User-agent: MJ12bot
Disallow: /

User-agent: DotBot
Disallow: /

# Default for any unlisted crawler.

User-agent: *
Allow: /

Sitemap: https://docs.labflow.aoneahsan.com/sitemap.xml
```

Three deliberate choices in this file:

The `Sitemap:` directive at the bottom is the standard place every search engine checks for a sitemap discovery hint. Listing it here is redundant with the manual submission (GSC, Bing, Yandex) but is the canonical signal for engines we haven't manually submitted to.

The explicit allow for each AI crawler (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, anthropic-ai, ChatGPT-User, CCBot, Applebot) is more than the absence of a disallow — it is a positive signal to the crawler that the content is intended to be consumed by AI search. The Princeton GEO study (KDD 2024) documented that AI engines weight crawler-friendliness as a citation factor; the explicit allow is the canonical way to send the signal.

The block on scraper bots (AhrefsBot, SemrushBot, MJ12bot, DotBot) reduces server load from competitive-intelligence crawlers that don't drive traffic. These bots consume the same egress as the search-engine bots without producing citations or referrals; the block is a no-cost win.

---

## llms.txt — the machine-readable AI-search entry

The `llms.txt` file (per the `https://llmstxt.org` spec) lives at `https://docs.labflow.aoneahsan.com/llms.txt` and tells LLM-based search engines how the docs site is organised, where the canonical pages live, and what the project's pricing and licensing terms are. The file is plain text, structured by section, and is consumed by AI engines directly (without an HTML parser intermediating).

The LabFlow docs `llms.txt`:

```text
# LabFlow Documentation

> Multi-tenant Laboratory Information Management System (LIMS) — public documentation.

Author: Ahsan Mahmood (aoneahsan@gmail.com, https://aoneahsan.com)
Source: https://github.com/aoneahsan/labflow-docs
License: Apache License 2.0

## Modules

- [Authentication](https://docs.labflow.aoneahsan.com/docs/modules/authentication): Email / password, Google OAuth, phone OTP, MFA, biometrics, magic-link
- [Patient Management](https://docs.labflow.aoneahsan.com/docs/modules/patient-management): Registration, search, history, documents, insurance
- [Test Catalog](https://docs.labflow.aoneahsan.com/docs/modules/test-catalog): LOINC-integrated catalog, panels, reference ranges
- [Test Orders](https://docs.labflow.aoneahsan.com/docs/modules/test-orders): Order wizard, priorities, templates, requisition print
- [Sample Tracking](https://docs.labflow.aoneahsan.com/docs/modules/sample-tracking): Seven-state lifecycle, barcode + Luhn check digit, chain of custody
- [Results Management](https://docs.labflow.aoneahsan.com/docs/modules/results-management): Four-state validation (Draft → Reviewed → Approved → Released)
- [Quality Control](https://docs.labflow.aoneahsan.com/docs/modules/quality-control): Westgard rules, Levey-Jennings charts, multi-rule sets
- [Billing & Insurance](https://docs.labflow.aoneahsan.com/docs/modules/billing-insurance): Invoices, payments, claims, price lists
- [Inventory](https://docs.labflow.aoneahsan.com/docs/modules/inventory): Stock × lot × location, FEFO/FIFO, reagent-to-result traceability
- [Appointments](https://docs.labflow.aoneahsan.com/docs/modules/appointments): Slot scheduling, reminders, no-show tracking
- [Home Collection](https://docs.labflow.aoneahsan.com/docs/modules/home-collection): Offline-first phlebotomist workflow
- [Reports & Analytics](https://docs.labflow.aoneahsan.com/docs/modules/reports-analytics): Eight system dashboards, custom report builder
- [User Management](https://docs.labflow.aoneahsan.com/docs/modules/user-management): 11 default roles, 177 permissions, RBAC
- [Settings](https://docs.labflow.aoneahsan.com/docs/modules/settings): Branding, locale, working hours, templates, integrations
- [Admin Panel](https://docs.labflow.aoneahsan.com/docs/modules/admin-panel): System health, tenant lifecycle, emergency overrides
- [EMR Integration](https://docs.labflow.aoneahsan.com/docs/modules/emr-integration): HL7 v2, FHIR R4, webhooks
- [Workflow Automation](https://docs.labflow.aoneahsan.com/docs/modules/workflow-automation): No-code rule engine
- [Communication Hub](https://docs.labflow.aoneahsan.com/docs/modules/communication-hub): SMS, email, WhatsApp, push, in-app

## Surfaces

- [Mobile App](https://docs.labflow.aoneahsan.com/docs/modules/mobile-app): Capacitor Android + iOS
- [WXT Browser Extension](https://docs.labflow.aoneahsan.com/docs/modules/wxt-extension): Cross-browser MV3
- [EMR Chrome Extension](https://docs.labflow.aoneahsan.com/docs/modules/emr-chrome-extension): Inject panels into Epic, Cerner, Meditech, Allscripts, athenahealth, eClinicalWorks

## Architecture

- [Overview](https://docs.labflow.aoneahsan.com/docs/architecture/overview)
- [Data Model](https://docs.labflow.aoneahsan.com/docs/architecture/data-model)
- [Firestore Schema](https://docs.labflow.aoneahsan.com/docs/architecture/firestore-schema)
- [Security Rules](https://docs.labflow.aoneahsan.com/docs/architecture/security-rules)

## API

- [Authentication](https://docs.labflow.aoneahsan.com/docs/api/authentication)
- [Errors](https://docs.labflow.aoneahsan.com/docs/api/errors)
- [Conventions](https://docs.labflow.aoneahsan.com/docs/api/conventions)
```

The format is intentionally minimal. The spec at `https://llmstxt.org` is the canonical source for syntax; the LabFlow file is a straight implementation. The file is regenerated by the Docusaurus build (or by a small post-build script) whenever the modules / surfaces / architecture pages change.

---

## sitemap.xml — generated by Docusaurus

Docusaurus emits a sitemap automatically as part of the production build. The sitemap lives at `https://docs.labflow.aoneahsan.com/sitemap.xml` and includes every published page with its `lastmod` derived from the page's git-mtime or its explicit `last_update` front-matter field. The Docusaurus config in `docusaurus.config.ts`:

```ts
presets: [
  [
    'classic',
    {
      docs: {
        // ...
        showLastUpdateTime: true,
      },
      sitemap: {
        changefreq: 'weekly',
        priority: 0.5,
        filename: 'sitemap.xml',
      },
    },
  ],
],
```

The `changefreq: 'weekly'` and `priority: 0.5` are the defaults Google ignores (it weights pages by its own signals, not by sitemap hints). The sitemap is still the canonical place to declare every URL that should be indexed; the per-URL `lastmod` is the part Google does consume.

The sitemap is regenerated on every build. The `lastmod` per URL is set to the git commit timestamp of the page's most recent change (or to the explicit `last_update` field if the front-matter sets one). A deploy that bumps the `lastmod` on a page tells the search engines "this page changed, re-crawl it".

---

## Google Search Console submission

The full flow:

1. Open `https://search.google.com/search-console/welcome`.
2. Add a property — choose **Domain** (preferred) over URL prefix. Domain verification covers HTTP and HTTPS and every subdomain.
3. Enter `aoneahsan.com` (the apex domain, so the verification covers `labflow.aoneahsan.com`, `docs.labflow.aoneahsan.com`, and any future subdomain).
4. Google issues a DNS TXT record. Add it under the `aoneahsan.com` zone (DNS managed in Cloudflare).
5. Wait for verification (typically minutes). Click "Verify".
6. Once verified, navigate to Sitemaps → Add new sitemap → enter `https://docs.labflow.aoneahsan.com/sitemap.xml`.
7. Click Submit. The status changes to "Success" within a few hours.
8. Watch the Pages report (Coverage → Pages) over the next 1–4 weeks. The "Indexed" count climbs as Google crawls; the "Discovered – currently not indexed" and "Crawled – currently not indexed" buckets surface pages that need attention.

URL inspection is the canonical second step. For each of the top 10 pages (the homepage, the modules index, the most-popular modules), use Search Console → URL Inspection → enter URL → Request Indexing. This puts the URL into the priority crawl queue.

The Pages report is the diagnostic surface. The `~/.claude/rules/seo-aeo-ranking.md` playbook covers what each not-indexed bucket means and how to fix it. The most common bucket for a brand-new docs site is "Discovered – currently not indexed" — Google has the URL but hasn't crawled yet — and is resolved by waiting + building domain authority (links from the LabFlow homepage, the GitHub repo, and any third-party citation).

---

## Bing Webmaster Tools submission

The Bing flow mirrors Google's:

1. Open `https://www.bing.com/webmasters/`.
2. Sign in with a Microsoft account.
3. Add a site → enter `https://docs.labflow.aoneahsan.com`.
4. Choose a verification method — XML file at `/BingSiteAuth.xml` is the canonical option (the file ships in `docs-site/static/`).
5. Verify. Submit the sitemap.

Bing's index feeds Yahoo, DuckDuckGo, and a meaningful share of AI search engines that use Bing under the hood (Microsoft Copilot, and parts of ChatGPT Search). A submitted sitemap on Bing reaches a wider AI surface than a sitemap on Google alone — this is the reason the playbook prioritises Bing alongside Google.

---

## Yandex Webmaster submission

For Russian-language traffic and for full coverage of the AI search engines that consult Yandex (some specific Eastern-European queries):

1. Open `https://webmaster.yandex.com/`.
2. Verify with the HTML file method (file at `docs-site/static/yandex_<id>.html`).
3. Submit the sitemap.

Yandex's index is smaller than Google or Bing but is meaningful for the parts of the AI search pool that consult Russian-language results. The flow is one-time and low-effort, so it ships as part of the default setup even when the target audience is English-speaking.

---

## IndexNow — the per-deploy push

[IndexNow](https://www.indexnow.org/) is a protocol that lets a site push notifications of URL changes to participating search engines (Bing, Yandex, Naver, Seznam) within seconds. Google does not participate today but the Bing-backed coverage is a meaningful gain.

The setup:

1. Generate an API key (a UUID). Save it as a GitHub Actions secret `INDEXNOW_API_KEY`.
2. Publish the key as a static file at `https://docs.labflow.aoneahsan.com/<key>.txt` (the file contents are the key itself). This is the ownership proof.
3. After every successful production deploy, POST to `https://api.indexnow.org/IndexNow` with the host, the key, the key-location URL, and the list of URLs whose `lastmod` changed.

The GitHub Actions snippet that ships this is documented in [GitHub Publishing](/docs/deployment/github-publish#the-github-actions-deploy-workflow). The `scripts/changed-urls.js` computes the URL diff between the current sitemap and the previous deploy's sitemap.

The rotation runbook is also documented in [GitHub Publishing](/docs/deployment/github-publish#secrets-management) — the order matters because the key file must exist on the live site before the API key in the workflow secret is updated.

---

## Monitoring cadence

The dashboards that surface the indexing health, with their cadence:

| Dashboard | Cadence | Watch |
|---|---|---|
| GSC → Pages report | Weekly | Indexed count climbing; per-bucket counts moving in the right direction |
| GSC → Performance | Weekly | Impressions and clicks per query; top-performing pages |
| GSC → Sitemaps | Per re-submission | Submitted vs Indexed delta |
| Bing Webmaster → SEO Reports | Weekly | Same shape as GSC |
| Yandex Webmaster | Monthly | Sufficient for a small audience |
| IndexNow → API responses | Per deploy | Success status; rate-limit warnings |
| Direct manual check | Monthly | `site:docs.labflow.aoneahsan.com` in Google; pick a top query and verify the docs appear in the top 5 |

A monthly manual check is the human-in-the-loop. Pick 10 priority queries — `LabFlow LIMS`, `multi-tenant LIMS`, `Westgard rules software`, `FHIR R4 lab integration`, and a few others — and run them in Google, Bing, ChatGPT (with web search), Perplexity, and Claude (with search). Note which docs pages appear (or don't) and which competitors appear instead. The notes feed the next quarter's content-freshness pass.

---

## Submission status — pending

The submission to each engine is **pending the public URL cutover**. Until `https://docs.labflow.aoneahsan.com` is live (DNS in flight per the [Deployment Overview](/docs/deployment/overview#frequently-asked-questions)), the canonical URL is `https://labflow.aoneahsan.com/docs`, which is covered by the main domain's GSC property already. Once the subdomain cuts over, the docs subdomain is added as a separate property and the canonical URL is updated in every page's `<link rel="canonical">` and JSON-LD. The transition is a one-day window; both URLs serve the same content during the transition.

---

## Frequently asked questions

### Why is `Google-Extended` listed separately from `Googlebot`?

`Googlebot` indexes the page for Google Search. `Google-Extended` is the bot that consumes the content for training Gemini and serving Google AI Overviews. Allowing one but not the other is possible (a site can opt out of AI training while keeping search indexing). The LabFlow docs allow both — the docs are explicitly meant to be cited by AI search, and the citation pool is much larger when the content is in the AI training set.

### Should we list every AI bot we can find, or just the major ones?

The major ones are GPTBot, ChatGPT-User, ClaudeBot, anthropic-ai, PerplexityBot, Google-Extended, CCBot, Applebot, and Bingbot. The long-tail of smaller AI crawlers is captured by the `User-agent: *` default-allow at the bottom. There is no benefit to listing each one individually; the wildcard covers them.

### How long does it take Google to fully index a brand-new docs site?

For a small docs site (< 200 pages) with a clear sitemap and the AI-bot allowlist, the typical timeline is 1-4 weeks to "first crawl" of the priority pages, 4-12 weeks to "most pages indexed", and ongoing improvement as domain authority builds. URL inspection + Request Indexing accelerates the first crawl of the top 10-20 pages by a few days. The deeper-tail pages may take longer.

### What about Google's "AI Overview" specifically?

AI Overview appears in ~45% of Google searches today. To be cited in an AI Overview the docs page must (a) be indexed by Google, (b) be cited in a query Google considers AI-Overview-eligible, and (c) match the structure AI Overview prefers (definition-first intros, FAQ blocks, comparison tables). The per-page-uniqueness floor documented in the SEO playbook is the canonical way to hit (c). Whether a specific query produces an AI Overview is Google's decision and is not directly controllable.

### Are there rate limits on Search Console submission?

GSC's URL Inspection / Request Indexing has a soft cap of about 10 URLs per day per property. Submitting more than that produces a "quota exceeded" message that resets the next day. The sitemap re-submission has no documented cap but should be done monthly rather than daily — Google de-duplicates against `lastmod` per URL.

### Does GSC's "Crawled – currently not indexed" mean the page is bad?

Often it means the page is thin (Google crawled it, judged the content insufficient, and chose not to index). The SEO playbook's per-page-uniqueness floor (1000+ words, definition-first intro, 3-5 use cases, 5-8 FAQ entries, distinct title + meta) is the canonical fix — the LabFlow docs were built to that floor on every page, so the bucket should stay small. If a page lands in this bucket despite hitting the floor, the playbook's diagnostic flow at `~/.claude/rules/seo-aeo-ranking.md` covers next steps.

### Should we ping Google after every deploy, the way IndexNow pings Bing?

Google deprecated its ping endpoint (`https://www.google.com/ping?sitemap=...`) in mid-2023. Google now consumes the sitemap on its own crawl schedule; manual pings are no longer accepted. The canonical Google flow is: keep the sitemap fresh, keep the `lastmod` accurate, and use URL Inspection + Request Indexing for the top pages. IndexNow's per-deploy push covers Bing / Yandex / Naver / Seznam; Google's cadence is separate.

### How do I verify that AI bots are actually fetching the site?

The Firebase Hosting access logs (visible via Firebase Console → Hosting → Usage or via the GCP Logs Explorer) carry the `User-Agent` header per request. A query against the logs for `GPTBot|ClaudeBot|PerplexityBot|Google-Extended|CCBot` over the last 7 days shows the bot traffic. A site that allows the bots and serves a sitemap should see steady traffic from each bot within a week of submission.

---

**Next:** [Algolia DocSearch](/docs/deployment/algolia-docsearch).
