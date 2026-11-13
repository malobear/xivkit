// Builds the plugin directory: directory/ (templates + data) -> plugins/ (committed output).
// Nothing else on the site goes through Eleventy. Run with `pnpm plugins:build`.
import { readFileSync } from "node:fs";

export default function (eleventyConfig) {
  // Hand-written command guides, keyed by plugin slug (directory/content/usage.json). Kept out of
  // _data/ because the fetch script owns that folder.
  eleventyConfig.addGlobalData("usage", () =>
    JSON.parse(readFileSync(new URL("./directory/content/usage.json", import.meta.url), "utf8")));
  eleventyConfig.addWatchTarget("./directory/content/usage.json");

  eleventyConfig.addPassthroughCopy({ "directory/directory.css": "directory.css" });
  eleventyConfig.addPassthroughCopy({ "directory/directory.js": "directory.js" });

  eleventyConfig.addFilter("num", (n) => Number(n || 0).toLocaleString("en-US"));
  eleventyConfig.addFilter("compact", (n) => {
    n = Number(n || 0);
    return n >= 1e6 ? (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M" : n >= 1e3 ? Math.round(n / 1e3) + "k" : String(n);
  });
  eleventyConfig.addFilter("isoDate", (ts) => (ts ? new Date(ts * 1000).toISOString().slice(0, 10) : ""));
  eleventyConfig.addFilter("inCategory", (list, slug) => list.filter((p) => p.category === slug));
  // Same category, installable ones only, most installed first (the data is already in that order).
  eleventyConfig.addFilter("similar", (list, plugin) =>
    list.filter((p) => p.category === plugin.category && p.slug !== plugin.slug && p.status === "ok").slice(0, 4));
  eleventyConfig.addFilter("repoFor", (repos, plugin) => repos.find((r) => r.id === plugin.source));
  eleventyConfig.addFilter("categoryName", (cats, slug) => (cats.find((c) => c.slug === slug) || {}).name || slug);
  eleventyConfig.addFilter("trunc", (s, n) => (s && s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s));
  eleventyConfig.addFilter("host", (url) => {
    try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return ""; }
  });

  return {
    dir: { input: "directory", output: "plugins", includes: "_includes", data: "_data" },
    templateFormats: ["njk"],
    htmlTemplateEngine: "njk",
  };
}
