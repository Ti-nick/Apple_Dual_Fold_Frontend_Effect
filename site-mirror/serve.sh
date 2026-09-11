#!/usr/bin/env bash
# Serves this mirrored site locally.
cd "$(dirname "$0")"
PORT="${1:-8080}"
echo "Serving at http://localhost:$PORT"
python3 -m http.server "$PORT"
