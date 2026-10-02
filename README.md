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
anchor target, every `url()` in CSS, and every path-like string in
`js/translations/`:

```sh
node tools/check-links.js .
```

The CSS pass covers the per-page hero photos, which are set through a
`--hero-photo-url` custom property rather than markup — before it existed, a
typo there rendered a bare gradient and failed no check.

It still cannot see paths built in JavaScript — that is how the 1996 gallery
was missed once already — so a page whose images are injected at runtime still
needs looking at.

## Dropping in artwork

`tools/img2webp.sh` converts an image to WebP, proves the conversion was
pixel-exact, reports what it did, and lands it at the target path:

```sh
tools/img2webp.sh <dropped>.png img/team/johnny-vigersten.webp
```

Lossless is the default because every image dropped in so far is dithered
artwork — a flat palette of 4-5 colours — where lossless WebP is both smaller
and exact: the consultant portrait is 255 KB as a PNG and 18 KB as WebP. Pass
`--lossy 82` for a photo, where lossless would be larger *and* visibly banded.

It prints the colour count, and that is the number to watch. Resampling
dithered artwork blends those 4-5 flat colours into thousands of intermediate
ones, which destroys the dither and makes the file an order of magnitude
*larger* — 4 colours became 16,304 and 27 KB became 506 KB on one attempt.
Export new artwork natively at the size you need rather than shrinking a
larger file.

For the consultant portrait specifically, **4:5 is not negotiable** — the card
is `aspect-ratio: 4/5` with `object-fit: cover`, so any other ratio crops the
frame. It never renders wider than 629px (just under the 720px breakpoint,
where the grid is still single-column), so 1888x2359 is 3x that.

## History

Split out of `true-friends-website` on 2026-09-29, which remains the archive for
everything before that date.
