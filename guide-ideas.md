# Guide ideas

Backlog of guide/tool ideas for this repo, not part of the live site. When one is
ready to build, it'll likely become its own page (like `hunt-for-astronomy.html` or
`jump-puzzle-macros.html`) and get linked from `index.html`.

Format per idea: a short pitch, then notes on scope and data sources.

---

## Trade-in mount cost/value guide

Cover every mount obtained by trading in items (tribal quest currencies, tomestones,
Bozjan/Zadnor, Island Sanctuary, seasonal event currencies, Doman Mahjong, etc.), and
for each one:

- How to obtain it (which currency/items, where to turn them in).
- Whether the required trade-in items are marketboardable, and if so their live
  Universalis price.
- Whether the mount itself is ever resellable (most aren't; a few limited cases might
  be, worth double-checking per mount rather than assuming).

Goal: let someone compare "grind it out" vs "buy the mats off the board" vs (rare
cases) "just buy the mount," using live prices rather than a static gil estimate that
goes stale.

Notes:
- This will need live market data (Universalis API), so it's more of a small
  interactive tool than a static markdown/HTML guide, similar in spirit to a
  mini-calculator page rather than a plain link list entry.
- Data-gathering will need a mount-by-mount pass (source: item(s)/currency needed,
  vendor/turn-in NPC, item marketboardability) before any UI work starts. The wiki is
  the source of truth for this, per the existing convention of re-verifying item
  sources against the wiki rather than Teamcraft.
- **Decided:** currently-obtainable mounts only. Permanently unavailable
  seasonal/collab/promo mounts are excluded from the full data-gathering pass.
- **Decided:** where both the trade-in currency and the finished mount item are
  marketboardable, the "grind vs. buy mats vs. buy mount" verdict is computed live
  from whatever prices are currently loaded (see `computeVerdict()` in
  `trade-in-mounts.html`), not hardcoded at research time — a verdict based on a
  price snapshot would silently go wrong as prices move. Verdicts are only
  hardcoded when they're a structural fact (e.g. neither side is marketable, so
  it's grind-only regardless of price).

**Research note (structural finding from later research, applies to every idea
below):** the mounts guide only produces a real "buy vs. grind" comparison when the
trade-in currency itself is a tradeable voucher/token (Bicolor Gemstone Voucher,
Turali Bicolor Gemstone Voucher, seasonal event tokens). Raw bound tribal-quest
currencies, Bozjan Mettle, Island Sanctuary's Seafarer's Cowrie, and MGP are all
confirmed never marketboardable, so any entry funded purely by one of those
collapses to "grind only," same as the Marid pilot case. Fertile ground for new
guides is specifically the rest of what the Bicolor Gemstone Voucher vendors
(Edelina in Mor Dhona, and the Dawntrail Turali equivalent) sell: mounts aren't the
only thing on that list.

---

## Trade-in minions guide

Direct sibling to the mount guide, same shape: minions unlocked by trading in
tribal-quest currency, tomestones, Bicolor Gemstone Vouchers, or seasonal tokens,
compared live against buying the mats vs. (rarely) the minion itself.

**Top candidate to build next**: reuses `trade-in-mounts.html`'s architecture
almost as-is (`costForQty`, `computeVerdict`, `computeSavings`, order-book walk), and
for the voucher-funded minions specifically, the same currency IDs the mounts page
already fetches and caches (Bicolor Gemstone Voucher 35833, Turali Bicolor Gemstone
Voucher 43961).

Notes:
- Currently-obtainable minions only, same exclusion rule as mounts.
- Data source: Console Games Wiki minion pages, cross-checked against
  `ffxivcollect.com/minions` for enumeration and acquisition-method tagging (wiki is
  still the source of truth per this project's sourcing rule; ffxivcollect is just
  for finding the full list to check against).
- Likely a bigger list than mounts, since minions are a larger collectible category
  overall, so this probably needs the same "verify one pilot end-to-end before
  scaling" approach used for the mounts guide.
- Open question: whether to share a price cache with `trade-in-mounts.html` for the
  overlapping voucher currencies (mirrors the `market-region.js` sharing decision
  already made for DC/region preference), or keep the two pages fully independent.

---

## Trade-in orchestrion rolls guide

Rolls purchased with Bicolor Gemstone Vouchers or seasonal tokens, compared against
the roll's own marketboard price where the roll itself is also tradeable. Orchestrion
rolls hit the "just buy the finished item" branch more often than mounts do, since
rolls are commonly resellable themselves.

