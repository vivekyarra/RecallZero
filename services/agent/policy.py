from __future__ import annotations

from hashlib import sha256
from hmac import compare_digest
from typing import Literal

from pydantic import BaseModel, Field


class RemedyContract(BaseModel):
    id: str = Field(min_length=1)
    authority: Literal["US CPSC"]
    recallNumber: str = Field(min_length=1)
    recallUrl: str = Field(pattern=r"^https://www\.cpsc\.gov/")
    hazard: str = Field(min_length=1)
    officialAction: str = Field(min_length=1)
    remedy: Literal["FULL_REFUND"]
    provider: Literal["Guang Zhou"]
    requiredEvidence: list[str] = Field(min_length=1)
    completionCondition: str = Field(min_length=1)
    agentAuthority: Literal["SANDBOX_ROUTINE_REMEDY_ONLY"]
    matchStatus: Literal["EXACT_MATCH"]


class RemedyRun(BaseModel):
    contract: RemedyContract
    evidence_filename: str | None = None
    provider_confirmation: str | None = None


def idempotency_key(contract_id: str, action: str) -> str:
    return sha256(f"{contract_id}:{action}:v1".encode()).hexdigest()[:24]


def sandbox_provider_confirmation(contract_id: str) -> str:
    """Return the deterministic demo-provider token bound to exactly one contract.

    This token is only a sandbox fixture, not a production signature. A production
    provider integration must verify a provider-controlled callback or signature.
    """
    digest = sha256(f"recallzero-sandbox:{contract_id}:approved:v1".encode()).hexdigest()[:24]
    return f"SBX-{digest.upper()}"


def provider_confirmation_is_valid(contract_id: str, confirmation: str | None) -> bool:
    if not confirmation:
        return False
    return compare_digest(confirmation, sandbox_provider_confirmation(contract_id))


def deterministic_plan(run: RemedyRun) -> dict:
    """Policy-owned plan used for tests and no-credential public demonstrations."""
    steps: list[dict] = [
        {"tool": "inspect_remedy_contract", "status": "complete"},
        {"tool": "prepare_sandbox_claim", "status": "complete"},
    ]
    if not run.evidence_filename:
        steps.append({"tool": "request_physical_evidence", "status": "blocked"})
        return {"state": "NEEDS_HUMAN", "steps": steps, "sandbox": True}
    steps.append({"tool": "request_physical_evidence", "status": "complete"})
    receipt = f"RZ-{idempotency_key(run.contract.id, 'submit')[:10].upper()}"
    steps.append({"tool": "submit_sandbox_claim", "status": "complete", "receipt": receipt})
    if not run.provider_confirmation:
        steps.append({"tool": "check_sandbox_outcome", "status": "waiting"})
        return {"state": "AWAITING_PROVIDER", "steps": steps, "sandbox": True}
    if not provider_confirmation_is_valid(run.contract.id, run.provider_confirmation):
        steps.append({"tool": "check_sandbox_outcome", "status": "rejected"})
        return {
            "state": "AWAITING_PROVIDER",
            "steps": steps,
            "sandbox": True,
            "warning": "Provider confirmation did not bind to this Remedy Contract.",
        }
    steps.append({"tool": "check_sandbox_outcome", "status": "complete"})
    return {"state": "REMEDIATED", "steps": steps, "sandbox": True}
