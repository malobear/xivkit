// Writes the language bar and the tag filter bar into the page HTML, so they're there at
// first paint instead of being built by script after load, which pushed the whole list down
// on phones (CLS 0.33 on the home page). Runs as the first step of `pnpm i18n`.
//
// - Every page with <div id="lang-bar"> gets the four language buttons (EN active; i18n.js
//   and scripts/i18n-build.mjs move the active state).
// - Pages with <div id="tag-bar"> get one pill per tag used by their <li data-tags>, sorted
//   the same way the page script sorts them, and each `.tags` button gets its data-tag-key.
//   The page scripts reuse these and still add any tag that's missing, so a stale bar
//   shifts a little but never breaks filtering. Those pages also get the phone-only
//   "Tags" toggle.
// - Every page loading i18n.js gets a ?v= version stamp (see VERSION below).
//
//   node scripts/static-bars.mjs           update pages in place
//   node scripts/static-bars.mjs --check   exit 1 if any page is out of date

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LANGS = [["en", "EN"], ["ja", "日本語"], ["de", "DE"], ["fr", "FR"]];
const check = process.argv.includes("--check");

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const unesc = (s) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&amp;/g, "&");

function langBar(html) {
  const buttons = LANGS.map(([code, name]) =>
    `<button type="button" class="tag-pill lang-pill${code === "en" ? " active" : ""}" data-lang="${code}">${name}</button>`).join("");
  return html.replace(/<div id="lang-bar">[\s\S]*?<\/div>/, `<div id="lang-bar">${buttons}</div>`);
}

function tagBar(html) {
  if (!html.includes('<div id="tag-bar">')) return html;
  // Key every per-item tag button by its English text.
  html = html.replace(/<div class="tags">([\s\S]*?)<\/div>/g, (_, inner) =>
    `<div class="tags">${inner.replace(/<button type="button"(?: data-tag-key="[^"]*")?>([^<]*)<\/button>/g,
      (m, text) => `<button type="button" data-tag-key="${esc(unesc(text.trim()))}">${text}</button>`)}</div>`);
  const tags = new Set();
  for (const m of html.matchAll(/<li[^>]*\sdata-tags="([^"]*)"/g)) {
    unesc(m[1]).split(",").map((t) => t.trim()).filter(Boolean).forEach((t) => tags.add(t));
  }
  const pills = [...tags].sort().map((t) => `<button type="button" class="tag-pill" data-tag-key="${esc(t)}">${esc(t)}</button>`).join("");
  html = html.replace(/<div id="tag-bar">[\s\S]*?<\/div>/, `<div id="tag-bar">${pills}</div>`);
  // The phone-only toggle that folds the bar away (brand-directory.css).
  if (!html.includes('class="tag-toggle"')) {
    html = html.replace('<div id="tag-bar">',
      '<button type="button" class="tag-toggle" aria-expanded="false" aria-controls="tag-bar" data-i18n="shared.tagToggle">Tags</button>\n    <div id="tag-bar">');
  }
  return html;
}

// i18n.js and i18n/*.json are cached for 10 minutes, so right after a deploy a browser could
// run old script or translations against new HTML (duplicate language buttons, raw tag keys).
// Pages load i18n.js?v=<hash of both>, and i18n.js passes the same version to the JSON.
const VERSION = crypto.createHash("sha1")
  .update(fs.readFileSync(path.join(ROOT, "i18n.js")))
  .update(fs.readdirSync(path.join(ROOT, "i18n")).sort().map((f) => fs.readFileSync(path.join(ROOT, "i18n", f), "utf8")).join("\n"))
  .digest("hex").slice(0, 8);
const stampVersion = (html) => html.replace(/src="i18n\.js(?:\?v=[^"]*)?"/g, `src="i18n.js?v=${VERSION}"`);

const stale = [];
for (const file of fs.readdirSync(ROOT).filter((f) => f.endsWith(".html"))) {
  const full = path.join(ROOT, file);
  const before = fs.readFileSync(full, "utf8");
  if (!before.includes('<div id="lang-bar">') && !before.includes('<div id="tag-bar">') && !before.includes('src="i18n.js')) continue;
  const after = stampVersion(tagBar(langBar(before)));
  if (after === before) continue;
  stale.push(file);
  if (!check) fs.writeFileSync(full, after);
}

if (check && stale.length) {
  console.error(`Static language/tag bars are out of date. Run pnpm i18n and commit:\n  ${stale.join("\n  ")}`);
  process.exit(1);
}
console.log(check ? "Static bars are up to date." : `Static bars written: ${stale.join(", ") || "no changes"}`);
