# ADR 0001: Make the JA/DE/FR translations indexable

- **Status:** Accepted (option 3)
- **Date:** 2026-11-11
- **Deciders:** malobear

## Context

### What exists today

XIVKit was localized into English, Japanese, German, and French in commit `51627be`
(2026-08-31, "Add EN/JA/DE/FR localization with a language switcher"). The mechanism is
documented in README.md's "Translations" section and CLAUDE.md's "Translations" section:

- `i18n.js` loads i18next, its HTTP backend, and its browser language detector from
  jsDelivr. The language resolves from `?lang=`, then `localStorage`, then the browser
  language, defaulting to English.
- Pages ship English text in the static HTML. Elements carry `data-i18n` keys, and
  `i18n.js` swaps their text in the browser after `i18n/<lang>.json` loads.
- The chosen language is written back into the URL as `?lang=xx` so a link stays in
  the same language.
- Item names (tool and brand names on the lists) stay in English in every language.

**No document in the repo proposes per-language URLs, hreflang, or server-side
rendering of translations.** README.md, CLAUDE.md, guide-ideas.md, and
msq-tracker-plan.md all describe only the client-side mechanism. The only forward-looking
mentions are guide-ideas.md:266 (the plugin directory section heading "needs i18n
strings if the directory pages are localized") and msq-tracker-plan.md:136 (the MSQ
tracker follows the four-locale convention). The original commit notes that the JA/DE/FR
text "is a first pass and could use a native speaker's review."

### Why it matters for search

The search-opportunity research (`reports/FFXIV tools search opportunities.md`, and the
notes in `research_notes/FFXIV tools search opportunities/timing_and_localization.md`)
found that German and French results for common FFXIV queries are thin, old, or
machine-translated. That makes localized pages a real opening. But as built today,
search engines see only the English site:

- Crawlers fetch the page without `?lang=`, so they get English.
- `index.html` has `<html lang="en">` and `<link rel="canonical" href="https://xivkit.com/">`,
  so even a crawled `?lang=ja` URL declares the English page as the real one.
- There are no `hreflang` annotations, and `sitemap.xml` (11 URLs) lists no
  language variants.
- GitHub Pages serves the same file for every query string, so the static `<head>`
  (canonical, `lang`, `og:locale`, hreflang) cannot differ per language without
  JavaScript.

Google's guidance is to give each language its own URL and connect them with hreflang,
not to switch content by cookie, storage, or browser settings
([Google Search Central: managing multilingual sites](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)).

### How much is actually translated

Translation coverage differs widely by page, which matters as much as the URL scheme.
These are `data-i18n` attribute counts per page as of this ADR:

| Page | `data-i18n` count | Loads `i18n.js` | Notes |
|---|---|---|---|
| index.html | 64 | yes | Descriptions, tags, chrome |
| plugins.html | 40 | yes | |
| hunt-for-astronomy.html | 40 | yes | Has its own `hfa` namespace, the most complete guide |
| watchlist.html | 27 | yes | |
| msq-tracker.html | 18 | yes | Quest titles stay English by design |
| fanfest-bingo.html | 9 | yes | |
| keybound-brawler.html | 8 | yes | Body copy English |
| inventory-decluttering.html | 6 | yes | Body copy English |
| jump-puzzle-macros.html | 6 | yes | Body copy English |
| trade-in-mounts.html | 4 | **no** | Keys exist but never apply |
| retainer-ventures.html | 3 | **no** | Keys exist but never apply |
| get-ready-for-evercold.html | 0 | no | English only |
| plugins/ (568 pages, Eleventy) | nav only | no | Plugin text comes from authors in English |

So for most guides, a German URL today would be about 95% English. Publishing those as
separate "German" pages would create near-duplicates that rank for nothing and could
read as low quality.

### Constraints

- Static site on GitHub Pages, deployed from `main` at the repo root. No server.
- The repo already has a build precedent: Eleventy builds `directory/` into `plugins/`,
  and the output is committed (README "Plugin directory"). Node scripts in `scripts/`
  generate data and OG cards.
- Hand-written HTML pages are the authoring format for everything outside the plugin
  directory, and the project has avoided a framework rewrite.
