"""Batch email via Mailgun when a PR is closed/archived."""
import json
import os
import sys

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

from db_connection import get_connection


def build_session():
    s = requests.Session()
    retries = Retry(total=5, backoff_factor=1.5, status_forcelist=[429, 500, 502, 503, 504])
    s.mount("https://", HTTPAdapter(max_retries=retries))
    return s


def main():
    pr_num = os.getenv("PR_NUMBER", "?")
    domain = os.getenv("MAILGUN_DOMAIN")
    api_key = os.getenv("MAILGUN_API_KEY")

    if not domain or not api_key:
        print("Mailgun not configured, skipping notifications")
        return

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT email, full_name FROM company_users
                WHERE is_active = TRUE
                  AND notify_on_pr_close = TRUE
                  AND (last_notified_at IS NULL
                       OR last_notified_at < NOW() - INTERVAL '1 hour')
            """)
            users = cur.fetchall()

        if not users:
            print("No users to notify")
            conn.close()
            return

        emails = [u[0] for u in users]
        recipient_vars = {u[0]: {"name": u[1]} for u in users}

        session = build_session()
        resp = session.post(
            f"https://api.mailgun.net/v3/{domain}/messages",
            auth=("api", api_key),
            data={
                "from": f"Pipeline Bot <noreply@{domain}>",
                "to": emails,
                "recipient-variables": json.dumps(recipient_vars),
                "subject": f"[Pipeline] PR #{pr_num} archived",
                "html": (
                    "<p>Hi %recipient.name%,</p>"
                    f"<p>PR #{pr_num} has been closed and its pipeline runs archived.</p>"
                    "<p>— Pipeline Bot</p>"
                ),
            },
            timeout=15,
        )

        if resp.status_code == 200:
            # mark notified
            with conn.cursor() as cur:
                cur.execute("""
                    UPDATE company_users
                    SET last_notified_at = NOW()
                    WHERE email = ANY(%s)
                """, (emails,))
            conn.commit()
            print(f"Notified {len(emails)} user(s)")
        else:
            print(f"Mailgun error {resp.status_code}: {resp.text}")

    except Exception as e:
        conn.rollback()
        print(f"Notification failed: {e}")
        sys.exit(1)
    finally:
        conn.close()


if __name__ == "__main__":
    main()
