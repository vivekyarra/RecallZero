# RecallZero

> **Getting told what to do is not the same as getting it done.**

A government recall notice can tell you that a product is dangerous, but it does not finish the job for you. The owner still has to check whether the exact item is affected, understand the official remedy, collect the right evidence, submit the claim, and keep following up until the case is actually resolved.

RecallZero handles that follow-through.

It uses official US CPSC recall data to check the product, creates a Remedy Contract only after an exact match, lets a Strands agent handle the routine digital steps, pauses when a real person has to do something physical, and keeps the case open until the outcome can be verified.

The demo ends with one simple result: **0 unresolved recalled products**.

<p align="center">
  <a href="https://recallzero.vercel.app"><strong>Live demo</strong></a> ·
  <a href="https://youtu.be/wPlyuN7ENpo"><strong>Demo video</strong></a> ·
  <a href="https://devpost.com/software/recallzero-ue2p7g"><strong>Devpost</strong></a> ·
  <a href="docs/architecture/recallzero-architecture.png"><strong>Architecture</strong></a> ·
  <a href="docs/evidence/agentcore-runtime-verification.md"><strong>AgentCore proof</strong></a>
</p>

Built for the **Agents for Humans Hackathon**, Everyday Agents track.

## The problem

Official processes often have clear instructions, but the person is still left doing the repetitive work around them.

Product recalls are a good example. Finding the recall is only the beginning. Someone still has to answer:

- Is this my exact model, or just something similar?
- Did I buy it during the affected period?
- What does the official remedy require?
- What evidence do I need?
- Has the claim only been submitted, or is the remedy actually finished?

RecallZero is an attempt to remove that middle work without letting the model guess on the safety-critical parts.

## What RecallZero does

The public demo uses a clearly labeled synthetic receipt for a **Wantefully XR-8801 hair dryer**.

1. The receipt becomes an **Asset Passport**.
2. RecallZero checks the official US CPSC recall source.
3. Normal TypeScript code checks the product family, exact model, retailer, and purchase window.
4. Only an `EXACT_MATCH` can create a **Remedy Contract**.
5. The Strands agent receives that already-verified contract and handles the routine digital steps.
6. If the remedy requires a physical action, the agent stops and asks the human for evidence.
7. Submission goes only to a controlled manufacturer sandbox.
8. The case stays open until the evidence and provider outcome both belong to the same contract.

A similar product is not enough. A confident model answer is not enough. A submitted claim is not enough.

No real manufacturer is contacted and no real product is damaged in the public demo.

## Why the matching is deterministic

The easy version of this project would have been to give a receipt and a recall page to an LLM and ask, “Does this match?”

That is not how RecallZero works.

For a product recall, a fuzzy match can be worse than no match. So exact product identity is decided by code in [`lib/domain/match.ts`](lib/domain/match.ts), not by the model.

RecallZero requires four pieces of evidence:

- product family
- exact model
- retailer
- purchase window

All four must pass before the workflow can continue. Partial evidence becomes `POSSIBLE_MATCH`, which cannot create a Remedy Contract.

Before contract creation, the match is recomputed instead of trusting a value supplied by the UI.

## What is real, and what is sandboxed

| Part | What the demo actually does |
|---|---|
| Web product | Live Next.js app at `recallzero.vercel.app` |
| Recall source | Official CPSC API path, with a clearly labeled official snapshot fallback |
| Product ownership | Synthetic receipt and Asset Passport |
| Product matching | Deterministic TypeScript code |
| Remedy state machine | Deterministic workflow code with explicit legal transitions |
| Strands agent | Real Python `strands.Agent` with five registered tools |
| Bedrock / AgentCore | Real historical Bedrock-backed AgentCore invocation, captured in the repo |
| Public browser flow | Local deterministic mirror of the same restricted workflow |
| Manufacturer | RecallZero-controlled sandbox only |
| Physical evidence | Prepared synthetic evidence for the demo |
| Real manufacturer contact | Never performed |

The temporary AgentCore runtime used for cloud verification was deleted after the evidence was captured. The browser demo does **not** pretend to be connected to that deleted runtime.

## Architecture

The main design rule is simple:

> **The agent can do routine work, but it cannot become the source of the safety fact.**

![RecallZero architecture](docs/architecture/recallzero-architecture.svg)

Architecture exports:

- [PNG](docs/architecture/recallzero-architecture.png)
- [PDF](docs/architecture/recallzero-architecture.pdf)
- [Mermaid source](docs/architecture/recallzero-architecture.mmd)

The system is split into a few clear responsibilities:

- **Official source:** CPSC retrieval in `lib/server/cpsc.ts`
- **Identity check:** deterministic matching in `lib/domain/match.ts`
- **Remedy contract:** created only after exact identity is established
- **Workflow:** allowed state transitions in `lib/domain/workflow.ts`
- **Agent:** Strands receives the verified contract and can use only a small tool set
- **Human step:** physical work stays with the person
- **Provider check:** sandbox outcome must bind back to the same contract
- **Tests:** unit, policy, stress, browser, and CI checks

## The Strands agent

