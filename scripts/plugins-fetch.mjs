// Refreshes the data behind the plugin directory (xivkit.com/plugins/).
//
//   pnpm plugins:fetch    (data only: directory/_data/*.json)
//   pnpm plugins:build    (data, then the Eleventy build into plugins/)
//
// Sources: Dalamud's official live plugin master list, plus the third-party repositories
// listed in directory/content/repos.json (same manifest format). Plugins on Dalamud's
// banned list are dropped. "My picks" notes come from directory/content/picks.json (kept in
// the data but not shown on the pages for now), which
// is hand-edited. Run this on a schedule (or by hand) and commit the result.
import { writeFile, readFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const DATA = fileURLToPath(new URL("../directory/_data/", import.meta.url));
const PICKS = fileURLToPath(new URL("../directory/content/picks.json", import.meta.url));
const OVERRIDES = fileURLToPath(new URL("../directory/content/categories.json", import.meta.url));
const REPOS = fileURLToPath(new URL("../directory/content/repos.json", import.meta.url));
const MASTER = "https://kamori.goats.dev/Plugin/PluginMaster";
const BANNED = "https://raw.githubusercontent.com/goatcorp/DalamudAssets/master/UIRes/bannedplugin.json";
const RELEASE = "https://kamori.goats.dev/Dalamud/Release/VersionInfo?track=release";
// Where Dalamud serves official plugin icons and screenshots from, and that repo's file list.
const D17_RAW = "https://raw.githubusercontent.com/goatcorp/PluginDistD17/main/";
const D17_TREE = "https://api.github.com/repos/goatcorp/PluginDistD17/git/trees/main?recursive=1";

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
// Like clean(), but keeps line breaks (one blank line at most) so the page can show the
// author's paragraphs and "- item" lists. See the "description" filter in eleventy.config.mjs.
const cleanLines = (s) => String(s ?? "").split(/\r?\n/).map((l) => l.replace(/\s+/g, " ").trim()).join("\n").replace(/\n{3,}/g, "\n\n").trim();

async function getJson(url) {
  const res = await fetch(url, { headers: { "user-agent": "xivkit-plugin-directory" } });
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  return res.json();
}

const [rawMaster, banned, picks, overrides, release, repoList, previous] = await Promise.all([
  getJson(MASTER),
  getJson(BANNED).catch(() => []),
  readFile(PICKS, "utf8").then(JSON.parse).catch(() => ({})),
  readFile(OVERRIDES, "utf8").then(JSON.parse).then((o) => o.categories ?? {}),
  getJson(RELEASE).catch(() => null),
  readFile(REPOS, "utf8").then(JSON.parse).then((o) => o.repos ?? []),
  readFile(DATA + "plugins.json", "utf8").then(JSON.parse).catch(() => []),
]);

// Third-party repos write numbers and booleans as strings ("15", "True"), so normalise
// every manifest the same way before using it.
const num = (v) => Number(v) || 0;
const bool = (v) => v === true || String(v).toLowerCase() === "true";
function norm(p) {
  return { ...p, DalamudApiLevel: num(p.DalamudApiLevel), TestingDalamudApiLevel: num(p.TestingDalamudApiLevel),
    DownloadCount: num(p.DownloadCount), LastUpdate: num(p.LastUpdate), IsHide: bool(p.IsHide),
    IsTestingExclusive: bool(p.IsTestingExclusive), Tags: Array.isArray(p.Tags) ? p.Tags : [], ImageUrls: Array.isArray(p.ImageUrls) ? p.ImageUrls : [] };
}
const master = rawMaster.map(norm);

// Third-party repos, fetched one at a time (some hosts are small). A repo that fails
// this run keeps its plugins from the last successful run instead of vanishing.
const thirdParty = [];
const carried = [];
for (const repo of repoList) {
  try {
    const list = await getJson(repo.url);
    if (!Array.isArray(list)) throw new Error("not a plugin list");
    for (const p of list) thirdParty.push({ ...norm(p), _source: repo.id });
  } catch (e) {
    const kept = previous.filter((p) => p.source === repo.id);
    carried.push(...kept);
    console.warn(`repo ${repo.id} failed (${e.message}); keeping ${kept.length} plugins from the last run`);
  }
}

// GITHUB_TOKEN is optional locally (the API allows 60 calls an hour without one) and set
// automatically in GitHub Actions.
const tree = await fetch(D17_TREE, { headers: { "user-agent": "xivkit-plugin-directory", accept: "application/vnd.github+json", ...(process.env.GITHUB_TOKEN ? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}) } })
  .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`${D17_TREE}: ${r.status}`))));
