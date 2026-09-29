# Consulting redesign implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the consulting front page from a brochure into an index of the
six client cases, dressed in system-tool window chrome.

**Architecture:** No build step, no framework. Hand-written HTML, four
stylesheets, and a `data-i18n` walk in `js/main.js` that fills text from
`window.TF_TRANSLATIONS`. The redesign adds one new section and one new CSS
block, deletes two sections and their strings, and modifies the existing
`.section__terminal` component rather than replacing it.

**Tech Stack:** Static HTML/CSS/JS. Node (no dependencies) for the two
checkers. GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-09-29-consulting-redesign-design.md`

## Global Constraints

- **Both languages in the same commit.** Every new string ships `en` and `sv`
  together. A half-translated site is visible the moment someone toggles.
- **Dark ground stays:** `--color-bg: #0a0a0a`. Unchanged.
- **The logo is never recoloured** (`brand/README.md`). No CSS filters on any
  `tf-*` SVG.
- **Flame (`--color-flame`, `#ff3b1f`) appears exactly twice on the front
  page:** the wordmark offset, and the `ONGOING` stamp on the Sectra row.
- **The case prose is not edited.** 3,582 words across six pages stay as
  written. Only the frame around them changes.
- **No inline `style` attributes.** The CSP is `style-src 'self'`; inline
  styles are silently dropped. This has already caused one bug on this site.
- **`id="team"` does not change.** Only its visible label does. Sixteen nav
  blocks and seven breadcrumb links point at `#team`; renaming the id buys
  nothing and risks all of them.
- **Keys shared by the front page and the case pages live in
  `js/translations/common.js`.** Case pages load `common.js` and their own case
  file — never `consulting.js`. A string needed in both places and copied into
  both files will drift; this is exactly how the 1996 `cvHref` bug happened.

## Review Focus

Input classes the spec implies that no task's tests exercise. Each has a test
assigned to the task that owns the code.

1. **Swedish text overflowing the index columns.** `Säker kommunikation` is
   nearly twice the width of `Secure comms`, and `Designledare · Test` is
   longer than its English. A three-column grid sized for English clips or
   wraps badly in Swedish. → Task 1, Step 11.
2. **The `ONGOING` stamp on the inverted row.** Flame `#ff3b1f` on yellow
   `#fee440` is about 1.9:1 — unreadable. The stamp must switch to ink when its
   row inverts on hover or focus. → Task 1, Step 10.
3. **A stale bookmark or external link to `#about` / `#services`.** Both
   sections are deleted. A visitor arriving at `consulting.truefriends.se/#services`
   gets a page that silently ignores the fragment. → Task 2, Step 9.
4. **Keyboard focus on an index row.** The row inverts on `:hover`, and a
   `:focus-visible` style that only inverts gives a keyboard user no ring at
   all if a browser suppresses the default outline. → Task 1, Step 10.
5. **A case page opened directly, with no index behind it.** Search results and
   shared links land on `epiroc.html` cold. The return-to-index link must be an
   href to the front page, not a `history.back()`, or it dead-ends. → Task 4,
   Step 8.

---

## File Structure

| File | Responsibility | Change |
|---|---|---|
| `index.html` | Front page | New `#work` section; `#about` and `#services` deleted; nav rewritten; consultant card edited |
| `js/translations/common.js` | Strings shared by front page and case pages | `work.*` added; `nav.work` added; `nav.about`/`nav.services` removed; `refCase.back` added |
| `js/translations/consulting.js` | Front-page-only strings | `about.*` and `services.*` removed; `hero.lede.consulting` rewritten; `team.members.johnny.services` added |
| `css/layout.css` | Sections, hero, cards | `.file-index` block added; `.service-list`/`.service-line` block deleted; `.section__terminal` chrome reworked; glass removed |
| `css/components.css` | Nav, forms, modal | `.nav` loses `backdrop-filter` |
| `css/tokens.css` | Tokens | Glass tokens removed |
| `reference-cases/johnny-vigersten/*.html` (6) | Case pages | File header added; nav rewritten; return link added |
| `reference-cases/template.html` | Scaffold for a new case | Same changes, so a copied case is not born stale |
| `tools/check-i18n.js` | **New.** Every `data-i18n*` key resolves in both languages | Created in Task 1 |

Existing checker, used throughout:

```sh
node ~/repos/true-friends-website/tools/check-links.js ~/repos/true-friends-consulting
```

---

### Task 1: The work index

The centrepiece. Adds the section, its strings, its CSS, and the i18n checker
that every later task uses.

**Files:**
- Create: `tools/check-i18n.js`
- Modify: `index.html` (nav ×2 blocks, new section after the hero)
- Modify: `js/translations/common.js` (add `work.*`, `nav.work`)
- Modify: `css/layout.css` (add the `.file-index` block)

**Interfaces:**
- Produces: `work.label`, `work.count`, `work.ongoing`, `work.cols.{client,sector,role}`,
  `work.cases.<slug>.{sector,role,via}` for slugs `epiroc`, `sectra`, `bufab`,
  `avarn`, `skeKraft`, `kopparbergs` — all in `common.js`, both languages.
  Task 4 consumes the same keys on the case pages.
- Produces: `nav.work`. Task 2 consumes it when it rewrites the nav.
- Produces: `node tools/check-i18n.js` — exit 0 when every `data-i18n*` key on
  every page resolves in both `en` and `sv`; prints an `orphan` list of defined
  but unreferenced keys without failing on them. Tasks 2 and 3 consume both
  behaviours.

- [ ] **Step 1: Write the failing test — the i18n checker**

Create `tools/check-i18n.js`:

