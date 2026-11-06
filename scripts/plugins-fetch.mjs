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
const OVERRIDES = fileURLToPath(new URL("../directory/content/categories.json", import.meta.url));
const MASTER = "https://kamori.goats.dev/Plugin/PluginMaster";
const BANNED = "https://raw.githubusercontent.com/goatcorp/DalamudAssets/master/UIRes/bannedplugin.json";
const RELEASE = "https://kamori.goats.dev/Dalamud/Release/VersionInfo?track=release";

// Each category scores keyword hits: name and punchline count triple, tags and the
// description once. The best score wins; a tie goes to the earlier category.
const CATEGORIES = [
  { slug: "housing", name: "Housing", blurb: "Plugins for decorating, placing and managing houses, apartments and your Free Company estate.", re: /\b(housing|house|houses|furnishing\w*|furniture|decorat\w*|estates?|apartments?|interior|exterior|placement)\b/gi },
  { slug: "roleplay", name: "Roleplay and venues", blurb: "Character profiles, custom titles, RP event calendars, and tools for running or visiting player venues.", re: /\b(roleplay\w*|rp|rpers?|venues?|honorifics?|titles?|rp profiles?|character profiles?|partake|nameplate titles?|events? calendar)\b/gi },
  { slug: "games", name: "Minigames and fun", blurb: "Games to play while you wait or lie dead on the floor, plus dice, cards and other silly extras.", re: /\b(mini-?games?|arcade|puzzle game|games? to play|minesweeper|tetris|blackjack|casino|gambl\w*|dice|death ?roll|triple triad|triad|2048|bomberman|super hexagon|puzzle bobble|tic-tac-toe)\b/gi },
  { slug: "glamour", name: "Glamour and mods", blurb: "Outfit, plate and appearance tools, camera and screenshot helpers, and tools for mod loaders and posing.", re: /\b(glamou?r\w*|outfit\w*|dye\w*|mirage|gpose|pose\w*|mods?|penumbra|appearance|camera|fashion|cosmetic\w*|emotes?)\b/gi },
  { slug: "market", name: "Market and economy", blurb: "Market board price checks, retainer helpers, and tools for selling and crafting for profit.", re: /\b(market\w*|price\w*|retainers?|gil|sell\w*|sale|economy|listings?|universalis|profit\w*|trades?|currenc\w*)\b/gi },
  { slug: "crafting-gathering", name: "Crafting and gathering", blurb: "Crafting macros and solvers, gathering routes and node timers, fishing helpers, and Island Sanctuary planners.", re: /\b(craft\w*|gather\w*|fish\w*|botanist|miner|nodes?|collectables?|desynth\w*|materia|mining|recipes?|island sanctuary|sanctuary|workshop agenda|cosmic exploration)\b/gi },
  { slug: "combat", name: "Combat and duties", blurb: "Job gauges, cooldown trackers, mechanic helpers, fly text, and tools for dungeons, roulettes, hunts and other duty content.", re: /\b(combat|rotation\w*|jobs?|cooldowns?|raids?|boss\w*|dps|tank\w*|healer\w*|aoe|enmity|buffs?|debuffs?|gauge\w*|trials?|pvp|ultimates?|limit break|mechanics?|dut(?:y|ies)|dungeons?|deep dungeons?|roulettes?|waymarks?|wondrous tails|faux hollows|relics?|zodiac|fates?|hunts?|treasure maps?|fly ?text|damage|targets?|targeting|enem(?:y|ies)|spawns?)\b/gi },
  { slug: "ui", name: "UI and HUD", blurb: "Replacements and tweaks for the HUD, hotbars, bars, windows, nameplates, tooltips and menus.", re: /\b(ui|hud|hotbars?|bars?|overlays?|layouts?|fonts?|themes?|interface|skins?|crosshair|minimap|map|nameplates?|tooltips?|text box\w*|addons?|character panel)\b/gi },
  { slug: "chat-social", name: "Chat and social", blurb: "Chat windows and filters, friend lists, linkshells, translation, and tools for staying in touch.", re: /\b(chat\w*|friends?|translat\w*|social|tells?|linkshells?|discord|whispers?|messag\w*|spam|party finder|nicknames?|dialogue)\b/gi },
  { slug: "audio-music", name: "Audio and music", blurb: "Orchestrion, bard and music helpers, plus sound and volume controls.", re: /\b(music|audio|sounds?|orchestrion|bard|songs?|volume|performance|instruments?|bgm|tts|text to speech|voices?)\b/gi },
  { slug: "graphics", name: "Graphics and performance", blurb: "Frame rate, resolution, shadow and render settings, crash and input fixes, and other tweaks to the game client itself.", re: /\b(fps|frame ?rate|graphics?|shadows?|resolution|render\w*|latency|reflex|vfx|lighting|physics|gpu|game window|taskbar|crash\w*|backups?|ping|lobby error|controller)\b/gi },
  { slug: "quality-of-life", name: "Quality of life", blurb: "Small helpers that remove friction: tweaks, reminders, collection trackers, notifications and shortcuts.", re: /\b(tweaks?|qol|quality of life|trackers?|reminders?|timers?|helpers?|daily|todo|checklists?|completion|shortcuts?|convenience|notif\w*|mounts?|minions?|collect(?:ion|ed|ions)|teleport\w*|aetherytes?|macros?|inventory|search)\b/gi },
];
const OTHER = { slug: "other", name: "Other", blurb: "Everything that does not fit a bigger bucket: odd, useful and one-of-a-kind plugins.", re: null };
const hits = (re, text) => (text.match(re) || []).length;

const slugify = (s) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const clean = (s) => String(s ?? "").replace(/\s+/g, " ").trim();

async function getJson(url) {
  const res = await fetch(url, { headers: { "user-agent": "xivkit-plugin-directory" } });
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  return res.json();
}

