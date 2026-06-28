"""Actor-allowlist gate. Blocks unauthorized users from running the pipeline."""
import os
import sys
import json

import requests


def main():
    allowed_raw = os.getenv("ALLOWED_ACTORS", "").strip()
    actor = os.getenv("GITHUB_ACTOR", "")

    if not allowed_raw:
        print("Warning: ALLOWED_ACTORS not configured, skipping gate")
        return

    allowed = [a.strip() for a in allowed_raw.split(",") if a.strip()]

    if actor not in allowed:
        # fire alert webhook (best-effort)
        webhook = os.getenv("SECURITY_WEBHOOK_URL")
        if webhook:
            payload = {
                "alert_type": "unauthorized_actor",
                "actor": actor,
                "pr_number": os.getenv("PR_NUMBER", "unknown"),
                "repo": os.getenv("GITHUB_REPOSITORY", "unknown"),
            }
            try:
                requests.post(webhook, json=payload, timeout=5)
            except Exception:
                pass

        print("Pipeline terminated: authorization failed.")
        sys.exit(1)

    print(f"Auth passed for {actor}")


if __name__ == "__main__":
    main()
