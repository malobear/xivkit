// Search, filters and sort for the plugin directory. Every plugin is already in the page
// as plain HTML (so search engines see all of it); this only hides and reorders cards.
// The current view lives in the URL (?q=, ?sort=, ?recent=1, ...) so it can be shared.
(function () {
  var input = document.getElementById("q");
  var lists = document.querySelectorAll("[data-filter-list]");
  if (!input || !lists.length) return;
  var main = lists[lists.length - 1];
  var $ = function (id) { return document.getElementById(id); };
  var sort = $("sort"), fRecent = $("f-recent"), fTesting = $("f-testing"), fAll = $("f-all"), fThird = $("f-third");
  var empty = $("empty"), line = $("result-line"), badge = $("filter-count"), panel = document.querySelector(".filter-panel");
  var DAY = 86400, now = Date.now() / 1000;
  var SORT_TEXT = { installs: "most installed first", updated: "most recently updated first", name: "by name" };

  // Plugins that need testing builds, and ones that can't be installed today, are off by
  // default; say how many of each there are, and drop a toggle with nothing behind it.
  var offCount = main.querySelectorAll(".plug:not([data-status=ok])").length;
  var testCount = main.querySelectorAll(".plug[data-testing]").length;
  if ($("off-count")) $("off-count").textContent = offCount;
  if ($("test-count")) $("test-count").textContent = testCount;
  var thirdCount = main.querySelectorAll(".plug[data-third]").length;
  if ($("third-count")) $("third-count").textContent = thirdCount;
  if (!thirdCount && fThird) fThird.closest("label").hidden = true;
  if (!offCount && fAll) fAll.closest("label").hidden = true;
  if (!testCount && fTesting) fTesting.closest("label").hidden = true;

  var cards = Array.prototype.slice.call(main.querySelectorAll(".plug"));
  var byKey = {
    installs: function (a, b) { return b.dataset.installs - a.dataset.installs; },
    updated: function (a, b) { return b.dataset.updated - a.dataset.updated; },
    name: function (a, b) { return a.dataset.name.localeCompare(b.dataset.name); },
  };

  function apply(save) {
    var q = input.value.trim().toLowerCase();
    var key = sort && byKey[sort.value] ? sort.value : "installs";
    var recent = fRecent && fRecent.checked, testing = fTesting && fTesting.checked;
    var all = fAll && fAll.checked, third = fThird && fThird.checked;
    var shown = 0;
    lists.forEach(function (list) {
      list.querySelectorAll(".plug").forEach(function (li) {
        var d = li.dataset;
        var hit = (!q || d.q.indexOf(q) !== -1)
          && (all || d.status === "ok")
          && (!recent || now - d.updated < 90 * DAY)
          && (testing || !("testing" in d))
          && (third || !("third" in d));
        li.hidden = !hit;
        if (list === main && hit) shown++;
      });
    });
    cards.slice().sort(byKey[key]).forEach(function (li) { main.appendChild(li); });

    if (line) line.textContent = "Showing " + shown + " of " + cards.length + " plugins, " + SORT_TEXT[key] + ".";
    if (empty) empty.hidden = shown !== 0;
    var lg = document.querySelector(".legend"); if (lg) lg.hidden = !third || !thirdCount;
    // Third-party is on by default, so turning it off is what counts as a filter.
    var active = recent + testing + all + !third;
    if (badge) { badge.textContent = active; badge.hidden = !active; }

    if (save === false) return;
    var url = new URL(location.href), p = url.searchParams;
    var set = function (k, on, v) { if (on) p.set(k, v || "1"); else p.delete(k); };
    set("q", q, q); set("sort", key !== "installs", key);
    set("recent", recent); set("testing", testing); set("all", all); set("third", !third, "0");
    history.replaceState(null, "", url);
  }

  // Restore a shared view from the URL.
  var p = new URLSearchParams(location.search);
  if (p.get("q")) input.value = p.get("q");
  if (sort && byKey[p.get("sort")]) sort.value = p.get("sort");
  if (fRecent) fRecent.checked = p.has("recent");
  if (fTesting) fTesting.checked = p.has("testing");
  if (fAll) fAll.checked = p.has("all");
  // On unless the link says third=0 (older links with third=1 still mean on).
  if (fThird) fThird.checked = p.get("third") !== "0";
  apply(false);

  input.addEventListener("input", apply);
  [sort, fRecent, fTesting, fAll, fThird].forEach(function (el) { if (el) el.addEventListener("change", apply); });

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

// Screenshot viewer: thumbnails link to the full image (so they work without script);
// with script, they open in a full-size viewer with previous/next, arrow keys and swipe.
(function () {
  var dialog = document.querySelector(".viewer");
  var links = Array.prototype.slice.call(document.querySelectorAll(".shots .shot"));
  if (!dialog || !links.length || typeof dialog.showModal !== "function") return;
  var img = dialog.querySelector("figure img"), cap = dialog.querySelector("figcaption");
  var prev = dialog.querySelector(".viewer-prev"), next = dialog.querySelector(".viewer-next");
  var at = 0, opener = null;
  prev.hidden = next.hidden = links.length < 2;

  function show(i) {
    at = (i + links.length) % links.length;
    img.src = links[at].href;
    img.alt = links[at].querySelector("img").alt;
    cap.textContent = links.length > 1 ? (at + 1) + " of " + links.length : "";
  }
  links.forEach(function (a, i) {
    a.addEventListener("click", function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return; // let new-tab clicks through
      e.preventDefault(); opener = a; show(i); dialog.showModal();
    });
  });
  prev.addEventListener("click", function () { show(at - 1); });
  next.addEventListener("click", function () { show(at + 1); });
  dialog.querySelector(".viewer-close").addEventListener("click", function () { dialog.close(); });
  // A click on the dark area around the image closes it.
  dialog.addEventListener("click", function (e) { if (e.target === dialog || e.target.tagName === "FIGURE") dialog.close(); });
  dialog.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") show(at - 1);
    else if (e.key === "ArrowRight") show(at + 1);
  });
  var x0 = null;
  dialog.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  dialog.addEventListener("touchend", function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 50 && links.length > 1) show(dx < 0 ? at + 1 : at - 1);
  });
  dialog.addEventListener("close", function () { img.removeAttribute("src"); if (opener) opener.focus(); });
})();

// Copy buttons (the custom repository address on third-party plugin pages). The buttons are
// hidden in the HTML and only shown here, since they need script to work.
(function () {
  document.querySelectorAll(".copy-btn").forEach(function (btn) {
    var label = btn.querySelector(".copy-label"), text = btn.dataset.copy, timer;
    btn.hidden = false;
    btn.addEventListener("click", function () {
      var done = function (ok) {
        label.textContent = ok ? "Copied" : "Press Ctrl+C";
        btn.classList.toggle("copied", ok);
        clearTimeout(timer);
        timer = setTimeout(function () { label.textContent = "Copy address"; btn.classList.remove("copied"); }, 2000);
      };
      var fallback = function () {
        var code = btn.closest(".copybox").querySelector("code"), r = document.createRange();
        r.selectNodeContents(code); var sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
        var ok = false; try { ok = document.execCommand("copy"); } catch (e) {}
        done(ok);
      };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(function () { done(true); }, fallback);
      else fallback();
    });
  });
})();
