#!/usr/bin/env python3
"""
APProved — agentic EU MDR CE-mark drafting workflow.

Implements, end to end:
  1-2. client uploads data + selects parameters (loaded from files/CLI here)
  3.   agent fetches the regulation                       (regulation.py)
  4.   agent drafts the CE-mark submission                 (drafting.py, parallel)
  5.   agent exports to Word                                (docx_export.py)
     +  automated compliance gate (LLM-as-Judge)            (judge.py)
  6-9. internal regulatory-expert review, one QA pass       (review.py)
  10-13. client review loop, up to 5 rounds                 (review.py)
  14.  final approval ask -> ship, or escalate to a meeting (review.py)

This file is deliberately a *workflow*, not an autonomous agent: the code
path is fixed and predictable (per Anthropic's "Building Effective Agents"
distinction), which is what you want for something a notified body may
eventually audit. Run `python main.py --help` for options.
"""

import argparse
import json
import sys
from pathlib import Path

import llm
import regulation
import docx_export
import judge
from config import ClientData, SubmissionParams
from drafting import draft_all_sections, redraft_section

OUT_DIR = Path(__file__).parent / "output"


def run(client_data_path: str, mock: bool, auto_demo: bool, live_fetch: bool,
        max_client_rounds: int, device_class: str) -> None:
    llm.set_mock(mock)
    OUT_DIR.mkdir(exist_ok=True)

    # --- Steps 1-2: client data + parameters -------------------------------
    print("=== [1-2] Client upload + parameters ===")
    client_data = ClientData.from_dict(json.loads(Path(client_data_path).read_text()))
    params = SubmissionParams(
        regulation="EU_MDR",
        device_class=device_class,
        max_client_rounds=max_client_rounds,
    )
    print(f"[client] Uploaded data for: {client_data.device_name}")
    print(f"[client] Parameters: regulation={params.regulation}, "
          f"device_class={params.device_class}, market={params.target_market}")

    # --- Step 3: fetch the regulation ---------------------------------------
    print("\n=== [3] Agent fetches the regulation ===")
    regulation_text = regulation.fetch_regulation(params, allow_live_fetch=live_fetch)
    print(f"[agent] Retrieved {len(regulation_text)} chars of regulation reference "
          f"({'live fetch' if live_fetch else 'local reference'}).")

    # --- Step 4: draft the submission (parallel sections) -------------------
    print("\n=== [4] Agent drafts the CE-mark submission (parallel per section) ===")
    sections = draft_all_sections(client_data, regulation_text, params)
    for s in sections:
        print(f"[agent] Drafted: {s.title}")

    # --- Automated compliance gate (LLM-as-Judge) ---------------------------
    print("\n=== [gate] Automated compliance check ===")
    results = judge.run_compliance_gate(sections, params)
    for r in results:
        status = "PASS" if r.passed else "FAIL"
        print(f"[judge] {r.section_id}: {status} — {r.notes}")
    failed = {r.section_id: r.notes for r in results if not r.passed}
    if failed:
        print(f"[agent] Redrafting {len(failed)} section(s) flagged by the compliance gate...")
        sections = [
            redraft_section(s, failed[s.id], client_data, regulation_text, params)
            if s.id in failed else s
            for s in sections
        ]

    # --- Step 5: export to Word ----------------------------------------------
    print("\n=== [5] Agent exports to Word ===")
    v1_path = docx_export.export_docx(
        sections, client_data, params, str(OUT_DIR / "01_draft_pre_expert.docx"), status="DRAFT"
    )
    print(f"[agent] Wrote {v1_path}")

    # --- Steps 6-9: internal expert QA ---------------------------------------
    print("\n=== [6-9] Internal regulatory-expert review ===")
    import review
    sections = review.internal_expert_review(
        sections, client_data, regulation_text, params, auto_demo=auto_demo
    )
    v2_path = docx_export.export_docx(
        sections, client_data, params, str(OUT_DIR / "02_expert_validated.docx"),
        status="EXPERT-VALIDATED"
    )
    print(f"[agent] Wrote {v2_path}")

    # --- Steps 10-14: client review loop + final decision ---------------------
    print("\n=== [10-14] Client review loop ===")
    sections, accepted = review.client_review_loop(
        sections, client_data, regulation_text, params, auto_demo=auto_demo
    )

    if accepted:
        final_path = docx_export.export_docx(
            sections, client_data, params, str(OUT_DIR / "03_FINAL_shipped.docx"),
            status="FINAL — CLIENT APPROVED"
        )
        print(f"\n[agent] Client accepted. Shipped final package: {final_path}")
        _log_to_document_library(client_data, params, final_path, "shipped")
    else:
        pending_path = docx_export.export_docx(
            sections, client_data, params, str(OUT_DIR / "03_pending_escalation.docx"),
            status="PENDING — ESCALATED"
        )
        request = review.schedule_meeting(client_data, params)
        _log_to_document_library(client_data, params, pending_path, "escalated", request)
        print(f"[agent] Latest draft saved pending the meeting: {pending_path}")


def _log_to_document_library(client_data: ClientData, params: SubmissionParams,
                              doc_path: str, outcome: str, meeting_request: dict | None = None) -> None:
    """Minimal stand-in for the 'Document Library' + audit trail from the
    system diagram: appends one JSON record per run."""
    log_path = OUT_DIR / "document_library.json"
    entries = json.loads(log_path.read_text()) if log_path.exists() else []
    entries.append({
        "device": client_data.device_name,
        "regulation": params.regulation,
        "device_class": params.device_class,
        "document_path": doc_path,
        "outcome": outcome,
        "meeting_request": meeting_request,
    })
    log_path.write_text(json.dumps(entries, indent=2))
    print(f"[system] Logged to document library: {log_path}")


def main() -> None:
    parser = argparse.ArgumentParser(description="APProved agentic EU MDR CE-mark workflow")
    parser.add_argument("--client-data", default=str(Path(__file__).parent / "data" / "sample_device_data.json"),
                         help="Path to the client's uploaded device data (JSON)")
    parser.add_argument("--mock", action="store_true",
                         help="Run without calling the real Claude API (no ANTHROPIC_API_KEY needed)")
    parser.add_argument("--auto-demo", action="store_true",
                         help="Use scripted expert/client responses instead of terminal input")
    parser.add_argument("--live-fetch", action="store_true",
                         help="Attempt to fetch the regulation live instead of using the local reference")
    parser.add_argument("--max-client-rounds", type=int, default=5)
    parser.add_argument("--device-class", default="IIb")
    args = parser.parse_args()

    if not args.mock and not __import__("os").environ.get("ANTHROPIC_API_KEY"):
        print("No ANTHROPIC_API_KEY found and --mock not set.\n"
              "Either: export ANTHROPIC_API_KEY=sk-... , or re-run with --mock.\n",
              file=sys.stderr)
        sys.exit(1)

    run(
        client_data_path=args.client_data,
        mock=args.mock,
        auto_demo=args.auto_demo,
        live_fetch=args.live_fetch,
        max_client_rounds=args.max_client_rounds,
        device_class=args.device_class,
    )


if __name__ == "__main__":
    main()
