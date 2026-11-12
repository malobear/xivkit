// Regenerates data/currencies/*.json, the vendor lists behind the currency planner.
//
//   pnpm currencies
//
// Which shops exist, who runs them, and what each trade costs come from FFXIV Teamcraft's
// extracted shop data (MIT, github.com/ffxiv-teamcraft/ffxiv-teamcraft). Teamcraft decodes
// the game's currency codes (tomestone and scrip slots move every patch) and links each
// shop to the NPCs that open it, so only vendors you can actually reach are kept.
// Item names (all four client languages), icons, tradeability and category come from
// XIVAPI. Re-run after a patch and commit the result.
//
// Output: data/currencies/index.json lists the currencies; data/currencies/<key>.json holds
// one currency's items as rows of
//   [id, [en, ja, de, fr], icon, cost, qty, tradeable, kind]
// where kind is one of: collectible, gear, housing, materia, material, consumable, other.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "data", "currencies");
const TEAMCRAFT = "https://raw.githubusercontent.com/ffxiv-teamcraft/ffxiv-teamcraft/staging/libs/data/src/lib/json/shops.json";
const XIVAPI = "https://v2.xivapi.com/api/sheet";

// The currencies the planner covers, in display order. `ids` lists the currency item ids
// that count as this currency (the three Grand Company seals share one list).
const CURRENCIES = [
  { key: "mnemonics", group: "tomestones", ids: [49] },
  { key: "mathematics", group: "tomestones", ids: [48] },
  { key: "poetics", group: "tomestones", ids: [28] },
  { key: "orange-crafters", group: "scrips", ids: [41784] },
  { key: "orange-gatherers", group: "scrips", ids: [41785] },
  { key: "purple-crafters", group: "scrips", ids: [33913] },
  { key: "purple-gatherers", group: "scrips", ids: [33914] },
  { key: "bicolor", group: "hunts", ids: [26807] },
  { key: "nuts", group: "hunts", ids: [26533] },
  { key: "centurio", group: "hunts", ids: [10307] },
  { key: "allied", group: "hunts", ids: [27] },
  { key: "gc-seals", group: "other", ids: [20, 21, 22] },
  { key: "mgp", group: "other", ids: [29] },
  { key: "wolf", group: "other", ids: [25] },
  { key: "trophy", group: "other", ids: [36656] },
  { key: "skybuilders", group: "other", ids: [28063] },
  { key: "cosmocredits", group: "other", ids: [45690] },
  { key: "cowries", group: "other", ids: [37549] },
];

// ItemAction types that unlock something for your collection.
const UNLOCK_ACTIONS = new Set([
  1322, // mount
  853, // minion
  25183, // orchestrion roll
  1013, // chocobo barding
  20086, // fashion accessory
  2633, // emote, hairstyle and other unlocks
  3357, // Triple Triad card
  29459, // framer's kit
]);
const UI = { materia: [58], consumable: [44, 46] };
const HOUSING_UI = /furnishing|table|tabletop|wall-mounted|rug|exterior|interior|painting|gardening|outdoor/i;
const MATERIAL_UI = /^(stone|metal|lumber|cloth|leather|bone|reagent|ingredient|seafood|crystal|catalyst)$|material/i;

async function getJson(url) {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url);
    if (res.ok) return res.json();
    if (attempt >= 4) throw new Error(`${res.status} ${url}`);
    await new Promise((r) => setTimeout(r, 1000 * attempt));
  }
}

// ---------- trades ----------

const shops = await getJson(TEAMCRAFT);
const byCurrency = new Map(CURRENCIES.map((c) => [c.key, new Map()]));
const keyFor = new Map(CURRENCIES.flatMap((c) => c.ids.map((id) => [id, c.key])));

for (const shop of shops) {
  if (!shop.npcs?.length) continue; // not reachable in game
  for (const trade of shop.trades ?? []) {
    // Only single-currency trades: gear upgrades that also need a token or item are skipped.
    if (trade.currencies?.length !== 1 || trade.items?.length !== 1) continue;
    const { id: curId, amount: cost } = trade.currencies[0];
    const key = keyFor.get(curId);
    const { id: itemId, amount: qty } = trade.items[0];
    if (!key || !itemId || !cost || keyFor.has(itemId)) continue;
    const items = byCurrency.get(key);
    const prev = items.get(itemId);
    // Keep the cheapest offer per unit if several vendors sell the same item.
    if (!prev || cost / (qty || 1) < prev.cost / prev.qty) items.set(itemId, { cost, qty: qty || 1 });
  }
}

// ---------- item details ----------

const allIds = [...new Set([...byCurrency.values()].flatMap((m) => [...m.keys()]).concat(CURRENCIES.map((c) => c.ids[0])))];
const FIELDS = [
  "Name", "Name@lang(ja)", "Name@lang(de)", "Name@lang(fr)", "Icon", "IsUntradable",
  "ItemUICategory@as(raw)", "ItemUICategory.Name", "ItemAction.Action@as(raw)", "EquipSlotCategory@as(raw)",
].join(",");
const info = new Map();
for (let i = 0; i < allIds.length; i += 100) {
  const batch = allIds.slice(i, i + 100);
  const data = await getJson(`${XIVAPI}/Item?rows=${batch.join(",")}&fields=${FIELDS}`);
  for (const row of data.rows ?? []) info.set(row.row_id, row.fields);
}

function kindOf(f) {
  const action = f.ItemAction?.fields?.["Action@as(raw)"] ?? 0;
  const ui = f["ItemUICategory@as(raw)"];
  const uiName = f.ItemUICategory?.fields?.Name ?? "";
  if (UNLOCK_ACTIONS.has(action) || /^(minion|orchestrion roll|triple triad card)$/i.test(uiName)) return "collectible";
  if (f["EquipSlotCategory@as(raw)"] > 0) return "gear";
  if (UI.materia.includes(ui)) return "materia";
  if (UI.consumable.includes(ui)) return "consumable";
  if (HOUSING_UI.test(uiName)) return "housing";
  if (MATERIAL_UI.test(uiName)) return "material";
  return "other";
}
const iconOf = (f) => (f.Icon?.path ?? "").replace(/^ui\/icon\//, "").replace(/\.tex$/, "");
const namesOf = (f, id) => [f.Name || `Item ${id}`, f["Name@lang(ja)"] || "", f["Name@lang(de)"] || "", f["Name@lang(fr)"] || ""];

// ---------- write ----------

fs.mkdirSync(OUT, { recursive: true });
const index = [];
for (const c of CURRENCIES) {
  const rows = [];
  for (const [id, { cost, qty }] of byCurrency.get(c.key)) {
    const f = info.get(id);
    if (!f || !f.Name) continue;
    rows.push([id, namesOf(f, id), iconOf(f), cost, qty, f.IsUntradable ? 0 : 1, kindOf(f)]);
  }
  rows.sort((a, b) => a[3] - b[3] || a[0] - b[0]);
  const cur = info.get(c.ids[0]);
  index.push({ key: c.key, group: c.group, id: c.ids[0], names: namesOf(cur, c.ids[0]), icon: iconOf(cur), items: rows.length });
  fs.writeFileSync(path.join(OUT, `${c.key}.json`), JSON.stringify(rows) + "\n");
  console.log(`${c.key.padEnd(18)} ${String(rows.length).padStart(4)} items, ${rows.filter((r) => r[5]).length} tradeable`);
}
fs.writeFileSync(path.join(OUT, "index.json"), JSON.stringify({ currencies: index }, null, 1) + "\n");
