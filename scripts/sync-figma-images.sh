#!/usr/bin/env bash
# Re-sync raster images from Figma MCP at maximum quality.
# Composites: export @4x (Figma max). Photo fills: original source URLs from design context / rawImages.
# Re-run when MCP asset URLs expire (~7 days): npm run sync:figma-images
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CAREERS="$ROOT/public/assets/careers"
OPT="$ROOT/public/assets/opt"
BASE="https://www.figma.com/api/mcp/asset"

mkdir -p "$CAREERS" "$OPT"

download() {
  local url="$1"
  local out="$2"
  echo "→ $(basename "$out")"
  curl -sfL "$url" -o "$out"
}

echo "Careers — team cards (node export @4x)"
download "$BASE/07c80dda-c0c8-401d-aad9-e7630bc474b9" "$CAREERS/team-design.jpg"       # 173:1519
download "$BASE/51693748-40ef-400f-8613-e6b387fa85de" "$CAREERS/team-operations.jpg"  # 173:1524
download "$BASE/3b40e9ac-4e7d-4336-ac3e-a9247e02c441" "$CAREERS/team-resorts.jpg"     # 173:1529
download "$BASE/996fb1ff-1c5e-4bb5-80b8-9638b85d3db0" "$CAREERS/team-legal.jpg"       # 173:1535
download "$BASE/ea266159-ebf2-4463-9c55-b6a81b6b3360" "$CAREERS/team-technical.jpg"   # 173:1540
download "$BASE/34b9b0b2-6ec7-4e6e-a5c3-47f6ef695471" "$CAREERS/team-finance.jpg"     # 173:1545

echo "Careers — values hero background (173:1552 photo fill only — never 173:1551 frame export)"
download "$BASE/252df796-60f1-4ab6-beb2-66973c86dcc8" "$CAREERS/values-hero-bg-source.png"
sips -s format jpeg "$CAREERS/values-hero-bg-source.png" --out "$CAREERS/values-hero-bg.jpg" >/dev/null
rm -f "$CAREERS/values-hero-bg-source.png" "$CAREERS/values-hero.jpg"

echo "Careers — value stamp icons (original PNG fills)"
download "$BASE/53e9cf02-5044-4b17-a573-3a5924ac6ba8" "$CAREERS/value-never-settle.png"  # 173:1560
download "$BASE/268d205f-c0b0-46ee-ae5a-81adac41009b" "$CAREERS/value-dream-team.png"    # 173:1567
download "$BASE/3ca658ad-8a80-49db-a202-cdd20eca6c7b" "$CAREERS/value-think-deeper.png"  # 173:1574
download "$BASE/94e07a55-3d24-4696-b47c-28db175a5643" "$CAREERS/value-get-it-done.png"   # 173:1580
download "$BASE/52d10f61-910b-4c52-8b5d-826c528e7285" "$CAREERS/value-deliver-wow.png"   # 173:1586

echo "Careers — work carousel"
download "$BASE/44291243-8abb-47cb-9fc7-3439beb852a1" "$CAREERS/work-guests.jpg"        # 173:1594 photo
download "$BASE/8719bf5f-9006-43b6-9297-42a4464a2404" "$CAREERS/work-remote.jpg"       # 173:1599 @4x composite
download "$BASE/743f70f9-2333-4477-ad44-d7ae9c663e8a" "$CAREERS/work-locations.jpg"     # 173:1604 photo
download "$BASE/3042be9b-0a97-4482-8287-a1b3242962a0" "$CAREERS/work-team.jpg"         # 173:1607 photo
download "$BASE/4f5e074d-2e5f-4d0e-88e3-5f97371f6494" "$CAREERS/work-compensation.jpg"  # 173:1610 photo

echo "Home — days carousel (original JPEG fills)"
download "$BASE/2ee173e4-33ad-48c7-9ea6-f3d4e64f2548" "$OPT/days-exclusively-yours.jpg" # 173:1799
download "$BASE/1eec4f46-ff20-400f-90ae-ff450f4f3d58" "$OPT/days-water.jpg"             # 173:1801 → Hyper-Personal
download "$BASE/6004819b-97e9-4a1b-9f38-43203f92c288" "$OPT/days-dining.jpg"            # 173:1803 → Beyond Service

echo "Home — opening video posters (source fills)"
download "$BASE/3522b8f3-3754-4c81-937b-dca5606d2d1d" "$OPT/opening-kitesurf.jpg"       # 173:1771 slide 1
download "$BASE/89e67510-23af-4efe-b76b-c12722f44050" "$OPT/opening-dunes.jpg"          # slide 2
download "$BASE/85135d21-c447-401a-8399-b1ececa8101a" "$OPT/opening-localvibes.jpg"     # slide 3

echo "Home — hero & ecosystem (original fills, active destinations)"
download "$BASE/2fa65fef-f2b2-4044-9e0e-ff39ce20f6dc" "$OPT/enhanced_hero-bg-roca.jpg"           # 173:1686
download "$BASE/1de86c41-0652-4805-ba5b-ddcea7c994ab" "$OPT/enhanced_ecosystem-bg-jeri-lobby.jpg" # 173:1733

echo "Done. $(find "$CAREERS" "$OPT" -type f \( -name '*.jpg' -o -name '*.png' \) | wc -l | tr -d ' ') raster assets synced."
