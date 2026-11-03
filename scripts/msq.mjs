// Regenerates msq.json, the Main Scenario Quest order behind the MSQ tracker.
//
//   pnpm msq
//
// Pulls every quest in XIVAPI's "Main Scenario Quests" journal categories (1 to 15),
// then orders them by walking the PreviousQuest graph. Only the opening quests differ by
// starting city; everything after them is shared. True alternatives (the same quest
// repeated per Grand Company or per starting class) are collapsed to one entry.
// Quest data only changes on patches, so re-run this after a patch that adds MSQ quests
// and commit the result.
//
// Output keys are short on purpose (the file is shipped to browsers):
//   seg: [{ id, era, name, patch }]            story order
//   q:   [{ t, s, l, p, g, c?, i? }]            title, slug, level, place, segment index, city, banner icon
// c is a bitmask of the starting cities that do the quest (1 Gridania, 2 Limsa Lominsa,
// 4 Ul'dah) and is omitted for quests every player does. A city's route, with city
// index 0 to 2, is q.filter(x => ((x.c ?? 7) >> city) & 1), in array order. i is the
// quest's journal banner icon id (about 40% of quests have one), omitted when there is none;
// the image is ui/icon/<id rounded down to thousands, 6 digits>/<id, 6 digits>.tex on XIVAPI.
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const OUT = fileURLToPath(new URL("../msq.json", import.meta.url));
const BASE = "https://beta.xivapi.com/api/1/sheet";
const PAGE = 500;

// JournalCategory row id -> segment. Patch ranges are not in the game data.
const SEGMENTS = [
  [1, "arr-umbral", "A Realm Reborn", "Seventh Umbral Era", "2.0"],
  [2, "arr-astral", "A Realm Reborn", "Seventh Astral Era", "2.1-2.55"],
  [3, "hw", "Heavensward", "Heavensward", "3.0"],
  [4, "dragonsong", "Heavensward", "Dragonsong", "3.1-3.3"],
  [5, "post-dragonsong", "Heavensward", "Post-Dragonsong", "3.4-3.56"],
  [6, "sb", "Stormblood", "Stormblood", "4.0"],
  [7, "post-sb", "Stormblood", "Post-Stormblood", "4.1-4.56"],
  [8, "shb", "Shadowbringers", "Shadowbringers", "5.0"],
  [9, "post-shb", "Shadowbringers", "Post-Shadowbringers", "5.1-5.3"],
  [10, "post-shb-ii", "Shadowbringers", "Post-Shadowbringers II", "5.4-5.55"],
  [11, "ew", "Endwalker", "Endwalker", "6.0"],
  [12, "post-ew", "Endwalker", "Post-Endwalker", "6.1-6.55"],
  [13, "dt", "Dawntrail", "Dawntrail", "7.0"],
  [14, "post-dt", "Dawntrail", "Post-Dawntrail", "7.1-7.3"],
  [15, "post-dt-ii", "Dawntrail", "Post-Dawntrail II", "7.4-7.56"],
];
const CITY_BY_PLACE = { Gridania: 0, "Limsa Lominsa": 1, "Ul'dah": 2 };

