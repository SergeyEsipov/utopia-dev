#!/usr/bin/env bash
# Sync SVG assets from Figma MCP (URLs expire after ~7 days)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/public/assets/icons"

mkdir -p "$OUT"

declare -A ASSETS=(
  ["logo-container.svg"]="https://www.figma.com/api/mcp/asset/e78f4bae-a6d3-4025-ad73-ff220f78eb9a"
  ["logo-mark.svg"]="https://www.figma.com/api/mcp/asset/4d6a169b-2873-49fe-b5c6-9366b3729b12"
  ["logo-wordmark.svg"]="https://www.figma.com/api/mcp/asset/01bfe040-4eb2-4de6-a9cd-d7b817e64c59"
  ["chevron.svg"]="https://www.figma.com/api/mcp/asset/8fc80ac4-1328-44af-8188-6c70d1cab739"
  ["menu.svg"]="https://www.figma.com/api/mcp/asset/9200e8ef-455a-4d75-90e3-e9c38beebe20"
  ["home-mark.svg"]="https://www.figma.com/api/mcp/asset/948551da-feaa-4cb2-b876-84fd338c84e5"
  ["chevron-dark.svg"]="https://www.figma.com/api/mcp/asset/a9193277-ee64-4dec-91f2-8e796e0c9c4a"
  ["close.svg"]="https://www.figma.com/api/mcp/asset/e136f35c-2ae8-48cd-97f6-eab44b799088"
)

for file in "${!ASSETS[@]}"; do
  echo "→ $file"
  curl -sL "${ASSETS[$file]}" -o "$OUT/$file"
done

echo "Done. $(ls "$OUT" | wc -l | tr -d ' ') icons in $OUT"
