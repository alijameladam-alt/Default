"""
Background scheduler that publishes due LinkedIn posts every minute.
Uses APScheduler with the BackgroundScheduler.
"""
import logging

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger

from backend import db
from backend.crypto import decrypt_token

logger = logging.getLogger(__name__)

_scheduler: BackgroundScheduler | None = None


def _publish_due_posts() -> None:
    """Check for pending posts that are due and publish them."""
    import asyncio
    import httpx

    due_posts = db.get_pending_due_posts()
    if not due_posts:
        return

    logger.info(f"Publishing {len(due_posts)} due scheduled post(s)")

    for post in due_posts:
        try:
            token = decrypt_token(post["access_token_encrypted"])
            payload = {
                "author": f"urn:li:person:{post['linkedin_id']}",
                "lifecycleState": "PUBLISHED",
                "specificContent": {
                    "com.linkedin.ugc.ShareContent": {
                        "shareCommentary": {"text": post["linkedin_post"]},
                        "shareMediaCategory": "NONE",
                    }
                },
                "visibility": {
                    "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
                },
            }

            # Use a synchronous httpx call inside the background thread
            with httpx.Client(timeout=30) as client:
                response = client.post(
                    "https://api.linkedin.com/v2/ugcPosts",
                    json=payload,
                    headers={
                        "Authorization": f"Bearer {token}",
                        "Content-Type": "application/json",
                        "X-Restli-Protocol-Version": "2.0.0",
                    },
                )
                response.raise_for_status()
                post_id = response.json().get("id", "")
                post_url = f"https://www.linkedin.com/feed/update/{post_id}/"

            db.update_post_status(post["id"], "published", post_url=post_url)
            logger.info(f"Published scheduled post {post['id']}: {post_url}")

        except Exception as exc:
            logger.error(f"Failed to publish scheduled post {post['id']}: {exc}")
            db.update_post_status(post["id"], "failed", error=str(exc))


def start_scheduler() -> None:
    global _scheduler
    _scheduler = BackgroundScheduler()
    _scheduler.add_job(
        _publish_due_posts,
        trigger=IntervalTrigger(minutes=1),
        id="publish_due_posts",
        replace_existing=True,
    )
    _scheduler.start()
    logger.info("Scheduler started — checking for due posts every 60 seconds")


def stop_scheduler() -> None:
    global _scheduler
    if _scheduler and _scheduler.running:
        _scheduler.shutdown(wait=False)
        logger.info("Scheduler stopped")
