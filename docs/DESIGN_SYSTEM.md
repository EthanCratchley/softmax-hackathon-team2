# Kestrel Kids — design system

The rules behind `app/kestrel-ui.css`. `globals.css` is the team's file and stays as it is; this sheet
loads after it and refines it. Deleting the `import './kestrel-ui.css'` line in `app/layout.tsx` reverts
every decision below.

This is a safety form opened in a parking lot in December. Every rule here answers one of three
questions: **can a parent read it**, **can they hit it with a glove on**, and **can they tell what to do
next**.

---

## 1. The five rules

1. **No uppercase text.** Not in titles, not in labels, not in badges. Casing is decided in the copy,
   never by `text-transform` — what a screen reader announces and what a person sees must match, and
   tracked-out capitals cost more to read at 8:05 a.m. on a phone.
2. **Seven type roles, no more** (§3). A new size is a design decision, not a fix for one screen.
3. **One card idiom.** White surface, hairline border, no shadow. Only things that float above the
   page cast one — today that is the save dock, and nothing else.
4. **Amber means one thing:** something is needed. One amber surface per screen. Never two stacked.
5. **Colour never carries a meaning alone.** Every status is a colour *and* a word.

---

## 2. Colour

Neutrals are one warm-green family; everything else is a weight of the brand or a status.

| Token | Use |
|---|---|
| `--bg` | page background, one tone everywhere |
| `--surface` / `--surface-2` / `--surface-3` | cards / inset panels / track and skeleton |
| `--ink` / `--ink-2` / `--muted` | headings / body / meta |
| `--line` / `--line-2` | hairline borders / stronger borders (inputs) |
| `--brand` / `--brand-hover` / `--brand-soft` | actions, links, selected state |
| `--needs` (+`-bg`, `-line`) | **only** "a detail is missing" |
| `--ok` (+`-bg`, `-line`) | saved, on file, released |
| `--bad` (+`-bg`, `-line`) | validation errors and blocked passes |

Rules:

- Amber is never decorative. If nothing is missing, no amber appears on the screen.
- A disabled primary button keeps its brand colour at 50% opacity; it does not turn grey.
- Contrast: body and UI text meet WCAG AA against their own surface. `--muted` is for meta only,
  never for anything a parent must act on.

---

## 3. Type

One family (the system stack). Seven roles, and the role is named in the CSS comment that defines it.

| Role | Size | Weight | Used for |
|---|---|---|---|
| display | clamp(26–34px) | 700 | the page `<h1>`, once per screen |
| title | 19px | 650 | `<h2>`: a section or a panel |
| card title | 16px | 650 | `<h3>`: a card or a repeated block |
| body | 16px | 400 | prose a parent reads |
| ui | 14px | 550–650 | buttons, inputs, labels, list content |
| meta | 12.5px | 550–600 | context: dates, counts, hints, help |
| numeric | inherits | 600 | codes and counts, always `tabular-nums` |

Rules:

- **Headings are Title Case.** Every `<h1>`, `<h2>`, `<h3>` and form-section title caps the first
  letter of each word: *My Children*, *Drop-Off and Pick-Up*, *Morning Drop-Off*, *Who May Pick Up*.
- **Everything else is sentence case**: intros, help text, error messages, field labels, buttons,
  badges and statuses. *Save my child's details*, *Needs information*, *a code works once*.
- **Small joiners stay lower-case inside a title** — *a, an, and, as, at, but, by, for, from, in, nor,
  of, on, or, per, the, to, via, vs, with* — unless they are the first or last word.
  *Drop-Off and Pick-Up*, not *Drop-Off And Pick-Up*; *A Pass from Another Day*.
- **Both halves of a hyphenated compound are capped.** *Drop-Off*, *Pick-Up*, *Lesson-Day Activity*.
  The verb stays lower-case where it is a verb: *Who May Pick Up*.
- **Names keep their own casing**, even in a title: *Kestrel Kids*, *Jordan Pike*, *iPhone*. The
  function `titleCase()` in `lib/domain/copy.ts` is the executable definition of all of the above,
  and `tests/unit/design-system.spec.ts` walks every heading on every parent screen and fails if the
  copy does not match it — including the reverse failure, a sentence that has drifted into Title Case.

