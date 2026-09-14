# AWS Bedrock / AgentCore verification

Verified on **2026-09-13 UTC** in account `768669378827`, Region `ap-south-1`. The actual RecallZero Strands agent was deployed to AgentCore, invoked through Bedrock, and then decommissioned to avoid leaving billable infrastructure. This is historical execution proof, **not** a claim that a public or currently running AgentCore endpoint exists.

The deployment commands, runtime identifiers, request, response, sanitized logs, limitations, and cleanup readback are in [agentcore-runtime-verification.md](agentcore-runtime-verification.md). The local Strands trace is [separate evidence](strands-runtime-verification.md).

The initial `builder-id` SSO profile was unusable. A browser-console `aws login` connected a temporary CLI profile to the AWS account; credentials were not printed or committed. The deployment used the root principal because no scoped role was available. This was temporary verification, not a recommended production setup.
