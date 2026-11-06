// Search box for the plugin directory. Every plugin is already in the page as plain
// HTML (so search engines see it); this only hides the ones that do not match.
(function () {
  var input = document.getElementById("q");
  var lists = document.querySelectorAll("[data-filter-list]");
  if (!input || !lists.length) return;
  var counter = document.getElementById("count");
  var empty = document.getElementById("empty");
  var all = lists[lists.length - 1];

  function apply() {
    var q = input.value.trim().toLowerCase();
    var shown = 0;
    lists.forEach(function (list) {
      list.querySelectorAll(".plug").forEach(function (li) {
        var hit = !q || li.dataset.q.indexOf(q) !== -1;
        li.hidden = !hit;
        if (list === all && hit) shown++;
      });
    });
    if (counter) counter.textContent = shown;
    if (empty) empty.hidden = shown !== 0;
    var url = new URL(location.href);
    if (q) url.searchParams.set("q", q); else url.searchParams.delete("q");
    history.replaceState(null, "", url);
  }

  input.addEventListener("input", apply);
  var start = new URLSearchParams(location.search).get("q");
  if (start) { input.value = start; apply(); }
})();

// On phones the category chips are one sideways-scrolling row; bring the current one into view.
(function () {
  var row = document.querySelector(".cats"), cur = row && row.querySelector("[aria-current=page]");
  if (row && cur && row.scrollWidth > row.clientWidth) row.scrollLeft = cur.offsetLeft - row.offsetLeft - (row.clientWidth - cur.offsetWidth) / 2;
})();
