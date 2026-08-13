"""
Iteration 1: a scope-eligibility gate that runs before any drafting work
starts. APProved only drafts EU MDR technical documentation for medical
devices -- it rejects pharmaceuticals (drugs, biologics, vaccines -- these
need a medicines-agency marketing authorisation, not a CE mark) and anything
else that isn't a medical device at all.

Runs on a best-effort read of the upload, before the data-quality gate
(iteration 2, data_quality_gate.py) checks whether that upload is
well-formed. There's no point validating the structure of a drug
submission that doesn't belong in this product in the first place, so
scope is checked first, even if the file turns out to be malformed JSON --
in that case this gate just falls back to classifying the raw text.
"""

from __future__ import annotations

import re
from dataclasses import dataclass

import llm

_RUBRIC = """You are a scope-eligibility gate for an EU MDR medical-device
regulatory writing service. Read the product information below and classify
it into exactly one category:

- MEDICAL_DEVICE: an EU MDR-eligible medical device (instruments, implants,
  diagnostic equipment, software as a medical device, dressings, etc.) --
  something that would be CE-marked under Regulation (EU) 2017/745.
- PHARMACEUTICAL: a drug, biologic, vaccine, or other medicinal product --
  anything described by an active pharmaceutical ingredient, a dosage form
  (tablet, capsule, injection, infusion, ointment), or pharmacokinetic /
  pharmacodynamic claims. Products like this need a medicines-agency
  marketing authorisation, not a CE mark, and this service cannot draft for
  them.
- OTHER_OUT_OF_SCOPE: neither of the above (cosmetics, food supplements,
  general consumer goods, unrelated software, or the text doesn't describe
  a product at all).

Respond in EXACTLY this format, nothing else:
VERDICT: MEDICAL_DEVICE or PHARMACEUTICAL or OTHER_OUT_OF_SCOPE
REASON: <one plain-language sentence, addressed to the person who submitted it>
"""

_MAX_RAW_CHARS = 2000


@dataclass
class ScopeResult:
    in_scope: bool
    category: str  # MEDICAL_DEVICE | PHARMACEUTICAL | OTHER_OUT_OF_SCOPE
    reason: str


def _build_prompt_input(loose_data: dict, raw_text: str) -> str:
    fields = ("device_name", "intended_purpose", "device_description")
    picked = {f: loose_data.get(f) for f in fields if loose_data.get(f)}
    if picked:
        return "\n".join(f"{k.upper()}: {v}" for k, v in picked.items())
    # The loose parse produced nothing usable -- fall back to the raw text
    # so a malformed upload can still be scope-checked instead of skipped.
    return f"RAW UPLOAD (unparsed):\n{raw_text[:_MAX_RAW_CHARS]}"


def check_scope(loose_data: dict, raw_text: str) -> ScopeResult:
    """loose_data is a best-effort dict (possibly empty if the upload didn't
    parse as JSON) -- see main.py, which parses leniently before this gate
    and strictly again in the data-quality gate right after it."""
    user = _build_prompt_input(loose_data, raw_text)
    raw = llm.complete(_RUBRIC, user, max_tokens=150)

    match = re.search(
        r"VERDICT:\s*(MEDICAL_DEVICE|PHARMACEUTICAL|OTHER_OUT_OF_SCOPE)", raw, re.IGNORECASE
    )
    # Fail closed, same convention as judge.py: an unparseable verdict is
    # treated as out of scope rather than silently let through.
    category = match.group(1).upper() if match else "OTHER_OUT_OF_SCOPE"

    reason_match = re.search(r"REASON:\s*(.*)", raw, re.IGNORECASE)
    reason = reason_match.group(1).strip() if reason_match else raw.strip()

    return ScopeResult(in_scope=(category == "MEDICAL_DEVICE"), category=category, reason=reason)
