"""
A structured, per-submission audit trail: every gate decision, every round
of human feedback, every redraft, every classification discrepancy and its
resolution, and the final outcome -- each timestamped and attributed to
whoever produced it (system, agent, client, or regulatory expert).

This is a separate, richer artifact from document_library.json, which
stays a lightweight one-line-per-run index for scanning across many
submissions. This is the detailed record behind any one line in that
index -- the "traceable after the fact" half of the Definition of Good
(see the docx's Phase 3), which a one-line summary never actually
satisfied on its own.

Two output formats, generated from the same underlying event list, no
docx formatting involved:
  - <name>.audit.json -- full structured detail, machine-readable
  - <name>.audit.txt  -- a plain-language transcript, human-readable

Same consent principle as document_library.json (see consent_gate.py):
a run that never gets consent to be logged never gets a trail written
either. main.py only starts writing to one after consent is confirmed.
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from pathlib import Path

_MAX_TEXT_IN_TRANSCRIPT = 500  # chars; .txt truncates long fields, .json never does


def _slugify(text: str) -> str:
    slug = re.sub(r"[^a-zA-Z0-9]+", "_", text.strip().lower()).strip("_")
    return slug or "unknown_device"


@dataclass
class AuditEvent:
    timestamp: str
    actor: str          # "system" | "agent" | "client" | "regulatory_expert"
    event_type: str      # "gate_decision" | "upload" | "retrieval" | "draft" |
                          # "compliance_check" | "feedback" | "classification_discrepancy" |
                          # "override" | "redraft" | "milestone" | "export" | "decision" | "outcome"
    summary: str
    details: dict = field(default_factory=dict)


@dataclass
class AuditTrail:
    source_file: str
    device_name: str = "unknown device"
    events: list = field(default_factory=list)

    def log(self, actor: str, event_type: str, summary: str, **details) -> None:
        self.events.append(AuditEvent(
            timestamp=datetime.now(timezone.utc).isoformat(timespec="seconds"),
            actor=actor,
            event_type=event_type,
            summary=summary,
            details=details,
        ))

    def set_device_name(self, name: str) -> None:
        self.device_name = name

    def to_json(self) -> str:
        payload = {
            "source_file": self.source_file,
            "device_name": self.device_name,
            "event_count": len(self.events),
            "events": [asdict(e) for e in self.events],
        }
        return json.dumps(payload, indent=2, default=str)

    def to_text(self) -> str:
        lines = [
            f"AUDIT TRAIL -- {self.device_name}",
            f"Source file: {self.source_file}",
            f"{len(self.events)} event(s) recorded",
            "=" * 72,
            "",
        ]
        for e in self.events:
            lines.append(f"[{e.timestamp}] {e.actor.upper()} -- {e.event_type}")
            lines.append(f"    {e.summary}")
            for key, value in e.details.items():
                text = str(value)
                if len(text) > _MAX_TEXT_IN_TRANSCRIPT:
                    text = text[:_MAX_TEXT_IN_TRANSCRIPT] + " ... [truncated, see the .json file for the full value]"
                lines.append(f"    - {key}: {text}")
            lines.append("")
        return "\n".join(lines)

    def save(self, out_dir: Path) -> tuple[Path, Path]:
        out_dir.mkdir(exist_ok=True)
        # Microsecond precision -- two runs of the same device name within
        # the same second (common when scripting several test fixtures
        # back to back) must never collide and silently overwrite each
        # other's record. That would defeat the point of an audit trail.
        stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S%fZ")
        base = f"audit_{_slugify(self.device_name)}_{stamp}"
        json_path = out_dir / f"{base}.audit.json"
        txt_path = out_dir / f"{base}.audit.txt"
        json_path.write_text(self.to_json(), encoding="utf-8")
        txt_path.write_text(self.to_text(), encoding="utf-8")
        return json_path, txt_path
