// Writes the "Related guides" block into each guide page, and keeps the matching English
// strings in i18n/en.json in sync. This file is the single source of truth for which guide
// links to which, and for the English descriptions.
//
//   pnpm related
//
// Each page gets plain static HTML between these markers, so the links are in the source for
// search engines and never injected at runtime:
//
//   <!-- related-guides:start -->
//   <!-- related-guides:end -->
//
// First run inserts the block just above the page's sources footer (see `before` below); later
// runs replace what is between the markers, so re-running is safe. The ja/de/fr strings are
// written by hand in i18n/*.json; this script only warns when their keys drift from English.
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = (p) => fileURLToPath(new URL("../" + p, import.meta.url));

const START = "<!-- related-guides:start -->";
const END = "<!-- related-guides:end -->";

// slug (also the i18n key segment) -> page and the visible name, as listed on index.html
const GUIDES = {
  retainerVentures: { file: "retainer-ventures.html", name: "Retainer Ventures: What to Send Them For" },
  inventoryDecluttering: { file: "inventory-decluttering.html", name: "Inventory &amp; Retainer Decluttering" },
  tradeInMounts: { file: "trade-in-mounts.html", name: "Trade-In Mounts: Grind vs. Buy the Mats" },
  huntForAstronomy: { file: "hunt-for-astronomy.html", name: "Hunt for Astronomy: What's Worth the Tomes" },
  keyboundBrawler: { file: "keybound-brawler.html", name: "Keybound Brawler: The Grind Math" },
  jumpPuzzleMacros: { file: "jump-puzzle-macros.html", name: "Jump Puzzle Macros" },
  fanfestBingo: { file: "fanfest-bingo.html", name: "Fan Fest Keynote Bingo Maker" },
};

const HEADING = "Related guides";

// from -> [[to, one-line reason], ...], in display order. No em dashes (see CLAUDE.md).
const RELATED = {
  retainerVentures: [
    ["inventoryDecluttering", "Retainers fill your bags fast. Sort what to keep, bank, or discard before the haul piles up."],
    ["tradeInMounts", "Turn venture gil into a mount: which trade-in mounts are worth grinding, and which to just buy."],
  ],
  inventoryDecluttering: [
    ["retainerVentures", "Put your retainer slots to work: every venture ranked by what it earns on the market board."],
    ["tradeInMounts", "Currencies and tokens piling up? See which mounts they trade in for, and whether to grind or buy."],
  ],
  tradeInMounts: [
    ["huntForAstronomy", "Another event shop with a mount in it, and a straight call on what is worth the tomes."],
    ["retainerVentures", "Need gil to buy the mats? See which retainer ventures earn the most on your world."],
    ["keyboundBrawler", "Another event shop with a mount: what each reward costs in MGC and how many runs it takes."],
  ],
  huntForAstronomy: [
    ["tradeInMounts", "Weighing the mount here? Compare it with every other mount you can trade in for."],
    ["keyboundBrawler", "The other current event shop: what every reward costs in MGC and how long the grind is."],
  ],
  keyboundBrawler: [
    ["huntForAstronomy", "The other current event shop: every reward, where else it drops, and what it sells for."],
    ["tradeInMounts", "More mounts you can trade currency for, with a verdict on grinding versus buying."],
  ],
  jumpPuzzleMacros: [
    ["inventoryDecluttering", "Another quality-of-life guide: free up bag and retainer space before your next trip."],
    ["retainerVentures", "Put your retainers to work while you practice: every venture ranked by market board gil."],
  ],
  fanfestBingo: [
    ["huntForAstronomy", "Another event to plan for: every Hunt for Astronomy reward, and whether it is worth the tomes."],
    ["keyboundBrawler", "Another event to plan for: what every Keybound Brawler reward costs in MGC and how many runs it takes."],
  ],
};

// Where the block goes on first insert: just above this string (at the start of its line).
// The pages don't share a template, so inventory-decluttering uses its own section pattern.
const BEFORE = { inventoryDecluttering: '<section id="sources">' };
const DEFAULT_BEFORE = "<footer";

