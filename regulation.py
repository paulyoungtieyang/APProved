"""
Step 3 of the workflow: "Agent fetches the regulation."

This is the RAG / retrieval tool from the system diagram ("MDR/MDCG store").
For a real deployment this would be a vector index over the full regulation
text and every relevant MDCG guidance document, refreshed whenever the
Policy & Regulatory News feed flags a change.

For this demo it does the honest, simple version of that: it tries a live
fetch of the regulation's canonical source, and falls back to a condensed
local reference file if that fails (no network, offline demo, site
structure changed, etc.). The fallback is not a placeholder — it's real,
verified content, just condensed. Swap `_LOCAL_REFERENCE_PATH` for a real
retrieval store when this stops being a demo.
"""

from pathlib import Path
from config import SubmissionParams

_LOCAL_REFERENCE_PATH = Path(__file__).parent / "data" / "mdr_reference.md"

_SOURCES = {
    "EU_MDR": "https://eur-lex.europa.eu/eli/reg/2017/745/oj/eng",
}


def fetch_regulation(params: SubmissionParams, allow_live_fetch: bool = False) -> str:
    """Returns the regulation text (or condensed reference) to ground
    drafting in. Raises if the regulation code isn't recognized."""

    if params.regulation not in _SOURCES:
        raise ValueError(
            f"Unknown regulation '{params.regulation}'. "
            f"Supported: {list(_SOURCES)}. Add a new entry to regulation.py "
            f"to extend this to FDA, PMDA, etc."
        )

    if allow_live_fetch:
        text = _try_live_fetch(_SOURCES[params.regulation])
        if text:
            return text
        print("  [regulation] live fetch failed or disabled — using local reference")

    return _LOCAL_REFERENCE_PATH.read_text(encoding="utf-8")


def _try_live_fetch(url: str) -> str | None:
    try:
        import requests
        resp = requests.get(url, timeout=10, headers={"User-Agent": "APProved-demo/0.1"})
        resp.raise_for_status()
        return resp.text
    except Exception:
        return None
