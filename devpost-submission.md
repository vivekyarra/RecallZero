# RecallZero

> Recall alerts are not outcomes. RecallZero is a governed Strands agent that exact-matches what you own, carries the remedy forward, pauses for proof, and closes only when verified.

### From a public recall to a verified remedy — with the human interrupted only when software physically cannot continue.

**Live demo:** https://recallzero.vercel.app  
**Source:** https://github.com/vivekyarra/RecallZero  
**Demo video:** https://youtu.be/wPlyuN7ENpo  
**Build story:** https://builder.aws.com/content/3AccSg72uPF7h1TswVWutUMZXq1/agents-for-humans-building-recallzero-an-agent-that-finishes-product-recalls

> **A recall being published does not make a household safe. The work after the alert is the problem.**

---

## Inspiration

Most recall experiences optimize for **discovery**: a notice exists, a search result appears, an alert is sent.

But a person still has to answer the harder questions:

- Is **my exact product** affected, or just something similar?
- What does the official remedy actually require?
- What proof do I need?
- Has the claim merely been submitted, or is the remedy really complete?
- Who remembers to follow up if the provider has not finished the process?

That gap between **“recall found”** and **“risk actually resolved”** is where RecallZero starts.

RecallZero is an **Everyday Agent** for product-safety busywork. It is designed to run the routine workflow quietly and surface the human only when a real physical action is unavoidable.

The product goal is intentionally simple:

```latex
\[
\boxed{\text{Goal: } \min U_{\text{recalled products}} = 0}
\]
```

---

## What it does

RecallZero takes a product from **owned → checked → exact-matched → remediated → independently verified**.

The judge flow is:

```text
synthetic receipt
→ Asset Passport
→ official CPSC recall source
→ deterministic identity gate
→ immutable Remedy Contract
→ governed Strands tools
→ human physical-evidence gate
→ controlled manufacturer sandbox
→ provider outcome
→ verified closure
→ 0 unresolved recalled products
```

The demo deliberately uses one narrow case: a clearly labeled synthetic receipt for a **Wantefully XR-8801 hair dryer**.

That narrow scope is a feature, not a limitation. Product safety is not a place to use vague semantic similarity and hope the model guessed correctly. RecallZero proves the complete loop on one product before scaling the same governed pattern to more categories.

### The completion invariant

A model response is never enough to close a case.

```latex
\[
\text{REMEDIATED}
\iff
M_{\text{exact}}
\land
E_{\text{physical}}
\land
C_{\text{provider}}(\text{contract\_id})
\]
```

Where:

- `M_exact` = every required identity predicate passed;
- `E_physical` = required human evidence exists;
- `C_provider(contract_id)` = the provider confirmation is valid **and bound to the same Remedy Contract**.

No single LLM output can set `REMEDIATED`.

---

## Why this is an agent — not another chatbot

RecallZero is not a chat interface wrapped around a recall search.

The agent receives an already verified **Remedy Contract** and is allowed to do the repetitive digital work through a deliberately narrow tool surface:

1. `inspect_remedy_contract`
2. `prepare_sandbox_claim`
3. `request_physical_evidence`
4. `submit_sandbox_claim`
5. `check_sandbox_outcome`

The agent can move routine work forward, but it cannot become the authority for the underlying safety fact.

That is the core design rule:

> **Authority before autonomy.**

The human is interrupted only at the step software cannot perform: the physical action required by the official remedy. In the public demo, that step uses prepared synthetic evidence; no real product is damaged.

---

## How we built it

### 1. Product surface

The live product is built with **Next.js 16, React 19, and TypeScript**.

It is designed as a product workflow rather than a generic assistant UI. The most important number on the screen is not “messages sent” or “tasks created.” It is **unresolved recalled products**.

### 2. Official recall layer

`lib/server/cpsc.ts` queries the official US CPSC recall service.

The demo uses a three-tier retrieval strategy:

