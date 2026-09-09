#!/bin/sh
set -e

# Nitro node-server respects PORT / HOST (defaults match Loft web-server chart).
export PORT="${PORT:-8080}"
export HOST="${HOST:-0.0.0.0}"

# Node 24 ESM requires `dd-trace/init.js` (bare `dd-trace/init` fails resolution).
# Datadog / chart may inject NODE_OPTIONS=--import dd-trace/init — normalize or strip
# so we only load the tracer once via the CLI flag below.
if [ -n "${NODE_OPTIONS:-}" ]; then
  NODE_OPTIONS=$(printf '%s' "$NODE_OPTIONS" | sed -E 's/--import[= ]*dd-trace\/init(\.js)?//g' | tr -s ' ' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
  export NODE_OPTIONS
fi

exec node --import dd-trace/init.js .output/server/index.mjs
