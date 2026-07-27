# Utopia — Next.js site

Ultra-luxury private estates marketing site. Next.js 16 App Router, React 19,
TypeScript, CSS Modules (no Tailwind, no CSS-in-JS). Swiper is the only UI dep.

## Commands

```bash
npm run dev          # next dev on port 3780  ← see constraint below
npm run build        # next build             ← see constraint below
npm run lint         # eslint
npm test             # node --test over src/lib/**/*.test.ts
npm run sync:designer-media   # pull media from the designers' repo (--check to dry-run)
```

**The user runs `npm run dev` themselves and keeps it running.** Do not start,
restart, or kill it. Do **not** run `npm run build` or `rm -rf .next` while it is
up — concurrent writes to `.next` corrupt it ("Another write batch already
active", missing routes-manifest). To verify work, query the running server at
`http://localhost:3780` instead; hot reload picks up edits.

`npx tsc --noEmit` and `npx eslint` are safe at any time (they don't touch `.next`).

## Design sources of truth

Two sources, and **they sometimes disagree — surface the conflict to the user
rather than silently picking one.**

1. **Figma** — a *local* desktop file (no shareable key), read through the
   `figma-desktop` Dev Mode MCP. The file holds several dated revisions side by
   side on page `0:1`, each labelled by a small text frame:
   - `154:1961` = **"24.07" → the current revision; all its frames are `154:*`**
   - `44:1100` = "17.07" (`44:*`), `1:136` = "13.07" (`1:*`) — earlier revisions
   - **This map is going stale.** The 2026-07-27 bug list links Figma nodes in a
     `3649-*` / `3891-*` / `4073-*` / `4110-*` / `4114-*` series, which is a
     *newer* revision than 24.07. Re-derive the node map from a fresh
     `get_metadata` on `0:1` before trusting any `154:*` id below, and ask the
     designers which revision is current.
   - Key 24.07 nodes: home desktop `154:4120`, tablet `154:5177`, mobile
     `154:6204`, footer `154:2140`, nav-bar states `154:7489`/`154:7512`, open
     menu `154:7535`, Careers `154:8340`, Job Opening `154:1974`, cookie card
     `154:8226`, apply-terms dialog `154:2258`.
   - The ultra-wide `154:*` frames ("Section 2/3/4", 14000px) are animation
     storyboards, not layouts to build.
   - Careers `154:8340` (desktop) / `154:5472` (tablet) / `154:3552` (mobile);
     mobile open menu `154:7935` (collapsed) and `154:7993` (expanded); the dock
     band `154:8318`; the mobile cookie sheet `154:8332`; the mobile footer
     `154:6340`; the hero responsive study `154:5992` (see below).
   - **The MCP dies after roughly 6–8 calls** and only a session restart revives
     it — reopening Figma does not. So **spend the first call on `get_metadata`
     for page `0:1`**: it exceeds the token limit and is written to a file under
     `tool-results/`, and that one file carries x/y/w/h for *every node*, which
     covers layout, spacing and block structure with no further calls. Parse it
     with a script (top-level frames are at 2-space indent) and save the live
     calls for `get_design_context`, i.e. colours, type, radii and borders.
     If a node that answered earlier starts failing, the connection is gone —
     do not keep retrying other nodes.

2. **The designers' static prototype repo at `../Utopia`** (EmbacyDev/Utopia) —
   plain HTML/CSS/JS, and the source of truth for *behaviour* (scroll choreography,
   transitions) that Figma cannot express, plus for **media files** (originals beat
   Figma exports).
   - **Desktop anchors: `desktop_v8` and `desktop_v9`** — the two builds the
     client is choosing between (see "Two design variants" below). GH Pages
     still serves the older `desktop_v5` at the root; ignore that. The v3/v4/v5
     hero→destinations treatments are all superseded — do not port them.
   - **Mobile anchor: `v3`**.
   - Commit timestamps matter: a prototype commit made *after* a Figma frame
     usually reflects a newer decision.

## Two design variants (the client is still choosing)

The designers shipped two desktop builds that differ in their corner language
and in some scroll choreography. Both are live at once:

| variant | prototype | how to see it |
|---|---|---|
| `rounded` (default) | `desktop_v8` | `/?variant=rounded` |
| `sharp` | `desktop_v9` | `/?variant=sharp` |

The choice persists for the browser session, so in-app navigation keeps it.
`NEXT_PUBLIC_SITE_VARIANT` sets what an untouched first load shows.

- **CSS side**: `--utopia-radius-*` in `tokens.css`, overridden under
  `:root[data-variant="sharp"]`. Anything that reads those tokens switches for
  free — so use them rather than literal px. One-off radii that must keep their
  rounded value use `min(<px>, var(--utopia-radius-cap-card|control))`.
- **There are exactly two radius families, and picking the wrong one is
  invisible in `sharp`.** Both prototypes collapse everything to 2/6/7 in the
  sharp language, so a control that wrongly reads a card token looks fine there
  and is stranded at 16px in the rounded one, where controls are *fully pill*.
  That is what made the buttons disagree across the site.

  | | rounded (v8) | sharp (v9) | for |
  |---|---|---|---|
  | `--utopia-radius-control` | 100px | 2px | every button, pill, arrow, glass surface |
  | `--utopia-radius-card` | 12px | 6px | hero side card, inactive PW card |
  | `--utopia-radius-card-active` | 16px | 7px | hero centre card |
  | `--utopia-radius-card-lg` | 16px | 6px | active PW card, menu card |
  | `--utopia-radius-frame` | 24px | 0 | the Opening frame |

  `--utopia-radius-sm/md/lg` are *card* values — never reach for them on
  something clickable. `--utopia-radius-card-n` / `-card-active-n` are unitless
  twins that exist only because the hero multiplies its corners by a scale that
  is itself a length (below), and `length * length` is not valid `calc()`.
- **JS side**: `src/lib/site-variant.ts` carries the per-variant animation
  constants (the fullwidth section's scale ramp differs between the builds).
- **Watch out**: a component that pins a radius inline opts itself out of the
  switch — that is exactly what `GlassSurface`'s old `radius = 16` default did,
  and it silently froze every glass control in the rounded language.

**They diverge structurally on the destinations screen** — this is not just
radii, and it is measured off both builds:

| | `rounded` (v8) | `sharp` (v9) |
|---|---|---|
| image | inset card filling the gutter column: 1200 @1440, 1680 @1920, 2320 @2560 | full-bleed `100vw`, runs to both screen edges |
| radius | 28px | 0 |
| bottom | 48px clearance | flush to the bottom of the screen |
| crop | `object-position: 50% 50%` | `50% 100%` (taller crop, subject holds the lower edge) |
| section title | `--utopia-section-title-size` (36→40) | that minus 2px (34→38) |

Everything else on that screen is identical between them: 120px gutters, an
836 title, a 534 body (640 past 1800), the 352 filter row and the 424 nav pill.
The fork is expressed as tokens (`--utopia-dest-image-*`, `--utopia-dest-title-delta`)
plus one JSON field, so neither component branches on the variant itself.

**Figma 24.07 draws the v8 version** (`154:4164` is a 1200-wide "Section card"
at x=120). It is not a conflict — Figma simply documents the rounded build.

## Layout conventions

Breakpoints (tokens in `src/styles/responsive.css`):

| tier | width | notes |
|---|---|---|
| mobile | `<640` | |
| tablet | `640–1023` | |
| desktop | `≥1024` | `--utopia-layout-max: 1440px` |
| large | `≥1900` | the "1920 design tier"; 1900 so a 1920 display with a scrollbar qualifies |

**The hero is the exception**: it switches to the desktop layout at **768**
(`HERO_DESKTOP_BREAKPOINT_PX`), because the Figma tablet-768 frame uses the
desktop layout system. It also has two separate component trees — `HeroSwiperMobile`
(<768, Swiper) vs the card-track engine — JS-branched, with the desktop tree as SSR.

The home page column `.page` is capped (`max-width: 1440px`, 1920 at ≥1900) and
centred. Sections that must be full-bleed break out with
`width: 100vw; margin-left: calc(50% - 50vw)` — on desktop the hero, ecosystem,
opening and footer all do this, and keep their own gutter via
`--utopia-site-pad` (the prototype's `--site-grid-pad`). Days is deliberately
left in the column: it stays left-anchored and its cream background matches the
page, so breaking it out would shift the composition without changing what you
see. **If you add a section with its own background, it needs the breakout
too** — otherwise it paints a 1440-wide band with gutters.

**Days' left padding is not a constant — it is what centres the active card.**
Both prototypes derive it as `50vw − (title + gap + activeW/2)`: `max(120px,
50vw − 580px)` on desktop, `50vw − 596px` past 1800, `max(96px, 50vw − 740px)`
past 2000, where 580/596/740 are exactly those sums. Measured on v8 and v9, the
card centre lands on the screen centre at 1600/1920/2560 and within 8.5px at
1440. The old `padding-left: 328px` at ≥1900 came from the 13.07 frame
`1:1763` and left the card **31.5px right of centre at both 1920 and 2560**,
while the card metrics beside it (521/417/27) had already been taken from the
prototype's ultra tier, whose pad formula is the one above. It is now
`max(96px, calc(min(100vw, 1920px) / 2 - 740px))` with a **96px** title gap —
the ultra tier's own numbers — which reproduces the prototype's x=1019 at 2560
exactly. `min(100vw, 1920px)` is the page column, and the column is centred, so
column centre and screen centre are the same point. Below 1440 the padding
floors and the belt shrinks instead (`--pw-scale`, see the Days notes).

Home section order (`src/app/page.tsx`): Hero → **Ecosystem** (this is the
"destinations" section: heading + Tropical/Urban/Alpine tabs + big image) →
Opening → Days → Footer.

## Typography on wide screens

The prototype does **not** scale type fluidly across the whole range, and
copying a naive `clamp(…, vw, …)` over it will miss every designed value. It
holds the numbers flat, ramps them over a single **1800→1920** window, holds
flat again to 2000, then switches the ultra-wide tier to a *control scale*
rather than more type growth. Ported verbatim into `tokens.css`:

| token | ≤1800 | 1920+ | ≥2000 |
|---|---|---|---|
| `--utopia-hero-title-size` | 40 | 48 | 44 (× 1.25 controls) |
| `--utopia-section-title-size` | 36 | 40 | 40 |
| `--utopia-body-copy-size` | 17 | 18.89 | 18.89 |
| `--utopia-filter-tab-size` | 18 | 18 | 19 |
| `--utopia-control-scale` | 1 | 1 | 1.25 |

Each clamp's lower bound equals the flat value at exactly 1800, so nothing
moves at or below it and there is no jump at the breakpoint. Both media queries
are gated on `min-aspect-ratio: 1101/1000` — a tall display is not a wide one
even at 2000px across. **Use these tokens for display type instead of literal
px**, or the text freezes on wide screens the way the old hardcoded 38/40 did.

## The hero card track scales; it does not step

Figma's hero study `154:5992` holds the same screen at **five** widths — 768,
1223, 1440, 1839 and 2879 — and both prototypes drive all of them from one
number (`computeSlots`):

```
scale = 1                                       up to 1440
scale = 1 + (vw - 1440) * (1.1752266 - 1) / 399 ramping to 1839
scale = 1.1752266                               held to 1897
scale = clamp(1.27, vw * 1.34 / 2638, 1.98)     from 1897 — the five-card layout
```

1.1752266 is the designers' own constant (`554.7069702148438 / 472`). Width,
height, gap, border, radius and every caption metric are that scale times the
1440 value, so **never add a second hard tier** — an old `@media (min-width:
1900px)` block pinning 620×348 / 496×280 came from the 13.07 frames and froze
the track. Past 1897 the composition itself changes: five cards, not three.

It is carried as `--hero-card-unit`, a **length** equal to `1px * scale`, and
every metric is written `calc(<number> * var(--hero-card-unit))`. A unitless
custom property cannot be built from `100vw` (`1 + <length>` is invalid calc
and silently voids the property, collapsing every card to `width: auto`).

Two places where the sources disagree, both resolved toward the prototype
because it was committed after the Figma revision:
- at 1440 the prototype multiplies by a further **0.95** (`compactHeroCards`,
  which also fires below 1600 on short viewports) to fit its own hero height;
  Figma's 1440 frame draws the full 472×266 and that is what we render;
- at 2879 Figma still draws the 1.1752 ramp value while the prototype's
  five-card branch gives ~1.4624 (measured: 690×389 side, 863×484 centre).

## Slider content lives in JSON

`src/content/slides.json` holds every slide of every slider (hero,
destinations, opening, private-world) with its copy, media and framing.
`src/lib/slides-content.ts` is the only reader; the four carousel modules
re-export from it with their public API unchanged, so components are already
decoupled for the CMS swap. Framing composes in three layers — file defaults,
slider-wide, then per-slide — and reaches CSS as `--slide-*` custom properties
so a per-slide crop composes with an animation instead of overwriting it.

The prototype ships **no per-width image sources** (no `srcset`, no `<picture>`,
no media-query background swaps): what changes with width is the frame, not the
file. Its only per-image treatments are the two recorded in the JSON.

## Gotchas (each of these cost real debugging time)

- **A section that ties the header's z-index wins, because it comes later.**
  The bar is `position: fixed` on the home page, so anything with an equal
  `z-index` and a later DOM position paints straight over it — that is what a
  bare `z-index: 2` on `.nav` did against DaysSection. The header reads
  `--utopia-z-nav` (100); sections keep their small local values. Two follow-on
  traps: a section's `z-index` may sit on an *inner* element whose root is
  `position: relative` with `z-index: auto`, which creates no stacking context,
  so it still competes with the bar (Ecosystem and Opening are both like this);
  and once the bar correctly paints on top, any content sitting under 72px from
  the top of a pinned section is now hidden by it — which is how the Opening
  copy's 8px error surfaced. Figma pins that copy at exactly y=72 for this
  reason, so use `var(--utopia-nav-height)`, not a literal.
- **The nav bar and the dock are one affordance in two shapes**, so they switch
  at the same width (640) — `.nav`'s `display: block` and `.dockWrap`'s
  `display: none` must stay in lockstep or both appear at once. The dock is
  phone-only; from 640 up the close X lives in the bar, which means the menu
  overlay has to start *below* the bar and let it stay on top.
- **The nav has a cap, but it is not the 1440 layout column.** `max-width:
  1440px` parked the wordmark 360px from the edge at 1920 and 680px at 2560.
  The real cap is `--utopia-nav-max` (1920) with `--utopia-site-pad` gutters:
  120px from the edge at every width through 1920, then the bar centres — 440px
  at 2560. Figma `154:5992` states it as 1838 wide with 80px gutters, the same
  content span, and its ultra-wide frame puts the wordmark at 601 where we put
  it at 600. The prototypes never cap the bar at all, so this one follows Figma
  deliberately. Gutters are always `--utopia-site-pad`, never a hardcoded 120.
- **`margin-left: calc(50% - 50vw)` only breaks an element out if its container
  is viewport-wide.** Inside a padded column it resolves against the column and
  lands somewhere arbitrary. Inside one, use `align-self: stretch` with a
  negative inline margin equal to the padding instead.
- **`overflow-x: hidden` silently breaks `position: sticky`** on descendants — it
  makes the element a scroll container. `html, body` use `overflow-x: clip`
  instead; keep it that way or the desktop hero pin dies with no error.
- **The page background has to sit on `html`, not `body` alone.** `body` only
  propagates its background to the canvas while the root has none *and* is not
  itself a scroll container — and the `overflow-x: clip` above makes it one. With
  the cream on `body` only, the strip a phone reveals when it rubber-bands past
  the footer painted the UA's white, which reads as an empty block below the
  footer. Nothing is in the DOM there: every route ends within half a pixel of
  its footer.
- **The Next image optimizer caches derivatives by filename.** Replacing an asset
  in place keeps serving the stale rendition until `.next/cache/images` is cleared
  (which we can't do while dev is running). For small transparent PNGs, render
  `<Image unoptimized>` so the raw file is served.
- **`next/image` requires integer `width`/`height`.** For fractional display sizes
  set the size in CSS and pass an integer to the component.
- **iOS muted autoplay**: set `video.muted = true` as a *property* (not just the
  attribute), call `video.load()` when `readyState < 2`, and retry `play()` on a
  timer — Safari rejects autoplay for not-yet-visible elements.
- **React's `onPointerMove`/`onTouchMove` are passive**, so `preventDefault()` in
  them is ignored. Horizontal carousels that must block page scroll attach a
  non-passive `touchmove` listener via `addEventListener(..., { passive: false })`.
- **CSS Modules obey source order** for same-specificity rules. The ≥1024
  blocks are deliberately last in `hero-section.module.css` /
  `ecosystem-section.module.css` so they beat the ≥768 and ≥1900 rules above.
- **The licensed fonts landed on 2026-07-27 (`06649c6`) and this section is the
  post-swap state.** The designers supplied the real families as `.woff`, which
  replaced the trial `.otf` cuts. `public/fonts/` now holds six faces:
  `NB-International-Pro-{Regular,Italic,Bold,Bold-Italic}.woff` and
  `GTUltraMedian-{Light,Regular}.woff`. The old
  `nb-international-regular.otf` / `gt-ultra-median-{light,regular}.otf` are
  still on disk but **no longer referenced** by `fonts.css` — they can go.
  Three things this changed, all previously recorded here as permanent:
  - **There is a real Bold now**, so `<strong>` from the ATS rich text in
    `JobDescription.tsx` is no longer synthesised. Measured on
    `/careers/<slug>` at 768 and 1440: 104 glyphs render from
    `NBInternationalPro-Bol`. `<em>` likewise has a real Italic.
  - **The family is NB International *Pro*** — the mismatch against Figma's
    `NBInternationalPro-Reg` is closed. `--utopia-font-body` in `tokens.css`
    reads `"NB International Pro"`; the old non-Pro name is gone from `src/`.
  - The trial GT Ultra Median's missing punctuation (no apostrophe, so Chrome
    fell back to Georgia mid-word in "It's all yours") is fixed: the licensed
    cut carries 487 codepoints against the trial's 243.
  Still true: **the brand has no weight beyond 400 for GT Ultra Median** (300
  and 400 only), so an `<h2>`/`<h3>` whose class does not set `font-weight`
  inherits the UA's `bold` and gets a synthesised face. `globals.css` resets
  headings to `font-weight: inherit`; keep it, and set the weight in the
  component rule. `button { font: inherit }` is there for the same reason — the
  UA's default button font is not inherited.
  A whole-project audit (`/`, `/careers`, `/careers/<slug>`, `/terms`,
  `/privacy`, 404 × 378/768/1440, reading the *rendered* face per node via
  CDP `CSS.getPlatformFontsForNode`) is **clean**: every glyph on every route
  comes from one of the six real faces, and no button resolves to a non-brand
  family. The one remaining synthesised case is `<code>` on the internal
  `/design-system` page.
  The files are `.woff` with no `woff2` twin. `layout.tsx` preloads
  `NB-International-Pro-Regular.woff` (the dominant face on every route) to
  shorten the `font-display: swap` window; the display face is deliberately not
  preloaded.
- **`scroll-snap-align: start` ignores the scroll container's padding.** A
  carousel with `padding-inline` for its gutter snaps straight past it on load,
  so the gutter silently disappears. Pair every such padding with a matching
  `scroll-padding-inline` (the Careers work track does).
- **Careers runs its own gutters, not `--utopia-content-inset`.** The shared
  tablet tokens cap the column at 480, where Figma's 768 Careers frame draws
  648 inside 60px gutters. `careers.module.css` declares `--careers-inset` on
  the section roots — *not* on `.page`, because that class comes from
  `src/app/careers/careers-page.module.css`, so a `.page` rule in the component
  stylesheet matches nothing and the variables never land.
- Mobile viewport height must stay **stable** (`100svh`). JS-driven or `dvh`
  heights make the page jitter as browser chrome hides/shows, and
  `env(safe-area-inset-bottom)` changes for the same reason — keep it out of
  anything that affects layout.
- **A DOM scroll jump and the React state that describes it have to land in
  the same frame.** The hero's loop normalisation writes `track.scrollLeft`
  back a whole copy, but the card sizes come from `rawScrollIndex` state; React
  committed it a frame later, so one paint showed every card unfocused (472
  instead of 590, centre 236px off) and `.cardAnimated`'s 500ms transition then
  eased it back — the visible jerk at the Jericoacoara → Roca seam, the one
  place the wrap fires. `normalizeLoopInner` wraps both in `flushSync`.
  Measured across the seam: `dx/dw/dh = 0` at 768/1440/1920, both directions.
- **`theme-color` is a page meta tag, not the manifest.** `manifest.ts` only
  reaches an installed PWA; a plain Safari tab paints the Dynamic Island strip
  white without `<meta name="theme-color">`. It comes from `export const
  viewport` in `src/app/layout.tsx`, which must repeat `width`/`initialScale`
  (exporting `viewport` drops Next's defaults). Do **not** add
  `viewportFit: "cover"` — that pulls the layout under the cutout and into
  `env(safe-area-inset-*)`, which the bullet above forbids.
- **Slider media must be unselectable *and* undraggable.** `user-select: none`
  alone still lets Blink/WebKit peel the photo off as a drag image, which kills
  drag-to-scroll mid-swipe; `-webkit-user-drag: none` is the only thing that
  stops it, and it does **not** inherit, so it goes on the `<img>`/`<video>`
  itself (hero `.bg`/`.bgVideo`, swiper `.bgImage`, ecosystem `.bgImage`,
  opening `.bgVideo`, private-world `.cardImage`).

## Verifying visual/scroll work

There is no Playwright, but **headless Chrome is installed** at
`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`. For anything
scroll-driven, drive it over CDP (Node has a global `WebSocket`): launch with
`--headless=new --remote-debugging-port=…`, then `Page.navigate`,
`Runtime.evaluate` to scroll and read geometry/CSS vars, `Page.captureScreenshot`.
Measure numbers, don't eyeball guesses — that is how the hero-handoff width bug
was found.

Always drive it through `Emulation.setDeviceMetricsOverride`. Chrome's plain
`--screenshot --window-size=…` flag does **not** set the viewport reliably and
produces off-centre, misleading images — it once looked exactly like a layout
regression that measurement disproved.

Quick non-visual checks: `curl http://localhost:3780/` for SSR markup, and fetch
the `/_next/static/chunks/*.css` chunks to confirm which rule actually wins.

## State of the work

Nothing is committed yet — **all work sits uncommitted in the working tree on
`main`**. Offer to branch and commit when the user is ready.

Latest batch (five fixes plus one follow-up, all measured):

- **The dock is phone-only now, and the boundary is 640.** `.nav` switched on at
  640 while `.dockWrap` only switched off at 1024, so the whole 640–1023 band
  showed a 72-tall bar *and* a 52-tall dock. Figma answers 640 from three
  independent 24.07 frames — tablet home `154:5211`, tablet Careers `154:5473`
  and the hero study's 768 frame `154:6196` all draw a 768×72 `Navigation bar`
  and none draws a "Request a stay" dock; the dock band is only ever on a 378
  artboard (`154:8318`, `154:6395`). Verified at 639/640/767/768/1023/1024 in
  both variants: exactly one of the two is on screen at every width.
  **This forced a second change**: at 640–1023 the overlay used to be
  full-viewport and relied on the *dock* to close the menu, so removing the dock
  would have left the tablet menu with no way out. Both tablet open-menu states
  (`154:7787`/`154:7861`) keep the close X in the 72-tall bar with the panel
  starting at y=104, so `.menu { top }` and `.navOpen`'s z-index lift both moved
  from 1024 down to 640, and the menu's own centred wordmark is hidden from 640
  (the bar already carries one — it was drawing twice, stacked).
  **The tablet dock offsets were deliberately left alone.** `--utopia-dock-band`
  and `--utopia-dock-offset` looked like they would leave a 72px hole, but
  measured: every tablet consumer is either hidden at ≥640 (the mobile footer,
  the cookie band) or falls inside the hero photograph, so nothing blank
  appears — the footer still ends within 0.4px of the document bottom at 378,
  640, 768, 1023 and 1440. Zeroing them would instead have dropped the 768 hero
  cards 72px (clearance 211 → 139) *away* from Figma's `154:6178`, which wants
  267.5. Our 768 `.cardsTrack` is h=331, byte-identical to that frame, but the
  whole 768 hero is 855 tall against the frame's 994 — **a pre-existing
  deviation, not part of this batch, and worth its own pass.**
- **The header has its own layer, `--utopia-z-nav: 100`.** `.nav` carried a bare
  `z-index: 2`, exactly tying DaysSection's `.section`, so Days won on source
  order and painted over the fixed bar. Proven at 1440: Days overlaps the bar by
  all 72px and the bar is now topmost with Days directly beneath it. Ecosystem
  and Opening carry their `z-index: 2` on inner elements, not section roots, but
  they were latent cases of the same thing — a sweep that parks every section at
  the top of the viewport and hit-tests the bar band is clear at 1440/1024/768 in
  both variants. (The hero flags its backdrop images, correctly: the bar is
  `rgba(0,0,0,0)` there.) **Do not give the bar a hand-picked integer** — the
  scale is nav 100 < overlay 150 < menu 200 < dock 210, and `.navOpen` still
  lifts to `calc(var(--utopia-z-menu) + 1)`.
- **The menu's featured card is aligned to the close X by construction.** The
  panel had its own `--panel-inset` ramp and capped at `--utopia-desktop-width`
  (1440) while the bar caps at `--utopia-nav-max` (1920) — at 1024 the panel
  inset came out 36.8px against the bar's 85.3px, so the card could not line up
  at any width except by accident. `.panelGrid` now shares the bar's exact box
  (same cap, same `--utopia-site-pad` gutters, and `.tabletBar` reads that token
  too), and the card fills its track instead of a fixed 374. Measured delta
  between the card's right edge and the close button's right edge: **0.0 at 640,
  768, 1023, 1024, 1270, 1440, 1920 and 2560, both variants.**
  The split is `793fr 387fr` — a *ratio*, because Figma's two desktop instances
  scale it (793/387 of 1180 at 1440; 680/330 of 1010 in the 1270 instance
  `154:7635` — the same 66.1/32.25 split). That reproduces both to within a
  pixel where a fixed left column starved the card to 40px at 1024 and a bare
  `1fr` blew it to 867 at 1920. **Past 1440 Figma has no open-menu frame**, so
  the card just keeps the ratio (544 at the 1920 cap, and it stops there) —
  the one unverified width.
  `.cardImage` is now percentages of the card (155% tall, `top: 53.571%`), not a
  fixed 403×434, so it survives the fluid width. Both Figma sizes agree once
  written that way: it lands the layer top at −67, which is literally the tablet
  instance's `154:7852` y=−67 and equals the desktop "centred, nudged 10px down".
  **The card is new on tablet** (`154:7851`, 648×280 below the links with a 40px
  gap, spanning the content column) and stays absent on phones — neither
  `154:7936` nor `154:7993` contains a Pic frame at all.
- **The footer brand signature links home.** `aria-label` is on the link, not
  left to the images: only the wordmark has a non-empty alt and it is
  `display: none` on tablet, so the accessible name would have been "Utopia" on
  desktop and *nothing* on tablet. Not added to the mobile footer, which has no
  brand mark — Figma `154:6340` opens straight on the link columns.
- **The footer video never played, at any width, and it was a race.** With
  `preload="none"` nothing loads until something calls `play()`, so `readyState`
  is 0 at mount and the `loadeddata` listener is always still armed; the
  IntersectionObserver's `play()` is what starts the load, and `loadeddata` then
  landed *after* it and called a handler that **paused**. Measured before:
  `readyState: 4`, `paused: true`, `currentTime: 0` at 1440, 768 and 378 alike —
  which is why mobile was dead too, not just desktop and tablet. **desktop_v9
  already only seeks in that handler; v3's `footer-video.js`, which this was
  ported from, calls the pausing variant** — so the port carried the older bug.
  Now it seeks without pausing and re-issues `play()` if the footer is still in
  view. Verified with real wheel scrolling at all three widths: playing, and the
  event log shows `loadeddata` and `playing` in the same millisecond, i.e.
  exactly the window the old `pause()` sat in.
- **Follow-up, and a direct consequence of the z-index fix**: the Opening
  section's copy was `padding-top: 64px` where Figma says **72** at both tiers
  (desktop `154:4206` and tablet `154:5263` are both at y=72) — and 72 is the
  bar's height, which is the point, since the section is pinned full-viewport so
  the copy has to start where the bar ends. It is now
  `var(--utopia-nav-height)`. Nothing showed for the 8px error while the bar lost
  the stacking contest; the moment the header took its own layer the bar sliced
  the "Opening in 2027" eyebrow in half. Measured after: eyebrow top 72 (Figma
  72), heading 118 (Figma 117), clearing the bar exactly at 1440 and 768.
  Worth knowing: **`154:4162`, the nav instance over the home sections, is
  `hidden` in Figma** — the only bar it draws is the one inside the hero.

Previous batch (six fixes, all measured):

- **Private World framing was the mobile prototype's, applied everywhere.**
  `center 35%` comes from v3's `.days__card img`; desktop_v8/v9 set
  `object-position: 50% 50%` on all three cards and Figma's mobile active card
  is centred too (`154:6319` overhangs its 276×366 frame by half the overflow
  on each axis). Now `50% 50%` in `slides.json`. Figma's two desktop cards sit
  ~12px lower still (`154:4229`/`154:4232` are bottom-anchored, 4.65% overflow)
  while the third is top-anchored — eyeballed, so the prototype's rule leads.
- **Mobile Private World followers are centred, not top-aligned**
  (`inactiveY: 61` = (366−244)/2, Figma `154:6322`/`154:6327`). Every wider
  tier already centred them; only mobile carried v3's `DESIGN_INACTIVE_Y = 0`.
  The belt also bleeds to the right screen edge now (Figma's container is
  559.4 wide inside a 378 artboard) — `.trackWrap` had been clipping at the
  16px gutter, which lopped 16px off the peeking card and left a cream strip.
- **The Careers filter pills keep a literal `100px` radius in both variants.**
  The variant fork comes from v8 vs v9 and neither prototype has a Careers
  page, so Figma 24.07 is the only source and it draws pills. The page's other
  controls (`.rolePill`, `.showMore`, `.workNavBtn`, `.ctaButton`) still read
  `--utopia-radius-control` and do square off in sharp — **still open**: pin
  them the same way if the client picks v9.
- "Learn more" on Careers now links to `/` — a **deliberate exception** to the
  no-destination-stays-inert rule in `src/lib/routes.ts`, marked with a TODO.
- `theme-color`, `-webkit-user-drag` and the hero loop seam: see Gotchas.

**Home is aligned** to v8/v9 and Figma 24.07 across 1440/1920/2560 in both
variants, verified by measurement: nav gutters and the 1920 cap, the whole
destinations screen, the wide-screen type scale, the hero card-scale ramp with
its five-card tier past 1897, and the two radius families. Slider content now
lives in `src/content/slides.json`. Mobile is done too — menu (Experiences in,
"Destinations" heading out), the cream dock band, the full-bleed cookie sheet,
footer socials/order/clearance, and the Opening copy unclamped.

**Careers is now aligned** to Figma 24.07 at all three widths in both variants,
verified by measurement. Every section lands within a few px of its frame:

| block | mobile | tablet | desktop |
|---|---|---|---|
| hero | 481 / 481 | 321 / 322 | 321 / 322 |
| jobs | 1149 / 1139 | 1064 / 1022 | 1159 / 1110 |
| Our team | 1534 / 1528 | 1121 / 1123 | 722 / 723 |
| 5 values | 1064 / 1063 | 1540 / 1540 | 1278 / 1278 |
| Work | 671 / 672 | 854 / 854 | 710 / 710 |
| CTA | 552 / 549 | 626 / 626 | 482 / 482 |
| footer | 640 / 644 | 880 / 880 | 640 / 640 |

(Figma / ours.) **The jobs section is deliberately short of its frame** — Figma
mocks five identical 130-tall cards with both an Office and a Remote row, while
the live ATS returns roles that often have only one. Nothing to fix there.

**The two job filters are faceted.** Each dropdown is built from the postings
matching the *other* filters, so picking a Department leaves only the locations
that department actually hires in, and picking a Location leaves only the
departments hiring there — the desktop sidebar list re-scopes the same way. The
pure logic lives in `src/lib/career-filters.ts` (`narrowPostings(..., except)`
is the whole trick: a facet is left out of its own scope) with tests in
`career-filters.test.ts`. Two details worth keeping: `withSelected` re-adds an
active value the other facets would have hidden, so a filter is always
clearable, and picking a value that strands the other facet releases it rather
than leaving an unexplained empty list.

What changed: the filters became a search bar over a Department/Location
dropdown pair below 1024 (the department only stays a sidebar list at 1024+);
the role card puts its chip beside the title from 640 up and above it on
mobile; "Our team" is a featured tile beside a 2×2 grid on desktop and stacked
below 1024; "5 values" is a mobile accordion, a 2-column masonry on tablet
(card 2 spans both rows) and 2-over-3 on desktop; Work and CTA took their
24.07 copy, colours (`#5c2923`, `#e2d6cc`) and arrow states. The tablet footer
is pinned to 880 — that fix is in the shared `FooterSection`, so it moves the
home page's tablet footer too (desktop 640 and mobile 644 are unchanged).

Three things worth a second look:

- **The team photographs are all new** and were pulled from the Figma asset
  server, not the prototype. The featured Hospitality tile carries a different
  picture on desktop (tall tea-pouring crop) than on tablet/mobile (spa towels)
  — that is deliberate in Figma, and `CareerTeams` composes the two into a
  `<picture>` by hand because `next/image` has no art-direction API. The
  desktop plate had a Weibo watermark baked into the bottom edge; it is cropped
  out. The four small cards' Figma frames are stacks of un-deleted alternates,
  so each takes the topmost layer.
- **Figma contradicts itself on the mobile values card.** `154:3719` sizes the
  copy column at 199.8 but the body text node inside it at 243, and parks the
  44px chevron at x=314 of a 314-wide box. Taking the chevron out of flow is
  what reproduces the stated 346×196; keeping it in flow wraps the body to
  seven lines and the card grows to 237.
- **The two Figma frames disagree on the Work card titles.** Desktop says
  "Exceptional guests / Extraordinary locations / Exceptional colleagues /
  Competitive package"; mobile still carries the older wording and the
  "Expectional guests" typo. The desktop naming leads. Desktop also drops the
  "everywhere" badge that mobile keeps — the badge is rendered at every width.

**Job Opening is now aligned** to Figma 24.07 (`154:1974` / `154:2740` /
`154:3200`) at 378/768/1440 in both variants, verified by measurement. Every
fixed-height section lands on its frame — Work 710.38/710, Team up 888.39/888,
CTA 481.59/482 at 1440; 854.38/854, 1075.58/1075, 637.59/638 at 768;
671.56/671, 798.88/801, 548.69/552 at 378. The hero and the description card
run long against their frames only because the copy is live ATS text, not the
mock: the hero's structure (589 column, 48px title, 505/419 measure) matches
exactly and every extra pixel is one more wrapped line.

Notes for whoever picks this up next:

- **`154:2034` and `154:2104` are `hidden` in the desktop frame.** The live
  Work block is `154:2047`; the other two are alternates. Check `hidden` in the
  geometry dump before building an overlapping frame.
- **The terms pop-up has three sizes, and mobile is not just a smaller
  desktop**: 792/64+72/r28 → 536/56/r28 → 350/**32**/**r16**, with the title
  dropping 26→22, the body 16→15, the buttons 44h/32px/17px → 40h/24px/16px and
  the close corner insets 32 → 24 → 12. `154:3398` and `154:3467` draw the same
  card — the second is only a shorter viewport where it overflows, which is why
  the card caps at `85svh` and scrolls its copy internally.
- **"Terms of applying" opens the dialog**, not `/terms`. Both it and Apply are
  still real anchors, so the no-JS path keeps working; they share one dialog via
  `ApplyActions`.
- **Team up is a rotation, not a scroller, and `154:2073` alone does not say
  so.** Its two sibling states `154:2326` ("Desktop - 238") and `154:2357`
  ("Desktop - 239") have *identical* geometry — a 386×516 lead at x=407 and two
  308×412 followers at x=813/1141 — and differ only in which photograph sits in
  which slot, cycling tea-room → chess → tablet. So the slots are fixed
  furniture and only their *contents* change: each slot stacks all three
  photographs and opacity cross-fades between them. **Do not animate the slot
  sizes or reorder the cards** — `order` is not animatable, so a card teleports
  to its new slot and only then resizes, which is exactly the jumping-and-
  scaling the first attempt produced. Measured across a full cycle at 1440 and
  378, every slot rect is byte-identical, so nothing can reflow.
  The caption under the lead slot names the active photo (386 wide always, 276
  on mobile); its copy block reserves the Figma height (92 / 73) because the
  three strings do not always wrap alike.
  **The indicator is an autoplay scrubber**, which is what Figma's part-filled
  bar (23.744 of 34.287, identical in all three frames) actually depicts: 5s
  per slide, filling 0→100%, restarting on manual selection, and paused on
  hover/focus, off screen, or under `prefers-reduced-motion`.
  The per-photo captions ("Design developement" — Figma's spelling —
  "Hospitality", "Legal") live on `careerTeamUp.photos`.
- **Two of the three Team up photographs changed in 24.07** and the old files
  were square 2048 exports from an earlier revision: the chessboard is now a tea
  pour and the tablet is now a Utopia letterhead, which is exactly why the
  captions read Hospitality and Legal. Re-pulled from the asset server (topmost
  layer of each stack) and re-keyed to the team names — `teamup-design.jpg`,
  `teamup-hospitality.jpg`, `teamup-legal.jpg`, 826KB for the three against
  5.4MB before. **The tea pour arrives with a Weibo watermark baked into its
  bottom edge** (`@子后汉服` — the same problem the Careers hospitality plate had);
  it is cropped off. New filenames rather than replacements, because the image
  optimizer caches derivatives by name. `teamup-tea-room/chess/tablet.jpg` and
  `teamup-dot.svg` are now unused.
- **The Team up right-edge fade cannot take Figma's literal 405px.** That width
  only clears the caption at the 1440 the frame was drawn at; below it the
  layout closes up and a fixed band reaches back across the copy, which at 1024
  half-blurred the caption and the indicator. It is capped to the room left of
  the lead card instead — 405 at 1440+, narrower below, zero when there is no
  bleed. Separately, **`backdrop-filter` ignores the background gradient** and
  blurs the whole box, so on its own it draws a hard vertical seam; the element
  carries a matching `mask-image` so the blur fades out with the wash.
- **Do not port Figma's `backdrop-blur-[2px]` onto the Work slides.** It comes
  from the shared "Background rectangle" instance (`154:2051`), whose glass
  effect is meant for translucent surfaces; over a photograph it just softens
  the image. The signed-off Careers carousel drops it too. The blurs that *are*
  real: the badge (8px), the Team up progress pill (2px) and the right-edge
  fade (4px), all over translucent fills.
- The hero must not use `--utopia-layout-max` — the shared tablet cap is 480
  where Figma draws a 589 column, the same trap the Careers sections hit.
- Figma's desktop Work text card ends "…and the UAE.**м**"; our copy drops the
  stray character. `images.jobTeamUpDot` is now unused — the indicator draws its
  dots in CSS.

Still open with the user: whether to adopt the designers' `pw-1.jpg` (a wider
crop of the same photo, carrying a `scale(1.1)` correction we deliberately did
not apply to our tighter crop), whether to delete four unused ecosystem images
(~3.4MB), and whether the now-unused `team-resorts.jpg` / `team-technical.jpg`
should go (Figma 24.07 has five teams, not six).

**Terms, Privacy, 404, menu, icons** are now aligned too, all measured:
Terms 8021/8062, Privacy 3314/3365, 404 1460/1460 at 1440.

- **The 404's three frames are `154:8707` / `154:5381` / `154:6614`**, in the
  group under the `154:1973` label at x=43849. The desktop one is still *named*
  "Terms" in the file — that is why it was once filed as a stray Terms artboard.
  `154:8725` / `154:8738` inside it are hidden alternates holding leftover
  Careers content. The nav over it is `SiteNav overlay overlayTone="dark"`: the
  backdrop is a bright photograph, so Figma draws `Logo_Text_Black` where the
  home hero gets the white wordmark.
- **The Opening section's side inset is a transform, never padding.** Both
  prototypes give `.fullwidth { padding: 0 }` and express the start width as
  `.fullwidth__scale { transform: scale((100vw - 2*--site-grid-pad)/100vw) }`.
  A `padding: 12px 24px` on the section is what left cream bars down both edges
  and stopped the card ever reaching full width — the section itself has to
  touch both screen edges for the grow to land full-bleed. Carried as
  `--utopia-fullwidth-start-inset`, which is 0 in sharp: v9's destinations
  image is already 100vw, so the driver's measured `minScale` comes out at 1
  and the section is flush and instantly full-width with **no grow at all**.
  That is v9's own behaviour, not a bug. Verified: rounded opens at 1200 (the
  seed width) r28 → 1440 r0; sharp sits at 1440 r0 throughout.
  `settle()` must write explicit `none`/`0px` rather than `""`, or reduced
  motion hands the card back to that CSS start scale and strands it inset.
- **`154:2067` / `154:2070` are one arrow's rest and hover, not a live arrow
  beside a spent one.** Identical 40×40 geometry and icon; only the fill moves,
  Ivory `#f1e8dc` → Beige Dark `#ebdfd2`. Reading them as active/inactive
  pinned the darker fill on whichever arrow had run out of track, so the
  designed hover never appeared. Figma draws no spent state.
- **Terms is a partly-adapted Revolut template — in Figma itself.** All 72 body
  lines match `terms-data.ts` exactly, so there is nothing to port; but the copy
  still says "www.revolut.com", "Revolut Ltd", company number 08804411, and
  "regulated by the FCA as an Electronic Money Institution" (FRN 900562)
  alongside "Utopia is a UK registered trade mark of Utopia Ltd". **Raised with
  the user; do not silently rewrite it.** Privacy (`154:2584`) is genuinely
  Utopia's copy and shares `terms.module.css` — same 794 measure, 28px section
  headings, 18px body at `opacity: 0.7`.
- Terms/Privacy body copy is **18px (`--utopia-text-lg`)** and group headings
  **36/-1.08**; the 16px body and 38/-1.14 heading came from the 13.07 frames
  and ran the document ~860px short of its frame.
- **A `favicon.ico` whose embedded PNGs are RGB 500s every route** — Next's
  image pipeline demands RGBA ("The PNG is not in RGBA format"). Chrome drops
  the alpha channel when a capture is fully opaque, so the icon is built by
  reading canvas `getImageData` and encoding colour-type-6 PNGs by hand
  (scratch script), then packing the ICO. `src/app/icon.svg` carries the same
  256×256 artwork (beige mark + wordmark on `#161514`, per `154:6832`).
- The OG (`154:8063`) backdrop is **pre-cropped** to the window Figma shows
  (a 2437×1174 image at −619,−323 in the 1200×630 board) so the route does not
  inline a 4MB source per render. Its three destination cards genuinely have
  **no fill** — checked against the node's own render, not just the export:
  white 1.053px outlines over the backdrop echoing the hero card track. The
  leftmost card hangs off the left edge and its "Prea, Brazil" caption is
  cropped away, in Figma too. Do not go hunting for missing card images.
- **The nav bar is 72, and that is Figma over the prototypes.** Both prototypes
  set `--nav-h: 64px`; Figma 24.07 draws the solid bar at 72 everywhere it
  appears (`154:7512`, `154:7539`, `154:8717`, and `154:7791` / `154:5384` on
  tablet). The user chose Figma, so it is `--utopia-nav-height` and both `.bar`
  and `.tabletBar` read it, as does the menu overlay's `top`. **Figma also
  draws the transparent over-hero state at 80** (`154:7489`) — still open, so
  the bar keeps one height in both states.

Known deviations, all deliberate and reported:
- ~~`.heroTitle` on Terms/Privacy is `font-weight: 300`~~ — **closed.** The
  designer asked for regular directly (bug #49), so the deviation is lifted:
  `terms.module.css` `.heroTitle` is now `font-weight: 400`, matching what
  Figma always specified. The module is shared, so this moved both pages;
  measured 300 → 400 on `/terms` and `/privacy` at 378/768/1440.
- Figma's 404 body copy reads "The page you're looking for **have** been
  moved"; kept verbatim, same policy as "Design developement".

Metadata / OG (bug #29), current state:
- The root layout carries `metadataBase`, a bare `title` string, a description,
  and the site-wide `openGraph` fields only (`type`, `siteName`, `locale`).
  **Do not add `openGraph.title`/`description` there** — Next derives those per
  route from each page's own `title`/`description`, and pinning them at the root
  stamps the home page's copy onto every other route's share card (tried and
  reverted).
- **A child segment that declares `openGraph` replaces the root's object
  wholesale** — Next does not deep-merge — and the file-convention og:image
  goes with it. `/careers/[slug]` hits this: `generateMetadata` sets its own
  `openGraph`, so job postings ship **no og:image and no twitter:image**. Fix is
  one line (`images: ["/opengraph-image"]`) in
  `src/app/careers/[slug]/page.tsx`. `/terms` and `/privacy` deliberately set
  only `alternates` to stay clear of this.
- **Canonicals only emit when `NEXT_PUBLIC_SITE_URL` is set** (`src/lib/site.ts`
  returns `null` otherwise, by design). Without it `metadataBase` is null too,
  so **og:image resolves against localhost** and social previews break. It must
  be set on the deployment.
- **`/404` returns HTTP 404** and does not render `src/app/404/page.tsx`; a real
  404 renders `not-found.tsx`, which the App Router does not let you give a
  `metadata` export. So the 404 title is the root layout's, and
  `src/app/404/page.tsx` is dead code.
- The titles and descriptions in the tree are **placeholders derived from page
  content**, not the signed-off Figma copy, and are commented as such.
