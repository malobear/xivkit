# FFXIV interactive tool opportunities (calculators, trackers, checklists, timers, planners)

Researched 2026-11-11. Scope: tool-type pages a small static EN/JA/DE/FR site (XIVKit, https://xivkit.com) could build. XIVKit already ships an MSQ Tracker (`msq-tracker.html`), a Retainer Ventures page, item-list guides with icons, a plugin directory, and a "Get Ready for Evercold" page, so those are excluded or treated as extensions.

Method caveat: no keyword-volume tool (Ahrefs, Semrush, Google Keyword Planner) was available, and the web search tool returned no Reddit threads at all for "is there a tool / website for" queries. Demand scores below are therefore **estimates** inferred from (a) how many competing sites and SEO content farms target a query, and (b) how often guides/wikis link a tool. GitHub status checks were done via the unauthenticated GitHub API.

## Which tool-type queries do players search, and who already serves them?

### Takeaway
Most classic tool queries (fishing/timed nodes, collections, achievements, crafting, market, Mini Cactpot, Wondrous Tails, daily/weekly checklists) are already served, several by strong, actively maintained tools, and some (timed nodes, Wondrous Tails, Cactpot) are now also being targeted by new SEO-built sites. The thinnest coverage is around Dawntrail-era systems (Occult Crescent progression, Cosmic Exploration) and around simple calculators (leveling/EXP, Knowledge Level) where search results return only guides and spreadsheets.

### Cited Findings

**Fishing and timed gathering nodes (crowded, well maintained)**
- The Carbuncle Plushy fish tracker (ff14fish) lists fish available now and within 15 minutes, copies in-game alarm commands, and showed a last update of 2026-11-03; a Fish Train tool on the same site is in beta and under active development. — [FFX|V Fish Tracker App](https://ff14fish.carbuncleplushy.com/), [Fish Train Tool](https://ff14fish.carbuncleplushy.com/fishtrain.html)
- FFXIV Fieldcraft tracks "every timed gathering node, fish window, and Ocean Fishing voyage against a live Eorzea clock," has a weather forecast page, Ocean Fishing countdown, watch-list nudges and long-form guides; it says data is "current as of November 2026" and "Verified for Patch 7.58." It links sister sites ffxiv-sanctuary.com, eorzeahomecoming.com and ffxiv-offduty.com (looks like an SEO-oriented site network; inference). — [ffxiv-fieldcraft.com](https://ffxiv-fieldcraft.com/)
- Two more timed-node trackers exist: FFXIV Gathering Tracker (Unspoiled/Legendary/Collectable spawns with Eorzea clock) and a GitHub Pages gathering-log tracker with timed node alarms and macro generation (data updated 10/19/2026). — [ffxivgatheringtracker.com](https://ffxivgatheringtracker.com/), [ronaldzzzzz ffxiv-toolbox gathering log](https://ronaldzzzzz.github.io/ffxiv-toolbox/gathering-log/)
- Weather: Fieldcraft has a weather forecast page (above); a Python library EorzeaEnv offers Eorzea time and weather forecasts for developers (not a website). The search did not surface a standalone current weather site. — [ffxiv-fieldcraft.com](https://ffxiv-fieldcraft.com/), [EorzeaEnv on PyPI](https://pypi.org/project/eorzeaenv)

**Collections and achievements (served)**
- FFXIV Collect is the main third-party collection tracker, syncing Lodestone collections, with a free no-key API for non-commercial use. — [FFXIV Collect](https://ffxivcollect.com/), [ffxiv collect api listing](https://publicapi.dev/ffxiv-collect-api)
- No reports found of Lalachievements closing; PC Gamer describes it as excluding unobtainable achievements. — [PC Gamer](https://pcgamer.com/10-years-after-launch-one-player-has-nabbed-every-one-of-final-fantasy-14s-2751-achievements)

**Crafting/data (served, but Garland Tools code is stale)**
- Teamcraft's GitHub repo was pushed 2026-11-10 (1,972 stars): actively maintained. — [GitHub API: ffxiv-teamcraft](https://api.github.com/repos/ffxiv-teamcraft/ffxiv-teamcraft)
- The public GarlandTools repo's last push was 2023-10-18 (the site itself may still be updated by private deploys; not verified). — [GitHub API: ufx/GarlandTools](https://api.github.com/repos/ufx/GarlandTools)
- xivapi/ffxiv-datamining pushed 2026-11-10, so game data sources for a static site remain current. — [GitHub API: xivapi/ffxiv-datamining](https://api.github.com/repos/xivapi/ffxiv-datamining)

**Gold Saucer / weekly minigames (served, partly by low-quality content farms)**
- Mini Cactpot: the classic open-source solver (super-aardvark/cactpot-calculator) last pushed 2015-02-28 (still works because the game rule hasn't changed; inference). Content farm everycalculators.com hosts Cactpot, Wondrous Tails and "Gold Saucer lottery" calculator pages, and codingace.net hosts a Wondrous Tails calculator. — [GitHub API: cactpot-calculator](https://api.github.com/repos/super-aardvark/cactpot-calculator), [everycalculators Cactpot](https://everycalculators.com/cactpot-calculator.html), [everycalculators Wondrous Tails](https://everycalculators.com/ffxiv-wondrous-tails-calculator.html), [codingace Wondrous Tails](https://codingace.net/general/wondrous_tails_ffxiv.html)
- everycalculators.com returned HTTP 403 to my fetch, so its quality could not be assessed. — [everycalculators WT page](https://everycalculators.com/ffxiv-wondrous-tails-calculator.html)
- Wondrous Tails guide on Icy Veins was last updated November 2021 (per search snippet). — [Icy Veins Wondrous Tails](https://www.icy-veins.com/ffxiv/wondrous-tails-guide-and-weekly-rewards)
- Inference: content farms building "ffxiv X calculator" pages signals that these exact-match queries carry search volume.

**Daily/weekly reset checklists and timers (served by XIVTODO and wikis)**
- XIVTODO offers customizable daily and weekly checklists and automatic completion trackers; no date, patch number or language options visible on its homepage. — [xivtodo.com](https://xivtodo.com/)
- The reset-time query is mostly answered by articles (Destructoid, Prima, Inverse) and the wiki's Daily and Weekly Checklist page; Guild Order offers a guild-focused reset tracker. — [Destructoid](https://www.destructoid.com/ffxiv-reset-timer-explained-when-does-the-daily-and-weekly-reset-happen/), [Prima Games](https://primagames.com/tips/ffxiv-weekly-reset-guide-times-and-events), [Consolegameswiki checklist](https://ffxiv.consolegameswiki.com/wiki/Daily_and_Weekly_Checklist), [Guild Order reset tracker](https://guildorder.com/plugins/reset-tracker?game=ffxiv)
- Inference: the many news articles answering "when is reset" indicates real query demand for a localized live countdown, but the incumbent articles rank already.

**Leveling / EXP calculator (gap)**
- Searching for an EXP calculator returned only leveling guides and a Google Sheet; guides give rough rules ("one level for every two to three dungeon runs") and per-level EXP (e.g. 23,789,000 for 99 to 100) but no calculator. — [Consolegameswiki Leveling Guide](https://ffxiv.consolegameswiki.com/wiki/Leveling_Guide), [Google Sheet](https://docs.google.com/spreadsheets/d/1nzh6eCrxSZNcWmngrYyZicn4MrEhVA3KGQQJa2b_sXg/edit), [r/ffxiv wiki mirror: leveling](https://r.datuan.dev/r/ffxiv/wiki/leveling)

**Island Sanctuary (served by plugin, fading content)**
- The workshop optimizer found was a Dalamud plugin (Uriei/WorkshopOptimizerPlugin), whose GitHub repo now returns Not Found; search surfaced no web planner, only guides. — [Search result link](https://redirect.github.com/Uriei/WorkshopOptimizerPlugin), [GitHub API 404](https://api.github.com/repos/Uriei/WorkshopOptimizerPlugin), [Icy Veins workshop guide](https://www.icy-veins.com/ffxiv/island-sanctuary-workshop-guide)

### Inferences
- Building another fish/timed-node tracker, collection tracker, or crafting tool would compete with mature, maintained sites plus SEO networks. Low gap.
- The opening is in "small calculators that only exist as guides or spreadsheets" and in Dawntrail systems, plus localization (none of the tools checked advertised JA/DE/FR support, though that was not verified for all).

### Gaps
- No search volume numbers; no Reddit threads retrieved (search tool returned none for r/ffxiv queries).
- Did not verify: ffxivclock, ff14angler, Eorzea Weather sites, Saddlebag, Kaiyoko, housing lottery timers, GC expert delivery tools, Triple Triad trackers (ATTriad / Another Triple Triad Tracker), Blue Mage trackers, hunt train sites (e.g. Faloop), Doman Mahjong, fashion report (XIVKit already links fashionreportxiv.com), DC travel/congestion. Their status is unknown from this research.
- Couldn't check ff14fish's or FFXIV Collect's repos (GitHub API returned Not Found / Moved).

## Dawntrail-era and 2026 content: where are the gaps?

### Takeaway
Patch 7.5 (Apr 28 2026) and 7.55 (Jul 2026) added North Horn (Occult Crescent's last zone, Knowledge cap 40, new Phantom Jobs), Beastmaster, and an Ocean Fishing route; Occult Crescent has several FATE/CE pop trackers but no progression calculator/checklist surfaced, and Cosmic Exploration has guides and spreadsheets but no planner tool surfaced. The next expansion (Evercold) is the biggest upcoming search event.

### Cited Findings
- Patch 7.5 "Trail to the Heavens" Part 1 launched April 28, 2026; adds Beastmaster (limited job), The Clyteum dungeon, Enuo trial. — [CGMagazine](https://www.cgmagonline.com/news/final-fantasy-xiv-ffxiv-7-5-beastmaster), [Icy Veins 7.5 overview](https://www.icy-veins.com/ffxiv/dawntrail-patch-7-5)
- North Horn (final Occult Crescent zone), Knowledge Level cap raised to 40, new Phantom Jobs and the final Forked Tower; sources disagree whether this was 7.5 or 7.55, with Massively OP previewing North Horn "ahead of patch 7.55" in July 2026. — [Massively OP](https://massivelyop.com/2026/07/17/final-fantasy-xiv-previews-more-of-the-north-horn-and-more-hildibrand-ahead-of-patch-7-55/), [SimpleBoost North Horn guide](https://simpleboost.com/guides/ffxiv-north-horn-guide/)
- New Ocean Fishing route: Thavnair (7.5). — [Icy Veins 7.5 overview](https://www.icy-veins.com/ffxiv/dawntrail-patch-7-5)
- Fieldcraft is "Verified for Patch 7.58", implying the current patch is 7.58 as of November 2026. — [ffxiv-fieldcraft.com](https://ffxiv-fieldcraft.com/)
- Occult Crescent FATE/CE trackers exist: XIVStats Occult Tracker, ffxiv-occult.com (now redirects to xiv-shinies.com; based on ffxiv-eureka code, tracks CE downtime and weather), Infi's Occult Tracker, Lynn Lizard's South/North Horn maps, Eorzea World zone pages, and an "Unnamed Occult Crescent Tool" info site whose FATE/CE cheatsheets were still "coming soon." — [tracker.xivstats.com](https://tracker.xivstats.com/), [ffxiv-occult.com](https://ffxiv-occult.com/), [Lynn Lizard North Horn](https://lynn-lizard.github.io/crescent/northhorn/), [Eorzea World](https://eorzeaworld.com/en/occultcrescent), [Unnamed OC Tool](https://asipofgin.github.io/Unnamed-Occult-Crescent-Tool/)
- No dedicated Phantom Job mastery checklist or Knowledge Level calculator surfaced; the mechanics are documented (24 phantom jobs, mastery at job level 6 grants a Phantom Mastery stack; sources disagree on per-stack bonus, 1% vs 2%). — [Consolegameswiki Knowledge Level](https://ffxiv.consolegameswiki.com/wiki/Knowledge_Level), [SimpleBoost phantom jobs](https://simpleboost.com/guides/ffxiv/occult-crescent-phantom-jobs-guide/), [dving.net phantom jobs](https://dving.net/guides/ffxiv-phantom-jobs-guide)
- Lodestone character pages already expose Knowledge Level and phantom job mastery publicly (e.g. "Knowledge Level 26 with 562,775 / 642,000"). — [Lodestone class_job example](https://na.finalfantasyxiv.com/lodestone/character/48636631/class_job/)
- Cosmic Exploration: resources are guides (Icy Veins, Thonky, Eorzean Tavern), a wiki mission list, spreadsheets, a "Cosmic Tool Research Helper", and the official Lodestone Cosmic Class Tracker; no web mission planner surfaced. — [Icy Veins Cosmic Exploration](https://www.icy-veins.com/ffxiv/cosmic-exploration), [Icy Veins Cosmic Tools](https://www.icy-veins.com/ffxiv/cosmic-tools), [Consolegameswiki Cosmic Exploration](https://ffxiv.consolegameswiki.com/wiki/Cosmic_Exploration), [Lodestone Cosmic Exploration](https://na.finalfantasyxiv.com/lodestone/cosmic_exploration/), [Eorzean Tavern Cosmic Tools](https://eorzeantavern.com/cosmic-tools/)
- Evercold is the upcoming expansion (Icy Veins frames 2026 drops as "before Evercold hits"). — [Icy Veins](https://www.icy-veins.com/ffxiv/news/ffxiv-players-heres-every-major-drop-before-evercold-hits/)
- FFXIV Mobile shut down in China Sept 30 2026 (not relevant to PC tools, noted to avoid confusion with "shutdown" searches). — [Gematsu](https://www.gematsu.com/2026/07/final-fantasy-xiv-mobile-to-end-service-on-september-30-in-china-global-version-canceled)

### Inferences
- Occult Crescent and Cosmic Exploration content will lose traffic once Evercold launches (lower durability), whereas expansion-agnostic calculators (leveling, reset, Cactpot) keep value.
- Because Occult Crescent's FATE/CE pop tracking needs live crowd data (plugin-reported), a static site should not compete there; a static Phantom Job/Knowledge checklist with shareable URL state (like XIVKit's MSQ Tracker) fits the site's existing pattern.

### Gaps
- Evercold's release date and its new systems were not researched here (likely covered by another researcher / the site's existing Evercold page).
- Did not confirm whether Teamcraft added Cosmic Exploration mission planning.

## Ranked tool ideas (scores 1-5; all scores are estimates)

### Takeaway
Best bets for a static, localized site: (1) a leveling/EXP calculator, (2) an Occult Crescent Phantom Job + Knowledge checklist, (3) a localized reset countdown + daily/weekly checklist, (4) a Mini Cactpot solver plus Wondrous Tails odds calculator, and (5) an Evercold launch countdown/prep checklist. Avoid fish/node trackers, collection/achievement trackers, BiS/gearsets, crafting profit, and live hunt/CE trackers.

### Cited Findings
Scoring: Demand (search interest, estimate), Gap (5 = no good tool), Effort (5 = easiest for a static site), Durability (5 = evergreen). Composite = sum (max 20). Evidence column points to findings above.

| Rank | Idea | Demand | Gap | Effort | Durab. | Total | Evidence / competition |
|---|---|---|---|---|---|---|---|
| 1 | Leveling/EXP calculator (current level+EXP to target, runs of roulette/dungeon/Deep Dungeon needed; per-level EXP table from XIVAPI ParamGrow sheet) | 4 | 4 | 4 | 5 | 17 | Only guides and a Google Sheet surface ([wiki](https://ffxiv.consolegameswiki.com/wiki/Leveling_Guide), [Sheet](https://docs.google.com/spreadsheets/d/1nzh6eCrxSZNcWmngrYyZicn4MrEhVA3KGQQJa2b_sXg/edit)); Evercold level cap raise will spike demand (inference) |
| 2 | Mini Cactpot solver + Wondrous Tails odds/shuffle calculator, localized | 4 | 3 | 5 | 5 | 17 | Solver code dates to 2015 ([GitHub](https://api.github.com/repos/super-aardvark/cactpot-calculator)); content farms target the queries ([everycalculators](https://everycalculators.com/cactpot-calculator.html)) |
| 3 | Reset countdown (daily, weekly, GC, fashion report, Jumbo Cactpot by DC region) + personal daily/weekly checklist in localStorage | 4 | 2 | 5 | 5 | 16 | XIVTODO covers checklists ([xivtodo](https://xivtodo.com/)); reset time answered by articles ([Destructoid](https://www.destructoid.com/ffxiv-reset-timer-explained-when-does-the-daily-and-weekly-reset-happen/)); gap is a localized, ad-free live countdown |
| 4 | Occult Crescent Phantom Job mastery + Knowledge Level checklist/calculator (shareable URL like MSQ Tracker) | 3 | 5 | 4 | 2 | 14 | No such tool found; mechanics documented ([wiki](https://ffxiv.consolegameswiki.com/wiki/Knowledge_Level)); trackers only cover FATE/CE pops ([xivstats](https://tracker.xivstats.com/)) |
| 5 | Evercold launch countdown + prep checklist (extends existing get-ready-for-evercold.html) | 4 | 3 | 5 | 2 | 14 | Expansion is the next big search event ([Icy Veins](https://www.icy-veins.com/ffxiv/news/ffxiv-players-heres-every-major-drop-before-evercold-hits/)) |
| 6 | Eorzea clock + weather forecaster (zone dropdown, next N windows, localized zone names via XIVAPI) | 3 | 2 | 4 | 5 | 14 | Fieldcraft has weather ([fieldcraft](https://ffxiv-fieldcraft.com/)); no standalone site surfaced; algorithm public ([EorzeaEnv](https://pypi.org/project/eorzeaenv)) |
| 7 | Cosmic Exploration planner (mission list by class/level with credit/research yields) | 3 | 4 | 2 | 2 | 11 | Only guides/spreadsheets ([Icy Veins](https://www.icy-veins.com/ffxiv/cosmic-exploration), [wiki](https://ffxiv.consolegameswiki.com/wiki/Cosmic_Exploration)); data heavy |
| 8 | Tomestone/scrip/currency "what can I buy" planner | 3 | 2 | 3 | 4 | 12 | Teamcraft has currency-spending ([Teamcraft](https://ffxivteamcraft.com/currency-spending)), which XIVKit already links |
| 9 | Island Sanctuary workshop planner | 2 | 3 | 2 | 2 | 9 | Plugin optimizer repo gone ([GitHub 404](https://api.github.com/repos/Uriei/WorkshopOptimizerPlugin)); content is from Endwalker, interest fading (inference) |
| 10 | Fish/timed-node tracker | 4 | 1 | 2 | 4 | 11 | Crowded: ff14fish, Fieldcraft, 2+ others ([ff14fish](https://ff14fish.carbuncleplushy.com/), [fieldcraft](https://ffxiv-fieldcraft.com/)) |
| 11 | Mount/minion/achievement tracker | 4 | 1 | 2 | 4 | 11 | FFXIV Collect + Lalachievements ([Collect](https://ffxivcollect.com/)) |
| 12 | Occult Crescent FATE/CE pop tracker | 3 | 1 | 1 | 2 | 7 | Needs live crowd data; 3+ trackers exist ([ffxiv-occult](https://ffxiv-occult.com/), [xivstats](https://tracker.xivstats.com/)) |

### Inferences
- Ideas 1, 2, 3 and 6 are pure client-side math with game data from XIVAPI, fit the static-site constraint, and benefit most from JA/DE/FR localization (localized zone/item names come free from XIVAPI).
- Item icons per CLAUDE.md apply to any tool listing items (e.g. Wondrous Tails rewards, currency planner).
- Combining 3 and 6 into one "Eorzea time, weather and resets" page could capture several query families at once (inference).

### Gaps
- Demand scores are estimates without search-volume data; validate with Google Search Console / Keyword Planner before building.
- Mobile-friendliness and localization of competitor tools were not systematically checked (only Fieldcraft and XIVTODO homepages fetched; neither stated language support).
- Unchecked ideas from the brief (Triple Triad, Blue Mage spellbook, treasure maps, GC expert delivery, allied society quests, PvP series, Moogle Treasure Trove, housing lottery, DC travel, Doman Mahjong, sightseeing log, materia/meld, BiS, glamour/dye) could not be assessed within the research budget.
