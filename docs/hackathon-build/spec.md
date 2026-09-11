# Technical Spec

## Overview

RecallZero is a fresh monorepo with a Next.js product surface and a Python Strands/AgentCore service. The web app owns the deterministic domain model and judge demo state. The agent service receives a verified Remedy Contract, uses Strands to select allowlisted tools, and can run locally or as an AgentCore Runtime entrypoint. A deterministic demo adapter mirrors the same tool protocol when cloud/model credentials are unavailable and labels that mode honestly.

## Stack

- Web: Next.js App Router, TypeScript, React, CSS Modules/global tokens, Zod.
- Agent: Python 3.11+, `strands-agents`, `bedrock-agentcore`, Pydantic, FastAPI/Uvicorn for local development.
- Tests: Vitest for domain/API behavior, Pytest for safety and tool-policy behavior, Playwright/browser verification for the judge path.
- Data: browser localStorage for the public demo; DynamoDB/S3 interfaces documented for production evolution.
- Deployment: Vercel for the public web demo; Amazon Bedrock AgentCore Runtime for the Strands service when AWS credentials are available.

## Architecture

### Web experience

Implements: `prd.md > Epic 1`, `Epic 4`, `Epic 5`, `Epic 6`.

The dashboard is a state-driven product surface, not chat. Server routes proxy CPSC with a bounded timeout and official snapshot fallback. Client state is persisted locally for a zero-login demo.

### Deterministic safety kernel

Implements: `prd.md > Epic 2`, `Epic 3`, `Epic 5`.

Pure functions normalize records, evaluate required predicates, create Remedy Contracts, validate legal state transitions, create stable idempotency keys, and enforce completion invariants. LLM output can propose actions but cannot mutate state without this kernel.

### Strands remedy runtime

Implements: `prd.md > Epic 3`, `Epic 4`.

A single governed Strands agent receives only a confirmed contract and has narrow tools: inspect contract, prepare sandbox claim, request physical evidence, submit sandbox claim, and check sandbox outcome. The system prompt forbids inventing recalls/instructions, bypassing gates, real-manufacturer contact, and self-declaring completion.

### Manufacturer remedy sandbox

Implements: `prd.md > Epic 3`, `Epic 5`.

The sandbox uses the same contract/tool payloads as a future browser/API adapter. It returns deterministic receipts and requires a stable idempotency key. It never sends email or external claims.

## File Structure

```text
app/                         Next.js pages and API routes
components/                  Calm product UI and demo workflow views
lib/domain/                  Types, match policy, state machine, fixtures
lib/server/                  CPSC client and sandbox execution adapter
services/agent/              Python Strands + AgentCore runtime
services/manufacturer-sandbox/ Optional standalone sandbox documentation
tests/                       TypeScript domain and route tests
services/agent/tests/        Python safety/tool tests
public/evidence/             Synthetic demo evidence only
docs/architecture/           Required architecture diagram sources/exports
docs/demo/                   Exact recording script and shot list
docs/hackathon-build/        Scope, PRD, spec, checklist, journal
```

## Data Flow

1. Receipt fixture -> normalized `AssetPassport`.
2. `/api/recalls/check` -> official CPSC JSON -> normalized `RecallRecord` or labeled snapshot.
3. `matchAssetToRecall` -> `MatchDecision` plus predicate evidence.
4. Exact match -> immutable `RemedyContract`.
5. Contract -> Strands `/invocations` -> allowlisted sandbox tool calls -> action receipts.
6. Required physical action -> `NEEDS_HUMAN` -> validated synthetic upload metadata.
7. Sandbox approval + evidence -> completion verifier -> `REMEDIATED`.
8. Every transition -> append-only timeline event -> dashboard counts.

## Components And Responsibilities

### Asset ingestion

Implements: `prd.md > Epic 1`.

Parses only the controlled demo receipt and manual fields; rejects missing identity. A production connector is explicitly out of scope.

### CPSC client

Implements: `prd.md > Epic 2`.

Calls `https://www.saferproducts.gov/RestWebServices/Recall?format=json`, sets a timeout, validates minimum fields, filters to relevant dates/products, and returns provenance.

### Match policy

Implements: `prd.md > Epic 2`.

Requires model equality plus product/manufacturer signal and purchase-window eligibility. It records each predicate and never accepts semantic similarity as exact evidence.

### Workflow reducer

Implements: `prd.md > Epic 3`, `Epic 4`, `Epic 5`.

Accepts named commands only when preconditions hold, appends timestamped events, and calculates household counts from state.

### Agent adapter

Implements: `prd.md > Epic 3`.

Uses remote AgentCore when configured, local Strands when configured, or an explicitly labeled deterministic adapter for public demo resilience. All modes produce the same auditable action schema.

## External APIs And Dependencies

- [CPSC Recall API](https://www.cpsc.gov/Recalls/CPSC-Recalls-Application-Program-Interface-API-Information)
- [Strands Agents Python quickstart](https://strandsagents.com/docs/user-guide/quickstart/python/)
- [Strands tools](https://strandsagents.com/docs/user-guide/concepts/tools/)
- [AgentCore direct Python deployment](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-get-started-code-deploy-python.html)
- No real manufacturer endpoint is called.

## AI Usage

Strands interprets the already-authoritative Remedy Contract and sequences narrow tools. Deterministic code owns recall truth, exact matching, permissible transitions, idempotency, and completion. This creates a meaningful agentic loop without delegating safety facts to a model.

## Risks And Verification

- CPSC drift/outage: snapshot fallback test plus visible provenance.
- False-positive recall: match-table unit tests, including missing-model and purchase-window negatives.
- Unsafe action: transition/property tests and tool precondition tests.
- Fake production claim: persistent sandbox labels and no external manufacturer hostnames in execution code.
- Demo state loss: local persistence plus one-click reset.
- Cloud credentials unavailable: do not claim AgentCore deployment; retain deployable artifact and verified local Strands runtime.
- Visual regressions: browser test at desktop and mobile widths, console-error check, and screenshots.

## Demo And Submission Flow

The hero starts with `18 protected / 0 unresolved`. The judge imports the synthetic XR-8801 receipt, runs a live official check, opens match evidence and the Remedy Contract, watches tool execution, supplies synthetic photo evidence, advances approval, and returns to zero unresolved. The architecture view closes on the authority hierarchy and AgentCore deployment proof.

