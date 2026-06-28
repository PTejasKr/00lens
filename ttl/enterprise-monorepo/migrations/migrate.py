"""Forward-only migration runner. Applies unapplied NNN_*.sql files in order."""
import os
import re
import sys

# allow importing db_connection from tools/
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "tools"))

from db_connection import get_connection


MIGRATIONS_DIR = os.path.dirname(os.path.abspath(__file__))


def ensure_migrations_table(cur):
    cur.execute("""
        CREATE TABLE IF NOT EXISTS schema_migrations (
            version INT PRIMARY KEY,
            applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)


def get_applied(cur):
    cur.execute("SELECT version FROM schema_migrations ORDER BY version")
    return {row[0] for row in cur.fetchall()}


def find_migrations():
    """Return sorted list of (version, filepath) from NNN_*.sql files."""
    migrations = []
    for fname in os.listdir(MIGRATIONS_DIR):
        m = re.match(r"^(\d+)_.+\.sql$", fname)
        if m:
            migrations.append((int(m.group(1)), os.path.join(MIGRATIONS_DIR, fname)))
    return sorted(migrations, key=lambda x: x[0])


def main():
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            ensure_migrations_table(cur)
            conn.commit()

            applied = get_applied(cur)
            pending = [(v, p) for v, p in find_migrations() if v not in applied]

            if not pending:
                print("All migrations applied")
                return

            for version, path in pending:
                print(f"Applying migration {version}: {os.path.basename(path)}")
                with open(path) as f:
                    sql = f.read()
                cur.execute(sql)
                conn.commit()

            print(f"Applied {len(pending)} migration(s)")
    except Exception as e:
        conn.rollback()
        print(f"Migration failed: {e}")
        sys.exit(1)
    finally:
        conn.close()


if __name__ == "__main__":
    main()