Why Title Case, when GOV.UK and Apple use sentence case: this is not a government service where one
long page is read top to bottom. It is a set of short, repeated cards — *Medical Information*,
*Emergency Contacts*, *Who May Pick Up*, *Consent and Mailing Address* — that a returning parent
scans to find the one section they came for, on a phone, four times a season. Capped words make the
first letter of each word a shape the eye can lock onto, and the fix is a *written rule plus a test*
rather than an opinion, so it cannot drift the way the old all-caps did. The risk is real and worth
stating: Title Case is slower to read in running prose, which is exactly why it is confined to
headings and never applied to a sentence.
- **No letter-spacing except on codes.** `.pass-code` and the desk input get tracking because they
  are read digit by digit; nothing else does.
- **Meta is not a label for a title.** If a line exists only to say what the page is (`Child profile`),
  delete it — the `<h1>` already said it.
- One `<h1>` per page. The status badge sits *with* the title, not above it.
- Line length: prose 58–66ch. Anything wider is a reading problem, not a density win.
- Dates: `Sat, Dec 12, 2026` in headings (from `formatLessonDate`), `Nov 16, 2026, 9:05 a.m.` in meta
  (from `formatDateTime`). Both are built from numeric parts on the server — never
  `toLocaleDateString` in a client component, or the server and browser will disagree and React will
  throw the tree away (`HANDOFF §6c`).

---

## 4. Space, shape, depth

- **Space:** 4px base, six steps — `--s1` 4 · `--s2` 8 · `--s3` 12 · `--s4` 16 · `--s5` 24 · `--s6` 32.
  Page gutter is `clamp(16px, 4vw, 32px)`.
- **Radii:** two only. `--r-control` 10px for inputs, buttons-in-cards, inset panels; `--r-card` 14px
  for containers. Pills (999px) are for badges and answer choices, where the shape *is* the affordance.
- **Controls:** two heights. `--h-lg` 48px for anything a parent must hit (fields, primary buttons,
  the save button); `--h-sm` 40px for secondary and inline actions. No other heights.
- **Depth:** borders do the work. One shadow (`--shadow-float`) for the save dock.
- **Motion:** one `120ms` ease. Everything is disabled under `prefers-reduced-motion`.

---

## 5. Components

**Button.** Three variants: default (outline), `primary` (one per screen region), `ghost` (header
only). Labels are verb phrases in sentence case — *Save my child's details*, *Check pass*, *Show full
screen*. No sentence-ending punctuation.

**Badge.** A dot and a word. `ok` = complete/on file/checked in; `warn` = needs information/expected;
`danger` = blocked. Never a bare colour chip, never uppercase.

**Alert.** `danger` (default), `warn`, `ok`. One sentence plus, at most, a second line of detail. Alerts
appear next to the thing they are about — a save failure lives in the save dock, not at the top of a
three-screen form.

**Field.** Label above, control, error below, hint below that. Labels are sentence case nouns. Errors
say what to do (*Enter a 10-digit phone number*), not what is wrong (*Invalid input*).

**Card.** Border, no shadow, `--r-card`. Cards may contain inset panels (`--surface-2`, no border) —
one level of nesting, never two.

**Section (`<details>`).** Title, one line of help, chevron. No numbers, no per-section status badge:
there is one status with the page title and, when the *server* rejects something, one line in the
section subtitle saying how many fields need a look.

**Save dock.** Sticky at the bottom of the form: what is still needed, when it was last saved, and the
button. It is the only floating element, and the only shadow.

**Activity timeline.** A vertical rule, one dot per event, newest first. Each event carries its lesson
date so "picked up" can never mean last season.

---

### Two shapes we settle once

**A day has two stops.** `Drop-Off and Pick-Up` is drawn as a rail with a dot per stop — morning,
then afternoon — and the dot carries the state (outline: nothing to scan; filled: pass live; team
green: that half of the day has happened). Two QRs of the same size, not one big and one small: they
are the same kind of thing, twice. On a phone the code and the QR stack, because eight digits read
out loud must never wrap.

**A checklist line is the control.** "To complete this profile" is a numbered list of what is
missing, and every line opens the section that fixes it and moves focus there. Any future
"see the section above" instruction should be a button instead — telling someone to scroll on the
page they are already on is the thing this replaced.

### Say it once per page

The rule that removed the most from the parent screens, and the one to apply first when a page feels
noisy: **if two places on the page say the same thing, one of them is wrong.**

