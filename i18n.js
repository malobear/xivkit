(function () {
  var SUPPORTED = ['en', 'ja', 'de', 'fr'];
  var NAMES = { en: 'EN', ja: '日本語', de: 'DE', fr: 'FR' };

  // Pages pre-rendered by scripts/i18n-build.mjs live in ja/, de/ and fr/ and carry
  // data-static-lang. Every page that has copies lists them as hreflang alternates.
  var STATIC_LANG = document.documentElement.getAttribute('data-static-lang');
  var PAGE_LANG = STATIC_LANG || 'en';
  var ALTERNATES = {};
  document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(function (link) {
    var code = link.getAttribute('hreflang');
    // Keep the path but stay on this host, so local previews don't jump to xivkit.com.
    if (SUPPORTED.indexOf(code) !== -1) ALTERNATES[code] = location.origin + new URL(link.href).pathname;
  });

  function stored() { try { return localStorage.getItem('lang'); } catch (e) { return null; } }
  function store(lang) { try { localStorage.setItem('lang', lang); } catch (e) {} }

  // Go to this page's copy in another language, keeping any other query (?q=) and the hash.
  function goTo(lang, replace) {
    var params = new URLSearchParams(location.search);
    params.delete('lang');
    var target = ALTERNATES[lang];
    if (!target) { target = ALTERNATES.en || location.pathname; params.set('lang', lang); }
    var qs = params.toString();
    store(lang);
    var url = target + (qs ? '?' + qs : '') + location.hash;
    if (replace) { location.replace(url); } else { location.href = url; }
  }

  // An English page asked for in a language it has a copy in (an old ?lang= link, or a
  // language picked earlier) forwards to that copy. Crawlers send neither, so they stay.
  if (!STATIC_LANG) {
    var wanted = new URLSearchParams(location.search).get('lang') || stored();
    if (wanted && wanted !== 'en' && ALTERNATES[wanted]) { goTo(wanted, true); return; }
  }

  if (STATIC_LANG) store(STATIC_LANG);

  // On a pre-rendered page <base href="../"> points relative links at the site root, so
  // in-page anchors that scripts add later (href="#...") need to stay on this page.
  if (STATIC_LANG) {
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      location.hash = a.getAttribute('href');
    });
  }

  function applyRich(el, translated) {
    var frag = document.createDocumentFragment();
    var re = /\{(\w+)\}/g;
    var last = 0;
    var m;
    while ((m = re.exec(translated))) {
      if (m.index > last) frag.appendChild(document.createTextNode(translated.slice(last, m.index)));
      var token = el.querySelector('[data-token="' + m[1] + '"]');
      if (token) {
        var tKey = token.getAttribute('data-i18n');
        if (tKey) token.textContent = i18next.t(tKey);
        frag.appendChild(token);
      }
      last = re.lastIndex;
    }
    if (last < translated.length) frag.appendChild(document.createTextNode(translated.slice(last)));
    el.textContent = '';
    el.appendChild(frag);
  }

  function applyAll() {
    document.documentElement.lang = i18next.resolvedLanguage;

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      if (el.closest('[data-i18n-rich]')) return;
      var key = el.getAttribute('data-i18n');
      var value = i18next.t(key);
      if (el.hasAttribute('data-i18n-placeholder')) {
        el.placeholder = value;
      } else if (el.hasAttribute('data-i18n-title')) {
        el.title = value;
        if (el.hasAttribute('aria-label')) el.setAttribute('aria-label', value);
      } else {
        el.textContent = value;
      }
    });

    document.querySelectorAll('[data-i18n-rich]').forEach(function (el) {
      applyRich(el, i18next.t(el.getAttribute('data-i18n-rich')));
    });

    // "Updated for patch X · date" lines on guide pages: template per language, date per locale.
    document.querySelectorAll('[data-updated]').forEach(function (el) {
      var out = el.querySelector('.gu-text');
      if (!out) return;
      var lang = i18next.resolvedLanguage;
      var date = new Date(el.getAttribute('data-updated') + 'T00:00:00Z');
      var shown = new Intl.DateTimeFormat(lang, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(date);
      var patch = el.getAttribute('data-patch');
      out.textContent = i18next.t(patch ? 'shared.updated.withPatch' : 'shared.updated.dateOnly', {
        patch: patch, date: shown, interpolation: { escapeValue: false }
      });
    });

    document.querySelectorAll('#tag-bar .tag-pill').forEach(function (pill) {
      pill.textContent = i18next.t('tags.' + pill.dataset.tagKey);
    });
    document.querySelectorAll('li .tags button').forEach(function (btn) {
      btn.textContent = i18next.t('tags.' + btn.dataset.tagKey);
    });

    document.querySelectorAll('#lang-bar button').forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.lang === i18next.resolvedLanguage);
    });
  }

  function syncUrl(lang) {
    if (STATIC_LANG) return;
    var params = new URLSearchParams(location.search);
    if (lang === 'en') { params.delete('lang'); } else { params.set('lang', lang); }
    var qs = params.toString();
    history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
  }

  function buildLangBar() {
    var bar = document.getElementById('lang-bar');
    if (!bar) return;
    SUPPORTED.forEach(function (code) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tag-pill lang-pill';
      btn.dataset.lang = code;
      btn.textContent = NAMES[code];
      btn.addEventListener('click', function () {
        // Pages with language copies switch by URL; the rest translate in place as before.
        if (code !== PAGE_LANG && (ALTERNATES[code] || STATIC_LANG)) { goTo(code); return; }
        if (code === PAGE_LANG && STATIC_LANG) return;
        i18next.changeLanguage(code);
      });
      bar.appendChild(btn);
    });
  }

  // Build the language-bar buttons before init() so the first 'languageChanged'
  // event (fired internally during init's language resolution) has buttons to mark active.
  buildLangBar();

  i18next.on('languageChanged', function () {
    applyAll();
    syncUrl(i18next.resolvedLanguage);
  });

  i18next
    .use(i18nextHttpBackend)
    .use(i18nextBrowserLanguageDetector)
    .init({
      lng: STATIC_LANG || undefined,
      fallbackLng: 'en',
      supportedLngs: SUPPORTED,
      load: 'languageOnly',
      backend: { loadPath: 'i18n/{{lng}}.json' },
      detection: {
        order: ['querystring', 'localStorage', 'navigator'],
        lookupQuerystring: 'lang',
        lookupLocalStorage: 'lang',
        caches: ['localStorage']
      }
    }, function (err) {
      if (err) { console.error(err); return; }
      document.dispatchEvent(new CustomEvent('i18nready'));
    });
})();
