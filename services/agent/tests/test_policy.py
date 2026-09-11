import pytest
from pydantic import ValidationError

from policy import (
    RemedyRun,
    deterministic_plan,
    idempotency_key,
    provider_confirmation_is_valid,
    sandbox_provider_confirmation,
)


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


def test_completion_requires_contract_bound_provider_confirmation():
    contract_value = contract()
    confirmation = sandbox_provider_confirmation(contract_value["id"])
    run = RemedyRun.model_validate(
        {
            "contract": contract_value,
            "evidence_filename": "synthetic.jpg",
            "provider_confirmation": confirmation,
        }
    )
    assert deterministic_plan(run)["state"] == "REMEDIATED"
    assert provider_confirmation_is_valid(contract_value["id"], confirmation)


def test_rejects_forged_or_cross_contract_confirmation():
    contract_value = contract()
    forged = RemedyRun.model_validate(
        {
            "contract": contract_value,
            "evidence_filename": "synthetic.jpg",
            "provider_confirmation": "SANDBOX-APPROVED-26754",
        }
    )
    assert deterministic_plan(forged)["state"] == "AWAITING_PROVIDER"

    other_contract_confirmation = sandbox_provider_confirmation("rc-other-contract")
    cross_contract = RemedyRun.model_validate(
        {
            "contract": contract_value,
            "evidence_filename": "synthetic.jpg",
            "provider_confirmation": other_contract_confirmation,
        }
    )
    assert deterministic_plan(cross_contract)["state"] == "AWAITING_PROVIDER"


def test_confirmation_validation_is_stable_under_repeated_adversarial_inputs():
    contract_id = contract()["id"]
    valid = sandbox_provider_confirmation(contract_id)
    assert provider_confirmation_is_valid(contract_id, valid)
    for index in range(1000):
        assert not provider_confirmation_is_valid(contract_id, f"forged-{index}")


def test_idempotency_key_is_stable():
    assert idempotency_key("contract", "submit") == idempotency_key("contract", "submit")