- direct recall-number query;
- date-window query fallback;
- clearly labeled bundled **official snapshot** if the government endpoint is too slow during judging.

The source mode is visible in the UI. The safety logic does not change when the snapshot fallback is used.

### 3. Deterministic identity kernel

Exact identity is decided by code, not by an LLM.

RecallZero checks four required predicates:

- brand + product family;
- exact model;
- retailer;
- purchase window.

A similar item may become `POSSIBLE_MATCH`, but only all required predicates passing can create `EXACT_MATCH` and unlock a Remedy Contract.

### 4. Immutable Remedy Contract

The contract contains the authoritative recall number, official CPSC URL, hazard, official action, required evidence, completion condition, allowed authority, and exact-match status.

The agent does not get permission to invent or rewrite those facts.

### 5. Real Strands Agents SDK runtime

`services/agent/` contains the actual governed agent boundary:

- `strands.Agent`
- `strands.models.BedrockModel`
- `BedrockAgentCoreApp`
- Pydantic contract validation
- five allowlisted tools
- sandbox-only execution authority

The model is configured through Amazon Bedrock, with the tracked default using **Amazon Nova 2 Lite**.

### 6. Verified Bedrock AgentCore execution

This is not only an architectural stub.

The actual RecallZero Strands agent was temporarily deployed to **Amazon Bedrock AgentCore Runtime** and invoked with a synthetic exact-match Remedy Contract.

The recorded proof includes:

- a real `STRANDS_BEDROCK` invocation;
- **HTTP 200** from AgentCore;
- a Bedrock-driven call to `prepare_sandbox_claim`;
- sanitized CloudWatch evidence of that tool call;
- the exact synthetic request and captured response.

Evidence: https://github.com/vivekyarra/RecallZero/blob/main/docs/evidence/agentcore-runtime-verification.md

The temporary runtime was deleted after verification. The public browser demo is a deterministic mirror of the same governed protocol, **not** a live AgentCore frontend. That boundary is explicit so the demo remains reliable without overstating what is running in production.

### 7. Verification and adversarial tests

The repository includes **Vitest, Pytest, Playwright, and GitHub Actions** coverage for:

- exact / possible / no-match separation;
- official-source restrictions;
- legal workflow transitions;
- missing-evidence blocking;
- forged provider-confirmation rejection;
- contract binding;
- idempotent sandbox submission;
- deterministic stress tests, including 1,000 wrong-model variants;
- desktop and mobile browser journeys;
- responsive rendering and browser-console errors.

---

## The safety architecture

| Risk | Boundary |
|---|---|
| AI invents a recall | Recall truth comes from CPSC data or a labeled official snapshot |
| AI upgrades a similar item | Deterministic predicates decide `EXACT_MATCH` |
| Prompt injection changes product identity | Product identity is recomputed by code before contract creation |
| AI pretends the physical step happened | Missing evidence blocks submission |
| AI marks its own work complete | Evidence alone is insufficient; provider confirmation alone is insufficient |
| A replayed provider result closes the wrong case | Provider outcome must bind to the same contract |
| Demo contacts a real company | Public flow submits only to `MANUFACTURER_SANDBOX` |
| Cloud execution is overstated | Historical AgentCore proof and current browser-demo boundary are labeled separately |

This architecture gives the agent **real work** while keeping dangerous authority outside the model.

---

## A 90-second judge path

1. Import the synthetic receipt and create the Asset Passport.
2. Run the on-demand CPSC check and inspect the source badge.
3. Watch all four deterministic identity predicates pass.
4. Create the Remedy Contract.
5. Start the governed remedy workflow.
6. Hit the human gate: physical evidence is required.
7. Use prepared synthetic evidence.
8. Submit the idempotent request to the controlled sandbox.
9. Receive the contract-bound simulated provider outcome.
10. Verify completion and return the dashboard to **0 unresolved recalls**.

No real manufacturer is contacted. No real product is damaged.

---

## Why it matters

RecallZero changes the unit of success from **notification** to **verified closure**.

