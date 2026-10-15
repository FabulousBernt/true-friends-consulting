# The brand layer

These files were copied from `true-friends-website` when the site was split into
three. They are identical in the landing, consulting and studio repositories at
the moment of the split.

```
css/base.css
js/lang-boot.js  js/translations/common.js
img/tf-pc-logo-transparent.svg
img/favicon.svg
```

`img/studio-navbar-smiley-noborder.svg` and
`img/studio-navbar-smiley-back-noborder.svg` were part of that set too, and have
since been deleted here — see the note further down.

They keep their normal paths rather than moving into this folder — moving them
would break every relative reference on every page for no benefit. This file is
a label for the set, not a directory they live in.

The CSS is now split three ways, and only `base.css` is still one of these: the
consulting and case-study stylesheets were split out of it in October 2026 so
each page stopped downloading the other one's components.

## The rule

**The CSS and JS are starting points and are expected to diverge.** Consulting
and Studio are separate businesses and are being redesigned to look different.
Do not try to keep `base.css` or `js/site.js` in step across the three
repositories — they are copied precisely so each site can change them freely.

**The logo files and the colour values in `base.css` are the umbrella.** Keep
those in step by hand, on the rare occasions they change. That is what makes
three different-looking sites read as one brand.

## One wrinkle

`js/translations/common.js` is not purely common. It carries
`hero.consultingMark`, which resolves to
`img/tf-archivo-consulting-chrome-transparent.svg` in English and
`img/tf-archivo-konsult-chrome-transparent.svg` in Swedish — that is how the
consulting wordmark gets its Swedish variant. Those two keys are meaningful
here and dead weight in the other two repositories.

## One asset that came from the landing

`img/tf-smiley-chrome-transparent.webp` is not from the split. It is the landing's
hero mark — the artwork its whole lockup hangs under — and it was copied here in
October 2026 to stand in for the navbar smiley. Studio took the same copy the
same day, for the same slot, so it now lives in all three repositories and is
umbrella artwork like the rest: change it everywhere or nowhere, or the sites
stop showing the same face.

It is also the one mark on any of the three sites that is a bitmap. It arrived as
a rendered cut with no vector source, which is why the navbar's usual trick of
swapping between two drawings is gone here: there is no second cut to swap to.
The hover state is a fade on the one file.

## Two rules worth knowing before you redesign

Everything else about how a site looks is yours to change. These two are not
preferences — they are things that will cost you an afternoon if you learn them
the hard way.

### The brand colours cannot be text on a light ground

Measured contrast against each candidate ground:

| | on ink `#0a0a0a` | on cream `#faf9f5` | on white |
|---|---|---|---|
| yellow `#fee440` | **15.45** — body text | 1.22 — unusable | 1.28 — unusable |
| flame `#ff3b1f` | **5.56** — body text | 3.38 — large only | 3.56 — large only |

On dark, both work as ink and yellow is the natural text accent. **On light,
neither can set body text.** Yellow can only be a fill with ink knocked out of
it; flame is limited to 24px+ or 19px-bold, so headings and large UI only.

A light-ground site that wants yellow emphasis has to invent a fill-based
device. That is not a style choice, it is the only option left.

### Do not recolour the logo

`tf-pc-logo-transparent.svg` is drawn artwork carrying three colours — a
near-black body, a white screen and a yellow smiley. Treating it as a
silhouette destroys the screen and the face. A CSS `filter: brightness(0)`
turns it into a black blob; this has been tried.

Use the all-yellow variant only over a dark ground, where it reads.

The navbar no longer uses this mark. It was replaced by the two smiley files,
`studio-navbar-smiley-noborder.svg` for the resting state and
`studio-navbar-smiley-back-noborder.svg` for hover — two separate drawings,
not two colourways, both filled with the accent yellow. The all-yellow
variant was dropped with it, leaving no yellow cut of the wordmark.

Those two files were deleted from this repository in October 2026, when the
navbar moved to the chrome smiley described above. Studio keeps its own copies
and still uses them, so they remain the umbrella navbar mark there — but nothing
here loads them, and a rebase or a copy across repositories will not bring them
back.

`tf-pc-logo-transparent.svg` stays for the hero's client-logo slot in
`reference-cases/template.html`, where it stands in for a client's mark.
