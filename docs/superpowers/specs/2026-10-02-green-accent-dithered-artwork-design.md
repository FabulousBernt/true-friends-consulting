# Green accent + dithered artwork

**Date:** 2026-10-02
**Branch:** `green-accent-dithered-artwork` off `main`
**Status:** approved

## Goal

Three changes to the consulting site:

1. Swap the consulting hero background for `img/landing-page-hero-dithered.png`.
2. Swap the consultant-card portrait for `img/team/Z-6-dithered.png`.
3. Move the yellow accent to green, `#40FE43`.

## Assets

Both new images are dithered and carry a 4-colour palette, which is why lossless
WebP costs a fraction of the PNG. Both conversions were verified pixel-exact by
decoding the WebP and re-encoding it: the round-trip file is byte-identical to
the WebP built from the source PNG.

| target | source | PNG | WebP (lossless) |
|---|---|---|---|
| `img/consulting-hero-bg.webp` | `img/landing-page-hero-dithered.png` (2556x2071) | 428 KB | 75 KB |
| `img/team/johnny-vigersten.webp` | `img/team/Z-6-dithered.png` (3277x4096) | 776 KB | 57 KB |

The two existing WebP paths are overwritten rather than replaced by new
filenames, so no reference changes are needed anywhere:

- the hero path is set once, in `css/layout.css:26`
- the portrait is one `<img src>` at `index.html:170`

Nothing is downscaled. At 57-75 KB the full source resolution is free, and the
portrait's 4:5 matches the card's `aspect-ratio: 4 / 5` exactly, so
`object-fit: cover` does not crop it.

The source PNGs are removed once the conversion is verified.

## Accent

CSS only. Four SVG assets carry yellow as a baked-in fill and are **not**
touched:

- `img/tf-pc-favicon.svg` — favicon on all seven pages
- `img/tf-pc-logo-yellow-transparent.svg` — nav hover logo, all seven pages
- `img/tf-archivo-consulting-yellow-transparent.svg` — hero wordmark, EN
- `img/tf-archivo-konsult-yellow-transparent.svg` — hero wordmark, SV

Yellow artwork sitting next to green accents is a deliberate choice, not an
oversight. It also keeps the existing red-on-yellow wordmark pairing intact,
which is what the flame shadow at `css/layout.css:790` was drawn against.

### Tokens

| token | from | to |
|---|---|---|
| `--color-accent` | `#fee440` | `#40fe43` |
| `--color-nav-fg-hover` | `#fee440` | `#40fe43` |
| `--color-focus-ring` | `#fee440` | `#40fe43` |
| `--color-accent-pressed` | `#e6cf3a` | `#3cef3f` |

`--color-accent-pressed` is the one value with no copy-paste answer. Yellow's
pressed state sits at 88.3% of its base relative luminance, so `#40FE43` is
scaled by the square root of that ratio to hold the same perceived step. It is
the `.btn:active` fill (`css/components.css:36`), which also moves 1px, so the
exact ratio is not load-bearing.

`#40FE43` measures **14.56:1** against ink `#0a0a0a`, where yellow measured
15.45:1. Both clear WCAG AAA (7:1) for body text, and the site is dark-ground
throughout, so the accent only ever sets text on ink.

### New token

The last hardcoded yellow is `rgba(254, 228, 64, 0.04)` at
`css/components.css:106`, the form-field focus wash. It becomes
`--color-accent-wash`, so the next accent change touches one file instead of
hunting literals.

### Comments

Six comments describe the old colour and become false the moment the tokens
change. They are corrected:

- `css/tokens.css:4` — the header citing `#FEE440`
- `css/tokens.css:28` — "against the yellow/black ground"
- `css/components.css:229` — "yellow on top at zero opacity"
- `css/layout.css:295` — "accent yellow on hover / focus"
- `css/layout.css:489` — "Keys in accent yellow"
- `css/layout.css:625` — "unreadable on yellow"

Two comments that mention yellow are **left alone**, because they describe the
wordmark artwork, which stays yellow: `css/layout.css:768` (the flame shadow
against the yellow mark) and `css/layout.css:848-854`.

## Known consequences

**The hero aspect ratio changes a lot.** 3:2 becomes 1.23:1 under
`background-size: cover`. On a 390px-wide phone the hero is about 0.54:1, so
more than half the image crops horizontally and the page shows a narrow
vertical slice of the dither. `background-position: center` is unchanged. This
is flagged for review, not pre-emptively tuned.

**The umbrella rule in `brand/README.md` is now bent.** It states the token
colours are kept in step across the three sibling repositories by hand.
Consulting going green makes it the odd one out, so `brand/README.md` records
the divergence rather than leaving the next person to rediscover it.

## Verification

`tools/check-links.js` scans HTML `href`/`src` and path-like strings in
`js/translations/`. It never parses CSS `url()`, which is where the hero photo
path lives — so a typo there would pass the only automated test in the repo. The
checker gains a CSS `url()` pass mirroring the translations one, and the run
must report more references checked than its `236` baseline with `0` broken.

Also checked by hand:

- `rg -i 'fee440|e6cf3a|254, ?228, ?64' css/` returns nothing
- `cwebp` decode/re-encode byte-identity on both landed files
- `python3 -m http.server 8801` and look at it