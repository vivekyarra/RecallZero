from main import build_agent


CONTRACT = {
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


def test_real_strands_agent_constructs_with_only_governed_tools(monkeypatch):
    """Prove the real Strands SDK boundary without requiring Bedrock credentials."""
    monkeypatch.setenv("AWS_EC2_METADATA_DISABLED", "true")
    agent = build_agent()

    assert set(agent.tool_names) == {
        "inspect_remedy_contract",
        "prepare_sandbox_claim",
        "request_physical_evidence",
        "submit_sandbox_claim",
        "check_sandbox_outcome",
    }

    # 1. inspect_remedy_contract
    r1 = agent.tool.inspect_remedy_contract(contract=CONTRACT)
    assert r1["status"] == "success"
    p1 = next(item["json"] for item in r1["content"] if "json" in item)
    assert p1["verified"] is True
    assert p1["contract_id"] == CONTRACT["id"]
    assert p1["scope"] == "SANDBOX_ROUTINE_REMEDY_ONLY"

    # 2. prepare_sandbox_claim
    r2 = agent.tool.prepare_sandbox_claim(contract=CONTRACT)
    assert r2["status"] == "success"
    p2 = next(item["json"] for item in r2["content"] if "json" in item)
    assert p2["prepared"] is True
    assert p2["environment"] == "MANUFACTURER_SANDBOX"

    # 3. request_physical_evidence
    r3 = agent.tool.request_physical_evidence(contract=CONTRACT)
    assert r3["status"] == "success"
    p3 = next(item["json"] for item in r3["content"] if "json" in item)
    assert p3["state"] == "NEEDS_HUMAN"

    # 4. submit_sandbox_claim
    r4_blank = agent.tool.submit_sandbox_claim(contract=CONTRACT, evidence_filename="  ")
    assert r4_blank["status"] == "error"
    assert "Physical evidence is required" in r4_blank["content"][0]["text"]

    r4 = agent.tool.submit_sandbox_claim(contract=CONTRACT, evidence_filename="test.jpg")
    assert r4["status"] == "success"
    p4 = next(item["json"] for item in r4["content"] if "json" in item)
    assert p4["accepted"] is True
    assert p4["environment"] == "MANUFACTURER_SANDBOX"
    assert "receipt" in p4

    # 5. check_sandbox_outcome (unconfirmed vs confirmed)
    r5_unconf = agent.tool.check_sandbox_outcome(contract=CONTRACT, provider_confirmation=None)
    assert r5_unconf["status"] == "success"
    p5_unconf = next(item["json"] for item in r5_unconf["content"] if "json" in item)
    assert p5_unconf["verified"] is False
    assert p5_unconf["state"] == "AWAITING_PROVIDER"

    from policy import sandbox_provider_confirmation
    valid_token = sandbox_provider_confirmation(CONTRACT["id"])
    r5_missing_evidence = agent.tool.check_sandbox_outcome(contract=CONTRACT, provider_confirmation=valid_token)
    p5_missing_evidence = next(item["json"] for item in r5_missing_evidence["content"] if "json" in item)
    assert p5_missing_evidence["verified"] is False
    assert p5_missing_evidence["state"] == "AWAITING_PROVIDER"

    r5_conf = agent.tool.check_sandbox_outcome(
        contract=CONTRACT,
        provider_confirmation=valid_token,
        evidence_filename="test.jpg",
    )
    assert r5_conf["status"] == "success"
    p5_conf = next(item["json"] for item in r5_conf["content"] if "json" in item)
    assert p5_conf["verified"] is True
    assert p5_conf["state"] == "REMEDIATED"
