// Author pages for the plugin directory: everyone credited on two or more listed plugins gets a page
// at /plugins/author/<slug>/. Used by eleventy.config.mjs.
//
// Dalamud's Author field is free text, so it's split into people first: "kawaii, NightmareXIV",
// "veyn & croizat", "Caraxi, maintained & updated by Khayle" all credit each named person. Former
// authors in brackets ("(formerly Infi & PunishedPineapple)") and "and contributors" are dropped.
// A plugin counts when it is listed (installable or outdated); ones Dalamud no longer lists at all
// don't, since their pages are noindex.

export const slugify = (s) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const squash = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

// The people named in one Author string, in the order given.
export function splitAuthors(raw) {
  const s = String(raw || "")
    .replace(/\([^)]*\)/g, " ") // (formerly ...), (fork of ...)
    .replace(/\b(maintained|updated|created|made|written|developed|ported|modded|forked|edited)(\s*(&|and)\s*(maintained|updated))?\s+by\b/gi, ",")
    .replace(/\band\s+(other\s+)?contributors\b/gi, "")
    .replace(/\s+(&|and|\+)\s+/gi, ",");
  return [...new Set(s.split(/[,/]/).map((x) => x.trim()).filter((x) => x.length > 1 && !/^(various|others?|unknown|team)$/i.test(x)))];
}

const ownerOf = (url) => (String(url || "").match(/github\.com\/([^/#?]+)/i) || [])[1] || "";

export function buildAuthors(plugins) {
  const listed = plugins.filter((p) => p.status !== "unavailable");
  const people = new Map(); // key -> { names: {spelling: count}, plugins: [], owners: {} , soleOwners: {} }
  for (const p of listed) {
    const names = splitAuthors(p.author);
    for (const name of names) {
      const key = squash(name);
      if (!key) continue;
      if (!people.has(key)) people.set(key, { names: {}, plugins: [], owners: {}, soleOwners: {} });
      const a = people.get(key);
      a.names[name] = (a.names[name] || 0) + 1;
      a.plugins.push(p);
      const owner = ownerOf(p.repoUrl);
      if (owner) {
        a.owners[owner] = (a.owners[owner] || 0) + 1;
        if (names.length === 1) a.soleOwners[owner] = (a.soleOwners[owner] || 0) + 1;
      }
    }
  }

  const authors = [];
  const used = new Set();
  for (const [key, a] of people) {
    if (a.plugins.length < 2) continue;
    const name = Object.entries(a.names).sort((x, y) => y[1] - x[1])[0][0];
    // GitHub: a repo owner that is the author's own name, or else the one personal account all
    // their solo plugins live under (at least two of them). Organisations hosting several people's
    // plugins don't match either rule, so they never get credited as someone's profile.
    let github = Object.keys(a.owners).find((o) => squash(o) === key) || "";
    if (!github) {
      const solo = Object.entries(a.soleOwners);
      if (solo.length === 1 && solo[0][1] >= 2) github = solo[0][0];
    }
    let slug = slugify(name) || key;
    while (used.has(slug)) slug += "-2";
    used.add(slug);
    const plugins = a.plugins.sort((x, y) => y.downloads - x.downloads);
    // An avatar only when the account is plainly theirs (same name), not for the fallback match.
    const avatar = github && squash(github).replace(/[0-9]/g, "") === key.replace(/[0-9]/g, "") ? github : "";
    authors.push({
      key, slug, name, github, avatar,
      count: plugins.length,
      installs: plugins.reduce((n, p) => n + (p.downloads || 0), 0),
      lastUpdate: Math.max(...plugins.map((p) => p.lastUpdate || 0)),
      plugins: plugins.map((p) => p.slug),
    });
  }
  authors.sort((x, y) => y.installs - x.installs);

  // For each plugin, its credited people in order, with the author page slug where one exists.
  const bySquash = new Map(authors.map((a) => [a.key, a]));
  const pluginAuthors = {};
  for (const p of plugins) {
    pluginAuthors[p.slug] = splitAuthors(p.author).map((n) => ({ name: n, slug: bySquash.get(squash(n))?.slug || null }));
  }
  return { authors, pluginAuthors };
}
