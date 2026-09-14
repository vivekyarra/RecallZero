# RecallZero — Devpost submission copy

## Tagline

The Strands agent that finishes product recalls—not just finds them: exact-match the item, handle the remedy, stop for proof, and close only when verified.

## Track

Everyday Agents

## Project details

## The pitch

A recall can be public and still sit dangerous in someone’s home. That gap is the problem RecallZero attacks.

Most recall products stop at **“recall found.”** RecallZero starts there. It answers the questions a real household still has to deal with: **Is my exact item affected? What does the official remedy require? What proof do I need? Was the remedy actually completed?**

RecallZero is an **Everyday Agent** for product-safety busywork. It turns an owned product into a governed Strands workflow that exact-matches the item, creates a remedy contract, stops only for the unavoidable human physical step, submits to a controlled sandbox, and closes the case only when evidence and provider confirmation both match.

**Goal metric:** zero unresolved recalled products.

- **Live demo:** https://recallzero.vercel.app
- **Source:** https://github.com/vivekyarra/RecallZero
- **Demo video:** https://youtu.be/wPlyuN7ENpo
- **Build story:** https://builder.aws.com/content/3AccSg72uPF7h1TswVWutUMZXq1/agents-for-humans-building-recallzero-an-agent-that-finishes-product-recalls

---

## Who it is for

RecallZero is for people who own everyday household products: appliances, electronics, baby gear, tools, chargers, heaters, hair dryers, and anything else that can become dangerous after purchase.

The demo starts with a deliberately narrow case: a synthetic receipt for a Wantefully XR-8801 hair dryer. That narrowness is intentional. Product safety is not a place for vague semantic matching or flashy hallucinated automation. The prototype proves the full loop on one product before scaling the pattern across categories.

---

## What it does

RecallZero takes a product from **owned** to **verified remedy complete**:

1. Imports a clearly labeled synthetic receipt into an **Asset Passport**.
2. Runs an on-demand check against official CPSC recall data.
3. Shows whether the source is the live CPSC API or a clearly labeled official snapshot fallback.
4. Applies four deterministic identity predicates.
5. Allows a **Remedy Contract** only after an exact match.
6. Hands the verified contract to a governed Strands runtime with narrow remedy tools.
7. Stops for the one physical step software cannot do: prepared synthetic proof that the product was disabled.
8. Submits only to a controlled manufacturer sandbox.
9. Waits for a simulated provider outcome.
10. Marks the case remediated only when evidence and provider confirmation both bind to the same contract.

Judge flow:

```text
receipt → Asset Passport → official recall source → exact identity gate
→ Remedy Contract → Strands remedy tools → human evidence gate
→ sandbox submission → provider outcome → verified closure → 0 unresolved
```

No claim goes to a real manufacturer. No real product is damaged.

---

## Why it fits Agents for Humans

This is exactly the kind of repetitive task that quietly drains real attention:

- finding whether a product you already own is affected;
- interpreting official remedy instructions;
- preparing evidence;
- submitting the claim;
- remembering that a submitted claim is not the same thing as a completed remedy;
- following up until the outcome is verified.

RecallZero does not add another app for the user to babysit. The product is built around the background-agent idea: **the system should handle routine progress and surface only when a human decision or physical action is unavoidable.**

---

## How it is built

### Product surface

- Next.js 16, React 19, and TypeScript power the public demo.
- The UI is built as a product, not a chat box: the main metric is unresolved recalled products.
- The browser journey shows the complete remedy lifecycle end to end.

### Official recall layer

- `lib/server/cpsc.ts` calls the official CPSC recall endpoint.
- If the public API is slow or unavailable during judging, the UI labels the fallback as an official bundled snapshot.
- The same deterministic safety logic runs either way.

### Deterministic safety kernel

- Exact match requires model, retailer, purchase-window, and recall-scope predicates.
- A similar product can remain a possible match, but cannot create a Remedy Contract.
- State transitions are controlled in code, not by prompt promises.

### Strands runtime

`services/agent/` contains the real governed agent boundary:

- `strands.Agent`
- `strands.models.BedrockModel`
- `BedrockAgentCoreApp`
- Pydantic contract validation
- five allowlisted tools:
  - `inspect_remedy_contract`
  - `prepare_sandbox_claim`
  - `request_physical_evidence`
  - `submit_sandbox_claim`
  - `check_sandbox_outcome`

