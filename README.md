# APProved

Agentic EU MDR CE-mark drafting workflow — a project that evolves as a
series of prototypes, each on its own branch (and tagged where it marks a
submitted/frozen version), rather than as a single linear history on `main`.

## Prototypes

| Branch | Tag | What it is |
|---|---|---|
| [`prototype-1-ucla-version`](../../tree/prototype-1-ucla-version) | [`v1.0`](../../releases/tag/v1.0) | Built for the UCLA Anderson EMBA "Agentic AI for Managers" course. Client upload → consent/scope/data-quality/classification gates → live-fetched EU MDR grounding → parallel section drafting → automated compliance check → internal expert review → up to 5 rounds of client review → ship or escalate. Full audit trail. |

Future prototypes (new regulations, real retrieval, a production
human-in-the-loop channel, etc.) get their own branch off of whichever
prior prototype they build on, so each one stays a clean, independently
checkout-able snapshot rather than a moving target on `main`.
