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
  };
  const start = {};
  for (let i = 0; i <= 0x0a; i++) { start[i] = q; q += rows[i] * sizes[i]; }
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

  // Every method body, as { name, code } (the raw IL bytes).
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
      yield { name: methodName(i), code: b.subarray(code, code + size) };
    }
  }

  return { us, memberRef, methodName, methods };
}

// The string loads and method calls in a method body, in order. This scans for the byte patterns
// of ldstr (0x72 + string token) and call / callvirt / newobj (0x28 / 0x6F / 0x73 + MemberRef or
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
    }
  }
  return out;
}

const isCmd = (s) => /^\/[A-Za-z][A-Za-z0-9_-]{0,30}$/.test(s);

// The chat commands a plugin registers, as [{ cmd, help }]. Recognises Dalamud's
// ICommandManager.AddHandler("/cmd", new CommandInfo(...) { HelpMessage = "..." }) and ECommons'
// EzCmd.Add("/cmd", handler, "help"). help is null when it is built at run time (string
// concatenation, a translation lookup) rather than written as one literal.
export function findCommands(asm) {
  const found = new Map();
  for (const m of asm.methods()) {
    const ev = events(asm, m.code);
    let since = 0;
    for (let i = 0; i < ev.length; i++) {
      const e = ev[i];
      if (e.t !== "call") continue;
      const dalamud = e.name === "AddHandler";
      const ez = e.name === "Add" && e.cls === "EzCmd";
      if (!dalamud && !ez) continue;
      const win = ev.slice(since, i);
      since = i + 1;
      // The command is the last "/name" literal before the call. That covers both
      // AddHandler("/cmd", new CommandInfo(...) { ... }) and building the CommandInfo first, then
      // AddHandler("/cmd", info), and skips "/name" strings used earlier in the method (paths).
      const cmdEv = win.filter((x) => x.t === "str" && isCmd(x.v)).pop();
      if (!cmdEv) continue;
      let help = null;
      if (dalamud) {
        const k = win.findIndex((x) => x.t === "call" && x.name === "set_HelpMessage");
        if (k > 0 && win[k - 1].t === "str" && !isCmd(win[k - 1].v)) help = win[k - 1].v;
      } else {
        const last = win[win.length - 1];
        if (last && last.t === "str" && last !== cmdEv) help = last.v;
      }
      if (help !== null && !help.trim()) help = null;
      if (!found.has(cmdEv.v)) found.set(cmdEv.v, { cmd: cmdEv.v, help });
    }
  }
  return [...found.values()];
}
