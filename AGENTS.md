# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## What this is

A runnable implementation of an agentic EU MDR CE-mark drafting workflow for
APProved (a medical writing platform): client uploads device data -> a
consent gate, a scope gate, and a data-quality gate screen the request ->
agent fetches EU MDR (live from eumdr.com by default, combined with a local
reference) -> agent drafts the CE-mark technical documentation in parallel
per section -> an automated compliance gate -> one internal regulatory-
expert review pass -> up to 5 rounds of client review -> final
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

Run with real Codex calls but still-scripted expert/client responses (needs `ANTHROPIC_API_KEY`):
```
python main.py --auto-demo
```

Run the real thing -- real API calls, you answer the expert/client prompts interactively:
```
python main.py
```

Other flags: `--client-data <path>` (defaults to `data/sample_device_data.json`), `--max-client-rounds N` (default 5), `--device-class {I,IIa,IIb,III}`, `--offline` (skip the live eumdr.com fetch and use the bundled local reference only -- live fetch is the default since fix 1; `--mock` always skips it too, regardless of `--offline`).

To exercise the three intake gates' reject paths specifically, point
`--client-data` at `data/test_no_consent.json` (consent gate rejects),
`data/sample_pharma_out_of_scope.json` (scope gate rejects),
`data/sample_poor_quality_data.json` (data-quality gate rejects, missing
required field), `data/sample_malformed_upload.json` (data-quality gate
rejects, invalid JSON), or `data/test_cgm_pivotal_trial_incomplete.json`
(data-quality gate rejects, >15% missing pivotal-trial patient data) --
each run should print a respectful decline and exit before step 3, without
producing any `.docx` output (and, for the consent case specifically,
without writing to `document_library.json` either).

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

- **`llm.py` is the single choke point for every Codex call.** Every other
  module calls `llm.complete(system, user)` instead of importing
  `anthropic` directly, and it's the only file that imports `anthropic`
  (lazily, inside the function). `llm.set_mock(True)` swaps in a
  deterministic canned-response path, which is what lets the entire
  pipeline run with zero external dependencies and no API key. Bug fix:
  `complete()` used to have zero handling for a real API call failing --
  since drafting and every redraft fire up to 6 of these concurrently via
  `ThreadPoolExecutor`, one rate-limited or transient failure took the
  whole run down with a raw SDK exception. The `anthropic` client already
  retries transient errors internally (`max_retries=2` by default, bumped
  to 5 here for the added concurrent load); the fix doesn't duplicate that
  retry logic, it wraps `client.messages.create()` so that if a failure
  still gets through, it's re-raised as one clear `RuntimeError` instead
  of a cryptic exception several stack frames removed from anything
  useful.

