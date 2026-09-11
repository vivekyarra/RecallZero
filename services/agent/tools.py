from __future__ import annotations

from typing import Any

from strands import tool
from strands.types.tools import ToolResult

from policy import (
    RemedyRun,
    deterministic_plan,
    idempotency_key,
    provider_confirmation_is_valid,
)


def _success(payload: dict[str, Any]) -> ToolResult:
    """Return native structured content instead of Strands' default text coercion."""
    return {"status": "success", "content": [{"json": payload}]}


@tool
def inspect_remedy_contract(contract: dict) -> ToolResult:
    """Validate an immutable CPSC Remedy Contract before taking any action."""
    run = RemedyRun.model_validate({"contract": contract})
    return _success(
        {
            "verified": True,
            "contract_id": run.contract.id,
            "authority": run.contract.authority,
            "match": run.contract.matchStatus,
            "scope": run.contract.agentAuthority,
        }
    )


@tool
def prepare_sandbox_claim(contract: dict) -> ToolResult:
    """Prepare, but never externally send, a refund request in the controlled sandbox."""
    run = RemedyRun.model_validate({"contract": contract})
    return _success(
        {
            "prepared": True,
            "environment": "MANUFACTURER_SANDBOX",
            "contract_id": run.contract.id,
            "fields": ["recall_number", "product_model", "contact", "evidence"],
        }
    )


@tool
def request_physical_evidence(contract: dict) -> ToolResult:
    """Return the official physical evidence requirement for a human; do not perform it."""
    run = RemedyRun.model_validate({"contract": contract})
    return _success(
        {
            "state": "NEEDS_HUMAN",
            "instruction": run.contract.officialAction,
            "warning": "Keep the product unplugged. Demo evidence must be synthetic.",
        }
    )


@tool
def submit_sandbox_claim(contract: dict, evidence_filename: str) -> ToolResult:
    """Submit an idempotent request only to RecallZero's controlled manufacturer sandbox."""
    run = RemedyRun.model_validate(
        {"contract": contract, "evidence_filename": evidence_filename}
    )
    result = deterministic_plan(run)
    return _success(
        {
            "accepted": True,
            "environment": "MANUFACTURER_SANDBOX",
            "receipt": f"RZ-{idempotency_key(run.contract.id, 'submit')[:10].upper()}",
            "state": result["state"],
        }
    )


@tool
def check_sandbox_outcome(
    contract: dict, provider_confirmation: str | None = None
) -> ToolResult:
    """Check the controlled provider outcome; never trust an arbitrary completion string."""
    run = RemedyRun.model_validate(
        {"contract": contract, "provider_confirmation": provider_confirmation}
    )
    verified = provider_confirmation_is_valid(
        run.contract.id, run.provider_confirmation
    )
    return _success(
        {
            "state": "REMEDIATED" if verified else "AWAITING_PROVIDER",
            "verified": verified,
            "provider_confirmation": run.provider_confirmation if verified else None,
        }
    )