- The IndexNow workflow submits every URL in the sitemaps on each deploy, so sitemap
  entries must point only at pages that should be indexed.

## Decision drivers

1. Each language version needs its own crawlable URL with its own static `<head>`.
2. Authoring stays as it is: edit one English HTML file and the JSON files.
3. No page is published in a language it is not substantially translated into.
4. Low ongoing upkeep for a single maintainer. Forgetting a step should fail loudly,
   not silently ship stale translations.
5. No regressions to the English site, which carries all current traffic.

## Options considered

### Option 1: Keep client-side only (status quo)

Leave the mechanism as it is. Treat JA/DE/FR as a convenience for visitors, not a
search channel.

- **Pros:** No work. No risk to the English site.
- **Cons:** The DE/FR opening the research found stays unused. The existing translation
  work earns no traffic.
- **Effort:** None.

### Option 2: Make `?lang=` URLs indexable with JavaScript-injected head tags

Keep one HTML file per page. Have `i18n.js` rewrite the canonical, `<html lang>`, and
inject hreflang links when `?lang=` is present. Add `?lang=ja` style URLs to the sitemap.

- **Pros:** Smallest code change. No build step.
- **Cons:** The static HTML Google fetches first still says English with an English
  canonical. Google may honor JS-set tags after rendering, but a canonical that changes
  under JavaScript is a mixed signal Google advises against, and other engines (Bing via
  IndexNow, Naver, Yandex) render JavaScript less reliably. The translated text also
  exists only after rendering. This is the option most likely to look done while not
  working.
- **Effort:** Small.

### Option 3: Pre-render language folders at build time (`/ja/`, `/de/`, `/fr/`)

Add a script (for example `scripts/i18n-build.mjs`, run as `pnpm i18n`) that, for each
opted-in page and language:

1. Reads the English HTML and the matching `i18n/<lang>.json`.
2. Applies the same substitutions `i18n.js` does (`data-i18n` text, placeholders,
   titles, `data-i18n-rich` tokens, "Updated for patch" lines), so the translated text
   is in the static HTML.
3. Sets `<html lang>`, a self-referencing canonical, `og:locale`, the title and meta
   description, and a full hreflang cluster (`en`, `ja`, `de`, `fr`, `x-default` to
   English) on every variant, including the English original.
4. Rewrites relative asset and page links so they work one folder down (`brand.css`,
   `i18n/`, `og-*.png`, sibling pages), and points in-site links at the same-language
   version when one exists.
5. Writes `ja/<page>.html` and so on, and adds those URLs to `sitemap.xml` with
   `xhtml:link` alternates.

`i18n.js` keeps running on top for interactive pieces (tag pills, search, dynamic
lists). It reads the language from the folder instead of detecting it. The language bar
becomes plain links to the sibling URLs. There is no automatic redirect by browser
language, which Google advises against; a one-line "Also available in Deutsch" hint can
use the browser language instead.

The output is committed, like `plugins/`, so GitHub Pages keeps deploying from the
branch.

- **Pros:** Real URLs with correct static heads and translated text in the initial HTML,
  which every crawler and link-preview bot reads. Authoring is unchanged. It reuses the
  existing translation JSON and a build pattern the repo already has. It also removes the
  translation flash, and therefore part of the layout shift, on localized pages.
- **Cons:** A new build step that must run after every page or translation edit. Doubles
  or quadruples the committed HTML. The substitution logic now exists in two places
  (build script and `i18n.js`) unless the build reuses `i18n.js`'s functions. Relative
  path rewriting needs care.
- **Effort:** Medium: one script, sitemap generation, and a language-bar change.

### Option 4: Move every page into Eleventy with i18n templates

Convert the hand-written pages to Nunjucks templates, as the plugin directory already
is, and let Eleventy generate each language from one template.

- **Pros:** One rendering system for the whole site. Clean handling of per-language
  links, sitemaps, and hreflang through templates.
- **Cons:** Rewrites every page, and the interactive guides carry a lot of inline
  script. It changes the authoring model the project has deliberately kept simple. It
  costs a lot before any SEO benefit arrives.
- **Effort:** Large.

### Option 5: Subdomains or separate domains per language

For example `de.xivkit.com`.

