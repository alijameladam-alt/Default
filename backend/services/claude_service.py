import json
import re

import anthropic

from backend.config import settings

MODEL = "claude-sonnet-4-6"

SYSTEM_PROMPT = """You are an expert LinkedIn content creator. Given a video transcript, identify between {min_posts} and {max_posts} distinct topics, insights, or key moments that each deserve their own unique LinkedIn post.

Generate a separate LinkedIn article for each topic. Return a JSON object with this exact structure:
{{
  "summary": "3-5 sentence executive summary of the entire video",
  "posts": [
    {{
      "topic": "Brief topic title (5-10 words)",
      "linkedin_post": "300-500 word {tone} LinkedIn article with a hook opening line, 3-4 key insights, and a closing call-to-action question."
    }}
  ]
}}

Rules:
- Each linkedin_post must be 300-500 words
- Posts must be unique — do not repeat the same insights across posts
- Cover different angles, lessons, or segments of the content
- Return ONLY valid JSON, no markdown fences, no extra text"""


def _count_words(text: str) -> int:
    return len(re.findall(r"\S+", text))


def _parse_response(content: str) -> dict:
    content = re.sub(r"^```(?:json)?\s*", "", content.strip())
    content = re.sub(r"\s*```$", "", content)
    return json.loads(content)


def _calculate_max_posts(transcript: str) -> tuple[int, int]:
    """Return (min_posts, max_posts) based on transcript word count."""
    word_count = _count_words(transcript)
    if word_count < 500:
        return 1, 2
    elif word_count < 1500:
        return 2, 5
    elif word_count < 3000:
        return 3, 10
    else:
        return 5, 20


async def generate_linkedin_posts(transcript: str, tone: str = "professional") -> dict:
    """Generate multiple unique LinkedIn posts from a transcript."""
    client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)
    min_posts, max_posts = _calculate_max_posts(transcript)
    system = SYSTEM_PROMPT.format(min_posts=min_posts, max_posts=max_posts, tone=tone)

    response = await client.messages.create(
        model=MODEL,
        max_tokens=4096,
        system=system,
        messages=[{"role": "user", "content": f"Transcript:\n\n{transcript}"}],
    )

    raw = response.content[0].text
    result = _parse_response(raw)

    # Validate and fix word counts per post
    validated_posts = []
    posts_needing_retry = []
    for i, post in enumerate(result.get("posts", [])):
        wc = _count_words(post["linkedin_post"])
        if 300 <= wc <= 500:
            validated_posts.append({
                "topic": post["topic"],
                "linkedin_post": post["linkedin_post"],
                "word_count": wc,
                "word_count_warning": False,
            })
        else:
            posts_needing_retry.append((i, post, wc))

    # Retry out-of-range posts in a single call
    if posts_needing_retry:
        retry_instructions = "\n".join(
            f"Post {i+1} ('{p['topic']}'): was {wc} words. Rewrite to be strictly 300-500 words."
            for i, p, wc in posts_needing_retry
        )
        retry_response = await client.messages.create(
            model=MODEL,
            max_tokens=4096,
            system=system,
            messages=[
                {"role": "user", "content": f"Transcript:\n\n{transcript}"},
                {"role": "assistant", "content": raw},
                {
                    "role": "user",
                    "content": (
                        f"Some posts had incorrect word counts. Please rewrite only the following posts "
                        f"and return the same JSON structure with only those posts in the 'posts' array:\n"
                        f"{retry_instructions}"
                    ),
                },
            ],
        )
        retry_result = _parse_response(retry_response.content[0].text)
        retry_posts = retry_result.get("posts", [])

        for idx, (orig_i, orig_post, _) in enumerate(posts_needing_retry):
            if idx < len(retry_posts):
                rp = retry_posts[idx]
                wc = _count_words(rp["linkedin_post"])
                validated_posts.insert(orig_i, {
                    "topic": rp.get("topic", orig_post["topic"]),
                    "linkedin_post": rp["linkedin_post"],
                    "word_count": wc,
                    "word_count_warning": not (300 <= wc <= 500),
                })
            else:
                # Keep original with warning if retry didn't include it
                orig_wc = _count_words(orig_post["linkedin_post"])
                validated_posts.insert(orig_i, {
                    "topic": orig_post["topic"],
                    "linkedin_post": orig_post["linkedin_post"],
                    "word_count": orig_wc,
                    "word_count_warning": True,
                })

    return {
        "summary": result.get("summary", ""),
        "posts": validated_posts,
    }
