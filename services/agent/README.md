# RecallZero Strands runtime

This service is the governed agent boundary. It uses the real Strands Agents SDK and is compatible with Amazon Bedrock AgentCore Runtime through `BedrockAgentCoreApp`.

The agent receives only an already verified Remedy Contract. Pydantic rejects non-CPSC authorities, non-exact matches, non-sandbox authority, and unrecognized remedy/provider values before a model or tool can run.

```powershell
uv sync --project services/agent
$env:RECALLZERO_DETERMINISTIC_DEMO = "1"
uv run --project services/agent python services/agent/main.py
```

For genuine Bedrock execution, omit `RECALLZERO_DETERMINISTIC_DEMO`, configure AWS credentials or an AgentCore execution role, and set `BEDROCK_MODEL_ID` if needed.

Deploy using the official direct-code flow:

```powershell
npm install -g @aws/agentcore
agentcore create --project-name RecallZero --name RecallZeroRemedyAgent --language Python --framework Strands --model-provider Bedrock --memory none --build CodeZip
agentcore deploy
agentcore invoke '<verified contract payload>'
```

Never describe the runtime as deployed until an ARN and successful invocation have been recorded.