Notes:
- Second priority after minions.
- Data source: `thonky.com`'s orchestrion roll list and `ffxivcollect.com/orchestrions`
  both tag acquisition method (gil vendor, quest, dungeon/raid drop, crafted,
  gemstone vendor, MGP), so this needs a filtering pass to isolate just the
  currency-funded subset, since a large fraction are plain gil-vendor purchases (no
  tradeoff at all) or raid/dungeon drops.
- **Risk:** no reliable, authoritative per-run drop rate exists for the raid/dungeon-
  drop rolls, so the "grind cost" side can't be computed as a number for those.
  They'd need a qualitative note instead, or exclusion from the guide entirely.

---

## Trade-in chocobo barding guide

Smaller, cleaner category: barding sold via Achievement Certificates, Tomestones of
Allegory, Skybuilders' Scrips (Ishgardian Restoration), and MGP.

Notes:
- Smallest item count of the three new ideas (dozens, not hundreds), a good size
  for a second pilot if minions turns out to be too large to tackle in one pass.
- Most of the funding currencies here are likely bound (Achievement Certificates,
  MGP). Skybuilders' Scrip marketability specifically is unconfirmed and needs
  checking before this is worth building; if it's bound too, most of this list is
  "grind only" like the Marid pilot case, which is a much weaker guide.

---

## Recurring player questions without a good existing guide

Broader sweep, not limited to the buy-vs-grind mechanic above: what do people keep
asking on forums that no clear guide answers well today. Sourced from official forum
sticky/FAQ threads and independent guide sites, cross-checked to rule out topics
that already have solid coverage elsewhere. Methodology caveat: direct Reddit access
wasn't available for this pass (fetching reddit.com was blocked, and the search
backend wasn't indexing Reddit threads), so "frequency" below is triangulated from
proxies instead: an official sticky FAQ thread's existence and contents, independent
guide sites converging on the same question set, and forum posts explicitly asking
because no answer exists yet. Worth a real Reddit-inclusive pass later if a tool
with better forum access becomes available.

### Inventory / retainer decluttering guide

Pitch: a curated, opinionated list of what to actually keep vs. discard, this is
junk, this is a hidden trap, this needs bank space regardless.