The agent lives in [`services/agent/`](services/agent/).

It uses:

- `strands.Agent`
- `strands.models.BedrockModel`
- `BedrockAgentCoreApp`
- Pydantic validation

It gets exactly five tools:

1. `inspect_remedy_contract`
2. `prepare_sandbox_claim`
3. `request_physical_evidence`
4. `submit_sandbox_claim`
5. `check_sandbox_outcome`

That small tool set is intentional. The agent can prepare the claim, request the human step, submit to the sandbox, and check the result. It cannot create a recall, promote a fuzzy match, invent evidence, or declare its own work complete.

## Real Bedrock / AgentCore proof

I also wanted to verify that the Strands integration was more than code that looked deployable.

The actual `services/agent/` runtime was temporarily deployed to **Amazon Bedrock AgentCore Runtime** and invoked with a synthetic exact-match Remedy Contract.

The captured run shows:

- a real `STRANDS_BEDROCK` invocation
- HTTP 200 from AgentCore
- Bedrock selecting `prepare_sandbox_claim`
- the tool call appearing in sanitized CloudWatch logs
- the exact synthetic request and response saved in the repository

See:

- [Verified AgentCore runtime evidence](docs/evidence/agentcore-runtime-verification.md)
- [Sanitized CloudWatch events](docs/evidence/agentcore-cloudwatch-sanitized.json)
- [Captured invocation](docs/evidence/agentcore-invocation-2026-09-13-retry.json)
- [Local Strands runtime verification](docs/evidence/strands-runtime-verification.md)
- [Local tool-call trace](docs/evidence/strands-agent-execution-trace.json)

The runtime was deleted after verification.

## Safety checks in code

| Failure case | What blocks it |
|---|---|
| Model invents a recall | Recall truth comes from CPSC data or the labeled official snapshot |
| Similar product gets treated as exact | Only deterministic predicates can produce `EXACT_MATCH` |
| Prompt-like text changes product identity | Identity is recomputed by code before contract creation |
| Submission happens without physical evidence | Workflow rejects the transition |
| Provider result closes the wrong case | Confirmation must bind to the same contract |
| Agent declares success by itself | Completion is decided outside the model |
| Duplicate sandbox submission | Idempotency key prevents a second send |
| Invalid browser state is restored | Persisted state is revalidated before hydration |

## Testing

The repository uses **Vitest, Pytest, Playwright, and GitHub Actions**.

The checks cover:

- exact / possible / no-match separation
- official-source restrictions
- dynamic CPSC query windows
- illegal workflow transitions
- missing-evidence rejection
- forged provider-confirmation rejection
- contract binding
- idempotent sandbox submission
- browser state validation
- desktop and mobile flows
- browser console errors
- deterministic stress cases

One stress test runs **1,000 wrong model variants** and verifies that none are upgraded to an exact match.

Run the main checks with:

```powershell
npm run lint
npm run typecheck
npm test
npm run test:agent
npm run build
npm run test:e2e
npm run check:secrets
```

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

Then open:

```text
http://localhost:3000
```

Run the local deterministic agent-service path with:

```powershell
$env:RECALLZERO_DETERMINISTIC_DEMO = "1"
uv run --project services/agent python services/agent/main.py
```

Replay the local Strands tool-boundary trace with:

```powershell
cd services/agent
uv run python run_strands_trace.py
```

For Bedrock / AgentCore setup, see [`services/agent/README.md`](services/agent/README.md). Deterministic demo mode is not presented as proof of a live AgentCore deployment.

## Repository map

| Path | Purpose |
|---|---|
| `app/`, `components/` | Next.js product and demo flow |
| `lib/domain/` | matching, contracts, state transitions, invariants |
| `lib/server/` | official CPSC client |
| `services/agent/` | Strands tools, Bedrock model adapter, AgentCore entrypoint |
| `tests/` | TypeScript unit and stress tests |
| `services/agent/tests/` | Python agent and policy tests |
| `e2e/` | Playwright browser tests |
| `docs/architecture/` | architecture source and exports |
| `docs/evidence/` | Strands and AgentCore proof artifacts |
| `docs/demo/` | demo scripts |
| `docs/submission/` | hackathon submission material |

## Where this can go next

RecallZero currently proves the workflow on one product.

The next steps are:

- opt-in receipt and purchase-history imports
- broader CPSC product-category matching
- signed provider callbacks instead of simulated outcomes
- background recall monitoring
- a durable, scoped AgentCore deployment
- a household safety inbox that only interrupts the user when something they actually own needs action

The same separation between **official facts, deterministic checks, agent work, human proof, and independent completion** could also be useful in warranties, returns, insurance claims, government applications, and compliance paperwork. Those are future directions, not features claimed by the current demo.

## Built with

Strands Agents SDK · Amazon Bedrock · Amazon Bedrock AgentCore · Amazon Nova · Next.js 16 · React 19 · TypeScript · Python · Pydantic · Zod · CPSC API · Vitest · Pytest · Playwright · GitHub Actions · Vercel

## License

[MIT](LICENSE) © 2026 Vivek Yarra.
