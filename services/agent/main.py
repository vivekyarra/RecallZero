from __future__ import annotations

import json
import os

from bedrock_agentcore.runtime import BedrockAgentCoreApp
from strands import Agent
from strands.models import BedrockModel

from policy import RemedyRun, deterministic_plan
from tools import (
    check_sandbox_outcome,
    inspect_remedy_contract,
    prepare_sandbox_claim,
    request_physical_evidence,
    submit_sandbox_claim,
)

SYSTEM_PROMPT = """You are RecallZero's governed Remedy Agent.
You receive an immutable Remedy Contract only after deterministic exact matching.
Use the narrow tools to finish routine digital work around unavoidable human physical steps.
You MUST NOT invent a recall, alter official instructions, call a real manufacturer,
bypass a missing-evidence gate, or declare completion without provider confirmation.
Every execution target is MANUFACTURER_SANDBOX. Return a concise JSON-compatible summary.
"""

app = BedrockAgentCoreApp()


def build_agent() -> Agent:
    model = BedrockModel(
        model_id=os.getenv(
            "BEDROCK_MODEL_ID", "global.amazon.nova-2-lite-v1:0"
        ),
        region_name=os.getenv("AWS_REGION", "us-west-2"),
        temperature=0,
        max_tokens=512,
    )
    return Agent(
        model=model,
        system_prompt=SYSTEM_PROMPT,
        tools=[
            inspect_remedy_contract,
            prepare_sandbox_claim,
            request_physical_evidence,
            submit_sandbox_claim,
            check_sandbox_outcome,
        ],
    )


@app.entrypoint
def invoke(payload: dict) -> dict:
    run = RemedyRun.model_validate(payload)
    if os.getenv("RECALLZERO_DETERMINISTIC_DEMO") == "1":
        return {
            "mode": "DETERMINISTIC_DEMO",
            "result": deterministic_plan(run),
            "disclosure": "No model or real manufacturer was contacted.",
        }

    agent = build_agent()
    prompt = (
        "Execute the next safe remedy step for this verified contract. "
        "Use tools; do not restate the contract or physical-action instructions. "
        "Return only a compact JSON summary with the state, tool used, and whether "
        "any external contact occurred. Input: "
        + run.model_dump_json()
    )
    result = agent(prompt)
    return {
        "mode": "STRANDS_BEDROCK",
        "result": str(result),
        "contract_id": run.contract.id,
    }


if __name__ == "__main__":
    app.run()
