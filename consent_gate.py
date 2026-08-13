"""
Fix 2: an audit-trail consent gate. APProved keeps an audit trail of every
submission (device, outcome, document path, any rejection) in
document_library.json -- see main.py's _log_to_document_library() and
_log_rejection(). That is only allowed to happen with the client's consent,
given at upload time via a `consent_to_audit_trail: true` field alongside
the device data.

This runs before the scope gate (scope_gate.py) and the data-quality gate
(data_quality_gate.py): if we're not allowed to keep a record of this
request at all, there's no point checking anything else about it. If the
upload didn't parse, this gate does not guess -- it passes the request
through so the data-quality gate can report the real, specific problem
(invalid JSON) instead of a misleading "no consent" message.
"""

from __future__ import annotations

from dataclasses import dataclass

CONSENT_KEY = "consent_to_audit_trail"
_TRUE_STRINGS = {"true", "yes", "y", "1"}


@dataclass
class ConsentResult:
    consented: bool
    reason: str = ""


def _is_affirmative(value) -> bool:
    """Bug fix: `bool(value)` treated the JSON *string* "false" as consent
    given, because any non-empty Python string is truthy -- `bool("false")`
    is `True`. That inverted the exact protection this gate exists for, for
    the extremely plausible mistake of writing "false" instead of the JSON
    boolean `false`. Only an actual boolean `true`, or one of a small set of
    unambiguous affirmative strings, counts as consent; everything else
    (including "false", "no", numbers, null, or a missing key) does not."""
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.strip().lower() in _TRUE_STRINGS
    return False


def check_consent(loose_data: dict, parsable: bool) -> ConsentResult:
    if not parsable:
        # Can't confirm or deny consent from an upload that didn't parse --
        # that's the data-quality gate's problem to report specifically.
        return ConsentResult(consented=True)

    if not _is_affirmative(loose_data.get(CONSENT_KEY, False)):
        return ConsentResult(
            consented=False,
            reason=(
                "APProved keeps an audit-trail record of every submission "
                "(what was uploaded and the outcome) for compliance "
                "purposes, and we need your consent before we can do that. "
                "Please resend the upload with "
                f"'{CONSENT_KEY}': true."
            ),
        )

    return ConsentResult(consented=True)
