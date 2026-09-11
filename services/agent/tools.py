from __future__ import annotations

from strands import tool

from policy import (
    RemedyRun,
    deterministic_plan,
    idempotency_key,
    provider_confirmation_is_valid,
)


@tool
def inspect_remedy_contract(contract: dict) -> dict:
    """Validate an immutable CPSC Remedy Contract before taking any action."""
    run = RemedyRun.model_validate({"contract": contract})
    return {
        "verified": True,
        "contract_id": run.contract.id,
        "authority": run.contract.authority,
        "match": run.contract.matchStatus,
        "scope": run.contract.agentAuthority,
    }


@tool
def prepare_sandbox_claim(contract: dict) -> dict:
    """Prepare, but never externally send, a refund request in the controlled sandbox."""
    run = RemedyRun.model_validate({"contract": contract})
    return {
        "prepared": True,
        "environment": "MANUFACTURER_SANDBOX",
        "contract_id": run.contract.id,
        "fields": ["recall_number", "product_model", "contact", "evidence"],
    }


@tool
def request_physical_evidence(contract: dict) -> dict:
    """Return the official physical evidence requirement for a human; do not perform it."""
    run = RemedyRun.model_validate({"contract": contract})
    return {
        "state": "NEEDS_HUMAN",
        "instruction": run.contract.officialAction,
        "warning": "Keep the product unplugged. Demo evidence must be synthetic.",
    }


@tool
def submit_sandbox_claim(contract: dict, evidence_filename: str) -> dict:
    """Submit an idempotent request only to RecallZero's controlled manufacturer sandbox."""
    run = RemedyRun.model_validate(
        {"contract": contract, "evidence_filename": evidence_filename}
    )
    result = deterministic_plan(run)
    return {
        "accepted": True,
        "environment": "MANUFACTURER_SANDBOX",
        "receipt": f"RZ-{idempotency_key(run.contract.id, 'submit')[:10].upper()}",
        "state": result["state"],
    }


@tool
def check_sandbox_outcome(contract: dict, provider_confirmation: str | None = None) -> dict:
    """Check the controlled provider outcome; never trust an arbitrary completion string."""
    run = RemedyRun.model_validate(
        {"contract": contract, "provider_confirmation": provider_confirmation}
    )
    verified = provider_confirmation_is_valid(
        run.contract.id, run.provider_confirmation
    )
    return {
        "state": "REMEDIATED" if verified else "AWAITING_PROVIDER",
        "verified": verified,
        "provider_confirmation": run.provider_confirmation if verified else None,
    }