```js
#!/usr/bin/env node
/*
 * True Friends — translation key checker
 *
 * For every HTML page in the tree: collect the keys named by its
 * data-i18n* attributes, load the translation scripts that page actually
 * includes (in <script src> order, exactly as the browser would), and
 * check that each key resolves in BOTH en and sv.
 *
 * Why it exists: a key that is missing in one language renders as empty
 * text with no error anywhere. This site has already shipped a broken
 * per-language href that nothing caught (1996/consulting.js, cvHref).
 *
 * reference-cases/template.html is skipped, exactly as check-links.js
 * skips it: it is a scaffold, linked from nowhere, and its values are
 * placeholders waiting to be replaced.
 *
 * Orphans — keys defined in a dictionary and referenced from neither
 * markup nor JavaScript — are printed but do not fail the run. Some are deliberate (nav.gallery is
 * shared markup inherited from the studio site).
 *
 * Usage: node tools/check-i18n.js [root]
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(process.argv[2] || '.');
const I18N_ATTRS = ['data-i18n', 'data-i18n-html', 'data-i18n-placeholder',
  'data-i18n-aria-label', 'data-i18n-content', 'data-i18n-href',
  'data-i18n-alt', 'data-i18n-src'];

const problems = [];
const referenced = new Set();

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === '.git' || e.name === 'node_modules') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

// Comments are stripped first: a commented-out block is not live markup.
const strip = src => src.replace(/<!--[\s\S]*?-->/g, '');

function keysIn(src) {
  const found = [];
  for (const attr of I18N_ATTRS) {
    const re = new RegExp(`(?<![-\\w])${attr}="([^"]+)"`, 'g');
    for (const m of src.matchAll(re)) found.push(m[1]);
  }
  return found;
}

function scriptsOf(src, file) {
  const dir = path.dirname(file);
  return [...src.matchAll(/<script src="([^"]+)"/g)]
    .map(m => path.resolve(dir, m[1]))
    .filter(p => p.includes(`${path.sep}translations${path.sep}`));
}

function dictFor(scripts) {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  for (const s of scripts) {
    if (!fs.existsSync(s)) throw new Error(`missing translation file: ${s}`);
    vm.runInContext(fs.readFileSync(s, 'utf8'), sandbox, { filename: s });
  }
  return sandbox.window.TF_TRANSLATIONS;
}

const get = (obj, key) =>
  key.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);

function flatten(obj, prefix = '', out = new Set()) {
  for (const [k, v] of Object.entries(obj || {})) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object') flatten(v, key, out);
    else out.add(key);
  }
  return out;
}

const pages = walk(ROOT)
  .filter(f => f.endsWith('.html') && path.basename(f) !== 'template.html');
const defined = new Set();

for (const file of pages) {
  const src = strip(fs.readFileSync(file, 'utf8'));
  const dict = dictFor(scriptsOf(src, file));
  if (!dict) { problems.push([file, '(page)', 'loads no translation dictionary']); continue; }
  flatten(dict.en).forEach(k => defined.add(k));
  for (const key of keysIn(src)) {
    referenced.add(key);
    for (const lang of ['en', 'sv']) {
      const v = get(dict[lang], key);
      if (typeof v !== 'string' || v === '') {
        problems.push([file, key, `missing or empty in ${lang}`]);
      }
    }
  }
}

