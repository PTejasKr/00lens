-- v2: full-text search index schema for polyglot monorepo codebase
-- run via: python migrations/migrate.py

CREATE TABLE IF NOT EXISTS codebase_index (
    id SERIAL PRIMARY KEY,
    file_path VARCHAR(512) UNIQUE NOT NULL,
    file_name VARCHAR(256) NOT NULL,
    language VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    fts_tokens TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', coalesce(file_name, '') || ' ' || coalesce(content, ''))
    ) STORED
);

-- gin index on fts_tokens for super fast FTS searches
CREATE INDEX IF NOT EXISTS idx_codebase_fts ON codebase_index USING gin(fts_tokens);
