// A small reader for .NET assemblies (plugin DLLs), enough to find the chat commands a Dalamud
// plugin registers and the help text it gives them. No dependencies, so the weekly GitHub Action
// can run it as is. Format reference: ECMA-335, partition II, section 24.

// Opens a DLL (a Buffer) and returns helpers over its metadata.
export function openAssembly(b) {
  const pe = b.readUInt32LE(0x3c), coff = pe + 4, nSec = b.readUInt16LE(coff + 2), optSize = b.readUInt16LE(coff + 16);
  const opt = coff + 20, ddir = opt + (b.readUInt16LE(opt) === 0x20b ? 112 : 96);
  const secs = [];
  for (let i = 0, s = opt + optSize; i < nSec; i++, s += 40) secs.push({ va: b.readUInt32LE(s + 12), vs: b.readUInt32LE(s + 8), raw: b.readUInt32LE(s + 20), rs: b.readUInt32LE(s + 16) });
  const off = (rva) => { const s = secs.find((s) => rva >= s.va && rva < s.va + Math.max(s.vs, s.rs)); return s ? rva - s.va + s.raw : -1; };
  const cli = off(b.readUInt32LE(ddir + 14 * 8)), md = off(b.readUInt32LE(cli + 8));
  let p = md + 16 + b.readUInt32LE(md + 12);
  const nStreams = b.readUInt16LE(p + 2);
  p += 4;
  const streams = {};
  for (let i = 0; i < nStreams; i++) {
    const o = b.readUInt32LE(p), size = b.readUInt32LE(p + 4);
    let q = p + 8, name = "";
    while (b[q]) name += String.fromCharCode(b[q++]);
    q = (q + 4) & ~3;
    streams[name] = { o: md + o, size };
    p = q;
  }

  // #Strings: null-terminated UTF-8.
  const str = (i) => { const s = streams["#Strings"].o + i; let e = s; while (b[e]) e++; return b.subarray(s, e).toString("utf8"); };
  // #US: length-prefixed UTF-16 string literals (what ldstr loads).
  const us = (i) => {
    const s = streams["#US"].o + i;
    let len = b[s], hdr = 1;
    if ((len & 0xc0) === 0x80) { len = ((len & 0x3f) << 8) | b[s + 1]; hdr = 2; }
    else if ((len & 0xe0) === 0xc0) { len = ((len & 0x1f) << 24) | (b[s + 1] << 16) | (b[s + 2] << 8) | b[s + 3]; hdr = 4; }
    return len ? b.subarray(s + hdr, s + hdr + len - 1).toString("utf16le") : "";
  };

  // #~ table stream: only the tables up to MemberRef are read, which is all this needs.
  const t = streams["#~"] || streams["#-"];
  const heapSizes = b[t.o + 6];
  const valid = b.readBigUInt64LE(t.o + 8);
  const rows = new Array(64).fill(0);
  let q = t.o + 24;
  for (let i = 0; i < 64; i++) if ((valid >> BigInt(i)) & 1n) { rows[i] = b.readUInt32LE(q); q += 4; }
  const strIdx = heapSizes & 1 ? 4 : 2, guidIdx = heapSizes & 2 ? 4 : 2, blobIdx = heapSizes & 4 ? 4 : 2;
  const idx = (table) => (rows[table] < 65536 ? 2 : 4);
  const coded = (bits, tables) => (Math.max(...tables.map((x) => rows[x])) < 1 << (16 - bits) ? 2 : 4);
  const typeDefOrRef = coded(2, [0x02, 0x01, 0x1b]);
  const sizes = {
    0x00: 2 + strIdx + guidIdx * 3, // Module
    0x01: coded(2, [0x00, 0x1a, 0x23, 0x01]) + strIdx * 2, // TypeRef
    0x02: 4 + strIdx * 2 + typeDefOrRef + idx(0x04) + idx(0x06), // TypeDef
    0x03: idx(0x04), // FieldPtr
    0x04: 2 + strIdx + blobIdx, // Field
    0x05: idx(0x06), // MethodPtr
    0x06: 4 + 2 + 2 + strIdx + blobIdx + idx(0x08), // MethodDef
    0x07: idx(0x08), // ParamPtr
    0x08: 2 + 2 + strIdx, // Param
    0x09: idx(0x02) + typeDefOrRef, // InterfaceImpl
    0x0a: coded(3, [0x02, 0x01, 0x1a, 0x06, 0x1b]) + strIdx + blobIdx, // MemberRef
    0x0b: 2 + coded(2, [0x04, 0x08, 0x17]) + blobIdx, // Constant
    // CustomAttribute: Parent (HasCustomAttribute), Type (CustomAttributeType), Value (blob)
    0x0c: coded(5, [0x06, 0x04, 0x01, 0x02, 0x08, 0x09, 0x0a, 0x00, 0x0e, 0x17, 0x14, 0x11, 0x1a, 0x1b, 0x20, 0x23, 0x26, 0x27, 0x28, 0x2a, 0x2c, 0x2b])
      + coded(3, [0x06, 0x0a]) + blobIdx,
  };
  const start = {};
  for (let i = 0; i <= 0x0c; i++) { start[i] = q; q += rows[i] * sizes[i]; }
  const rd = (pos, n) => (n === 2 ? b.readUInt16LE(pos) : b.readUInt32LE(pos));
  const row = (table, i) => start[table] + (i - 1) * sizes[table];

  const typeRefName = (i) => { const r = row(0x01, i) + coded(2, [0x00, 0x1a, 0x23, 0x01]); return str(rd(r, strIdx)); };
  const typeDefName = (i) => str(rd(row(0x02, i) + 4, strIdx));
  const parentSize = sizes[0x0a] - strIdx - blobIdx;
  const memberRef = (i) => {
    const r = row(0x0a, i), parent = rd(r, parentSize), tag = parent & 7, pi = parent >> 3;
    const cls = tag === 1 ? typeRefName(pi) : tag === 0 ? typeDefName(pi) : "";
    return { name: str(rd(r + parentSize, strIdx)), cls };
  };
  const methodName = (i) => str(rd(row(0x06, i) + 8, strIdx));
  const fieldName = (i) => str(rd(row(0x04, i) + 2, strIdx));

  // The type a MethodDef belongs to: the TypeDef whose MethodList range contains it. Worked out
  // once for every method, since the TypeDef rows are sorted by MethodList.
  const methodListOff = 4 + strIdx * 2 + typeDefOrRef + idx(0x04);
  const ownerIdx = new Array(rows[0x06] + 2).fill(0);
  for (let t = 1; t <= rows[0x02]; t++) {
    const from = rd(row(0x02, t) + methodListOff, idx(0x06));
    const to = t < rows[0x02] ? rd(row(0x02, t + 1) + methodListOff, idx(0x06)) : rows[0x06] + 1;
    for (let m = from; m < to && m <= rows[0x06]; m++) ownerIdx[m] = t;
  }
  const methodOwner = (m) => (ownerIdx[m] ? typeDefName(ownerIdx[m]) : "");

  // Every method body, as { name, owner, code } (owner is the TypeDef row, code the raw IL bytes).
  function* methods() {
    for (let i = 1; i <= rows[0x06]; i++) {
      const r = row(0x06, i), rva = b.readUInt32LE(r);
      if (!rva) continue;
      const o = off(rva);
      if (o < 0) continue;
      const h = b[o];
      let code, size;
      if ((h & 3) === 2) { size = h >> 2; code = o + 1; }
      else { size = b.readUInt32LE(o + 4); code = o + ((b.readUInt16LE(o) >> 12) * 4); }
      yield { name: methodName(i), owner: ownerIdx[i], code: b.subarray(code, code + size) };
    }
  }
  // A blob: compressed length, then bytes.
  const blob = (i) => {
    const s = streams["#Blob"].o + i;
    let len = b[s], hdr = 1;
    if ((len & 0xc0) === 0x80) { len = ((len & 0x3f) << 8) | b[s + 1]; hdr = 2; }
    else if ((len & 0xe0) === 0xc0) { len = ((len & 0x1f) << 24) | (b[s + 1] << 16) | (b[s + 2] << 8) | b[s + 3]; hdr = 4; }
    return b.subarray(s + hdr, s + hdr + len);
  };
  // Every custom attribute, as { parent, type, value } where parent is the raw coded index (equal
  // for attributes on the same method), type the attribute class name, value the blob.
  const caParent = sizes[0x0c] - coded(3, [0x06, 0x0a]) - blobIdx, caType = coded(3, [0x06, 0x0a]);
  function* attributes() {
    for (let i = 1; i <= rows[0x0c]; i++) {
      const r = row(0x0c, i), parent = rd(r, caParent), type = rd(r + caParent, caType);
      const tag = type & 7, ti = type >> 3;
      const cls = tag === 3 ? memberRef(ti).cls : tag === 2 ? methodOwner(ti) : "";
      yield { parent, type: cls, value: blob(rd(r + caParent + caType, blobIdx)) };
    }
  }

  return { us, memberRef, methodName, fieldName, methods, attributes };
}

