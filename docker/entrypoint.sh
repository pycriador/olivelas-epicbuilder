#!/bin/sh
set -e

# Nitro node-server respects PORT / HOST (defaults match Loft web-server chart).
export PORT="${PORT:-8080}"
export HOST="${HOST:-0.0.0.0}"

exec node --import dd-trace/init.js .output/server/index.mjs
