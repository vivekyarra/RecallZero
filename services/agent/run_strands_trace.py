from __future__ import annotations

import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

# Ensure services/agent is on sys.path
sys.path.insert(0, str(Path(__file__).parent))

from main import build_agent, SYSTEM_PROMPT
from policy import (
    RemedyContract,
    RemedyRun,
    sandbox_provider_confirmation,
    provider_confirmation_is_valid,
    idempotency_key,
)

os.environ["AWS_EC2_METADATA_DISABLED"] = "true"

OFFICIAL_CONTRACT = {
    "id": "rc-26754-asset-xr8801-demo",
    "authority": "US CPSC",
    "recallNumber": "26754",
    "recallUrl": "https://www.cpsc.gov/Recalls/2026/Guang-Zhou-Recalls-Wantefully-Hair-Dryer-Brushes-Due-to-Risk-of-Serious-Injury-or-Death-from-Electrocution-Shock-and-Burn-Hazards-Violate-Federal-Regulations",
    "hazard": "The recalled hair dryer brushes can present a risk of death or serious injury from electrocution or shock and can overheat, posing a burn hazard.",
    "officialAction": "Consumers should unplug and stop using the recalled hair dryers immediately and contact Guang Zhou to receive a full refund. Consumers will be asked to cut the power cord and provide a photo of the destroyed product to wantefully@163.com.",
    "remedy": "FULL_REFUND",
    "provider": "Guang Zhou",
    "requiredEvidence": ["Photo of disabled product with cut power cord"],
    "completionCondition": "Both consumer physical evidence and provider approval must be verified.",
    "agentAuthority": "SANDBOX_ROUTINE_REMEDY_ONLY",
    "matchStatus": "EXACT_MATCH",
}


