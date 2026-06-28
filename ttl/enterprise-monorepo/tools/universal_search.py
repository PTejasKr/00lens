"""Universal Search CLI engine using Postgres full-text search capabilities."""
import argparse
import sys

from db_connection import get_connection


def search_codebase(query_str):
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            # Query uses websearch_to_tsquery for advanced logic (quotes, OR, minus, etc.)
            # and outputs matches ranked by ts_rank
            cur.execute("""
                SELECT 
                    file_path, 
                    language, 
                    ts_rank(fts_tokens, websearch_to_tsquery('english', %s)) as rank,
                    ts_headline('english', content, websearch_to_tsquery('english', %s), 
                                'StartSel=[1;31m, StopSel=[0m, MaxWords=25, MinWords=15') as snippet
                FROM codebase_index
                WHERE fts_tokens @@ websearch_to_tsquery('english', %s)
                ORDER BY rank DESC
                LIMIT 10;
            """, (query_str, query_str, query_str))
            
            results = cur.fetchall()
            
            if not results:
                print(f"No matches found for: '{query_str}'")
                return

            print(f"\n🔍 Found {len(results)} matches for '{query_str}':\n")
            for path, lang, rank, snippet in results:
                print(f"📄 \033[1;36m{path}\033[0m [\033[1;32m{lang}\033[0m] (Rank: {rank:.3f})")
                # format lines cleanly
                clean_snippet = snippet.replace("\n", " ").strip()
                print(f"   Snippet: {clean_snippet}\n")
                
    except Exception as e:
        print(f"Search query failed: {e}")
        sys.exit(1)
    finally:
        conn.close()


def main():
    parser = argparse.ArgumentParser(description="Universal Codebase Search")
    parser.add_argument("--query", required=True, help="Search terms")
    args = parser.parse_args()
    search_codebase(args.query)


if __name__ == "__main__":
    main()
