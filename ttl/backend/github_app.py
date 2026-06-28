"""
github_app.py — GitHub App integration helper.
Provides JWT generation, installation token exchange, Check Run creation,
and webhook signature verification for a server-side GitHub App flow.
"""

import hmac
import hashlib
import json
import time
import os
import logging
import urllib.request as urlreq
import jwt

logger = logging.getLogger("velo.github_app")

# Expiry offset for JWT (max 10 minutes on GitHub App JWTs)
JWT_EXPIRY_SECONDS = 600

def verify_webhook_signature(payload_bytes: bytes, signature_header: str | None) -> bool:
    """Validate webhook payload against GITHUB_APP_WEBHOOK_SECRET."""
    secret = os.getenv("GITHUB_APP_WEBHOOK_SECRET")
    if not secret:
        # If secret is not set in dev, warn but pass (make it configurable)
        logger.warning("GITHUB_APP_WEBHOOK_SECRET not configured. Skipping signature verification.")
        return True
    if not signature_header:
        logger.error("Missing X-Hub-Signature-256 header")
        return False
    
    # signature format is sha256=signature
    sha_name, signature = signature_header.split("=")
    if sha_name != "sha256":
        return False
        
    mac = hmac.new(secret.encode("utf-8"), msg=payload_bytes, digestmod=hashlib.sha256)
    return hmac.compare_digest(mac.hexdigest(), signature)


def generate_app_jwt() -> str | None:
    """Generate a JWT using GITHUB_APP_ID and GITHUB_APP_PRIVATE_KEY."""
    app_id = os.getenv("GITHUB_APP_ID")
    private_key_raw = os.getenv("GITHUB_APP_PRIVATE_KEY")

    if not app_id or not private_key_raw:
        logger.error("Missing GITHUB_APP_ID or GITHUB_APP_PRIVATE_KEY")
        return None

    # Replace literal newline escapes if passed directly via env vars
    private_key = private_key_raw.replace("\\n", "\n")

    now = int(time.time())
    payload = {
        "iat": now - 60,                # 60s buffer for clock drift
        "exp": now + JWT_EXPIRY_SECONDS, # max 10m
        "iss": int(app_id)
    }

    try:
        token = jwt.encode(payload, private_key, algorithm="RS256")
        return token
    except Exception as exc:
        logger.exception("Failed to generate GitHub App JWT")
        return None


def get_installation_token(installation_id: int) -> str | None:
    """Exchange App JWT for an installation access token."""
    app_jwt = generate_app_jwt()
    if not app_jwt:
        return None

    url = f"https://api.github.com/app/installations/{installation_id}/access_tokens"
    headers = {
        "Authorization": f"Bearer {app_jwt}",
        "Accept": "application/vnd.github+json",
        "User-Agent": "Velo-App/1.0"
    }

    try:
        req = urlreq.Request(url, headers=headers, method="POST")
        with urlreq.urlopen(req, timeout=15) as response:
            res_data = json.loads(response.read().decode())
            return res_data.get("token")
    except Exception as exc:
        if hasattr(exc, "read"):
            try:
                logger.error("Token exchange failed: %s", exc.read().decode())
            except:
                pass
        logger.exception("Failed to fetch GitHub App installation token")
        return None


def create_check_run(owner: str, repo: str, head_sha: str, token: str) -> int | None:
    """Create a Check Run on the commit SHA, returning check_run_id."""
    url = f"https://api.github.com/repos/{owner}/{repo}/check-runs"
    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github+json",
        "Content-Type": "application/json",
        "User-Agent": "Velo-App/1.0"
    }
    payload = {
        "name": "Velo CI/CD Healing",
        "head_sha": head_sha,
        "status": "in_progress",
        "started_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "output": {
            "title": "Velo Autonomous Code Healing Agent",
            "summary": "Analyzing the codebase, resolving tests, and applying autonomous bugfixes..."
        }
    }

    try:
        req = urlreq.Request(url, data=json.dumps(payload).encode(), headers=headers, method="POST")
        with urlreq.urlopen(req, timeout=15) as response:
            res_data = json.loads(response.read().decode())
            return res_data.get("id")
    except Exception as exc:
        if hasattr(exc, "read"):
            try:
                logger.error("Failed to create Check Run: %s", exc.read().decode())
            except:
                pass
        logger.exception("Failed to create GitHub check run")
        return None


def update_check_run(
    owner: str,
    repo: str,
    check_run_id: int,
    token: str,
    status: str,
    conclusion: str | None = None,
    summary: str = "",
    title: str = "Velo Autonomous Code Healing",
    text_content: str = ""
) -> bool:
    """Update check run status/conclusion."""
    url = f"https://api.github.com/repos/{owner}/{repo}/check-runs/{check_run_id}"
    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github+json",
        "Content-Type": "application/json",
        "User-Agent": "Velo-App/1.0"
    }
    payload = {
        "status": status,
        "output": {
            "title": title,
            "summary": summary
        }
    }
    if conclusion:
        payload["conclusion"] = conclusion
        payload["completed_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    if text_content:
        payload["output"]["text"] = text_content

    try:
        req = urlreq.Request(url, data=json.dumps(payload).encode(), headers=headers, method="PATCH")
        with urlreq.urlopen(req, timeout=15) as r:
            return r.status == 200
    except Exception as exc:
        if hasattr(exc, "read"):
            try:
                logger.error("Failed to update Check Run: %s", exc.read().decode())
            except:
                pass
        logger.exception("Failed to update check run")
        return False
