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

    result = agent.tool.inspect_remedy_contract(contract=CONTRACT)
    assert result["status"] == "success"
    payload = next(item["json"] for item in result["content"] if "json" in item)
    assert payload["verified"] is True
    assert payload["contract_id"] == CONTRACT["id"]
    assert payload["scope"] == "SANDBOX_ROUTINE_REMEDY_ONLY"