- **`consent_gate.py`, `scope_gate.py`, and `data_quality_gate.py` are
  intake gates that run before anything else**, in that order, and all
  three can end the run early with a respectful decline. `consent_gate.py`
  (fix 2) runs first and checks for a top-level `"consent_to_audit_trail":
  true` field in the upload; if it's missing or false, the run ends
  without calling `_log_rejection()` at all -- there is deliberately no
  audit-trail record of a request whose owner didn't consent to being
  recorded. Bug fix: this check used to be a bare `bool(value)`, which
  treats the JSON *string* `"false"` as consent given -- `bool("false")`
  is `True` in Python, since any non-empty string is truthy. `_is_affirmative()`
  now only accepts an actual boolean `true` or a short list of unambiguous
  affirmative strings (`"true"`, `"yes"`, `"y"`, `"1"`); everything else,
  including `"false"`, is correctly treated as consent withheld. If the
  upload didn't parse, this gate passes the request
  through rather than guessing, so `data_quality_gate.py` reports the real,
  specific problem instead. `scope_gate.py` (iteration 1) runs second: an
  LLM-as-judge call, same pattern as `judge.py`, that rejects
  pharmaceuticals and anything else that isn't an EU MDR medical device; it
  runs on a lenient, best-effort parse of the upload so a malformed file
  can still be scope-checked (falling back to classifying the raw text --
  see `scope_gate._build_prompt_input`). `data_quality_gate.py`
  (iteration 2, revised by fix 3) runs last and is plain Python, not a
  model call: it re-parses strictly, rejects if the upload isn't valid
  JSON, rejects if any of `REQUIRED_FIELDS` is missing/empty (binary, no
  percentage), and separately rejects if more than
  `MAX_CLINICAL_MISSING_RATIO` (15%) of the individual data points across
  `clinical_trial_data.patients` are missing -- the Phase III / pivotal
  trial's patient-level data, not the six narrative intake fields, which
  is what "15% missing data" was originally (incorrectly) checked against.
  `llm.py`'s mock path (`_mock_scope_verdict`) keyword-matches the prompt
  text so `--mock` can still exercise the scope gate's accept/reject
  branches offline; the `data/sample_*` and `data/test_*` fixtures beyond
  the default one exist to exercise each gate's reject path (see
  README.md's "Intake gates" section).

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
  re-running the whole drafting step. Both also call
  `_resolve_classification_discrepancy()` on every round of feedback
  before applying it: an evaluation scenario found that a human saying
  "this should be Class I, not Class IIb" had no effect at all, because
  `params.device_class` is set once at the start of a run and nothing in
  this file ever read it back out of the conversation -- the review loop
  printed "Validated" while quietly keeping the original class. That
  private helper is now a thin wrapper: `classification_check.find_mentioned_class()`
  scans the feedback text for an explicit class mention (`Class IIb` or
  the informal `Class 2b` -- a bug fix added the numeral form, which used
  to be invisible to the regex), and if it disagrees with
  `params.device_class`, hands off to `classification_check.resolve_discrepancy()`
  -- the shared RECLASSIFY/KEEP flow (moved there so `classification_gate.py`,
  below, can trigger the identical flow from a different source rather
  than duplicating it). `RECLASSIFY` mutates `params.device_class` in
  place (`SubmissionParams` is a plain, unfrozen dataclass, so this is a
  safe, ordinary attribute assignment), reflected in every doc export and
  the audit trail from that point on; `KEEP` leaves it untouched. Neither
  is inferred automatically. `classification_check.DEMO_CLASSIFICATION_DECISION`
  (default `"KEEP"`) is the scripted answer for `--auto-demo` runs, chosen
  conservative on purpose -- an unattended run should never silently
  reclassify a device.

- **`classification_gate.py` is the proactive half of that same fix,**
  added after a bug hunt re-tested the original evaluation case (an
  implantable, life-sustaining device declared Class IIb, where the
  scripted expert and client never happen to mention a class number) and
  found it still shipped completely unquestioned -- the discrepancy check
  above only fires if a human's feedback *text* mentions a class, so
  "nobody happened to raise it" was still wide open. `check_plausibility()`
  runs once, in `main.py`, right after `params` is built and before the
  regulation fetch: an LLM-as-judge call (same pattern as `scope_gate.py`)
  sanity-checks the declared class against the device's own description,
  deliberately as a *plausibility* check, not a re-derivation from Annex
  VIII first principles -- it's meant to catch a description that reads
  like a different risk class entirely, not to second-guess a defensible
  borderline call. `llm.py`'s mock path (`_mock_classification_verdict`)
  flags a QUESTIONABLE verdict on implantable/life-sustaining language,
  which is honestly imprecise -- it also flags `data/sample_device_data.json`'s
  "active implantable-**adjacent**" phrasing as a false positive, since a
  keyword substring match can't read "adjacent" the way a live model
  would. The design is safe under that imprecision regardless: a false
  positive costs one extra RECLASSIFY/KEEP confirmation, defaulting to
  keeping the original class, never a wrong autonomous action. A
  QUESTIONABLE verdict routes into `classification_check.resolve_discrepancy()`,
  same as a mid-review mention.