| Was | Is |
|---|---|
| Checklist at the top *and* "7 details still needed — open the sections marked…" in the save dock | The checklist only. The dock is silent until there is something only it knows: `Unsaved changes`, `Saved.`, or an error |
| "Last updated Nov 16, 9:05 a.m." in the header *and* beside the save button | The header. The dock shows a time only for a save made in this session |
| A beige pill row plus "open the section that covers each one" | Numbered rows that *are* the control; the instruction is gone because it is now true by construction |
| `pass.issued (pass.pickup)` in the history | `Lesson pass created` — storage formats stay in storage |
| "Optional" as a stray bold word under the subtitle | Part of the subtitle sentence: *Optional · Helps patrol spot your child quickly* |

Three supporting rules:

- **A dock states state, not guidance.** Anything that is true all the time belongs in the page
  body; anything that changes with the click belongs in the dock.
- **Headings are horizontal.** Anything that names a chunk of the page (a fieldset legend, a
  checklist row, a stop on the day's rail) is cased as a heading, even when it is not an `<h*>`. The
  spec test now checks legends, checklist labels and stage labels, not just `h1`–`h3`.
- **No storage key, no enum value.** `medical.conditions`, `checked_in`, `pass.pickup` are for the
  database. A parent reads words. There is a test for this, because the audit log is generated and
  will keep leaking new keys otherwise.

## 6. Casing cheat-sheet

| Element | Correct | Wrong |
|---|---|---|
| Page title (heading) | `My Children` | `MY CHILDREN`, `My children` |
| Panel title (heading) | `Drop-Off and Pick-Up` | `Drop-Off And Pick-Up` |
| Section title (heading) | `Who May Pick Up` | `Who may pick up` |
| Eyebrow / kicker | `Parent portal` | `PARENT PORTAL` |
| Badge / status | `Needs information` | `NEEDS INFORMATION` |
| Button | `Save my child’s details` | `SAVE`, `Save My Child’s Details` |
| Field label | `Relationship to your child` | `Relationship To Your Child` |
| Help text | `Two people we can reach during a lesson` | `Two People We Can Reach During a Lesson` |
| Table/list key | `Collecting adult` | `COLLECTING ADULT` |
| Role | `Parent` | `PARENT` |
| Wordmark | `Kestrel Kids Safety` | `KESTREL KIDS SAFETY` |
| Pass code | `6396 3295` | `63963295` on screen (grouped for reading aloud) |

The line to hold: **headings are capped, sentences are not.** A heading and the sentence under it
sit in the same card and are deliberately cased differently — that contrast is what tells a scanning
eye where the next section starts.

Hyphenation to keep consistent: **drop-off**, **pick-up** (nouns and adjectives), **pick up** (verb).
`Drop-Off and Pick-Up` for the panel; `Who May Pick Up` for the form section.

---

## 7. Accessibility

- Focus is always visible: a two-tone ring (`--ring`) on every interactive element, including
  `<summary>` rows and the radio pills.
- Tap targets ≥ 44px; the primary actions are 48px.
- Every status is text, not colour.
- The save dock is `role=status` / `aria=live=polite`; save failures are `role=alert` and take focus.
- Reduced motion is respected globally.
- Medical values never appear in a projection that does not need them: the desk sees a name, a group,
  a date and an adult — no allergies, no contacts, no address (`lib/services/projections.ts`).

---

## 8. What changed, and why

| Before | Now | Why |
|---|---|---|
| `text-transform: uppercase` + `0.1em` tracking on the page context line, badges, section subtitles, role chips, table keys, the checklist counter | none anywhere | Seven screens were shouting. Capitals cost reading time and hide the difference between a label and a value |
| Two amber blocks (checklist above the form, needed-count in the dock) | one amber block; the dock is neutral until it has something to say | Two warnings read as an emergency |
| Card → card → inset, three idioms, plus shadows on cards | one card, one inset, shadow only on the dock | Depth was decoration |
| `01…05` section numbers and four per-section status badges | no numbers; one page status; "2 fields need a look" only when the server rejects something | Five copies of the same message |
| Section titles in caps, single-column wide text | sentence case, 58–66ch measure | Readability |
| Mixed sizes: 13.5/14/15/16.5/19/23/28/36 | seven named roles | Every ad-hoc size was a local decision that never got reconciled |
| `Last updated …` as its own paragraph under a paragraph | one meta line: group · level · instructor · last updated | Four lines of context where one belongs |
| `Manage health, contact, and lesson-day details for Ava. Instructor: Jordan Pike.` under the title | removed; instructor moved to the meta line | The title already said whose page this is |
