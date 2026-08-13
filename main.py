#!/usr/bin/env python3
"""
APProved — agentic EU MDR CE-mark drafting workflow.

Implements, end to end:
  1-2. client uploads data + selects parameters (loaded from files/CLI here)
     +  consent gate -- audit-trail consent required          (consent_gate.py, fix 2)
     +  scope check -- reject non-device / pharma requests     (scope_gate.py, iteration 1)
     +  data-quality check -- reject unparsable uploads,        (data_quality_gate.py,
        missing required fields, or >15% missing patient-level  iteration 2, revised by fix 3)
        data in the Phase III / pivotal trial dataset
     +  classification plausibility check -- sanity-checks    (classification_gate.py,
        the declared class against the device description      bug fix)
        before any drafting starts
  3.   agent fetches the regulation, live from eumdr.com     (regulation.py, fix 1)
       by default, combined with the local reference
  4.   agent drafts the CE-mark submission                 (drafting.py, parallel)
  5.   agent exports to Word                                (docx_export.py)
     +  automated compliance gate (LLM-as-Judge)            (judge.py)
  6-9. internal regulatory-expert review, one QA pass       (review.py)
  10-13. client review loop, up to 5 rounds                 (review.py)
  14.  final approval ask -> ship, or escalate to a meeting (review.py)

Every gate decision, every round of human feedback, every redraft, and
every classification override (or decline to override -- see
classification_check.py) is timestamped and written to a per-submission
audit trail (audit_trail.py) in both JSON and plain text, once consent is
confirmed. document_library.json stays a lightweight one-line-per-run
index; the audit trail is the detailed record each index entry points to.

This file is deliberately a *workflow*, not an autonomous agent: the code
path is fixed and predictable (per Anthropic's "Building Effective Agents"
distinction), which is what you want for something a notified body may
eventually audit. Run `python main.py --help` for options.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import llm
import regulation
import docx_export
import judge
import consent_gate
import scope_gate
import data_quality_gate
import classification_check
import classification_gate
from audit_trail import AuditTrail
from config import ClientData, SubmissionParams
from drafting import draft_all_sections, redraft_section

OUT_DIR = Path(__file__).parent / "output"


def run(client_data_path: str, mock: bool, auto_demo: bool, live_fetch: bool,
        max_client_rounds: int, device_class: str) -> None:
    llm.set_mock(mock)
    OUT_DIR.mkdir(exist_ok=True)

    # --- Steps 1-2: client data + parameters -------------------------------
    print("=== [1-2] Client upload + parameters ===")
    raw_text = Path(client_data_path).read_text()

    try:
        loose_data = json.loads(raw_text)
        parsable = isinstance(loose_data, dict)
        if not parsable:
            loose_data = {}
    except json.JSONDecodeError:
        loose_data = {}
        parsable = False

    # --- [gate] Audit-trail consent (fix 2) -----------------------------------
    # Must run first: without the client's consent we aren't allowed to keep
    # a record of this request at all, so there's no point checking anything
    # else about it yet. Deliberately does *not* call _log_rejection() below
    # -- declining to consent means nothing about this request gets written
    # to document_library.json.
    print("\n=== [gate] Audit-trail consent ===")
    consent_result = consent_gate.check_consent(loose_data, parsable)
    if not consent_result.consented:
        print(f"[agent] Respectfully declining this request: {consent_result.reason}")
        print("[system] No audit-trail record was kept for this request (no consent given).")
        return
    if parsable:
        print("[agent] Audit-trail consent confirmed.")
    else:
        print("[agent] Could not confirm audit-trail consent from this upload -- continuing "
              "to the data-quality check, which will report the underlying problem.")

    # Only created once consent is confirmed -- same principle as
    # _log_rejection() below: no consent, no record, full stop.
    audit = AuditTrail(
        source_file=client_data_path,
        device_name=loose_data.get("device_name", "unknown device") if parsable else "unknown device",
    )
    audit.log("client", "consent", "Consented to audit-trail logging for this submission.")

    # --- [gate] Scope check (iteration 1) ------------------------------------
    # Reject pharmaceuticals / non-device requests before spending any effort
    # validating or drafting against them. Runs on the same lenient,
    # best-effort parse so a malformed upload can still be scope-checked (it
    # falls back to the raw text -- see scope_gate._build_prompt_input).
    print("\n=== [gate] Scope check ===")
    scope_result = scope_gate.check_scope(loose_data, raw_text)
    print(f"[agent] Scope verdict: {scope_result.category} — {scope_result.reason}")
    audit.log("agent", "gate_decision", f"Scope check verdict: {scope_result.category}",
               category=scope_result.category, reason=scope_result.reason,
               passed=scope_result.in_scope)
    if not scope_result.in_scope:
        print("[agent] Respectfully declining this request: APProved only drafts EU MDR "
              "technical documentation for medical devices.")
        audit.log("system", "outcome", "Request rejected: out of scope.")
        json_path, txt_path = audit.save(OUT_DIR)
        _log_rejection(client_data_path, "out_of_scope", scope_result.reason, json_path, txt_path)
        return

    # --- [gate] Data quality check (iteration 2, revised by fix 3) ------------
    # Reject uploads that aren't parsable, are missing a required intake
    # field, or have more than 15% missing patient-level data points in the
    # Phase III / pivotal trial dataset -- before any drafting starts.
    print("\n=== [gate] Data quality check ===")
    quality_result = data_quality_gate.check_quality(raw_text)
    audit.log("agent", "gate_decision", "Data quality check",
               passed=quality_result.passed, reason=quality_result.reason,
               clinical_missing_ratio=quality_result.clinical_missing_ratio,
               missing_fields=quality_result.missing_fields)
    if not quality_result.passed:
        print(f"[agent] Respectfully declining this request: {quality_result.reason}")
        audit.log("system", "outcome", "Request rejected: data quality.")
        json_path, txt_path = audit.save(OUT_DIR)
        _log_rejection(client_data_path, "poor_quality", quality_result.reason, json_path, txt_path)
        return
    print(f"[agent] Data quality OK ({quality_result.clinical_missing_ratio:.0%} of "
          f"pivotal-trial data points missing, within the 15% threshold).")

    client_data = ClientData.from_dict(loose_data)
    audit.set_device_name(client_data.device_name)
    params = SubmissionParams(
        regulation="EU_MDR",
        device_class=device_class,
        max_client_rounds=max_client_rounds,
    )
    print(f"[client] Uploaded data for: {client_data.device_name}")
    print(f"[client] Parameters: regulation={params.regulation}, "
          f"device_class={params.device_class}, market={params.target_market}")
    audit.log("client", "upload", f"Uploaded data for {client_data.device_name}.",
               regulation=params.regulation, device_class=params.device_class,
               target_market=params.target_market)

    # --- [gate] Classification plausibility check (bug fix) -------------------
    # classification_check.py only catches a classification problem if a
    # human's review feedback happens to mention a class -- re-testing
    # Scenario 4 (an implantable, life-sustaining device declared Class IIb,
    # where nobody ever raised it) showed it still shipped unquestioned.
    # This runs once, here, before any drafting starts, so a declared class
    # that doesn't match the device's own description gets surfaced up
    # front instead of depending on someone happening to notice later.
    print("\n=== [gate] Classification plausibility check ===")
    plausibility = classification_gate.check_plausibility(client_data, params)
    audit.log("agent", "gate_decision",
               f"Classification plausibility check: {'PLAUSIBLE' if plausibility.plausible else 'QUESTIONABLE'}",
               plausible=plausibility.plausible, suggested_class=plausibility.suggested_class,
               reason=plausibility.reason)
    if not plausibility.plausible and plausibility.suggested_class:
        classification_check.resolve_discrepancy(
            params, plausibility.suggested_class, "regulatory expert", auto_demo,
            discrepancy_message=(
                f"Before drafting, a plausibility check on the declared classification "
                f"found: {plausibility.reason} Declared: Class {params.device_class}. "
                f"Suggested: Class {plausibility.suggested_class}."
            ),
            audit=audit, trigger="intake_plausibility_check",
        )
    else:
        print(f"[agent] Classification plausibility check: OK. {plausibility.reason}")

    # --- Step 3: fetch the regulation ---------------------------------------
    print("\n=== [3] Agent fetches the regulation ===")
    # --mock always skips the live fetch too -- mock mode's whole point is
    # zero network dependency.
    effective_live_fetch = live_fetch and not mock
    regulation_text = regulation.fetch_regulation(params, allow_live_fetch=effective_live_fetch)
    print(f"[agent] Retrieved {len(regulation_text)} chars of regulation reference "
          f"({'live fetch (eumdr.com) + local reference' if effective_live_fetch else 'local reference only'}).")
    audit.log("agent", "retrieval", f"Fetched {len(regulation_text)} chars of regulation reference.",
               live_fetch=effective_live_fetch)

    # --- Step 4: draft the submission (parallel sections) -------------------
    print("\n=== [4] Agent drafts the CE-mark submission (parallel per section) ===")
    sections = draft_all_sections(client_data, regulation_text, params)
    for s in sections:
        print(f"[agent] Drafted: {s.title}")
    audit.log("agent", "draft", "Drafted the initial six sections.",
               sections={s.id: s.text for s in sections})

    # --- Automated compliance gate (LLM-as-Judge) ---------------------------
    print("\n=== [gate] Automated compliance check ===")
    results = judge.run_compliance_gate(sections, params)
    for r in results:
        status = "PASS" if r.passed else "FAIL"
        print(f"[judge] {r.section_id}: {status} — {r.notes}")
    audit.log("agent", "compliance_check", "Automated compliance gate results.",
               results={r.section_id: {"passed": r.passed, "notes": r.notes} for r in results})
    failed = {r.section_id: r.notes for r in results if not r.passed}
    if failed:
        print(f"[agent] Redrafting {len(failed)} section(s) flagged by the compliance gate...")
        sections = [
            redraft_section(s, failed[s.id], client_data, regulation_text, params)
            if s.id in failed else s
            for s in sections
        ]
        audit.log("agent", "redraft", f"Redrafted {len(failed)} section(s) flagged by the compliance gate.",
                   section_ids=list(failed), sections={s.id: s.text for s in sections if s.id in failed})

    # --- Step 5: export to Word ----------------------------------------------
    print("\n=== [5] Agent exports to Word ===")
    v1_path = docx_export.export_docx(
        sections, client_data, params, str(OUT_DIR / "01_draft_pre_expert.docx"), status="DRAFT"
    )
    print(f"[agent] Wrote {v1_path}")
    audit.log("agent", "export", "Exported the initial draft.", document_path=v1_path)

    # --- Steps 6-9: internal expert QA ---------------------------------------
    print("\n=== [6-9] Internal regulatory-expert review ===")
    import review
    sections = review.internal_expert_review(
        sections, client_data, regulation_text, params, auto_demo=auto_demo, audit=audit
    )
    v2_path = docx_export.export_docx(
        sections, client_data, params, str(OUT_DIR / "02_expert_validated.docx"),
        status="EXPERT-VALIDATED"
    )
    print(f"[agent] Wrote {v2_path}")
    audit.log("agent", "export", "Exported the expert-validated draft.", document_path=v2_path)

    # --- Steps 10-14: client review loop + final decision ---------------------
    print("\n=== [10-14] Client review loop ===")
    sections, accepted = review.client_review_loop(
        sections, client_data, regulation_text, params, auto_demo=auto_demo, audit=audit
    )

    if accepted:
        final_path = docx_export.export_docx(
            sections, client_data, params, str(OUT_DIR / "03_FINAL_shipped.docx"),
            status="FINAL — CLIENT APPROVED"
        )
        print(f"\n[agent] Client accepted. Shipped final package: {final_path}")
        audit.log("system", "outcome", "Shipped the final package.", document_path=final_path)
        json_path, txt_path = audit.save(OUT_DIR)
        _log_to_document_library(client_data, params, final_path, "shipped", None, json_path, txt_path)
    else:
        pending_path = docx_export.export_docx(
            sections, client_data, params, str(OUT_DIR / "03_pending_escalation.docx"),
            status="PENDING — ESCALATED"
        )
        request = review.schedule_meeting(client_data, params)
        audit.log("system", "outcome", "Escalated to a meeting request; client declined after the round cap.",
                   document_path=pending_path, meeting_request=request)
        json_path, txt_path = audit.save(OUT_DIR)
        _log_to_document_library(client_data, params, pending_path, "escalated", request, json_path, txt_path)
        print(f"[agent] Latest draft saved pending the meeting: {pending_path}")

    print(f"[system] Wrote audit trail: {json_path.name}, {txt_path.name}")


def _log_rejection(client_data_path: str, reason_code: str, reason: str,
                    audit_json_path: Path, audit_txt_path: Path) -> None:
    """Appends the lightweight index entry, for requests that were
    respectfully declined by the scope or data-quality gate before a client
    or device record even existed. The full blow-by-blow -- the discrepancy
    detection, every gate's reasoning -- lives in the audit trail these two
    paths point to (audit_trail.py), not in this one-line summary."""
    log_path = OUT_DIR / "document_library.json"
    entries = json.loads(log_path.read_text()) if log_path.exists() else []
    entries.append({
        "device": None,
        "source_file": client_data_path,
        "outcome": "rejected",
        "rejection_reason_code": reason_code,
        "rejection_reason": reason,
        "audit_trail_json": str(audit_json_path),
        "audit_trail_txt": str(audit_txt_path),
    })
    log_path.write_text(json.dumps(entries, indent=2))
    print(f"[system] Logged rejection to document library: {log_path}")


def _log_to_document_library(client_data: ClientData, params: SubmissionParams,
                              doc_path: str, outcome: str, meeting_request: dict | None,
                              audit_json_path: Path, audit_txt_path: Path) -> None:
    """The lightweight, one-line-per-run index (see the docx's Phase 3 for
    why this alone doesn't satisfy "traceable after the fact" -- the two
    audit trail paths logged here point to the file that does)."""
    log_path = OUT_DIR / "document_library.json"
    entries = json.loads(log_path.read_text()) if log_path.exists() else []
    entries.append({
        "device": client_data.device_name,
        "regulation": params.regulation,
        "device_class": params.device_class,
        "document_path": doc_path,
        "outcome": outcome,
        "meeting_request": meeting_request,
        "audit_trail_json": str(audit_json_path),
        "audit_trail_txt": str(audit_txt_path),
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
    parser.add_argument("--offline", action="store_true",
                         help="Skip the live EU MDR fetch from eumdr.com and use the bundled "
                              "local reference only (live fetch, combined with the local "
                              "reference, is the default -- see regulation.py, fix 1)")
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
        live_fetch=not args.offline,
        max_client_rounds=args.max_client_rounds,
        device_class=args.device_class,
    )


if __name__ == "__main__":
    main()
