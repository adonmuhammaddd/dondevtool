# DonDevTool

A local developer multitool — one page, 16 utilities, in a **retro
terminal / CRT** UI. Built with **Next.js 16 + TypeScript (strict)** and **no
runtime npm dependencies**: every tool runs client-side using native Web APIs
(`crypto.subtle`, `crypto.randomUUID`, `TextEncoder`, …) plus small hand-rolled
helpers. Nothing you paste ever leaves your machine.

### Look & feel

- Retro terminal aesthetic: monospace type, terminal windows, scanlines, a
  blinking cursor, ASCII flourishes, and a mascot ("Don") throughout.
- **Two themes** (dark phosphor + light "paper terminal" cream) with a toggle,
  and a switchable **green / amber** phosphor accent.
- `⌘K` to search tools; tool selection lives in the URL hash.

Fonts (JetBrains Mono + IBM Plex Mono) are **self-hosted** from
`public/fonts/`, so the app makes **zero network requests** — truly offline.
Regenerate them with `node scripts/fetch-fonts.mjs`.

## Tools

**Formatter & converter**
- JSON Formatter — format / validate / minify
- JSON ↔ YAML — block-style conversion both ways
- Base64 — encode / decode (UTF-8 safe)
- URL Encode — encode / decode URI components
- Case Converter — camel / Pascal / snake / CONSTANT / kebab / Title / …

**Generator**
- UUID — v4, in batches
- Hash — MD5, SHA-1, SHA-256, SHA-512
- Password — cryptographically random, configurable character sets
- Lorem Ipsum — paragraphs / sentences / words

**Decoder & inspector**
- JWT Decoder — header & payload + exp/iat notes (no signature verification)
- Timestamp — Unix epoch ↔ human date (auto s/ms detection, relative time)
- Number Base — binary / octal / decimal / hex (BigInt-backed)
- Color Converter — HEX ↔ RGB ↔ HSL with a live swatch + picker

**Tester**
- Regex Tester — live matching, highlighting, capture groups, flag toggles
- Cron Parser — validate + preview the next run times
- Text Diff — line-by-line comparison with add/remove stats

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000. Pick a tool from the sidebar (or search); the
selected tool is reflected in the URL hash so refreshes and bookmarks stick.

### Production build

```bash
npm run build
npm start
```

## Architecture

```
src/
  lib/                      # pure, dependency-free logic (unit-testable)
    cases.ts                # case conversions
    colors.ts               # HEX/RGB/HSL parsing & conversion
    cron.ts                 # 5-field cron parser + next-run calc
    diff.ts                 # LCS line diff
    md5.ts                  # MD5 (not in Web Crypto)
    yaml.ts                 # JSON <-> YAML (block style)
  components/
    ui.tsx                  # shared primitives (Field, Output, CopyButton, …)
    registry.ts             # tool catalog (id, name, category, component)
    AppShell.tsx            # sidebar + search + content, hash routing
    tools/                  # one component per tool
  app/
    page.tsx                # renders <AppShell/>
    layout.tsx
```

Route handlers / a backend are intentionally absent — every tool is pure
client-side computation.

## Non-goals

No accounts, no database, no telemetry, no deployment target. It's a personal,
offline utility belt.
