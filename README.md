# XIVKit: FFXIV Tools & Links

**Browse the site: https://xivkit.com**

A curated, hand-picked list of FFXIV tools I actually use. Kept small on purpose, updated whenever something new earns a spot. The site is available in English, Japanese, German, and French.

## What's on the site

- [Tools](https://xivkit.com/): market board data, crafting trackers, theorycrafting calculators, progress checklists, glamour and mod sources, and other reference sites.
- [Plugins](https://xivkit.com/plugins.html): Dalamud plugins I actually use, with a note on which ones need a custom repo.
- [Watchlist](https://xivkit.com/watchlist.html): tools I haven't tried yet, kept separate from the ones I vouch for.
- Guides: [Jump Puzzle Macros](https://xivkit.com/jump-puzzle-macros.html), [Hunt for Astronomy](https://xivkit.com/hunt-for-astronomy.html), [Keybound Brawler](https://xivkit.com/keybound-brawler.html), [Fan Fest Bingo Maker](https://xivkit.com/fanfest-bingo.html), [Trade-In Mounts](https://xivkit.com/trade-in-mounts.html), and [Inventory & Retainer Decluttering](https://xivkit.com/inventory-decluttering.html), and [Retainer Ventures](https://xivkit.com/retainer-ventures.html), with live market prices where it helps.
- Tools: [MSQ Tracker](https://xivkit.com/msq-tracker.html), a Main Scenario Quest tracker whose link carries your current quest, with a PNG progress card to share.

## Suggest a tool

Know a tool or plugin that belongs here? [Open an issue](https://github.com/malobear/xivkit/issues/new) with the link and a line on what it does, or send a pull request following the entry format under "Updating the list" below.

FINAL FANTASY XIV is a registered trademark of Square Enix Holdings Co., Ltd. This project is an unofficial, fan-made list, not affiliated with or endorsed by Square Enix. Each page carries the same notice in its footer.

## Pages

Three list pages share the exact same structure, styling, and search/tag script:

- `index.html`: tools I actually use. This is the one worth sharing/linking.
- `watchlist.html`: tools I've heard about or seen recommended but haven't tried
  myself yet. A holding place, not an endorsement. Once something on the watchlist
  earns regular use, move its `<li>` block over to `index.html` (and delete it from
  the watchlist).
- `plugins.html`: Dalamud plugins I actually use. Kept separate since these are
  third-party client mods, not sanctioned tools like the others, and the page carries
  a note about that. Tag any plugin that isn't in Dalamud's default plugin directory
  (i.e. needs a custom repo added under Dalamud Settings → Experimental) with
  `experimental`.

Guides are standalone pages hosted on the site and listed under "Curated Guides" on
the home page: `jump-puzzle-macros.html`, `hunt-for-astronomy.html`, `keybound-brawler.html`, `fanfest-bingo.html`, `trade-in-mounts.html`,
`inventory-decluttering.html`, and `retainer-ventures.html`. `msq-tracker.html` is a hosted tool listed in the same place.

All pages share the branding: titles read `Page name | XIVKit` (the home page is
`XIVKit: FFXIV Tools & Links`), `og:site_name` is `XIVKit`, and URLs use
`https://xivkit.com/`.

## Updating the list

Each category is a `<section>` in `<main>`, with an `<h2>` title and a `<ul>` of
`<li><a>` entries. To add a link, copy an existing `<li>` block in the right file/section
(or add a new `<section>`) following this shape:

```html
<li data-tags="tag-one, tag-two">
  <a href="https://example.com/" target="_blank" rel="noopener noreferrer"><img class="favicon" alt="" loading="lazy" decoding="async"><span class="link-body">Name<span class="desc">Short description</span></span></a>
  <div class="tags"><button type="button">tag-one</button><button type="button">tag-two</button></div>
</li>
```

The `data-tags` attribute on the `<li>` and the `<button>` labels in `.tags` should
match (comma-separated, lowercase). New tags just work: the tag pill bar and the
search box pick them up automatically, no other file needs editing. The favicon
`<img>` needs no `src`: it's filled in automatically at page load from the link's
own domain (via Google's favicon service), so you never have to go hunt one down.
Commit and push to `main` and GitHub Pages redeploys within a minute or two. Worth
bumping the matching `<lastmod>` date in `sitemap.xml` when you edit a page.

The list itself is plain static HTML (not JS-generated) so it's fully visible to
search engines and link-preview bots without executing any script. Search/filter and
tag pills are a JS enhancement layered on top; with JS disabled every link is still
shown, just without the filter UI.

The `application/ld+json` structured-data block (helps Google show rich results) is
generated at page load directly from the visible `<li>` content, so it's always in
sync with what's on the page, and you never need to touch it by hand.

### Translations

The site is localized into English, Japanese, German, and French via `i18n.js` and
the `i18n/*.json` files. Item **names** stay in English/original form in every
language (they're mostly brand names); only descriptions, tags, and UI chrome are
translated. When you add a new `<li>`, also add its description under a unique slug
in `i18n/en.json`'s `items` object (e.g. `"myslug": "Short description"`), then set
`data-i18n="items.myslug"` on the `<span class="desc">` in each of the three HTML
files where it's needed. Adding the same key to `i18n/ja.json`, `de.json`, and
`fr.json` is optional: a missing key falls back to the English text automatically,
so the site never breaks, it just shows English for that one entry until translated.

#### Language copies for search engines (`ja/`, `de/`, `fr/`)

Pages that are fully translated also get a pre-rendered copy per language, so search
engines can index them (see `docs/adr/0001-indexable-translations.md`). Each copy has the
translated text in its static HTML, its own `lang`, canonical, title, and description,
and hreflang links tying the languages together. `i18n.js` still runs on top for the
parts pages build at runtime, and the language bar switches between the copies.

```
pnpm i18n         # rebuild ja/ de/ fr/, the hreflang blocks, and the sitemap alternates
pnpm i18n:check   # fail if any of that is out of date (also runs in CI on push)
```

- **Run `pnpm i18n` after editing an opted-in page, any `i18n/*.json` file, or
  `sitemap.xml`,** and commit the result. Never edit `ja/`, `de/`, or `fr/` by hand.
- `pnpm i18n` first runs `scripts/static-bars.mjs`, which writes the language buttons
  and the tag filter pills into the page HTML so the list doesn't jump down after load
  (layout shift). Run it after changing an item's tags too. If you forget, the page
  script still adds missing pills, it just shifts a little.
- **To opt a page in,** add it to `PAGES` at the top of `scripts/i18n-build.mjs` and add
  its translated `seo.<key>.title` and `seo.<key>.description` to all four JSON files.
  Only do this once the page's body copy is translated, not just its nav and footer. The
  build skips any language where a key the page uses is missing, and prints which ones.
- Opted-in pages: `index.html`, `plugins.html`, `watchlist.html`,
  `hunt-for-astronomy.html`, `msq-tracker.html`. Every other page stays English-only
  and translates in the browser as before.
- Old `?lang=xx` links, and a language the visitor picked earlier, forward to the
  matching copy when one exists.

### Plugin directory

`xivkit.com/plugins/` is a generated directory of Dalamud's official plugin list plus a few third-party repositories, built with
[Eleventy](https://www.11ty.dev/). Source lives in `directory/` (templates in `_includes/`,
generated data in `_data/`, hand-written picks and category overrides in `content/`); the output goes to
`plugins/` and is committed, since the site deploys straight from the branch. Do not edit
files in `plugins/` by hand.

```
pnpm plugins          # fetch the latest plugin data, then rebuild everything
pnpm plugins:fetch    # data only (directory/_data/*.json)
pnpm plugins:build    # rebuild plugins/ from the current data
```

`scripts/plugins-fetch.mjs` pulls the official plugin master list, drops anything on
Dalamud's banned list (compared by version, since bans cover old releases only), sorts
plugins into categories by keyword, and matches the plugins listed in `content/picks.json` (my
own notes, kept in the data but not shown on the pages for now). Adjust the keyword rules at the top of that script; when a plugin still lands in the
wrong bucket, pin it by slug in `directory/content/categories.json`, which wins over the
keywords. The script stops on an unknown category slug and warns about overrides whose
plugin has left the official list. Icons come from the same place the in-game installer
gets them (`goatcorp/PluginDistD17`), then the author's `IconUrl`, then `images/icon.png`
in the plugin's GitHub repo; the script keeps the first one that loads, and the page shows
the plugin's first letter when none does. Screenshots come from the same two places (up to five, the
official `image1.png` to `image5.png` or the author's `ImageUrls`, whichever set is larger).
The official files are checked against one GitHub API listing of `PluginDistD17` rather than
one request per image, which gets throttled; set `GITHUB_TOKEN` to lift the API's 60
calls an hour limit (GitHub Actions sets it automatically). Each plugin also gets an install status using Dalamud's own rule: built for the
current API level (read from the live Dalamud release) means installable, one level back is
"outdated", and older is left out of the installer. Lists hide the ones you can't install, and
the ones that need testing builds turned on, unless the visitor ticks "Show not installable"
or "Show testing builds"; their pages stay up and say why or how. Sort and
filter choices are kept in the URL (`?sort=updated&recent=1`, and so on). While the directory is a
live, `directory/_data/site.json` has `indexable: true`; set it to `false` to add `noindex` to
every page again. Plugins the installer doesn't list at all (built for an older API) get `noindex`
and are left out of the sitemap. Eleventy generates `plugins/sitemap.xml` (listed in `robots.txt`
and submitted to IndexNow by the deploy workflow), so the hand-kept root `sitemap.xml` doesn't
need the directory's pages.

Third-party repositories are listed in `directory/content/repos.json` (`url` is the address people
paste under `/xlsettings` > Experimental > Custom Plugin Repositories). The first repo listed wins
when a plugin is in several, and the official list wins over all of them. Those plugins get a
round badge on their icon and title, a "Third-party" filter (off by default, `?third=1`), and an
install step with a copy button for the repository address. Add a repo by adding one line there
and running `pnpm plugins`.

A GitHub Action (`.github/workflows/plugins-refresh.yml`) runs `pnpm plugins` every Monday and commits any changes to `main`. It can also be started by hand from the Actions tab.

### Searching / sharing a filtered view

Typing in the search box filters by name, description, or tag, and updates the URL
(e.g. `?q=market`) so you can share a link straight to a filtered view. Clicking a tag
pill does the same for that tag.

## One-time setup (if Pages isn't enabled yet)

In the repo on GitHub: **Settings → Pages → Build and deployment → Source** = `Deploy from a branch`,
branch = `main`, folder = `/ (root)`. Save, then the site will start working. Custom domain: set it to `xivkit.com` and tick **Enforce HTTPS**.

## Look and feel

The brand is a wordmark, `XIV` in ink and `KIT` in red, set in Cinzel, with two themes:
Noir (dark, the default) and Silk (light, via `prefers-color-scheme`). `brand.css` holds the shared palette, fonts and wordmark and loads after each page's own
inline styles. The four directory pages (home, plugins, watchlist, jump puzzle
macros) also load `brand-directory.css` (section labels, cards, pills, nav), and the
inventory decluttering guide loads `brand-guide.css`. To change a colour or font, edit
`brand.css`. The hunt for astronomy and trade-in mounts guides keep their own variable
names and load `brand-guide-vars.css`, which maps them onto the brand palette. Fonts come from Google Fonts: Cinzel (wordmark only), Instrument Sans
and JetBrains Mono. `favicon.svg` is the XIV letters with a red rule, converted to
outlines, so it needs no font.

## Domain, analytics, and social previews

- The site is served from GitHub Pages at the custom domain `xivkit.com` (the `CNAME`
  file holds it). The old `malobear.github.io/ffxiv-tools/` address no longer redirects (it returns 404 since the repo rename). The repo was renamed from `ffxiv-tools` to `xivkit`; GitHub redirects the old repo URL.
- Every page carries the same Google tag (gtag.js) snippet near the top of `<head>`.
  To change the analytics property, replace the `G-...` ID in all pages.
- The Organization JSON-LD on the home page points at `logo.png` (512x512 render of `favicon.svg`).
- Each page's link preview is a 1200x630 `og-*.png` in the repo root (dark card with
  the XIVKIT wordmark, page title, short description, tags, and `xivkit.com`). They are
  generated by `scripts/og.mjs` (fonts are embedded from `scripts/fonts/`, all SIL Open Font License): edit the `CARDS` list there, then run
  `pnpm install`, `pnpm exec playwright install chromium` (first time only), and
  `pnpm og` (all cards) or `pnpm og plugins` (just one). Commit the updated PNGs.
- The region setting is stored in `localStorage` as `xivkit-region` (older keys are
  migrated automatically by `market-region.js`).

### Retainer ventures data

`retainer-ventures.html` reads two generated files. After a patch that adds ventures, run
`pnpm ventures` to rebuild `ventures.json` (venture list, yields, stat breakpoints, and item
icon paths, all from XIVAPI). The "Leveling and gear" tab shows example prices from
`guide-snapshot.json` until the visitor's own world has loaded, then swaps to live prices.
Refresh the snapshot now and then with `pnpm snapshot` (Excalibur) or
`pnpm snapshot <world>`, and commit it: the file carries its own date, which the page shows.

### MSQ tracker data

`msq-tracker.html` reads `msq.json`. After a patch that adds Main Scenario Quests, run
`pnpm msq` to rebuild it from XIVAPI, then bump the page's entry in `guide-meta.json` and run
`pnpm updated`. The script pulls the Main Scenario Quest journal categories, orders them by
prerequisite, keeps the three starting cities' opening quests apart (a `c` bitmask on each
quest), and collapses true alternatives (the per-Grand-Company quests) into one entry. Quest
banners come from the game's own journal icons (`i`) on XIVAPI. A player's place lives in the
page link as `#/<expansion>/<quest>`, so renaming a quest slug breaks old links; the script
fails rather than writing a duplicate slug. See `msq-tracker-plan.md` for how it was built.
`msq-core.js` is the shared layer (saved progress, routes, link format, search) used by both
`msq-tracker.html` and the MSQ planner in `get-ready-for-evercold.html`; change the link or save
format there, not in either page.