// The fixed string arguments of an attribute value blob: prolog 0x0001, then each argument. Handles
// string and string[] (params) arguments, which is all the command attributes use.
export function attributeStrings(v) {
  if (v.length < 2 || v[0] !== 1 || v[1] !== 0) return [];
  let p = 2;
  const ser = () => {
    if (v[p] === 0xff) { p++; return null; }
    let len = v[p], hdr = 1;
    if ((len & 0xc0) === 0x80) { len = ((len & 0x3f) << 8) | v[p + 1]; hdr = 2; }
    const s = v.subarray(p + hdr, p + hdr + len).toString("utf8");
    p += hdr + len;
    return s;
  };
  // A string[] starts with a 4-byte count; a string with its compressed length. A count below
  // 0x80 with three zero bytes after it is read as an array.
  if (v.length >= p + 4 && v[p + 1] === 0 && v[p + 2] === 0 && v[p + 3] === 0 && v[p] < 0x80 && v.length > p + 4) {
    const n = v.readUInt32LE(p); p += 4;
    const out = [];
    for (let i = 0; i < n && p < v.length; i++) out.push(ser());
    return out.filter(Boolean);
  }
  const s = ser();
  return s ? [s] : [];
}

// The string loads, field loads and method calls in a method body, in order. This scans for the
// byte patterns of ldstr (0x72 + string token), ldfld / ldflda / ldsfld / ldsflda (0x7B-0x7F +
// Field or MemberRef token) and call / callvirt / newobj (0x28 / 0x6F / 0x73 + MemberRef or
// MethodDef token) rather than decoding every opcode, which is plenty for command registration.
export function events(asm, code) {
  const out = [];
  for (let i = 0; i + 4 < code.length; i++) {
    const op = code[i], tbl = code[i + 4];
    const tok = code[i + 1] | (code[i + 2] << 8) | (code[i + 3] << 16);
    if (op === 0x72 && tbl === 0x70 && tok) {
      try { out.push({ t: "str", v: asm.us(tok) }); i += 4; } catch {}
    } else if ((op === 0x28 || op === 0x6f || op === 0x73) && (tbl === 0x0a || tbl === 0x06) && tok) {
      try {
        const m = tbl === 0x0a ? asm.memberRef(tok) : { name: asm.methodName(tok), cls: "" };
        out.push({ t: "call", name: m.name, cls: m.cls }); i += 4;
      } catch {}
    } else if (op >= 0x7b && op <= 0x7f && op !== 0x7d && (tbl === 0x04 || tbl === 0x0a) && tok) {
      try { out.push({ t: "field", name: tbl === 0x04 ? asm.fieldName(tok) : asm.memberRef(tok).name }); i += 4; } catch {}
    }
  }
  return out;
}

