# DonDevTool — Redesign Brief for Claude Design

> Paste everything below into Claude Design. It is self-contained. The goal is a
> complete **visual redesign + design handoff** (design system + key screens +
> states), ready to be implemented in Next.js + Tailwind.

---

## 1. Product in one line

**DonDevTool** is a *local, fully offline* developer multitool — a single-page
web app with **16 utilities** in one place. Nothing is ever sent over the
network; every tool runs client-side in the browser. It's a personal "utility
belt" for a developer named **Don**.

## 2. Tone & personality

Geeky, fast, a little fun. It has a **mascot character** (a chibi/baby-boy
figure — asset provided: `babyboy.png`, ~1022×1024, transparent PNG) that should
feel like Don's on-screen companion. Microcopy is casual and can mix English +
light Indonesian (the current home greeting is literally *"Hai Don 👋 welcome to
DonDevTool"*). Keep that warmth.

## 3. Chosen visual direction — **Retro terminal / hacker**

Lean into a **terminal / CRT / coding** aesthetic, but **legibility and real
usability come first** — this is a working tool people stare at for minutes, not
a gimmick demo. Translate the vibe through:

- **Monospace-forward typography.** A crisp coding mono for UI and IO
  (JetBrains Mono / IBM Plex Mono / Fira Code feel). A second, slightly more
  humanist mono or clean sans is allowed for long descriptive paragraphs if it
  improves readability.
- **Terminal-window chrome.** Panels framed like terminal/editor windows: a top
  bar with the three "traffic-light" dots, a title like `~/dondevtool/json —
  zsh`, thin 1px borders, subtle inner glow.
- **CRT / phosphor accents.** A primary phosphor accent (green **or** amber —
  propose the stronger one, or offer both as selectable "terminal themes").
  Optional, *very subtle* scanline texture and a soft glow on focus/active
  elements. A blinking block cursor `▋` as a motif (in the logo, empty inputs,
  the search field).
- **ASCII / monospace ornaments.** Section dividers, box-drawing characters
  (`┌─┐ │ └─┘`), prompt glyphs (`$`, `>`, `❯`), and `[ ]` brackets used
  tastefully as decoration and for buttons/tags.
- **Status-line language.** Borrow tmux/vim status-bar styling for the footer /
  toolbars (e.g. `-- INSERT --`-style chips, key hints like `^C copy`).

> ⚠️ Guardrails: keep contrast high (WCAG AA), don't let scanlines/glow reduce
> text legibility, avoid pure #000-on-neon eye strain — use near-black and a
> readable phosphor tint. Long JSON/code output must stay easy to read.

## 4. Dual theme (ship BOTH, with a toggle)

- **Dark (default):** classic terminal — near-black background (e.g. a deep
  charcoal, not pure black), phosphor accent, dim grid/scanline.
- **Light:** a **"paper terminal" / vintage CRT-on-cream** or light-IDE
  interpretation — warm off-white/parchment, dark ink, amber or muted-green
  accent. It should feel intentional, not just "dark colors inverted."
- Provide a clearly designed **theme toggle** (sun/moon or `LIGHT/DARK` switch in
  terminal styling). Define full color tokens for **both** themes.

## 5. Mascot usage — **hero + everywhere**

`babyboy.png` should be a recurring character, styled to fit the retro theme
(e.g. a subtle pixelated/CRT treatment, scanline overlay, or phosphor outline —
your call, keep the original art recognizable):

- **Home/welcome:** large hero, greeting Don, with a "booting up…" terminal
  flavor.
- **Empty states:** when a tool has no input yet (e.g. "paste JSON to begin"),
  show the mascot small with a one-liner.
- **Loading / processing:** mascot + a terminal spinner (`⠋⠙⠹…` braille or
  `|/-\`).
- **Success & error:** mascot reacts (happy on copy/success, confused on parse
  error). Design these as small inline illustrations or toasts.
- **404 / unknown route.** Mascot as a `command not found` gag.
- **Sidebar logo / favicon:** a tiny mascot avatar.

Design 3–4 simple "expression states" / poses or framings for the mascot using
the single provided asset (cropping, overlays, accent rings, speech bubbles)
since only one image exists.

## 6. Information architecture (keep this structure)

Single page, **left sidebar + main content**:

- **Sidebar:** brand/logo (mascot) → **search box** (filters tools live) →
  **Home** item → tools grouped under 4 category headers. Active tool
  highlighted. Collapses sensibly on mobile (drawer or top bar).
- **Main content:** for Home → the welcome screen; for a tool → a header
  (tool name + short description) and the tool UI. Content area is **full
  width**.
- URL hash reflects the active tool (`#json`, `#regex`) for refresh/bookmark.

### The 16 tools (design representative layouts for these patterns)

**Formatter & converter**
1. JSON Formatter — big input textarea ↔ formatted output, indent control (2/4/tab/minify)
2. JSON ↔ YAML — direction toggle, input ↔ output
3. Base64 — encode/decode toggle, input ↔ output
4. URL Encode — encode/decode toggle, input ↔ output
5. Case Converter — one input, a grid of all case variants each with copy

**Generator**
6. UUID — count selector, list output, regenerate
7. Hash — input text, rows for MD5 / SHA-1 / SHA-256 / SHA-512 each with copy
8. Password — length slider, char-set toggles, big result + regenerate
9. Lorem Ipsum — unit (paragraph/sentence/word) + count, output

**Decoder & inspector**
10. JWT Decoder — token input, decoded header + payload panels, exp/iat notes
11. Timestamp — epoch input, rows (local/UTC/ISO/relative…), "Now" button
12. Number Base — base selector, value input, bin/oct/dec/hex rows
13. Color Converter — color input + native picker + **live swatch**, HEX/RGB/HSL rows

**Tester**
14. Regex Tester — pattern field + flag toggles (g i m s u y), test textarea, **highlighted matches**, capture-group list
15. Cron Parser — expression field, preset chips, **next-run list**
16. Text Diff — two textareas (original/changed), **line diff** with +/- coloring and add/remove counts

### Recurring UI patterns to design as reusable components
Input field, large code textarea, read-only **output box with corner Copy
button**, **segmented control** (toggle), button (primary/ghost), flag/charset
toggle chips, preset chips, labeled result rows with copy, key/value panels,
color swatch, slider, search input, sidebar nav item, category header, theme
toggle, badges/status chips, toast (success/error), tooltip.

## 7. Screens & states to deliver (dark + light each where relevant)

1. **Home / welcome** (hero mascot, intro, quick-start buttons, full tool catalog as cards).
2. **Tool view — IO type** (use JSON Formatter: filled + valid, and an **error/invalid** state).
3. **Tool view — results type** (use Hash or Color: filled, plus **empty state** with mascot).
4. **Tool view — interactive** (use Regex Tester showing highlighted matches + groups).
5. **Sidebar** expanded, with search active/filtered.
6. **Mobile** layout (sidebar collapsed → drawer/top nav; a tool view stacked).
7. **Micro-states:** copy-success toast, parse-error, loading/processing, 404 "command not found".

## 8. Design tokens & implementation notes

Target stack is **Next.js + Tailwind CSS (v4) + TypeScript**, so deliver
tokens that map cleanly to Tailwind / CSS variables:

- **Color:** full palette for both themes — background layers, surfaces,
  borders, text (primary/secondary/muted), phosphor accent (+ hover/active),
  semantic success/error/warning, syntax-highlight palette for code/output.
- **Type:** mono font stack(s), a type scale (xs→2xl), line-heights tuned for
  code blocks, letter-spacing for the terminal headings.
- **Spacing / radius / borders:** consistent scale; radii likely small/sharp to
  suit terminal feel; 1px hairline borders + the glow treatment.
- **Elevation / glow:** define focus-glow and active-glow instead of soft drop
  shadows.
- **Motion:** cursor blink, subtle scanline drift, copy-flash, spinner —
  durations/easings specified, all respecting `prefers-reduced-motion`.

## 9. Accessibility & usability guardrails

- WCAG AA contrast in both themes (especially neon-on-dark).
- Visible keyboard focus (use the glow), full keyboard nav of the sidebar.
- Don't sacrifice readability of long code/text for theme texture.
- Touch targets ≥ 40px on mobile.

## 10. Deliverables (the handoff)

Please produce a redesign handoff containing:

- A short **style guide**: themes, color tokens (both modes), typography,
  spacing, component states.
- The **component library** (all patterns in §6) in default/hover/active/
  disabled/focus and error states.
- The **key screens** in §7 for desktop + mobile, dark + light.
- The **mascot treatment** sheet (the 3–4 expression framings).
- **Design tokens** as CSS variables / a Tailwind-friendly config snippet.
- Redlines/spacing notes where useful for implementation.

## 11. Asset

Mascot character: **`babyboy.png`** (transparent PNG, ~1022×1024). Treat it as
Don's avatar/companion throughout. Only this one image exists — derive all poses/
expressions from it via framing, overlays, accents, and speech bubbles.

---

*Existing app for reference (structure to preserve, look to replace): left
sidebar with searchable tool list grouped in 4 categories, full-width content,
hash-based tool routing, a welcome/home page with the mascot. Current palette is
violet + neutral; we are replacing it with the retro-terminal direction above.*
