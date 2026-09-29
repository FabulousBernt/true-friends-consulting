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
other. The link checker lives in the archived `true-friends-website` repo:

```sh
node ../true-friends-website/tools/check-links.js .
```

## History

Split out of `true-friends-website` on 2026-09-29, which remains the archive for
everything before that date.
