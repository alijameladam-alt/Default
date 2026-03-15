"""
SQLite database for scheduled LinkedIn posts.
Uses the stdlib sqlite3 module directly — no ORM needed for this simple schema.
"""
import sqlite3
import uuid
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path

DB_PATH = Path("scheduled_posts.db")


def init_db() -> None:
    with _conn() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS scheduled_posts (
                id TEXT PRIMARY KEY,
                topic TEXT NOT NULL,
                linkedin_post TEXT NOT NULL,
                linkedin_id TEXT NOT NULL,
                access_token_encrypted TEXT NOT NULL,
                scheduled_at TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'pending',
                post_url TEXT,
                error TEXT,
                created_at TEXT NOT NULL
            )
        """)


@contextmanager
def _conn():
    conn = sqlite3.connect(DB_PATH, detect_types=sqlite3.PARSE_DECLTYPES)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def create_scheduled_post(
    linkedin_post: str,
    topic: str,
    linkedin_id: str,
    access_token_encrypted: str,
    scheduled_at: datetime,
) -> dict:
    post_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    scheduled_at_str = scheduled_at.isoformat()
    with _conn() as conn:
        conn.execute(
            """INSERT INTO scheduled_posts
               (id, topic, linkedin_post, linkedin_id, access_token_encrypted,
                scheduled_at, status, created_at)
               VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)""",
            (post_id, topic, linkedin_post, linkedin_id, access_token_encrypted,
             scheduled_at_str, now),
        )
    return get_scheduled_post(post_id)


def get_scheduled_post(post_id: str) -> dict | None:
    with _conn() as conn:
        row = conn.execute(
            "SELECT * FROM scheduled_posts WHERE id = ?", (post_id,)
        ).fetchone()
    return dict(row) if row else None


def list_scheduled_posts(linkedin_id: str | None = None) -> list[dict]:
    with _conn() as conn:
        if linkedin_id:
            rows = conn.execute(
                "SELECT * FROM scheduled_posts WHERE linkedin_id = ? ORDER BY scheduled_at",
                (linkedin_id,),
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM scheduled_posts ORDER BY scheduled_at"
            ).fetchall()
    return [dict(r) for r in rows]


def get_pending_due_posts() -> list[dict]:
    """Return pending posts whose scheduled_at is <= now."""
    now = datetime.now(timezone.utc).isoformat()
    with _conn() as conn:
        rows = conn.execute(
            "SELECT * FROM scheduled_posts WHERE status = 'pending' AND scheduled_at <= ?",
            (now,),
        ).fetchall()
    return [dict(r) for r in rows]


def update_post_status(
    post_id: str,
    status: str,
    post_url: str | None = None,
    error: str | None = None,
) -> None:
    with _conn() as conn:
        conn.execute(
            "UPDATE scheduled_posts SET status = ?, post_url = ?, error = ? WHERE id = ?",
            (status, post_url, error, post_id),
        )


def cancel_scheduled_post(post_id: str) -> bool:
    with _conn() as conn:
        result = conn.execute(
            "UPDATE scheduled_posts SET status = 'cancelled' WHERE id = ? AND status = 'pending'",
            (post_id,),
        )
    return result.rowcount > 0
