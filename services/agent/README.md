# RecallZero Strands runtime

This service is the governed agent boundary. It uses the real Strands Agents SDK and is compatible with Amazon Bedrock AgentCore Runtime through `BedrockAgentCoreApp`.

The agent receives only an already verified Remedy Contract. Pydantic rejects non-CPSC authorities, non-exact matches, non-sandbox authority, and unrecognized remedy/provider values before a model or tool can run.

```powershell
uv sync --project services/agent
$env:RECALLZERO_DETERMINISTIC_DEMO = "1"
uv run --project services/agent python services/agent/main.py
```

For genuine Bedrock execution, omit `RECALLZERO_DETERMINISTIC_DEMO`, configure AWS credentials or an AgentCore execution role, and set `BEDROCK_MODEL_ID` if needed.

The official CLI is `npm install -g @aws/agentcore`. Its `create` command scaffolds a new project; it does **not** deploy this existing `services/agent` code by itself. [`scripts/prepare-agentcore-project.ps1`](../../scripts/prepare-agentcore-project.ps1) wires the scaffold to this entrypoint; the [verified run record](../../docs/evidence/agentcore-runtime-verification.md) documents the temporary deployment and cleanup. Configure a scoped account identity and review usage charges before redeploying. See the official [Python direct-code deployment guide](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-get-started-code-deploy-python.html).

Never use a generated scaffold's invocation as RecallZero evidence. The recorded runtime was deleted after verification; do not describe it as currently deployed.
