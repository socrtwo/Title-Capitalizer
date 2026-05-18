# Title Capitalizer

A Microsoft Office Add-in that applies title case to your selected text in
**Word**, **Excel**, and **PowerPoint**, using the same eight style
guides supported by the [Capitalize My Title](https://capitalizemytitle.com)
service:

- **AP** (Associated Press)
- **APA** (American Psychological Association)
- **Chicago** (Chicago Manual of Style)
- **MLA** (Modern Language Association)
- **NY Times**
- **Wikipedia**
- **Bluebook** (legal style)
- **AMA** (American Medical Association)

Other case conversions are included as well: Sentence case, lowercase,
UPPERCASE, First Letter, aLtErNaTiNg, and tOGGLE cASE. Optional
post-processing converts straight quotes to smart quotes (or back),
and an option preserves ALL-CAPS acronyms (NASA, HTML, ...) untouched.

The same add-in runs on every platform Office supports: **Windows, Mac,
the Web, and iPad**. Ready-made release archives are provided for
Windows, Mac, and Web sideloading.

## Quick start

The add-in is hosted at `https://socrtwo.github.io/Title-Capitalizer/`
(via GitHub Pages). To use it:

1. Download the right zip for your platform from
   [`releases/`](releases) (or from the GitHub Releases page).
2. Unzip and follow the steps in the `INSTALL.md` inside the archive.
3. Open Word, Excel, or PowerPoint. A **Title Capitalizer** group will
   appear on the **Home** tab.
4. Select some text, click **Title Capitalizer** to open the task pane,
   pick a style and any options, and click **Apply**. Or use **Quick
   Style** in the ribbon for one-click application of a specific guide.

## Features

### Task pane

The full UI lives in a task pane that opens when you click the
**Title Capitalizer** ribbon button. From there you can:

- Pick any of the 8 style guides from a dropdown. A short description
  of each style is shown below the dropdown.
- Click any of the 6 alternate-case buttons to apply Sentence case,
  lowercase, UPPERCASE, First Letter, aLtErNaTiNg, or tOGGLE cASE.
- Toggle **Preserve ALL-CAPS acronyms** (on by default).
- Toggle **Convert smart quotes to straight quotes** or **Convert
  straight quotes to smart quotes** (these are mutually exclusive).
- Use the preview textarea to try out conversions before applying them
  to the document, and the **Copy result** button to grab the result.
- Click **Apply title case to selection** (or any of the alternate-case
  buttons) to transform the active document selection in place.

### Ribbon shortcuts

The **Home** tab also gains a **Quick Style** dropdown that applies a
specific style to the current selection without opening the task pane.
Each of the 8 styles has its own entry.

### Host-aware behaviour

- **Word** - converts the selected range (including across paragraphs)
  in place using `Word.run`.
- **Excel** - walks every cell in the selected range and rewrites each
  string cell; non-string cells (numbers, dates, formulas) are left
  alone.
- **PowerPoint** - reads/writes the selected text inside the active
  text box.

## Project layout

```
manifest.xml             Office Add-in manifest. Replace the source URLs
                         in here if you host the web assets yourself.
src/lib/titlecase.js     The title-case engine. Pure JavaScript, no
                         dependencies, also works in Node.
src/taskpane/            HTML / CSS / JS for the task pane UI.
src/commands/            Ribbon command handlers (no UI).
assets/                  Icon PNGs at every Office-required size.
scripts/serve.js         Tiny static server for local sideload testing.
scripts/build.js         Copies all deployable files into dist/.
scripts/release.js       Wraps dist/ in per-platform zip archives.
scripts/make-icons.py    Regenerates the PNG icon set.
tests/                   Unit tests for the title-case engine.
releases/                Built release archives.
```

## Building from source

The add-in has **no build dependencies** - it is plain HTML/CSS/JS. The
scripts below are conveniences only and use Node and Python from your
system.

```bash
npm test                 # run the title-case test suite
npm run icons            # regenerate icon PNGs (needs python3 + Pillow)
npm run build            # assemble dist/
npm run release          # build per-platform zip archives in releases/
npm start                # serve the add-in locally on http://localhost:3000
```

## Hosting

For an Office add-in to load, the URLs referenced in `manifest.xml`
(under `<SourceLocation>`, the `Commands.Url` resource, and the icon
URLs) must be reachable over HTTPS. The manifest in this repo points to
`https://socrtwo.github.io/Title-Capitalizer/`, which serves the contents
of `dist/` via GitHub Pages.

If you fork or self-host:

1. Run `npm run build` to populate `dist/`.
2. Host the contents of `dist/` on any HTTPS static host (GitHub Pages,
   Azure Static Web Apps, Cloudflare Pages, ...).
3. Edit `manifest.xml` and replace every `https://socrtwo.github.io/Title-Capitalizer`
   with your own base URL.
4. Re-run `npm run release` to repackage.

## Platform installation

Each platform release zip includes a platform-specific `INSTALL.md`.
The short version:

- **Windows** - put `manifest.xml` in a Windows shared folder and
  register the folder under **File > Options > Trust Center > Trusted
  Add-in Catalogs**, then add the add-in via **Insert > My Add-ins**.
- **Mac** - copy `manifest.xml` into the host's `wef` directory under
  `~/Library/Containers/com.microsoft.<Word|Excel|Powerpoint>/Data/Documents/wef`.
- **Web** - upload `manifest.xml` directly via **Insert > Add-ins >
  More Add-ins > My Add-ins > Manage My Add-ins > Upload My Add-in**
  in Office for the Web.

Full step-by-step instructions are in the `INSTALL.md` inside each
release archive.

## Style-guide rules (summary)

| Style       | Articles | Coord. conj. | Prepositions     | Subordinating conj. | Notes                                |
|-------------|----------|--------------|------------------|---------------------|--------------------------------------|
| AP          | lower    | lower        | lower if `<= 3`  | capitalize          | "Is", "Be", "Are" capitalized        |
| APA         | lower    | lower        | lower if `<= 3`  | capitalize          | Capitalize all words `>= 4` letters  |
| Chicago     | lower    | lower        | lower always     | capitalize          | "As" lowercased; "Is" capitalized    |
| MLA         | lower    | lower        | lower always     | capitalize          | Like Chicago, with "as" capitalized  |
| NY Times    | lower    | lower        | lower if `<= 3`  | capitalize          | "No", "Nor", "Not" always capitalized|
| Wikipedia   | lower    | lower        | lower if `<= 4`  | capitalize          | Capitalize 5+ letter prepositions    |
| Bluebook    | lower    | lower        | lower if `<= 4`  | capitalize          | Legal-style                          |
| AMA         | lower    | lower        | lower if `<= 3`  | capitalize          | Used in medical journals             |

The first and last word of a title (and the first word after `:`, `—`,
`?`, or `!`) are always capitalized regardless of the rules above. Each
component of a hyphenated word is treated as its own word for
capitalization purposes.

## Credits

Inspired by [Capitalize My Title](https://capitalizemytitle.com) by
Jonathan Murphy.

## License

[MIT](LICENSE).
