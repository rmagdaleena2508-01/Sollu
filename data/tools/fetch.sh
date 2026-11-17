#!/bin/bash
# Save one official source with metadata and plain text.
# Usage: tools/fetch.sh <source-id> <url> [render]
#   render = use a headless browser for JavaScript pages (e.g. myscheme.gov.in)
set -euo pipefail
ID="$1"; URL="$2"; MODE="${3:-plain}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIR="$ROOT/sources/$ID"; mkdir -p "$DIR"
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 Sollu-research"
B="/Applications/Brave Browser.app/Contents/MacOS/Brave Browser"; [ -x "$B" ] || B="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
if [ "$MODE" = "render" ]; then
  "$B" --headless=new --disable-gpu --virtual-time-budget=20000 --dump-dom "$URL" 2>/dev/null > "$DIR/original.html"
  FILE=original.html; CT="text/html (rendered)"
else
  CT=$(curl -s -L -m 60 -A "$UA" -o "$DIR/original.bin" -w "%{content_type}" "$URL")
  case "$CT" in
    *pdf*) mv "$DIR/original.bin" "$DIR/original.pdf"; FILE=original.pdf;;
    *) mv "$DIR/original.bin" "$DIR/original.html"; FILE=original.html;;
  esac
fi
if [ "$FILE" = original.pdf ]; then
  pdftotext -layout "$DIR/original.pdf" "$DIR/text.txt"
else
  python3 - "$DIR/original.html" "$DIR/text.txt" <<'PY'
import re, html, sys
s = open(sys.argv[1], encoding="utf-8", errors="replace").read()
s = re.sub(r"<(script|style|noscript)[^>]*>.*?</\1>", " ", s, flags=re.S | re.I)
s = re.sub(r"<br\s*/?>|</(p|div|li|tr|h\d|td|th)>", "\n", s, flags=re.I)
s = html.unescape(re.sub(r"<[^>]+>", " ", s))
lines = [re.sub(r"[ \t ]+", " ", l).strip() for l in s.split("\n")]
open(sys.argv[2], "w", encoding="utf-8").write("\n".join(l for l in lines if l))
PY
fi
SHA=$(shasum -a 256 "$DIR/$FILE" | cut -d' ' -f1)
python3 - "$DIR/meta.json" "$URL" "$FILE" "$CT" "$SHA" "$MODE" <<'PY'
import json, sys, datetime
p, url, f, ct, sha, mode = sys.argv[1:]
json.dump({"url": url, "file": f, "content_type": ct, "sha256": sha, "fetch_mode": mode,
           "fetched_at": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds")},
          open(p, "w"), indent=2)
PY
echo "$ID: $FILE $(wc -c < "$DIR/text.txt") chars of text"
