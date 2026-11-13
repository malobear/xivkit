// Finds the chat commands every plugin in the directory registers, with the help text Dalamud shows
// for each, and writes them to directory/content/plugin-commands.json. Plugin pages show them in
// Details (pages with a hand-written guide in usage.json show that instead). Run with
// `pnpm plugins:commands` (part of `pnpm plugins`).
//
// It reads each released DLL (the installer's latest.zip) with scripts/lib/dotnet.mjs and looks for
// ICommandManager.AddHandler / EzCmd.Add calls. A plugin is only downloaded again when its version
// changes, so the weekly run fetches just the plugins that updated. Plugins that register commands
// some other way (attributes, resource files) come out empty. Fix or hide anything wrong in
// directory/content/commands-overrides.json rather than here.
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { findCommands, openAssembly } from "./lib/dotnet.mjs";

const file = (p) => fileURLToPath(new URL(p, import.meta.url));
const OUT = file("../directory/content/plugin-commands.json");
const plugins = JSON.parse(readFileSync(file("../directory/_data/plugins.json"), "utf8"));
const repos = JSON.parse(readFileSync(file("../directory/content/repos.json"), "utf8")).repos;
const previous = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : {};
const OFFICIAL = "https://kamori.goats.dev/Plugin/PluginMaster";
const UA = { "user-agent": "xivkit-plugin-directory" };

async function getJson(url) {
  const res = await fetch(url, { headers: UA });
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  return res.json();
}

const masters = { official: await getJson(OFFICIAL) };
for (const r of repos) {
  try { masters[r.id] = await getJson(r.url); } catch (e) { console.warn(`${r.id}: ${e.message}`); masters[r.id] = []; }
}

async function commandsFor(plugin, entry) {
  const dir = mkdtempSync(join(tmpdir(), "plugin-cmds-"));
  try {
    // Testing-only plugins have no stable build, so their install link fails; try the testing
    // link first for those, and Dalamud's GitHub copy of official plugins as a last resort.
    const urls = [entry.DownloadLinkInstall, entry.DownloadLinkTesting];
    if (plugin.needsTesting || plugin.testingOnly) urls.reverse();
    if (plugin.source === "official") for (const ch of ["stable", "testing-live"]) urls.push(`https://raw.githubusercontent.com/goatcorp/PluginDistD17/main/${ch}/${plugin.internalName}/latest.zip`);
    let res;
    for (const url of urls.filter(Boolean)) {
      res = await fetch(url, { headers: UA });
      if (res.ok) break;
    }
    if (!res?.ok) throw new Error(`download ${res?.status}`);
    const zip = join(dir, "latest.zip");
    writeFileSync(zip, Buffer.from(await res.arrayBuffer()));
    // unzip exits 1 on warnings (some zips use backslashes); the files still come out.
    try { execFileSync("unzip", ["-o", "-q", zip, "-d", join(dir, "x")], { stdio: "ignore" }); } catch {}
    const want = `${plugin.internalName}.dll`.toLowerCase();
    const dll = readdirSync(join(dir, "x"), { recursive: true }).map(String).find((f) => f.toLowerCase().replace(/\\/g, "/").split("/").pop() === want);
    if (!dll) throw new Error(`${want} not in the zip`);
    return findCommands(openAssembly(readFileSync(join(dir, "x", dll))));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const out = {};
const todo = [];
for (const plugin of plugins) {
  if (plugin.status === "unavailable") continue;
  const entry = (masters[plugin.source] || []).find((m) => m.InternalName === plugin.internalName);
  if (!entry?.DownloadLinkInstall) { if (previous[plugin.slug]) out[plugin.slug] = previous[plugin.slug]; continue; }
  const version = (plugin.needsTesting || plugin.testingOnly) && entry.TestingAssemblyVersion ? entry.TestingAssemblyVersion : entry.AssemblyVersion;
  if (previous[plugin.slug]?.version === version) { out[plugin.slug] = previous[plugin.slug]; continue; }
  todo.push({ plugin, entry, version });
}

let done = 0, failed = 0;
const worker = async () => {
  while (todo.length) {
    const { plugin, entry, version } = todo.shift();
    try {
      out[plugin.slug] = { version, commands: await commandsFor(plugin, entry) };
    } catch (e) {
      failed++;
      console.warn(`${plugin.slug}: ${e.message}${previous[plugin.slug] ? ", keeping the last result" : ""}`);
      if (previous[plugin.slug]) out[plugin.slug] = previous[plugin.slug];
    }
    if (++done % 50 === 0) console.log(`${done} downloaded...`);
  }
};
await Promise.all(Array.from({ length: 6 }, worker));

const sorted = Object.fromEntries(Object.keys(out).sort().map((k) => [k, out[k]]));
writeFileSync(OUT, JSON.stringify(sorted, null, 1) + "\n");
const withCmds = Object.values(sorted).filter((v) => v.commands.length).length;
console.log(`${done} plugins checked (${failed} failed), ${withCmds} of ${Object.keys(sorted).length} have commands`);