- **Top pick of this batch.** Barely any existing coverage. Clearest evidence: a
  Square Enix forum thread literally titled
  ["Request: Inventory Management Tips from Vets"](https://forum.square-enix.com/ffxiv/threads/364479),
  players asking other players because no comprehensive answer exists anywhere.
- Fits this site's personal/opinionated style well, same spirit as
  `jump-puzzle-macros.html`'s personal-tips angle, rather than a wiki clone.
- Risk: subjective by nature, and needs light revision as new inventory features
  ship (Chocobo Saddlebag, expansions adding storage).

### "What new players actually ask" page

Pitch: a tight, current, curated FAQ page, not another sprawling wiki-style list.

- Evidence: two independent sources converge on nearly the same question set: the
  official sticky
  ["Sprout FAQs"](https://forum.square-enix.com/ffxiv/threads/495303-Sprout-FAQs)
  (dyeing gear, aggro, Party Finder/Unsync, healer boredom, marketboard basics,
  extreme queues not popping, glamour dresser, DC travel, GC promotion) and
  [MMORPG.com's new-player FAQ](https://www.mmorpg.com/guides/final-fantasy-xiv-common-new-player-questions-2000120181)
  (iLvl, melding, Limit Break, tomestones, Golden Saucer, flying, beast tribes). The
  sticky thread's existence is itself frequency evidence.
- Gap is partial: scattered coverage already exists (MMORPG.com, Moonieverse,
  Trials of Fantasy), so the value-add here is curation and staying current, not
  filling a void.

### Retainer venture optimization (gearing vs. quick venture, when to switch)

- Already covered by Console Games Wiki, Teamcraft, and RPGSite, but a GameFAQs
  thread and forum posts still call it confusing, so the real opportunity is a
  tighter decision tool, not new territory.
- Lower priority than the two above since coverage already exists, just not in a
  decision-tool format.

### Currency cap/expiry tracker: "what's about to go to waste"

- Evidence: [TheGamer's tomestone-cycle-exchange piece](https://www.thegamer.com/final-fantasy-14-xiv-allagan-tomestones-cycle-exchange-explained/)
  confirms this is real, recurring, seasonal confusion every time tomestone tiers
  rotate.
- Best suited as a live/interactive tool rather than a static article: this would
  reuse the currency-tracking groundwork already built for the mounts guide, rather
  than needing new architecture.
- Risk: needs upkeep every patch cycle when tomestone tiers rotate, similar
  maintenance shape to the beast-tribe/tomestone data in `hunt-for-astronomy.html`.

---

## Plugin directory extensions

Ideas for extending the generated directory at `xivkit.com/plugins/` (source in
`directory/`, data from `scripts/plugins-fetch.mjs`). Parked, not scheduled.

### Chat commands per plugin

Show a "Chat commands" section on each plugin page (e.g. DailyDuty: `/dailyduty`,
`/dd`), each with a short note. Useful at a glance, and "what's the command for X" is
a common search, so it's real unique content for the thin-page concern before launch.

Where commands actually live (checked against Dalamud's source):
- Not in any data we fetch. The plugin master, manifests and PluginDistD17 have no
  command field.
- Plugins register them in code at startup (`ICommandManager.AddHandler("/cmd", new
  CommandInfo(...) { HelpMessage = "..." })`). The in-game installer only lists them
  for a plugin that's installed and loaded, by asking Dalamud's `CommandManager` what
  that plugin registered (`PluginInstallerWindow.cs`, the `plugin.IsLoaded` block).
- Some READMEs list them (DailyDuty does), but many big plugins have near-empty
  READMEs (Allagan Tools, Simple Tweaks, GatherBuddy).

Scanning the compiled DLL (in each plugin's `latest.zip` on PluginDistD17) for strings
starting with `/` was tried on four plugins and is too noisy to publish directly:
- GatherBuddy: mostly right (`/gather`, `/gatherfish`, `/gbc`), plus `/gatherdebug`.
- Allagan Tools: right, but only in the attribute (UTF-8 blob) strings, plus noise
  like `/week`.
- DailyDuty: found `/dailyduty`, missed `/dd`.
- Simple Tweaks: missed `/tweaks`, and returned game commands the plugin sends for you
  (`/say`, `/party`, `/linkshell`) plus binary junk (`/bi9`).
There's no way to tell from the file alone whether a string is a command the plugin
adds or a game command it types. It also means downloading ~500 zips (Allagan Tools
alone is 8MB).

Plan if picked up:
1. A one-off candidates script (not part of every fetch): scan each plugin's DLL
   (both string tables) and README, filter out known game and Dalamud commands, and
   write guesses to a review file.
2. A hand-confirmed `directory/content/commands.json` keyed by plugin slug, starting
   with the ~50 most-installed plugins. Confirm each against the in-game installer,
   which shows the real list once the plugin is installed.
3. Render the section only for confirmed plugins. Never publish unconfirmed guesses.

### Author pages

Make the author on each plugin page a link to an author page (`/plugins/author/<slug>/`)
listing everything that person publishes in the directory, with a link to their GitHub
profile. Lets people discover more good plugins from authors they already trust, and
gives search engines a page per author to index.

Notes:
- Data check (2026-11-08): 382 distinct authors in `plugins.json`, 102 with more than
  one plugin (NightmareXIV 21, rail 10, MidoriKami 9, Caraxi 8, and so on). Only
  generate pages for multi-plugin authors, so there are no thin one-plugin pages.
  Single-plugin authors can stay plain text.
- Dalamud's `Author` is a free-text display name and not unique (it can be a handle,
  a team, or a comma list). Safer to key on the GitHub repo owner parsed from
  `repoUrl`, and show the display name as the title. Needs a pass for plugins whose
  `repoUrl` owner differs from the author name, and for multi-author strings.
- Page content: author name, GitHub profile link (and avatar via
  `https://github.com/<owner>.png`), plugin count, and the plugin list reusing the
  existing card/list partial. Worth a short generated intro line ("N Dalamud plugins
  by X") so the page isn't just a list.
- Add the author pages to `plugins/sitemap.xml` (new Eleventy template next to
  `category.njk`), and link them from the plugin page and the category pages. Respect
  the same `unavailable` rule: leave out authors with no available plugins.
- Good for the indexing goal: roughly 100 new indexable pages plus an outbound link to
  each author's GitHub profile.

### Support section for authors with donate or sponsor links

On the plugin page's info sidebar, add a "Support" section with the author's donate or
sponsor links when the repo has any (GitHub Sponsors, Ko-fi, Patreon, Buy Me a Coffee,
and so on). The same links could also appear on the author page.

Notes:
- `plugins.json` has no funding fields today, so `scripts/plugins-fetch.mjs` needs to
  collect them. GitHub exposes them as the repo's `.github/FUNDING.yml` (raw file) or
  as `fundingLinks` in the GraphQL API. Parsing FUNDING.yml needs no auth but is one
  request per repo (about 600), so reuse whatever caching or rate-limit handling the
  fetch already has. Only show links the repo itself declares, never guess.
- Render with `rel="noopener nofollow"` as for other outbound links, and keep it to
  recognised platforms rather than arbitrary URLs from the YAML.
- Needs i18n strings for the section heading if the directory pages are localized.
- Good for the outbound-link goal: links to high-authority sites (GitHub Sponsors,
  Ko-fi, Patreon) from every plugin page that has them, and it is useful to visitors
  because it points them at a way to thank the authors.

### Third-party repo to consider: EchoXIV

`https://echoxiv.com/` is a small plugin suite by one author (jFray, GitHub
`jfraygit/EchoXIV`) with its own repository. Its manifest is at
`https://echoxiv.com/pluginmaster.json` (the address people would add under Custom
Plugin Repositories), and it is the same manifest format the fetch already reads.

Checked 2026-11-08: the manifest lists 5 plugins at API level 15, all by jFray, with icons
and punchlines: EchoMix (shared music sync), EchoSim (rotation simulator), EchoNav
(what's up in North Horn, one click to go there), EchoGlam (glamour sharing) and
EchoRoleplay (roleplay profile). The site's homepage text only mentions the first three,
so it may lag the manifest.

Notes:
- Adding it is one line in `directory/content/repos.json`
  (`{ "id": "echoxiv", "name": "EchoXIV", "site": "https://echoxiv.com/", "url": "https://echoxiv.com/pluginmaster.json" }`)
  and then `pnpm plugins`. Put it after the established repos, since order decides which
  repo wins for duplicate plugins (no overlap expected).
- Check before adding: that these plugins are not already in the official list or
  another listed repo, and whether the suite is established enough for "well-known
  third-party repositories". It looks new and small, so it may be worth waiting or
  asking the author. Several plugins do networked things (music sync, sharing glamours
  and profiles), so read what they send before recommending them.
- Would also feed the author pages idea, since jFray would have 5 plugins.

### Third-party repo to consider: Aethertek

`https://aethertek.io/` publishes a combined repository at `https://aethertek.io/x.json`
(same manifest format the fetch already reads). It is a hub that gathers plugins from
several authors rather than one person's own plugins.

Checked 2026-11-08: 30 plugins at API level 15, none already in the directory by
`InternalName`. About 21 are by DhogGPT/McVaxius (the main publisher), plus five XA and Aethertek
plugins, WigglyMuffin's Questionable and Influx, MacaronDream's Questionable Companion,
and Kyuuso's Eureka Suite. The site also has a donations link, a wiki and a Discord.

Notes:
- Adding it is one line in `directory/content/repos.json`
  (`{ "id": "aethertek", "name": "Aethertek", "site": "https://aethertek.io/", "url": "https://aethertek.io/x.json" }`)
  and then `pnpm plugins`. Order matters for duplicates, so list it after the
  established repos.
- **Content policy decision needed first.** A large share is automation: Questionable
  (automated questing), Loot Goblin (treasure map bot), Fren Rider (multiboxing
  follow), MOGTOME (duty farming), AI Duty Solver, Botology, Coppelia (HealBot) and
  similar. Botting-style tools are against the game's terms, and the directory is a
  public showcase. Options: list everything with a clear note, list everything but
  tag automation plugins and filter them out by default (like the Third-party filter),
  or skip the automation plugins. This is the main reason not to add it blindly.
- Several entries are stubs for privately granted or beta access (mom, DhogNav,
  Deep Ducking, XA Zod "private early beta"). They would be useless pages for visitors.
  The fetch would need a per-repo exclude list (by `InternalName`) in `repos.json`.
- Adding it would create a lot of pages from one author, so it pairs with the author
  pages idea (DhogGPT alone would be about 19 plugins, the largest author group in the
  directory after NightmareXIV). It also pairs with the Support section idea, since the
  site asks for donations.
- Same vetting as EchoXIV: these plugins read and send game data in various ways, so
  skim what they do before recommending anything.

### Smaller parked items

- **"Docs and usage on GitHub" link**: make the source link a clear call to action on
  each plugin page instead of the small "Source: github.com" line, since many authors
  keep usage, commands and config docs in the README.
- **My picks**: removed from the directory for now. The notes are still in
  `directory/content/picks.json` and the fetch still matches them, so bringing them
  back is template work only (section, badges, page note, filter toggle).
- **Self-hosted icons**: before launch, have the fetch download icons, resize them to
  ~88px WebP and serve them from the site (about 1.5MB total), instead of hotlinking
  GitHub raw (icons range up to 1.2MB each, and GitHub can throttle).
- **Extra screenshots by hand**: some repos have more images than the author lists for
  Dalamud (Allagan Tools has a `screenshot5.png` it doesn't publish). If wanted, add a
  small per-plugin override list rather than scanning repos, which are full of
  unrelated images.

---

## Site performance and accessibility pass

From a PageSpeed/Lighthouse run on the homepage (mobile, 2026-11-08): Performance 81,
Accessibility 87, Best Practices 100, SEO 100. Full findings and a suggested order are
in `pagespeed-report-2026-11-08.md`.

- **Fix layout shift (CLS 0.34)**: reserve space for the JS-built tag bar and check
  the list shifting down after load. The only metric that is actually bad.
- **Small list icons**: the guide list uses full-size `og-*.png` cards at favicon
  size (about 300 KB wasted). Generate about 64px WebP icons.
- **Accessibility**: lighten footer legal text (4.47:1), underline footer links, and
  enlarge the tag button tap targets.
- **Trim render-blocking CSS**: Bulma is 36 KB with about 28 KB unused, and the Google
  Fonts stylesheet blocks render. Self-host a trimmed Bulma and/or the fonts. Needs care
  to keep the brand look.
- **Test the other pages**: only the homepage was run so far.

---

## Ideas considered and ruled out

Recorded so these don't get re-researched later:

- **Triple Triad cards**: confirmed not marketboard-tradeable at all (only
  sellable to an NPC for MGP, and MGP can't be spent on the marketboard either).
  There's no "buy" side to compare against, so no guide is possible in this shape.
- **Doman Mahjong shop**: just another MGP-reward system, not a distinct tradeable
  currency. Folds into the general MGP problem below rather than being its own
  guide.
- **Gold Saucer MGP items broadly**: MGP itself is never gil-buyable, so the "buy
  the mats" side of the comparison doesn't exist. The only occasional tradeoff is
  "grind MGP vs. buy the rare marketboard-tradeable exception" (e.g. Sabotender
  Emperador, Pod 602), which is too sparse and inconsistent across items to carry a
  whole guide. Better as a footnote callout inside the mounts/minions guides than
  its own page.
- **Housing furnishings**: a real buy-vs-grind tradeoff exists (crafted/vendor/
  gemstone-bought vs. marketboard) but the item count is enormous and heavily
  overlaps with the "framing kits" already sold by the gemstone vendor. Worth
  revisiting as a much bigger future project, not a near-term pick.
- **Materia melding/breakpoints**: already well served by xivgear.app and
  Teamcraft's gearset calculators, which solve this as an actual calculator rather
  than a written guide. Would just duplicate existing tools.
- **Housing lottery mechanics**: five or more major press explainers already cover
  this clearly (Inverse, PC Gamer, Destructoid, TechRaptor, ScreenRant).
- **Deep Dungeon mechanics (Palace of the Dead/Heaven-on-High/Eureka Orthos)**:
  well covered by Icy Veins, the Console Games Wiki, ESTNN, and GameRant.
- **Ocean Fishing scoring**: well covered by Icy Veins, Teamcraft, Fieldcraft, and
  a detailed community forum guide.
- **Job unlock order**: covered by TheGamer, GamesRadar, Destructoid, FFXIV Guild,
  and Sportskeeda, all with current lists. Also goes stale every expansion, so
  high maintenance for low differentiation versus existing coverage.
- **Beast tribe reputation mechanics**: covered by the wiki plus Icy Veins'
  per-tribe pages.
- **Weekly tomestone cap/augmented gear**: covered clearly by Icy Veins' Dawntrail
  gearing guide.
- **Mirroring plugin READMEs on directory pages**: README quality varies wildly (a
  full guide for DailyDuty, a few lines for Allagan Tools or GatherBuddy), the text and
  images are the author's (code licenses vary and don't clearly cover republishing
  docs), it would duplicate GitHub content across hundreds of pages, and it goes stale.
  Link to the README instead and pull out only short facts like chat commands (see
  "Plugin directory extensions").
- **Free Company vs. static vs. raid group**: answered informally across many
  threads already, and it's too subjective/social a topic for a factual guide
  format to add much.
