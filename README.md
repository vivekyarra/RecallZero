# RecallZero

> Other products tell you what was recalled. RecallZero gets it out of your life.

RecallZero is an autonomous product-safety agent built for the **Agents for Humans Hackathon**. It knows what a household owns, watches the official US Consumer Product Safety Commission recall database, deterministically verifies whether an exact unit is affected, and completes the governed repair/refund/return/disposal workflow until the outcome is verified.

## Why this is different

Recall trackers stop at `RECALL FOUND`. RecallZero starts there:

`ownership -> official safety event -> exact identity gate -> Remedy Contract -> governed action -> human only for physical work -> outcome verification -> REMEDIATED`

The product deliberately has no chat-first home screen. Its primary metric is **unresolved recalled products**, and the desired state is zero.

## Working demo

The included judge path uses:

- a clearly labeled synthetic receipt for a Wantefully XR-8801 hair dryer;
- the live official CPSC REST API, with a visibly labeled official snapshot fallback;
- a deterministic four-predicate match;
- a real Strands SDK runtime implementation;
- a controlled manufacturer sandbox—no claim is sent to a real manufacturer;
- one synthetic physical-action evidence handoff;
- provider confirmation plus evidence as non-bypassable completion predicates.

## Safety architecture

The model may interpret an already verified remedy, sequence allowlisted tools, and explain progress. It may not invent or confirm a recall, override official instructions, contact a real manufacturer in the demo, bypass missing evidence, or mark its own work complete.

See [the architecture source](docs/architecture/recallzero-architecture.mmd) and the in-product **How it works** view.

## Run locally

Prerequisites: Node.js 22+, Python 3.11+, and `uv`.

```powershell
npm install
uv sync --project services/agent
npm run dev
```

Open `http://localhost:3000`. No login or cloud credential is required for the controlled public demo.

Run the governed AgentCore-compatible service locally in deterministic demo mode:

```powershell
$env:RECALLZERO_DETERMINISTIC_DEMO = "1"
uv run --project services/agent python services/agent/main.py
```

For Bedrock/AgentCore execution, follow [the agent runtime guide](services/agent/README.md). Do not treat the deterministic adapter as proof of a deployed AgentCore runtime.

## Verification

```powershell
npm run verify
npm run test:e2e
npm run check:secrets
```

The test suite covers exact/possible match separation, CPSC authority restrictions, legal state transitions, evidence and provider completion gates, idempotency, the entire browser journey, responsive rendering, and browser console errors.

## Source boundaries

| Surface | Demo truth |
|---|---|
| Recall authority | Live CPSC REST API or explicitly labeled official snapshot |
| Product/receipt | Synthetic demo fixture |
| Matching | Deterministic code |
| Agent runtime | Real Strands code; public demo uses a labeled deterministic protocol mirror unless AgentCore is configured |
| Remedy provider | RecallZero-owned sandbox |
| Physical evidence | Prepared synthetic demo evidence |
| Real manufacturer contact | Never performed |

## Repository map

- `app/`, `components/`: Next.js product surface and server routes.
- `lib/domain/`: safety kernel, matching, contracts, workflow invariants.
- `lib/server/`: official CPSC client.
- `services/agent/`: Strands tools and Bedrock AgentCore entrypoint.
- `tests/`, `e2e/`, `services/agent/tests/`: evidence, not decoration.
- `docs/demo/`: exact five-minute recording script.
- `docs/hackathon-build/`: scope, PRD, spec, checklist, and build journal.

## License

[MIT](LICENSE) © 2026 Vivek Yarra.

