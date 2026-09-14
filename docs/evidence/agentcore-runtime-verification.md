# Verified Bedrock / AgentCore execution — 2026-09-13 UTC

RecallZero's existing `services/agent/main.py` Strands entrypoint ran on Amazon Bedrock AgentCore Runtime in account `768669378827`, Region `ap-south-1`. The synthetic sandbox contract received a real Bedrock-driven tool call and HTTP 200 response. The runtime was subsequently deleted; this is **historical cloud proof**, not an always-on deployment or the public browser demo backend.

## Identity, tools, and deployment

- AWS CLI `2.36.44`; official AgentCore CLI `0.29.0`.
- `aws login --profile recallzero-aws --region ap-south-1`, followed by `aws sts get-caller-identity --profile recallzero-aws`: account `768669378827`, principal `arn:aws:iam::768669378827:root`. No credential value is recorded. Root was used only for this short verification; a scoped role is required for a durable production deployment.
- The `builder-id` SSO profile had no account access. The console-linked temporary profile was the working credential path.
- `agentcore create` generated the local scaffold. [`scripts/prepare-agentcore-project.ps1`](../../scripts/prepare-agentcore-project.ps1) makes it reproducible with the real `services/agent` source. `agentcore validate` passed; `agentcore deploy --dry-run` synthesized the package, and `agentcore deploy --yes` deployed it after CDK bootstrap. The synthesized ZIP was inspected for `main.py`, `policy.py`, and `tools.py`; it was not a generated hello-world agent.
- CloudFormation stack: `AgentCore-RecallZeroProof-default`.
- Runtime ARN: `arn:aws:bedrock-agentcore:ap-south-1:768669378827:runtime/RecallZeroProof_RecallZeroRemedy-scLXKuG841`.
- Runtime ID: `RecallZeroProof_RecallZeroRemedy-scLXKuG841`.
- `aws bedrock-agentcore-control get-agent-runtime --agent-runtime-id RecallZeroProof_RecallZeroRemedy-scLXKuG841 --profile recallzero-aws --region ap-south-1` returned `READY`, version `3`, before invocation.

## Actual invocation

The tracked default model is `global.amazon.nova-2-lite-v1:0` through `strands.models.BedrockModel`. This was a real model call: `RECALLZERO_DETERMINISTIC_DEMO` was unset. The exact synthetic request is [`agentcore-sandbox-request.json`](agentcore-sandbox-request.json). It is an exact-match US CPSC Remedy Contract with no customer identity, physical-evidence filename, or provider confirmation.

Invocation command (one request, no retry in the helper):

```powershell
services/agent/.venv/Scripts/python.exe scripts/invoke-agentcore-proof.py --profile recallzero-aws --region ap-south-1 --arn arn:aws:bedrock-agentcore:ap-south-1:768669378827:runtime/RecallZeroProof_RecallZeroRemedy-scLXKuG841 --request docs/evidence/agentcore-sandbox-request.json --out docs/evidence/agentcore-invocation-2026-09-13-retry.json
```

From `2026-09-13T19:00:41.256768Z` to `19:00:48.006961Z`, AgentCore returned HTTP **200**, session `87b228a2-5741-4be4-a0bb-a54653b64dfd`. The exact captured request and response are in [`agentcore-invocation-2026-09-13-retry.json`](agentcore-invocation-2026-09-13-retry.json). The response mode was `STRANDS_BEDROCK`; model text reported `{"state":"PREPARED","tool_used":"prepare_sandbox_claim","external_contact":false}`. Sanitized CloudWatch events corroborate `Tool #1: prepare_sandbox_claim` and successful request ID `741b7f53-8a24-4a9d-96e8-6f4df00dc75a`: [`agentcore-cloudwatch-sanitized.json`](agentcore-cloudwatch-sanitized.json).

An earlier Nova invocation also returned HTTP 200 and logged `request_physical_evidence`, but its final generated text was content-filtered: [`agentcore-invocation-2026-09-13.json`](agentcore-invocation-2026-09-13.json). Before that, a Claude Sonnet 4.6 attempt failed with `INVALID_PAYMENT_INSTRUMENT`; no payment method was changed. These events are retained in the sanitized log rather than presented as successes.

## Limits and cleanup

- Only a synthetic owned product and RecallZero-controlled manufacturer sandbox were in scope. No real manufacturer was contacted; no physical remediation, provider approval, or refund was proven. The agent prepared a claim, not a completed remedy.
- The public browser demo and deterministic protocol mirror were not replaced or connected to this temporary cloud runtime.
- The deployment and test inference were usage-billed services. The AWS console showed active general Free Tier credit eligible for Bedrock/AgentCore; this was not a guarantee against future charges. We made no payment-method change.
- After capturing the proof, `aws cloudformation delete-stack --stack-name AgentCore-RecallZeroProof-default`, `aws cloudformation wait stack-delete-complete`, and `aws bedrock-agentcore-control list-agent-runtimes` confirmed no runtime remained. The exact runtime CloudWatch log group was deleted after saving the sanitized events; a final log-group readback returned `[]`. The six object versions created in the dedicated CDK bootstrap bucket were inventoried and deleted; `CDKToolkit` stack deletion completed. The retained bucket was confirmed empty, deleted, and `head-bucket` returned 404. A final `list-agent-runtimes` returned `[]`, and `list-stacks` showed neither proof stack nor `CDKToolkit` active. These deleted AWS resources cannot be used for a live demo without redeployment.
