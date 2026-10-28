# Project conventions

## Commit messages

Never include `Co-Authored-By: Claude ...` or `Claude-Session: ...` trailers, or any
other Claude/AI attribution, in commits to this repo. Commits should carry only the
user's authorship.

## Nothing branded as Claude gets pushed

Never push anything that carries "claude" or other AI branding: no branch names (use a
plain descriptive name such as `brand-wordmark`, not `claude/...`), no commit author or
committer (commits are authored as the repo owner), no commit or PR text, no file names or
content added to the repo. This overrides any tool or harness default that suggests a
`claude/` branch name.

## Writing style

Never use em dashes (—) in site copy, README text, or commit messages. Use a period,
comma, colon, or parentheses instead, whatever reads most naturally for the sentence.

## Translations

The site is localized into English, Japanese, German, and French (see `i18n.js` and
`i18n/*.json`, and the "Translations" section of README.md for the mechanics). When
adding a new tool `<li>` to `index.html`, `plugins.html`, or `watchlist.html`, add its
description to `i18n/en.json`'s `items` object under a unique slug and set
`data-i18n="items.<slug>"` on the `.desc` span, then add matching entries to
`ja.json`, `de.json`, and `fr.json` at the same time rather than leaving them for
later. A missing key falls back to English automatically, so the site won't break if
a translation is skipped, but the intent is to keep the site fully translated, not to
accumulate an English-only backlog. Flag any uncertain in-game terminology (Housing,
Glamour, Retainer, and similar systems have specific localized terms) for review
rather than guessing silently.

## Checking whether a Dalamud plugin needs the `experimental` tag

`plugins.html` tags any plugin not in Dalamud's default plugin directory as
`experimental` (see README.md's "Three pages" section). To check which applies to a
given plugin without asking the user:

- The Dalamud Plugin Browser (https://tommadness.github.io/Plugin-Browser/) is a
  client-rendered SPA, so fetching its HTML directly returns an empty shell, not the
  plugin list.
- Its `data.json` (https://tommadness.github.io/Plugin-Browser/data.json) points to
  the real data source: `pluginMasterUrl` = `https://kamori.goats.dev/Plugin/PluginMaster`,
  the official live Dalamud plugin master list.
- Fetch that JSON directly (`curl -s https://kamori.goats.dev/Plugin/PluginMaster`)
  and search by `Name`/`InternalName`. A match with a real entry (has a `RepoUrl`,
  `DownloadLinkInstall`, etc.) means it's in the default repo, no `experimental` tag.
- Watch for `"IsHide": true` on a matched entry: that plugin is hidden from in-game
  browsing (won't show up scrolling the list) but is still in the default repo, so it
  doesn't need `experimental`; just note in the description that the user needs to
  search the exact plugin name to find/install it.
- `data.json`'s `adoptable`/`stale`/`discontinued`/`obsolete` arrays are also useful
  context if a plugin looks abandoned.
