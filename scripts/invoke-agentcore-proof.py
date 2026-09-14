"""Invoke the sandbox-only RecallZero AgentCore runtime once and save its response."""

from __future__ import annotations

import argparse
import json
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

import boto3
from botocore.config import Config

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "services" / "agent"))
from policy import RemedyRun  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--profile", required=True)
    parser.add_argument("--region", required=True)
    parser.add_argument("--arn", required=True)
    parser.add_argument("--request", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()

    payload = json.loads(args.request.read_text(encoding="utf-8"))
    run = RemedyRun.model_validate(payload)
    if run.evidence_filename or run.provider_confirmation:
        parser.error("Cloud proof request must stop at the human-evidence gate")
    if args.out.exists():
        parser.error("Refusing to overwrite an existing proof file")

    session_id = str(uuid.uuid4())
    started_at = datetime.now(timezone.utc).isoformat()
    client = boto3.Session(profile_name=args.profile).client(
        "bedrock-agentcore",
        region_name=args.region,
        config=Config(
            connect_timeout=10,
            read_timeout=180,
            retries={"total_max_attempts": 1},
        ),
    )
    response = client.invoke_agent_runtime(
        agentRuntimeArn=args.arn,
        runtimeSessionId=session_id,
        qualifier="DEFAULT",
        contentType="application/json",
        accept="application/json",
        payload=json.dumps(payload, separators=(",", ":")).encode("utf-8"),
    )
    body = response["response"].read().decode("utf-8")
    try:
        parsed_body = json.loads(body)
    except json.JSONDecodeError:
        parsed_body = body

    proof = {
        "started_at_utc": started_at,
        "completed_at_utc": datetime.now(timezone.utc).isoformat(),
        "account_id": args.arn.split(":")[4],
        "region": args.region,
        "runtime_arn": args.arn,
        "runtime_session_id": response.get("runtimeSessionId", session_id),
        "http_status": response.get("statusCode"),
        "content_type": response.get("contentType"),
        "request": payload,
        "response": parsed_body,
        "limitations": [
            "Synthetic owned product and controlled manufacturer sandbox only.",
            "This call does not prove a real manufacturer refund or physical remediation.",
        ],
    }
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(proof, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"proof_file": str(args.out), "http_status": proof["http_status"], "runtime_session_id": proof["runtime_session_id"]}))


if __name__ == "__main__":
    main()
