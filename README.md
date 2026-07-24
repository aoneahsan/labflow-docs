# LabFlow Documentation

The public documentation site for **LabFlow** — a multi-tenant Laboratory Information Management System (LIMS). Built with [Docusaurus](https://docusaurus.io/). Live at **https://docs.labflow.aoneahsan.com**.

## Source of truth vs. public copy

- **This directory (`docs-site/`) is the source of truth.** It lives inside the **private** LabFlow application repository.
- The public repository **`labflow-docs`** is a **copy** of this directory, published so the docs are crawlable and contributor-friendly. It does not contain any application source, secrets, or tenant data.

**Sync (private → public):** copy this directory's contents into the public repo and push. From the repo root, roughly:

```bash
rsync -a --delete \
  --exclude 'node_modules' --exclude 'build' --exclude '.docusaurus' \
  docs-site/ ../labflow-docs/
# then, in ../labflow-docs: git add -A && git commit && git push
```

The public repo's own GitHub Actions workflow (`.github/workflows/deploy.yml`) builds the Docusaurus site and deploys it to GitHub Pages on every push to `main`.

## Local development

```bash
yarn            # install
yarn start      # dev server (search is intentionally absent in dev — see below)
yarn build      # production build + local Pagefind search index
yarn serve      # serve the real build (verify search here)
```

## Search

In-site search is **Pagefind** — a fully-local, build-time full-text index (no third-party service, no crawler, no account). It is generated in a `postBuild` hook, so `yarn build` alone produces a working search. Because the index only exists after a build, search does not appear under `yarn start`; verify it with `yarn build && yarn serve`. Details: `docs/deployment/algolia-docsearch` (Local Search).

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md). `main` is protected — changes land through a pull request with review and passing CI; only the owner pushes to `main` directly.
