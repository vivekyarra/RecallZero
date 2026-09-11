import pytest
from pydantic import ValidationError

from policy import RemedyRun, deterministic_plan, idempotency_key


def contract(**changes):
    value = {
        "id": "rc-26754-asset-xr8801-demo",
        "authority": "US CPSC",
        "recallNumber": "26754",
        "recallUrl": "https://www.cpsc.gov/Recalls/2026/example",
        "hazard": "Electrocution, shock, and burn",
        "officialAction": "Unplug and stop use; provide destruction evidence.",
        "remedy": "FULL_REFUND",
        "provider": "Guang Zhou",
        "requiredEvidence": ["Photo of disabled product"],
        "completionCondition": "Evidence and provider approval",
        "agentAuthority": "SANDBOX_ROUTINE_REMEDY_ONLY",
        "matchStatus": "EXACT_MATCH",
    }
    value.update(changes)
    return value


def test_rejects_non_exact_contract():
    with pytest.raises(ValidationError):
        RemedyRun.model_validate({"contract": contract(matchStatus="POSSIBLE_MATCH")})


def test_rejects_non_cpsc_authority_url():
    with pytest.raises(ValidationError):
        RemedyRun.model_validate({"contract": contract(recallUrl="https://example.com/fake")})


def test_stops_for_physical_evidence():
    result = deterministic_plan(RemedyRun.model_validate({"contract": contract()}))
    assert result["state"] == "NEEDS_HUMAN"
    assert result["steps"][-1]["tool"] == "request_physical_evidence"


def test_submission_is_not_completion():
    run = RemedyRun.model_validate(
        {"contract": contract(), "evidence_filename": "synthetic.jpg"}
    )
    assert deterministic_plan(run)["state"] == "AWAITING_PROVIDER"


def test_completion_requires_provider_confirmation():
    run = RemedyRun.model_validate(
        {
            "contract": contract(),
            "evidence_filename": "synthetic.jpg",
            "provider_confirmation": "SANDBOX-APPROVED-26754",
        }
    )
    assert deterministic_plan(run)["state"] == "REMEDIATED"


def test_idempotency_key_is_stable():
    assert idempotency_key("contract", "submit") == idempotency_key("contract", "submit")

