"""
Iteration 2 (data-quality gate), revised by fix 3.

Two independent checks, either of which can trigger a respectful
rejection before any drafting starts:

  1. Is the upload parsable, and are all required intake fields present?
     Binary -- a required field is either there or it isn't; there's no
     percentage involved.
  2. Is the underlying clinical evidence usable? Specifically: no more
     than 15% of the individual patient-level data points in the Phase
     III / pivotal clinical trial dataset (`clinical_trial_data.patients`
     in the upload) may be missing.

That second check is the "15% missing data" rule from the original spec.
It was first implemented against the six narrative intake fields below,
which was a misreading -- it's about the actual per-patient trial data,
not the presence of a summary paragraph. See the docx "Fixes" section for
the correction.

Both checks are plain Python, not model calls -- parsability, field
presence, and counting missing values are things a script can determine
deterministically.
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field

REQUIRED_FIELDS = (
    "device_name",
    "manufacturer",
    "intended_purpose",
    "device_description",
    "clinical_data_summary",
    "risk_summary",
)

CLINICAL_DATA_KEY = "clinical_trial_data"
CLINICAL_ID_FIELDS = {"patient_id"}
MAX_CLINICAL_MISSING_RATIO = 0.15


@dataclass
class QualityResult:
    passed: bool
    parsable: bool
    missing_fields: list = field(default_factory=list)
    clinical_missing_ratio: float = 0.0
    clinical_missing_cells: int = 0
    clinical_total_cells: int = 0
    reason: str = ""


def _is_missing(value) -> bool:
    return value is None or (isinstance(value, str) and not value.strip())


def parse_client_data(raw_text: str):
    """Returns (parsed_dict, error_message) -- exactly one of the two is None."""
    try:
        data = json.loads(raw_text)
    except json.JSONDecodeError as e:
        return None, f"the file is not valid JSON ({e.msg} at line {e.lineno})"
    if not isinstance(data, dict):
        return None, "the file must contain a single JSON object of device fields"
    return data, None


def _clinical_missing_ratio(data: dict):
    """Fraction of missing data points across the Phase III / pivotal
    trial's patient-level records. The patient identifier column doesn't
    count as data -- only the actual trial variables (endpoint values,
    adverse events, follow-up completion, etc.) do. Returns
    (ratio, missing_cells, total_cells); an absent or empty patient
    dataset counts as fully missing (ratio 1.0), since there's no
    clinical evidence to evaluate at all."""
    clinical = data.get(CLINICAL_DATA_KEY)
    patients = clinical.get("patients", []) if isinstance(clinical, dict) else []

    total_cells = 0
    missing_cells = 0
    for patient in patients:
        if not isinstance(patient, dict):
            continue
        for key, value in patient.items():
            if key in CLINICAL_ID_FIELDS:
                continue
            total_cells += 1
            if _is_missing(value):
                missing_cells += 1

    ratio = (missing_cells / total_cells) if total_cells else 1.0
    return ratio, missing_cells, total_cells


def check_quality(raw_text: str) -> QualityResult:
    data, parse_error = parse_client_data(raw_text)
    if parse_error:
        return QualityResult(
            passed=False,
            parsable=False,
            missing_fields=list(REQUIRED_FIELDS),
            reason=f"we couldn't read the uploaded file -- {parse_error}.",
        )

    missing = [f for f in REQUIRED_FIELDS if _is_missing(data.get(f))]
    if missing:
        return QualityResult(
            passed=False,
            parsable=True,
            missing_fields=missing,
            reason=(
                f"the following required field(s) are missing or empty: "
                f"{', '.join(missing)}."
            ),
        )

    ratio, missing_cells, total_cells = _clinical_missing_ratio(data)
    if ratio > MAX_CLINICAL_MISSING_RATIO:
        return QualityResult(
            passed=False,
            parsable=True,
            clinical_missing_ratio=ratio,
            clinical_missing_cells=missing_cells,
            clinical_total_cells=total_cells,
            reason=(
                f"{missing_cells} of {total_cells} data points ({ratio:.0%}) "
                f"in the Phase III / pivotal trial patient data are "
                f"missing -- above the 15% threshold for usable clinical "
                f"evidence."
            ),
        )

    return QualityResult(
        passed=True,
        parsable=True,
        clinical_missing_ratio=ratio,
        clinical_missing_cells=missing_cells,
        clinical_total_cells=total_cells,
    )
