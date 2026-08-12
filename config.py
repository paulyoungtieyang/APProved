"""
Configuration objects for the APProved agentic medical-writing workflow.

This is intentionally a plain dataclass rather than a database row or a web
form model: the point of this codebase is to show the *workflow logic*
clearly. Wiring it up to a real upload form / database is a thin layer on
top of this.
"""

from dataclasses import dataclass, field
from typing import Optional


@dataclass
class SubmissionParams:
    """Parameters the client selects in step 2 of the workflow
    ("Client selects a set of parameters such as regulation")."""

    regulation: str = "EU_MDR"                 # which regulatory framework to target
    device_class: str = "IIb"                  # EU MDR risk class (I, IIa, IIb, III)
    target_market: str = "European Union"
    language: str = "English"
    brand_template: Optional[str] = None        # path to a .docx template, optional
    max_client_rounds: int = 5                  # hard cap requested in the workflow spec
    max_internal_qa_rounds: int = 3              # safety cap on the expert loop (not open-ended)


@dataclass
class ClientData:
    """Whatever the client uploads in step 1. In production this would be
    parsed from CSV/XLSX/PDF/DOCX; here it's a plain dict loaded from JSON
    so the workflow logic is easy to follow and test."""

    device_name: str
    intended_purpose: str
    device_description: str
    clinical_data_summary: str
    risk_summary: str
    manufacturer: str
    raw: dict = field(default_factory=dict)

    @classmethod
    def from_dict(cls, d: dict) -> "ClientData":
        return cls(
            device_name=d.get("device_name", "Unnamed device"),
            intended_purpose=d.get("intended_purpose", ""),
            device_description=d.get("device_description", ""),
            clinical_data_summary=d.get("clinical_data_summary", ""),
            risk_summary=d.get("risk_summary", ""),
            manufacturer=d.get("manufacturer", "Unknown manufacturer"),
            raw=d,
        )
