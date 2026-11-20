// Regenerates crafted-gear.json, the item list behind crafted-gear.html.
//
//   pnpm crafted-gear
//
// Pulls every piece of the current top crafted combat set from XIVAPI's Item sheet,
// plus the job list from ClassJob. When a new crafted set comes out, change SET and
// ILVL below, re-run, and commit the result.
//
// Names are saved in all four client languages, [en, ja, de, fr], for the page's language copies.
//
// Output:
//   set:   { name: [en, ja, de, fr], ilvl }
//   jobs:  [{ id, abbr, name: [en, ja, de, fr], role }] in the in-game job list order. Icons are
//          ui/icon/062000/0621<id>.tex, the framed job icon the game uses.
//   items: [{ i: item id, n: [en, ja, de, fr], c: icon path under ui/icon/, s: slot, j: [job abbrs], o?: 1 }]
//          o marks an "Ornate" body piece: same stats as the plain one, sold separately.
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const SET = "Courtly Lover";
const ILVL = 770;
// The set's name in each client language, as it reads in the item names (en, ja, de, fr).
const SET_NAMES = ["Courtly Lover", "コートリーラヴァー", "Hofliebhaber", "Courtisan assidu"];

const OUT = fileURLToPath(new URL("../crafted-gear.json", import.meta.url));
const API = "https://v2.xivapi.com/api";
const NAME_FIELDS = ["Name", "Name@lang(ja)", "Name@lang(de)", "Name@lang(fr)"];
const namesOf = f => NAME_FIELDS.map(k => f[k] || f.Name || "");
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

// EquipSlotCategory row -> slot key used by the page.
const SLOTS = { 1: "main", 13: "main", 2: "off", 3: "head", 4: "body", 5: "hands", 7: "legs", 8: "feet", 9: "ears", 10: "neck", 11: "wrists", 12: "ring" };

// ClassJob.Role: 1 tank, 2 melee, 3 ranged (physical and magic), 4 healer.
// Limited jobs (Blue Mage, Beastmaster) have no weapon in the set, so they are left out.
const LIMITED = new Set(["BLU", "BST"]);

async function get(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`XIVAPI ${res.status} for ${url}`);
  return res.json();
}

const jobRows = (await get(`${API}/sheet/ClassJob?limit=100&fields=Abbreviation,${NAME_FIELDS.join(",")},JobIndex,Role,UIPriority`)).rows;
const jobs = jobRows
  .filter(r => r.fields.JobIndex > 0 && !LIMITED.has(r.fields.Abbreviation))
  .sort((a, b) => a.fields.UIPriority - b.fields.UIPriority)
  .map(r => ({
    id: r.row_id,
    abbr: r.fields.Abbreviation,
    // The en and fr sheets store job names in lower case; the game capitalises them in menus.
    name: namesOf(r.fields).map((n, i) => (i === 0 ? n.replace(/\b\w/g, c => c.toUpperCase()) : cap(n))),
    // Split ranged into physical and magic the way the game's party list does (UIPriority 3x vs 4x).
    role: r.fields.Role === 1 ? "tank" : r.fields.Role === 4 ? "healer" : r.fields.Role === 2 ? "melee" : r.fields.UIPriority < 40 ? "ranged" : "caster",
  }));
const jobAbbrs = new Set(jobs.map(j => j.abbr));

const params = new URLSearchParams({
  sheets: "Item",
  query: `+Name~"${SET}" +LevelItem=${ILVL}`,
  fields: `${NAME_FIELDS.join(",")},Icon,ClassJobCategory.Name,EquipSlotCategory.value,IsUntradable`,
  limit: "500",
});
const results = (await get(`${API}/search?${params}`)).results;

const items = [];
for (const r of results) {
  const f = r.fields;
  if (f.IsUntradable) continue;
  const s = SLOTS[f.EquipSlotCategory?.value];
  if (!s) continue;
  const j = (f.ClassJobCategory?.fields?.Name ?? "").split(" ").filter(a => jobAbbrs.has(a));
  if (!j.length) continue;
  const item = {
    i: r.row_id,
    n: namesOf(f),
    c: (f.Icon?.path ?? "").replace(/^ui\/icon\//, "").replace(/\.tex$/, ""),
    s,
    j,
  };
  if (f.Name.startsWith("Ornate ")) item.o = 1;
  items.push(item);
}
items.sort((a, b) => a.i - b.i);

// Every job needs a weapon and the five armor pieces and four accessories; stop if the data is short.
for (const job of jobs) {
  for (const s of ["main", "head", "body", "hands", "legs", "feet", "ears", "neck", "wrists", "ring"]) {
    if (!items.some(it => it.s === s && it.j.includes(job.abbr))) throw new Error(`No ${s} piece found for ${job.abbr}`);
  }
}

await writeFile(OUT, JSON.stringify({ generated: new Date().toISOString().slice(0, 10), set: { name: SET_NAMES, ilvl: ILVL }, jobs, items }));
console.log(`Wrote ${items.length} items for ${jobs.length} jobs to crafted-gear.json`);
