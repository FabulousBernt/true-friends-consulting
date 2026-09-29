# True Friends Consulting

`consulting.truefriends.se`

Testing, UX/UI design, web production, software development and cybersecurity.
A hand-written static site: no build step, no package manager, no framework.

## Running it

```sh
python3 -m http.server 8801
```

## Structure

```
index.html                       the site
reference-cases/johnny-vigersten/ six case studies
cv/                              CVs, linked from the consultant card
js/translations/                 EN + SV strings, one file per page
brand/README.md                  what is shared with the other two sites
```

## Checking your work

`tools/i18n.js` keeps the pages and the translation files honest about each
other. `tools/check-links.js` resolves every local `href` and `src`, every
anchor target, and every path-like string in `js/translations/`:

```sh
node tools/check-links.js .
```

It cannot see paths built in JavaScript — that is how the 1996 gallery was
missed once already — so a page whose images are injected at runtime still
needs looking at.

## History

Split out of `true-friends-website` on 2026-09-29, which remains the archive for
everything before that date.
