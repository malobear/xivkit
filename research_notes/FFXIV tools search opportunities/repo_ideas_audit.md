# Repo ideas audit: search opportunity and competition for XIVKit's documented ideas

Scope: every content/tool idea written down in the repo (`guide-ideas.md`, `msq-tracker-plan.md`, `pagespeed-report-2026-11-08.md`, `README.md`, `CLAUDE.md`), scored for search demand and competition as of 2026-11-11 (Dawntrail 7.x, patch 7.56 era). Repo facts are cited as file:line. Web claims are cited by URL. Search volume was not directly observable (no keyword tool, no Google autocomplete or People Also Ask access; Reddit only reachable through mirror domains in search results), so every Demand score is an **estimate** built from proxies (repeat questions in forums, how many publishers wrote the same article, official FAQ stickies).

## What the site already covers (do not recommend these as new)

### Takeaway
XIVKit already ships 8 guides/tools plus a generated Dalamud plugin directory with 13 category pages. Four of the backlog's original ideas (trade-in mounts, inventory decluttering, retainer ventures, MSQ tracker) are already built, and an Evercold prep checklist exists as a work-in-progress page that is not yet in `sitemap.xml`.

### Cited Findings
- Live pages and their target queries (from each page's `<title>` / meta description in the repo root):
  - `index.html` "XIVKit: FFXIV Tools & Links": curated tool list (market, crafting, theorycrafting, trackers, glamour, reference).
  - `plugins.html` "FFXIV Plugins": Dalamud plugins the owner uses, `experimental` tag for custom repos.
  - `watchlist.html` "FFXIV Watchlist": untried tools.
  - `plugins/` generated directory: official plugin master list plus third-party repos, 13 category pages (housing, roleplay, games, glamour, market, crafting-gathering, combat, ui, chat-social, audio-music, graphics, quality-of-life, other) (`llms.txt` lines 22-38; `README.md` lines 86-132).
  - `jump-puzzle-macros.html` "FFXIV Jump Puzzle Macros: Exact Jump Distances".
  - `hunt-for-astronomy.html` "FFXIV Hunt for Astronomy Rewards: Worth the Tomes?" (tomestone budget tracker, MB prices).
  - `trade-in-mounts.html` "FFXIV Trade-In Mounts: Grind or Buy the Mats?" (tribal, Bozja, Cosmic Exploration, Island Sanctuary, hunts; live Universalis prices; live verdict via `computeVerdict()`, `guide-ideas.md` lines 37-43).
  - `inventory-decluttering.html` "FFXIV Inventory Full? What to Keep, Bank or Discard".
  - `retainer-ventures.html` "FFXIV Retainer Ventures: Best Ones for Gil" (ranks ventures by live MB value for class/level/stats).
  - `keybound-brawler.html` "FFXIV Keybound Brawler Rewards: MGC Cost and Grind Math".
  - `fanfest-bingo.html` "FFXIV Fan Fest Keynote Bingo Card Maker".
  - `msq-tracker.html` "FFXIV MSQ Tracker with a Shareable Link" (ARR through Dawntrail, link carries current quest, PNG card).
  - `get-ready-for-evercold.html` "FFXIV Evercold Prep Checklist: What to Do Before 8.0" (WIP; includes an MSQ planner sharing `msq-core.js`, `README.md` lines 191-193). **Not listed in `sitemap.xml`** (sitemap has 11 URLs, this page absent) and not in `llms.txt`.
- Ideas explicitly ruled out in the repo, so others should not re-propose them (`guide-ideas.md` lines 366-410): Triple Triad cards (not tradeable), Doman Mahjong shop, Gold Saucer MGP items broadly, housing furnishings (deferred, not dead), materia melding (xivgear.app/Teamcraft own it), housing lottery explainers, Deep Dungeon mechanics, Ocean Fishing scoring, job unlock order, beast tribe reputation mechanics, weekly tomestone cap/augmented gear, mirroring plugin READMEs, Free Company vs static.
- Next expansion context: Evercold (8.0) launches February 23, 2027 with early access February 19, 2027, after a delay from January announced at Tokyo Fan Fest on October 31, 2026 — [Final Weapon](https://finalweapon.net/2026/10/30/final-fantasy-xiv-evercold-expansion-release-date-early-access-pre-orders/), [PC Gamer](https://www.pcgamer.com/games/final-fantasy/final-fantasy-14-evercold-delayed-to-february-preorders-start-next-week/), [MassivelyOP](https://massivelyop.com/2026/10/31/final-fantasy-xiv-evercold-confirms-zephyr-class-new-areas-new-gearing-and-a-delay-to-february-2027/). Sources differ on whether all pre-orders or only some editions get early access ([Siliconera](https://www.siliconera.com/final-fantasy-xiv-expansion-evercold-release-date-falls-in-february/) vs. most others).
- Evercold also brings a new Zephyr class and gearing/progression changes — [MassivelyOP](https://massivelyop.com/2026/10/31/final-fantasy-xiv-evercold-confirms-zephyr-class-new-areas-new-gearing-and-a-delay-to-february-2027/), [Icy Veins progression changes](https://www.icy-veins.com/ffxiv/evercold-progression-changes). A Switch 2 version was announced alongside Evercold — [Gematsu](https://www.gematsu.com/2026/04/final-fantasy-xiv-evercold-expansion-switch-2-version-and-evangelion-collaboration-announced).

### Inferences
- The 8.0 launch (Feb 2027) is the single biggest search-demand window in the next 4 months. Any idea that can hook into "before Evercold" queries (currency spending, MSQ catch-up) gets a time-limited boost.
- Indexing gap: the Evercold prep page should be added to `sitemap.xml` and `llms.txt` before demand peaks, otherwise the site's most timely page is harder to discover.

### Gaps
- No Search Console data was available, so I could not tell which existing pages already rank or for what.

## Which repo ideas have real, repeatedly expressed player demand?

### Takeaway
Strongest demand signals (estimates) are for: currency/tomestone spending before an expansion (covered by a new article from many outlets at every expansion), new-player questions (official sticky plus daily Reddit megathreads), and MSQ progress ("how much is left"). Trade-in minions/orchestrion/barding and the plugin-directory extensions have thin or unobservable demand signals; their case is long-tail SEO plus reuse of existing code, not proven volume.

### Cited Findings
**Scored inventory of every unbuilt idea** (1-5 each; Demand and Gap are estimates; Effort 5 = easy; Durability 5 = evergreen; composite = sum out of 25):

| Rank | Idea (repo source) | Demand | Gap | Tool fit | Effort | Durability | Total |
|---|---|---|---|---|---|---|---|
| 1 | Trade-in minions (`guide-ideas.md` 58-82) | 3 | 4 | 5 | 4 | 4 | **20** |
| 2 | Currency cap/expiry tracker, reframed as "spend before Evercold" (`guide-ideas.md` 171-180) | 4 | 3 | 5 | 3 | 2 | **17** |
| 3 | Plugin chat commands per plugin (`guide-ideas.md` 189-224) | 3 | 4 | 4 | 2 | 3 | **16** |
| 4 | Trade-in orchestrion rolls (`guide-ideas.md` 85-101) | 2 | 3 | 4 | 3 | 4 | **16** |
| 5 | Plugin author pages (`guide-ideas.md` 226-250) | 1 | 3 | 3 | 4 | 4 | **15** |
| 6 | Housing furnishings buy-vs-craft (ruled out for now, `guide-ideas.md` 382-385) | 3 | 3 | 4 | 1 | 4 | **15** |
| 7 | Chocobo barding trade-ins (`guide-ideas.md` 105-116) | 1 | 3 | 2 | 4 | 4 | **14** |
| 8 | Add EchoXIV third-party repo (`guide-ideas.md` 271-294) | 1 | 4 | 2 | 5 | 2 | **14** |
| 9 | Plugin "Support the author" section (`guide-ideas.md` 252-269) | 1 | 2 | 2 | 3 | 4 | **12** |
| 10 | Add Aethertek repo (`guide-ideas.md` 296-327) | 2 | 3 | 2 | 3 | 2 | **12** (plus ToS/policy risk) |
| 11 | "What new players actually ask" FAQ (`guide-ideas.md` 147-161) | 5 | 1 | 1 | 3 | 2 | **12** |
| - | Smaller directory items: GitHub docs CTA, My picks, self-hosted icons, extra screenshots (`guide-ideas.md` 329-343) | n/a | n/a | n/a | 4-5 | n/a | UX/perf, not search content |
| - | Performance/accessibility pass: CLS 0.34, oversized icons, render-blocking CSS (`guide-ideas.md` 347-362; `pagespeed-report-2026-11-08.md`) | n/a | n/a | n/a | 3 | n/a | Site-wide ranking hygiene, do first; CLS is the only failing metric |

Already built (scored for context, not for building): trade-in mounts, inventory decluttering, retainer ventures, MSQ tracker, Evercold prep (WIP).

**Demand evidence per idea:**
- Currency expiry: every expansion produces a wave of "exchange/spend old tomestones" articles: [Siliconera Dawntrail prep](https://www.siliconera.com/how-to-prepare-for-ffxiv-dawntrail-and-the-7-0-patch/), [Siliconera old tomestones/scrips](https://www.siliconera.com/how-to-exchange-old-tomestones-and-scrips-in-ffxiv/), [The Nerd Stash](https://thenerdstash.com/ffxiv-where-to-exchange-old-tomestones-discontinued-tomestone-exchange-guide), [Prima Games](https://primagames.com/tips/ffxiv-how-to-exchange-your-old-tomestones), [Prima "10 things before Dawntrail"](https://primagames.com/gaming/10-things-every-ffxiv-player-must-do-before-dawntrail). Guides say tomestones are cycled at expansion start and every even patch and convert at a reduced rate, and advise spending yellow scrips before they're lost (summarized from the same results). The repo's own evidence: [TheGamer cycle exchange explainer](https://www.thegamer.com/final-fantasy-14-xiv-allagan-tomestones-cycle-exchange-explained/) (`guide-ideas.md` 173-175).
- Evercold prep demand already exists: [MMOGah "What you should do before 8.0 Evercold"](https://www.mmogah.com/news/ffxiv/what-you-should-do-before-ffxiv-80-evercold) (in 6+ languages), [Icy Veins Evercold guide hub](https://www.icy-veins.com/ffxiv/evercold-expansion-guides-home-page), precedent [MassivelyOP Dawntrail last-minute prep checklist](https://massivelyop.com/2024/06/24/wisdom-of-nym-mops-last-minute-prep-checklist-for-final-fantasy-xiv-dawntrail/).
- New-player questions: official sticky [Sprout FAQs](https://forum.square-enix.com/ffxiv/threads/495303-Sprout-FAQs) (`guide-ideas.md` 152-158); r/ffxiv runs a Daily Questions megathread every day (e.g. [mirror of r/ffxiv daily megathread](https://reddit.birdcat.cafe/r/ffxiv/comments/1jrzal8/daily_questions_faq_megathread_april_05)); r/ffxiv keeps a [wiki FAQ](https://pol1.lr.ggtyler.dev/r/ffxiv/wiki/general_information/faq).
- MSQ progress (already built, but confirms demand for the tracker and the Evercold MSQ planner): a Steam thread asks for a site showing MSQ completion percentage and quests remaining ([Steam discussion](https://steamcommunity.com/app/39210/discussions/0/592883578486963822)); r/ffxiv daily threads have repeated "am I halfway?" questions ([mirror](https://pol1.lr.ggtyler.dev/r/ffxiv/comments/1ecjfyi/daily_questions_faq_megathread_july_26/lf404bq)); one commenter complained a community MSQ tracker omitted required side questlines ([mirror](https://pol1.lr.ggtyler.dev/r/ffxiv/comments/1ecjfyi/daily_questions_faq_megathread_july_26/lf47hxv/?context=3)).
- Inventory (built): repeated in r/ffxiv daily threads ([mirror](https://reddit.birdcat.cafe/r/ffxiv/comments/1e0kd0y/daily_questions_faq_megathread_july_11/lcovkl4/?context=3)), an official forum thread [Inventory/Retainers Full](https://forum.square-enix.com/ffxiv/threads/349285-Inventory-Retainers-Full?p=4448402), plus a viral item-donation story on [Mein-MMO](https://mein-mmo.de/en/player-from-final-fantasy-14-says-you-should-donate-your-unused-items-to-special-npcs-that-are-not-actually-npcs,1391688).
- Minions/vouchers: voucher-related queries generate per-mount and per-minion articles ([FandomSpot Micro Gigantender](https://fandomspot.com/ffxiv-how-to-get-micro-gigantender-minion), [Dot Esports vouchers](https://dotesports.com/ff/news/how-to-get-and-use-bicolor-gemstone-vouchers-in-final-fantasy-xiv), [TheGamer vouchers](https://www.thegamer.com/final-fantasy-14-endwalker-guide-getting-bicolor-gemstone-vouchers/)), which suggests steady long-tail demand around "is it worth it" for gemstone rewards. Vouchers are marketboard items with large observed medians (165,000 gil for the original voucher, 122,000 for the Turali one, per [Saddlebag 35833](https://saddlebagexchange.com/queries/item-data/35833) and [Saddlebag 43961](https://saddlebagexchange.com/queries/item-data/43961); snapshot date unknown).
- Plugin commands: no Reddit thread surfaced in search. Signal is indirect: Dalamud's `/xlhelp` lists registered commands but hides aliases ([summary of plugin framework docs in search results](https://github.com/PrincessRTFM/TinyCommands)), and one existing gist lists commands only up to patch 6.58 ([natyusha gist](https://gist.github.com/natyusha/1fa9bf8897225acbf5e01565943d3464)).
- Barding, orchestrion, author pages, Support section, EchoXIV/Aethertek: no demand signal found in search.

### Inferences
- "Repeatedly expressed" demand (multiple outlets, official FAQ, daily megathreads) applies only to: expansion currency spending, new-player questions, MSQ progress, and inventory. Of those, two are built and one (new-player FAQ) is unwinnable as framed (see next section). That makes the "spend before Evercold" currency tool the highest-demand unbuilt idea, but its demand is seasonal (spikes before 8.0 and around even-numbered patches).
- Trade-in minions ranks first overall on fit and effort rather than raw demand: it reuses `trade-in-mounts.html` nearly as-is (`guide-ideas.md` 64-68), and no competitor offers live buy-vs-grind math.

### Gaps
- No keyword volumes; Google autocomplete/PAA could not be observed. Reddit threads only visible via mirror domains; native reddit.com threads were not in results.
- No demand data found for chocobo barding or orchestrion "worth it" queries.

## For which ideas is the top of Google already owned by a high-authority source that answers well (low opportunity)?

### Takeaway
New-player FAQ is the clearest low-opportunity idea (Icy Veins, Prima, PlayStation, Console Games Wiki, r/ffxiv wiki FAQ). Static "what currency buys what" lists are owned by Console Games Wiki and Icy Veins, so the trade-in ideas only win with the live-price verdict angle. Plugin commands and live gemstone-reward value have no strong owner.

### Cited Findings
- New-player FAQ: [Icy Veins new player tips](https://www.icy-veins.com/ffxiv/new-player-tips), [Prima Games beginners' guide and FAQ](https://primagames.com/featured/final-fantasy-xiv-beginners-guide-and-faq), [PlayStation absolute beginner's guide](https://www.playstation.com/en-om/editorial/final-fantasy-xiv-an-absolute-beginners-guide/), [Console Games Wiki guide for players new to MMORPGs](https://consolegameswiki.com/wiki/Guide_for_Players_New_to_the_MMORPG_Genre), [Trials of Fantasy](https://trialsoffantasy.com/new-player/), [Digital Trends](https://www.digitaltrends.com/gaming/ffxiv-beginners-guide/), plus r/ffxiv's [Definitive FAQ](https://cal1.lr.ggtyler.dev/r/ffxiv/wiki/definitive_faq). Weakness: several are dated (the r/ffxiv FAQ mirror still refers to Dawntrail as just launched), and the freshest 2026 one is from a gil/account seller ([AccountShark](https://accountshark.net/blog/ffxiv-beginner-guide-2026-best-server-class-starting-tips)).
- Currency reference: [Icy Veins "Sources and Uses of Currencies"](https://www.icy-veins.com/ffxiv/sources-and-uses-of-currencies) and the tomestone-exchange articles above own the informational query. None is interactive.
- Minions: [ffxivcollect minions](https://ffxivcollect.com/minions) (list with sources, prices, drop rates), [CGW Minions](https://ffxiv.consolegameswiki.com/wiki/Minions), [Escapist Dawntrail minions](https://www.escapistmagazine.com/all-ffxiv-dawntrail-minions-and-how-to-get-them/), [Twinfinite Dawntrail minions](https://twinfinite.net/guides/all-ffxiv-dawntrail-minions-how-to-get-them/). None compare live marketboard cost of mats/currency vs grind.
- Mounts (built): [CGW Mounts list](https://ffxiv.consolegameswiki.com/wiki/Mounts_list), [ffxivcollect p2w price data](https://ffxivcollect.com/p2w/mounts), [Windows Central mounts list](https://windowscentral.com/final-fantasy-14-mounts-list). Again, no live buy-vs-grind verdict, which supports the existing page's angle.
- Orchestrion: owned by [CGW Orchestrion Roll](https://consolegameswiki.com/wiki/Orchestrion_Roll), [CGW Gemstone Traders](https://ffxiv.consolegameswiki.com/wiki/Gemstone_Traders), [GameSkinny Dawntrail gemstone trader items](https://www.gameskinny.com/tips/all-gemstone-trader-items-in-ffxiv-dawntrail/), [Gfinity orchestrion rolls](https://www.gfinityesports.com/guides/final-fantasy-xiv-orchestrion-rolls). Gemstone-trader rolls cost 350 to 450 raw Bicolor Gemstones with Shared FATE rank gates ([CGW Bicolor Gemstones](https://ffxiv.consolegameswiki.com/wiki/Bicolor_Gemstones), [CGW Emerald under Sapphire](https://ffxiv.consolegameswiki.com/wiki/Emerald_under_Sapphire_Orchestrion_Roll)). Many such rolls trade on the market board ([Saddlebag: Cast Stones in Shadow roll](https://saddlebagexchange.com/queries/item-data/45038)).
- Chocobo barding: [CGW Chocobo Barding](https://ffxiv.consolegameswiki.com/wiki/Chocobo_Barding) lists sources. In the half of the page I could read: 3 for Achievement Certificates (3 each), 6 for Grand Company seals, 2 for MGP, 2 for Bicolor Gemstones, 2 for Seafarer's Cowries, 1 for Skybuilders' Scrips (Machinist Barding, 1,200), 1 for Purple Gatherers' Scrip (Chocobo Raincoat, 800), plus many crafted and about 12 Online Store items; no tomestone barding seen. This answers the repo's open question (`guide-ideas.md` 113-116): Skybuilders' Scrips fund at most one barding, so the funding is almost entirely bound currencies.
- Retainer ventures (built): competitors are [Icy Veins ventures overview](https://www.icy-veins.com/ffxiv/retainer-ventures-overview), [RPGSite (Endwalker-era)](https://www.rpgsite.net/feature/12184-ffxiv-endwalker-retainer-leveling-gearing-ventures-and-making-gil), and gil-seller blogs ([Timesaver](https://timesaver.gg/blog/ffxiv-retainer-ventures-gil-guide), [AccountShark](https://accountshark.net/blog/ffxiv-gil-making-guide-2026)). None rank ventures by live price for a given retainer.
- MSQ (built): competitors are [CGW MSQ](https://ffxiv.consolegameswiki.com/wiki/MSQ), per-expansion lists ([esports.gg Dawntrail MSQ list](https://esports.gg/news/gaming/ffxiv-dawntrail-msq-list/), [Game8](https://game8.co/games/Final-Fantasy-XIV/archives/462636)), and msqtracker.com (per `msq-tracker-plan.md` lines 6-11; it did not appear in my search results for "msq tracker how many quests left", where CGW and list articles dominated).
- Evercold prep (WIP): currently served by [MMOGah](https://www.mmogah.com/news/ffxiv/what-you-should-do-before-ffxiv-80-evercold) (gil seller), [WowCarry](https://wowcarry.com/blog/final-fantasy-xiv/ffxiv-evercold-release-date-early-access-guide) (boosting service), and [Icy Veins' Evercold hub](https://www.icy-veins.com/ffxiv/evercold-expansion-guides-home-page). No interactive checklist surfaced.
- Plugin directory: search for a plugin browser/best-plugins list surfaced mostly GitHub topic pages and aggregators ([GitHub dalamud-plugin topic mirror](https://github.imc.re/topics/dalamud-plugin), [karashiiro xiv-resources, last pushed July 2024](https://awesome.ecosyste.ms/projects/github.com%2Fkarashiiro%2Fxiv-resources), [DalamudRepoBrowser](https://relatedrepos.com/gh/UnknownX7/DalamudRepoBrowser)), not a strong editorial owner. Plugin command queries return GitHub READMEs and Dalamud dev docs ([Mintlify Dalamud commands](https://www.mintlify.com/goatcorp/dalamud/game/commands)).

### Inferences
- Low opportunity: new-player FAQ (high-authority, multi-publisher, low tool fit). Medium-low: static currency explainers, static minion/orchestrion lists.
- Opportunity exists where the result set is either gil-seller blogs (retainer ventures, Evercold prep) or GitHub/dev pages (plugin commands, author pages). Gil-seller and boosting sites ranking for a query is a sign that authority sites have not taken it.

### Gaps
- I could not observe actual SERP order on Google; results come from the search tool's index, which approximates but is not Google.
- The second half of the CGW barding page was not read, so barding counts are partial.

## Which ideas should be reframed (different angle or query) to be winnable?

### Takeaway
Reframe around money and deadlines: "spend before Evercold" (not a generic cap tracker), "Bicolor Gemstone rewards worth selling" (not orchestrion-only), a merged "gemstone/voucher vendor: grind vs buy" page (minions plus rolls plus barding), and a "returning for Evercold" FAQ instead of a generic new-player FAQ. Drop barding as a standalone guide.

### Cited Findings
- Tomestone and scrip conversion at expansion launch is at a reduced rate and every outlet tells players to spend first ([Prima](https://primagames.com/tips/ffxiv-how-to-exchange-your-old-tomestones), [The Nerd Stash](https://thenerdstash.com/ffxiv-where-to-exchange-old-tomestones-discontinued-tomestone-exchange-guide)); Evercold arrives Feb 23, 2027 ([Final Weapon](https://finalweapon.net/2026/10/30/final-fantasy-xiv-evercold-expansion-release-date-early-access-pre-orders/)).
- Minion buys from gemstone traders often use raw gems (Wee Ea 500, Micro Gigantender 400) rather than vouchers ([FandomSpot](https://fandomspot.com/ffxiv-how-to-get-micro-gigantender-minion), search-result summary of [Fanbyte shared FATEs](https://www.fanbyte.com/ffxiv/guides/endwalker-shared-fates)); raw Bicolor Gemstones are bound, while vouchers trade for six figures ([Saddlebag 35833](https://saddlebagexchange.com/queries/item-data/35833)).
- Orchestrion rolls from gemstone traders cost 350 to 450 gems and many are sellable ([CGW Bicolor Gemstones](https://ffxiv.consolegameswiki.com/wiki/Bicolor_Gemstones), [Saddlebag roll 45038](https://saddlebagexchange.com/queries/item-data/45038)).
- Barding funding is overwhelmingly bound currency (GC seals, certificates, MGP, cowries) per [CGW Chocobo Barding](https://ffxiv.consolegameswiki.com/wiki/Chocobo_Barding).
- Switch 2 version and a new class (Zephyr) point to new and returning players around 8.0 ([Gematsu](https://www.gematsu.com/2026/04/final-fantasy-xiv-evercold-expansion-switch-2-version-and-evangelion-collaboration-announced), [MassivelyOP](https://massivelyop.com/2026/10/31/final-fantasy-xiv-evercold-confirms-zephyr-class-new-areas-new-gearing-and-a-delay-to-february-2027/)).

### Inferences (all estimates)
1. **Currency tracker -> "What to spend before Evercold" calculator** inside or linked from `get-ready-for-evercold.html`: enter current Poetics/Heliometry(or current tome)/scrip counts, see what they buy now vs. what they convert to. Ship before January 2027; afterwards retarget to the next even-patch tome rotation. Durability rises if framed as "tomestone rotation tool" with per-patch data.
2. **Minions + orchestrion + barding -> one "Gemstone and voucher vendors: what's worth it" page**, plus a gil-making angle: which raw-gemstone purchases (rolls, minions) sell best on the market board right now. This turns bound-currency items (no buy side) into a "convert gems to gil" ranking, a structure the site already uses for retainer ventures. Keep a separate trade-in minions page only if the minion list is large enough to stand alone (repo already plans reuse, `guide-ideas.md` 64-68).
3. **Barding**: fold into the combined page as a section; not a standalone guide (structural finding: almost all grind-only).
4. **New-player FAQ -> "Returning for Evercold / starting on Switch 2" FAQ**, short and dated, linking to the MSQ tracker and Evercold planner. Generic version is unwinnable.
5. **Plugin commands**: winnable as long-tail ("<plugin name> commands") because existing answers are scattered READMEs; start with the top ~50 plugins as the repo plans (`guide-ideas.md` 217-224). Low effort-per-page once confirmed, but confirmation is manual.
6. **Author pages / Support section / extra repos**: treat as directory hygiene and internal linking, not traffic drivers. Aethertek needs the automation-content policy decision first (`guide-ideas.md` 312-318); listing botting tools may carry reputational risk for a public showcase.
7. **Housing furnishings** remains a large but plausible future "craft vs buy" tool; out of near-term scope per the repo.
8. Before any new content: fix CLS 0.34 and add the Evercold page to `sitemap.xml`/`llms.txt`.

### Gaps
- No direct evidence on which raw-gemstone items sell best; would need a Universalis pass.
- Could not confirm whether Evercold retires current tomestones exactly as previous expansions did; patch notes for 8.0 are not out yet. Treat as expected based on precedent only.