That matters because the expensive part for a person is often not learning that a process exists. It is carrying the process through all the boring, easy-to-forget steps until the outcome is actually finished.

The same pattern extends beyond recalls:

```text
verified source
+ deterministic contract
+ narrow agent tools
+ human gate for physical/judgment actions
+ independent completion proof
```

That pattern can apply to warranties, returns, repairs, insurance paperwork, compliance forms, and other everyday workflows where people need **outcomes, not more alerts**.

---

## Creativity & originality

Most recall tools answer:

> “Is there a recall?”

RecallZero asks a different question:

> **“Can an agent safely carry this all the way to a verified resolution?”**

The original idea is not simply adding AI to recall lookup. It is treating product remediation as a **governed state machine** where probabilistic reasoning can help with routine work but cannot own the safety truth or declare its own success.

The product is intentionally not agent-maximal. It is **authority-minimal**.

---

## Challenges we ran into

### Separating intelligence from authority

The hardest architectural decision was deciding what the agent should **not** control.

A pure LLM implementation could have looked more magical, but exact product identity, physical-action evidence, and completion state are too important to leave to prompt compliance. We split the system into deterministic truth, immutable contracts, narrow agent tools, a human gate, and independent verification.

### Making a government-data demo reliable without hiding the fallback

Live public APIs can be slow at exactly the wrong moment. We added an official snapshot fallback, but made the source mode visible so demo reliability does not come at the cost of provenance.

### Proving cloud execution without turning the pitch into an overclaim

The actual agent was deployed and invoked on AgentCore, then the temporary runtime was cleaned up. We kept the proof artifacts and CloudWatch evidence public while clearly separating that historical cloud proof from the deterministic browser demo judges interact with today.

### Defining “done” correctly

A claim being submitted is not the same as a remedy being complete. The workflow therefore refuses to close until evidence and a contract-bound provider result agree.

---

## Accomplishments we're proud of

- Built a complete end-to-end product experience instead of a technical-only proof of concept.
- Implemented a real **Strands Agents SDK** runtime with a narrow tool boundary.
- Captured an auditable local Strands SDK tool trace.
- Deployed and invoked the real agent on **Amazon Bedrock AgentCore Runtime** and preserved the sanitized evidence.
- Built deterministic exact / possible / no-match separation.
- Implemented contract-bound completion rather than trusting agent text.
- Added live CPSC retrieval with a transparent official-snapshot fallback.
- Hardened the project with unit, policy, stress, desktop, mobile, build, lint, type, and secret-scan checks.
- Preserved honest demo boundaries while still showing the complete human outcome loop.

---

## What we learned

The strongest human-facing agents are not the ones with the most authority.

They are the ones with the **clearest authority boundaries**.

For safety-sensitive routine work, the pattern that emerged was:

```latex
\[
\text{trusted source}
+ \text{deterministic contract}
+ \text{narrow agent tools}
+ \text{human gate}
+ \text{independent verification}
\]
```

The agent should be free to do the repetitive work, but it should not be free to redefine the facts that authorize that work.

---

## What's next

- Add opt-in ownership sources such as email receipts, retailer exports, purchase history, and warranty cards.
- Extend deterministic matching across more CPSC product categories.
- Replace simulated provider outcomes with signed provider callbacks.
- Run background monitoring so people are pinged only when an owned product is actually affected.
- Build a durable, scoped-identity AgentCore deployment based on the verified temporary invocation.
- Expand from one product to a household safety dashboard that prioritizes unresolved risk.

---

## Built with

**Strands Agents SDK · Amazon Bedrock · Amazon Bedrock AgentCore · Amazon Nova · Next.js 16 · React 19 · TypeScript · Python · Pydantic · Zod · CPSC API · Vitest · Pytest · Playwright · GitHub Actions · Vercel**

---

### The idea in one sentence

**RecallZero does not stop when it finds the problem. It stops when the remedy is provably finished.**