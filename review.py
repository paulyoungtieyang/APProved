"""
Steps 6-14: the two human-in-the-loop review cycles, plus the final
decision gate.

Both loops are the same underlying pattern (evaluator-optimizer with a
*human* as the evaluator) applied twice:
  - internal_expert_review()  -> one QA pass, capped for safety
  - client_review_loop()      -> up to `params.max_client_rounds` rounds,
                                  then a mandatory final accept/decline ask

Two ways to supply the human's input:
  - interactive (default): real terminal input(), for actually running this
    with a person in the loop.
  - auto_demo=True: scripted canned responses, so the whole pipeline can run
    unattended end-to-end (useful for testing and for a recorded demo).
"""

from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass

from config import ClientData, SubmissionParams
from drafting import DraftSection, redraft_section

_APPROVAL_WORDS = {"approve", "approved", "yes", "y", "ok", "looks good", "lgtm", ""}

# Scripted responses so --auto-demo can run without a human at the keyboard.
_DEMO_EXPERT_FEEDBACK = [
    "Add an explicit reference to ISO 14971 in the risk management section, "
    "and clarify that the reoperation rate is within the pre-specified acceptance criteria.",
    "approve",
]
_DEMO_CLIENT_FEEDBACK = [
    "Can you soften the clinical language for a non-specialist reader in the executive framing, "
    "and double-check the equivalence claim is clearly attributed to MDCG 2020-5?",
    "One more round: please add a sentence on PMCF timelines in the surveillance section.",
    "approve",
]
_DEMO_FINAL_DECISION = "accept"


def apply_feedback_to_all(sections: list[DraftSection], feedback: str, client_data: ClientData,
                           regulation_text: str, params: SubmissionParams) -> list[DraftSection]:
    """Revise every section against the same round of feedback, in parallel."""
    with ThreadPoolExecutor(max_workers=len(sections)) as pool:
        futures = [
            pool.submit(redraft_section, s, feedback, client_data, regulation_text, params)
            for s in sections
        ]
        revised = [f.result() for f in futures]
    order = {s.id: i for i, s in enumerate(sections)}
    revised.sort(key=lambda d: order[d.id])
    return revised


def _is_approval(text: str) -> bool:
    return text.strip().lower() in _APPROVAL_WORDS


def internal_expert_review(sections: list[DraftSection], client_data: ClientData,
                            regulation_text: str, params: SubmissionParams,
                            auto_demo: bool = False) -> list[DraftSection]:
    """Steps 6-9: agent -> expert -> agent -> expert, one QA pass (capped
    at params.max_internal_qa_rounds so it can't loop forever)."""
    demo_feedback = iter(_DEMO_EXPERT_FEEDBACK)

    for round_num in range(1, params.max_internal_qa_rounds + 1):
        print(f"\n--- [6-9] Internal QA — round {round_num} ---")
        print("[agent] Sent draft to regulatory expert for review.")

        if auto_demo:
            feedback = next(demo_feedback, "approve")
            print(f"[expert, scripted] {feedback}")
        else:
            feedback = input(
                "[regulatory expert] Suggestions? (type feedback, or 'approve' to validate): "
            ).strip()

        if _is_approval(feedback):
            print("[expert] Validated. Proceeding to client.")
            return sections

        sections = apply_feedback_to_all(sections, feedback, client_data, regulation_text, params)
        print("[agent] Revised the document per expert feedback.")

    print("[system] Internal QA round cap reached without explicit validation "
          "— proceeding to client with the latest draft (flagged in the audit log).")
    return sections


def client_review_loop(sections: list[DraftSection], client_data: ClientData,
                        regulation_text: str, params: SubmissionParams,
                        auto_demo: bool = False):
    """Steps 10-14: ship to client, ask for feedback, revise, repeat up to
    `max_client_rounds`. Returns (sections, accepted: bool)."""
    demo_feedback = iter(_DEMO_CLIENT_FEEDBACK)

    for round_num in range(1, params.max_client_rounds + 1):
        print(f"\n=== [10-13] Client review — round {round_num} of {params.max_client_rounds} ===")
        print("[agent] Shipped the current draft to the client.")

        if auto_demo:
            feedback = next(demo_feedback, "approve")
            print(f"[client, scripted] {feedback}")
        else:
            feedback = input(
                f"[client] Feedback? (round {round_num}/{params.max_client_rounds}, "
                f"or 'approve' to accept): "
            ).strip()

        if _is_approval(feedback):
            print("[client] Approved.")
            return sections, True

        sections = apply_feedback_to_all(sections, feedback, client_data, regulation_text, params)
        print("[agent] Updated the document per client feedback.")

    # Step 14: cap reached without approval -- force the final decision.
    print(f"\n=== [14] Round cap ({params.max_client_rounds}) reached. "
          f"Requesting final approval. ===")
    if auto_demo:
        decision = _DEMO_FINAL_DECISION
        print(f"[client, scripted] {decision}")
    else:
        decision = input("[client] Final decision — 'accept' or 'decline': ").strip().lower()

    accepted = decision.startswith("accept") or decision.startswith("y")
    return sections, accepted


def schedule_meeting(client_data: ClientData, params: SubmissionParams,
                      outstanding_feedback: str = "") -> dict:
    """Step 14b: the decline path. In production this calls a real
    calendar/scheduling API (see the system diagram's 'Scheduling API'
    tool) -- here it returns a structured request so the caller can log it
    or wire it up to one."""
    request = {
        "type": "escalation_meeting",
        "device": client_data.device_name,
        "manufacturer": client_data.manufacturer,
        "regulation": params.regulation,
        "requested_with": "company regulatory expert",
        "reason": "client declined final approval after the review-round cap",
        "outstanding_feedback": outstanding_feedback or "see latest client round",
    }
    print("\n[agent] Client declined final approval. "
          "Offering to schedule a meeting with the regulatory expert.")
    print(f"[system] Escalation request created: {request}")
    return request