if (tree.truncated) throw new Error("PluginDistD17 file list came back truncated; icons and screenshots would be incomplete");
const d17Files = new Set(tree.tree.map((e) => e.path));

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
  // Dalamud forces IsHide off for the official repo but honours it for custom repos, where
  // a hidden plugin doesn't show in the installer at all.
  const hiddenByRepo = Boolean(p._source) && p.IsHide;
  const status = hiddenByRepo ? "unavailable" : best >= API ? "ok" : best === API - 1 ? "outdated" : "unavailable";
  // Testing builds are needed when the plugin only ships there, or only its testing
  // build is on the current API level.
  const needsTesting = status === "ok" && (Boolean(p.IsTestingExclusive) || stable < API);
  return { apiLevel: best, status, needsTesting, ...(hiddenByRepo ? { hiddenByRepo } : {}) };
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
// Screenshots: the same two sources, as two whole sets. Dalamud shows up to five,
// image1.png to image5.png from PluginDistD17 (numbers can skip), and ignores ImageUrls
// for official plugins, but many authors only list theirs in ImageUrls. Mixing the
// sets would repeat images, so keep whichever set has more that load (ties go to the
// official one).
const MAX_SHOTS = 5;
function shotSets(p) {
  const official = p._Dip17Channel && p.InternalName
    ? Array.from({ length: MAX_SHOTS }, (_, i) => `https://raw.githubusercontent.com/goatcorp/PluginDistD17/main/${p._Dip17Channel}/${p.InternalName}/images/image${i + 1}.png`)
    : [];
  const author = [...new Set((p.ImageUrls ?? []).map((u) => String(u).replace(/^(https:\/\/github\.com\/[^/]+\/[^/]+)\/blob\//, "$1/raw/")))].slice(0, MAX_SHOTS);
  return [official, author];
}
// Does this image URL load? A clear answer (200, or 404/403) is final. Rate limits, server
// errors and timeouts are retried with a growing pause, so a busy CDN can't quietly
// strip icons and screenshots from the directory.
// PluginDistD17 files are looked up in its file list (one GitHub API call, fetched above)
// instead of being requested one by one, which gets this machine throttled.
const transient = { count: 0 };
async function loads(url) {
  if (url.startsWith(D17_RAW)) return d17Files.has(url.slice(D17_RAW.length));
  if (!/^https?:\/\/[^/\s]+\/\S+$/i.test(url)) return false; // authors sometimes list a bare word
  for (let attempt = 0; attempt < 5; attempt++) {
    if (attempt) await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
    try {
      const res = await fetch(url, { method: "HEAD", redirect: "follow", headers: { "user-agent": "xivkit-plugin-directory" }, signal: AbortSignal.timeout(15000) });
      if (res.status === 429 || res.status >= 500) { transient.count++; continue; }
      // Some hosts label real PNGs with the wrong type (puni.sh's S3 says
      // application/x-www-form-urlencoded); browsers still show them, so only reject a
      // response that is clearly a page or data, not an image.
      return res.ok && !/^(text\/|application\/(json|xml|xhtml))/i.test(res.headers.get("content-type") ?? "");
    } catch { transient.count++; }
  }
  throw new Error(`${url}: still failing after 5 tries, stopping rather than dropping the image`);
}
async function pool(items, n, fn) {
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) await fn(items[i++]); }));
}

