# Enterprise Architecture & Codeflow Specification

This document details the software architecture, directory layout, database schema designs, and programmatic execution flows for the Polyglot Monorepo CI/CD and Universal Search engine.

---

## 1. Monorepo Directory Map

```
enterprise-monorepo/
│
├── .github/workflows/
│   └── enterprise-lifecycle.yml   # GHA workflow (matrix build + metrics hook)
│
├── tools/
│   ├── db_connection.py           # Shared database pooling & backoff retries
│   ├── security_gate.py           # PR triggers actor-allowlist check
│   ├── parse_results.py           # Parsers for Go/Java/Python/C/JS outputs
│   ├── db_feedback.py             # Metrics compiler and PR comment builder
│   ├── db_cleanup.py              # Stale/closed PR records soft-deleter
│   ├── send_notifications.py      # Stakeholder Mailgun notifications dispatcher
│   ├── index_codebase.py          # Codebase scraper and Postgres FTS indexer
│   └── universal_search.py        # CLI engine using Postgres lexical querying
│
├── migrations/
│   ├── 001_initial_schema.sql     # Metrics and user schema DDL
│   ├── 002_fts_search.sql         # FTS code indexing schema DDL
│   └── migrate.py                 # Forward-only migration engine
│
├── infra/
│   ├── pgbouncer/
│   │   └── pgbouncer.ini          # Transaction pool config for 5000+ clients
│   ├── postgres/
│   │   └── init.sql               # Seed and database bootstrap SQL
│   └── docker-compose.yml         # Container mapping with health checks & limits
│
├── go-app/                        # Go application context
├── java-app/                      # Java Maven app context
├── python-app/                    # Python app context
├── c-app/                         # C app context (Makefile)
└── js-app/                        # JavaScript app context
```

---

## 2. Programmatic Execution Flows

### A. CI/CD Lifecycle Flow (GitHub Actions)

When a Pull Request is opened, synchronized, or closed:
1.  **Change Isolation:** The workflow uses path-filters to output boolean flags indicating which language folders (`go-app/`, `python-app/`, etc.) contain modifications.
2.  **Pre-Job Security Gate:** 
    *   Before executing any test suites, a standalone `security-gate` job evaluates the `GITHUB_ACTOR` against `ALLOWED_ACTORS`.
    *   If authorization fails, the gate script POSTs an alert to the security webhook and terminates the run with exit code `1`, halting downstream builds.
3.  **Parallel Matrix Test Execution:**
    *   The pipeline runs a matrix job (`analyze-and-report`) across all five languages. Only lanes with corresponding change detection flags set to `true` execute their language-specific toolchains.
    *   Each lane runs its test command to generate local files containing coverage and test output details (JSON, XML, or plain text).
4.  **Feedback Loop:**
    *   A helper script imports [parse_results.py](file:///c:/Users/punya/Desktop/ttl/enterprise-monorepo/tools/parse_results.py) to read the metrics.
    *   It upserts run parameters and results into Postgres via the PgBouncer transaction proxy.
    *   It pulls previous `main` branch averages to compare metrics and compiles a markdown delta table which is posted directly as a PR sticky comment.
5.  **Archival & Notification (PR Close):**
    *   When the PR is merged or closed, the database cleanup job soft-deletes active records, and a Mailgun script alerts relevant stakeholders.

```
[PR Event]
   │
   ▼
[Security Gate (security_gate.py)] ──(Fail)──► [Terminate CI / Trigger Webhook]
   │
 (Pass)
   │
   ▼
[Path Detection (dorny/paths-filter)]
   │
   ├─► [go-app modified?] ─────► [Go test runner & coverage] ─────────┐
   ├─► [python-app modified?] ─► [Pytest & coverage] ────────────────┤
   └─► [java-app modified?] ───► [Maven verify & Surefire reports] ───┼─► [db_feedback.py]
                                                                      │          │
                                                                      ▼          ▼
                                                             [Postgres DB]   [Post PR Comment]
```

### B. Universal Search Pipeline

1.  **Indexing Stage:**
    *   `index_codebase.py` scans root folders, filtering out artifacts listed in `.gitignore`.
    *   It maps text files to their appropriate extensions (e.g. `.py` to `python`, `.go` to `go`).
    *   File contents are written into the `codebase_index` table.
2.  **Lexical Analysis Stage:**
    *   Upon inserting or updating records, Postgres tokenizes the code content into a queryable lexical document format (`tsvector`).
    *   A GIN index maps these tokens back to their row keys.
3.  **CLI Querying Stage:**
    *   The user issues a search request via `universal_search.py --query "<term>"`.
    *   The search client applies Postgres FTS logic `websearch_to_tsquery` to match records, orders them by term frequency/relevance using `ts_rank`, and renders context snippets generated using `ts_headline`.

---

## 3. Database Design Patterns

### Connection Resilience
Database connections are routed through PgBouncer running in `transaction` pooling mode. This allows the system to support thousands of concurrent client runners using a maximum pool size of 20 direct connections. Code calls to Postgres use `tenacity` retry logic to gracefully survive database restarts and transient network dropouts.

### Schema Blueprint

#### `pipeline_runs`
Tracks metrics for active PR branches and baseline compilations.
*   Composite Key: `(github_run_id, language_scope)` prevents matrix step collision.
*   Indexes:
    *   `idx_runs_status_pr` on `(status, pull_request_id)` for quick PR lifecycle searches.
    *   `idx_runs_baseline_lookup` on `(branch_name, language_scope, created_at)` for historical baseline lookups.

#### `codebase_index`
Supports codebase search indexing.
*   Column `fts_tokens` is a generated, stored Postgres `tsvector` combining the file path, name, and string contents.
*   `idx_codebase_fts` is a GIN index configured on `fts_tokens` to optimize search retrieval times.
