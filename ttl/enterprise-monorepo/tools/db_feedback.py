"""Insert pipeline metrics + generate baseline comparison for PR comments."""
import os
import sys

import psycopg2.extras

from db_connection import get_connection
from parse_results import get_parser


def main():
    if len(sys.argv) < 2:
        print("Usage: db_feedback.py <language>")
        sys.exit(1)

    lang = sys.argv[1]
    parser = get_parser(lang)

    # app_dir defaults to cwd; override with APP_DIR env
    app_dir = os.getenv("APP_DIR", ".")
    metrics = parser(app_dir)

    run_id = int(os.getenv("GITHUB_RUN_ID", 0))
    pr_num = int(os.getenv("PR_NUMBER", 0))
    branch = os.getenv("BRANCH_NAME", "unknown")
    commit = os.getenv("COMMIT_SHA", "unknown")
    author = os.getenv("PR_AUTHOR", "unknown")

    conn = get_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            # upsert current run
            cur.execute("""
                INSERT INTO pipeline_runs
                    (github_run_id, pull_request_id, branch_name, commit_hash,
                     author, language_scope, total_tests, passed_tests,
                     failed_tests, duration_seconds, coverage_pct)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (github_run_id, language_scope)
                DO UPDATE SET
                    total_tests = EXCLUDED.total_tests,
                    passed_tests = EXCLUDED.passed_tests,
                    failed_tests = EXCLUDED.failed_tests,
                    duration_seconds = EXCLUDED.duration_seconds,
                    coverage_pct = EXCLUDED.coverage_pct
            """, (run_id, pr_num, branch, commit, author, lang,
                  metrics["total_tests"], metrics["passed"],
                  metrics["failed"], metrics["duration"],
                  metrics["coverage_pct"]))

            # fetch baseline from main
            cur.execute("""
                SELECT total_tests, passed_tests, failed_tests,
                       duration_seconds, coverage_pct
                FROM pipeline_runs
                WHERE branch_name = 'main'
                  AND language_scope = %s
                  AND status = 'ACTIVE'
                ORDER BY created_at DESC
                LIMIT 1
            """, (lang,))
            baseline = cur.fetchone()

        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

    # build comparison markdown
    md = build_comparison(lang, metrics, baseline)
    with open("pr_comment.md", "w") as f:
        f.write(md)
    print(f"Wrote pr_comment.md for {lang}")


def build_comparison(lang, current, baseline):
    """Generate a markdown table comparing current run vs baseline."""
    header = f"## Pipeline Results: {lang}\n\n"

    if not baseline:
        return header + "_First run for this language on main — baseline locked._\n"

    def fmt_diff(curr, base, invert=False):
        diff = curr - base
        if diff == 0:
            return "—"
        sign = "+" if diff > 0 else ""
        flag = ""
        # flag regressions
        if invert and diff > 0:
            flag = " :warning:"
        elif not invert and diff < 0:
            flag = " :warning:"
        return f"{sign}{diff:.1f}{flag}" if isinstance(diff, float) else f"{sign}{diff}{flag}"

    dur_diff = current["duration"] - baseline["duration_seconds"]
    cov_diff = current["coverage_pct"] - baseline["coverage_pct"]

    # flag serious regressions
    warnings = []
    if dur_diff > 2.0:
        warnings.append(f"Duration increased by {dur_diff:.1f}s")
    if cov_diff < -5.0:
        warnings.append(f"Coverage dropped by {abs(cov_diff):.1f}%")

    table = (
        "| Metric | Baseline | Current | Delta |\n"
        "|--------|----------|---------|-------|\n"
        f"| Tests | {baseline['total_tests']} | {current['total_tests']} "
        f"| {fmt_diff(current['total_tests'], baseline['total_tests'])} |\n"
        f"| Passed | {baseline['passed_tests']} | {current['passed']} "
        f"| {fmt_diff(current['passed'], baseline['passed_tests'])} |\n"
        f"| Failed | {baseline['failed_tests']} | {current['failed']} "
        f"| {fmt_diff(current['failed'], baseline['failed_tests'], invert=True)} |\n"
        f"| Duration | {baseline['duration_seconds']:.1f}s | {current['duration']:.1f}s "
        f"| {fmt_diff(current['duration'], baseline['duration_seconds'], invert=True)} |\n"
        f"| Coverage | {baseline['coverage_pct']:.1f}% | {current['coverage_pct']:.1f}% "
        f"| {fmt_diff(current['coverage_pct'], baseline['coverage_pct'])} |\n"
    )

    result = header + table
    if warnings:
        result += "\n**Regressions detected:**\n"
        for w in warnings:
            result += f"- {w}\n"

    return result


if __name__ == "__main__":
    main()
