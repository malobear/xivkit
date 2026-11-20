// Regenerates crafted-gear.json, the item list behind crafted-gear.html.
//
//   pnpm crafted-gear
//
// Pulls every piece of the current top crafted gear from XIVAPI's Item sheet, plus the
// job list from ClassJob. There are two sets: one for combat jobs, one (armor plus tools)
// for crafters and gatherers. When a new crafted set comes out, update its entry in SETS
// below, re-run, and commit the result.
//
// Names are saved in all four client languages, [en, ja, de, fr], for the page's language copies.
//
// Output:
//   sets:  { combat|crafting: { name: [[en, ja, de, fr], ...one per item line], ilvl } }
//   jobs:  [{ id, abbr, name: [en, ja, de, fr], role, set }] in the in-game job list order.
//          Icons are ui/icon/062000/0621<id>.tex, the framed job icon the game uses.
//   items: [{ i: item id, n: [en, ja, de, fr], c: icon path under ui/icon/, s: slot, j: [job abbrs], o?: 1 }]
//          o marks an "Ornate" body piece: same base stats as the plain one but five
//          guaranteed materia slots (no overmelding); not crafted, sold separately.
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

// prefixes: how each item line's names start in English. names: the same lines in each
// client language (en, ja, de, fr), as they read in the item names.
const SETS = {
  combat: {
    ilvl: 770,
    prefixes: ["Courtly Lover"],
    names: [["Courtly Lover", "コートリーラヴァー", "Hofliebhaber", "Courtisan assidu"]],
  },
  crafting: {
    ilvl: 750,
    prefixes: ["Crested", "Gold Thumb's"],
    names: [
      ["Crested", "ピーコック", "Pfauen", "Paon bleu"],
      ["Gold Thumb's", "ゴールデンサム", "Goldhand", "Main dorée"],
    ],
  },
};

const OUT = fileURLToPath(new URL("../crafted-gear.json", import.meta.url));
const API = "https://v2.xivapi.com/api";
const NAME_FIELDS = ["Name", "Name@lang(ja)", "Name@lang(de)", "Name@lang(fr)"];
const namesOf = f => NAME_FIELDS.map(k => f[k] || f.Name || "");
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

// EquipSlotCategory row -> slot key used by the page.
const SLOTS = { 1: "main", 13: "main", 2: "off", 3: "head", 4: "body", 5: "hands", 7: "legs", 8: "feet", 9: "ears", 10: "neck", 11: "wrists", 12: "ring" };

// Limited jobs (Blue Mage, Beastmaster) have no weapon in the set, so they are left out.
const LIMITED = new Set(["BLU", "BST"]);
const CRAFTERS = ["CRP", "BSM", "ARM", "GSM", "LTW", "WVR", "ALC", "CUL"];
const GATHERERS = ["MIN", "BTN", "FSH"];
// Crafter and gatherer gear names its jobs by discipline rather than by abbreviation.
const CATEGORY = { "Disciple of the Hand": CRAFTERS, "Disciple of the Land": GATHERERS };

async function get(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`XIVAPI ${res.status} for ${url}`);
  return res.json();
}

// ClassJob.Role: 1 tank, 2 melee, 3 ranged (physical and magic), 4 healer.
// Ranged splits into physical and magic the way the game's party list does (UIPriority 3x vs 4x).
function roleOf(f) {
  if (CRAFTERS.includes(f.Abbreviation)) return "crafter";
  if (GATHERERS.includes(f.Abbreviation)) return "gatherer";
  return f.Role === 1 ? "tank" : f.Role === 4 ? "healer" : f.Role === 2 ? "melee" : f.UIPriority < 40 ? "ranged" : "caster";
}

const jobRows = (await get(`${API}/sheet/ClassJob?limit=100&fields=Abbreviation,${NAME_FIELDS.join(",")},JobIndex,Role,UIPriority`)).rows;
const jobs = jobRows
  .filter(r => (r.fields.JobIndex > 0 || CRAFTERS.includes(r.fields.Abbreviation) || GATHERERS.includes(r.fields.Abbreviation)) && !LIMITED.has(r.fields.Abbreviation))
  .sort((a, b) => a.fields.UIPriority - b.fields.UIPriority)
  .map(r => {
    const role = roleOf(r.fields);
    return {
      id: r.row_id,
      abbr: r.fields.Abbreviation,
      // The en and fr sheets store job names in lower case; the game capitalises them in menus.
      name: namesOf(r.fields).map((n, i) => (i === 0 ? n.replace(/\b\w/g, c => c.toUpperCase()) : cap(n))),
      role,
      set: role === "crafter" || role === "gatherer" ? "crafting" : "combat",
    };
  });
const jobAbbrs = new Set(jobs.map(j => j.abbr));

const items = [];
for (const [key, set] of Object.entries(SETS)) {
  for (const prefix of set.prefixes) {
    const params = new URLSearchParams({
      sheets: "Item",
      query: `+Name~"${prefix}" +LevelItem=${set.ilvl}`,
      fields: `${NAME_FIELDS.join(",")},Icon,ClassJobCategory.Name,EquipSlotCategory.value,IsUntradable`,
      limit: "500",
    });
    for (const r of (await get(`${API}/search?${params}`)).results) {
      const f = r.fields;
      if (f.IsUntradable) continue;
      const s = SLOTS[f.EquipSlotCategory?.value];
      if (!s) continue;
      const cat = f.ClassJobCategory?.fields?.Name ?? "";
      const j = (CATEGORY[cat] ?? cat.split(" ")).filter(a => jobAbbrs.has(a) && jobs.find(x => x.abbr === a).set === key);
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
  }
}
items.sort((a, b) => a.i - b.i);

// Every job needs a main hand, the five armor pieces and four accessories; stop if the data is short.
for (const job of jobs) {
  for (const s of ["main", "head", "body", "hands", "legs", "feet", "ears", "neck", "wrists", "ring"]) {
    if (!items.some(it => it.s === s && it.j.includes(job.abbr))) throw new Error(`No ${s} piece found for ${job.abbr}`);
  }
}

const sets = Object.fromEntries(Object.entries(SETS).map(([k, s]) => [k, { name: s.names, ilvl: s.ilvl }]));
await writeFile(OUT, JSON.stringify({ generated: new Date().toISOString().slice(0, 10), sets, jobs, items }));
console.log(`Wrote ${items.length} items for ${jobs.length} jobs to crafted-gear.json`);
