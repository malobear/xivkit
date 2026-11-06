// Refreshes the data behind the plugin directory (xivkit.com/plugins/).
//
//   pnpm plugins:fetch    (data only: directory/_data/*.json)
//   pnpm plugins:build    (data, then the Eleventy build into plugins/)
//
// Source: Dalamud's official live plugin master list. Plugins on Dalamud's banned
// list are dropped. "My picks" notes come from directory/content/picks.json, which
// is hand-edited. Run this on a schedule (or by hand) and commit the result.
import { writeFile, readFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const DATA = fileURLToPath(new URL("../directory/_data/", import.meta.url));
const PICKS = fileURLToPath(new URL("../directory/content/picks.json", import.meta.url));
const MASTER = "https://kamori.goats.dev/Plugin/PluginMaster";
const BANNED = "https://raw.githubusercontent.com/goatcorp/DalamudAssets/master/UIRes/bannedplugin.json";

// Each category scores keyword hits: name and punchline count triple, tags and the
// description once. The best score wins; a tie goes to the earlier category.
const CATEGORIES = [
  { slug: "housing", name: "Housing", blurb: "Plugins for decorating, placing and managing houses, apartments and your Free Company workshop.", re: /\b(housing|house|houses|furnishing|furniture|decorat\w*|estate|apartment|workshop|plot|ward)\b/gi },
  { slug: "glamour", name: "Glamour and mods", blurb: "Outfit, plate and appearance tools, plus helpers for mod loaders and posing.", re: /\b(glamou?r\w*|outfit\w*|dye\w*|mirage|gpose|pose\w*|mods?|penumbra|appearance|camera|fashion|cosmetic\w*|emotes?)\b/gi },
  { slug: "market", name: "Market and economy", blurb: "Market board price checks, retainer helpers, and tools for selling and crafting for profit.", re: /\b(market\w*|price\w*|retainers?|gil|sell\w*|sale|economy|listings?|universalis|profit\w*)\b/gi },
  { slug: "crafting-gathering", name: "Crafting and gathering", blurb: "Crafting macros and solvers, gathering routes and node timers, and fishing helpers.", re: /\b(craft\w*|gather\w*|fish\w*|botanist|miner|nodes?|collectables?|desynth\w*|materia|hunts?|treasure|mining|recipes?)\b/gi },
  { slug: "combat", name: "Combat and jobs", blurb: "Job gauges, cooldown trackers, timeline and mechanic helpers for raids and trials.", re: /\b(combat|rotation\w*|jobs?|cooldowns?|raids?|boss\w*|dps|tank\w*|healer\w*|aoe|enmity|buffs?|debuffs?|gauge\w*|trials?|pvp|ultimates?|limit break|mechanics?)\b/gi },
  { slug: "ui", name: "UI and HUD", blurb: "Replacements and tweaks for the HUD, hotbars, bars, windows, nameplates and menus.", re: /\b(ui|hud|hotbars?|bars?|overlays?|layouts?|fonts?|themes?|interface|skins?|crosshair|minimap|map|nameplates?)\b/gi },
  { slug: "chat-social", name: "Chat and social", blurb: "Chat windows and filters, friend lists, translation, and tools for staying in touch.", re: /\b(chat\w*|friends?|translat\w*|social|tells?|linkshells?|discord|whispers?|messag\w*|spam|party finder|players?)\b/gi },
  { slug: "audio-music", name: "Audio and music", blurb: "Orchestrion, bard and music helpers, plus sound and volume controls.", re: /\b(music|audio|sounds?|orchestrion|bard|songs?|volume|performance|instruments?|bgm)\b/gi },
  { slug: "quality-of-life", name: "Quality of life", blurb: "Small helpers that remove friction: tweaks, reminders, trackers and shortcuts.", re: /\b(tweaks?|qol|quality of life|trackers?|reminders?|timers?|helpers?|daily|todo|checklists?|completion|shortcuts?|convenience)\b/gi },
];
const OTHER = { slug: "other", name: "Other", blurb: "Everything that does not fit a bigger bucket: odd, useful and one-of-a-kind plugins.", re: null };
const hits = (re, text) => (text.match(re) || []).length;

// Plugins that play the game for you. Flagged so the page can warn about it.
const AUTOMATION = /\b(autoduty|auto duty|autoretainer|rotation ?solver|auto ?rotation|botmaker)\b/i;

const slugify = (s) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const clean = (s) => String(s ?? "").replace(/\s+/g, " ").trim();

async function getJson(url) {
  const res = await fetch(url, { headers: { "user-agent": "xivkit-plugin-directory" } });
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  return res.json();
}

const [master, banned, picks] = await Promise.all([
  getJson(MASTER),
  getJson(BANNED).catch(() => []),
  readFile(PICKS, "utf8").then(JSON.parse).catch(() => ({})),
]);

// Dalamud bans by internal name and a version ceiling: a plugin is blocked when its
// current version is at or below the banned one. Old banned releases must not hide
// a plugin that has since been fixed.
const cmpVer = (a, b) => {
  const x = String(a).split(".").map(Number), y = String(b).split(".").map(Number);
  for (let i = 0; i < Math.max(x.length, y.length); i++) { const d = (x[i] || 0) - (y[i] || 0); if (d) return d; }
  return 0;
};
const isBanned = (p) => banned.some((b) => String(b.Name ?? "").toLowerCase() === String(p.InternalName ?? p.Name ?? "").toLowerCase()
  && (!b.AssemblyVersion || cmpVer(p.AssemblyVersion ?? "0", b.AssemblyVersion) <= 0));
const pickNames = Object.keys(picks);

const seen = new Set();
const plugins = [];
for (const p of master) {
  const name = clean(p.Name);
  if (!name || isBanned(p)) continue;
  let slug = slugify(p.InternalName || name) || "plugin";
  if (seen.has(slug)) slug += "-" + slugify(clean(p.Author)).slice(0, 12);
  while (seen.has(slug)) slug += "-2";
  seen.add(slug);

  const tags = [...new Set((p.Tags ?? []).map((t) => clean(t).toLowerCase()).filter((t) => t && t !== "plugin" && t.length < 24))].slice(0, 8);
  const strong = name + " " + clean(p.Punchline), weak = tags.join(" ") + " " + clean(p.Description);
  let best = OTHER, top = 0;
  for (const c of CATEGORIES) {
    const score = hits(c.re, strong) * 3 + hits(c.re, weak);
    if (score > top) { top = score; best = c; }
  }
  const category = best.slug;
  const hay = strong + " " + weak;

  const lower = name.toLowerCase();
  const pickKey = pickNames.find((k) => lower === k || lower.startsWith(k + " "));

  plugins.push({
    slug,
    name,
    internalName: p.InternalName,
    author: clean(p.Author),
    punchline: clean(p.Punchline),
    description: clean(p.Description),
    category,
    tags,
    downloads: p.DownloadCount ?? 0,
    lastUpdate: p.LastUpdate ?? 0,
    repoUrl: p.RepoUrl || "",
    iconUrl: p.IconUrl || "",
    images: (p.ImageUrls ?? []).slice(0, 3),
    hidden: Boolean(p.IsHide),
    testingOnly: Boolean(p.IsTestingExclusive),
    automation: AUTOMATION.test(hay),
    pick: pickKey ? { note: picks[pickKey].note } : null,
  });
}
plugins.sort((a, b) => b.downloads - a.downloads);

const categories = [...CATEGORIES, OTHER].map((c) => ({
  slug: c.slug,
  name: c.name,
  blurb: c.blurb,
  count: plugins.filter((p) => p.category === c.slug).length,
})).filter((c) => c.count);

await mkdir(DATA, { recursive: true });
await writeFile(DATA + "plugins.json", JSON.stringify(plugins));
await writeFile(DATA + "categories.json", JSON.stringify(categories, null, 2) + "\n");
await writeFile(DATA + "meta.json", JSON.stringify({ fetched: new Date().toISOString().slice(0, 10), count: plugins.length }) + "\n");
console.log(`${plugins.length} plugins (${master.length - plugins.length} skipped), ${categories.length} categories, ${plugins.filter((p) => p.pick).length} picks matched`);
console.log(categories.map((c) => `${c.name}: ${c.count}`).join(" | "));
