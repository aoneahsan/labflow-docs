# LabFlow Documentation

The public documentation site for **LabFlow** — a multi-tenant Laboratory Information Management System (LIMS). Built with [Docusaurus](https://docusaurus.io/). Live at **https://labflow-docs.aoneahsan.com**.

## Source and deployment

This repository, **`labflow-docs`**, is the source of truth for the documentation site. It is separate from the private LabFlow application repository and contains no application source, secrets, or tenant data.

The GitHub Actions workflow at [`.github/workflows/deploy-pages.yml`](./.github/workflows/deploy-pages.yml) builds the site and deploys it to GitHub Pages on every push to `main`. The custom domain is recorded in [`static/CNAME`](./static/CNAME).

## Local development

```bash
yarn            # install
yarn start      # dev server (search is intentionally absent in dev — see below)
yarn build      # production build + local Pagefind search index
yarn serve      # serve the real build (verify search here)
```

## Search

In-site search is **Pagefind** — a fully-local, build-time full-text index (no third-party service, no crawler, no account). It is generated in a `postBuild` hook, so `yarn build` alone produces a working search. Because the index only exists after a build, search does not appear under `yarn start`; verify it with `yarn build && yarn serve`. See [Hosting and publishing](./docs/deployment/overview.md#search).

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md). `main` is protected — changes land through a pull request with review and passing CI; only the owner pushes to `main` directly.
