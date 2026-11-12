// Writes the "Updated for patch X · date" line into each guide, and keeps dateModified in the
// page's top-level JSON-LD in step. The data lives in guide-meta.json:
//
//   { "<page slug>": { "patch": "7.57" | null, "updated": "YYYY-MM-DD", "ended": true? } }
//
//   pnpm updated
//
// Static HTML between <!-- guide-updated:start --> and <!-- guide-updated:end -->, so it is in
// the page source for search engines. Re-running is safe. The line is English in the source;
// i18n.js re-renders it per language (templates in shared.updated.*, dates via Intl).
// Set "patch" to null for a date-only line, and "ended": true to add an "Event ended" badge.
// Bump "updated" (and the sitemap lastmod) only when you actually re-verify a guide.
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = (p) => fileURLToPath(new URL("../" + p, import.meta.url));
const START = "<!-- guide-updated:start -->";
const END = "<!-- guide-updated:end -->";
const CSS = '<link rel="stylesheet" href="guide-updated.css">';
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Insert after the first line matching this, on first run (the lede under each page's H1).
const AFTER = {
  "hunt-for-astronomy": /^\s*<p class="lede" data-i18n="hfa\.hero\.lede">.*<\/p>$/m,
  "trade-in-mounts": /^\s*<p class="lede">.*<\/p>$/m,
  "retainer-ventures": /^\s*<p class="lede">.*<\/p>$/m,
  "keybound-brawler": /^\s*<p class="lede">The grind math.*<\/p>$/m,
  "jump-puzzle-macros": /^\s*<p>A macro-and-hotbar trick.*<\/p>$/m,
  "fanfest-bingo": /^\s*<p class="lede">Chart your predictions.*<\/p>$/m,
  "msq-tracker": /^\s*<p class="lede" data-i18n="pages\.msqTracker\.lede">.*<\/p>$/m,
  "currency-planner": /^\s*<p class="lede" data-i18n="cp\.lede">.*<\/p>$/m,
  "inventory-decluttering": /^<p>Staring at a full bag\?.*<\/p>$/m,
};

const meta = JSON.parse(await readFile(root("guide-meta.json"), "utf8"));
let changed = 0;
for (const [slug, m] of Object.entries(meta)) {
  const file = `${slug}.html`;
  const html = await readFile(root(file), "utf8");
  const [y, mo, d] = m.updated.split("-").map(Number);
  const date = `${MONTHS[mo - 1]} ${d}, ${y}`;
  const text = m.patch ? `Updated for patch ${m.patch} · ${date}` : `Updated ${date}`;
  const attrs = `data-updated="${m.updated}"${m.patch ? ` data-patch="${m.patch}"` : ""}`;
  const badge = m.ended ? `<span class="gu-badge" data-i18n="shared.updated.eventEnded">Event ended</span>` : "";
  const block = `${START}\n<p class="guide-updated" ${attrs}><span class="gu-text">${text}</span>${badge}</p>\n${END}`;

  let out = html;
  const s = out.indexOf(START), e = out.indexOf(END);
  if (s !== -1 && e !== -1) {
    const ls = out.lastIndexOf("\n", s) + 1;
    const ind = out.slice(ls, s).match(/^\s*/)[0];
    out = out.slice(0, s) + block.split("\n").map((l, i) => (i ? ind + l : l)).join("\n") + out.slice(e + END.length);
  } else {
    const m2 = AFTER[slug].exec(out);
    if (!m2) throw new Error(`${file}: no lede line to insert after`);
    const ind = m2[0].match(/^\s*/)[0].replace(/^\n/, "");
    const at = m2.index + m2[0].length;
    out = out.slice(0, at) + "\n" + block.split("\n").map((l) => ind + l).join("\n") + out.slice(at);
  }
  if (!out.includes(CSS)) out = out.replace("</head>", `${CSS}\n</head>`);

  // dateModified on the page-level JSON-LD entry (the first top-level @type line).
  const typeRe = /^(  )"@type": "(?:TechArticle|WebApplication|FAQPage)",$/m;
  const ld = out.indexOf('<script type="application/ld+json">');
  const tm = typeRe.exec(out.slice(ld));
  if (ld === -1 || !tm) throw new Error(`${file}: no page-level JSON-LD entry`);
  const dm = /^  "dateModified": "[^"]*",\n/m;
  const tail = out.slice(ld).replace(dm, "");
  const t2 = typeRe.exec(tail);
  out = out.slice(0, ld) + tail.slice(0, t2.index + t2[0].length) + `\n  "dateModified": "${m.updated}",` + tail.slice(t2.index + t2[0].length);

  if (out !== html) { await writeFile(root(file), out); changed++; console.log("updated", file); }
}
console.log(changed ? `${changed} page(s) changed` : "no page changes");
