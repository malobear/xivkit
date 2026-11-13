// Copies each plugin's own in-game command help into directory/content/plugin-help.json, for the
// "Commands and tips" section on its directory page. Only plugins with a "help" entry in
// directory/content/usage.json are fetched. Run with `pnpm plugins:help` (part of `pnpm plugins`).
//
// The text comes from the released plugin (the same latest.zip the installer downloads), not the
// GitHub repo, because some authors release newer builds than the source they publish. A plugin's
// help text is a string literal in its DLL, so this reads the DLL's user string heap (#US) and
// picks the text out by the rule in usage.json:
//   { "start": "...", "end": "...", "lead": "/cmd → " }
//       one literal that contains start, cut from start to end, with lead put in front (for help
//       text whose first line describes the bare command without naming it)
//   { "prefix": "/qst " }        every literal that starts with prefix, one per line
//   { "pairs": ["/cmd", ...] }   each command literal and the literal right after it, its help
//                                message, as "/cmd → help"
//   { "lines": [["/cmd", "help"], ...] }
//       for plugins whose help isn't one block (attributes, resource files, settings windows):
//       lines copied from the plugin's source at the commit the release was built from (the DLL's
//       version string names it). The script checks every command and help text is still in the
//       released DLL. A third item overrides what to look for: a string, or false to skip.
// If a rule stops matching after an update, the script keeps the last good text and says so.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const file = (p) => fileURLToPath(new URL(p, import.meta.url));
const USAGE = file("../directory/content/usage.json");
const OUT = file("../directory/content/plugin-help.json");
const PLUGINS = file("../directory/_data/plugins.json");
const REPOS = file("../directory/content/repos.json");
const OFFICIAL = "https://kamori.goats.dev/Plugin/PluginMaster";

const read = (p) => JSON.parse(readFileSync(p, "utf8"));
const usage = read(USAGE);
const plugins = read(PLUGINS);
const repos = read(REPOS).repos;
const previous = existsSync(OUT) ? read(OUT) : {};

async function getJson(url) {
  const res = await fetch(url, { headers: { "user-agent": "xivkit-plugin-directory" } });
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  return res.json();
}

// The user string heap of a .NET assembly, in the order the strings appear in the file.
function userStrings(b) {
  const pe = b.readUInt32LE(0x3c), coff = pe + 4, nSec = b.readUInt16LE(coff + 2), optSize = b.readUInt16LE(coff + 16);
  const opt = coff + 20, ddir = opt + (b.readUInt16LE(opt) === 0x20b ? 112 : 96);
  const secs = [];
  for (let i = 0, s = opt + optSize; i < nSec; i++, s += 40) secs.push({ va: b.readUInt32LE(s + 12), vs: b.readUInt32LE(s + 8), raw: b.readUInt32LE(s + 20) });
  const off = (rva) => { const s = secs.find((s) => rva >= s.va && rva < s.va + Math.max(s.vs, 1)); return rva - s.va + s.raw; };
  const cli = off(b.readUInt32LE(ddir + 14 * 8)), md = off(b.readUInt32LE(cli + 8));
  let p = md + 16 + b.readUInt32LE(md + 12);
  const nStreams = b.readUInt16LE(p + 2);
  p += 4;
  let us;
  for (let i = 0; i < nStreams; i++) {
    const o = b.readUInt32LE(p), size = b.readUInt32LE(p + 4);
    let q = p + 8, name = "";
    while (b[q]) name += String.fromCharCode(b[q++]);
    q = (q + 4) & ~3;
    if (name === "#US") us = { o: md + o, size };
    p = q;
  }
  if (!us) return [];
  const out = [];
  for (let i = us.o + 1, end = us.o + us.size; i < end;) {
    let len = b[i], hdr = 1;
    if ((len & 0xc0) === 0x80) { len = ((len & 0x3f) << 8) | b[i + 1]; hdr = 2; }
    else if ((len & 0xe0) === 0xc0) { len = ((len & 0x1f) << 24) | (b[i + 1] << 16) | (b[i + 2] << 8) | b[i + 3]; hdr = 4; }
    if (len) out.push(b.subarray(i + hdr, i + hdr + len - 1).toString("utf16le"));
    i += hdr + len;
  }
  return out;
}

// Whether a string occurs anywhere in the DLL, as UTF-16 (string literals) or UTF-8 (attributes
// and embedded resources).
const inDll = (bytes, str) => bytes.includes(Buffer.from(str, "utf16le")) || bytes.includes(Buffer.from(str, "utf8"));

