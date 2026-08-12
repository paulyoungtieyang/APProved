# APProved — agentic EU MDR CE-mark drafting workflow

A runnable implementation of the workflow discussed throughout this
project: client uploads device data → agent fetches EU MDR → agent drafts
the CE-mark technical documentation → an automated compliance check →
one internal regulatory-expert review pass → up to 5 rounds of client
review → final accept/decline, with a decline routing to a scheduled
meeting instead of a dead end.

It is coded as a **workflow**, not an autonomous agent: every step is a
fixed function call in `main.py`, not an LLM deciding its own next move.
That's a deliberate choice — see `main.py`'s docstring and the
`recommended_agentic_pattern` diagram from earlier in this project for why.

## Project layout

| File | Workflow step(s) | Pattern |
|---|---|---|
| `config.py` | 1-2 (client data + parameters) | — |
| `regulation.py` | 3 (fetch the regulation) | augmented LLM / retrieval |
| `drafting.py` | 4 (draft the submission) | parallelization (sectioning) |
| `judge.py` | automated gate before the human sees it | LLM-as-Judge |
| `docx_export.py` | 5 (export to Word) | — |
| `review.py` | 6-14 (expert loop, client loop, escalation) | evaluator-optimizer, human-in-the-loop |
| `llm.py` | every LLM call goes through here | — |
| `main.py` | orchestrates all of the above | prompt chaining + routing |

## Setup

```bash
pip install -r requirements.txt
export ANTHROPIC_API_KEY=sk-...   # skip this if you're using --mock
```

## Running it

**Fully offline, no API key, no typing required** — good for a first run
or a CI check:

```bash
python main.py --mock --auto-demo
```

**Real Claude calls, scripted expert/client responses** (needs an API key,
no need to sit at the keyboard for the review rounds):

```bash
python main.py --auto-demo
```

**The real thing** — real API calls, and you play both the regulatory
expert and the client at the review prompts:

```bash
python main.py
```

Other flags:

```bash
python main.py --client-data path/to/your_device.json   # your own device data
python main.py --max-client-rounds 3                     # override the 5-round cap
python main.py --device-class III                        # EU MDR risk class
python main.py --live-fetch                               # attempt a live regulation fetch
                                                            # (falls back to the local reference on failure)
```

## What it produces

Everything lands in `output/`:

- `01_draft_pre_expert.docx` — first full draft, after the AI drafting + compliance gate
- `02_expert_validated.docx` — after the internal regulatory-expert review pass
- `03_FINAL_shipped.docx` — if the client accepts
- `03_pending_escalation.docx` — if the client declines after 5 rounds
- `document_library.json` — one audit-trail entry per run (device, outcome, document path, any escalation request)

## Extending this beyond a demo

- **Regulation retrieval**: `regulation.py`'s local reference file
  (`data/mdr_reference.md`) is a condensed, accurate summary of EU MDR
  Annexes I/II/III/XIV — not a placeholder, but not the full legal text
  either. Swap it for a real vector store over the full regulation + MDCG
  guidance before using this for an actual submission.
- **Human-in-the-loop**: `review.py`'s `input()` calls are where you'd wire
  in email/Slack notifications and a real approval UI instead of a
  terminal prompt.
- **Other regulations**: add an entry to `_SOURCES` in `regulation.py` and
  a new `SECTIONS` list in `drafting.py` (e.g. FDA 510(k) has a different
  fixed structure than MDR Annex II/III) to extend beyond EU MDR.
