#!/usr/bin/env bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [ "$1" == "--prod" ] || [ "$1" == "-p" ]; then
    echo "Starting PulseWork in Production Preview mode on port 3000..."
    npx vite preview --host 0.0.0.0 --port 3000
else
    echo "Starting PulseWork in Development mode on http://localhost:5173..."
    npm run dev
fi
