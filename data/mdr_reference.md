# EU MDR (Regulation (EU) 2017/745) — condensed reference

This is a condensed, locally-cached reference used as the fallback (and
default) source for `regulation.fetch_regulation()`. It exists so the demo
runs deterministically without depending on being able to scrape EUR-Lex or
the EC's MDCG guidance pages at run time. In production this would be
replaced by a proper retrieval store (e.g. a vector index over the full
regulation text, Annex by Annex, plus every MDCG guidance document),
matching the "MDR/MDCG store (RAG)" tool in the system diagram.

## Annex I — General Safety and Performance Requirements (GSPR)
Every device must be designed and manufactured to meet the GSPRs: safety
for the patient/user/third parties, performance consistent with intended
purpose, risk-benefit favorable, risks reduced as far as possible via a
risk management system (aligned with ISO 14971), plus requirements on
chemical/physical/biological properties, infection and microbial
contamination, construction and environment, devices with a
measuring/diagnostic function, and labeling/instructions for use (GSPR 23).
A **GSPR checklist** mapping each requirement to the specific evidence in
the technical documentation is mandatory.

## Annex II — Technical Documentation
Required contents include: device description and specification (incl.
variants/accessories), information on design and manufacturing, GSPR
checklist with references to applied standards, benefit-risk analysis and
risk management, product verification and validation data (incl.
pre-clinical and clinical data), and any additional information required
(sterile devices, devices with a measuring function, etc.).

## Annex III — Technical Documentation on Post-Market Surveillance
A PMS plan and, where applicable, a Post-Market Surveillance Report / a
Periodic Safety Update Report, describing the process for collecting and
using data on the device's safety and performance throughout its lifetime.

## Annex XIV — Clinical Evaluation and Post-Market Clinical Follow-up
Clinical evaluation is a continuous process (Article 61) demonstrating
conformity with the relevant GSPRs under normal conditions of use. It
requires a clinical evaluation plan, identification of relevant clinical
data (from the device itself and/or equivalent devices), appraisal of that
data, analysis to generate clinical evidence, and a Clinical Evaluation
Report (CER) that is kept up to date throughout the device's lifecycle via
Post-Market Clinical Follow-up (PMCF).

## Key MDCG guidance referenced in drafting
- **MDCG 2020-5** — guidance on the concept of "equivalence" when a
  manufacturer relies on clinical data from an equivalent device rather
  than exclusively its own device.
- **MDCG 2020-6** — guidance on "sufficient clinical evidence" for legacy
  devices, relevant when transitioning older devices onto MDR.
- **MDCG 2019-9** — summary of safety and clinical performance (SSCP)
  requirements for implantable and Class III devices.

## CE-marking route (high level, for context in drafting)
1. Determine device classification (Annex VIII rules).
2. Identify the applicable conformity assessment procedure (Annex IX–XI).
3. Compile the technical documentation (Annexes II & III).
4. For higher-risk devices, undergo Notified Body assessment.
5. Draw up the EU Declaration of Conformity and affix the CE mark.
6. Register the device and economic operator in EUDAMED.

*This file is a condensed teaching/demo reference, not a substitute for the
full regulation text or legal advice. Swap `regulation.py`'s local-file path
for a real retrieval store before using this for an actual submission.*
