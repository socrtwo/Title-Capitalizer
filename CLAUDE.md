# CLAUDE.md

A Microsoft Office Add-in (Word, Excel, PowerPoint) that applies title-case
using eight different style guides (AP, APA, Chicago, MLA, NY Times,
Wikipedia, Bluebook, AMA) plus a handful of other case conversions. Runs on
Windows, Mac, Web, and iPad Office — anywhere Office add-ins are supported.
Hosted at `https://socrtwo.github.io/Title-Capitalizer/` via GitHub Pages.

## Repo map

- `src/` — add-in source (HTML/JS for the task pane and ribbon commands).
- `manifest.xml` — the Office add-in manifest. Office loads everything via
  the URLs declared here, so a typo here breaks every platform at once.
- `assets/` — icons and images referenced by the manifest.
- `installers/` — per-platform install kits / sideload bundles.
- `releases/` — pre-packaged release archives committed to the repo.
- `scripts/` — packaging helpers.
- `tests/` — capitalization tests for each style guide.
- `package.json` — npm scripts (build, package, lint).
- `.github/workflows/build-releases.yml` — packages release artifacts.

## Branch policy

Work on the assigned feature branch:

1. Commit and push the feature branch.
2. **Open a PR from the feature branch to `main`** using the GitHub MCP
   tools (`mcp__github__create_pull_request`). Do not merge directly —
   the maintainer reviews and merges.
3. The Pages deployment (the live add-in URL) updates from `main`. Until
   the PR merges, your changes are not live to Office clients.

## Verifying changes

- Run `npm test` (or `npm run test`) before pushing to validate the
  style-guide capitalization rules.
- Manifest validity: use `npx office-addin-manifest validate manifest.xml`
  — Office will silently fail to load an invalid manifest.
- For visual changes, sideload `manifest.xml` into Word/Excel/PowerPoint
  on the Web (fastest loop). Desktop hosts cache aggressively.

## Gotchas

- Office Add-ins are loaded from HTTPS URLs in the manifest. After
  changing the manifest, bump the version string or hosts may serve a
  cached older version indefinitely.
- ALL-CAPS acronym preservation (NASA, HTML, …) is opt-in and case-fold
  rules differ per style guide — don't change one guide's logic to fix
  another's edge case.
- Smart-quote conversion runs *after* the case transform. Order matters
  for tests; preserve it.
- iPad Office only supports a subset of the JavaScript API. Don't reach
  for APIs that aren't in the common-denominator set without a feature
  check.
