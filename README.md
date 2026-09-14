# RecallZero

> A recall can be public and still sit dangerous in your home. RecallZero is the Strands-powered agent that finishes product recalls—not just finds them.

<p align="center">
  <a href="https://recallzero.vercel.app"><strong>Live demo</strong></a> ·
  <a href="https://youtu.be/wPlyuN7ENpo"><strong>Demo video</strong></a> ·
  <a href="https://devpost.com/software/recallzero-ue2p7g"><strong>Devpost</strong></a> ·
  <a href="docs/architecture/recallzero-architecture.png"><strong>Architecture</strong></a> ·
  <a href="docs/evidence/strands-runtime-verification.md"><strong>Strands trace</strong></a>
</p>

Built for the **Agents for Humans Hackathon** in the **Everyday Agents** track.

## Judge TL;DR

**The problem:** Recall alerts do not equal solved recalls. A consumer still has to identify whether the exact model is affected, read the official remedy, collect evidence, submit a claim, follow up, and know when it is actually done.

**The product:** RecallZero converts an owned product into an **Asset Passport**, checks authoritative CPSC recall data, issues a **Remedy Contract** only after exact deterministic matching, and carries the case through sandbox remedy submission until contract-bound evidence proves completion.

**The agentic point:** Strands handles the repeatable remedy work. Deterministic code keeps authority over safety truth, exact matching, evidence gates, and completion state. The human is surfaced only for the physical task software cannot perform.

**The demo outcome:** a recalled synthetic hair dryer moves from `UNRESOLVED` to `REMEDIATED`, and the dashboard returns to the one metric that matters: **0 unresolved recalled products**.

## Why this should stand out

Most recall tools stop at *notification*. RecallZero starts there.

```text
ownership → official recall source → exact identity gate → Remedy Contract
→ Strands remedy tools → human physical proof → sandbox provider outcome
→ verified closure → zero unresolved recalls
```

That loop makes the project fit the hackathon brief directly: it removes repetitive household busywork, handles the process end to end, and only pings a human when there is a real-world action to take.

## Working demo path

The public judge flow is intentionally narrow and complete:

1. Import a clearly labeled synthetic receipt for a **Wantefully XR-8801 hair dryer**.
2. Run an on-demand CPSC recall check.
3. Show the source badge: live CPSC API when reachable, otherwise an explicitly labeled official snapshot fallback.
4. Apply four deterministic identity predicates.
5. Create a Remedy Contract only for an exact match.
6. Stop for the physical evidence handoff.
7. Use prepared synthetic evidence for the public demo.
8. Submit to a controlled manufacturer sandbox with an idempotency key.
9. Fast-forward the simulated provider outcome.
10. Verify completion only when evidence and provider confirmation both bind to the same contract.

No claim is sent to a real manufacturer. No real product is damaged.

## What is real vs. sandboxed

| Surface | Truth boundary |
|---|---|
| Web product | Live Next.js app deployed at `recallzero.vercel.app` |
| Recall source | Official CPSC API path, with an explicitly labeled official snapshot fallback |
| Product ownership | Synthetic receipt / synthetic Asset Passport |
| Exact matching | Deterministic TypeScript domain code |
| Remedy execution | Public browser journey mirrors the governed protocol |
| Strands runtime | Real Python `strands.Agent` with five allowlisted tools and local SDK tool-call trace |
| Provider | RecallZero-owned manufacturer sandbox |
| Physical proof | Prepared synthetic evidence for the demo |
| Real manufacturer contact | Never performed |
| Bedrock / AgentCore | Historical real Strands/Bedrock invocation on temporary AgentCore runtime; runtime deleted after proof |

## Architecture: authority before autonomy

RecallZero is built around a simple rule:

> The agent can do routine work, but it cannot become the source of safety truth.

![RecallZero architecture](docs/architecture/recallzero-architecture.svg)

High-resolution judge exports:

- [Architecture PNG](docs/architecture/recallzero-architecture.png)
- [Architecture PDF](docs/architecture/recallzero-architecture.pdf)
- [Architecture Mermaid source](docs/architecture/recallzero-architecture.mmd)

### Core layers

- **Official source layer:** CPSC recall retrieval through `lib/server/cpsc.ts`.
- **Identity layer:** deterministic model, retailer, purchase-window, and recall-scope checks.
- **Contract layer:** immutable Remedy Contract created only after exact match.
- **Agent layer:** Strands runtime receives the verified contract and operates through narrow tools.
- **Human gate:** physical actions stay with the user and are represented by evidence, not model claims.
- **Provider layer:** sandbox-only submission and outcome verification.
- **Verification layer:** unit, policy, stress, and browser tests.

## Strands Agents SDK implementation

`services/agent/` contains the real governed agent boundary:

