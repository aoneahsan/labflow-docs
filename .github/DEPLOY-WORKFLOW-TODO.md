# Pages deploy workflow — owner step

The GitHub Actions Pages workflow (`.github/workflows/deploy.yml`) could not be
pushed by the automation token (missing `workflow` OAuth scope). To add it:

1. `gh auth refresh -s workflow` (owner, interactive)
2. Copy `deploy.yml` from the private app repo `docs-site/.github/workflows/deploy.yml`
   into `.github/workflows/deploy.yml` here, commit, push.
3. GitHub → Settings → Pages → Source: **GitHub Actions**.

Until then, the site is served by Firebase Hosting at docs.labflow.aoneahsan.com.
