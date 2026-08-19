#!/usr/bin/env bash
# Builds demo.html — the whole site as one self-contained file, no server.
#
#   bash scripts/build-demo.sh
#
# Works on a throwaway copy in .demo-build/, so your working tree is never
# touched. `output: "export"` cannot build metadata route handlers
# (opengraph-image / robots / sitemap), so the copy drops them; the real
# Vercel build still generates all of them.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORK="$ROOT/.demo-build"

rm -rf "$WORK"
mkdir -p "$WORK"
tar -c -C "$ROOT" \
  --exclude=node_modules --exclude=.next --exclude=out \
  --exclude=.demo-build --exclude=.git . | tar -x -C "$WORK"
ln -s "$ROOT/node_modules" "$WORK/node_modules"

cd "$WORK"

# 1. static export
cat > next.config.ts <<'EOF'
import type { NextConfig } from "next";
const nextConfig: NextConfig = { output: "export", images: { unoptimized: true } };
export default nextConfig;
EOF

# 2. drop metadata routes that `output: "export"` cannot build
rm -f app/opengraph-image.tsx app/robots.ts app/sitemap.ts \
      app/model/opengraph-image.tsx app/methodology/opengraph-image.tsx \
      app/fields/opengraph-image.tsx "app/fields/[slug]/opengraph-image.tsx"

# 3. the bundle loads webfonts over a <link> instead, so next/font is inert here
node - <<'EOF'
const fs = require("fs");
let s = fs.readFileSync("app/layout.tsx", "utf8");
s = s.replace(/import \{[^}]*\} from "next\/font\/google";\n/, "");
s = s.replace(/const geistSans = Geist\(\{[\s\S]*?\}\);/, 'const geistSans = { variable: "demo-sans" };');
s = s.replace(/const geistMono = Geist_Mono\(\{[\s\S]*?\}\);/, 'const geistMono = { variable: "demo-mono" };');
s = s.replace(/const sourceSerif = Source_Serif_4\(\{[\s\S]*?\}\);/, 'const sourceSerif = { variable: "demo-serif" };');
fs.writeFileSync("app/layout.tsx", s);
EOF

npx next build >/dev/null

# 4. lighter copy of the hero backdrop for the inlined data URI
node -e '
const {execFileSync} = require("child_process");
' 2>/dev/null || true
if command -v python3 >/dev/null && python3 -c "import PIL" 2>/dev/null; then
  python3 - <<'EOF'
from PIL import Image
im = Image.open("public/dna-helix-sketch.png").convert("L")
w = 560
im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
im.save("/tmp/helix-demo.webp", format="WEBP", quality=72, method=6)
EOF
else
  cp public/dna-helix-sketch.png /tmp/helix-demo.webp
fi

node scripts/build-demo.mjs > "$ROOT/demo.html"

cd "$ROOT"
rm -rf "$WORK"
echo "wrote demo.html ($(du -h demo.html | cut -f1))"
