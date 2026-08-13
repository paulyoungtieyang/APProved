"""
Step 3 of the workflow: "Agent fetches the regulation."

This is the RAG / retrieval tool from the system diagram ("MDR/MDCG store").
For a real deployment this would be a vector index over the full regulation
text and every relevant MDCG guidance document, refreshed whenever the
Policy & Regulatory News feed flags a change.

Fix 1 (see the docx "Fixes" section): continuous glucose monitors -- and EU
MDR classification generally -- are exactly the kind of thing a static,
possibly-stale local reference can get wrong. So by default this now fetches
the live regulation-updates page at eumdr.com and combines it with the local
reference, instead of relying on the local copy alone. eumdr.com's homepage
is a news/updates portal, not the full regulation text, so it is combined
with -- not swapped in for -- the local reference: the local file still
carries the clause-level Annex I/II/III/XIV structure that drafting and
review are grounded in, and the live fetch adds visibility into the latest
amendments and MDCG guidance on top of it. `--offline` (see main.py) skips
the live fetch and falls back to the local reference alone; `--mock` runs
always skip it too, since mock mode's whole point is zero network
dependency.
"""

from __future__ import annotations

import re
from html.parser import HTMLParser
from pathlib import Path

from config import SubmissionParams

_LOCAL_REFERENCE_PATH = Path(__file__).parent / "data" / "mdr_reference.md"

_SOURCES = {
    "EU_MDR": "https://eumdr.com/",
}

_LIVE_FETCH_MAX_CHARS = 4000
_SKIP_TAGS = {"script", "style", "nav", "header", "footer", "noscript"}


def fetch_regulation(params: SubmissionParams, allow_live_fetch: bool = True) -> str:
    """Returns the regulation text (local reference, optionally combined
    with a live fetch) to ground drafting in. Raises if the regulation
    code isn't recognized."""

    if params.regulation not in _SOURCES:
        raise ValueError(
            f"Unknown regulation '{params.regulation}'. "
            f"Supported: {list(_SOURCES)}. Add a new entry to regulation.py "
            f"to extend this to FDA, PMDA, etc."
        )

    local_text = _LOCAL_REFERENCE_PATH.read_text(encoding="utf-8")

    if not allow_live_fetch:
        return local_text

    source_url = _SOURCES[params.regulation]
    live_text = _try_live_fetch(source_url)
    if not live_text:
        print("  [regulation] live fetch failed or disabled — using local reference only")
        return local_text

    return (
        f"{local_text}\n\n"
        f"---\n"
        f"LATEST EU MDR UPDATES (fetched live from {source_url}):\n"
        f"{live_text}\n"
    )


def _try_live_fetch(url: str) -> str | None:
    try:
        import requests
        resp = requests.get(url, timeout=10, headers={"User-Agent": "APProved-demo/0.1"})
        resp.raise_for_status()
        return _html_to_text(resp.text)[:_LIVE_FETCH_MAX_CHARS]
    except Exception:
        return None


def _html_to_text(html: str) -> str:
    """Minimal, dependency-free HTML-to-text extraction -- good enough to
    turn a live page into grounding text without pulling in a full HTML
    parsing library for a demo. Drops script/style/nav/header/footer
    content and collapses whitespace."""

    class _TextExtractor(HTMLParser):
        def __init__(self):
            super().__init__()
            self._skip_depth = 0
            self.chunks: list[str] = []

        def handle_starttag(self, tag, attrs):
            if tag in _SKIP_TAGS:
                self._skip_depth += 1

        def handle_endtag(self, tag):
            if tag in _SKIP_TAGS:
                self._skip_depth = max(0, self._skip_depth - 1)

        def handle_data(self, data):
            if not self._skip_depth:
                text = data.strip()
                if text:
                    self.chunks.append(text)

    extractor = _TextExtractor()
    extractor.feed(html)
    text = "\n".join(extractor.chunks)
    return re.sub(r"\n{3,}", "\n\n", text)