def generate_strands_execution_trace():
    agent = build_agent()
    trace_events = []
    start_time = datetime.now(timezone.utc).isoformat()

    # Step 1: inspect_remedy_contract
    t1_result = agent.tool.inspect_remedy_contract(contract=OFFICIAL_CONTRACT)
    t1_json = next(item["json"] for item in t1_result["content"] if "json" in item)
    assert t1_json["verified"] is True
    trace_events.append({
        "step": 1,
        "tool": "inspect_remedy_contract",
        "actor": "STRANDS_AGENTS_SDK",
        "status": t1_result["status"],
        "input": {"contract_id": OFFICIAL_CONTRACT["id"], "recallNumber": OFFICIAL_CONTRACT["recallNumber"]},
        "output": t1_json,
        "governance_check": "Deterministic contract binding and schema invariant passed",
    })

    # Step 2: prepare_sandbox_claim
    t2_result = agent.tool.prepare_sandbox_claim(contract=OFFICIAL_CONTRACT)
    t2_json = next(item["json"] for item in t2_result["content"] if "json" in item)
    assert t2_json["environment"] == "MANUFACTURER_SANDBOX"
    trace_events.append({
        "step": 2,
        "tool": "prepare_sandbox_claim",
        "actor": "STRANDS_AGENTS_SDK",
        "status": t2_result["status"],
        "input": {"contract_id": OFFICIAL_CONTRACT["id"]},
        "output": t2_json,
        "governance_check": "Target strictly bounded to MANUFACTURER_SANDBOX (no external traffic)",
    })

    # Step 3: request_physical_evidence (Physical safety gate)
    t3_result = agent.tool.request_physical_evidence(contract=OFFICIAL_CONTRACT)
    t3_json = next(item["json"] for item in t3_result["content"] if "json" in item)
    assert t3_json["state"] == "NEEDS_HUMAN"
    trace_events.append({
        "step": 3,
        "tool": "request_physical_evidence",
        "actor": "STRANDS_AGENTS_SDK",
        "status": t3_result["status"],
        "input": {"contract_id": OFFICIAL_CONTRACT["id"]},
        "output": t3_json,
        "governance_check": "Tool returned NEEDS_HUMAN; physical evidence is required before sandbox submission",
    })

    # Step 4: submit_sandbox_claim with synthetic evidence
    evidence_file = "synthetic-xr8801-disabled.jpg"
    t4_result = agent.tool.submit_sandbox_claim(contract=OFFICIAL_CONTRACT, evidence_filename=evidence_file)
    t4_json = next(item["json"] for item in t4_result["content"] if "json" in item)
    assert t4_json["accepted"] is True
    receipt = t4_json["receipt"]
    trace_events.append({
        "step": 4,
        "tool": "submit_sandbox_claim",
        "actor": "STRANDS_AGENTS_SDK",
        "status": t4_result["status"],
        "input": {"contract_id": OFFICIAL_CONTRACT["id"], "evidence_filename": evidence_file},
        "output": t4_json,
        "governance_check": "Idempotent submission key generated; state transitions to AWAITING_PROVIDER (submission != completion)",
    })

    # Step 5a: check_sandbox_outcome before provider approval
    t5a_result = agent.tool.check_sandbox_outcome(contract=OFFICIAL_CONTRACT, provider_confirmation=None, evidence_filename=evidence_file)
    t5a_json = next(item["json"] for item in t5a_result["content"] if "json" in item)
    assert t5a_json["verified"] is False
    assert t5a_json["state"] == "AWAITING_PROVIDER"
    trace_events.append({
        "step": 5,
        "substep": "5a_unconfirmed",
        "tool": "check_sandbox_outcome",
        "actor": "STRANDS_AGENTS_SDK",
        "status": t5a_result["status"],
        "input": {"contract_id": OFFICIAL_CONTRACT["id"], "provider_confirmation": None, "evidence_filename": evidence_file},
        "output": t5a_json,
        "governance_check": "Self-declaration of completion rejected; provider confirmation is mandatory",
    })

    # Step 5b: check_sandbox_outcome with adversarial forged token
    t5b_result = agent.tool.check_sandbox_outcome(contract=OFFICIAL_CONTRACT, provider_confirmation="FORGED-TOKEN-12345", evidence_filename=evidence_file)
    t5b_json = next(item["json"] for item in t5b_result["content"] if "json" in item)
    assert t5b_json["verified"] is False
    trace_events.append({
        "step": 5,
        "substep": "5b_adversarial_rejection",
        "tool": "check_sandbox_outcome",
        "actor": "STRANDS_AGENTS_SDK",
        "status": t5b_result["status"],
        "input": {"contract_id": OFFICIAL_CONTRACT["id"], "provider_confirmation": "FORGED-TOKEN-12345", "evidence_filename": evidence_file},
        "output": t5b_json,
        "governance_check": "Forged demo token rejected by contract-bound sandbox fixture comparison",
    })

    # Step 5c: check_sandbox_outcome with valid contract-bound confirmation
    valid_confirmation = sandbox_provider_confirmation(OFFICIAL_CONTRACT["id"])
    t5c_result = agent.tool.check_sandbox_outcome(contract=OFFICIAL_CONTRACT, provider_confirmation=valid_confirmation, evidence_filename=evidence_file)
    t5c_json = next(item["json"] for item in t5c_result["content"] if "json" in item)
    assert t5c_json["verified"] is True
    assert t5c_json["state"] == "REMEDIATED"
    trace_events.append({
        "step": 5,
        "substep": "5c_verified_resolution",
        "tool": "check_sandbox_outcome",
        "actor": "STRANDS_AGENTS_SDK",
        "status": t5c_result["status"],
        "input": {"contract_id": OFFICIAL_CONTRACT["id"], "provider_confirmation": valid_confirmation, "evidence_filename": evidence_file},
        "output": t5c_json,
        "governance_check": "Outcome verified: both physical evidence and provider confirmation present -> REMEDIATED",
    })

    end_time = datetime.now(timezone.utc).isoformat()
    trace_payload = {
        "metadata": {
            "runtime": "Strands Agents SDK (strands-agents 1.55.1)",
            "framework": "Amazon Bedrock AgentCore compatible (bedrock-agentcore 1.22.0)",
            "agent_class": "strands.Agent",
            "model_adapter": "strands.models.BedrockModel",
            "system_prompt": SYSTEM_PROMPT.strip(),
            "tool_allowlist": sorted(list(agent.tool_names)),
            "executed_at_utc": start_time,
            "completed_at_utc": end_time,
            "lifecycle_steps_executed": len(trace_events),
            "verification_verdict": "VERIFIED_LOCAL_SDK_TOOL_INVOCATIONS",
            "model_invoked": False,
            "agentcore_deployed": False,
        },
        "contract": OFFICIAL_CONTRACT,
        "events": trace_events,
    }

    out_dir = Path(__file__).resolve().parent.parent.parent / "docs" / "evidence"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_file = out_dir / "strands-agent-execution-trace.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(trace_payload, f, indent=2)
    print(f"Successfully generated and verified Strands trace at: {out_file}")
    return trace_payload


if __name__ == "__main__":
    generate_strands_execution_trace()