The repository includes a committed local Strands SDK tool-call trace. The public browser demo is a deterministic mirror of that governed protocol. Separately, the actual RecallZero Strands agent was deployed temporarily to Amazon Bedrock AgentCore and invoked with a synthetic sandbox Remedy Contract through Amazon Bedrock Nova 2 Lite. AgentCore returned HTTP 200 and CloudWatch recorded the `prepare_sandbox_claim` tool call. The [runtime ARN, timestamp, exact request and response, sanitized logs, and commands](https://github.com/vivekyarra/RecallZero/blob/main/docs/evidence/agentcore-runtime-verification.md) are public. The temporary runtime was deleted after verification, so the browser demo is **not** a live AgentCore frontend and no real manufacturer was contacted.

### Verification

The repo includes Vitest, Pytest, Playwright, and GitHub Actions coverage for:

- exact / possible / no-match separation;
- official-source restrictions;
- legal state transitions;
- missing-evidence blocking;
- forged provider-token rejection;
- contract binding;
- idempotent sandbox submission;
- desktop and mobile browser journeys;
- responsive rendering and browser console errors.

---

## Safety boundary

RecallZero is governed by a simple rule: **authority before autonomy.**

The agent is useful because it can move routine work forward. It is safe because it cannot invent the safety fact, upgrade a fuzzy match, bypass physical evidence, or mark its own work complete.

| Risk | Boundary |
|---|---|
| AI invents a recall | Recall truth comes from CPSC data or a labeled official snapshot |
| AI accepts a similar product | Only deterministic exact-match predicates create a contract |
| AI pretends the physical step happened | Empty evidence blocks submission |
| AI closes its own case | Evidence alone is rejected; provider token alone is rejected |
| Demo contacts a real company | Public flow submits only to RecallZero’s sandbox |
| Demo overclaims cloud execution | The temporary real Bedrock/AgentCore invocation has an auditable record; the public browser journey remains a deterministic mirror and the cloud runtime was deleted |

---

## Challenges

The hard part was not making the agent look powerful. The hard part was deciding where the agent should **not** have power.

A pure LLM demo could have been flashier, but product identity and safety remedies need deterministic truth. RecallZero’s architecture separates the system into official-source retrieval, exact-match gates, immutable contracts, narrow Strands tools, human physical evidence, and independent completion checks.

That design gives the agent real work to do while keeping the dangerous decisions outside the model.

---

## Accomplishments

- Built a complete product experience instead of a technical-only proof of concept.
- Demonstrated the full loop from synthetic ownership to verified remedy closure.
- Implemented a real Strands Agents SDK runtime with a narrow tool boundary.
- Recorded auditable local SDK tool-call evidence.
- Added a live demo, architecture diagram, demo video, README, and build story.
- Hardened the project with unit, policy, stress, browser, mobile, and secret-scan checks.
- Preserved honest demo boundaries while still showing a useful end-to-end agent workflow.

---

## What we learned

The strongest human-facing agents are not the ones with the most authority. They are the ones with the clearest boundaries.

For safety-sensitive routine work, the winning pattern is not “let the model decide everything.” It is:

```text
official source + deterministic contract + narrow tools + human gate + independent verification
```

That pattern can scale beyond recalls to warranties, returns, repairs, insurance paperwork, compliance forms, and other repetitive processes where people need outcomes, not more alerts.

---

## What is next

- Add real opt-in ownership sources: email receipts, retailer exports, purchase history, and warranty cards.
- Extend deterministic matching across more CPSC product categories.
- Add signed provider callbacks instead of simulated sandbox outcomes.
- Run background monitoring so users are notified only when an owned item is affected.
- Build a durable, scoped-identity production Bedrock / AgentCore deployment on the verified temporary invocation.
- Build a household dashboard that prioritizes unresolved safety risk by urgency.

---

## Built for the scorecard

- **Technological Implementation:** real Strands SDK runtime, verified temporary Bedrock/AgentCore invocation and tool call, deterministic kernel, tested tool boundaries.
- **Design:** coherent product surface focused on one outcome: zero unresolved recalls.
- **Potential Impact:** removes a real household burden where missing a step can leave a dangerous product in use.
- **Creativity & Originality:** moves beyond notification into governed remedy completion.
- **Presentation:** live demo, video, architecture diagram, repo, README, build story, and explicit truth boundaries.

## Built with

- Strands Agents SDK
- Amazon Bedrock
- Bedrock AgentCore runtime (temporarily deployed and verified)
- Next.js
- React
- TypeScript
- Python
- Pydantic
- Zod
- CPSC API
- Playwright
- Vitest
- Pytest
- Vercel
- GitHub Actions
