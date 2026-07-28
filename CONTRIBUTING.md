# Contributing to LabFlow Documentation

Thank you for helping improve the LabFlow docs. This repository (`labflow-docs`) holds **only the documentation site** — a Docusaurus build published at [labflow-docs.aoneahsan.com](https://labflow-docs.aoneahsan.com). The LabFlow application itself lives in a separate, private repository; this repo carries no application source, secrets, or tenant data.

## Governance — how changes land

`main` is protected. Nobody pushes application changes straight to it.

- **All changes go through a pull request.** Fork the repo (or branch, if you have write access), commit to a feature branch, and open a PR against `main`.
- **A PR needs at least one approving review and passing CI** (build + broken-link check) before it can merge.
- **Direct pushes to `main` are restricted to the repository owner** (`@aoneahsan`), who maintains the site. Write access does **not** grant a bypass — even collaborators go through review.
- Force-pushes to `main` and branch deletion are blocked.

## How to contribute

### 1. Fork and clone

```bash
# Fork via the GitHub UI, then:
git clone https://github.com/<you>/labflow-docs.git
cd labflow-docs
yarn
```

### 2. Make your change

```bash
yarn start        # dev server (note: local search only appears after a build)
```

- Every doc page needs `title` and `description` front matter (a page without them is invisible to search and ships an empty meta description); add `tags`/`keywords` where useful.
- Add new pages to `sidebars.ts` in the same change, under the right category.
- Keep prose accurate and honest — describe what the product actually does today; mark anything not yet shipped as *roadmap*. Do not add fabricated capabilities, statistics, or claims.
- Do not commit secrets. Environment-variable **names** are fine; never commit a real key, token, or credential value.

### 3. Verify

```bash
yarn build        # must succeed with no broken internal links; also builds the Pagefind search index
```

The Docusaurus build is the link checker — a broken internal link fails the build.

### 4. Open a pull request

- Write a clear description of what changed and why.
- The CI workflow runs the build (and link check) on your PR. Fix any failures.
- A maintainer reviews and merges once CI is green and the review is approved.

## Reporting an issue instead of fixing it

Prefer to flag a problem rather than fix it yourself? Open a GitHub issue describing the page and the problem. Please do not include private data or reproduction details that reference a real tenant.

## Commit style

Use clear, conventional commit messages (e.g. `docs: correct the results-release flow`). One focused change per PR is easiest to review.

## Support the project

If LabFlow's docs have helped you and you'd like to give back, you can support the project here:

**https://aoneahsan.com/payment?project-id=labflow-docs&project-identifier=labflow-docs**

(This is the only supported way to contribute financially — please do not add Open Collective, GitHub Sponsors, or other donation links.)

## License

By contributing, you agree that your contributions are licensed under the same license as this repository.
