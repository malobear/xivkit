(function () {
  var SUPPORTED = ['en', 'ja', 'de', 'fr'];
  var NAMES = { en: 'EN', ja: '日本語', de: 'DE', fr: 'FR' };

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
    var params = new URLSearchParams(location.search);
    if (lang === 'en') { params.delete('lang'); } else { params.set('lang', lang); }
    var qs = params.toString();
    history.replaceState(null, '', location.pathname + (qs ? '?' + qs : ''));
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
      btn.addEventListener('click', function () { i18next.changeLanguage(code); });
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
