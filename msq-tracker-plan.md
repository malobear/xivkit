# XIVKit MSQ Tracker: review notes and build plan

Not part of the live site. Working notes for the MSQ tracker tool (listed under
"Work in Progress" on `index.html` until it ships).

## Why

MSQTracker (https://msqtracker.com/) is the best MSQ tracker around, but progress only
lives in one browser. There is no link you can paste to say "I'm at *Close to Home*".
Goal: same useful dashboard, plus a URL that carries the current quest title, plus a PNG
progress card.

## Review of msqtracker.com (checked 2026-11-02)

Plain static site: `index.html`, `styles.css`, `app.js` (~28 KB), `msq-quests.js`
(titles, ~43 KB), `msq-quest-details.js` (~395 KB). No framework, no backend.

**Data model**
- 15 "segments" in story order (Seventh Umbral Era, Seventh Astral Era, Heavensward,
  Dragonsong, Post-Dragonsong, Stormblood, ... Post-Dawntrail II), each with era, patch
  range, level range and a quest total. 1,472 quests in total.
- Progress is just a count per segment (`progress["hw"] = 40`), plus `currentSegment` and
  `startingCity` (Gridania / Limsa / Ul'dah). The current quest is derived as the
  (count+1)th title of the segment. You never tick individual quests.
- Per quest: title, wiki page title (used to disambiguate duplicates), level, unlocks,
  section ("Levels 21-30"), one-line description. Wiki link per quest.
- Source is ConsoleGamesWiki's MSQ pages, scraped to JS on a set date. Newest quests
  (7.4+) are hand-added in a `knownQuests` block.

**UI**
- "Current MSQ" card: quest title, level, unlocks, description, wiki link, Prev/Next.
- Milestones panel: overall %, current-questline %, completed N of M, remaining, next
  quest.
- Questlines list: one card per segment with a slider, number box, "complete" button and
  a bar. Finished segments sort to the bottom.
- Toolbar: Save, Export (JSON), Import, Reset. Starting-city select.
- Storage: IndexedDB + localStorage + cookie backup. Nothing shareable.
- Dark teal/gold theme, aetheryte compass logo, About dialog, Buy Me a Coffee button.

**What is missing (our additions)**
1. Shareable URL with the quest title in it.
2. PNG progress card.
3. Read-only "viewing someone's progress" mode when you open a shared link.

## Product decisions

**Shareable URL.** Static GitHub Pages host, so no path routing. Use the hash:

    msq-tracker.html#/gridania/dawntrail/the-wheel-of-fortune

- `history.replaceState` on every progress change so the address bar is always
  copy-pasteable. No reload, no extra history entries.
- Slug is built from the wiki page title (so duplicates like *Close to Home (Gridania)*
  stay unique). City is in the URL because the ARR opening quests differ per city.
- Opening a link loads that position. If the visitor has saved progress of their own, show
  a banner "Viewing Tristan's link. Keep my own progress / Use this one" and never
  overwrite their saved state silently.
- Unknown slug (renamed quest, data refresh): fall back to the segment, then to start,
  with a visible note. Keep an alias map if we ever rename slugs.
- OG tags are static, so link previews will show the generic tracker card. A per-quest
  preview would need a server, so it is out of scope. The PNG covers that need.

**PNG export.** Draw on a `<canvas>` (no library): 1200x630, XIVKit wordmark, current
quest title large, level and patch, overall % bar plus a per-expansion mini bar row,
"quest N of 1,472", and the shareable URL as small text. Buttons: Download PNG and Copy
image (Clipboard API, with download as the fallback). Canvas keeps it deterministic and
dependency-free, and matches the site's existing OG card look.

**Progress model.** Improve on count-per-segment: store the current quest position in the
single ordered list (index into per-city quest order). Completion count per segment and
overall are derived. Prev/Next move the position. A slider/jump-to (search quest by title)
sets it. Optionally migrate from MSQTracker's export JSON (`state.progress` counts) so
existing users can import theirs.

**Local save.** localStorage only (key `xivkit-msq-v1`), plus Export/Import JSON. Skip the
IndexedDB/cookie triple backup, a URL is now the portable copy.

## Data

Do not copy msqtracker.com's data files. Generate our own with `scripts/msq.mjs`
(same pattern as `ventures.mjs` / `minions.mjs`) and commit `msq.json`.

- Preferred source: XIVAPI `Quest` sheet. The `JournalGenre.JournalCategory` rows
  ("Seventh Umbral Era Main Scenario Quests", etc.) identify MSQ quests and
  `PreviousQuest` gives the chain, so order can be derived, with `ExpansionDecoration`,
  level, place and icon available. Needs a spike to confirm the chain gives a clean
  linear order and handles the three city branches.
- **Spike result (2026-11-02): XIVAPI works.** `JournalCategory` rows 1 to 15 map 1:1 to
  MSQTracker's 15 segments. Pulling `Quest` rows whose `JournalGenre` belongs to those
  categories gives 1,050 named quests, and the per-segment counts match MSQTracker's
  totals exactly for categories 2 to 14 (80, 94, 25, 19, 122, 40, 106, 32, 19, 108, 47,
  100, 25). Category 1 (Seventh Umbral Era) has 215 because it holds all three city
  openings (161 per city path), and category 15 has 18 vs their 14 (newer 7.5 quests).
  Useful fields: `Name`, `Id`, `PreviousQuest`, `ClassJobLevel`, `PlaceName`, `Icon`.
- **Ordering:** the `PreviousQuest` graph is a DAG with 8 root "Close to Home" quests
  (the three city starts plus duplicates) and one terminal quest. The longest chain is
  948 deep out of 1,050, so it is almost linear. Branches are the city starts, the three
  Grand Company variants of *The Company You Keep*, and a few parallel quests (e.g. the
  three Moogle trials). Plan: longest-path layering with ties broken by quest row id,
  then collapse each city/GC variant to the one for the chosen city. Needs a check against
  ConsoleGamesWiki order before we trust it.
- **Built (`scripts/msq.mjs`, `pnpm msq`, output `msq.json`).** 1,043 unique quests, 997 or
  998 per starting city. True alternatives (per-Grand-Company and per-class repeats) are
  collapsed. City is a bitmask `c` (1 Gridania, 2 Limsa, 4 Ul'dah), omitted for shared
  quests. Checked against MSQTracker's wiki-derived order as a test oracle only: 989 of
  995 titles land in the same relative order. Known differences: 4 quests out of order in
  the opening segment, 1 in Stormblood, 1 renamed Endwalker quest, and our 4 extra 7.5
  quests. Worth a manual look at the opening segment before launch.
- Query gotchas: use `@as(raw)` on reference fields (returned keys keep the suffix),
  omit `after` on the first page, and do not request `SortKey` (it is not a field).
- Fallback / cross-check: ConsoleGamesWiki MSQ pages (CC BY-SA, credit required) for
  ordering, descriptions and the per-quest wiki links.
- Record the generation date in the file and in the page footer, like the other tools.
- Brand-new patches (7.4+) may lag in either source. Keep a small hand-written override
  list in the script.

## Page build (`msq-tracker.html`)

Follows the site conventions in `CLAUDE.md`:
- Standard header/footer, brand CSS, language bar, four locales (en/ja/de/fr). Keys under
  `pages.msqtracker.*`; flag in-game terms for review (quest names stay in English;
  expansion names are official localized names).
- Item icons rule does not apply (quests, not items), but use the quest-type icon from
  XIVAPI if cheap.
- Footer credit: "Inspired by MSQTracker (https://msqtracker.com/)" linking out, plus
  ConsoleGamesWiki / XIVAPI data credit.
- No em dashes in copy. Add OG card (`og-msq-tracker.png` via `scripts/og.mjs`), sitemap
  entry, `llms.txt` line, README "Pages" entry.
- Accessibility: slider and number inputs labelled, bars have text values, keyboard
  Prev/Next.

## Milestones

1. **Spike:** XIVAPI MSQ order and the three city branches. Decide the data source.
2. **Data script + `msq.json`.**
3. **Core page:** current quest card, Prev/Next, jump-to search, segment bars, localStorage.
4. **Shareable URL:** hash read/write, share banner, copy-link button.
5. **PNG card:** canvas render, download and copy.
6. **Polish:** i18n x4, OG card, sitemap, README, llms.txt, replace WIP entry on the index
   with a real link in the Progress & Checklists section (keep the MSQTracker entry, update
   its note to mention ours).
7. **Stretch:** import from MSQTracker JSON, optional "stats" view (levels, patches), a
   compact embed image.

## Open questions

- Name on the PNG: show a character/display name field (optional, stored locally and put
  in the URL as `?n=`)? Probably yes, off by default.
- Do we sort finished expansions to the bottom like MSQTracker, or keep story order?
- Include Seventh Astral Era / post-patch quests in the overall %, as MSQTracker does
  (yes, to match what players expect from the in-game MSQ list).
