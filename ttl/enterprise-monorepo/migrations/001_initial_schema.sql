-- v1: initial schema for pipeline metrics tracking
-- run via: python migrations/migrate.py

CREATE TABLE IF NOT EXISTS schema_migrations (
    version INT PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pipeline_runs (
    id SERIAL PRIMARY KEY,
    github_run_id BIGINT NOT NULL,
    pull_request_id INT NOT NULL,
    branch_name VARCHAR(255) NOT NULL,
    commit_hash VARCHAR(40) NOT NULL,
    author VARCHAR(255) NOT NULL,
    language_scope VARCHAR(50) NOT NULL,
    total_tests INT DEFAULT 0,
    passed_tests INT DEFAULT 0,
    failed_tests INT DEFAULT 0,
    duration_seconds REAL DEFAULT 0.0,
    coverage_pct REAL DEFAULT 0.0,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP NULL,
    -- matrix jobs share run_id, so scope by language
    UNIQUE (github_run_id, language_scope)
);

CREATE TABLE IF NOT EXISTS company_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    role VARCHAR(50) NOT NULL,
    notify_on_pr_close BOOLEAN DEFAULT TRUE,
    last_notified_at TIMESTAMP NULL
);

-- perf indexes
CREATE INDEX IF NOT EXISTS idx_runs_status_pr ON pipeline_runs(status, pull_request_id);
CREATE INDEX IF NOT EXISTS idx_runs_baseline_lookup ON pipeline_runs(branch_name, language_scope, created_at);
CREATE INDEX IF NOT EXISTS idx_active_users ON company_users(is_active) WHERE is_active = TRUE;

INSERT INTO schema_migrations (version) VALUES (1) ON CONFLICT DO NOTHING;
