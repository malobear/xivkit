# Housing utilities: Flowerpots, Garden Patches, Guest Book (researched 2026-11-15, Patch 7.5x)

Sources: XIVAPI beta Item sheet (row data, icons), Console Games Wiki pages (Gardening, Flowerpot, Riviera Flowerpot, Round/Oblong/Deluxe Garden Patch, Oldrose Seeds, Message Book, Message Book Stand, Dodo Message Book Stand, Housing). All icon URLs below returned `200 image/png` (checked with the `_hr1.tex` path). Base URL: `https://beta.xivapi.com/api/1/asset?path=ui/icon/<path>_hr1.tex&format=png`

## 1. Flowerpots (indoor planter, one plant each)

Three cosmetic variants, identical function. XIVAPI category: Tabletop. In-game description (all three): "A garden planter designed in the <style> style. Small, medium, and large estates can hold 2, 3, and 4 planters, respectively. Private chambers and apartments can hold 2."

| Name | Item row_id | Icon path | Icon check |
|---|---|---|---|
| Riviera Flowerpot | 14055 | ui/icon/053000/053083.tex | 200 image/png |
| Glade Flowerpot | 14056 | ui/icon/053000/053084.tex | 200 image/png |
| Oasis Flowerpot | 14057 | ui/icon/053000/053085.tex | 200 image/png |

