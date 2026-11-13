// Builds the plugin directory: directory/ (templates + data) -> plugins/ (committed output).
// Nothing else on the site goes through Eleventy. Run with `pnpm plugins:build`.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

export default function (eleventyConfig) {
  // Hand-written command guides, keyed by plugin slug (directory/content/usage.json). Kept out of
  // _data/ because the fetch script owns that folder.
  eleventyConfig.addGlobalData("usage", () =>
    JSON.parse(readFileSync(new URL("./directory/content/usage.json", import.meta.url), "utf8")));
  eleventyConfig.addWatchTarget("./directory/content/usage.json");
  // Each plugin's own help text, copied from its released DLL by scripts/plugins-help.mjs.
  eleventyConfig.addGlobalData("pluginHelp", () =>
    JSON.parse(readFileSync(new URL("./directory/content/plugin-help.json", import.meta.url), "utf8")));
  // Every plugin's registered chat commands (scripts/plugins-commands.mjs), with hand fixes from
  // commands-overrides.json applied. Returns the help text as lines for the chat panel, or "".
  const readJson = (p, fallback) => { try { return JSON.parse(readFileSync(new URL(p, import.meta.url), "utf8")); } catch { return fallback; } };
  const found = readJson("./directory/content/plugin-commands.json", {});
  const overrides = readJson("./directory/content/commands-overrides.json", {});
  eleventyConfig.addGlobalData("pluginCommands", () => found);
  eleventyConfig.addFilter("commandText", (slug) => {
    const o = overrides[slug];
    if (o === false || !found[slug]) return "";
    return found[slug].commands
      // Developer commands (/xxdebug, /xxtest) aren't for players.
      .filter((c) => !/debug|test$/i.test(c.cmd) && !(o?.hide || []).includes(c.cmd))
      .map((c) => {
        let help = o?.help && c.cmd in o.help ? o.help[c.cmd] : c.help;
        // Some authors write "\n" inside a verbatim string, so it arrives as a literal backslash-n.
        if (help) help = help.replace(/\\n/g, "\n");
        return help ? `${c.cmd} → ${help}` : c.cmd;
      })
      .join("\n");
  });

  // ?v=<hash of the file> on the directory's CSS and JS, so a deploy never pairs new pages with a
  // stylesheet the browser cached from before (GitHub Pages caches for 10 minutes).
  eleventyConfig.addFilter("assetVersion", (file) =>
    createHash("sha1").update(readFileSync(new URL("./" + file, import.meta.url))).digest("hex").slice(0, 10));

  eleventyConfig.addPassthroughCopy({ "directory/directory.css": "directory.css" });
  eleventyConfig.addPassthroughCopy({ "directory/directory.js": "directory.js" });

  eleventyConfig.addFilter("num", (n) => Number(n || 0).toLocaleString("en-US"));
  eleventyConfig.addFilter("compact", (n) => {
    n = Number(n || 0);
    return n >= 1e6 ? (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M" : n >= 1e3 ? Math.round(n / 1e3) + "k" : String(n);
  });
  eleventyConfig.addFilter("isoDate", (ts) => (ts ? new Date(ts * 1000).toISOString().slice(0, 10) : ""));
  eleventyConfig.addFilter("thirdParty", (list) => list.filter((p) => p.source !== "official"));
  eleventyConfig.addFilter("niceDate", (ts) => (ts ? new Date(ts * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }) : ""));
  eleventyConfig.addFilter("inCategory", (list, slug) => list.filter((p) => p.category === slug));
  // Same category, installable ones only, most installed first (the data is already in that order).
  eleventyConfig.addFilter("similar", (list, plugin) =>
    list.filter((p) => p.category === plugin.category && p.slug !== plugin.slug && p.status === "ok").slice(0, 4));
  eleventyConfig.addFilter("repoFor", (repos, plugin) => repos.find((r) => r.id === plugin.source));
  eleventyConfig.addFilter("categoryName", (cats, slug) => (cats.find((c) => c.slug === slug) || {}).name || slug);
  eleventyConfig.addFilter("trunc", (s, n) => (s && s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s));
  // Plugin descriptions are plain text with line breaks. Lines starting with -, *, + or a bullet
  // become a list, numbered lines a numbered list, and the rest paragraphs (a blank line starts a
  // new one).
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  eleventyConfig.addFilter("oneLine", (s) => String(s ?? "").replace(/\s+/g, " ").trim());
  eleventyConfig.addFilter("description", (text) => {
    const out = [];
    let para = [], list = null;
    const flushPara = () => { if (para.length) out.push(`<p>${para.join(" ")}</p>`); para = []; };
    const flushList = () => { if (list) out.push(`<${list.tag}>${list.items.map((i) => `<li>${i}</li>`).join("")}</${list.tag}>`); list = null; };
    for (const raw of String(text ?? "").split("\n")) {
      const line = raw.trim();
      if (!line) { flushPara(); flushList(); continue; }
      const bullet = line.match(/^(?:[-*+•]|(\d+)[.)])\s+(.*)$/);
      if (bullet) {
        const tag = bullet[1] ? "ol" : "ul";
        flushPara();
        if (list && list.tag !== tag) flushList();
        list ??= { tag, items: [] };
        list.items.push(esc(bullet[2]));
      } else {
        flushList();
        para.push(esc(line.replace(/^#+\s+/, "")));
      }
    }
    flushPara(); flushList();
    return out.join("\n");
  });
  // A plugin's in-game help text, one block per line so long lines wrap with a hanging indent.
  // "-- Section --" lines become headings, as they read in game.
  eleventyConfig.addFilter("helpLines", (text) => String(text ?? "").split("\n").map((l) => {
    const t = l.trim();
    if (!t) return "<span class=\"gap\"></span>";
    const head = t.match(/^-{2,}\s*(.+?)\s*-{2,}$/);
    return head ? `<span class="head">${esc(head[1])}</span>` : `<span>${esc(t)}</span>`;
  }).join(""));
  eleventyConfig.addFilter("host", (url) => {
    try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return ""; }
  });

  return {
    dir: { input: "directory", output: "plugins", includes: "_includes", data: "_data" },
    templateFormats: ["njk"],
    htmlTemplateEngine: "njk",
  };
}
