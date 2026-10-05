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
css/base.css                     tokens, reset, nav, hero, section shell — all pages
css/consulting.css               button, form, modal, consultant card — index.html only
css/case.css                     case hero, figures, lists — the six case studies only
js/site.js                       language, mobile nav, modal, forms
js/lang-boot.js                  blocking script that holds the first paint for Swedish
js/translations/                 EN + SV strings, one file per page
reference-cases/                 template plus one file per case, under johnny-vigersten/
img/                             heroes at 960/1440/1920, logos, favicon, share card
tools/                           check-links.js and i18n.js
```

`css/base.css` is the only stylesheet every page loads. The other two are
page-specific, so the seven case pages never download the contact form or the
consultant card, and `index.html` never downloads the case-study figures.

## Adding a reference case

Copy `reference-cases/template.html` to `reference-cases/<consultant>/<slug>.html`
and work through it top to bottom — it is marked with the spots that need a real
value. Then:

1. Put the images in `img/reference-cases/<consultant>/<slug>/`, and give each
   hero photo three widths: `sips -Z <w> -s format png <src>` then
   `cwebp -q 78`. The hero `<img>` names 960/1440/1920 in its `srcset`.
2. Copy a sibling case's translation file to
   `js/translations/<consultant>/<slug>.js` and add `refCases.<slug>.<section>.<key>`
   entries under both `en` and `sv`.
3. Load it at the bottom of the page, after `common.js`.
4. Fill in `canonical`, `og:url` and the `<title>`/`<meta description>`.

Content patterns live inside a `.section__body`: paragraphs, `.lede` for a
opening line, `figure.section__figure` with a `figcaption`, two of those
wrapped in `div.section__figure-row`, `p.section__note` for a footnote, and
`data-i18n-html` when a string needs an inline link.

## Checking your work

Both tools are plain Node, no dependencies:

```sh
node tools/check-links.js .
node tools/i18n.js check
```

`check-links.js` resolves every local `href`/`src`, every `srcset` candidate,
every anchor target, every path-like string in `js/translations/`, and every
`url()` in the CSS. It then sweeps for files nothing points at, so an image
dropped in and never linked, or left behind by a rename, shows up as a
candidate rather than as dead weight nobody notices.

`i18n.js` checks that every `data-i18n*` key resolves in both languages, and
that the inline fallback text still matches the English string — the text the
browser paints before the translation pass runs, and what it keeps when
scripting is off. Run `node tools/i18n.js sync` to rewrite the fallbacks from
the dictionary after editing a translation.

## Deploying

GitHub Pages, served from the `main` branch via the CNAME. The site is plain
files — `css/`, `js/`, `img/` and the HTML are the deployable tree. Keep
`robots.txt`, `sitemap.xml` and `CNAME` at the root.

## History

Split out of `true-friends-website` on 2026-09-29, which remains the archive for
everything before that date.