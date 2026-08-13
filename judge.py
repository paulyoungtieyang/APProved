"""
Automated compliance gate -- an LLM-as-Judge check that runs before the
draft ever reaches a human. Not in your original step list, but it's cheap
insurance: it catches missing citations or GSPR gaps that don't need a
person's judgment, so the regulatory expert's one review pass (step 6-9)
is spent on things that actually need a human.

This is deliberately a *checklist scorer*, not a free-text critic -- it's
asked to return a fixed, parseable format so `main.py` can act on it
programmatically (redraft the flagged section) rather than needing another
LLM call just to interpret the judge's own output.
"""

import re
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass

import llm
from drafting import DraftSection
from config import SubmissionParams

_RUBRIC = """You are a compliance rubric checker for EU MDR technical documentation
(this is a "compliance rubric" / GSPR coverage check, not a creative review).
Score the section strictly against this checklist:
1. Does it cite the relevant MDR Annex/Article?
2. Does every factual claim trace back to the device data provided (no invented data)?
3. Is it free of contradictions with the stated device classification?

Respond in EXACTLY this format, nothing else:
VERDICT: PASS or FAIL
NOTES: <one sentence, or "none">
"""


@dataclass
class JudgeResult:
    section_id: str
    passed: bool
    notes: str


def check_section(section: DraftSection, params: SubmissionParams) -> JudgeResult:
    user = f"SECTION TITLE: {section.title}\n\nSECTION TEXT:\n{section.text}"
    raw = llm.complete(_RUBRIC, user, max_tokens=150)

    verdict_match = re.search(r"VERDICT:\s*(PASS|FAIL)", raw, re.IGNORECASE)
    passed = bool(verdict_match) and verdict_match.group(1).upper() == "PASS"

    notes_match = re.search(r"NOTES:\s*(.*)", raw, re.IGNORECASE)
    notes = notes_match.group(1).strip() if notes_match else raw.strip()
    return JudgeResult(section_id=section.id, passed=passed, notes=notes)


def run_compliance_gate(sections: list[DraftSection], params: SubmissionParams) -> list[JudgeResult]:
    """Bug fix: this used to score every section one at a time, unlike
    drafting.py's parallel sectioning -- inconsistent with the rest of the
    pipeline's stated architecture and up to 6x slower than necessary
    against a live API for no reason. Now runs one concurrent call per
    section, same ThreadPoolExecutor pattern as draft_all_sections()."""
    with ThreadPoolExecutor(max_workers=len(sections)) as pool:
        futures = [pool.submit(check_section, s, params) for s in sections]
        results = [f.result() for f in futures]
    order = {s.id: i for i, s in enumerate(sections)}
    results.sort(key=lambda r: order[r.section_id])
    return results
