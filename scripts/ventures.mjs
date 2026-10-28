// Regenerates ventures.json, the retainer venture table behind retainer-ventures.html.
//
//   pnpm ventures
//
// Pulls every normal (non-exploration) venture from XIVAPI's RetainerTask sheet.
// Venture data only changes on patches, so re-run this after a patch that adds
// ventures and commit the result. Field Exploration ventures are skipped: their
// loot pool is not in the sheet.
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const OUT = fileURLToPath(new URL("../ventures.json", import.meta.url));
const BASE = "https://v2.xivapi.com/api/sheet/RetainerTask";
const PAGE = 200;

const FIELDS = [
  "IsRandom",
  "ClassJobCategory.Name",
  "RetainerLevel",
  "MaxTimemin",
  "RequiredGathering",
  "RequiredItemLevel",
  "RetainerTaskParameter.ItemLevelDoW",
  "RetainerTaskParameter.PerceptionDoL",
  "RetainerTaskParameter.PerceptionFSH",
  "Task.Item.Name",
  "Task.Quantity",
].join(",");

const rows = [];
for (let after = 0; ; ) {
  const res = await fetch(`${BASE}?limit=${PAGE}&after=${after}&fields=${FIELDS}`);
  if (!res.ok) throw new Error(`XIVAPI ${res.status}`);
  const page = (await res.json()).rows ?? [];
  if (!page.length) break;
  rows.push(...page);
  after = page[page.length - 1].row_id;
  if (page.length < PAGE) break;
}

// j: MIN | BTN | FSH | COMBAT. Quantity q[0] is the base yield, and q[n] applies once
// the retainer's stat (perception for gatherers, item level for combat) reaches t[n-1].
const ventures = [];
for (const r of rows) {
  const f = r.fields ?? {};
  if (f.IsRandom) continue;
  const task = f.Task?.fields;
  const item = Number(task?.Item?.value);
  if (!Number.isFinite(item) || item <= 0) continue;

  const cat = f.ClassJobCategory?.fields?.Name ?? "";
  const gatherer = cat === "MIN" || cat === "BTN" || cat === "FSH";
  const p = f.RetainerTaskParameter?.fields ?? {};
  ventures.push({
    i: item,
    n: task.Item.fields?.Name ?? `Item ${item}`,
    j: gatherer ? cat : "COMBAT",
    l: f.RetainerLevel ?? 0,
    m: f.MaxTimemin ?? 60,
    r: gatherer ? f.RequiredGathering ?? 0 : f.RequiredItemLevel ?? 0,
    q: task.Quantity ?? [],
    t: (cat === "FSH" ? p.PerceptionFSH : gatherer ? p.PerceptionDoL : p.ItemLevelDoW) ?? [],
  });
}

ventures.sort((a, b) => a.j.localeCompare(b.j) || a.l - b.l || a.i - b.i);
await writeFile(OUT, JSON.stringify({ generated: new Date().toISOString().slice(0, 10), ventures }));
console.log(`Wrote ${ventures.length} ventures to ventures.json`);
