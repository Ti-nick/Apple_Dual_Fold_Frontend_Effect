#!/usr/bin/env bash
# Serves the whole project (this page + the book it embeds) locally.
cd "$(dirname "$0")/.."
PORT="${1:-8080}"
echo "Serving at http://localhost:$PORT/website-design/"
python3 -m http.server "$PORT"
