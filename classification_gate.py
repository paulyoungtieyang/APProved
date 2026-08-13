"""
Bug fix: classification_check.py (built after Scenario 10) only catches a
classification problem if a human's review feedback happens to mention a
specific class. Re-testing Scenario 4 -- an implantable, life-sustaining
pulse generator declared Class IIb, where neither the scripted expert nor
the scripted client ever mentions a class number -- showed it still ships
completely unquestioned. The narrow fix closed the "human corrected it and
got ignored" case; it did nothing for "nobody happened to raise it".

This closes that gap from the other end: once, at intake, before any
drafting starts, an LLM-as-judge call (same pattern as scope_gate.py)
sanity-checks the declared class against the device's own description. This
is deliberately a *plausibility* check, not a re-derivation of the class
from first principles -- EU MDR classification is a real judgment call
(Annex VIII), and this is meant to catch a description that reads like a
different risk class entirely, not to second-guess a defensible borderline
call. If it looks implausible, it's routed into the exact same
RECLASSIFY/KEEP flow as a mid-review discrepancy (classification_check.py),
surfaced to the regulatory expert before drafting rather than after.
"""

from __future__ import annotations

import re
from dataclasses import dataclass

import llm
from config import ClientData, SubmissionParams

_RUBRIC = """You are a one-time classification-plausibility check for EU MDR
technical documentation, run once at intake before any drafting begins. You
are NOT re-deriving the class from scratch -- you are sanity-checking the
class the client declared against the device's own description, at a high
level, per the Annex VIII classification rules. As rough guidance: active
implantable devices, and devices intended to administer or remove medicinal
products, are typically Class III; most non-invasive, non-measuring reusable
instruments are typically Class I; many software-driven, wearable, or
measuring electronic devices are typically Class IIa or IIb. Only flag a
mismatch if the description clearly points to a different class than the one
declared -- do not flag a defensible, borderline call.

DECLARED CLASS: {declared_class}

Respond in EXACTLY this format, nothing else:
VERDICT: PLAUSIBLE or QUESTIONABLE
SUGGESTED_CLASS: <I, IIa, IIb, or III -- or "n/a" if PLAUSIBLE>
REASON: <one plain-language sentence>
"""

_CLASS_TOKEN_RE = re.compile(r"\b(IIa|IIb|III|I)\b", re.IGNORECASE)


@dataclass
class ClassificationPlausibility:
    plausible: bool
    suggested_class: str | None
    reason: str


def check_plausibility(client_data: ClientData, params: SubmissionParams) -> ClassificationPlausibility:
    system = _RUBRIC.format(declared_class=params.device_class)
    user = (
        f"DEVICE NAME: {client_data.device_name}\n"
        f"INTENDED PURPOSE: {client_data.intended_purpose}\n"
        f"DESCRIPTION: {client_data.device_description}\n"
    )
    raw = llm.complete(system, user, max_tokens=150)

    verdict_match = re.search(r"VERDICT:\s*(PLAUSIBLE|QUESTIONABLE)", raw, re.IGNORECASE)
    # Fail open here, deliberately, unlike scope_gate's fail-closed default:
    # an unparseable verdict from a *plausibility* check shouldn't block an
    # otherwise-fine submission on its own -- classification_check.py's
    # mid-review net is still there if a human raises it later.
    plausible = not (bool(verdict_match) and verdict_match.group(1).upper() == "QUESTIONABLE")

    suggested = None
    class_section = raw.split("SUGGESTED_CLASS:", 1)
    if len(class_section) > 1:
        class_match = _CLASS_TOKEN_RE.search(class_section[1].split("\n", 1)[0])
        if class_match:
            suggested = class_match.group(1)

    reason_match = re.search(r"REASON:\s*(.*)", raw, re.IGNORECASE)
    reason = reason_match.group(1).strip() if reason_match else raw.strip()

    return ClassificationPlausibility(plausible=plausible, suggested_class=suggested, reason=reason)