const [master, banned, picks, overrides, release] = await Promise.all([
  getJson(MASTER),
  getJson(BANNED).catch(() => []),
  readFile(PICKS, "utf8").then(JSON.parse).catch(() => ({})),
  readFile(OVERRIDES, "utf8").then(JSON.parse).then((o) => o.categories ?? {}),
  getJson(RELEASE).catch(() => null),
]);

// Can it be installed on today's Dalamud? Same rule as IsManifestEligible in Dalamud's
// PluginManager.cs: the current API level installs, one level back is listed as
// "outdated" (not installable), and anything older is left out of the installer. The
// current level is the major version of the live Dalamud release; if that endpoint is
// down, fall back to the highest level any official plugin targets.
const API = Number(String(release?.assemblyVersion ?? "").split(".")[0])
  || Math.max(...master.map((p) => p.DalamudApiLevel || 0));
function availability(p) {
  const stable = p.DalamudApiLevel || 0, testing = p.TestingDalamudApiLevel || 0;
  const best = Math.max(stable, testing);
  const status = best >= API ? "ok" : best === API - 1 ? "outdated" : "unavailable";
  // Testing builds are needed when the plugin only ships there, or only its testing
  // build is on the current API level.
  const needsTesting = status === "ok" && (Boolean(p.IsTestingExclusive) || stable < API);
  return { apiLevel: best, status, needsTesting };
}

// Hand-set categories (directory/content/categories.json) win over keyword scoring.
// A typo in a category slug is an error, not a silent new bucket.
const validCats = new Set([...CATEGORIES, OTHER].map((c) => c.slug));
for (const [slug, cat] of Object.entries(overrides)) {
  if (!validCats.has(cat)) throw new Error(`categories.json: ${slug} -> unknown category "${cat}"`);
}

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

// Icons, best first. Dalamud's installer ignores IconUrl for official plugins and loads
// the icon from goatcorp/PluginDistD17 (GetPluginIconUrl in PluginImageCache.cs), so that
// is what players see in game. Then the author's IconUrl, then the usual images/icon.png
// in the plugin's GitHub repo. Only a URL that actually loads is kept.
function iconCandidates(p) {
  const out = [];
  if (p._Dip17Channel && p.InternalName) {
    out.push(`https://raw.githubusercontent.com/goatcorp/PluginDistD17/main/${p._Dip17Channel}/${p.InternalName}/images/icon.png`);
  }
  // A github.com/.../blob/... link is an HTML page; /raw/ serves the image itself.
  if (p.IconUrl) out.push(String(p.IconUrl).replace(/^(https:\/\/github\.com\/[^/]+\/[^/]+)\/blob\//, "$1/raw/"));
  const gh = String(p.RepoUrl ?? "").match(/^https?:\/\/github\.com\/([^/]+)\/([^/#?]+?)(?:\.git)?(?:[/#?]|$)/i);
  if (gh) out.push(`https://raw.githubusercontent.com/${gh[1]}/${gh[2]}/HEAD/images/icon.png`);
  return [...new Set(out)];
}
async function loads(url) {
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow", headers: { "user-agent": "xivkit-plugin-directory" }, signal: AbortSignal.timeout(15000) });
    return res.ok && /^image\//.test(res.headers.get("content-type") ?? "image/");
  } catch { return false; }
}
async function pool(items, n, fn) {
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) await fn(items[i++]); }));
}

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
  const category = overrides[slug] ?? best.slug;

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
    iconUrl: "",
    iconCandidates: iconCandidates(p),
    images: (p.ImageUrls ?? []).slice(0, 3),
    testingOnly: Boolean(p.IsTestingExclusive),
    ...availability(p),
    pick: pickKey ? { note: picks[pickKey].note } : null,
  });
}
plugins.sort((a, b) => b.downloads - a.downloads);

await pool(plugins, 16, async (pl) => {
  for (const url of pl.iconCandidates) if (await loads(url)) { pl.iconUrl = url; break; }
  delete pl.iconCandidates;
});
const iconless = plugins.filter((p) => !p.iconUrl);
console.log(`icons: ${plugins.length - iconless.length} found, ${iconless.length} use the letter placeholder${iconless.length ? " (" + iconless.map((p) => p.slug).join(", ") + ")" : ""}`);

const unused = Object.keys(overrides).filter((k) => !seen.has(k));
if (unused.length) console.warn(`categories.json: no plugin with slug ${unused.join(", ")} (removed or renamed?)`);

const categories = [...CATEGORIES, OTHER].map((c) => ({
  slug: c.slug,
  name: c.name,
  blurb: c.blurb,
  count: plugins.filter((p) => p.category === c.slug).length,
})).filter((c) => c.count);

const statusCounts = {
  installable: plugins.filter((p) => p.status === "ok").length,
  notInstallable: plugins.filter((p) => p.status !== "ok").length,
  testing: plugins.filter((p) => p.needsTesting).length,
};
console.log(`API ${API}: ${statusCounts.installable} installable (${statusCounts.testing} need testing builds), ${statusCounts.notInstallable} not installable`);

await mkdir(DATA, { recursive: true });
await writeFile(DATA + "plugins.json", JSON.stringify(plugins));
await writeFile(DATA + "categories.json", JSON.stringify(categories, null, 2) + "\n");
await writeFile(DATA + "meta.json", JSON.stringify({ fetched: new Date().toISOString().slice(0, 10), count: plugins.length, api: API, ...statusCounts }) + "\n");
console.log(`${plugins.length} plugins (${master.length - plugins.length} skipped), ${categories.length} categories, ${plugins.filter((p) => p.pick).length} picks matched`);
console.log(categories.map((c) => `${c.name}: ${c.count}`).join(" | "));
