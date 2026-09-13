# RecallZero — Strands Agents SDK Runtime Verification

This document records local calls to registered tools through **`strands.Agent.tool` (`strands-agents 1.55.1`)**. It proves SDK construction and tool-boundary behavior. It does not show an LLM-driven tool loop, Bedrock invocation, or AgentCore deployment.

---

## 1. Runtime Architecture

```
                                      [ US CPSC Official REST API ]
                                                    │
                                                    ▼
                                     [ Deterministic Identity Gate ]
                                 (Model + Retailer + Purchase Window)
                                                    │
                                                    ▼
                                      [ Immutable Remedy Contract ]
                                                    │
                                                    ▼
   ┌──────────────────────────────────────────────────────────────────────────────────┐
   │                       STRANDS REMEDY AGENT RUNTIME                               │
   │                                                                                  │
   │   • SDK: strands-agents v1.55.1                                                  │
   │   • Target Model: Amazon Bedrock (strands.models.BedrockModel)                   │
   │   • App Container: BedrockAgentCoreApp (bedrock-agentcore v1.22.0)               │
   │                                                                                  │
   │   Narrow Tool Allowlist:                                                         │
   │   ├── 1. inspect_remedy_contract                                                 │
   │   ├── 2. prepare_sandbox_claim                                                   │
   │   ├── 3. request_physical_evidence  ─────────► [ Human Physical Action Gate ]     │
   │   ├── 4. submit_sandbox_claim       ─────────► [ Controlled Manufacturer Sandbox ]│
   │   └── 5. check_sandbox_outcome      ─────────► [ Deterministic Completion Check ] │
   └──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Invariant & Governance Guarantees

1. **Authority Before Autonomy:**
   An LLM is never permitted to determine recall status or upgrade a possible match to an exact match. Only deterministic code passing 4 mandatory predicates can issue a `RemedyContract`.

2. **Allowlisted Tool Boundary:**
   The `strands.Agent` is registered with exactly 5 narrow remedy tools. No shell, HTTP client, or arbitrary external tools are available in the runtime.

3. **Physical Evidence Gate:**
   `request_physical_evidence` reports `NEEDS_HUMAN`; sandbox submission rejects empty evidence and outcome verification rejects completion without evidence. The trace calls tools directly, so it does not prove that an LLM stopped autonomously.

4. **Sandbox Bounded Execution:**
   All submissions target `MANUFACTURER_SANDBOX`. No claim is ever transmitted to a real manufacturer during demonstrations.

5. **Completion Predicates:**
   A submission receipt is distinct from completion. The sandbox outcome tool requires a non-empty evidence filename and a matching deterministic sandbox confirmation token. That token is a public demo fixture, not a production provider signature.

---

## 3. Auditable Execution Trace

The full machine-readable execution trace is recorded at:
[`docs/evidence/strands-agent-execution-trace.json`](strands-agent-execution-trace.json)

### Lifecycle Steps Executed & Verified:

| Step | Registered Strands Tool | Actor | Input | Output / State | Invariant Verified |
|---|---|---|---|---|---|
| **1** | `inspect_remedy_contract` | `STRANDS_AGENTS_SDK` | `rc-26754-asset-xr8801-demo` | `verified: true`, scope: `SANDBOX_ROUTINE_REMEDY_ONLY` | Contract binding and schema invariant enforced. |
| **2** | `prepare_sandbox_claim` | `STRANDS_AGENTS_SDK` | `rc-26754-asset-xr8801-demo` | `environment: MANUFACTURER_SANDBOX` | Zero external network leakage. |
| **3** | `request_physical_evidence` | `STRANDS_AGENTS_SDK` | `rc-26754-asset-xr8801-demo` | `state: NEEDS_HUMAN` | Human physical gate strictly enforced. |
| **4** | `submit_sandbox_claim` | `STRANDS_AGENTS_SDK` | `evidence: synthetic-xr8801-disabled.jpg` | `accepted: true`, `receipt: RZ-F0C60BF949` | Idempotent submission; state transitions to `AWAITING_PROVIDER`. |
| **5a** | `check_sandbox_outcome` | `STRANDS_AGENTS_SDK` | `provider_confirmation: null` | `verified: false`, `state: AWAITING_PROVIDER` | Self-declaration of completion rejected. |
| **5b** | `check_sandbox_outcome` | `STRANDS_AGENTS_SDK` | `provider_confirmation: "FORGED-TOKEN"` | `verified: false` | Non-matching sandbox fixture rejected. |
| **5c** | `check_sandbox_outcome` | `STRANDS_AGENTS_SDK` | `provider_confirmation: "SBX-998FE..."` | `verified: true`, `state: REMEDIATED` | Verified resolution achieved and contract closed. |

---

## 4. How to Replay and Verify

To execute and verify the Strands runtime independently:

```bash
cd services/agent
uv run python run_strands_trace.py
```

All 7 lifecycle events will execute, validate each governance check, and re-generate the auditable JSON trace report.
