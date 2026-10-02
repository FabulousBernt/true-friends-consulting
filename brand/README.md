# The brand layer

These files were copied from `true-friends-website` when the site was split into
three. They are identical in the landing, consulting and studio repositories at
the moment of the split.

```
css/tokens.css  css/base.css  css/components.css  css/layout.css
js/main.js  js/lang-boot.js  js/translations/common.js
img/tf-pc-logo-transparent.svg  img/tf-pc-logo-yellow-transparent.svg
img/tf-pc-favicon.svg
tools/i18n.js
```

They keep their normal paths rather than moving into this folder — moving them
would break every relative reference on every page for no benefit. This file is
a label for the set, not a directory they live in.

## The rule

**The CSS and JS are starting points and are expected to diverge.** Consulting
and Studio are separate businesses and are being redesigned to look different.
Do not try to keep `components.css` or `layout.css` in step across the three
repositories — they are copied precisely so each site can change them freely.

**The logo files and the colour values in `tokens.css` are the umbrella.** Keep
those in step by hand, on the rare occasions they change. That is what makes
three different-looking sites read as one brand.

### One deliberate exception, as of 2026-10-02

Consulting's accent tokens are **green `#40FE43`**, not yellow `#FEE440`. The
drawn logo assets are still yellow on all three sites, so the mark reads the
same everywhere; only `--color-accent`, `--color-nav-fg-hover`,
`--color-focus-ring`, `--color-accent-pressed` and `--color-accent-wash` in
`tokens.css` diverge here. Landing and Studio keep yellow.

Do not "fix" this by syncing the tokens back — the divergence is the intent.
The rule above still governs everything else in this file.

## One wrinkle

`js/translations/common.js` is not purely common. It carries
`hero.consultingMark`, which resolves to
`img/tf-archivo-consulting-yellow-transparent.svg` in English and
`img/tf-archivo-konsult-yellow-transparent.svg` in Swedish — that is how the
consulting wordmark gets its Swedish variant. Those two keys are meaningful
here and dead weight in the other two repositories.

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
