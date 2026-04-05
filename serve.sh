#!/usr/bin/env bash
PORT="${1:-8000}"
echo "Serving at http://localhost:$PORT"
echo "  Index:      http://localhost:$PORT"
echo "  Team Sage:  http://localhost:$PORT/wedding/team-sage/"
cd "$(dirname "$0")/docs" && python3 -m http.server "$PORT"
