# The Consulting redesign — design spec

**Date:** 2026-09-29
**Status:** Draft, awaiting review
**Project:** 3 of 5 (split → brand kit (cut) → **consulting redesign** → studio redesign → TF Classic's fate)
**Site:** `consulting.truefriends.se` — this repository
**Direction:** Case file (structure) with System tool (surface)

---

## Intent

Consulting and Studio were separated so they could stop looking like one
company. This is the first of the two redesigns, and it has a second job
beyond appearance: the site currently hides its best asset.

**The measurement that started this.** The six reference cases hold **3,582
words and 36 images across 6 pages**. The front page holds **406 words**. The
only route from one to the other is a `refs` row inside the consultant card,
below a services accordion, four sections down. The work is the evidence and it
is buried under the assertions.

So the redesign inverts that: the front page becomes an index of the work, and
the assertions that the work already proves are deleted rather than restyled.

### Success criteria

1. A visitor who lands cold sees real client work above the fold's next scroll,
   not a value proposition.
2. Every claim the front page makes is backed by something on it.
3. Consulting no longer reads as the same site as Studio or the landing.
4. The site is honestly retro-flavoured, not a costume. TF Classic remains the
   only period piece True Friends owns.

### Constraints

- **Dark ground stays** (`#0a0a0a`). It is techy, and it is the only ground
  where both brand colours work as text (yellow 15.45:1, flame 5.56:1).
- **The brand rules in `brand/README.md` apply**: the logo is never recoloured,
  and flame stays rare.
- **The case prose is not rewritten.** It is good, it is long, and rewriting it
  is a different project. Structure around it.
- **No build step.** Hand-written HTML/CSS/JS, as the whole site is.
- **Both languages.** Every new string ships EN and SV together.

---

## Decisions already taken

These were settled in conversation before this spec and are recorded so the
plan does not reopen them:

| Decision | Chosen |
|---|---|
| Depth of the retro reference | Retro-flavoured, not a period piece |
| Scope | Structure **and** surface |
| Direction | **B (Case file)** with **A's (System tool)** chrome |
| Ground | Dark |
| What leads | The work |
| Site-level services section | **Deleted** — services belong to a consultant, not to the business |
| Hero lede | **Narrowed** to testing, design and cybersecurity |

---

## 1. Structure

### Before and after

| Now | Proposed |
|---|---|
| Hero | Hero |
| About — 112 w | — *dissolved* |
| Services — 188 w, 3 accordion items | — *deleted* |
| Team — one card | Consultants |
| Contact | Contact |
| *(cases reachable only from inside the card)* | **Work — the index, second on the page** |

Four sections. The page loses roughly 300 words of assertion and gains a table
of six real engagements.

### Why About dissolves

Its three paragraphs are the register the brand notes flagged:

> Our vision is to be a close and genuine partner… we focus on gaining a deep
> understanding of your business, goals, customers, users, problems and
> challenges.

> True Friends rests on a foundation of honesty, creativity, responsibility,
> and commitment. These pillars are essential for our work and our shared
> success.

"Our vision is to", "rests on a foundation", "pillars", and a six-noun list.
With six client projects sitting above it, this section is arguing for
something the reader has already been shown. The one specific idea in it — *a
true friend to you as a customer* — survives into the consultant's bio if it
earns its place there; nothing else does.

`about.ledeHTML` goes with it. It is the "creative / technical" lede with the
`.accent` spans — the surviving fragment of the abandoned typesafe experiment.

### Why Services is deleted

Its copy is written in company voice on behalf of everyone:

> When testing we like to be involved as early as possible…
> By applying a design thinking process, we put ourselves in the environment of
> your users…

That is a unified service menu for a business whose consultants each bring
their own. The substance moves into the consultant's entry as a single field in
the index's own vocabulary:

```
SERVICES   Testing · UX · UI
```

Three paragraphs per language become one line, because the six cases above it
are the proof. **This is a deletion and a rewrite, not a move** — about 190
words per language are discarded.

### Why Team becomes Consultants

A section headed "Team" containing one card is an empty promise. The existing
Swedish label is already `Konsulter`; the English becomes `Consultants` to
match, which is also what the translation file already calls it.

### The growth path

With one consultant, the work index is flat. With a second, it gains a
`CONSULTANT` column or splits into a block each, and each consultant's entry
carries their own `SERVICES` field. **Not built now** — recorded so the design
is not built in a way that forbids it.

---

## 2. The work index

The centre of the page, and the section that justifies the whole direction.

```
┌ WORK ───────────────────────────────────── 6 FILES ┐
│▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚│
├────────────────────────────────────────────────────┤
│ CLIENT             SECTOR         ROLE             │
├────────────────────────────────────────────────────┤
│ Epiroc             Mining         Design lead·Test │
│ Sectra             Secure comms   Design·Test  ⟨ONGOING⟩
│ Bufab              Distribution   UX·UI·Test       │
│ Avarn Security     Security       UX·UI·Test       │
│ Skellefteå Kraft   Energy         UX·UI            │
│ Kopparbergs        Brewing        UI·Test          │
└────────────────────────────────────────────────────┘
```

### The data

None of this exists as structured content today. Every value below is derived
from the case prose and must be added as translated strings.

| Case | Client | Sector | Role | Via |
|---|---|---|---|---|
| `epiroc.html` | Epiroc | Mining | Design lead · Test | B3 Commit |
| `sectra.html` | Sectra | Secure comms | Design · Test | True Friends |
| `bufab.html` | Bufab | Distribution | UX · UI · Test | Nethouse |
| `avarn.html` | Avarn Security | Security | UX · UI · Test | Nethouse |
| `ske-kraft.html` | Skellefteå Kraft | Energy | UX · UI | Nethouse |
| `kopparbergs-brewery.html` | Kopparbergs | Brewing | UI · Test | Nethouse |

Order is by weight, not alphabet: Epiroc is two and a half years and the
largest platform, Sectra is current.

**`Via`** names the consultancy the work was done through. It appears on the
case page, not in the index — three columns is the width a table can hold on a
phone-sized breakpoint, and the employer is context a reader wants once they
are already in a case.

### There is no YEAR column

No case carries a date anywhere in its content. A `YEAR` column would require
information only the site owner holds. The index reads correctly without one;
if years are supplied later, the column is additive and the row layout already
has room.

### Behaviour

- The **whole row is the link**. A row is an `<a>` wrapping a grid, not a
  `<tr>` with a link in one cell — a 2px-tall click target in the `CLIENT`
  column is the failure this design is supposed to avoid.
- **Hover and focus invert the row**: yellow ground, ink text. This is the
  system-tool selection idiom, it is free on a dark ground, and it gives the
  keyboard the same affordance as the mouse.
- **`⟨ONGOING⟩` on Sectra** is a status stamp, not decoration. It is true, it
  is the one thing the Sectra case cannot say in detail, and it is the second
  and last use of flame on the page.
- **Under 600px the table stacks**: client as the heading, sector and role as a
  two-line definition list. A three-column table at 360px is unreadable, and
  `overflow-x` on a navigation element is worse than reflowing it.

### Accessibility

The index is a list of links, not a data table — it is navigation. It is marked
up as such (`<ul>` of `<a>`s in a grid), with the column headings as a visually
present but `aria-hidden` header row, because they label the columns visually
while the link text already carries the accessible name. Screen-reader users
get "Epiroc, Mining, Design lead and Test" as one link, which is the right
granularity.

---

## 3. The case page as a file

The prose is untouched. What changes is the frame around it.

**A stamped header** replaces the current bare hero: the client name set large,
then the metadata as a tabulated block in the same vocabulary as the index —
`CLIENT`, `SECTOR`, `ROLE`, `VIA` — then straight into `About`.

**A route back.** Today the six case pages have no link to the list they came
from; a reader who arrived from the index can only use the browser's Back
button. Each case gains an explicit return to the index, worded as a file
operation rather than as browser navigation.

**The section chrome** becomes the same window treatment as the front page, so
`About`, `My role`, `Workflow` read as parts of one document rather than three
floating panels.

---

## 4. The chrome

The surface half of the direction — A's system-tool vocabulary, applied to
both the front page and the case pages.

### The window

Every section becomes a window:

- **2px solid border**, no radius anywhere.
- **A title bar**: the section name at the left, a count or status at the right
  (`6 FILES`, `ONGOING`), with a pinstripe fill between them — the repeating
  horizontal hairline that reads as a draggable title bar in every system of
  that era.
- **A hard offset shadow**, `4px 4px 0`, with no blur.

### What is removed

**The frosted panels go.** The glass tokens — `--blur-glass`,
`--color-glass-tint`, `--color-glass-highlight` — are declared in `tokens.css`
and consumed at four places in `layout.css`: the fixed nav over the hero photo,
`.section__terminal`, its chrome bar, and the service-line hover. Plus a fifth
frosted surface declared inline in `components.css`, the sticky `.nav` used on
pages without a hero photo. All five become solid: an opaque ground and a hard
border.

The frosted surface is the most dated thing on the site and it is precisely
what made the pixel icons look borrowed from somewhere else. It is also the
largest readability win available, because a translucent panel over a
photographic hero is the one place here where text contrast is not actually
controlled.

**Dialog backdrops are not part of this.** `.modal::backdrop` and
`.lightbox::backdrop` in `components.css` also use `backdrop-filter`, but they
blur *the page behind an open dialog*, which is a dimming device rather than a
panel treatment. They stay. A blanket "remove every `backdrop-filter`" would
take them with it for no reason.

**`.section__terminal` is modified, not replaced.** It is already a bordered
box with a titled chrome bar — the window is most of the way built. What
changes is its fill (opaque), its border (2px), its shadow (hard offset), and
the pinstripe in the chrome bar. The class names keep saying `terminal`;
renaming them touches every page on the site and is its own job, as the
existing comment in `layout.css` already says.

### The flame budget

Flame appears **exactly twice** on the front page:

1. The offset behind the `CONSULTING` wordmark — the misregistration idea the
   brand is built on.
2. The `ONGOING` stamp on the Sectra row.

The brand rule is that three uses is one too many. Two is deliberate: one is
the printing accident, one is the rubber stamp, and a case-file site that never
stamps anything is missing its own metaphor.

### What does not change

- **JetBrains Mono throughout.** A monospace has been setting prose on this
  site while doing nothing a proportional face could not; the index is the
  first thing here that a fixed advance width genuinely serves.
- **The ground**, `#0a0a0a`.
- **The Streamline Pixel icons stay exactly as they are.** The original
  complaint was that they did not fit. They did not fit *the chrome*. This is
  the chrome that fits them, and re-drawing them would be solving the problem
  twice.

---

## 5. Copy

### The hero lede

Now:

> We provide consulting services in testing, ux/ui design, web production,
> software development and cybersecurity.

Five items, of which the site can evidence two. With About and Services both
gone, this sentence is the only description of the business on the page, and it
sits one screen above a table that reads *Testing, UX, UI* six times.

**It narrows to testing, design and cybersecurity.** Three items, which is
where the voice rule caps a list. Cybersecurity has a thread to stand on:
Sectra Communications is secure communications, that case's own text says
security restrictions limit what it can show, and the consultant bio already
says *I advocate usability, security and aesthetics*. It is the one claim on
the page that runs ahead of its evidence, and it does so knowingly.

### The consultant entry

The existing bio is already right — first person, plain, no mission statement:

> I like exploring and investigating software and solving problems for
> customers. I advocate usability, security and aesthetics.

It stays. What it gains is the `SERVICES` field and the metadata treatment that
matches the index.

### String inventory

| | New | Deleted |
|---|---|---|
| Sector labels (6) | 12 | |
| Column headings `CLIENT` / `SECTOR` / `ROLE` | 6 | |
| Case-page `VIA` label | 2 | |
| Client and `VIA` values (proper nouns, untranslated) | 12 | |
| `6 FILES` count, `ONGOING` stamp | 4 | |
| Return-to-index label | 2 | |
| `SERVICES` field label | 2 | |
| Section title `WORK` | 2 | |
| `hero.lede.consulting` | *rewritten* | |
| `about.*` (label, ledeHTML, body1–3) | | 10 |
| `services.*` (label + 3 × name/body) | | 14 |

About 30 new translated strings and 12 untranslated proper nouns, against 24 removed. Every new one ships in both languages in
the same commit; a half-translated site is a regression the language toggle
makes immediately visible.

---

## 6. Out of scope

- **The case prose.** 3,582 words stay as written.
- **The case photography and its treatment.** 36 images, left alone.
- **The Studio site.** Project 4.
- **TF Classic.** Project 5. Note that `1996/` lives in the landing repo and
  borrows nothing from this one, so this redesign cannot break it.
- **The landing page.** It stays as it is; the split spec settled that.
- **Years on the cases.** Additive later if the information is supplied.
- **A second consultant.** Designed against, not built.

---

## 7. Risks

1. **The front page becomes too thin.** After the deletions it carries a hero
   lede, a six-row table, one consultant entry and a contact block — a little
   over 100 words of prose. This is the intended trade, but it means the hero lede
   and the index copy are load-bearing in a way nothing on the current page is.
   If either is weak, there is no longer a paragraph of prose covering for it.
2. **Derived metadata is my reading, not the owner's.** Every sector label was
   inferred from case prose. A wrong label is publicly wrong on the front page.
   Mitigated by the table in §2 being reviewed before implementation, not
   after. The same applies to `VIA`: Sectra is recorded as True Friends
   because the case says the role is ongoing, which is an inference about who
   holds the contract, not something the prose states.
3. **Cybersecurity outruns its evidence.** Named and accepted above. If a
   reader clicks every case looking for it, they will not find it. The decision
   was taken with the gap in view.
4. **Removing `backdrop-filter` touches three stylesheets.** The glass tokens
   are referenced from `tokens.css`, `components.css` and `layout.css`, and
   some of those rules are shared with components this redesign is not
   otherwise touching. Expect collateral visual change and check the nav and
   the contact form specifically.
5. **The stacked mobile index could read as six paragraphs.** A table that
   reflows badly loses exactly the scannability the redesign is buying.
   Verified at 360px as an acceptance criterion, not assumed.
6. **`1996/` linking.** The last redesign-adjacent bug shipped because a path
   that resolved cleanly pointed at the wrong site. The link checker cannot see
   this class of error. Any change to a cross-site link gets looked at by eye.

---

## 8. Verification

The site has no test framework; verification is the link checker plus explicit
checks a person can repeat.

```sh
node ~/repos/true-friends-website/tools/check-links.js ~/repos/true-friends-consulting
```

Acceptance criteria:

1. **Every index row reaches its case, and every case returns to the index.**
   Twelve links, checked both ways.
2. **The index is usable at 360px** — six entries scannable, no horizontal
   scroll on the body.
3. **Keyboard.** Tab reaches all six rows in order; the focused row shows the
   same inversion as hover; focus is never invisible against the ground.
4. **No string is English-only.** Toggle to Swedish and read the whole page,
   including the index, the stamp and the case-page metadata.
5. **No panel is translucent.** The glass tokens are gone from `tokens.css`
   and unreferenced; neither nav uses `backdrop-filter`; `.section__terminal`
   is opaque. `.modal::backdrop` and `.lightbox::backdrop` still blur — they
   are dimming devices and were never in scope.
6. **Flame appears exactly twice** on the front page.
7. **Contrast.** Yellow-on-ink and the inverted ink-on-yellow row both measured,
   not assumed.
8. **The deleted sections leave nothing behind** — no orphaned `data-i18n` keys,
   no dead CSS for `.service-line` or the about block.