const seen = new Set();
const seenInternal = new Set();
const plugins = [];
for (const p of [...master, ...thirdParty]) {
  const name = clean(p.Name);
  if (!name || isBanned(p)) continue;
  // Same plugin in several places: the official list wins, then repos in repos.json order.
  const key = String(p.InternalName || name).toLowerCase();
  if (seenInternal.has(key)) continue;
  seenInternal.add(key);
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
    description: cleanLines(p.Description),
    category,
    tags,
    downloads: p.DownloadCount ?? 0,
    lastUpdate: p.LastUpdate ?? 0,
    repoUrl: p.RepoUrl || "",
    iconUrl: "",
    iconCandidates: iconCandidates(p),
    images: [],
    shotSets: shotSets(p),
    testingOnly: Boolean(p.IsTestingExclusive),
    ...availability(p),
    pick: pickKey ? { note: picks[pickKey].note } : null,
    source: p._source || "official",
  });
}
// Plugins carried over from a repo that failed this run (already fully resolved).
for (const p of carried) {
  if (seen.has(p.slug) || seenInternal.has(String(p.internalName || p.name).toLowerCase())) continue;
  seen.add(p.slug);
  plugins.push({ ...p, iconCandidates: p.iconUrl ? [p.iconUrl] : [], shotSets: [p.images] });
}
plugins.sort((a, b) => b.downloads - a.downloads);

await pool(plugins, 8, async (pl) => {
  for (const url of pl.iconCandidates) if (await loads(url)) { pl.iconUrl = url; break; }
  delete pl.iconCandidates;
  let best = [];
  for (const set of pl.shotSets) {
    if (set.length <= best.length) continue;
    const ok = (await Promise.all(set.map(async (u) => ((await loads(u)) ? u : null)))).filter(Boolean);
    if (ok.length > best.length) best = ok;
  }
  pl.images = best;
  delete pl.shotSets;
});
console.log(`screenshots: ${plugins.filter((p) => p.images.length).length} plugins have some, ${plugins.reduce((n, p) => n + p.images.length, 0)} in all (${transient.count} temporary failures retried)`);
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

const sourceCounts = {
  official: plugins.filter((p) => p.source === "official").length,
  thirdParty: plugins.filter((p) => p.source !== "official").length,
};
const statusCounts = {
  installable: plugins.filter((p) => p.status === "ok").length,
  notInstallable: plugins.filter((p) => p.status !== "ok").length,
  testing: plugins.filter((p) => p.needsTesting).length,
};
console.log(`API ${API}: ${statusCounts.installable} installable (${statusCounts.testing} need testing builds), ${statusCounts.notInstallable} not installable`);

await mkdir(DATA, { recursive: true });
await writeFile(DATA + "plugins.json", JSON.stringify(plugins));
await writeFile(DATA + "categories.json", JSON.stringify(categories, null, 2) + "\n");
// The templates need each repo's name and install address; only list repos with plugins.
const repoCounts = {};
for (const p of plugins) repoCounts[p.source] = (repoCounts[p.source] || 0) + 1;
await writeFile(DATA + "repos.json", JSON.stringify(repoList.filter((r) => repoCounts[r.id]).map((r) => ({ ...r, count: repoCounts[r.id] })), null, 2) + "\n");
await writeFile(DATA + "meta.json", JSON.stringify({ fetched: new Date().toISOString().slice(0, 10), count: plugins.length, api: API, ...statusCounts, ...sourceCounts }) + "\n");
console.log(`${plugins.length} plugins (${sourceCounts.official} official, ${sourceCounts.thirdParty} third-party from ${Object.keys(repoCounts).length - 1} repos), ${categories.length} categories, ${plugins.filter((p) => p.pick).length} picks matched`);
console.log(categories.map((c) => `${c.name}: ${c.count}`).join(" | "));
