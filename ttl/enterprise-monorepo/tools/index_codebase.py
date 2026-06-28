"""Indexer utility to crawl monorepo and populate codebase_index for FTS."""
import os
import sys

from db_connection import get_connection

EXCLUDE_DIRS = {
    "node_modules",
    ".venv",
    "venv",
    ".git",
    "target",
    "bin",
    "dist",
    "build",
    ".pytest_cache",
    "__pycache__",
}
EXT_TO_LANG = {
    ".go": "go",
    ".java": "java",
    ".py": "python",
    ".c": "c",
    ".h": "c",
    ".js": "javascript",
    ".json": "javascript",
}


def index_files(root_dir):
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            for root, dirs, files in os.walk(root_dir):
                # prune directory walk
                dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]

                for file in files:
                    ext = os.path.splitext(file)[1]
                    if ext not in EXT_TO_LANG:
                        continue

                    full_path = os.path.join(root, file)
                    rel_path = os.path.relpath(full_path, root_dir)

                    try:
                        with open(full_path, "r", encoding="utf-8", errors="ignore") as f:
                            content = f.read()
                    except Exception as e:
                        print(f"Skipping {rel_path} due to read error: {e}")
                        continue

                    # upsert file
                    cur.execute("""
                        INSERT INTO codebase_index (file_path, file_name, language, content)
                        VALUES (%s, %s, %s, %s)
                        ON CONFLICT (file_path)
                        DO UPDATE SET
                            file_name = EXCLUDED.file_name,
                            language = EXCLUDED.language,
                            content = EXCLUDED.content
                    """, (rel_path, file, EXT_TO_LANG[ext], content))

            conn.commit()
            print("Successfully indexed codebase.")
    except Exception as e:
        conn.rollback()
        print(f"Indexing failed: {e}")
        sys.exit(1)
    finally:
        conn.close()


if __name__ == "__main__":
    # monorepo root is parent of tools/
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    index_files(root)
