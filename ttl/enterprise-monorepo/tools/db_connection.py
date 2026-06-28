"""Shared pg connection w/ retry + TLS. All tools import from here."""
import os
import sys

import psycopg2
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type


# retry up to 4 times w/ exponential backoff (1s, 2s, 4s, 8s)
@retry(
    stop=stop_after_attempt(4),
    wait=wait_exponential(multiplier=1, min=1, max=10),
    retry=retry_if_exception_type((psycopg2.OperationalError, psycopg2.InterfaceError)),
    reraise=True,
)
def get_connection():
    return psycopg2.connect(
        host=os.getenv("DB_PROXY_HOST"),
        port=os.getenv("DB_PROXY_PORT", "6432"),
        database=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        sslmode=os.getenv("DB_SSLMODE", "require"),
        connect_timeout=10,
    )