function block(from) {
  const head = from === "inventoryDecluttering"
    ? `<div class="sec-head"><h2 id="related-guides-h" data-i18n="shared.related.heading">${HEADING}</h2></div>`
    : `<h2 id="related-guides-h" data-i18n="shared.related.heading">${HEADING}</h2>`;
  const items = RELATED[from].map(([to, desc]) => {
    const g = GUIDES[to];
    return `    <li><a href="${g.file}">${g.name}</a><span class="rg-desc" data-i18n="shared.related.desc.${from}.${to}">${desc}</span></li>`;
  });
  return [
    START,
    `<section class="related-guides" id="related-guides" aria-labelledby="related-guides-h">`,
    `  ${head}`,
    `  <ul>`,
    ...items,
    `  </ul>`,
    `</section>`,
    END,
  ].join("\n");
}

let changed = 0;
for (const from of Object.keys(GUIDES)) {
  const path = root(GUIDES[from].file);
  let html = await readFile(path, "utf8");
  const b = block(from);
  const s = html.indexOf(START);
  const e = html.indexOf(END);
  let out;
  if (s !== -1 && e !== -1) {
    const ls = html.lastIndexOf("\n", s) + 1;
    const ind = html.slice(ls, s).match(/^\s*/)[0];
    out = html.slice(0, s) + b.split("\n").map((l, i) => (i ? ind + l : l)).join("\n") + html.slice(e + END.length);
  } else {
    const anchor = BEFORE[from] || DEFAULT_BEFORE;
    const at = html.indexOf(anchor);
    if (at === -1) throw new Error(`${GUIDES[from].file}: no "${anchor}" to insert above`);
    const lineStart = html.lastIndexOf("\n", at) + 1;
    const indent = html.slice(lineStart, at).match(/^\s*/)[0];
    const indented = b.split("\n").map((l) => indent + l).join("\n").slice(indent.length);
    out = html.slice(0, lineStart) + indent + indented + "\n\n" + html.slice(lineStart);
  }
  if (out !== html) { await writeFile(path, out); changed++; console.log("updated", GUIDES[from].file); }
}

// Keep en.json's shared.related in step with the map above. This splices the block into the
// text instead of re-serializing the file: JSON.stringify moves numeric keys (the item ids
// under "hfa") to the front, which would reshuffle the whole file.
const enPath = root("i18n/en.json");
const enText = await readFile(enPath, "utf8");
const desc = {};
for (const [from, list] of Object.entries(RELATED)) desc[from] = Object.fromEntries(list);
const relBlock = JSON.stringify({ heading: HEADING, desc }, null, 2).split("\n").map((l, i) => (i ? "    " + l : l)).join("\n");
const tail = /(\n    "githubLinkLabel": "[^"\n]*")(,\n    "related": \{[\s\S]*?\n    \})?(\n  \},\n  "tags")/;
if (!tail.test(enText)) throw new Error("i18n/en.json: could not find the end of the shared block");
const enOut = enText.replace(tail, (_, g, _old, end) => `${g},\n    "related": ${relBlock}${end}`);
if (enOut !== enText) { await writeFile(enPath, enOut); console.log("updated i18n/en.json"); }

// Warn if a translation is missing a key (English fallback keeps the site working, but the
// intent is full translation; see CLAUDE.md).
for (const lang of ["ja", "de", "fr"]) {
  const t = JSON.parse(await readFile(root(`i18n/${lang}.json`), "utf8")).shared?.related;
  if (!t?.heading) console.warn(`${lang}: missing shared.related.heading`);
  for (const [from, list] of Object.entries(RELATED)) {
    for (const [to] of list) if (!t?.desc?.[from]?.[to]) console.warn(`${lang}: missing shared.related.desc.${from}.${to}`);
  }
}
console.log(changed ? `${changed} page(s) changed` : "no page changes");
