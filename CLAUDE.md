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
   - `44:1100` = **"17.07" → the current revision; all its frames are `44:*`**
   - `1:136` = "13.07" → the older revision (`1:*`) most of the app was built from
   - Key 17.07 nodes: home mobile `44:3275`, mobile footer `44:3411`, home desktop
     `44:4509`, tablet `44:1782`, Careers `44:1101`, Job Opening `44:1401`,
     Terms `44:1615`, menu `44:4820`.
   - `get_metadata` on `0:1` exceeds the token limit and is dumped to a file —
     parse that file instead of retrying (top-level frames are at 2-space indent).
   - MCP connects at session start only; if it drops, the session must be
     restarted (reopening Figma does not reconnect it).

2. **The designers' static prototype repo at `../Utopia`** (EmbacyDev/Utopia) —
   plain HTML/CSS/JS, and the source of truth for *behaviour* (scroll choreography,
   transitions) that Figma cannot express, plus for **media files** (originals beat
   Figma exports).
   - **Desktop anchor: `desktop_v5`** (what GH Pages serves at the root).
     v3's and v4's hero→destinations "card morph" was abandoned — do not port it.
   - **Mobile anchor: `v3`**.
   - Commit timestamps matter: a prototype commit made *after* a Figma frame
     usually reflects a newer decision.

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
left in the column: it is left-anchored (`padding-left: 328px`) and its cream
background matches the page, so breaking it out would shift the composition
without changing what you see. **If you add a section with its own background,
it needs the breakout too** — otherwise it paints a 1440-wide band with gutters.

Home section order (`src/app/page.tsx`): Hero → **Ecosystem** (this is the
"destinations" section: heading + Tropical/Urban/Alpine tabs + big image) →
Opening → Days → Footer.

## Gotchas (each of these cost real debugging time)

- **`overflow-x: hidden` silently breaks `position: sticky`** on descendants — it
  makes the element a scroll container. `html, body` use `overflow-x: clip`
  instead; keep it that way or the desktop hero pin dies with no error.
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
- **CSS Modules obey source order** for same-specificity rules. The desktop-v5
  blocks are deliberately last in `hero-section.module.css` /
  `ecosystem-section.module.css` so they beat the ≥768 and ≥1900 rules above.
- Mobile viewport height must stay **stable** (`100svh`). JS-driven or `dvh`
  heights make the page jitter as browser chrome hides/shows, and
  `env(safe-area-inset-bottom)` changes for the same reason — keep it out of
  anything that affects layout.

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

Recent: the mobile v3 footer was ported and verified against Figma `44:3411`
(bg gradient, 60/32/36 padding, leaf background video, links
`Contact → Careers → About(disabled)`). The desktop was re-anchored to
`desktop_v5`: the hero is now full-bleed and pins inside a 160vh `.heroPin`
while `useHeroSettle` drives `--hero-*` custom properties from scroll progress,
and the ecosystem section slides over it (`margin-top: -60vh`, 40px top radius
that squares off via `useHandoffFlush`).

Not done: nav-bar behaviour during the desktop handoff (v5 hides and restores it
via `hero-settle:start/end` events), and the tablet 768–1023 hero still uses the
old inset card although Figma 17.07 shows it full-bleed.
