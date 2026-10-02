#!/usr/bin/env bash
#
# Convert a dropped image to WebP, verify it, and land it at the target path.
#
#   tools/img2webp.sh <source> <target.webp> [--lossy Q] [--keep-source]
#
# Default is lossless, because everything this site drops in is dithered
# artwork — flat palettes of 4-5 colours — where lossless WebP is both
# smaller and pixel-exact. A photo or any continuous-tone work wants
# --lossy instead: lossless on that is larger AND visibly banded.

set -euo pipefail

usage() {
  cat <<'EOF'
usage: tools/img2webp.sh <source> <target.webp> [--lossy Q] [--keep-source]

Default is lossless, because everything this site drops in is dithered
artwork — flat palettes of 4-5 colours — where lossless WebP is both
smaller and pixel-exact. A photo or any continuous-tone work wants
--lossy instead: lossless on that is larger AND visibly banded.
EOF
  exit 2
}

[ $# -ge 2 ] || usage
src=$1; dst=$2; shift 2

mode=lossless; quality=82; keep=0
while [ $# -gt 0 ]; do
  case $1 in
    --lossy) mode=lossy; quality=${2:?--lossy needs a quality}; shift 2 ;;
    --keep-source) keep=1; shift ;;
    -h|--help) usage ;;
    *) echo "unknown option: $1" >&2; usage ;;
  esac
done

for bin in cwebp dwebp sips; do
  command -v $bin >/dev/null || { echo "missing $bin" >&2; exit 1; }
done
[ -f "$src" ] || { echo "no such file: $src" >&2; exit 1; }

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

fmt() {
  python3 -c 'import sys
n = int(sys.argv[1])
print(f"{n:,} B" if n < 1024 else f"{n/1024:.0f} KB" if n < 1048576 else f"{n/1048576:.1f} MB")' "$1"
}

# --- convert ---------------------------------------------------------------
if [ "$mode" = lossless ]; then
  cwebp -quiet -lossless "$src" -o "$tmp/out.webp"
else
  cwebp -quiet -q "$quality" "$src" -o "$tmp/out.webp"
fi

# --- verify ----------------------------------------------------------------
# Lossless is verified, not assumed: decode the WebP, re-encode it losslessly,
# and check the result is byte-identical to what we just made. Lossy WebP has
# no such fixed point, so there we only confirm it decodes.
verified="decodes"
if [ "$mode" = lossless ]; then
  dwebp -quiet "$tmp/out.webp" -o "$tmp/rt.png"
  cwebp -quiet -lossless "$tmp/rt.png"      -o "$tmp/rt.webp"
  cwebp -quiet -lossless "$src"             -o "$tmp/src.webp"
  if cmp -s "$tmp/out.webp" "$tmp/src.webp"; then
    verified="LOSSLESS-VERIFIED"
  else
    echo "FAIL: round-trip is not byte-identical, refusing to land it" >&2
    exit 1
  fi
fi

# --- report ----------------------------------------------------------------
# The colour count is not decoration. Resampling a dithered image blends its
# handful of flat colours into thousands of intermediate ones, which is how you
# find out a "smaller" image is about to be 18x the weight and no longer dithered.
dims=$(sips -g pixelWidth -g pixelHeight "$tmp/out.webp" 2>/dev/null \
       | awk '/pixelWidth/{w=$2}/pixelHeight/{h=$2}END{printf "%sx%s", w, h}')
dwebp -quiet -ppm "$tmp/out.webp" -o "$tmp/out.ppm"
colours=$(python3 -c '
from collections import Counter
import sys
f = open(sys.argv[1], "rb")
f.readline()
line = f.readline()
while line.startswith(b"#"):
    line = f.readline()
f.readline()
print(f"{len(Counter(zip(*[iter(f.read())] * 3))):,}")' "$tmp/out.ppm")

before=$(wc -c < "$src" | tr -d ' ')
after=$(wc -c < "$tmp/out.webp" | tr -d ' ')
printf '  %-24s -> %s\n' "$(basename "$src")" "$(basename "$dst")"
printf '  %s  %s  %s colours  %s\n' "$dims" "$mode" "$colours" "$verified"
printf '  %s -> %s (%.1f%%)\n' \
  "$(fmt "$before")" "$(fmt "$after")" \
  "$(python3 -c "print($after*100/$before)")"

# --- land ------------------------------------------------------------------
if [ -f "$dst" ]; then
  echo "  overwrites $(basename "$dst") (was $(fmt "$(wc -c < "$dst" | tr -d ' ')"))"
fi
cp "$tmp/out.webp" "$dst"
[ "$keep" = 1 ] || rm -f "$src"
[ "$keep" = 1 ] || echo "  removed the source PNG"