- **`judge.py` is an automated LLM-as-Judge compliance gate** that runs
  between drafting and the first Word export, before any human sees the
  draft. Its prompt forces a strict `VERDICT: PASS/FAIL` + `NOTES: ...`
  format specifically so `main.py` can parse it programmatically and
  redraft only the flagged section(s) via `drafting.redraft_section()`,
  instead of needing another LLM call just to interpret free-text
  feedback. `run_compliance_gate()` is a bug fix too: it used to score
  sections one at a time, unlike `drafting.draft_all_sections()`'s
  `ThreadPoolExecutor` pattern -- now it uses the identical pattern, one
  concurrent call per section.

- **`regulation.py`'s `fetch_regulation()`** (fix 1) attempts a live fetch
  by default (`allow_live_fetch=True`), from `_SOURCES["EU_MDR"]` =
  `https://eumdr.com/`, an EU MDR updates/news site -- this replaced the
  old eur-lex source after a testing round wrongly assumed a continuous
  glucose monitor needed a different EU framework than MDR; the fix wasn't
  to add a regulation-routing gate for a problem that didn't exist, it was
  to make sure grounding is checked against the *current* rule rather than
  a fixed local snapshot. Because eumdr.com's homepage is a news portal
  and not the full regulation text, the live fetch is combined with, not
  swapped in for, `data/mdr_reference.md` (a condensed but factually
  accurate local summary of EU MDR Annexes I/II/III/XIV and MDCG guidance
  2020-5/2020-6) -- see `fetch_regulation()`'s returned string, which is
  the local text followed by a "LATEST EU MDR UPDATES" section. `_html_to_text()`
  is a small dependency-free `HTMLParser` subclass that strips
  script/style/nav/header/footer content, since raw HTML is poor grounding
  text. `allow_live_fetch=False` (`--offline`, or always under `--mock`,
  since mock mode's whole point is zero network dependency) skips this and
  returns the local reference alone. To extend this to another regulation
  (FDA, PMDA, etc.), add an entry to `_SOURCES` in `regulation.py`, a
  corresponding local reference file under `data/`, and a new `SECTIONS`
  list in `drafting.py`, since each regulator's technical documentation
  structure is different.

- **`main.py`'s `run()`** strings all of the above together and writes
  three successive `.docx` snapshots to `output/`
  (`01_draft_pre_expert`, `02_expert_validated`, and either
  `03_FINAL_shipped` or `03_pending_escalation`), plus one
  `document_library.json` index entry per run. A decline after the
  client-round cap routes to `review.schedule_meeting()` rather than
  ending the run with nothing produced.

- **`audit_trail.py`'s `AuditTrail`** is the actual detailed audit trail --
  `document_library.json` is deliberately just a one-line-per-run index
  into it, not the trail itself (that gap is exactly what the docx's
  Definition of Good called "traceable after the fact" and the codebase
  didn't yet satisfy). `main.py` constructs one right after consent is
  confirmed (never before -- same "no consent, no record" principle as
  `_log_rejection()`) and threads it through as an optional `audit=`
  keyword into `review.internal_expert_review()`,
  `review.client_review_loop()`, and
  `review._resolve_classification_discrepancy()`, all of which default
  it to `None` so the scenario-test scripts that call them directly
  (see the docx's Scenario 8 and 10 write-ups) don't have to construct
  one. Every gate verdict, upload, retrieval, draft, compliance check,
  round of feedback, redraft, classification override/decline, export,
  and final outcome is logged via `audit.log(actor, event_type, summary,
  **details)`. `AuditTrail.save()` writes both `<slug>_<timestamp>.audit.json`
  (full detail, including complete section text at every draft/redraft
  checkpoint -- never truncated) and the matching `.audit.txt` (a
  human-readable transcript that truncates any field over 500 chars,
  pointing back to the JSON for the full value) to `output/`, using
  microsecond-precision timestamps specifically because multiple test
  fixtures sharing a device name and running back-to-back within the
  same second was observed to collide and silently overwrite an earlier
  audit file under second-precision naming -- a real bug caught while
  building this, not a hypothetical one. `document_library.json` entries
  carry `audit_trail_json` / `audit_trail_txt` paths pointing to the
  matching pair.

## Known gaps / conscious simplifications

- No automated test suite (pytest etc.) -- verification so far has been
  manual runs in `--mock` mode plus a one-off scripted run of the decline
  branch.
- `regulation.py`'s live-fetch path (fix 1) does basic HTML-to-text
  cleanup now, but only fetches eumdr.com's homepage (a news/updates
  portal); it doesn't crawl through to the specific Annex/Article pages
  that homepage links to. It's a real improvement over a static local
  file, not production-ready retrieval. The real retrieval design (a
  vector store over the full regulation + MDCG guidance) is described in
  `README.md` but not implemented.
- `review.py`'s human-in-the-loop is terminal `input()` (or scripted demo
  strings) -- there's no email/Slack/webhook integration yet; that's the
  natural place to add one.
- `scope_gate.py`'s reject decision is a single automated LLM-as-judge
  call with no human review before the decline is sent -- fine for a demo,
  but a real deployment would likely want an appeals path (or at least a
  human spot-check of declines) rather than a fully automated no.
- `data_quality_gate.py`'s clinical-data-completeness check (fix 3) only
  looks at `clinical_trial_data.patients` if that key exists; an upload
  relying on literature/equivalence data instead of a de novo pivotal
  trial (a legitimate MDR route under MDCG 2020-5) has no such patient
  array and is currently treated as 100% missing, which would incorrectly
  reject a legitimate equivalence-based submission. Not exercised by any
  of the bundled fixtures; worth fixing before this rule is relied on for
  anything beyond a pivotal-trial-backed submission.
- `_log_rejection()`'s `document_library.json` entry still has a `null`
  device field for scope/quality rejections, even when the upload parsed
  enough to know the device's name -- though this is now a smaller gap
  than it was: the linked `audit_trail_json`/`audit_trail_txt` files for
  that same rejection do carry the correct device name (`main.py` reads
  it from `loose_data` before either gate runs), so the information isn't
  lost, just not surfaced in the lightweight index row itself.
- `audit_trail.py` records complete section text at every draft/redraft
  checkpoint in the `.audit.json`, which is the right call for a genuine
  audit trail but means the JSON file grows with every review round on a
  submission with many rounds -- fine at this demo's scale, worth a
  retention/rotation policy before production.
- Regulation is still hardcoded to `"EU_MDR"` in `main.py`'s `run()` --
  no CLI flag or data-driven way to select a different one, despite
  `regulation.py`'s `_SOURCES` dict and Phase 1's own narrative both
  implying it's client-selectable. Not touched by the bug-hunt round.
- A confirmed `RECLASSIFY` updates `params.device_class` (and therefore
  every document header and the audit trail from that point on), but has
  no mechanism to also correct classification language already baked into
  the client's own uploaded `device_description` -- that field flows
  unchanged into every drafting and redrafting prompt (neither of which
  is even passed `params.device_class` -- see `drafting.py`'s prompt
  construction). A live run could plausibly end up with a header saying
  "Class I" over body text still written from Class-IIb-flavored source
  material.
- Neither `scope_gate.py`'s resistance to a disguised out-of-scope request
  nor `judge.py`'s resistance to an embedded prompt-injection instruction
  has been tested against a live model -- only against the offline mock
  stand-ins, which are keyword-based and already known to be foolable
  (see the docx's Scenario 7 and 9 write-ups). The bug-hunt round fixed
  concrete, verifiable defects; it didn't attempt to harden or re-test
  either gate's real judgment quality, which needs an actual
  `ANTHROPIC_API_KEY` run to evaluate honestly.
