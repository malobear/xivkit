// Search, filters and sort for the plugin directory. Every plugin is already in the page
// as plain HTML (so search engines see all of it); this only hides and reorders cards.
// The current view lives in the URL (?q=, ?sort=, ?recent=1, ...) so it can be shared.
(function () {
  var input = document.getElementById("q");
  var lists = document.querySelectorAll("[data-filter-list]");
  if (!input || !lists.length) return;
  var main = lists[lists.length - 1];
  var $ = function (id) { return document.getElementById(id); };
  var sort = $("sort"), fRecent = $("f-recent"), fNoTesting = $("f-notesting"), fPicks = $("f-picks"), fAll = $("f-all");
  var empty = $("empty"), line = $("result-line"), badge = $("filter-count"), panel = document.querySelector(".filter-panel");
  var DAY = 86400, now = Date.now() / 1000;
  var SORT_TEXT = { installs: "most installed first", updated: "most recently updated first", name: "by name" };

  // Plugins that can't be installed today are off by default; say how many there are.
  var offCount = main.querySelectorAll(".plug:not([data-status=ok])").length;
  if ($("off-count")) $("off-count").textContent = offCount;
  if (!offCount && fAll) fAll.closest("label").hidden = true;
  if (fPicks && !main.querySelector(".plug[data-pick]")) fPicks.closest("label").hidden = true;

  var cards = Array.prototype.slice.call(main.querySelectorAll(".plug"));
  var byKey = {
    installs: function (a, b) { return b.dataset.installs - a.dataset.installs; },
    updated: function (a, b) { return b.dataset.updated - a.dataset.updated; },
    name: function (a, b) { return a.dataset.name.localeCompare(b.dataset.name); },
  };

  function apply(save) {
    var q = input.value.trim().toLowerCase();
    var key = sort && byKey[sort.value] ? sort.value : "installs";
    var recent = fRecent && fRecent.checked, noTesting = fNoTesting && fNoTesting.checked;
    var picks = fPicks && fPicks.checked, all = fAll && fAll.checked;
    var shown = 0;
    lists.forEach(function (list) {
      list.querySelectorAll(".plug").forEach(function (li) {
        var d = li.dataset;
        var hit = (!q || d.q.indexOf(q) !== -1)
          && (all || d.status === "ok")
          && (!recent || now - d.updated < 90 * DAY)
          && (!noTesting || !("testing" in d))
          && (!picks || "pick" in d);
        li.hidden = !hit;
        if (list === main && hit) shown++;
      });
    });
    cards.slice().sort(byKey[key]).forEach(function (li) { main.appendChild(li); });

    if (line) line.textContent = "Showing " + shown + " of " + cards.length + " plugins, " + SORT_TEXT[key] + ".";
    if (empty) empty.hidden = shown !== 0;
    var active = (key !== "installs") + recent + noTesting + picks + all;
    if (badge) { badge.textContent = active; badge.hidden = !active; }

    if (save === false) return;
    var url = new URL(location.href), p = url.searchParams;
    var set = function (k, on, v) { if (on) p.set(k, v || "1"); else p.delete(k); };
    set("q", q, q); set("sort", key !== "installs", key);
    set("recent", recent); set("notesting", noTesting); set("picks", picks); set("all", all);
    history.replaceState(null, "", url);
  }

  // Restore a shared view from the URL.
  var p = new URLSearchParams(location.search);
  if (p.get("q")) input.value = p.get("q");
  if (sort && byKey[p.get("sort")]) sort.value = p.get("sort");
  if (fRecent) fRecent.checked = p.has("recent");
  if (fNoTesting) fNoTesting.checked = p.has("notesting");
  if (fPicks) fPicks.checked = p.has("picks");
  if (fAll) fAll.checked = p.has("all");
  apply(false);

  input.addEventListener("input", apply);
  [sort, fRecent, fNoTesting, fPicks, fAll].forEach(function (el) { if (el) el.addEventListener("change", apply); });

  // On phones the panel starts folded, unless the link already carries filters.
  // Desktop hides the panel's toggle, so it must be open there.
  var narrow = window.matchMedia("(max-width:760px)");
  if (panel && narrow.matches && !(badge && !badge.hidden)) panel.open = false;
  if (panel) narrow.addEventListener("change", function () { if (!narrow.matches) panel.open = true; });
})();

// On phones the category chips are one sideways-scrolling row; bring the current one into view.
(function () {
  var row = document.querySelector(".cats"), cur = row && row.querySelector("[aria-current=page]");
  if (row && cur && row.scrollWidth > row.clientWidth) row.scrollLeft = cur.offsetLeft - row.offsetLeft - (row.clientWidth - cur.offsetWidth) / 2;
})();
