// Regenerates guide-snapshot.json, the example prices behind the "Leveling and gear" tab on
// retainer-ventures.html. The tab shows these straight away and swaps in live prices once the
// visitor's own world has loaded.
//
//   pnpm snapshot              (Excalibur)
//   pnpm snapshot Gilgamesh    (another world)
//
// Same pricing as the page: the lower of the lowest listing and the average sale price, plus
// sales per day. Items nobody buys on the world are left out. Re-run it now and then and
// commit the result, since the file carries its own date.
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const world = process.argv[2] || "Excalibur";
const SRC = fileURLToPath(new URL("../ventures.json", import.meta.url));
const OUT = fileURLToPath(new URL("../guide-snapshot.json", import.meta.url));
const { ventures } = JSON.parse(await readFile(SRC, "utf8"));
const ids = [...new Set(ventures.map((v) => v.i))];

// p: itemId -> [price, sold per day]
const p = {};
for (let i = 0; i < ids.length; i += 100) {
  const batch = ids.slice(i, i + 100);
  let results = null;
  for (let a = 1; a <= 4 && !results; a++) {
    try {
      const res = await fetch(`https://universalis.app/api/v2/aggregated/${encodeURIComponent(world)}/${batch.join(",")}`);
      if (res.ok) results = (await res.json()).results;
    } catch {}
    if (!results) await new Promise((r) => setTimeout(r, 500 * a));
  }
  if (!results) throw new Error(`Universalis failed for items ${i} to ${i + batch.length}`);
  for (const r of results) {
    const nq = r.nq ?? {};
    const avg = nq.averageSalePrice?.world?.price;
    const listing = nq.minListing?.world?.price;
    const perDay = nq.dailySaleVelocity?.world?.quantity ?? 0;
    if (avg > 0) p[r.itemId] = [Math.floor(listing > 0 ? Math.min(listing, avg) : avg), Math.round(perDay * 10) / 10];
  }
}
await writeFile(OUT, JSON.stringify({ world, generated: new Date().toISOString().slice(0, 10), p }));
console.log(`Wrote ${Object.keys(p).length} of ${ids.length} prices for ${world} to guide-snapshot.json`);
