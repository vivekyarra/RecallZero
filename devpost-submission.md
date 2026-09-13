# RecallZero - Devpost submission copy

## Tagline
A governed Strands agent that finds exact product recalls and carries the remedy to verified resolution, surfacing only unavoidable human physical steps.

## Track
Everyday Agents

## Inspiration
Product recalls create a strange last-mile problem: the safety information may be public, yet the consumer still has to notice it, determine whether the exact unit is affected, interpret the remedy, collect evidence, submit the claim, remember to follow up, and verify the outcome. RecallZero removes that repetitive burden without giving an LLM authority over safety truth.

## What it does
RecallZero's public demo imports a synthetic Asset Passport, checks authoritative CPSC recall data, deterministically classifies exact / possible / no-match cases, and only after an exact match creates a Remedy Contract. The browser journey uses a labeled deterministic mirror of the governed remedy workflow. A separate Python Strands runtime accepts the verified contract and exposes narrow tools; its SDK tool boundary is independently tested. Physical evidence and sandbox provider confirmation are both required before the demo case can be marked remediated.

## How we built it
- Next.js + React + TypeScript product surface.
- Official CPSC REST API with an explicitly labeled official snapshot fallback.
- Deterministic product identity and workflow safety kernel.
- Python Strands Agents SDK runtime with a configured Amazon Bedrock model adapter; only local SDK tool calls have been executed and verified.
- Amazon Bedrock AgentCore-compatible entrypoint.
- Controlled manufacturer sandbox with stable idempotency keys.
- Vitest, Pytest, and Playwright verification on desktop and mobile.

## Safety boundary
The architecture assigns recall truth, exact-match decisions, official instructions, evidence gates, and completion to deterministic code. The model-facing runtime exposes only allowlisted sandbox tools. A model-driven run has not yet been verified.

## Challenges
The central design challenge was separating useful autonomy from authority. A pure agentic design would be easy to demo but unsafe: semantic similarity is not enough for product identity, and a submitted claim is not the same thing as a completed remedy. RecallZero therefore treats deterministic gates and completion predicates as architecture, not prompt suggestions.

## Accomplishments
The public demo completes a governed workflow from synthetic purchase evidence through exact CPSC matching, Remedy Contract creation, the human physical gate, sandbox submission, provider outcome, and deterministic completion verification. The separate Strands SDK runtime has recorded local tool invocations. A Bedrock model invocation and AgentCore deployment have not been verified. The repository also includes production build verification, Python and TypeScript safety tests, browser E2E coverage, an architecture diagram, and a five-minute demo script.

## What we learned
The strongest agent systems do not maximize model authority. They make the model powerful inside a narrow verified envelope, keep authoritative facts outside the model, and make important state transitions independently verifiable.

## What's next
Connect real opt-in receipt sources, broaden deterministic matching across more CPSC product categories, add secure provider adapters, deploy the Strands runtime to AgentCore when AWS credentials are available, and add long-running background monitoring with notifications only when a real decision is required.

## Links
- Source: https://github.com/vivekyarra/RecallZero
- Live demo: https://recallzero.vercel.app
- Demo video: add public YouTube/Vimeo URL before final submission
- Builder.aws bonus post: https://builder.aws.com/content/3AccSg72uPF7h1TswVWutUMZXq1/agents-for-humans-building-recallzero-an-agent-that-finishes-product-recalls

## Required Devpost answers still supplied outside the repository
- Submitter type
- Country of residence
- AWS Builder ID
- Public demo video URL
- Architecture file upload (PNG or PDF)
