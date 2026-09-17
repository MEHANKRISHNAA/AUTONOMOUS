import sqlite3
from contextlib import contextmanager
from typing import Iterator

from app.core.config import settings


def init_contact_store() -> None:
    settings.database_path.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(settings.database_path) as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS contact_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                message TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )


@contextmanager
def connection() -> Iterator[sqlite3.Connection]:
    conn = sqlite3.connect(settings.database_path)
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def save_contact_message(name: str, email: str, message: str) -> int:
    with connection() as conn:
        cursor = conn.execute(
            "INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)",
            (name, email, message),
        )
        return int(cursor.lastrowid)