- **Pros:** Clean separation.
- **Cons:** GitHub Pages serves one custom domain per repo, so this needs separate repos
  or another host. Each subdomain starts with weaker authority than a folder on the main
  domain. Overkill at this site's size.
- **Effort:** Large, plus ongoing hosting work.

## Comparison

| Driver | 1. Status quo | 2. JS head tags | 3. Pre-rendered folders | 4. Eleventy everywhere | 5. Subdomains |
|---|---|---|---|---|---|
| Own crawlable URL with static head | No | No | Yes | Yes | Yes |
| Authoring unchanged | Yes | Yes | Yes | No | Depends |
| Publishes only translated pages | n/a | No | Yes, with a coverage gate | Yes | Yes |
| Upkeep | None | Low | Low to medium | Medium | High |
| Risk to English site | None | Low | Low | Medium | Low |
| Effort | None | Small | Medium | Large | Large |

## Decision

**Accepted: Option 3, pre-rendered language folders, with a translation coverage gate.**

The coverage gate is what makes it work, not the folders. The build script emits a
language variant of a page, and lists it in hreflang and the sitemap, only when that page
opts in (for example a `data-i18n-pages="ja de fr"` attribute on `<html>`, or a short
list in the script). A page opts in once its body copy is translated, not just its
chrome. Pages that have not opted in stay English-only with no hreflang, exactly as
today.

Rollout:

1. **Phase 1, the already-translated pages:** `index.html`, `plugins.html`,
   `watchlist.html`, `hunt-for-astronomy.html`, `msq-tracker.html`, and
   `fanfest-bingo.html`. Build the script, the hreflang cluster, the sitemap alternates,
   and the language-bar links. Submit the updated sitemap in Search Console.
2. **Phase 2, the data-driven guides:** `trade-in-mounts.html` and
   `retainer-ventures.html` (load `i18n.js` and finish their keys first), then
   `inventory-decluttering.html`, `keybound-brawler.html`, and `jump-puzzle-macros.html`.
   These are the pages the research says translate cheaply, because most of their value
   is numbers and item data.
3. **Phase 3, new pages:** every new guide is written with full `data-i18n` coverage from
   the start, per CLAUDE.md, and opts in when its translations land.

The plugin directory (`plugins/`) stays English-only. Its content is plugin authors'
English text, and 568 near-duplicate localized pages would add risk with little benefit.

## Consequences

- **Positive:** JA/DE/FR pages become indexable. The DE/FR gap the research found
  becomes reachable. Localized visitors land directly in their language from search and
  shared links. Localized pages lose the post-load text swap.
- **Negative:** A build step to remember. Mitigate with a CI check on push that runs the
  build and fails if the committed output differs, rather than relying on memory.
- **Follow-up decisions this ADR does not settle:**
  - **In-game item names.** README.md says item names stay English in every language. That
    rule was written for tool and brand names on the index list. For in-game items (mounts,
    rewards, currencies), official localized names are exactly what DE/FR players search
    for. XIVAPI can likely return them by language, but the parameter syntax on
    beta.xivapi.com is unconfirmed. This deserves its own ADR before Phase 2.
  - **Native review.** The commit that added JA/DE/FR flags the text as a first pass, and
    CLAUDE.md asks for terms like Housing, Glamour, and Retainer to be reviewed. Publishing
    to search raises the stakes on wording. Getting a review of at least DE and FR before
    Phase 1 ships is worth considering.
  - **Japanese priority.** The research found Japanese results saturated (game8.jp,
    wikiwiki), while German and French are thin. If translation effort is limited, DE and FR
    should come first.
  - **`?lang=` links already shared.** Old `?lang=xx` links should keep working.
    `i18n.js` can forward them to the matching folder URL when one exists.

## References

- README.md, "Translations" and "Plugin directory" sections
- CLAUDE.md, "Translations" section
- `i18n.js`, `i18n/*.json`, `eleventy.config.mjs`, `.github/workflows/indexnow.yml`
- Commit `51627be`, "Add EN/JA/DE/FR localization with a language switcher"
- `reports/FFXIV tools search opportunities.md` ("fix first" section)
- `research_notes/FFXIV tools search opportunities/timing_and_localization.md`, sections B and B2
- [Google Search Central: managing multilingual sites](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)
