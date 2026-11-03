// Shared by msq-tracker.html and the MSQ planner in get-ready-for-evercold.html.
// One place for the saved progress, a player's route through msq.json, and the
// #/<expansion>/<quest> link format, so the two pages can never disagree about either.
//
// State is { city, pos }: city 0 Gridania, 1 Limsa Lominsa, 2 Ul'dah, and pos the index of the
// quest the player is on in their route (route.length means all done). It is saved in
// localStorage under KEY, so every page on xivkit.com sees the same progress.
(function (root) {
  "use strict";
  var KEY = "xivkit-msq-v1";
  var CITY_SLUGS = ["gridania", "limsa-lominsa", "uldah"];
  var DONE_SLUG = "all-done";

  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
  function slug(s) {
    return String(s).toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }
  // Game icons come from XIVAPI: ui/icon/<id rounded down to thousands>/<id>.tex, 6 digits each.
  function iconUrl(id, hr) {
    var pad = function (n) { return String(n).padStart(6, "0"); };
    return "https://beta.xivapi.com/api/1/asset?path=ui/icon/" + pad(Math.floor(id / 1000) * 1000) + "/" + pad(id) + (hr ? "_hr1" : "") + ".tex&format=png";
  }
  var MARKER = 61412; // the game's Main Scenario Quest journal icon

  function lowestCity(mask) { return mask & 1 ? 0 : mask & 2 ? 1 : 2; }

  // A city's route: every quest whose city bitmask includes it, in order. segStart[g] is where
  // segment g begins in the route, with one extra entry for the end.
  function routeFor(data, city) {
    var route = data.q.filter(function (x) { return (((x.c == null ? 7 : x.c) >> city) & 1) === 1; });
    var segStart = data.seg.map(function () { return -1; });
    route.forEach(function (x, i) { if (segStart[x.g] < 0) segStart[x.g] = i; });
    segStart.push(route.length);
    for (var g = segStart.length - 2; g >= 0; g--) if (segStart[g] < 0) segStart[g] = segStart[g + 1];
    return { route: route, segStart: segStart };
  }

  // ---- link format: #/<expansion>/<quest> (city is implied, see resolve) ----
  function hashFor(data, route, s) {
    var q = s.pos >= route.length ? null : route[s.pos];
    return "#/" + (q ? slug(data.seg[q.g].era) + "/" + q.s : "complete/" + DONE_SLUG);
  }
  // Reads a location.hash. An older #/<city>/<era>/<quest> form is still understood.
  function parseHash(hash) {
    var m = /^#\/(?:([^/]+)\/)?([^/]+)\/([^/?]+)(?:\?(.*))?$/.exec(hash || "");
    if (!m) return null;
    var city = null;
    if (m[1]) { city = CITY_SLUGS.indexOf(m[1]); if (city < 0) return { error: true }; }
    return { city: city, slug: m[3] };
  }
  // Turns a parsed link into a state plus the route it lives on. The city is not in the link: a
  // quest only some cities do names its city, anything later opens on the viewer's own saved
  // city (Gridania if they have none). A slug that is not in the data starts at the beginning
  // and says so with missing: true.
  function resolve(data, h, savedCity) {
    if (!h || h.error) return null;
    var city = h.city;
    if (city == null) {
      var hit = null;
      for (var k = 0; k < data.q.length; k++) if (data.q[k].s === h.slug) { hit = data.q[k]; break; }
      city = hit && hit.c != null ? lowestCity(hit.c) : (savedCity != null ? savedCity : 0);
    }
    var r = routeFor(data, city), out = { city: city, pos: 0, route: r.route, segStart: r.segStart };
    if (h.slug === DONE_SLUG) { out.pos = r.route.length; return out; }
    for (var i = 0; i < r.route.length; i++) if (r.route[i].s === h.slug) { out.pos = i; return out; }
    out.missing = true;
    return out;
  }

  // ---- finding and jumping to a quest ----
  // Quests whose title contains the term (at least 2 characters), across every city's route.
  function search(data, term, limit) {
    term = String(term || "").trim().toLowerCase();
    var hits = [];
    if (term.length < 2) return hits;
    for (var i = 0; i < data.q.length && hits.length < (limit || 8); i++) if (data.q[i].t.toLowerCase().indexOf(term) >= 0) hits.push(data.q[i]);
    return hits;
  }
  // Puts the player on a quest. One only some cities do switches them to one of those cities.
  // Returns { city, pos, route, segStart }, or null if the quest is not in the data.
  function jumpTo(data, state, hit) {
    var city = state.city;
    if (hit.c != null && ((hit.c >> city) & 1) !== 1) city = lowestCity(hit.c);
    var r = routeFor(data, city);
    for (var i = 0; i < r.route.length; i++) if (r.route[i].s === hit.s) return { city: city, pos: i, route: r.route, segStart: r.segStart };
    return null;
  }

  // ---- saved progress ----
  function loadState() {
    try {
      var s = JSON.parse(localStorage.getItem(KEY) || "null");
      if (s && typeof s.pos === "number") return { city: clamp(s.city | 0, 0, 2), pos: Math.max(0, s.pos | 0) };
    } catch (e) {}
    return null;
  }
  function saveState(state) {
    try { localStorage.setItem(KEY, JSON.stringify({ city: state.city, pos: state.pos })); } catch (e) {}
  }

  var dataPromise = null;
  function loadData(url) {
    if (!dataPromise) {
      dataPromise = fetch(url || "msq.json").then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
      dataPromise.catch(function () { dataPromise = null; });
    }
    return dataPromise;
  }

  // The numbers both pages show, for a state on its route.
  function summary(route, state) {
    var total = route.length, done = Math.min(state.pos, total);
    return { total: total, done: done, left: total - done, pct: total ? (done >= total ? 100 : Math.floor(done * 100 / total)) : 0, quest: route[state.pos] || null };
  }

  root.XIVKitMSQ = {
    KEY: KEY, CITY_SLUGS: CITY_SLUGS, DONE_SLUG: DONE_SLUG, MARKER: MARKER,
    clamp: clamp, slug: slug, iconUrl: iconUrl, lowestCity: lowestCity,
    routeFor: routeFor, search: search, jumpTo: jumpTo, hashFor: hashFor, parseHash: parseHash, resolve: resolve,
    loadState: loadState, saveState: saveState, loadData: loadData, summary: summary
  };
})(window);
