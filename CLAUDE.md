# LabFlow documentation instructions

**Last Updated:** 2026-10-21 — Pass 2 packages, build and controlled browser verified; next same-prompt eligibility 2026-11-13

| Context Budget Last Verified | 2026-10-14 — guides mirrored; no PENDING-TASKS.md; routine re-check due 2026-11-13 |
|---|---|


This is the companion documentation site boundary. This file and its sibling are mirrors. Read **one native
guide only**: Claude Code reads `CLAUDE.md`; other agents read `AGENTS.md`.

This public repository is the documentation site's source of truth. `.github/workflows/deploy-pages.yml`
builds and deploys `main` to GitHub Pages at `labflow-docs.aoneahsan.com`; there is no private-to-public
copy or `rsync` publication step. The private application repository remains a fact source only.

Read `README.md` and package scripts first, then only the target document, its sidebar/navigation entry, and
one neighboring page whose structure you are matching. Do not preload the whole docs tree, generated site,
static assets, search index, or the application. Search the app or planning records only for the exact
product fact the document must prove.

Documentation must describe shipped, source-verifiable behavior. Never invent routes, features, versions,
platform availability, performance claims, or release status. A redevelopment-planning record is intent, not
proof that the app ships it. Keep task work ahead of documentation work; edit an existing page instead of
creating status/summary files unless the owner asks.

Scan the complete skill catalog, then load only current-phase matches such as documentation, docs-site,
copywriting, accessibility, or SEO. Defer later release/deploy skills until that boundary. Use one writer;
a bounded packet contains exact pages, navigation/config files, verified fact sources, and build gates.

This docs repository is public: never commit `.env`, credentials, private planning records, or server
secrets. Use the project package manager and existing scripts. For Vite-backed config keep
`logLevel: 'info'`, compressed-size reporting enabled, and production source maps disabled. Run the
documented typecheck/build/link gates; do not deploy unless the owner explicitly requests it.

## Stop-work Git gate

<!-- RULE:stop-work-git-gate v2026-10-20 -->

Before stopping, commit every legitimate change and work-progress checkpoint in this repository and each independent nested repository, fetch and merge the designated upstream, push the documented working branch, then verify an empty worktree and `0 0` ahead/behind. Never stash, discard, reset, rebase, or force-push. If synchronization is blocked, report the exact repository, branch, blocker, and next action instead of calling the work complete. The full workflow remains authoritative in `~/.claude/rules/git-workflow.md`.
