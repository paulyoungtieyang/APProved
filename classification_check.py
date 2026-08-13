"""
Detection and resolution for device-classification discrepancies.

Scenario 10 (see the docx "Test Scenarios" section) found that a regulatory
expert telling the agent "this should be Class I, not Class IIb" had no
effect: `SubmissionParams.device_class` is set once at the start of a run
and nothing in review.py ever reads it back out of the conversation, so the
correction silently vanished while the review loop printed "Validated" as
if it had been applied.

Two things live here:
  - find_mentioned_class()  -- scans free text for an explicit EU MDR class
                                mention (Roman-numeral or numeral form).
  - resolve_discrepancy()   -- the shared surface-it-and-ask flow, used both
                                when a human's review feedback mentions a
                                different class (review.py) and when the
                                intake-time plausibility check flags one
                                before any drafting starts
                                (classification_gate.py). Neither caller
                                applies or drops a correction on its own --
                                this always requires an explicit instruction
                                back first.

Bug fix: the original regex only recognized "Class I/IIa/IIb/III" -- the
Roman-numeral form. A regulatory expert typing "Class 2b" or "Class 1", both
completely ordinary informal usage, was invisible to it. Both forms are
recognized now.
"""

from __future__ import annotations

import re

VALID_CLASSES = ("I", "IIa", "IIb", "III")

# Longest alternatives first within each notation, so "Class III" isn't
# partially matched by "I", and "Class 2b" isn't partially matched by "2".
_CLASS_RE = re.compile(r"\bclass\s+(iia|iib|iii|2a|2b|i|1|3)\b", re.IGNORECASE)
_TOKEN_TO_CANONICAL = {
    "i": "I", "1": "I",
    "iia": "IIa", "2a": "IIa",
    "iib": "IIb", "2b": "IIb",
    "iii": "III", "3": "III",
}

# Scripted answer to the classification-discrepancy question, for
# --auto-demo runs. Defaults to the conservative choice -- an unattended
# run should never silently reclassify a device.
DEMO_CLASSIFICATION_DECISION = "KEEP"


def find_mentioned_class(text: str) -> str | None:
    """Returns the canonical class token (e.g. "IIb") if the text
    explicitly mentions an EU MDR device class -- "Class IIb" or "Class 2b"
    both work -- else None."""
    match = _CLASS_RE.search(text)
    if not match:
        return None
    return _TOKEN_TO_CANONICAL.get(match.group(1).lower())


def resolve_discrepancy(params, mentioned_class: str, role: str, auto_demo: bool,
                         discrepancy_message: str, audit=None, trigger: str = "") -> None:
    """Surfaces a classification discrepancy and requires an explicit
    RECLASSIFY/KEEP instruction back before anything else happens -- never
    silently applies the mention (which would leave the header/audit-trail
    wrong) and never silently drops it (Scenario 10's original bug).
    Mutates params.device_class in place if the human confirms a
    reclassification. `discrepancy_message` is the caller's own
    plain-language explanation of *why* this fired (a review-feedback
    mention reads differently from an intake-time plausibility flag);
    `trigger` is a short machine-readable tag for the same, logged to
    `audit` (an optional AuditTrail, audit_trail.py) alongside every other
    branch below, when one is supplied."""
    print(f"[agent] {discrepancy_message}")
    if audit:
        audit.log(
            "agent", "classification_discrepancy", discrepancy_message,
            role=role, mentioned_class=mentioned_class, current_class=params.device_class,
            trigger=trigger,
        )

    prompt = (
        f"[{role}] How should I proceed? Type 'RECLASSIFY' to change this submission "
        f"to Class {mentioned_class} throughout, or 'KEEP' to keep Class {params.device_class} "
        f"and proceed without changing the classification: "
    )
    if auto_demo:
        decision = DEMO_CLASSIFICATION_DECISION
        print(f"[{role}, scripted] {decision}")
    else:
        decision = input(prompt).strip()

    actor = role.replace(" ", "_")
    if decision.strip().upper().startswith("RECLASSIFY"):
        old_class = params.device_class
        params.device_class = mentioned_class
        print(
            f"[agent] Reclassified this submission from Class {old_class} to "
            f"Class {params.device_class}, per the {role}'s explicit instruction. "
            f"This now applies to the document header, the audit trail, and every "
            f"section drafted or revised from this point on."
        )
        if audit:
            audit.log(
                actor, "override",
                f"Explicitly reclassified the submission from Class {old_class} to "
                f"Class {params.device_class}.",
                old_class=old_class, new_class=params.device_class, trigger=trigger,
            )
    else:
        print(
            f"[agent] Keeping Class {params.device_class}, per the {role}'s explicit "
            f"instruction. The classification will not change."
        )
        if audit:
            audit.log(
                actor, "decision",
                f"Explicitly kept Class {params.device_class}; declined to reclassify "
                f"despite the discrepancy.",
                kept_class=params.device_class, mentioned_class=mentioned_class, trigger=trigger,
            )
