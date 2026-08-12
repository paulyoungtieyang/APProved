# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A runnable implementation of an agentic EU MDR CE-mark drafting workflow for
APProved (a medical writing platform): client uploads device data -> agent
fetches EU MDR -> agent drafts the CE-mark technical documentation in
parallel per section -> an automated compliance gate -> one internal
regulatory-expert review pass -> up to 5 rounds of client review -> final
accept/decline, with a decline routing to a scheduled meeting instead of a
dead end. See `README.md` for the full step-by-step spec this was built
against.

## Commands

Install: `pip install -r requirements.txt`

Run without any API key or human interaction (fastest way to check nothing
is broken -- exercises drafting, the compliance gate, the expert loop, and
the client loop end to end with scripted responses):
```
python main.py --mock --auto-demo
```

Run with real Claude calls but still-scripted expert/client responses (needs `ANTHROPIC_API_KEY`):
```
python main.py --auto-demo
```

Run the real thing -- real API calls, you answer the expert/client prompts interactively:
```
python main.py
```

Other flags: `--client-data <path>` (defaults to `data/sample_device_data.json`), `--max-client-rounds N` (default 5), `--device-class {I,IIa,IIb,III}`, `--live-fetch` (attempt a live regulation fetch instead of the bundled local reference).

There is no automated test suite yet. `python main.py --mock --auto-demo` is
the closest thing to a smoke test. The default scripted client responses
(`review._DEMO_CLIENT_FEEDBACK`) approve on round 3, so the accept branch is
what a default run exercises; to exercise the decline/escalation branch,
run with `--max-client-rounds 1` after editing `review._DEMO_CLIENT_FEEDBACK`
/ `_DEMO_FINAL_DECISION` to not approve (or drive it programmatically the
way an earlier verification pass did, importing `review` directly and
monkeypatching those two module-level lists before calling
`client_review_loop`).

## Architecture

**This is coded as a workflow, not an autonomous agent** (see `main.py`'s
docstring): every pipeline step is a fixed function call in `main.py`'s
`run()`, not an LLM deciding its own next move. That's a deliberate choice,
made because a CE-mark submission needs to be predictable and auditable,
not self-directed.

- **`llm.py` is the single choke point for every Claude call.** Every other
  module calls `llm.complete(system, user)` instead of importing
  `anthropic` directly, and it's the only file that imports `anthropic`
  (lazily, inside the function). `llm.set_mock(True)` swaps in a
  deterministic canned-response path, which is what lets the entire
  pipeline run with zero external dependencies and no API key.

- **`drafting.py`'s `SECTIONS` list is the architecture decision for step
  4.** EU MDR's Annex II/III technical documentation structure is fixed
  and known in advance, so drafting is implemented as *parallelization
  (sectioning)* -- one concurrent LLM call per section via
  `ThreadPoolExecutor` -- rather than an orchestrator-worker pattern, which
  would imply the subtask breakdown is discovered at runtime. It isn't.

- **`review.py` implements the same evaluator-optimizer pattern twice,
  with a human as the evaluator both times:** `internal_expert_review()`
  (one QA pass, capped by `params.max_internal_qa_rounds` as a safety
  limit) and `client_review_loop()` (up to `params.max_client_rounds`,
  default 5). Both share `apply_feedback_to_all()`, which redrafts every
  section in parallel against the same round of feedback rather than
  re-running the whole drafting step.

- **`judge.py` is an automated LLM-as-Judge compliance gate** that runs
  between drafting and the first Word export, before any human sees the
  draft. Its prompt forces a strict `VERDICT: PASS/FAIL` + `NOTES: ...`
  format specifically so `main.py` can parse it programmatically and
  redraft only the flagged section(s) via `drafting.redraft_section()`,
  instead of needing another LLM call just to interpret free-text
  feedback.

- **`regulation.py`'s `fetch_regulation()`** only attempts a live fetch if
  `allow_live_fetch=True`; by default it reads `data/mdr_reference.md`, a
  condensed but factually accurate summary of EU MDR Annexes I/II/III/XIV
  and relevant MDCG guidance (2020-5, 2020-6) -- not a placeholder, but not
  the full legal text either. To extend this to another regulation (FDA,
  PMDA, etc.), add an entry to `_SOURCES` in `regulation.py`, a
  corresponding local reference file under `data/`, and a new `SECTIONS`
  list in `drafting.py`, since each regulator's technical documentation
  structure is different.

- **`main.py`'s `run()`** strings all of the above together and writes
  three successive `.docx` snapshots to `output/`
  (`01_draft_pre_expert`, `02_expert_validated`, and either
  `03_FINAL_shipped` or `03_pending_escalation`), plus one
  `document_library.json` audit-trail entry per run. A decline after the
  client-round cap routes to `review.schedule_meeting()` rather than
  ending the run with nothing produced.

## Known gaps / conscious simplifications

- No automated test suite (pytest etc.) -- verification so far has been
  manual runs in `--mock` mode plus a one-off scripted run of the decline
  branch.
- `regulation.py`'s live-fetch path returns raw HTML with no
  parsing/cleanup; it's a starting point, not production-ready retrieval.
  The real retrieval design (a vector store over the full regulation +
  MDCG guidance) is described in `README.md` but not implemented.
- `review.py`'s human-in-the-loop is terminal `input()` (or scripted demo
  strings) -- there's no email/Slack/webhook integration yet; that's the
  natural place to add one.