- `strands.Agent`
- `strands.models.BedrockModel`
- `BedrockAgentCoreApp`
- Pydantic contract validation
- exactly five allowlisted tools:
  1. `inspect_remedy_contract`
  2. `prepare_sandbox_claim`
  3. `request_physical_evidence`
  4. `submit_sandbox_claim`
  5. `check_sandbox_outcome`

The committed evidence file records local calls through `strands.Agent.tool` using `strands-agents 1.55.1`:

- [Runtime verification](docs/evidence/strands-runtime-verification.md)
- [Raw execution trace](docs/evidence/strands-agent-execution-trace.json)

That local trace proves SDK construction and tool-boundary behavior, not cloud execution. Separately, the actual agent was temporarily deployed to AgentCore and invoked through Bedrock with a synthetic sandbox contract. The HTTP 200 response and CloudWatch tool event are documented in [verified AgentCore runtime evidence](docs/evidence/agentcore-runtime-verification.md). The runtime was then deleted; the public browser demo remains unchanged and does not call AgentCore. [Access and status summary](docs/evidence/aws-agentcore-readiness.md).

## Safety invariants

| Invariant | How RecallZero enforces it |
|---|---|
| No AI-created recalls | Recall truth comes from official CPSC data or labeled snapshot fallback |
| No fuzzy exact matches | Similar products stay `POSSIBLE_MATCH`; only deterministic predicates can produce `EXACT_MATCH` |
| No fake completion | Provider token alone is rejected; evidence alone is rejected |
| No silent manufacturer action | Public demo submits only to `MANUFACTURER_SANDBOX` |
| No arbitrary tools | Strands runtime exposes only five contract-scoped tools |
| No unsafe hydration | Persisted browser state is revalidated before restoration |
| No hidden demo claims | Synthetic data, sandbox provider, and AgentCore limits are labeled openly |

## Verification

```powershell
npm run lint
npm run typecheck
npm test
npm run test:agent
npm run build
npm run test:e2e
npm run check:secrets
```

GitHub Actions is configured with three independent jobs:

- `lint-type-test-build`: frontend quality, type safety, unit tests, secret scan, audit, production build.
- `python-agent-safety`: governed policy tests for the Strands runtime.
- `browser-e2e-stress`: repeated Playwright desktop/mobile journeys with browser artifacts.

The test suite covers exact / possible / no-match separation, official-source restrictions, dynamic CPSC query windows, legal state transitions, missing-evidence rejection, forged provider confirmation rejection, idempotency, deterministic stress cases, responsive rendering, and browser console errors.

## Run locally

Prerequisites:

- Node.js 22+
- Python 3.11+
- `uv`

```powershell
npm ci
uv sync --project services/agent
npm run dev
```

Open:

```text
http://localhost:3000
```

Run the governed Strands-compatible service locally in deterministic demo mode:

```powershell
$env:RECALLZERO_DETERMINISTIC_DEMO = "1"
uv run --project services/agent python services/agent/main.py
```

Replay the SDK tool-boundary trace:

```powershell
cd services/agent
uv run python run_strands_trace.py
```

For genuine Bedrock / AgentCore execution, follow [`services/agent/README.md`](services/agent/README.md). Do not treat deterministic mode as proof of deployed AgentCore execution.

## Repository map

| Path | Purpose |
|---|---|
| `app/`, `components/` | Next.js product surface and judge journey |
| `lib/domain/` | safety kernel, matching, contracts, workflow invariants |
| `lib/server/` | official CPSC client |
| `services/agent/` | Strands tools, Bedrock model adapter, AgentCore entrypoint |
| `tests/`, `e2e/`, `services/agent/tests/` | unit, policy, stress, and browser evidence |
| `docs/architecture/` | source and exports for the architecture diagram |
| `docs/evidence/` | Strands SDK verification and raw execution trace |
| `docs/demo/` | demo recording scripts |
| `docs/submission/` | Devpost and Builder.aws support material |
| `docs/hackathon-build/` | scope, PRD, spec, checklist, and build journal |

## Built with

- Strands Agents SDK
- Amazon Bedrock target adapter
- Amazon Bedrock AgentCore-compatible runtime entrypoint
- Next.js 16
- React 19
- TypeScript
- Python
- Pydantic
- Zod
- Vitest
- Pytest
- Playwright
- GitHub Actions
- Vercel

## Roadmap

- Real opt-in ownership sources: email receipts, retailer exports, purchase history, warranty cards.
- Broader CPSC category matching with deterministic product identity rules per category.
- Verified provider integrations with signed status callbacks.
- Background monitoring that notifies only when an owned item is affected.
- Scoped-identity, durable production AgentCore deployment building on the verified temporary invocation.
- Multi-product household dashboard with unresolved-risk prioritization.

## License

[MIT](LICENSE) © 2026 Vivek Yarra.
