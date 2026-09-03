#!/usr/bin/env python3
"""Push local .env files to Loft Vault (Cross Prod).

Never commit secret values. Never prints secret values — only key names.

Published host recommendations are loaded from deploy/published-hosts.env
(override with --hosts-file / CORP_*_URL env vars) so cutovers stay in one place.

Defaults (UI):
  Front → https://vault.loft-corp.com.br/ui/vault/secrets/cross/kv/ai-ops%2Faiops-app-model-front
  API   → https://vault.loft-corp.com.br/ui/vault/secrets/cross/kv/ai-ops%2Faiops-app-model-api

Prerequisites:
  export VAULT_ADDR=https://vault.loft-corp.com.br
  vault login   # paste token from Vault UI → profile → Copy token

Usage:
  python3 scripts/vault/push_secrets.py --dry-run
  python3 scripts/vault/push_secrets.py
  python3 scripts/vault/push_secrets.py --target api
  python3 scripts/vault/push_secrets.py --target front
"""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_VAULT_ADDR = "https://vault.loft-corp.com.br"
DEFAULT_HOSTS_FILE = ROOT / "deploy" / "published-hosts.env"

DEFAULT_PATHS = {
    "front": "cross/ai-ops/aiops-app-model-front",
    "api": "cross/ai-ops/aiops-app-model-api",
}

DEFAULT_ENV_FILES = {
    "front": ROOT / ".env",
    "api": ROOT / "backend" / ".env",
}

UI_PATHS = {
    "front": "ai-ops%2Faiops-app-model-front",
    "api": "ai-ops%2Faiops-app-model-api",
}


def load_env(path: Path) -> dict[str, str]:
    if not path.exists():
        raise FileNotFoundError(f"Missing {path}")

    values: dict[str, str] = {}
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and value:
            values[key] = value
    return values


def load_published_hosts(hosts_file: Path | None) -> dict[str, str]:
    """Resolve corp front/API URLs from env, then optional hosts file."""
    hosts: dict[str, str] = {}
    path = hosts_file or Path(os.getenv("PUBLISHED_HOSTS_FILE", str(DEFAULT_HOSTS_FILE)))
    if path.is_file():
        hosts.update(load_env(path))

    for key in ("CORP_FRONT_URL", "CORP_API_URL", "CROSS_FRONT_URL", "CROSS_API_URL"):
        env_value = os.getenv(key)
        if env_value:
            hosts[key] = env_value
    return hosts


def vault_kv_put(path: str, payload: dict[str, str]) -> None:
    """Write KV via a temp JSON file so secrets are not visible in `ps` argv."""
    with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False, encoding="utf-8") as handle:
        json.dump(payload, handle)
        tmp_path = handle.name

    try:
        subprocess.run(["vault", "kv", "put", path, f"@{tmp_path}"], check=True)
    finally:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass


def ensure_vault_ready() -> None:
    if not os.getenv("VAULT_ADDR"):
        os.environ["VAULT_ADDR"] = DEFAULT_VAULT_ADDR
        print(f"VAULT_ADDR not set — using {DEFAULT_VAULT_ADDR}")

    status = subprocess.run(["vault", "status"], capture_output=True)
    if status.returncode != 0:
        print(
            "ERROR: Vault unreachable or not authenticated.\n"
            f"  export VAULT_ADDR={DEFAULT_VAULT_ADDR}\n"
            "  vault login   # paste token from Vault UI profile",
            file=sys.stderr,
        )
        sys.exit(1)