function pick(strings, rule, bytes, warn) {
  if (rule.lines) {
    const missing = [];
    for (const [cmd, help, check] of rule.lines) {
      const root = cmd.split(" ")[0];
      if (!inDll(bytes, root) && !inDll(bytes, root.replace(/^\//, ""))) missing.push(root);
      const look = check === undefined ? help : check;
      if (look && !inDll(bytes, look)) missing.push(look);
    }
    if (missing.length) { warn(`not in the release any more: ${[...new Set(missing)].map((m) => JSON.stringify(m)).join(", ")}`); return null; }
    return rule.lines.map(([cmd, help]) => (help ? `${cmd} → ${help}` : cmd)).join("\n");
  }
  if (rule.pairs) {
    const lines = [];
    for (const cmd of rule.pairs) {
      const i = strings.indexOf(cmd);
      if (i < 0 || !strings[i + 1]) { warn(`${cmd} not found`); return null; }
      lines.push(`${cmd} → ${strings[i + 1]}`);
    }
    return lines.join("\n");
  }
  if (rule.start) {
    const s = strings.find((x) => x.includes(rule.start));
    if (!s) return null;
    let text = s.slice(s.indexOf(rule.start));
    if (rule.end) {
      const e = text.indexOf(rule.end);
      if (e < 0) return null;
      text = text.slice(0, e + rule.end.length);
    }
    return (rule.lead || "") + text;
  }
  if (rule.prefix) {
    const lines = [...new Set(strings.filter((x) => x.startsWith(rule.prefix)))];
    return lines.length ? lines.join("\n") : null;
  }
  return null;
}

const tidy = (s) => s.replace(/\r\n?/g, "\n").split("\n").map((l) => l.trimEnd()).join("\n").replace(/\n{3,}/g, "\n\n").trim();

const wanted = Object.entries(usage).filter(([, u]) => u.help);
const masters = {};
const masterFor = async (source) => {
  if (!masters[source]) {
    const url = source === "official" ? OFFICIAL : repos.find((r) => r.id === source)?.url;
    masters[source] = url ? await getJson(url) : [];
  }
  return masters[source];
};

const out = {};
for (const [slug, u] of wanted) {
  const plugin = plugins.find((p) => p.slug === slug);
  const keep = (why) => {
    console.warn(`${slug}: ${why}${previous[slug] ? ", keeping the last good text" : ""}`);
    if (previous[slug]) out[slug] = previous[slug];
  };
  if (!plugin) { keep("not in plugins.json"); continue; }
  const entry = (await masterFor(plugin.source)).find((m) => m.InternalName === plugin.internalName);
  if (!entry?.DownloadLinkInstall) { keep("no download link"); continue; }
  const ruleKey = JSON.stringify(u.help);
  if (previous[slug]?.version === entry.AssemblyVersion && previous[slug]?.rule === ruleKey) { out[slug] = previous[slug]; continue; }

  const dir = mkdtempSync(join(tmpdir(), "plugin-help-"));
  try {
    const zip = join(dir, "latest.zip");
    const res = await fetch(entry.DownloadLinkInstall, { headers: { "user-agent": "xivkit-plugin-directory" } });
    if (!res.ok) { keep(`download failed (${res.status})`); continue; }
    writeFileSync(zip, Buffer.from(await res.arrayBuffer()));
    // unzip exits 1 on warnings (some zips use backslashes); the files still come out.
    try { execFileSync("unzip", ["-o", "-q", zip, "-d", join(dir, "x")], { stdio: "ignore" }); } catch {}
    const dllName = `${plugin.internalName}.dll`.toLowerCase();
    const dll = readdirSync(join(dir, "x"), { recursive: true }).find((f) => String(f).toLowerCase().replace(/\\/g, "/").split("/").pop() === dllName);
    if (!dll) { keep(`${dllName} not in the zip`); continue; }
    const bytes = readFileSync(join(dir, "x", String(dll)));
    const text = pick(userStrings(bytes), u.help, bytes, (m) => console.warn(`${slug}: ${m}`));
    if (!text) { keep("help rule matched nothing (did the plugin's help change?)"); continue; }
    out[slug] = { version: entry.AssemblyVersion, kind: u.help.lines ? "lines" : "verbatim", rule: ruleKey, text: tidy(text) };
    console.log(`${slug}: ${entry.AssemblyVersion}${previous[slug] && previous[slug].text !== out[slug].text ? " (help text changed, review usage.json extras)" : ""}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n");
console.log(`${Object.keys(out).length} of ${wanted.length} plugins have help text`);