- Price: 1,200 gil (XIVAPI PriceMid 1200; wiki Riviera page says 1,200 gil, added Patch 3.3). Wiki lists no unlock requirement.
- Where: Housing Merchants in Mist (10.9, 11.5), The Lavender Beds (11.8, 8.4), The Goblet (11.5, 9.4), Shirogane (10, 11.9), Empyreum (10.2, 11.9); the Apartment Merchant in each apartment lobby (Ingleside, Kobai Goten, Lily Hills, Sultana's Breath, Topmast; about 6.1, 6); and the housing-menu "Purchase Furnishings" via your Estate Maidservant/Manservant-type NPC (the retainer-style NPCs listed on the Riviera page).
- Purpose: grows the same crops as garden patches, indoors. Also the only way to grow flower seeds (wiki: 27 flower seed types, 300 gil each; flowers come in nine colors, pomace shifts color). Wiki: intercrossing is NOT possible in flowerpots.
- Placement: indoors (private estate, FC estate, private chambers, apartments). Limits (XIVAPI description, current game data): Small 2, Medium 3, Large 4, apartment/private chamber 2. The Flowerpot wiki page lists the same (it did not mention apartments, but XIVAPI and the Apartment wiki page do).
- Who needs it: apartment dwellers and anyone who wants a little gardening without a yard. Apartments cannot have garden patches, so flowerpots are their only gardening.
- Flowerpots in storage do not grow (from earlier notes, wiki Storage page).
- Uncertain: the 7.5 housing furniture-limit increase was not confirmed to touch planter caps. XIVAPI item descriptions (current data) still say 2/3/4. Verify in-game if exact.

## 2. Garden patches (outdoor plots)

All three are category "Outdoor Furnishing". Description ends: "Small, medium, and large estates can hold 1, 2, and 3 garden patches, respectively." (so total patches 1/2/3 whichever type).

| Name | Item row_id | Icon path | Icon check | Beds | Price (gil) |
|---|---|---|---|---|---|
| Round Garden Patch | 7128 | ui/icon/052000/052151.tex | 200 image/png | 4 | 3,000 |
| Oblong Garden Patch | 7129 | ui/icon/052000/052150.tex | 200 image/png | 6 | 12,000 |
| Deluxe Garden Patch | 7130 | ui/icon/052000/052149.tex | 200 image/png | 8 (includes a scarecrow) | 48,000 |

- Prices match XIVAPI PriceMid and wiki vendor pages. No unlock requirement listed.
- Where: Junkmonger-type vendors in Player Housing (menu path "Gardening, Dyes"; the Junkmonger is hired as a retainer-style NPC, coordinates 6, 6 on the wiki; Allagan Commerce Node, Ananta/Kojin/Loporrit/Namazu/Felyne variants are the same shop) and Housing Merchants (Garden section) in Mist, Lavender Beds, Goblet, Shirogane, Empyreum.
- Placement: outdoors in the yard. Not allowed in apartments.
- Per-size patch limits: Small/cottage 1, Medium/house 2, Large/mansion 3. Max beds therefore: 8 / 16 / 24 with Deluxe patches (wiki Housing page). Wiki shows no 7.5 change for patches.
- Beginner pick: Round is cheapest (3,000 for 4 beds); Deluxe is 48,000 for 8 beds. Patches in storage do not grow.

### Gardening basics
- Prerequisite: none. Gardening wiki page says the Seeds of Change sidequest (Patch 2.2) is not required and unlocks nothing. There is no "Gardening Log" unlock in what I checked (no source found for one; the Gardening wiki page does not mention it). You just buy a patch or flowerpot, place it, and plant.
- Seeds: gathered by Botanists (often from the same nodes as the plant), or bought. Verified vendor prices: Flower seeds (e.g. Oldrose Seeds) 300 gil from Material Suppliers in each of the five housing districts, Apartment Merchants, and Tanie in New Gridania (11.1, 11.2); also a "Flower Vendor (2026)" at Starlight Stalls (5.6, 5.6) per wiki (seasonal; older one marked unavailable). XIVAPI PriceMid for Viola/Daisy seeds is 300, Thavnairian Onion Seeds 332 (PriceMid is a reference value, not proof of a vendor). I did not verify a vendor list for crafting-crop seeds (non-flower), so say "buy flower seeds from the Material Supplier; other seeds are Botanist-gathered or on the Market Board" only after a manual check.
- Soil: Potting Soil (row 16026, PriceMid 120) has no bonus effects; regional soils (Miner-gathered, from level 30 nodes) change yield, HQ chance, and intercrossing (Thanalan Soil better intercrossing, Shroud Soil better yield). Fertilizer: Fish Meal (row 7767), Material Supplier or Culinarian-crafted; one application per plant per Earth hour.
- Good for (verified from wiki): crafting materials (Alchemist recipes use Oldrose seeds, e.g. Brick Garden Wall, Rose Trellis, Walnut Flower Vases), flowers as furnishing ingredients (Riviera Flowerpot is itself a Candlelit Sundries ingredient), and some items are available only via gardening. NOT verified: dyes, Chocobo greens, a Gardening log. Do not claim these without checking (earlier note: gardening may also give flowers placeable as furnishings, "garden plants in flowerpots", from the Housing Items wiki page).

## 3. The Guest Book

- No item or feature called "Guest Book", "Guestbook", or "Visitor's Book" exists. XIVAPI Item name search for Guest, Guestbook, Guest Book, Registry returned nothing; "Visitor" returned only Visitor's Winterwear (unrelated seasonal outfit). Web search found nothing either.
- The closest real feature is the Message Book (added Patch 4.3). Wiki: visitors leave messages for the estate owner and can "like" the estate. Patch text in game data (Addon row 8473): "Message Books can now be found in all estates and apartments. Callers can now leave personalized messages, as well as like the estates." The wiki does not call it a guest book.
  - Furnishings (placement items):

| Name | Item row_id | Icon path | Icon check | Category | Place |
|---|---|---|---|---|---|
| Message Book Stand | 6541 | ui/icon/053000/053219.tex | 200 image/png | Tabletop (indoor) | indoors: private estate, FC estate, apartment |
| Dodo Message Book Stand | 22520 | ui/icon/052000/052263.tex | 200 image/png | Outdoor Furnishing | outdoors on estates |

  - Description both: "One per estate only." One of each at once; cannot go in the FC workshop.
  - Obtain: crafted, Carpenter level 62 (Message Book Stand: Larch Lumber, Beech Lumber, Potash, Crystal Glass, Wildfowl Feather x3, Wind Crystal x3, Ice Crystal; Dodo version swaps in Dodo Feather x3). No vendor listed on the wiki pages (vendor value 195 / 524 gil only), so it is Market Board or craft. Prices not verified (XIVAPI PriceMid 12,960 and 34,927 are reference values, not buy prices).
  - Rules (wiki): each character may leave one message per day (resets 15:00 GMT). Entries public by default, owner can make private. Owner can set a greeting, gets an alert per message ("Message Book Alert" in Log Window Settings, Announcements tab), and the author, owner, and authorized users can delete messages. Likes: ten on first view, then five daily, cap fifty; cannot like your own estate.
  - Who needs it: optional. Owners who open their home to visitors or want likes.
- Other real, related things (for a "visiting" card): Guest Access Settings (UI string in the game data, an Estate Hall option; private owners and FC leaders set guest access rules, per web search summary); estate map colors (wiki: yellow house = locked, blue = open to public); tenants (up to 3 friends can be shared an estate, use stable/garden or place furniture); Estate Holder Rights and the Barred Character List (Dawntrail 7.0, bars a visitor for 10 days; Siliconera, from earlier notes). I did not verify the exact in-game menu steps for Guest Access Settings.

## Flags
- Do not describe a "Guest Book" in the guide. Rename the card to "Message Book" (and say it works like a guest book).
- Dyes / Chocobo greens / Gardening Log: not verified, leave out.
- Localized names (JA/DE/FR) for these items were not fetched; use the XIVAPI Item sheet with `language=ja|de|fr` when adding translations.
