# FFXIV housing: tools, plugins, and sourcing for beginners (as of 2026-11-15)

## Which Dalamud plugins help housing, and do they need the `experimental` tag?

### Takeaway
Several housing plugins exist in the default Dalamud repo, so no `experimental` tag is needed for them. BDTH and MakePlace are NOT in the default repo (BDTH is a custom-repo plugin; Re:MakePlace is a standalone app, not a plugin). Note that 489 of 507 entries in the live master list have `IsHide: true`, so nearly every plugin below is hidden from browsing and users must search the exact name.

### Cited Findings
Data checked by fetching the live master list on 2026-11-15 (507 entries): [PluginMaster](https://kamori.goats.dev/Plugin/PluginMaster). All below are matched real entries with RepoUrl and DownloadLinkInstall (default repo, so no `experimental` tag).

- **Housingway** (InternalName `Housingway`, IsHide true, updated 2026, Dalamud API 15). Tweaks: disable camera collision, disable cast shadows/SSAO indoors, pop range display, door command (return to entrance), furniture info, highlight phased objects, indoor sun, interior lighting override for other players' houses, skybox override. Repo AGPL-3.0; README says nothing on ToS. — [GitHub](https://github.com/Abyeon/Housingway); [PluginMaster](https://kamori.goats.dev/Plugin/PluginMaster)
- **Housemate** (IsHide true, API 15). Shows info about housing fixtures/objects: exterior list while running around a ward, item overlay to see what makes up a structure. Description says it is purely informational and does not assist placement. Good for inspiration and identifying items in other houses. — [GitHub](https://github.com/perchbirdd/Housemate); [PluginMaster](https://kamori.goats.dev/Plugin/PluginMaster)
- **PaissaHouse** (InternalName `autoSweep`, IsHide true, API 15). Notifies when a new plot goes on sale on your home world; crowdsourced from players who manually visit wards; also lottery tracking. PaissaDB lists plots per world. Install via XIVLauncher, GitHub-release installs "not recommended or supported". Does not automate player actions. MIT. — [GitHub](https://github.com/zhudotexe/FFXIV_PaissaHouse); [PluginMaster](https://kamori.goats.dev/Plugin/PluginMaster)
- **Housing Herald** (IsHide true, API 14, no RepoUrl listed in master). Reminds you when results are in for a house you bid on in the lottery. — [PluginMaster](https://kamori.goats.dev/Plugin/PluginMaster)
- **Target Furniture** (IsHide true, API 15). Adds a Housing Menu option that targets furniture for you, useful when items overlap and clicking is hard. — [GitHub](https://github.com/InitialDet/TargetFurniture); [PluginMaster](https://kamori.goats.dev/Plugin/PluginMaster)
- **Better Housing** (InternalName `ProperHousing`, **IsHide false**, version 1.1.4.0, but Dalamud API level 9 and last update Dec 2023, so likely stale/obsolete vs API 15 plugins). Furniture selection based on what you see, keybinds for mode switching, counter and snap toggles. — [GitHub](https://github.com/Sevii77/properhousing); [PluginMaster](https://kamori.goats.dev/Plugin/PluginMaster)
- **Housing Cull Fix** (IsHide true, API 15). "Removes the annoying 400 housing item display limit." Useful for big houses. — [GitHub](https://github.com/Abyeon/HousingCullFix); [PluginMaster](https://kamori.goats.dev/Plugin/PluginMaster)
- **Facade** (IsHide true, API 15). Client-side visual change to the exterior appearance of any house; "changes reset upon entering the plot". Cosmetic only, others do not see it (inferred from description). — [GitHub](https://github.com/keifufu/Facade); [PluginMaster](https://kamori.goats.dev/Plugin/PluginMaster)
- **Doorbell** (IsHide true). Chime when someone enters a house. — [GitHub](https://github.com/Aida-Enna/Doorbell); [PluginMaster](https://kamori.goats.dev/Plugin/PluginMaster)
- **Allagan Tools** (InternalName `InventoryTools`, IsHide true, v1.15.1.1, API 15). Tracks items across characters/retainers/FC, craft planning, market board integration. Useful for gathering furnishing materials. — [GitHub](https://github.com/Critical-Impact/InventoryTools); [PluginMaster](https://kamori.goats.dev/Plugin/PluginMaster)
- **Allagan Item Search** (IsHide true) and **Item Search** (Caraxi, IsHide true): find items by name/properties even if you do not own them. — [GitHub](https://github.com/Critical-Impact/AllaganItemSearch), [GitHub](https://github.com/Caraxi/ItemSearchPlugin)
- **Price Insight** (IsHide true, API 15): shows NQ/HQ market board prices on hover, from Universalis, cached 90 minutes, Alt refreshes. Handy when pricing furnishings. — [GitHub](https://github.com/kouzukii/ffxiv-priceinsight); [PluginMaster](https://kamori.goats.dev/Plugin/PluginMaster)
- **Island Sanctuary helpers** (default repo, IsHide true): Workshop Optimizer Plugin, Beachcomber, ReSanctuary, AutoMammet. Relevant because Island Sanctuary sells/yields housing items. — [PluginMaster](https://kamori.goats.dev/Plugin/PluginMaster)
- **Not found in the master list** (searched name/internal name/description for bdth, burning, makeplace, lifestream): **BDTH (Burning Down the House)**, MakePlace. So both would need `experimental` (BDTH) or be listed as an external app (MakePlace).
- **BDTH**: a third-party tool loaded via Dalamud custom repo that lets players exceed in-game placement limits. Only dated or low quality sources found (an old gist for patch 6.58 mentions a BDTH custom repo; a SEO page claims Square Enix has a "strict stance" but gives no policy text). I found no evidence of BDTH being banned or enforced against in 2026. — [gist (patch 6.58)](https://gist.github.com/natyusha/1fa9bf8897225acbf5e01565943d3464); search result page [Burning Down the House Spotlight](https://teigezuheltzer.carrd.co/)
- **Re:MakePlace** (successor to MakePlace, volunteer-maintained): standalone Windows app (free, ~2 GB, extract to a non-system folder) to preview/edit/share layouts; works for all housing types and districts; plugin not required, can be used alone or as a companion to the FFXIV Plugin; page lists version 7.57.1; supports EN/DE/FR/JA/CN. No ToS text on page. In-app preview lighting/colours may differ from the game. Commenters note third-party tools are controversial in the housing community. — [Re:MakePlace on itch.io](https://remakeplace.itch.io/remakeplace); [alt page](https://izaarestel.itch.io/re-makeplace); [original MakePlace page](https://jawslouis.itch.io/makeplace)
- Context on 2026 enforcement climate: Mare Synchronos shut down citing a "legal inquiry", and the Memoria tool was killed after a stalking scandal. Neither is housing-related, but it shows third-party tooling risk is topical. — [Icy Veins](https://www.icy-veins.com/ffxiv/news/after-mare-synchronos-shut-down-whats-next-for-ffxiv/); [FinalBoss](https://finalboss.io/how-a-stalking-scandal-just-killed-ffxivs-memoria)

### Inferences
- Experimental tag verdict: Housingway, Housemate, PaissaHouse, Housing Herald, Target Furniture, Better Housing, Housing Cull Fix, Facade, Doorbell, Allagan Tools, Item Search, Price Insight all need no `experimental` tag per the project rule. BDTH would need `experimental`. Re:MakePlace is not a Dalamud plugin; if listed, describe as external app.
- ToS risk: the project's list shows nothing that automates gameplay. Housingway/Facade/Housing Cull Fix/BDTH modify client-side behaviour or rendering; BDTH (placing beyond intended limits) and any "void building" helpers are the most likely to be viewed as exploitative. All third-party tools technically sit outside Square Enix's terms, so a standard site disclaimer is advisable. This is my judgment, not an official statement.
- Because 489/507 are `IsHide: true`, the writer should instruct users to search the exact plugin name. Better Housing is the only housing plugin not hidden, but its API 9 build looks abandoned; recommend Housingway/Target Furniture instead.

### Gaps
- No official Square Enix policy text on housing-related third-party tools was found.
- BDTH repo URL, current maintenance status and a reliable primary source were not verified. "Make Place" is not a plugin. "Housing Toolbox", "Furniture Catalogue", "Housing Hotkey" and "Housing Lottery/Plot Info" do not exist as separate entries in the master list (nearest are Housingway, Housemate, PaissaHouse).
- I did not verify that Facade's changes are client-side only beyond the description wording.

## Which websites help (databases, prices, plots, inspiration)?

### Takeaway
Use Universalis for prices, Garland Tools for crafting lists, Console Games Wiki for furnishing galleries and merchant prices, PaissaDB for plot availability, and Housing Snap/HGXIV/Mister Foxclon's Neighborhood for inspiration. Eorzea Collection housing and a dedicated "housing plot finder" site beyond PaissaDB were not verified.

### Cited Findings
- **Universalis**: crowd-sourced market data across servers with price history and cross-world summaries; open REST API, docs at docs.universalis.app. — [About](https://universalis.app/about); [API docs](https://docs.universalis.app)
- **Garland Tools**: unofficial FFXIV database, not affiliated with Square Enix; item search/filters, block-based crafting lists with crafting depth, EN/FR/DE/JA, synced via Account Key. The front page shows no dedicated housing browse category. — [Garland Tools](https://www.garlandtools.org/db/)
- **Teamcraft** (ffxivteamcraft.com): page is a JS app, content not readable via fetch; Garland Tools lists Teamcraft under shared crafting lists. Features not verified here. — [Teamcraft](https://ffxivteamcraft.com/)
- **PaissaDB** (zhu.codes/paissa; paissadb.zhu.codes redirects to it with 307 and the redirected URL returned 404 when fetched directly, so verify before linking): lists plots for sale per world, powers PaissaHouse. — [PaissaHouse README](https://github.com/zhudotexe/FFXIV_PaissaHouse); redirect noted from [paissadb.zhu.codes](https://paissadb.zhu.codes/)
- **Console Games Wiki** (ffxiv.consolegameswiki.com): galleries by category (Furnishing, Outdoor Furnishing, Flooring, Tabletop), Housing Items hub with 18 item categories, housing merchant item/price list. — [Housing Items](https://ffxiv.consolegameswiki.com/wiki/Housing_Items); [Furnishing Gallery](https://ffxiv.consolegameswiki.com/wiki/Furnishing_Gallery); [Housing Merchant list](https://ffxiv.consolegameswiki.com/wiki/Template:Housing_Merchant); [House](https://ffxiv.consolegameswiki.com/wiki/House)
- **Gamer Escape** furnishing page returned HTTP 403 to automated fetch, so not verified (URL tried: https://ffxiv.gamerescape.com/wiki/Housing_Furnishing).
- **Housing Snap** (housingsnap.com): Japanese-run housing screenshot sharing site; browse/search by keyword, time period, location (Goblet, Mist, Lavender Beds, Shirogane, Empyreum, Island), house size, floor, tags; sort by likes. — [Housing Snap](https://housingsnap.com/)
- **HGXIV** (started March 2019): housing community with Basics Guide, Glitch Guide, Design Guide (Google Doc), "Break It Down" tutorials, YouTube, Discord (discord.gg/hgxiv). — [About HGXIV](https://hgxiv.com/about-hgxiv); [Basics Guide](https://hgxiv.com/basics-guide/)
- **Patch-specific lists**: e.g. housing items per patch with acquisition methods. — [ProGameGuides 6.35](https://progameguides.com/final-fantasy/all-housing-items-added-in-final-fantasy-xiv-patch-6-35-and-how-to-get-them); [GGRecon 6.5](https://www.ggrecon.com/guides/ffxiv-housing-items-patch-6-5/); [Siliconera 7.1](https://www.siliconera.com/all-new-furnishings-in-ffxiv-7-1/)
- **Icy Veins housing guide**: exists (https://www.icy-veins.com/ffxiv/housing-guide) but fetch returned 403, content not verified.
- **Dye/colour tools**: none found specifically for housing (housing exterior dye is via Free Company crafting per the wiki). — [House wiki](https://ffxiv.consolegameswiki.com/wiki/House)

### Inferences
- Verified URLs to feature in the section: Universalis, Garland Tools, Console Games Wiki galleries, Housing Snap, HGXIV, PaissaDB (after re-checking the working URL).
- Pair Universalis/Price Insight with the vendor price list so beginners can tell whether the market board or the merchant is cheaper.

### Gaps
- Eorzea Collection has no confirmed housing section (searches returned nothing).
- r/ffxivhousing could not be fetched (Reddit blocked; the subreddit mentioned by results is r/ffxivhomeandgarden, mirrored but not directly verified).
- No dedicated dye/colour tool for housing and no Teamcraft housing-specific feature was confirmed.
- Gamer Escape and Icy Veins pages could not be read.

## How do beginners source furniture, and what is cheapest early on?

### Takeaway
The cheapest path is Housing Merchants (most basics 2,000 to 5,000 gil), plus an apartment (500,000 gil) or small cottage for the setup. Beyond that the sources I could confirm are crafting, Free Company, gardening, Island Sanctuary and seasonal events; Gold Saucer and achievement furniture were not verified.

### Cited Findings
- Furnishing limits (after patch 7.5): Cottage 300 indoor / 40 yard; House 450 / 60; Mansion 600 / 80; Apartment/Private Chamber 150 indoor, no yard. Another (older) source says apartments cap at 100; treat the wiki figure as current. — [House wiki](https://ffxiv.consolegameswiki.com/wiki/House); contradicted in age by [Attack of the Fanboy](https://attackofthefanboy.com/guides/how-to-get-an-apartment-in-ffxiv-a-house-for-when-you-cant-buy-an-actual-house/) (search snippet, 100 slots)
- Plot prices: Small 3,000,000 (fifth-class) to 3,750,000 (first-class) gil; Medium 16M to 20M; Large 40M to 50M. 60 plots per ward; 6,000 Small plots per server. Apartment: 500,000 gil, one per character, requires level 50 and second lieutenant rank in a Grand Company. — [House wiki](https://ffxiv.consolegameswiki.com/wiki/House)
- Housing Merchant prices (Console Games Wiki, partial read): interior walls, flooring and ceiling lamps mostly 5,000 gil (pendant lamps 3,000 to 4,000); chairs/stools about 2,000; benches/armchairs/beds about 5,000; tables/desks about 2,000, dining tables 3,000, cabinets/sideboards 5,000; partitions 500 to 3,000 (doors up to 9,500); bookshelves and rugs about 5,000; floor lamps/lanterns 3,000; Phasmascapes 10,000; small decor 500 to 4,000; mannequin 10,000; showcase 12,000. — [Housing Merchant list](https://ffxiv.consolegameswiki.com/wiki/Template:Housing_Merchant)
- Housing Merchant stock is sold both by NPCs in residential districts and by hired vendors. Cheapest vendor permit: Steward Permit, 3,000 gil (Estate Manservant/Maidservant); Hokonin and Allagan Housekeeping Node permits 5,000 gil; others cost event-style currencies (Namazu Koban, Kojin Sango, etc.). — [Player Housing Vendors](https://ffxiv.consolegameswiki.com/wiki/Player_Housing_Vendors)
- Housing NPC types: Junkmongers and Material Suppliers (plus Ananta, Felyne, Kojin, Loporrit, Namazu variants), Allagan nodes. — [House wiki](https://ffxiv.consolegameswiki.com/wiki/House)
- Other acquisition routes mentioned on the wiki: crafting facilities, Free Company crafting for exteriors (dye only), garden plants in flowerpots, Island Sanctuary Items category, Seasonal Miscellany, Feast rewards, Mog Station items. Estate vendors, mannequins, retainers, Feast rewards, seasonal event and Mog Station items cannot be previewed before purchase. — [House wiki](https://ffxiv.consolegameswiki.com/wiki/House); [Housing Items](https://ffxiv.consolegameswiki.com/wiki/Housing_Items)
- In-game "Preview Indoor Furnishings" lets you try items before buying (excludes Mog Station/event items and interior fixtures). — [HGXIV Basics](https://hgxiv.com/basics-guide/)
- Beginner placement tips: rotate while holding, toggle grid snap, counter surface placement toggle, Storage Mode for consumables/paintings/aquariums/wallpaper, "Move to Front Door" if stuck. — [HGXIV Basics](https://hgxiv.com/basics-guide/)
- One older guide says a small can be furnished for under 1M gil if not particular; a commissioned designer small-house price cited around 10M gil. — search snippets via [Gamer Empire](https://gamerempire.net/ffxiv-how-to-buy-and-build-a-house/); unverified.

### Inferences
- Best early value: buy merchant walls/floors (5,000 each), chairs/tables at 2,000, then rugs and lights; budget well under 1M gil for a furnished small. Use previews before purchase.
- A beginner without a plot can start in an apartment (500k) and learn the tools there.

### Gaps
- No verified per-item guide to Carpenter/Goldsmith/Weaver/Leatherworker/Alchemist/Culinarian furniture recipes, or which are cheapest to craft.
- Gold Saucer, achievement, tomestone and company-seal furniture not verified.
- Current market board prices were not checked (no Universalis query run).
- The merchant page was truncated at 100k of 110k characters.

## Popular small-house layout ideas and tour communities

### Takeaway
Community and official tour sources exist, but I did not find a verified "small house layout" curated list. Best verified starting points are Housing Snap filtered by Small, HGXIV guides, and Square Enix's Mister Foxclon's Neighborhood recaps.

### Cited Findings
- Mister Foxclon's Neighborhood: official housing tour series presented by Toshio "Foxclon" Murouchi; the Dec 20, 2024 episode toured 11 player designs (recap posted Jan 14, 2025). The page does not say which were small. — [Lodestone recap](https://na.finalfantasyxiv.com/blog/003684.html); also [Ep. 1](https://na.finalfantasyxiv.com/blog/003446.html), [Ep. 2](https://na.finalfantasyxiv.com/blog/003464.html)
- HGXIV: housing community with guides, tutorials and Discord. — [HGXIV](https://hgxiv.com/about-hgxiv)
- Housing Snap supports filtering by house size (see above). — [Housing Snap](https://housingsnap.com/)
- Designer portfolios on Carrd (small-house examples, commissions): [Soushi Housing](https://soushihomes.carrd.co), [Starflower Designs](https://starflower-housing.carrd.co), [Aloha Jayce](https://alohadesign.carrd.co/), [koko housing](https://koko-housing.carrd.co/). Only seen as search results, content not reviewed.
- Subreddit r/ffxivhomeandgarden exists (seen via a mirror in search results; not directly fetched). — [mirror](https://pol1.lr.ggtyler.dev/r/FFXIVhomeandgarden)

### Inferences
- A "tours" subsection should link Housing Snap (filter: Small), HGXIV, and Foxclon recaps, with the Carrd portfolios optional and flagged as commercial designers.

### Gaps
- No curated small-house layout guide verified; Eorzea Collection housing not found; r/ffxivhousing not verified (Reddit blocked); designer-portfolio sites were not vetted for safety or relevance.