// Keys reached from JavaScript rather than from markup — t("status.success"),
// and the lightbox aria labels the gallery builds at runtime. Without this
// pass they look like orphans, which would make the orphan list useless as a
// signal for keys a deletion actually stranded.
for (const js of walk(path.join(ROOT, 'js')).filter(f => f.endsWith('.js'))) {
  if (js.includes(`${path.sep}translations${path.sep}`)) continue;
  const src = fs.readFileSync(js, 'utf8');
  for (const m of src.matchAll(/["'`]([a-z][\w]*(?:\.[\w]+)+)["'`]/gi)) {
    referenced.add(m[1]);
  }
}

const orphans = [...defined].filter(k => !referenced.has(k)).sort();
if (orphans.length) {
  console.log(`orphan keys (defined, referenced by no page): ${orphans.length}`);
  for (const k of orphans) console.log(`  orphan  ${k}`);
  console.log('');
}

if (problems.length) {
  for (const [f, key, why] of problems) {
    console.error(`${path.relative(ROOT, f)}  ${key}  — ${why}`);
  }
  console.error(`\n${problems.length} problem(s)`);
  process.exit(1);
}
console.log(`i18n OK — ${referenced.size} keys referenced across ${pages.length} pages`);
```

- [ ] **Step 2: Run it against the current site to see it pass on what exists**

Run: `node tools/check-i18n.js`
Expected: exit 0, `i18n OK — 136 keys referenced across 7 pages`, and exactly
six orphans:

```
  orphan  aria.closeLightbox
  orphan  aria.lightbox
  orphan  aria.nextPhoto
  orphan  aria.prevPhoto
  orphan  hero.studio
  orphan  nav.gallery
```

All six are studio strings that came across in the copied `common.js` at the
split — this repo has no gallery and no lightbox. They are genuinely dead and
genuinely out of scope here; they are listed so that a *new* orphan appearing
later in the plan is obvious against a known baseline.

This step exists to prove the harness is right against known-good input before
anything depends on it. If it reports a problem rather than an orphan, that is
a pre-existing bug: fix or record it before continuing.

- [ ] **Step 3: Write the failing test for the index itself**

Append to `tools/check-i18n.js`, just above the `orphans` block:

```js
// --- Redesign acceptance checks -------------------------------------------
// Structural facts the redesign must hold. Kept in this file so one command
// answers "is the site consistent?".
const indexSrc = strip(fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'));
const CASES = ['epiroc', 'sectra', 'bufab', 'avarn', 'ske-kraft', 'kopparbergs-brewery'];

const rows = [...indexSrc.matchAll(/class="file-index__row" href="([^"]+)"/g)].map(m => m[1]);
if (rows.length !== 6) {
  problems.push(['index.html', '(work index)', `expected 6 case rows, found ${rows.length}`]);
}
for (const slug of CASES) {
  if (!rows.some(h => h.endsWith(`/${slug}.html`))) {
    problems.push(['index.html', '(work index)', `no index row links to ${slug}.html`]);
  }
}
```

- [ ] **Step 4: Run it to verify it fails**

Run: `node tools/check-i18n.js`
Expected: FAIL — `expected 6 case rows, found 0`, followed by six
`no index row links to …` lines, then `7 problem(s)`.

- [ ] **Step 5: Add the `work` strings to `common.js`**

In `js/translations/common.js`, inside the `en` object, immediately after the
`nav: { … }` block, add `work` and add `work: "Work"` to `nav`:

```js
    nav: {
      start: "Start",
      about: "About",
      services: "Services",
      work: "Work",
      team: "Consultants",
      gallery: "Gallery",
      contact: "Contact",
    },
    /* The work index. Lives here rather than in consulting.js because the
       case pages show the same metadata in their file header, and they
       load common.js but never consulting.js. One source, no drift. */
    work: {
      label: "Work",
      count: "6 files",
      ongoing: "Ongoing",
      cols: { client: "Client", sector: "Sector", role: "Role" },
      cases: {
        epiroc:      { sector: "Mining",       role: "Design lead · Test", via: "B3 Commit" },
        sectra:      { sector: "Secure comms", role: "Design · Test",      via: "True Friends" },
        bufab:       { sector: "Distribution", role: "UX · UI · Test",     via: "Nethouse" },
        avarn:       { sector: "Security",     role: "UX · UI · Test",     via: "Nethouse" },
        skeKraft:    { sector: "Energy",       role: "UX · UI",            via: "Nethouse" },
        kopparbergs: { sector: "Brewing",      role: "UI · Test",          via: "Nethouse" },
      },
    },
```

And in the `sv` object, after its `nav` block, with `work: "Uppdrag"` added to
that `nav`:

```js
    nav: {
      start: "Start",
      about: "Om oss",
      services: "Tjänster",
      work: "Uppdrag",
      team: "Konsulter",
      gallery: "Galleri",
      contact: "Kontakt",
    },
    work: {
      label: "Uppdrag",
      count: "6 filer",
      ongoing: "Pågående",
      cols: { client: "Kund", sector: "Bransch", role: "Roll" },
      cases: {
        epiroc:      { sector: "Gruvindustri",         role: "Designledare · Test", via: "B3 Commit" },
        sectra:      { sector: "Säker kommunikation",  role: "Design · Test",       via: "True Friends" },
        bufab:       { sector: "Distribution",         role: "UX · UI · Test",      via: "Nethouse" },
        avarn:       { sector: "Säkerhet",             role: "UX · UI · Test",      via: "Nethouse" },
        skeKraft:    { sector: "Energi",               role: "UX · UI",             via: "Nethouse" },
        kopparbergs: { sector: "Bryggeri",             role: "UI · Test",           via: "Nethouse" },
      },
    },
```

- [ ] **Step 6: Add the section markup to `index.html`**

Insert immediately after the closing `</section>` of `#top` (the hero) and
before `<section class="section" id="about" …>`:

```html
    <section class="section" id="work" aria-labelledby="work-label">
        <div class="container">
            <div class="section__terminal">
                <div class="section__terminal-chrome">
                    <span class="section__terminal-title" id="work-label" data-i18n="work.label">Work</span>
                    <span class="section__terminal-status" data-i18n="work.count">6 files</span>
                    <!-- .section__terminal-status gets its rule in Task 5, with
                         the rest of the title bar. Until then it renders as
                         plain inherited text, which is correct but plain. -->
                </div>
                <div class="section__terminal-body">
                    <div class="section__body">
                    <!-- Column headings are decoration for sighted readers: each
                         row is already one link whose accessible name reads
                         "Epiroc, Mining, Design lead · Test". Exposing the
                         headings separately would announce them once per row. -->
                    <div class="file-index__head" aria-hidden="true">
                        <span data-i18n="work.cols.client">Client</span>
                        <span data-i18n="work.cols.sector">Sector</span>
                        <span data-i18n="work.cols.role">Role</span>
                    </div>
                    <ul class="file-index" role="list">
                        <li>
                            <a class="file-index__row" href="reference-cases/johnny-vigersten/epiroc.html">
                                <span class="file-index__client">Epiroc</span>
                                <span class="file-index__sector" data-i18n="work.cases.epiroc.sector">Mining</span>
                                <span class="file-index__role" data-i18n="work.cases.epiroc.role">Design lead · Test</span>
                            </a>
                        </li>
                        <li>
                            <a class="file-index__row" href="reference-cases/johnny-vigersten/sectra.html">
                                <span class="file-index__client">Sectra<span class="file-index__stamp" data-i18n="work.ongoing">Ongoing</span></span>
                                <span class="file-index__sector" data-i18n="work.cases.sectra.sector">Secure comms</span>
                                <span class="file-index__role" data-i18n="work.cases.sectra.role">Design · Test</span>
                            </a>
                        </li>
                        <li>
                            <a class="file-index__row" href="reference-cases/johnny-vigersten/bufab.html">
                                <span class="file-index__client">Bufab</span>
                                <span class="file-index__sector" data-i18n="work.cases.bufab.sector">Distribution</span>
                                <span class="file-index__role" data-i18n="work.cases.bufab.role">UX · UI · Test</span>
                            </a>
                        </li>
                        <li>
                            <a class="file-index__row" href="reference-cases/johnny-vigersten/avarn.html">
                                <span class="file-index__client">Avarn Security</span>
                                <span class="file-index__sector" data-i18n="work.cases.avarn.sector">Security</span>
                                <span class="file-index__role" data-i18n="work.cases.avarn.role">UX · UI · Test</span>
                            </a>
                        </li>
                        <li>
                            <a class="file-index__row" href="reference-cases/johnny-vigersten/ske-kraft.html">
                                <span class="file-index__client">Skellefteå Kraft</span>
                                <span class="file-index__sector" data-i18n="work.cases.skeKraft.sector">Energy</span>
                                <span class="file-index__role" data-i18n="work.cases.skeKraft.role">UX · UI</span>
                            </a>
                        </li>
                        <li>
                            <a class="file-index__row" href="reference-cases/johnny-vigersten/kopparbergs-brewery.html">
                                <span class="file-index__client">Kopparbergs</span>
                                <span class="file-index__sector" data-i18n="work.cases.kopparbergs.sector">Brewing</span>
                                <span class="file-index__role" data-i18n="work.cases.kopparbergs.role">UI · Test</span>
                            </a>
                        </li>
                    </ul>
                    </div>
                </div>
            </div>
        </div>
    </section>
```

- [ ] **Step 7: Add `Work` to both nav blocks in `index.html`**

In the `.nav__links` block and again in the `.nav__drawer` block, insert after
the `#top` link:

```html
            <a class="nav__link" href="#work" data-i18n="nav.work">Work</a>
```

(The drawer copy is indented by 8 spaces rather than 12; match its neighbours.)

- [ ] **Step 8: Run both checkers**

Run: `node tools/check-i18n.js && node ~/repos/true-friends-website/tools/check-links.js .`
Expected: `i18n OK` with no problems, and the link checker clean. The six index
rows now resolve to real files.

- [ ] **Step 9: Add the `.file-index` CSS**

Append to `css/layout.css`, immediately before the
`/* ---------- Consultant card … */` comment:

```css
/* ---------- File index (the work) ----------
   A list of links laid out as a directory listing. The whole row is the
   target and hover/focus inverts it, the way a selected line inverts in a
   system file manager. Deliberately not a <table>: this is navigation, and
   a screen reader should hear one link per case ("Epiroc, Mining, Design
   lead and Test") rather than nine cells. */
.file-index {
  margin: 0;
  padding: 0;
  list-style: none;
}

.file-index__head,
.file-index__row {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr) minmax(0, 1.25fr);
  gap: clamp(0.5rem, 2vw, 1.5rem);
  align-items: baseline;
  padding: 0.7rem 0.875rem;
}

.file-index__head {
  font-size: var(--fs-caption);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  color: var(--color-text-subtle);
  border-bottom: 1px solid var(--color-border);
}

.file-index__row {
  text-decoration: none;
  color: var(--color-text);
  border-bottom: 1px solid var(--color-border-subtle);
  transition: background-color var(--duration-fast) var(--ease-out),
              color var(--duration-fast) var(--ease-out);
}

.file-index__client {
  font-weight: 700;
  color: var(--color-text-strong);
}

.file-index__sector,
.file-index__role {
  font-size: var(--fs-small);
  color: var(--color-text-muted);
}

/* The one hot note in this component, and the second and last use of flame
   on the page. `ONGOING` is true of Sectra and is the thing that case
   cannot say in detail. */
.file-index__stamp {
  margin-left: 0.5rem;
  padding: 0.05em 0.35em;
  font-size: var(--fs-caption);
  font-weight: 400;
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  white-space: nowrap;
  color: var(--color-flame);
  border: 1px solid currentColor;
}

/* Selection. Every descendant colour has to be restated: flame on yellow is
   about 1.9:1 and muted cream on yellow is worse, so the whole row goes to
   ink together or not at all. */
.file-index__row:hover,
.file-index__row:focus-visible {
  background: var(--color-accent);
}

.file-index__row:hover :is(.file-index__client, .file-index__sector, .file-index__role, .file-index__stamp),
.file-index__row:focus-visible :is(.file-index__client, .file-index__sector, .file-index__role, .file-index__stamp) {
  color: var(--color-accent-ink);
}

/* The inversion alone would be a colour-only focus cue. The inset rule is
   the actual indicator, and it reads as a selection rectangle. */
.file-index__row:focus-visible {
  outline: 2px solid var(--color-accent-ink);
  outline-offset: -4px;
}

/* Under 600px three columns cannot be read. The row stacks: client as the
   line that carries the weight, sector and role beneath it. The headings go
   away entirely — they label columns that no longer exist. */
@media (max-width: 600px) {
  .file-index__head { display: none; }

  .file-index__row {
    grid-template-columns: minmax(0, 1fr);
    gap: 0.15rem;
    padding: 0.85rem 0.875rem;
  }

  .file-index__sector,
  .file-index__role { font-size: var(--fs-caption); }
}
```

- [ ] **Step 10: Check the focus and hover behaviour by hand**

Open `index.html`, Tab from the nav into the index.
Expected: each of the six rows takes focus in document order; the focused row
shows a yellow ground **and** an inset ink rectangle; the `ONGOING` stamp on
Sectra is ink, not flame, while its row is inverted. Hover gives the same
inversion without the rectangle. *(Review Focus 2 and 4.)*

- [ ] **Step 11: Check the Swedish index at 360px**

Switch to Svenska, narrow the window to 360px.
Expected: six rows, each three lines, no horizontal scrollbar on the body.
`Säker kommunikation` wraps within its own line rather than pushing the row
wide. Then widen to 900px and confirm the three columns hold with the Swedish
strings — `Designledare · Test` is the longest value in the `ROLE` column.
*(Review Focus 1.)*

- [ ] **Step 12: Commit**

```bash
git add tools/check-i18n.js index.html js/translations/common.js css/layout.css
git commit -m "Put the work first: an index of the six cases

The six reference cases hold 3,582 words the front page never pointed
at except from a row inside the consultant card. They are now the
second thing on the page, listed as files with the client, the sector
and the role that was played.

Adds tools/check-i18n.js, which resolves every data-i18n key in both
languages. A key missing in one language renders as empty text and
nothing anywhere reports it; that has already shipped once."
```

---

### Task 2: Delete About and Services, narrow the lede

The editorial half. Both sections assert what the index above them now shows,
and the hero lede is the only sentence left describing the business.

**Files:**
- Modify: `index.html` (delete two sections, rewrite both nav blocks)
- Modify: `reference-cases/johnny-vigersten/*.html` (6 files, both nav blocks each)
- Modify: `reference-cases/template.html` (both nav blocks)
- Modify: `js/translations/consulting.js` (delete `about.*`, `services.*`; rewrite the lede)
- Modify: `js/translations/common.js` (delete `nav.about`, `nav.services`)
- Modify: `css/layout.css` (delete the service-line block)

**Interfaces:**
- Consumes: `nav.work` from Task 1.
- Produces: nothing later tasks depend on.

- [ ] **Step 1: Delete the two sections from `index.html`**

Remove the whole `<section class="section" id="about" …>…</section>` block and
the whole `<section class="section" id="services" …>…</section>` block. The
hero is followed by `#work`, then `#team`.

- [ ] **Step 2: Run the link checker to watch it fail**

Run: `node ~/repos/true-friends-website/tools/check-links.js .`
Expected: FAIL. Sixteen nav blocks across eight files point at `#about` and
`#services`, and those ids no longer exist:

```
index.html  #about  — file exists, anchor does not
index.html  #services  — file exists, anchor does not
reference-cases/johnny-vigersten/epiroc.html  ../../#about  — file exists, anchor does not
…
```

This is the whole reason the nav rewrite is part of this task rather than a
tidy-up afterwards.

- [ ] **Step 3: Rewrite the nav in all eight pages**

Every page carries two nav blocks: `.nav__links` (desktop) and `.nav__drawer`
(mobile). In all sixteen, delete the `#about` and `#services` links. The
surviving order is **Start · Work · Consultants · Contact**.

On `index.html` the hrefs are bare fragments; on the six case pages they are
prefixed `../../`; on `reference-cases/template.html` they are prefixed
`../consulting.html`.

The six case pages and the template also need the `Work` link Task 1 added only
to `index.html` — insert it after the `Start` link in each block:

```html
            <a class="nav__link" href="../../#work" data-i18n="nav.work">Work</a>
```

```bash
# index.html — bare fragments
perl -ni -e 'print unless m{href="#(about|services)"}' index.html

# six case pages — ../../ prefix, and they gain #work
for f in reference-cases/johnny-vigersten/*.html; do
  perl -ni -e 'print unless m{href="\.\./\.\./#(about|services)"}' "$f"
  perl -pi -e 's{(\s*)(<a class="nav__link" href="\.\./\.\./#top" data-i18n="nav\.start">Start</a>)}
               {$1$2$1<a class="nav__link" href="../../#work" data-i18n="nav.work">Work</a>}g' "$f"
done

# the template — ../consulting.html prefix
perl -ni -e 'print unless m{href="\.\./consulting\.html#(about|services)"}' reference-cases/template.html
perl -pi -e 's{(\s*)(<a class="nav__link" href="\.\./consulting\.html#top" data-i18n="nav\.start">Start</a>)}
             {$1$2$1<a class="nav__link" href="../consulting.html#work" data-i18n="nav.work">Work</a>}g' reference-cases/template.html
```

Read the result of one case page and the template by eye before moving on —
`perl -ni` rewrites in place and a wrong pattern deletes silently.

- [ ] **Step 4: Run the link checker to verify it passes**

Run: `node ~/repos/true-friends-website/tools/check-links.js .`
Expected: clean. No `anchor does not` lines.

- [ ] **Step 5: Delete the orphaned strings**

From `js/translations/consulting.js`, delete the whole `about: { … }` object
and the whole `services: { … }` object, in **both** the `en` and `sv` halves —
four objects, 24 strings.

From `js/translations/common.js`, delete `about:` and `services:` from both
`nav` objects — four lines.

- [ ] **Step 6: Rewrite the hero lede**

In `js/translations/consulting.js`, replace the `consulting` value under
`hero.lede`:

```js
      // en
      consulting: "We provide consultants in testing, design and cybersecurity.",
```

```js
      // sv
      consulting: "Vi erbjuder konsulter inom testning, design och cybersäkerhet.",
```

Three disciplines rather than five. Web production and software development are
gone because nothing on the site evidences them; cybersecurity stays as a
deliberate call, recorded in the spec's risk 3.

- [ ] **Step 7: Run the i18n checker and read the orphan list**

Run: `node tools/check-i18n.js`
Expected: no problems, and the orphan list contains **no** key beginning
`about.` or `services.` or `nav.about` or `nav.services`. A leftover there
means markup still references a deleted key, or a key survived its markup.
Both are errors this task owns. *(Review Focus 3 is the reverse direction — see
Step 9.)*

- [ ] **Step 8: Delete the service-line CSS and the three orphaned icons**

From `css/layout.css`, delete the block from `.service-list {` through
`.service-line__body > p { margin: 0; }` inclusive — roughly lines 493–558,
along with the `/* ---------- Services … */` comment heading above it. Nothing
else in the tree uses these classes:

```bash
grep -rn 'service-line\|service-list' --include='*.html' --include='*.css' . | grep -v '^./docs/'
```

Expected after deletion: no output.

`img/icons/` holds exactly three files — `testing.svg`, `ux-design.svg`,
`ui-design.svg` — and the services block was their only consumer. Confirm,
then remove the directory:

```bash
grep -rn 'img/icons/' --include='*.html' --include='*.css' --include='*.js' . | grep -v '^./docs/'
```

Expected: no output. Then `git rm -r img/icons`.

These are Streamline Pixel icons, and deleting them is not a reversal of that
decision — the rest of the set stays in the nav and the footer, which is where
the spec says they belong now that the chrome fits them.

- [ ] **Step 9: Confirm the stale-fragment behaviour is harmless**

Open `index.html#services` and `index.html#about` directly.
Expected: the page loads at the top and the fragment is ignored. No error, no
blank screen, no scroll to the wrong section. This is the correct outcome — the
alternative, keeping empty anchors alive, would scroll a visitor to nothing.
*(Review Focus 3.)*

- [ ] **Step 10: Commit**

```bash
git add -A index.html reference-cases js/translations css/layout.css img
git commit -m "Delete About and Services; narrow the lede to what we can show

Both sections argue for what the six cases above them now demonstrate.
About opened 'Our vision is to' and closed on pillars; Services spoke
for a whole business in one voice, which is not how consultants work.

Deleting them orphaned sixteen nav blocks across eight pages that
pointed at #about and #services — the link checker caught every one.

The lede drops from five disciplines to three. It is now the only
sentence describing the business, one screen above a table where every
case reads testing and design."
```

---

### Task 3: The consultant entry

Services move to where they belong — a consultant's own record — and the `refs`
row goes, because the index replaced it.

**Files:**
- Modify: `index.html` (`#team` section)
- Modify: `js/translations/consulting.js` (`team.members.johnny.services`)

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: nothing later tasks depend on.

- [ ] **Step 1: Write the failing test**

Append to the acceptance block in `tools/check-i18n.js`, after the `file-index`
checks:

```js
// The consultant record carries its own services, and no longer duplicates
// the work index as a row of reference links.
if (!/data-i18n="team\.members\.johnny\.services"/.test(indexSrc)) {
  problems.push(['index.html', '(consultant)', 'no services row on the consultant card']);
}
if (/consultant-card__ref/.test(indexSrc)) {
  problems.push(['index.html', '(consultant)', 'refs row still present — the work index replaced it']);
}
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node tools/check-i18n.js`
Expected: FAIL with both lines —
`no services row on the consultant card` and
`refs row still present — the work index replaced it`, then `2 problem(s)`.

- [ ] **Step 3: Add the services row and remove the refs row**

In `index.html`, inside `.consultant-card__meta`, replace the entire `refs`
row — from `<div class="consultant-card__row">` containing
`<dt class="consultant-card__key">refs</dt>` through its closing `</div>` — with
nothing, and insert a `services` row directly after the `role` row:

```html
                                    <div class="consultant-card__row">
                                        <dt class="consultant-card__key">services</dt>
                                        <dd class="consultant-card__val" data-i18n="team.members.johnny.services">Testing · UX · UI</dd>
                                    </div>
```

The `dt` text stays untranslated, matching its four siblings (`name`, `role`,
`bio`, `cv`) which are literal lowercase keys by design.

- [ ] **Step 4: Add the string in both languages**

In `js/translations/consulting.js`, inside `team.members.johnny`, after `role`:

```js
        // en
        services: "Testing · UX · UI",
```

```js
        // sv
        services: "Testning · UX · UI",
```

- [ ] **Step 5: Run both checkers**

Run: `node tools/check-i18n.js && node ~/repos/true-friends-website/tools/check-links.js .`
Expected: both clean. The link checker matters here: the deleted `refs` row held
six links, and their targets must still be reachable — from the work index now.

- [ ] **Step 6: Change the English section label**

In `js/translations/common.js`, `team.label` already reads `Consultants` in
`en` and `Konsulter` in `sv`, matching the `nav.team` labels. Confirm and leave
alone:

```bash
grep -n 'label: "Consultants"\|label: "Konsulter"' js/translations/*.js
```

Expected: both present. If the `#team` section's `data-i18n` points at
`team.label` and that resolves, there is nothing to change — the section was
already labelled Consultants and only the spec's prose called it Team.

- [ ] **Step 7: Leave the bio alone, deliberately**

The spec says the one specific idea in the deleted About — *a true friend to
you as a customer* — survives into the bio "if it earns its place there". It
does not. The existing bio is already first-person, plain and concrete:

> I like exploring and investigating software and solving problems for
> customers. I advocate usability, security and aesthetics.

Grafting a company tagline into a personal record would put marketing back in
the one place on the page that never had any. The sentence goes with the
section it came from. No change to `team.members.johnny.bio`.

- [ ] **Step 8: Commit**

```bash
git add index.html js/translations/consulting.js tools/check-i18n.js
git commit -m "Give services back to the consultant who offers them

One field in the index's own vocabulary replaces three paragraphs of
company-voice service copy. The six cases above it are the proof.

The refs row goes with it: a second, worse list of the same six cases,
buried inside a card."
```

---

### Task 4: The case pages become files

Each case gains the metadata header that matches the index, and a way back to
the list it came from — which it has never had.

**Files:**
- Modify: `reference-cases/johnny-vigersten/{epiroc,sectra,bufab,avarn,ske-kraft,kopparbergs-brewery}.html`
- Modify: `reference-cases/template.html`
- Modify: `js/translations/common.js` (`refCase.back`, `refCase.meta.*`)
- Modify: `css/layout.css` (`.case-file` block)

**Interfaces:**
- Consumes: `work.cases.<slug>.{sector,role,via}` from Task 1 — the same keys,
  from `common.js`, which these pages already load.
- Produces: nothing later tasks depend on.

- [ ] **Step 1: Write the failing test**

Append to the acceptance block in `tools/check-i18n.js`:

```js
// Every case page carries a file header and a route back to the index.
const CASE_DIR = path.join(ROOT, 'reference-cases', 'johnny-vigersten');
for (const f of fs.readdirSync(CASE_DIR).filter(n => n.endsWith('.html'))) {
  const p = path.join(CASE_DIR, f);
  const src = strip(fs.readFileSync(p, 'utf8'));
  if (!/class="case-file__meta"/.test(src)) {
    problems.push([p, '(case file)', 'no metadata header']);
  }
  if (!/class="case-file__back" href="\.\.\/\.\.\/#work"/.test(src)) {
    problems.push([p, '(case file)', 'no link back to the work index']);
  }
}
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node tools/check-i18n.js`
Expected: FAIL with twelve lines — two per case page — then `12 problem(s)`.

- [ ] **Step 3: Add the shared labels to `common.js`**

Inside `refCase` in the `en` object:

```js
    refCase: {
      about: "About",
      myRole: "My role",
      workflow: "Workflow",
      back: "Back to the index",
      meta: { client: "client", sector: "sector", role: "role", via: "via" },
    },
```

And in `sv`:

```js
    refCase: {
      about: "Om uppdraget",
      myRole: "Min roll",
      workflow: "Arbetsprocess",
      back: "Tillbaka till listan",
      meta: { client: "kund", sector: "bransch", role: "roll", via: "via" },
    },
```

- [ ] **Step 4: Add the header to each case page**

In each of the six files, insert immediately after the closing `</section>` of
the hero (`id="top"`) and before the first `<section class="section" id="about"`.
This is `epiroc.html`; the other five differ only in the client name and the
three `work.cases.<slug>` keys:

```html
    <div class="container">
        <div class="case-file">
            <dl class="case-file__meta">
                <div class="case-file__row">
                    <dt class="case-file__key" data-i18n="refCase.meta.client">client</dt>
                    <dd class="case-file__val case-file__val--strong">Epiroc</dd>
                </div>
                <div class="case-file__row">
                    <dt class="case-file__key" data-i18n="refCase.meta.sector">sector</dt>
                    <dd class="case-file__val" data-i18n="work.cases.epiroc.sector">Mining</dd>
                </div>
                <div class="case-file__row">
                    <dt class="case-file__key" data-i18n="refCase.meta.role">role</dt>
                    <dd class="case-file__val" data-i18n="work.cases.epiroc.role">Design lead · Test</dd>
                </div>
                <div class="case-file__row">
                    <dt class="case-file__key" data-i18n="refCase.meta.via">via</dt>
                    <dd class="case-file__val" data-i18n="work.cases.epiroc.via">B3 Commit</dd>
                </div>
            </dl>
            <a class="case-file__back" href="../../#work" data-i18n="refCase.back">Back to the index</a>
        </div>
    </div>
```

The per-file values:

| File | Client | i18n slug | Fallback sector / role / via |
|---|---|---|---|
| `epiroc.html` | Epiroc | `epiroc` | Mining / Design lead · Test / B3 Commit |
| `sectra.html` | Sectra | `sectra` | Secure comms / Design · Test / True Friends |
| `bufab.html` | Bufab | `bufab` | Distribution / UX · UI · Test / Nethouse |
| `avarn.html` | Avarn Security | `avarn` | Security / UX · UI · Test / Nethouse |
| `ske-kraft.html` | Skellefteå Kraft | `skeKraft` | Energy / UX · UI / Nethouse |
| `kopparbergs-brewery.html` | Kopparbergs | `kopparbergs` | Brewing / UI · Test / Nethouse |

Note the two slugs that are not the filename: `ske-kraft.html` uses `skeKraft`,
and `kopparbergs-brewery.html` uses `kopparbergs`. The dictionary keys are
camelCase because they are JavaScript identifiers.

- [ ] **Step 5: Add the same header to the template, with the right prefix**

`reference-cases/template.html` sits one level shallower, so its back link is
`../consulting.html#work`, and its metadata carries placeholder values a new
case is expected to replace. Add the same block with `href="../consulting.html#work"`
and `data-i18n` keys pointing at `work.cases.epiroc.*` as the worked example,
with a comment above it:

```html
        <!-- Replace the four values and the three work.cases.epiroc.* keys
             with this case's own. Add the matching entry under work.cases
             in js/translations/common.js, and a row in the index on the
             front page — the index is the only route to this page. -->
```

The template is excluded from the link checker (it holds deliberate
placeholders), so the back link's prefix cannot be verified automatically.
Open it and read the href. *(Review Focus 5: a case reached cold from a search
result must have an href back, not a scripted history step.)*

- [ ] **Step 6: Add the `.case-file` CSS**

Append to `css/layout.css`, after the `.file-index` block:

```css
/* ---------- Case file header ----------
   The same key/value vocabulary as the work index and the consultant card,
   stated once at the top of a case so a reader who arrived from a search
   result gets the context the index would have given them. */
.case-file {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: clamp(1rem, 3vw, 2rem);
  margin-block: clamp(1.5rem, 4vw, 2.5rem) 0;
  padding: clamp(0.875rem, 2vw, 1.25rem);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
}

.case-file__meta {
  display: grid;
  gap: 0.35rem;
  margin: 0;
  min-width: min(100%, 18rem);
}

.case-file__row {
  display: grid;
  grid-template-columns: 5rem minmax(0, 1fr);
  gap: 0.75rem;
  align-items: baseline;
}

.case-file__key {
  font-size: var(--fs-caption);
  letter-spacing: var(--tracking-label);
  color: var(--color-accent);
}

.case-file__val {
  margin: 0;
  font-size: var(--fs-small);
  color: var(--color-text);
}

.case-file__val--strong {
  font-weight: 700;
  color: var(--color-text-strong);
}

/* A real href, not a scripted history step: this page is routinely opened
   cold from a search result with nothing behind it to go back to. */
.case-file__back {
  font-size: var(--fs-small);
  color: var(--color-text-muted);
  text-decoration: none;
  border-bottom: 1px solid currentColor;
  white-space: nowrap;
}

.case-file__back::before {
  content: "\2190\00a0";
}

.case-file__back:hover,
.case-file__back:focus-visible {
  color: var(--color-accent);
}
```

- [ ] **Step 7: Run both checkers**

Run: `node tools/check-i18n.js && node ~/repos/true-friends-website/tools/check-links.js .`
Expected: both clean. The i18n checker proves each case page resolves
`work.cases.<slug>.*` — which only works because those keys live in
`common.js`, the one dictionary these pages load.

- [ ] **Step 8: Open a case cold and walk back**

Open `reference-cases/johnny-vigersten/sectra.html` directly in a new tab, with
no history behind it. Switch to Svenska.
Expected: the header reads `kund / bransch / roll / via` with Swedish values,
and `Tillbaka till listan` returns to the front page scrolled to the work
index. *(Review Focus 5.)*

- [ ] **Step 9: Commit**

```bash
git add reference-cases js/translations/common.js css/layout.css tools/check-i18n.js
git commit -m "Give each case a header and a way back

Every case now opens with the same four fields the index shows, read
from the same dictionary entry, so the two can never disagree.

Until now a case page had no link to the list it came from — a reader
who arrived from a search result had the browser's Back button and
nothing else."
```

---

### Task 5: The chrome

The surface. Solid windows with hard borders and offset shadows, in place of
frosted glass.

**Files:**
- Modify: `css/tokens.css` (remove the glass tokens)
- Modify: `css/layout.css` (`.section__terminal`, its chrome bar, the fixed nav)
- Modify: `css/components.css` (`.nav`)

**Interfaces:**
- Consumes: `.file-index` and `.case-file` from Tasks 1 and 4 — both sit inside
  `.section__terminal` or beside it and inherit its ground.
- Produces: nothing.

- [ ] **Step 1: Write the failing test**

Append to the acceptance block in `tools/check-i18n.js`:

```js
// The chrome is opaque. Panels no longer use backdrop-filter; the dialog
// backdrops still do, because dimming what is behind an open dialog is a
// different device and was never in scope.
const cssOf = n => fs.readFileSync(path.join(ROOT, 'css', n), 'utf8');
for (const name of ['tokens.css', 'layout.css', 'components.css']) {
  const css = cssOf(name);
  for (const token of ['--blur-glass', '--color-glass-tint', '--color-glass-highlight']) {
    if (css.includes(token)) {
      problems.push([`css/${name}`, token, 'glass token still present']);
    }
  }
}
const panelBlur = cssOf('layout.css').includes('backdrop-filter');
if (panelBlur) problems.push(['css/layout.css', 'backdrop-filter', 'a panel is still translucent']);

const comp = cssOf('components.css');
const backdropUses = (comp.match(/backdrop-filter/g) || []).length;
// Expected: exactly 4 — ::backdrop on .modal and .lightbox, each with its
// -webkit- prefix. Anything more means a panel kept its blur.
if (backdropUses !== 4) {
  problems.push(['css/components.css', 'backdrop-filter',
    `expected 4 uses (modal + lightbox ::backdrop, prefixed), found ${backdropUses}`]);
}
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node tools/check-i18n.js`
Expected: FAIL — three `glass token still present` lines for `tokens.css`,
three more for `layout.css` (it consumes all three), `a panel is still
translucent`, and `expected 4 uses …, found 6` for `components.css`.

- [ ] **Step 3: Remove the glass tokens**

In `css/tokens.css`, delete the comment block beginning
`/* Frosted-glass surface used for the nav …` together with
`--color-glass-tint`, `--color-glass-highlight`, the
`/* Backdrop filter applied to every glass surface. */` comment and
`--blur-glass`. Add in their place:

```css
  /* Panel chrome. Opaque by choice: a translucent panel over the hero
     photograph is the one place on this site where text contrast is not
     actually controlled, and the frosted look is what made the pixel
     icons read as borrowed from somewhere else. */
  --color-panel: #101010;
  --color-panel-bar: #181818;
  --color-panel-border: #2e2e2e;
  --shadow-panel: 4px 4px 0 rgba(0, 0, 0, 0.55);
```

- [ ] **Step 4: Rework `.section__terminal`**

In `css/layout.css`, replace the `.section__terminal` and
`.section__terminal-chrome` rules:

```css
.section__terminal {
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--color-panel);
  border: 2px solid var(--color-panel-border);
  box-shadow: var(--shadow-panel);
}

/* The title bar. The repeating hairline is the one borrowed gesture in the
   whole design — it is what made a window draggable in every system of the
   era, and it is doing the same job here: saying "this is a window" without
   a word of explanation. It is drawn, not an image, so it costs nothing. */
.section__terminal-chrome {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex: none;
  padding: 0.5rem 0.875rem;
  background:
    repeating-linear-gradient(
      to bottom,
      var(--color-panel-border) 0 1px,
      transparent 1px 3px
    ),
    var(--color-panel-bar);
  border-bottom: 2px solid var(--color-panel-border);
}

/* The title and the status sit on the bar, so they need the bar's ground
   behind them rather than the pinstripe running through the letters. */
.section__terminal-title,
.section__terminal-status {
  position: relative;
  padding-inline: 0.4rem;
  background: var(--color-panel-bar);
}

.section__terminal-status {
  font-family: var(--font-display);
  font-size: var(--fs-caption);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  color: var(--color-text-subtle);
}
```

- [ ] **Step 5: Make both navs opaque**

In `css/layout.css`, in the `body:has(.hero--brand) .nav, body:has(.hero--blog) .nav`
rule, replace the three glass lines with:

```css
  background: var(--color-panel);
  border-bottom: 2px solid var(--color-panel-border);
```

In `css/components.css`, in `.nav`, replace the background and the two
`backdrop-filter` lines with:

```css
  background: var(--color-panel);
  border-bottom: 2px solid var(--color-panel-border);
```

- [ ] **Step 6: Replace the last glass reference**

`css/layout.css` used `--color-glass-highlight` for the service-line hover,
which Task 2 deleted. Search for any remaining use and replace with
`--color-panel-bar`:

```bash
grep -n 'glass' css/*.css
```

Expected: no output.

- [ ] **Step 7: Run the test to verify it passes**

Run: `node tools/check-i18n.js`
Expected: PASS — no glass tokens, no panel blur, exactly 4 `backdrop-filter`
uses in `components.css` (the two dialog backdrops, each prefixed).

- [ ] **Step 8: Count the flame**

```bash
grep -rn 'color-flame' css/*.css
```

Expected: exactly two consumers — the wordmark offset in the hero, and
`.file-index__stamp`. If a third appears, one of them is wrong; the spec's
budget is two.

- [ ] **Step 9: Look at every page**

Open `index.html` and one case page, in both languages, at 360px and at 1280px.
Expected:
- Panels are opaque; no hero photograph shows through a section.
- The nav is a solid bar with a 2px bottom border, over the photo and over the
  case pages alike.
- Each section reads as a window: 2px border, pinstriped title bar, hard
  shadow down and right.
- The contact form and the modal still render correctly — the modal's dimmed,
  blurred backdrop is intact.
- The consultant portrait and the case figures are unaffected.

- [ ] **Step 10: Commit**

```bash
git add css tools/check-i18n.js
git commit -m "Trade frosted glass for windows that admit they are windows

Every panel was a translucent tint with a 6px blur over a photograph,
which is the one place on this site where text contrast was not
actually controlled, and it is why the pixel icons looked borrowed.

Panels are now opaque, bordered 2px, and sit on a hard offset shadow;
the title bars carry a drawn pinstripe. The dialog backdrops keep their
blur — dimming the page behind an open dialog is a different device."
```

---

## Verification after the last task

```sh
node tools/check-i18n.js
node ~/repos/true-friends-website/tools/check-links.js .
```

Then, by eye, the acceptance criteria from the spec's §8 that no script can
answer:

1. Every index row reaches its case and every case returns to the index —
   twelve links, both directions.
2. The index is usable at 360px in both languages, with no horizontal scroll on
   the body.
3. Tab reaches all six rows in order; the focused row inverts *and* shows the
   inset rectangle.
4. Toggle to Svenska and read the whole site, including the index, the stamp,
   and the case-page headers.
5. Flame appears exactly twice on the front page.
6. Contrast measured, not assumed: cream on the new `--color-panel`, and ink on
   yellow for an inverted row.