async function sheet(name, fields) {
  const rows = [];
  for (let after = 0; ; ) {
    const url = `${BASE}/${name}?limit=${PAGE}${after ? `&after=${after}` : ""}&fields=${fields}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`XIVAPI ${res.status} for ${name}`);
    const page = (await res.json()).rows ?? [];
    if (!page.length) break;
    rows.push(...page);
    after = page[page.length - 1].row_id;
    if (page.length < PAGE) break;
  }
  return rows;
}

const RAW = (k) => `${k}@as(raw)`;
const genres = await sheet("JournalGenre", RAW("JournalCategory"));
const genreToCat = new Map(genres.map((r) => [r.row_id, r.fields[RAW("JournalCategory")]]));
const catIndex = new Map(SEGMENTS.map((s, i) => [s[0], i]));

const quests = (
  await sheet("Quest", `Name,${RAW("PreviousQuest")},${RAW("JournalGenre")},ClassJobLevel,PlaceName.Name,Icon`)
)
  .map((r) => ({
    id: r.row_id,
    name: r.fields.Name,
    seg: catIndex.get(genreToCat.get(r.fields[RAW("JournalGenre")])),
    prev: r.fields[RAW("PreviousQuest")].filter(Boolean),
    level: r.fields.ClassJobLevel?.[0] ?? 0,
    place: r.fields.PlaceName?.fields?.Name ?? "",
    icon: r.fields.Icon?.id ?? 0,
  }))
  .filter((q) => q.name && q.seg !== undefined);
if (quests.length < 1000) throw new Error(`Only ${quests.length} MSQ quests came back, refusing to write`);

// Collapse alternatives: same name once a trailing "(Twin Adder)" style suffix is
// dropped, same place, same prerequisites. The lowest row id stands for the group, and
// other quests that list a dropped alternative as a prerequisite are rewired to it.
const base = (n) => n.replace(/\s*\([^)]*\)\s*$/, "");
const groups = new Map();
for (const q of quests) {
  const key = [base(q.name), q.place, q.seg, [...q.prev].sort((a, b) => a - b).join(",")].join("|");
  (groups.get(key) ?? groups.set(key, []).get(key)).push(q);
}
const alias = new Map();
const kept = [];
for (const group of groups.values()) {
  group.sort((a, b) => a.id - b.id);
  const rep = group[0];
  if (group.length > 1) rep.name = base(rep.name);
  for (const q of group) alias.set(q.id, rep.id);
  kept.push(rep);
}

// Alternatives with different names: the follow-up each Grand Company gets after
// "The Company You Keep". A player does exactly one, and all three lead to the same next
// quest, so they count once. Other parallel quests (the three Moogle trials, for example)
// are all required and stay separate.
const ALTERNATIVES = [
  {
    names: ["Wood's Will Be Done", "Till Sea Swallows All", "For Coin and Country"],
    title: "Wood's Will Be Done / Till Sea Swallows All / For Coin and Country",
    slug: "grand-company-quest",
  },
];
for (const alt of ALTERNATIVES) {
  const members = kept.filter((q) => alt.names.includes(q.name)).sort((a, b) => a.id - b.id);
  if (members.length !== alt.names.length) throw new Error(`Alternatives not found: ${alt.names.join(", ")}`);
  const rep = members[0];
  rep.name = alt.title;
  rep.slug = alt.slug;
  rep.place = "";
  for (const q of members) alias.set(q.id, rep.id);
  for (const q of members.slice(1)) kept.splice(kept.indexOf(q), 1);
}
const byId = new Map(kept.map((q) => [q.id, q]));
for (const q of kept) {
  q.prev = [...new Set(q.prev.map((p) => alias.get(p)).filter((p) => p && p !== q.id))];
}

// Which starting cities can reach each quest. City-only quests are the opening ones.
const kids = new Map();
for (const q of kept) for (const p of q.prev) (kids.get(p) ?? kids.set(p, []).get(p)).push(q.id);
const reach = new Map();
for (const root of kept.filter((q) => !q.prev.length)) {
  const city = CITY_BY_PLACE[root.place];
  if (city === undefined) throw new Error(`Unexpected root quest ${root.name} in ${root.place}`);
  const stack = [root.id];
  const seen = new Set();
  while (stack.length) {
    const id = stack.pop();
    if (seen.has(id)) continue;
    seen.add(id);
    reach.set(id, (reach.get(id) ?? new Set()).add(city));
    stack.push(...(kids.get(id) ?? []));
  }
}

// Kahn's algorithm. Among quests that are unlocked, take the earliest segment, then the
// lowest row id (which follows in-game authoring order closely).
const indeg = new Map(kept.map((q) => [q.id, q.prev.length]));
const ready = kept.filter((q) => !q.prev.length);
const byOrder = (a, b) => a.seg - b.seg || a.id - b.id;
const ordered = [];
while (ready.length) {
  ready.sort(byOrder);
  const q = ready.shift();
  ordered.push(q);
  for (const k of kids.get(q.id) ?? []) {
    indeg.set(k, indeg.get(k) - 1);
    if (indeg.get(k) === 0) ready.push(byId.get(k));
  }
}
if (ordered.length !== kept.length) throw new Error(`Cycle or orphan: ordered ${ordered.length} of ${kept.length}`);

const slugOf = (s) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// Slugs must be unique within any one city's route. Repeats get the place appended.
const used = new Map();
const slugFor = (q) => q.slug ?? slugOf(q.name);
for (const q of ordered) used.set(slugFor(q), (used.get(slugFor(q)) ?? 0) + 1);
const out = ordered.map((q) => {
  let s = slugFor(q);
  if (used.get(s) > 1) s += `-${slugOf(q.place)}`;
  const cities = reach.get(q.id);
  const row = { t: q.name, s, l: q.level, p: q.place, g: q.seg };
  if (q.icon) row.i = q.icon;
  if (cities && cities.size < 3) {
    row.c = [...cities].reduce((mask, city) => mask | (1 << city), 0);
  }
  return row;
});
const seen = new Set();
for (const q of out) {
  if (seen.has(q.s)) throw new Error(`Duplicate slug ${q.s}`);
  seen.add(q.s);
}

await writeFile(
  OUT,
  JSON.stringify({
    generated: new Date().toISOString().slice(0, 10),
    seg: SEGMENTS.map(([, id, era, name, patch]) => ({ id, era, name, patch })),
    q: out,
  }) + "\n",
);

const perCity = [0, 1, 2].map((c) => out.filter((q) => ((q.c ?? 7) >> c) & 1).length);
console.log(`Wrote ${out.length} quests to msq.json (per city: ${perCity.join(", ")}).`);
SEGMENTS.forEach(([, id], i) => {
  console.log(id.padEnd(16), out.filter((q) => q.g === i && q.c === undefined).length);
});
