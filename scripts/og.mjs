// Regenerates the 1200x630 link-preview cards (og-*.png) in the repo root.
//
//   pnpm install
//   pnpm exec playwright install chromium   (first time only)
//   pnpm og                                 (all cards)
//   pnpm og tools plugins                   (only the named cards)
//
// To add or edit a card, change the CARDS list below, then reference the
// generated og-<name>.png from the page's og:image / twitter:image tags.
// Set CHROMIUM_PATH to use an existing Chromium binary instead of Playwright's.
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";

const OUT_DIR = fileURLToPath(new URL("..", import.meta.url));
const DOMAIN = "xivkit.com";

// name -> og-<name>.png. The "XIVKit" title on the home card is set as the big wordmark; other cards carry a small one top left.
const CARDS = [
  { name: "tools", title: "XIVKit", description: "Curated FFXIV tools, calculators, and reference sites. Updated whenever something new is worth keeping.", tags: ["market", "crafting", "checklist", "glamour", "guides"] },
  { name: "plugins", title: "FFXIV Plugins", description: "Dalamud plugins I actually use, client-side tools for housing, chat, glamour, and more.", tags: ["housing", "chat", "glamour", "ui"] },
  { name: "venues", title: "FFXIV Venues", description: "Player-run venues I actually visit, with open hours converted to your local time and a Lifestream address.", tags: ["venues", "lifestream", "social"] },
  { name: "watchlist", title: "FFXIV Watchlist", description: "Tools I've heard about or seen recommended but haven't tried myself yet.", tags: ["theorycrafting", "gear", "checklist"] },
  { name: "jump-puzzle-macros", title: "Jump Puzzle Macros", description: "Timed macro-and-hotbar technique for jumping exact, repeatable distances, with copyable macros and a calibration spot.", tags: ["guide", "macro"] },
  { name: "trade-in-mounts", title: "Trade-in mounts: grind vs. buy the mats", description: "Every trade-in mount, with live market prices and a straight verdict: grind it out, or buy your way there.", tags: ["guide", "mounts", "market"] },
  { name: "inventory-decluttering", title: "Inventory & retainer decluttering", description: "A decision tree for what to keep, bank, or discard, plus the short list of items that never come back.", tags: ["guide", "inventory"] },
  { name: "retainer-ventures", title: "Retainer ventures: what to send them for", description: "Every venture ranked by what it earns on the market board for your retainer, with live prices and how fast it sells.", tags: ["market", "retainer"] },
  { name: "hunt-for-astronomy", title: "Hunt for Astronomy: what's worth the tomes", description: "Every reward in the trove, where else it drops, market board prices, and a straight verdict on the tomestones.", tags: ["guide", "market", "tomestones"] },
];

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

const FONT_DIR = fileURLToPath(new URL("./fonts/", import.meta.url));
const font = (family, file, weight) =>
  `@font-face{font-family:"${family}";font-weight:${weight};src:url(data:font/ttf;base64,${readFileSync(FONT_DIR + file).toString("base64")})}`;
const FONTS = [
  font("Cinzel", "Cinzel-SemiBold.ttf", 600),
  font("Instrument Sans", "InstrumentSans-SemiBold.ttf", 600),
  font("Instrument Sans", "InstrumentSans-Regular.ttf", 400),
  font("JetBrains Mono", "JetBrainsMono-Medium.ttf", 500),
].join("");

const wordmark = `XIV<b>KIT</b>`;

const page = ({ title, description, tags }) => `<!doctype html><meta charset="utf-8"><style>
${FONTS}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;background:#0c0b0e;font-family:"Instrument Sans",Arial,Helvetica,sans-serif;color:#f5f3f6;position:relative;overflow:hidden}
.wm{font-family:Cinzel,Georgia,serif;font-weight:600;letter-spacing:.1em;color:#f5f3f6}
.wm b{font-weight:600;color:#ff5a50}
.top{position:absolute;left:80px;top:72px;font-size:40px}
h1{position:absolute;left:80px;top:170px;width:1040px;font-weight:600;font-size:80px;line-height:1.05;letter-spacing:-.025em}
h1.home{font-family:Cinzel,Georgia,serif;font-weight:600;letter-spacing:.1em;font-size:128px}
h1.home b{font-weight:600;color:#ff5a50}
p{position:absolute;left:80px;width:900px;font-size:30px;line-height:1.35;color:#aaa5b0}
.tags{position:absolute;left:80px;bottom:80px;display:flex;gap:12px}
.tags span{padding:9px 20px;border-radius:999px;background:#211f26;color:#aaa5b0;font-family:"JetBrains Mono",monospace;font-weight:500;font-size:20px}
.url{position:absolute;right:80px;bottom:84px;font-family:"JetBrains Mono",monospace;font-weight:500;font-size:24px;color:#ff5a50}
</style>
${title === "XIVKit" ? "" : `<div class="top wm">${wordmark}</div>`}
${title === "XIVKit" ? `<h1 class="home">${wordmark}</h1>` : `<h1>${esc(title)}</h1>`}<p>${esc(description)}</p>
<div class="tags">${tags.map((t) => `<span>${esc(t)}</span>`).join("")}</div>
<div class="url">${DOMAIN}</div>
<script>
  var h = document.querySelector("h1"), p = document.querySelector("p");
  p.style.top = (h.offsetTop + h.offsetHeight + 24) + "px";
</script>`;

const wanted = process.argv.slice(2);
const cards = wanted.length ? CARDS.filter((c) => wanted.includes(c.name)) : CARDS;
const unknown = wanted.filter((n) => !CARDS.some((c) => c.name === n));
if (unknown.length) {
  console.error(`Unknown card(s): ${unknown.join(", ")}. Known: ${CARDS.map((c) => c.name).join(", ")}`);
  process.exit(1);
}

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const tab = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const card of cards) {
  await tab.setContent(page(card));
  await tab.screenshot({ path: `${OUT_DIR}og-${card.name}.png` });
  console.log(`og-${card.name}.png`);
}
await browser.close();