// Rebuilds a help message built at run time from text and the plugin's name, such as
// $"Toggle visibility of the {Plugin.Name} window" or string.Format("Open {0} settings", Name).
// `exprEnd` is the index of the last event of the expression (the Concat / Format /
// ToStringAndClear call). Returns null unless every piece is literal text or the plugin's name,
// so an unknown value never ends up as a gap in the sentence.
const NAME_GETTER = /^get_(Name|PluginName|DisplayName)$/;
const NAME_FIELD = /^(<)?_?(name|pluginName|displayName)(>k__BackingField)?$/i;
const RECEIVER = /^get_(Manifest|PluginInterface|Interface|Instance|Plugin|Service|Services)$/;
const RECEIVER_FIELD = /^(<)?_?(plugin(Interface)?|pi|dalamud(Plugin)?Interface|instance|manifest)(>k__BackingField)?$/i;
const JOINER = (e) => (e.cls === "String" && /^(Concat|Format)$/.test(e.name)) || (e.cls === "DefaultInterpolatedStringHandler" && /^(\.ctor|AppendLiteral|AppendFormatted|ToStringAndClear)$/.test(e.name));
// Also understood: Localize("key", "English fallback") calls (CheapLoc and similar), whose fallback
// is the author's own English text, and getters that just return a literal (constGetters).
function composeHelp(win, exprEnd, names, constGetters) {
  const last = win[exprEnd];
  const ends = last && last.t === "call" && ((JOINER(last) && /^(Concat|Format|ToStringAndClear)$/.test(last.name)) || last.name === "Localize" || constGetters.has(last.name));
  if (!ends) return null;
  const parts = [];
  let i = exprEnd;
  for (; i >= 0; i--) {
    const e = win[i];
    if (e.t === "str") {
      // A "/cmd" literal ends the walk, unless the text after it starts with a space, as in
      // "/altoholic" + " help for more options": then it's part of the sentence.
      if (isCmd(e.v)) { if (parts[0] && /^\s/.test(parts[0].text)) parts.unshift({ text: e.v }); break; }
      parts.unshift({ text: e.v });
    }
    else if (e.t === "call" && e.name === "Localize") {
      const fb = win[i - 1], key = win[i - 2];
      if (!fb || fb.t !== "str" || !key || key.t !== "str") return null;
      parts.unshift({ text: fb.v });
      i -= 2;
    }
    else if (e.t === "call" && constGetters.has(e.name)) parts.unshift({ text: constGetters.get(e.name) });
    else if (e.t === "call" && JOINER(e)) { if (e.name === "Format") parts.format = true; }
    else if (e.t === "call" && NAME_GETTER.test(e.name)) parts.unshift({ text: names.name });
    else if (e.t === "call" && e.name === "get_InternalName") parts.unshift({ text: names.internalName });
    else if (e.t === "field" && NAME_FIELD.test(e.name)) parts.unshift({ text: names.name });
    else if ((e.t === "call" && RECEIVER.test(e.name)) || (e.t === "field" && RECEIVER_FIELD.test(e.name))) continue;
    // The start of the expression: the object it's set on (new CommandInfo, a delegate), or the
    // property set just before it (ShowInHelp = true, say).
    else if (e.t === "call" && (e.name === ".ctor" || e.name.startsWith("set_"))) break;
    else return null; // something else feeds into the text
  }
  if (!parts.length || parts.some((p) => p.text == null)) return null;
  if (parts.format) {
    const [fmt, ...args] = parts.map((p) => p.text);
    return fmt.replace(/\{(\d+)\}/g, (m, n) => (args[n] ?? m));
  }
  return parts.map((p) => p.text).join("");
}

