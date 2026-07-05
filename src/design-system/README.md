# Utopia Design System

UI kit extracted from Figma file **Untitled (Copy)** (`kUT2mAHHQ6MvyKYJZHGHS4`).

> Figma Variables are not defined in the file — all tokens were extracted manually from component styles.

## Quick start

```bash
npm run dev
# → http://localhost:3000/design-system
```

## Structure

```
src/
├── design-system/
│   ├── tokens/          # TypeScript token objects
│   ├── components/      # React UI primitives
│   ├── figma/nodes.ts   # Figma node ID registry
│   └── assets.ts        # Icon paths + Figma source URLs
├── styles/
│   ├── tokens.css       # CSS custom properties
│   ├── fonts.css        # @font-face declarations
│   └── typography.css   # Utility classes
public/
├── assets/icons/        # SVG exports from Figma
└── fonts/               # Brand fonts (add manually)
```

## Tokens

| Category | CSS prefix | TS import |
|----------|-----------|-----------|
| Colors | `--utopia-bg-*`, `--utopia-text-*` | `@/design-system/tokens` → `colors` |
| Typography | `--utopia-font-*`, `--utopia-text-*` | `typography` |
| Spacing/Layout | `--utopia-space-*`, `--utopia-mobile-width` | `spacing`, `layout`, `radii` |

## Components

| Component | Figma usage |
|-----------|-------------|
| `Heading` | Hero titles, section headings |
| `Text` | Body copy, captions |
| `Button` | CTAs |
| `LocationPill` | Destination filters |
| `Tab` | Content tabs (on dark bg) |
| `ProgressDots` | Carousel progress |
| `Card` | Hero cards, content blocks |
| `Dock` | Bottom navigation |
| `Icon` | Logo, chevrons, menu |

```tsx
import { Button, Heading, Text } from "@/design-system/components";
```

## Fonts (required)

Place these files in `public/fonts/` (already restored from git):

- `gt-ultra-median-light.otf`
- `gt-ultra-median-regular.otf`
- `nb-international-regular.otf`

Without them, the browser falls back to Georgia / system-ui.

## Assets

Re-sync icons when Figma MCP URLs expire (~7 days):

```bash
npm run sync:figma-assets
```

## Figma → Screen mapping

| Figma node | Node ID | Planned component |
|------------|---------|-------------------|
| Mobile page | `173:1682` | `MobilePage` |
| Hero | `173:1683` | `HeroSection` |
| Ecosystem | `173:1733` | `EcosystemSection` |
| Opening | `173:1770` | `OpeningSection` |
| Days | `173:1792` | `DaysSection` |
| Footer | `173:1815` | `FooterSection` |
| Menu | `173:1839` | `SiteMenu` |
| Dock | `173:1888` | `Dock` |

## Next steps

1. Add font files to `public/fonts/`
2. Build section components on top of UI kit primitives
3. Export hero/section photos from Figma → `public/assets/images/`
