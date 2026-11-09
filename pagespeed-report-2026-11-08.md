# PageSpeed report: homepage, 2026-11-08

Lighthouse 12, mobile emulation, run locally against the live `https://xivkit.com/`
(the PageSpeed Insights API quota was exhausted and the report page needs JavaScript, so
this is a stand-in for the Search Console report). Numbers will differ slightly from
PageSpeed Insights, but the issues are the same. Re-run with:

    npx lighthouse https://xivkit.com/ --form-factor=mobile --output=json --output-path=./r.json

## Scores

| Category | Score |
| --- | --- |
| Performance | 81 |
| Accessibility | 87 |
| Best Practices | 100 |
| SEO | 100 |

## Metrics

| Metric | Value |
| --- | --- |
| First Contentful Paint | 2.0 s |
| Largest Contentful Paint | 2.0 s |
| Total Blocking Time | 30 ms |
| Speed Index | 2.0 s |
| Cumulative Layout Shift | **0.34** (the only bad one) |

## Performance findings

1. **Layout shift (CLS 0.34).** Four shifts:
   - `.content-col` (0.23): the list is pushed down after load.
   - `#tag-bar` `.tag-pill` buttons (about 0.11 across two shifts): the bar is an empty
     `<div id="tag-bar">` that JS fills in.
   - `header.is-home a.wordmark b` (about 0): the wordmark font swap.
   - Suspected cause: the tag bar is built by JS and i18n loads translations after
     first paint. Reserving the tag bar's height with a CSS `min-height` should remove
     most of it. Confirm by re-testing.
2. **Render-blocking CSS (about 0.9 to 1.05 s).**
   - `cdn.jsdelivr.net/npm/bulma@1.0.2/css/bulma.min.css`: 36 KB, about 28 KB unused.
   - Google Fonts stylesheet (Cinzel, Instrument Sans, JetBrains Mono): blocks render.
   - Options: self-host only the Bulma parts used, load fonts non-blocking, or
     self-host the fonts (scripts/fonts already exists for OG cards).
3. **List icons are full-size OG cards (about 300 KB of waste).** Each guide `<li>` uses
   `og-*.png` (about 30 to 50 KB of waste each) displayed at favicon size.
   Generate small icons (about 64px WebP) from `scripts/og.mjs`.
4. **Google Tag Manager**: 68 KB unused JS. Cost of analytics, leave it.
5. **Cache lifetime**: 10 minutes on everything (GitHub Pages default). Not changeable
   there; only a CDN in front would change it.

## Accessibility findings (87)

- **Contrast**: footer `p.legal` is 4.47:1 (`#7b777f`), just under 4.5:1. Lighten
  slightly.
- **Link in text block**: footer links inside text have no underline or other cue.
- **Target size**: the tag buttons in each list item (`ul > li > div.tags > button`)
  are too small to tap reliably.

## Suggested order

1. CLS fix (tag bar `min-height`, check `.content-col`).
2. Small list icons.
3. Footer contrast and link underline, then tag button target size.
4. Bulma trim and font loading (needs care to keep the brand look).

Not yet checked: the guide pages, `plugins.html`, and the `/plugins/` directory pages.
Only the homepage was tested.
