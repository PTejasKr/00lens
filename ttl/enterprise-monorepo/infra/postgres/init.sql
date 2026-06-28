-- bootstrap schema — runs once on first container start

-- ci/cd pipeline run results, one row per language scope per run
CREATE TABLE IF NOT EXISTS pipeline_runs (
    id                SERIAL PRIMARY KEY,
    github_run_id     BIGINT NOT NULL,
    pull_request_id   INT NOT NULL,
    branch_name       VARCHAR(255) NOT NULL,
    commit_hash       VARCHAR(40) NOT NULL,
    author            VARCHAR(255) NOT NULL,
    language_scope    VARCHAR(50) NOT NULL,
    total_tests       INT DEFAULT 0,
    passed_tests      INT DEFAULT 0,
    failed_tests      INT DEFAULT 0,
    duration_seconds  REAL DEFAULT 0.0,
    coverage_pct      REAL DEFAULT 0.0,
    status            VARCHAR(20) DEFAULT 'ACTIVE',
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closed_at         TIMESTAMP NULL,

    -- same run can have go + java + python rows, but not two go rows
    UNIQUE (github_run_id, language_scope)
);

-- internal users who get notifications
CREATE TABLE IF NOT EXISTS company_users (
    id                SERIAL PRIMARY KEY,
    email             VARCHAR(255) UNIQUE NOT NULL,
    full_name         VARCHAR(255) NOT NULL,
    is_active         BOOLEAN DEFAULT TRUE,
    role              VARCHAR(50) NOT NULL,
    notify_on_pr_close BOOLEAN DEFAULT TRUE,
    last_notified_at  TIMESTAMP NULL
);

-- track which migrations have been applied
CREATE TABLE IF NOT EXISTS schema_migrations (
    version     INT PRIMARY KEY,
    applied_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_pipeline_status_pr
    ON pipeline_runs (status, pull_request_id);

CREATE INDEX IF NOT EXISTS idx_pipeline_branch_lang_date
    ON pipeline_runs (branch_name, language_scope, created_at);

-- partial index — only care about active users for notification queries
CREATE INDEX IF NOT EXISTS idx_users_active
    ON company_users (is_active) WHERE is_active = TRUE;

-- seed migration version
INSERT INTO schema_migrations (version) VALUES (1) ON CONFLICT DO NOTHING;
