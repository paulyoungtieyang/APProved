"""
Step 4: "Agent writes the MDR submission for CE-mark."

EU MDR's technical documentation structure (Annex II/III) is fixed and
known in advance -- it isn't discovered at run time. That's why this is
implemented as *parallelization (sectioning)*, not an open-ended
orchestrator-worker agent: each section is an independent, focused LLM
call that only has to think about its own slice of the regulation, and
they run concurrently. See SECTIONS below -- that list *is* the
architecture decision.
"""

from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass

import llm
from config import ClientData, SubmissionParams

SECTIONS = [
    {
        "id": "device_description",
        "title": "1. Device Description and Specification",
        "instructions": (
            "Draft the device description and specification section of an EU MDR "
            "technical documentation package, per Annex II(1). Cover intended "
            "purpose, intended patient population, device variants, and "
            "classification rationale."
        ),
    },
    {
        "id": "gspr_checklist",
        "title": "2. General Safety and Performance Requirements (GSPR) Checklist",
        "instructions": (
            "Draft a GSPR checklist narrative per Annex I, mapping the device's "
            "design and evidence to the applicable general safety and performance "
            "requirements. Where a specific requirement is not applicable, state "
            "why."
        ),
    },
    {
        "id": "risk_management",
        "title": "3. Risk Management Summary",
        "instructions": (
            "Draft a risk management summary aligned with ISO 14971, as required "
            "by Annex I. Summarize the risk management process, key identified "
            "hazards, and the overall benefit-risk conclusion, based on the "
            "risk data provided."
        ),
    },
    {
        "id": "clinical_evaluation",
        "title": "4. Clinical Evaluation Summary",
        "instructions": (
            "Draft a clinical evaluation summary per Annex XIV and Article 61, "
            "based on the clinical data provided. If equivalence data is "
            "referenced, note that it should be justified per MDCG 2020-5."
        ),
    },
    {
        "id": "labeling",
        "title": "5. Labeling and Instructions for Use",
        "instructions": (
            "Draft a summary of the labeling and instructions for use content "
            "required by GSPR 23 (Annex I), appropriate to the device described."
        ),
    },
    {
        "id": "pms_plan",
        "title": "6. Post-Market Surveillance Plan (Summary)",
        "instructions": (
            "Draft a summary of the post-market surveillance plan required by "
            "Annex III, describing how safety and performance data will "
            "continue to be collected after CE-marking."
        ),
    },
]


@dataclass
class DraftSection:
    id: str
    title: str
    text: str


def _draft_one_section(section: dict, client_data: ClientData, regulation_text: str,
                        params: SubmissionParams) -> DraftSection:
    system = (
        "You are a regulatory medical writer drafting one section of an EU MDR "
        "CE-mark technical documentation package. Write precisely, cite the "
        "relevant Annex/Article, and only claim what the provided device data "
        "supports. Do not invent data. Output the section body only, no preamble."
    )
    user = f"""SECTION: {section['title']}
INSTRUCTIONS: {section['instructions']}

REGULATION REFERENCE (condensed):
{regulation_text}

DEVICE DATA (from client upload):
- Device: {client_data.device_name} ({client_data.manufacturer})
- Intended purpose: {client_data.intended_purpose}
- Description: {client_data.device_description}
- Clinical data: {client_data.clinical_data_summary}
- Risk summary: {client_data.risk_summary}

TARGET MARKET: {params.target_market}
LANGUAGE: {params.language}
"""
    text = llm.complete(system, user, max_tokens=1200)
    return DraftSection(id=section["id"], title=section["title"], text=text)


def draft_all_sections(client_data: ClientData, regulation_text: str,
                        params: SubmissionParams) -> list[DraftSection]:
    """Runs one LLM call per section IN PARALLEL (parallelization /
    sectioning pattern), then returns them in a fixed, predictable order."""
    with ThreadPoolExecutor(max_workers=len(SECTIONS)) as pool:
        futures = [
            pool.submit(_draft_one_section, section, client_data, regulation_text, params)
            for section in SECTIONS
        ]
        results = [f.result() for f in futures]

    order = {s["id"]: i for i, s in enumerate(SECTIONS)}
    results.sort(key=lambda d: order[d.id])
    return results


def redraft_section(section: DraftSection, feedback: str, client_data: ClientData,
                     regulation_text: str, params: SubmissionParams) -> DraftSection:
    """Targeted single-section revision -- used by both the compliance gate
    (judge.py) and the human review loops (review.py) so a round of
    feedback never forces a full re-draft of the whole document."""
    system = (
        "You are a regulatory medical writer revising one section of an EU MDR "
        "CE-mark technical documentation package based on reviewer feedback. "
        "Apply the feedback precisely. Output the full revised section body only."
    )
    user = f"""SECTION: {section.title}

CURRENT TEXT:
{section.text}

REVIEWER FEEDBACK TO APPLY:
{feedback}

REGULATION REFERENCE (condensed):
{regulation_text}

DEVICE: {client_data.device_name} | TARGET MARKET: {params.target_market}
"""
    text = llm.complete(system, user, max_tokens=1200)
    return DraftSection(id=section.id, title=section.title, text=text)
