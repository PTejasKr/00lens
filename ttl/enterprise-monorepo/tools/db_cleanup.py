"""Soft-delete pipeline runs when a PR is closed."""
import os
import sys

from db_connection import get_connection


def main():
    pr_num = os.getenv("PR_NUMBER")
    if not pr_num:
        print("PR_NUMBER not set, nothing to archive")
        sys.exit(0)

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                UPDATE pipeline_runs
                SET status = 'ARCHIVED', closed_at = NOW()
                WHERE pull_request_id = %s AND status = 'ACTIVE'
            """, (int(pr_num),))
            count = cur.rowcount
        conn.commit()
        print(f"Archived {count} run(s) for PR #{pr_num}")
    except Exception as e:
        conn.rollback()
        print(f"Archival failed: {e}")
        sys.exit(1)
    finally:
        conn.close()


if __name__ == "__main__":
    main()