def warn_payload(target: str, payload: dict[str, str], hosts: dict[str, str]) -> None:
    corp_api = hosts.get("CORP_API_URL")
    corp_front = hosts.get("CORP_FRONT_URL")

    if target == "front":
        api_url = payload.get("VITE_API_URL", "")
        if api_url.startswith("http://localhost") or api_url.startswith("http://127.0.0.1"):
            hint = (
                f"Production front usually needs {corp_api} "
                if corp_api
                else "Production front usually needs the corp API URL from deploy/published-hosts.env "
            )
            print(
                "WARNING: VITE_API_URL looks like a local URL. "
                f"{hint}(baked at Docker build via workflow build-args).",
                file=sys.stderr,
            )
    if target == "api":
        cors = payload.get("CORS_ORIGINS", "")
        if "localhost" in cors or "127.0.0.1" in cors:
            hint = (
                f"production should include {corp_front}."
                if corp_front
                else "production should include the corp front URL from deploy/published-hosts.env."
            )
            print(
                "WARNING: CORS_ORIGINS includes localhost — " + hint,
                file=sys.stderr,
            )
        if not payload.get("JWT_SECRET") and not payload.get("JWT_SECRET_KEY"):
            print(
                "WARNING: JWT_SECRET is missing/empty in backend/.env — API auth will fail in cluster.",
                file=sys.stderr,
            )
        if not payload.get("DATABASE_URL") and not payload.get("DB_PASSWORD"):
            print(
                "WARNING: DATABASE_URL / DB_* look incomplete in backend/.env.",
                file=sys.stderr,
            )


def push_target(
    target: str, path: str, env_file: Path, dry_run: bool, hosts: dict[str, str]
) -> None:
    payload = load_env(env_file)
    if not payload:
        raise ValueError(f"No non-empty keys found in {env_file}")

    print(f"► Target: {target}")
    print(f"  Vault path: {path}")
    print(f"  Source: {env_file}")
    print(f"  Keys ({len(payload)}): {', '.join(sorted(payload.keys()))}")
    warn_payload(target, payload, hosts)

    if dry_run:
        print("  Dry run — nothing written.")
        return

    vault_kv_put(path, payload)
    ui = f"{os.environ['VAULT_ADDR']}/ui/vault/secrets/cross/kv/{UI_PATHS[target]}"
    print(f"  ✓ Secrets stored in Vault")
    print(f"  UI: {ui}")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Push AIOPS App Model local .env files to Loft Vault (cross / ai-ops)"
    )
    parser.add_argument(
        "--target",
        choices=("all", "front", "api"),
        default="all",
        help="Which KV path to update (default: all)",
    )
    parser.add_argument(
        "--front-path",
        default=os.getenv("VAULT_FRONT_PATH", DEFAULT_PATHS["front"]),
        help=f"Front KV path (default: {DEFAULT_PATHS['front']})",
    )
    parser.add_argument(
        "--api-path",
        default=os.getenv("VAULT_API_PATH", DEFAULT_PATHS["api"]),
        help=f"API KV path (default: {DEFAULT_PATHS['api']})",
    )
    parser.add_argument(
        "--front-env",
        default=str(DEFAULT_ENV_FILES["front"]),
        help="Front source env file (default: repo root .env)",
    )
    parser.add_argument(
        "--api-env",
        default=str(DEFAULT_ENV_FILES["api"]),
        help="API source env file (default: backend/.env)",
    )
    parser.add_argument(
        "--hosts-file",
        default=os.getenv("PUBLISHED_HOSTS_FILE", str(DEFAULT_HOSTS_FILE)),
        help=f"Published hosts env file (default: {DEFAULT_HOSTS_FILE})",
    )
    parser.add_argument("--dry-run", action="store_true", help="List keys only, do not write")
    args = parser.parse_args()

    if not args.dry_run:
        ensure_vault_ready()
    elif not os.getenv("VAULT_ADDR"):
        os.environ["VAULT_ADDR"] = DEFAULT_VAULT_ADDR

    hosts = load_published_hosts(Path(args.hosts_file) if args.hosts_file else None)

    targets: list[tuple[str, str, Path]] = []
    if args.target in ("all", "front"):
        targets.append(("front", args.front_path, Path(args.front_env)))
    if args.target in ("all", "api"):
        targets.append(("api", args.api_path, Path(args.api_env)))

    try:
        for target, path, env_file in targets:
            push_target(target, path, env_file, args.dry_run, hosts)
    except (FileNotFoundError, ValueError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        sys.exit(1)
    except subprocess.CalledProcessError as exc:
        print(f"ERROR: vault kv put failed (exit {exc.returncode})", file=sys.stderr)
        sys.exit(exc.returncode or 1)

    if args.dry_run:
        print("Dry run complete — re-run without --dry-run to write.")


if __name__ == "__main__":
    main()
