"""
Single choke point for every call to Claude.

Every other module calls `llm.complete(system, user)` instead of importing
`anthropic` directly. That buys us two things:

1. One place to change model / retries / logging.
2. A `--mock` mode that runs the *entire* workflow without an API key, by
   swapping this module's behaviour. Useful for demos, CI, and for anyone
   reading the code who doesn't have an ANTHROPIC_API_KEY on hand.

This file is deliberately the only place that imports the `anthropic`
package, and it imports it lazily (inside the function) so the rest of the
project can be exercised in mock mode with zero extra dependencies.
"""

import os

MODEL = "claude-sonnet-4-5"

_MOCK = False


def set_mock(mock: bool) -> None:
    global _MOCK
    _MOCK = mock


def complete(system: str, user: str, max_tokens: int = 2000) -> str:
    """Single-turn completion. Returns plain text."""
    if _MOCK:
        return _mock_complete(system, user)

    try:
        import anthropic
    except ImportError as e:
        raise RuntimeError(
            "The 'anthropic' package isn't installed. Run "
            "`pip install anthropic` and set ANTHROPIC_API_KEY, "
            "or run this workflow with --mock."
        ) from e

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError(
            "ANTHROPIC_API_KEY is not set. Export it, or run with --mock."
        )

    client = anthropic.Anthropic(api_key=api_key)
    response = client.messages.create(
        model=MODEL,
        max_tokens=max_tokens,
        system=system,
        messages=[{"role": "user", "content": user}],
    )
    return "".join(block.text for block in response.content if block.type == "text")


def _mock_complete(system: str, user: str) -> str:
    """Deterministic, offline stand-in for a Claude call. Good enough to
    exercise every branch of the workflow without spending a token."""
    if "compliance rubric" in system.lower():
        return (
            "VERDICT: PASS\n"
            "NOTES: GSPR coverage adequate and citations present. [mock judge]"
        )
    if "revise" in system.lower() or "feedback" in user.lower():
        return (
            "[mock revision]\n"
            "This section has been updated to incorporate the reviewer's "
            "feedback: clarified the intended purpose, added the missing "
            "risk-benefit statement, and tightened the citations to the "
            "relevant GSPR clauses."
        )
    # default: drafting a section
    return (
        "[mock draft]\n"
        "This section was generated in --mock mode. In a real run, Claude "
        "would draft this content from the uploaded device data and the "
        "retrieved EU MDR / MDCG text. Structurally, the output here is a "
        "stand-in of the correct length and shape so the rest of the "
        "pipeline (merge, docx export, review loops) can be exercised "
        "end-to-end without an API key."
    )