const isCmd = (s) => /^\/[A-Za-z][A-Za-z0-9_-]{0,30}$/.test(s);

// The chat commands a plugin registers, as [{ cmd, help }]. Recognises:
// - Dalamud's ICommandManager.AddHandler("/cmd", new CommandInfo(...) { HelpMessage = "..." })
// - ECommons' EzCmd.Add("/cmd", handler, "help")
// - wrappers called Register / RegisterCommand / AddCommand taking ("/cmd", "help", ...)
// - [Command("/cmd")] [Aliases(...)] [HelpMessage("...")] attributes on handler methods
// help is null when it is built at run time from anything but text and the plugin's name (a
// translation lookup, a setting) rather than written as one literal.
// names: the plugin's display and internal name, used to rebuild help built from them.
export function findCommands(asm, names = { name: "{Name}", internalName: "{InternalName}" }) {
  const found = new Map();
  const WRAPPERS = new Set(["Register", "RegisterCommand", "AddCommand"]);
  // Set when AddHandler is called with a command that isn't a literal, i.e. the plugin keeps its
  // commands in a list and registers them in a loop.
  let fromList = false;
  const all = [];
  // Property getters per class, for the command-class style: { owner: { getterName: [strings] } }.
  const getters = new Map();
  // Getters that only return a literal, by name, for help built from them. A name used by several
  // getters returning different text is left out, since a call can't be matched to one of them.
  const constGetters = new Map(), clash = new Set();
  for (const m of asm.methods()) {
    const ev = events(asm, m.code);
    all.push(ev);
    if (m.name.startsWith("get_")) {
      if (!getters.has(m.owner)) getters.set(m.owner, {});
      const strs = ev.filter((x) => x.t === "str").map((x) => x.v), calls = ev.some((x) => x.t !== "str");
      getters.get(m.owner)[m.name.slice(4)] = { strs, calls };
      if (strs.length === 1 && !calls) {
        if (constGetters.has(m.name) && constGetters.get(m.name) !== strs[0]) clash.add(m.name);
        constGetters.set(m.name, strs[0]);
      }
    }
  }
  for (const n of clash) constGetters.delete(n);
  for (const ev of all) {
    let since = 0;
    for (let i = 0; i < ev.length; i++) {
      const e = ev[i];
      if (e.t !== "call") continue;
      const dalamud = e.name === "AddHandler";
      const ez = e.name === "Add" && e.cls === "EzCmd";
      const wrapper = WRAPPERS.has(e.name);
      if (!dalamud && !ez && !wrapper) continue;
      if (wrapper) {
        // Only when the command literal is in this call's own arguments, i.e. the last few events.
        const win = ev.slice(Math.max(since, i - 4), i);
        const k = win.map((x) => x.t === "str" && isCmd(x.v)).lastIndexOf(true);
        if (k < 0) continue;
        since = i + 1;
        const next = win[k + 1];
        const help = next && next.t === "str" && !isCmd(next.v) && next.v.trim() ? next.v : null;
        if (!found.has(win[k].v)) found.set(win[k].v, { cmd: win[k].v, help });
        continue;
      }
      const win = ev.slice(since, i);
      since = i + 1;
      // The command is the last "/name" literal before the call. That covers both
      // AddHandler("/cmd", new CommandInfo(...) { ... }) and building the CommandInfo first, then
      // AddHandler("/cmd", info), and skips "/name" strings used earlier in the method (paths).
      const cmdEv = win.filter((x) => x.t === "str" && isCmd(x.v)).pop();
      if (!cmdEv) { if (dalamud) fromList = true; continue; }
      let help = null;
      if (dalamud) {
        const k = win.findIndex((x) => x.t === "call" && x.name === "set_HelpMessage");
        if (k > 0 && win[k - 1].t === "str" && !isCmd(win[k - 1].v)) help = win[k - 1].v;
        else if (k > 0) help = composeHelp(win, k - 1, names, constGetters);
      } else {
        const last = win[win.length - 1];
        if (last && last.t === "str" && last !== cmdEv) help = last.v;
      }
      if (help !== null && !help.trim()) help = null;
      if (!found.has(cmdEv.v)) found.set(cmdEv.v, { cmd: cmdEv.v, help });
    }
  }

  // List style: new Registration("/cmd", "help sentence", ...) entries, registered in a loop. Only
  // used when the plugin calls AddHandler without a literal, so stray "/word" strings elsewhere
  // aren't mistaken for commands.
  if (fromList) {
    for (const ev of all) {
      for (let i = 0; i + 1 < ev.length; i++) {
        const a = ev[i], h = ev[i + 1];
        if (a.t !== "str" || !isCmd(a.v) || h.t !== "str" || isCmd(h.v) || !/^[A-Za-z].*\s/.test(h.v)) continue;
        if (!ev.slice(i + 2, i + 6).some((x) => x.t === "call" && x.name === ".ctor")) continue;
        if (!found.has(a.v)) found.set(a.v, { cmd: a.v, help: h.v });
      }
    }
  }

  // Command-class style: a class per command whose getters return its name, aliases and help, e.g.
  // `CommandCode => "/petname"`, `Aliases => ["/pname"]`, `Description => "..."`. Only when AddHandler
  // got a non-literal command, as for the list style. A class with several command getters (one
  // settings class listing all the names) gets no help text, since it can't be matched up.
  if (fromList) {
    const NAME = /^(Command|CommandCode|CommandName|MainCommand|Name|[A-Za-z]*CommandName)$/;
    const HELP = /^(Description|HelpMessage|HelpText|Help|Summary)$/;
    for (const g of getters.values()) {
      const names = Object.entries(g).filter(([k, v]) => NAME.test(k) && v.strs.length === 1 && isCmd(v.strs[0]) && !v.calls);
      if (!names.length) continue;
      const helpEntry = Object.entries(g).find(([k, v]) => HELP.test(k) && v.strs.length === 1 && !isCmd(v.strs[0]) && /\s/.test(v.strs[0]) && !v.calls);
      const aliases = (Object.entries(g).find(([k]) => k === "Aliases")?.[1].strs || []).filter(isCmd);
      for (const [, v] of names) {
        const cmd = v.strs[0];
        if (found.has(cmd)) continue;
        const one = names.length === 1;
        const label = one && aliases.length ? `${cmd} (or ${aliases.join(", ")})` : cmd;
        found.set(cmd, { cmd: label, help: one && helpEntry ? helpEntry[1].strs[0] : null });
      }
    }
  }

  // Attribute style: group the attributes on each method, then read Command / Aliases /
  // HelpMessage off them. Attributes marked DoNotShowInHelp are left out, as Dalamud's own list does.
  const byParent = new Map();
  for (const a of asm.attributes()) {
    const name = a.type.replace(/Attribute$/, "");
    if (!["Command", "Aliases", "HelpMessage", "DoNotShowInHelp"].includes(name)) continue;
    if (!byParent.has(a.parent)) byParent.set(a.parent, {});
    byParent.get(a.parent)[name] = attributeStrings(a.value);
  }
  for (const g of byParent.values()) {
    const cmd = g.Command?.[0];
    if (!cmd || !isCmd(cmd) || g.DoNotShowInHelp) continue;
    const aliases = (g.Aliases || []).filter(isCmd);
    const help = g.HelpMessage?.[0]?.trim() || null;
    const label = aliases.length ? `${cmd} (or ${aliases.join(", ")})` : cmd;
    if (!found.has(cmd)) found.set(cmd, { cmd: label, help });
  }
  return [...found.values()];
}
