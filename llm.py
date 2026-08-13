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

    # The SDK already retries transient errors (rate limits, overloaded,
    # connection issues) internally -- max_retries=2 by default. Bug fix:
    # this file previously had no handling at all for what happens once
    # those internal retries are exhausted, which matters here specifically
    # because drafting and every redraft fire up to 6 of these calls
    # concurrently (see drafting.py / review.py's ThreadPoolExecutor usage),
    # so a single rate-limited call used to kill the whole run with a raw,
    # hard-to-diagnose SDK exception. Bumped headroom slightly for that
    # concurrent load, and a persistent failure is now re-raised as one
    # clear, actionable error instead -- this doesn't add a second, redundant
    # retry loop on top of the SDK's own.
    client = anthropic.Anthropic(api_key=api_key, max_retries=5)
    try:
        response = client.messages.create(
            model=MODEL,
            max_tokens=max_tokens,
            system=system,
            messages=[{"role": "user", "content": user}],
        )
    except anthropic.AnthropicError as e:
        raise RuntimeError(
            f"Claude API call failed after the SDK's own retries were "
            f"exhausted: {e}. Check ANTHROPIC_API_KEY, network connectivity, "
            f"and https://status.anthropic.com, or run with --mock."
        ) from e
    return "".join(block.text for block in response.content if block.type == "text")


_PHARMA_KEYWORDS = (
    "tablet", "capsule", "oral solution", "injection", "infusion",
    "active pharmaceutical ingredient", "mg dose", "pharmacokinetic",
    "pharmacodynamic", "vaccine", "biologic", "drug product", "excipient",
)
_DEVICE_KEYWORDS = (
    "implant", "device", "instrument", "catheter", "sensor", "diagnostic",
    "surgical", "stabilization", "plate", "prosthesis", "monitor", "brace",
)


def _mock_scope_verdict(user: str) -> str:
    """Offline stand-in for the scope-eligibility gate (scope_gate.py).
    Keyword-matches the prompt text so --mock can still exercise the
    accept/reject branches, instead of always returning the same verdict."""
    text = user.lower()
    if any(k in text for k in _PHARMA_KEYWORDS):
        return (
            "VERDICT: PHARMACEUTICAL\n"
            "REASON: This describes a drug product (dosage form / active "
            "pharmaceutical ingredient language), which falls under "
            "medicines regulation, not EU MDR CE-marking. [mock scope gate]"
        )
    if "RAW UPLOAD (unparsed)" in user and not any(k in text for k in _DEVICE_KEYWORDS):
        return (
            "VERDICT: OTHER_OUT_OF_SCOPE\n"
            "REASON: The uploaded text doesn't clearly describe a medical "
            "device. [mock scope gate]"
        )
    return (
        "VERDICT: MEDICAL_DEVICE\n"
        "REASON: This describes a physical medical device eligible for EU "
        "MDR CE-marking. [mock scope gate]"
    )


_HIGH_RISK_CLASSIFICATION_KEYWORDS = (
    "implantable", "life-sustaining", "life-supporting",
    "vital physiological function", "long-term implantation",
    "active implantable",
)


def _mock_classification_verdict(system: str, user: str) -> str:
    """Offline stand-in for the intake-time classification-plausibility
    check (classification_gate.py). Flags a QUESTIONABLE verdict when the
    description reads like an active implantable device (typically
    Class III per Annex VIII Rule 8) but a different class was declared."""
    import re as _re
    declared_match = _re.search(r"DECLARED CLASS:\s*(\S+)", system)
    declared = (declared_match.group(1) if declared_match else "IIb").upper()
    text = user.lower()
    if any(k in text for k in _HIGH_RISK_CLASSIFICATION_KEYWORDS) and declared != "III":
        return (
            "VERDICT: QUESTIONABLE\n"
            "SUGGESTED_CLASS: III\n"
            "REASON: The description reads like an active implantable, "
            "life-sustaining device, which is typically Class III under EU "
            "MDR Annex VIII Rule 8. [mock classification check]"
        )
    return (
        "VERDICT: PLAUSIBLE\n"
        "SUGGESTED_CLASS: n/a\n"
        "REASON: The declared class is consistent with the device "
        "description. [mock classification check]"
    )


def _mock_complete(system: str, user: str) -> str:
    """Deterministic, offline stand-in for a Claude call. Good enough to
    exercise every branch of the workflow without spending a token."""
    if "classification-plausibility check" in system.lower():
        return _mock_classification_verdict(system, user)
    if "scope-eligibility gate" in system.lower():
        return _mock_scope_verdict(user)
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
